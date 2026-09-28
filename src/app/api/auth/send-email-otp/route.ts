import { NextResponse } from 'next/server';
import { otpStore, cleanExpiredOtps } from '@/lib/otpStore';
import { sendEmailOtp } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    cleanExpiredOtps();

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const storeKey = `email:${cleanEmail}`;
    otpStore.set(storeKey, {
      code,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    const emailResult = await sendEmailOtp({
      to: cleanEmail,
      code,
      recipientName: name,
    });

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}.`,
      realSent: emailResult.realSent,
      simulatedOtp: emailResult.simulatedOtp || undefined,
      expiresInSeconds: 300,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email verification code.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
