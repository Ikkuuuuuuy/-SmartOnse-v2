import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { mfaEnabled: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      mfaEnabled: Boolean(user.mfaEnabled),
      email: user.email,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch 2FA status.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, otp } = body;

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Step 1: Request 2FA Activation (send test OTP)
    if (action === 'REQUEST_ENABLE') {
      const newOtp = crypto.randomInt(100000, 999999).toString();
      const mfaOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: { mfaOtp: newOtp, mfaOtpExpiry },
      });

      await sendOtpEmail({
        to: user.email,
        name: user.name,
        otp: newOtp,
        purpose: 'Activate Two-Factor Authentication',
      });

      return NextResponse.json({
        success: true,
        message: 'A 6-digit confirmation code was sent to your email to verify activation.',
      });
    }

    // Step 2: Confirm 2FA Activation with OTP
    if (action === 'CONFIRM_ENABLE') {
      if (!otp || typeof otp !== 'string') {
        return NextResponse.json({ error: 'Please enter the 6-digit verification code.' }, { status: 400 });
      }

      if (!user.mfaOtp || user.mfaOtp !== otp.trim()) {
        return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
      }

      if (!user.mfaOtpExpiry || new Date() > new Date(user.mfaOtpExpiry)) {
        return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: true,
          mfaOtp: null,
          mfaOtpExpiry: null,
        },
      });

      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
      await prisma.auditLog.create({
        data: {
          action: '2FA_ENABLED',
          actor: `${user.name} (${user.email})`,
          details: 'User enabled Two-Factor Authentication (Email OTP) on their account.',
          ip,
        },
      });

      return NextResponse.json({
        success: true,
        mfaEnabled: true,
        message: 'Two-Factor Authentication is now enabled on your account.',
      });
    }

    // Step 3: Disable 2FA
    if (action === 'DISABLE') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          mfaEnabled: false,
          mfaOtp: null,
          mfaOtpExpiry: null,
        },
      });

      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
      await prisma.auditLog.create({
        data: {
          action: '2FA_DISABLED',
          actor: `${user.name} (${user.email})`,
          details: 'User disabled Two-Factor Authentication on their account.',
          ip,
        },
      });

      return NextResponse.json({
        success: true,
        mfaEnabled: false,
        message: 'Two-Factor Authentication has been disabled.',
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update 2FA settings.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

