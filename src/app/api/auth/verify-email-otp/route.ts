import { NextResponse } from 'next/server';
import { otpStore, cleanExpiredOtps } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email address and 6-digit OTP code are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();

    cleanExpiredOtps();

    const storeKey = `email:${cleanEmail}`;
    const record = otpStore.get(storeKey);

    if (!record) {
      return NextResponse.json(
        { error: 'No active verification code found for this email. Please request a new code.' },
        { status: 404 }
      );
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(storeKey);
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      otpStore.delete(storeKey);
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    if (record.code !== cleanOtp) {
      return NextResponse.json(
        { error: 'Incorrect 6-digit code. Please check your email and try again.' },
        { status: 400 }
      );
    }

    record.verified = true;
    otpStore.set(storeKey, record);

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Email address verified successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify email code.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
