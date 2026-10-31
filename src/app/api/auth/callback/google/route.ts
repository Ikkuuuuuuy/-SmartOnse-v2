import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { normalizeRole } from '@/lib/rbac';
import { createSessionToken, createMfaToken, createTrustedDeviceToken, SESSION_COOKIE_NAME, DEVICE_COOKIE_NAME } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'smartonse.vercel.app';
  const proto = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

  if (error || !code) {
    return NextResponse.redirect(new URL('/login?error=Google+authentication+cancelled', appUrl));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=Google+OAuth+credentials+not+configured', appUrl));
  }

  try {
    // 1. Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(new URL('/login?error=Failed+to+exchange+Google+authorization+code', appUrl));
    }

    // 2. Fetch User Profile from Google
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userinfoRes.json();
    if (!googleUser || !googleUser.email) {
      return NextResponse.redirect(new URL('/login?error=Unable+to+retrieve+email+from+Google', appUrl));
    }

    const cleanEmail = googleUser.email.trim().toLowerCase();

    // 3. Find existing resident or official in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // STRICT GOVERNANCE RULE:
    // Residents cannot register with Gmail alone; they MUST have registered through official Barangay onboarding.
    if (!user) {
      return NextResponse.redirect(
        new URL(
          '/login?error=NO_REGISTERED_ACCOUNT&email=' + encodeURIComponent(cleanEmail),
          appUrl
        )
      );
    }

    // Block unverified residents
    if (!user.isVerified) {
      return NextResponse.redirect(new URL('/login?error=UNVERIFIED_ACCOUNT', appUrl));
    }

    // Link Google ID if not yet recorded
    if (!user.googleId && googleUser.sub) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          avatarUrl: user.avatarUrl || googleUser.picture || null,
        },
      });
    }

    // 4. Check if 2FA is enabled for this user
    if (user.mfaEnabled) {
      const otp = crypto.randomInt(100000, 999999).toString();
      const mfaOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { mfaOtp: otp, mfaOtpExpiry },
      });

      await sendOtpEmail({
        to: user.email,
        name: user.name,
        otp,
        purpose: 'Google Sign-In Two-Factor Authentication',
      });

      const mfaToken = await createMfaToken(user.id, user.email);

      // Redirect to login page with MFA challenge mode active
      return NextResponse.redirect(
        new URL(`/login?mfa=true&token=${encodeURIComponent(mfaToken)}&email=${encodeURIComponent(user.email)}`, appUrl)
      );
    }

    // 5. Issue Session Token
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

    const redirectResponse = NextResponse.redirect(new URL(destination, appUrl));
    redirectResponse.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    // Authorize and trust this device for 60 days
    const deviceToken = await createTrustedDeviceToken(user.id);
    redirectResponse.cookies.set(DEVICE_COOKIE_NAME, deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 60,
    });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        action: 'GOOGLE_LOGIN_SUCCESS',
        actor: `${user.name} (${user.email})`,
        details: `Citizen signed in via Google OAuth with role "${roleTitle}".`,
        ip,
      },
    });

    return redirectResponse;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Google authentication failed';
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, appUrl));
  }
}

