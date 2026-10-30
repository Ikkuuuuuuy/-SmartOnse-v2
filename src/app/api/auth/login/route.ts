import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { normalizeRole } from '@/lib/rbac';
import { comparePassword, createSessionToken, createMfaToken, hashPassword, SESSION_COOKIE_NAME } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const ROLE_DESTINATIONS: Record<string, string> = {
  super_admin: '/admin',
  barangay_captain: '/admin',
  barangay_councilor: '/admin/services',
  sk_chairperson: '/sk-programs',
  sk_councilor: '/sk-programs',
  staff: '/admin/requests',
  resident: '/portal/request',
};

const ROLE_TITLES: Record<string, string> = {
  super_admin: 'Super Admin',
  barangay_captain: 'Barangay Captain',
  barangay_councilor: 'Barangay Kagawad',
  sk_chairperson: 'SK Chairperson',
  sk_councilor: 'SK Kagawad',
  staff: 'Desk Staff',
  resident: 'Resident Citizen',
};

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);

    // Apply Rate Limiting: Max 5 attempts per 60 seconds per IP
    const rateLimit = checkRateLimit(`login:${ip}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN_RATE_LIMITED',
          actor: 'Unknown / Suspicious IP',
          details: `Excessive login attempts blocked by rate limiter.`,
          ip,
        },
      });

      return NextResponse.json(
        { error: 'Too many login attempts. Please wait 1 minute before trying again.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Valid email and password strings are required.' },
        { status: 400 }
      );
    }

    if (email.length > 255 || password.length > 255) {
      return NextResponse.json(
        { error: 'Input exceeds maximum allowed length.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
      await prisma.auditLog.create({
        data: {
          action: 'LOGIN_FAILED',
          actor: cleanEmail,
          details: 'Failed login attempt: incorrect password.',
          ip,
        },
      });

      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Auto-upgrade legacy plaintext password to secure bcrypt hash if needed
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      const newHash = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
    }

    // Block unverified residents
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error: 'Your account is pending barangay verification. Please wait for staff approval before logging in.',
          code: 'UNVERIFIED',
        },
        { status: 403 }
      );
    }

    // Handle Two-Factor Authentication (MFA / 2FA via Email OTP)
    if (user.mfaEnabled) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const mfaOtpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await prisma.user.update({
        where: { id: user.id },
        data: { mfaOtp: otp, mfaOtpExpiry },
      });

      await sendOtpEmail({
        to: user.email,
        name: user.name,
        otp,
        purpose: 'Two-Factor Authentication Login',
      });

      const mfaToken = await createMfaToken(user.id, user.email);

      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
      await prisma.auditLog.create({
        data: {
          action: 'MFA_CHALLENGE_ISSUED',
          actor: `${user.name} (${user.email})`,
          details: `2FA verification code dispatched to email address.`,
          ip,
        },
      });

      return NextResponse.json({
        success: true,
        mfaRequired: true,
        mfaToken,
        email: user.email,
        message: 'A 6-digit verification code has been sent to your registered email address.',
      });
    }

    const role = normalizeRole(user.role);
    const destination = ROLE_DESTINATIONS[role] || '/portal/request';
    const roleTitle = ROLE_TITLES[role] || 'Citizen';

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      roleTitle,
      destination,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        ...sessionPayload,
        avatarUrl: user.avatarUrl || null,
        phone: user.phone || null,
        address: user.address || null,
      },
    });

    // Set secure httpOnly cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Write real Audit Log for successful authentication
    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGIN',
        actor: `${user.name} (${user.email})`,
        details: `Citizen signed in successfully with role "${roleTitle}".`,
        ip,
      },
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
