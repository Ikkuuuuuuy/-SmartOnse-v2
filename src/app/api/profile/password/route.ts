import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, comparePassword, hashPassword } from '@/lib/auth';

// PATCH /api/profile/password - Authenticated citizen password change
export async function PATCH(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // Verify current password
    const isCurrentMatch = await comparePassword(currentPassword, user.password);
    if (!isCurrentMatch) {
      return NextResponse.json(
        { error: 'Incorrect current password. Please try again.' },
        { status: 400 }
      );
    }

    // Hash new password and save
    const newHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newHash },
    });

    // Write security audit log
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        actor: `${user.name} (${user.email})`,
        details: 'Citizen updated account password via Security Profile tab.',
        ip,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update password';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

