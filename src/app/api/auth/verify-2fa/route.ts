import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeRole } from '@/lib/rbac';
import { createSessionToken, verifyMfaToken, createTrustedDeviceToken, SESSION_COOKIE_NAME, DEVICE_COOKIE_NAME } from '@/lib/auth';
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

    // Limit 2FA verification attempts: Max 5 per minute per IP to prevent OTP brute forcing
    const rateLimit = checkRateLimit(`verify-2fa:${ip}`, { limit: 5, windowMs: 60 * 1000 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please wait 1 minute before trying again.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { mfaToken, otp } = body;

    if (!mfaToken || !otp || typeof otp !== 'string') {
      return NextResponse.json(
        { error: 'Valid verification code and token are required.' },
        { status: 400 }
      );
    }

    const payload = await verifyMfaToken(mfaToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Verification session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    // Verify OTP and Expiration
    const cleanOtp = otp.trim();
    if (!user.mfaOtp || user.mfaOtp !== cleanOtp) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
      await prisma.auditLog.create({
        data: {
          action: 'MFA_FAILED',
          actor: `${user.name} (${user.email})`,
          details: 'Failed 2FA attempt: incorrect verification code.',
          ip,
        },
      });

      return NextResponse.json(
        { error: 'Incorrect 6-digit verification code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    if (!user.mfaOtpExpiry || new Date() > new Date(user.mfaOtpExpiry)) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Clear used OTP
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaOtp: null, mfaOtpExpiry: null },
    });

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

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Authorize and trust this device for 60 days
    const deviceToken = await createTrustedDeviceToken(user.id);
    response.cookies.set(DEVICE_COOKIE_NAME, deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 60, // 60 days
    });

    await prisma.auditLog.create({
      data: {
        action: 'USER_LOGIN_MFA_SUCCESS',
        actor: `${user.name} (${user.email})`,
        details: `Two-factor authentication verified successfully for role "${roleTitle}".`,
        ip,
      },
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred during MFA verification.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

