import { NextResponse } from 'next/server';
import { otpStore, cleanExpiredOtps } from '@/lib/otpStore';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Mobile number is required.' }, { status: 400 });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');

    // Validate Philippine mobile phone format
    const isValidPhMobile = /^(09|\+639|639)\d{9}$/.test(cleanPhone);
    if (!isValidPhMobile) {
      return NextResponse.json(
        { error: 'Please enter a valid Philippine mobile number (e.g. 0917-123-4567).' },
        { status: 400 }
      );
    }

    cleanExpiredOtps();

    // Generate secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(cleanPhone, {
      code,
      expiresAt,
      attempts: 0,
      verified: false,
    });

    console.log(`[SmartOnse SMS OTP] Sent to ${cleanPhone}: Code is ${code} (Expires in 5m)`);

    return NextResponse.json({
      success: true,
      message: `Verification code generated for ${cleanPhone}.`,
      simulatedOtp: code, // Delivered via native in-app SMS alert modal/toast
      expiresInSeconds: 300,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send verification code.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
