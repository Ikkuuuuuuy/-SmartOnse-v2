import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { verifyMfaToken } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { mfaToken } = body;

    if (!mfaToken) {
      return NextResponse.json(
        { error: 'MFA token is required.' },
        { status: 400 }
      );
    }

    const payload = await verifyMfaToken(mfaToken);
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Session expired. Please log in again.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

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
      purpose: 'Resend Two-Factor Authentication Code',
    });

    return NextResponse.json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched to your email.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to resend verification code.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

