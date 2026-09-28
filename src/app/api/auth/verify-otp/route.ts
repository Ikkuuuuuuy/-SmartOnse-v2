import { NextResponse } from 'next/server';
import { otpStore, cleanExpiredOtps } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Mobile number and 6-digit OTP code are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const cleanOtp = String(otp).trim();

    cleanExpiredOtps();

    const record = otpStore.get(cleanPhone);

    if (!record) {
      return NextResponse.json(
        { error: 'No active OTP request found for this number. Please request a new code.' },
        { status: 404 }
      );
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(cleanPhone);
      return NextResponse.json(
        { error: 'OTP code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    record.attempts += 1;
    if (record.attempts > 5) {
      otpStore.delete(cleanPhone);
      return NextResponse.json(
        { error: 'Too many incorrect attempts. Please request a new code.' },
        { status: 429 }
      );
    }

    if (record.code !== cleanOtp) {
      return NextResponse.json(
        { error: 'Incorrect 6-digit code. Please verify and try again.' },
        { status: 400 }
      );
    }

    // Mark as verified
    record.verified = true;
    otpStore.set(cleanPhone, record);

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Mobile phone number verified successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify OTP code.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
