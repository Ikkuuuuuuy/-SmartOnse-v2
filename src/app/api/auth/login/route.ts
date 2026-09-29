import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeRole } from '@/lib/rbac';
import { comparePassword, createSessionToken, hashPassword, SESSION_COOKIE_NAME } from '@/lib/auth';

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

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
