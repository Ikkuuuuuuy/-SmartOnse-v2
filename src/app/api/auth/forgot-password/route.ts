import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Always respond with success to prevent user enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.',
      });
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: cleanEmail },
    });

    // Generate cryptographically secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        email: cleanEmail,
        expiresAt,
      },
    });

    const host = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const resetUrl = `${host}/reset-password?token=${token}`;

    await sendPasswordResetEmail({
      to: cleanEmail,
      resetUrl,
      recipientName: user.name,
    });

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process password reset request.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
