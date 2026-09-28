import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// PATCH /api/admin/users/[id] - Update user account details (role, status, info)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { name, email, role, status, phone, address } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (role) updateData.role = role.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (status !== undefined) {
      updateData.isVerified = status === 'ACTIVE';
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const roleBadge = updated.role.includes('admin') || updated.role.includes('captain')
      ? 'bg-purple-100 text-purple-900'
      : updated.role.includes('councilor') || updated.role.includes('sk')
      ? 'bg-blue-100 text-blue-900'
      : updated.role === 'staff'
      ? 'bg-amber-100 text-amber-900'
      : 'bg-emerald-100 text-emerald-900';

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        roleBadge,
        status: updated.isVerified ? 'ACTIVE' : 'INACTIVE',
        lastLogin: 'Recent',
        createdAt: updated.createdAt.toISOString().slice(0, 16).replace('T', ' '),
      },
      message: 'User account updated successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update user account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Remove system user account
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Prevent deleting self
    if (sessionUser.id === id) {
      return NextResponse.json(
        { error: 'You cannot delete your own logged-in administrator account.' },
        { status: 400 }
      );
    }

    // Delete linked inhabitant if exists or unlink
    await prisma.barangayInhabitant.updateMany({
      where: { userId: id },
      data: { userId: null },
    });

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'User account removed successfully!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete user account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
