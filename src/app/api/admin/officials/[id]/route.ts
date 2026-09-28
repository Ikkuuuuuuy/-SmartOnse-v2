import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// PATCH /api/admin/officials/[id] - Update official details
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
    const { name, position, committee, contact, term, avatarUrl } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name.trim();
    if (position) updateData.position = position.trim();
    if (committee !== undefined) updateData.committee = committee.trim();
    if (contact !== undefined) {
      const trimmed = contact.trim();
      const digits = trimmed.replace(/\D/g, '');
      if (/[a-zA-Z]/.test(trimmed) || (trimmed && digits.length < 7)) {
        return NextResponse.json(
          { error: 'Contact number must be a valid numeric phone number (e.g., 0917-888-0000). Letters are not allowed.' },
          { status: 400 }
        );
      }
      updateData.contact = trimmed;
    }
    if (term !== undefined) updateData.term = term.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim() || '/images/barangay-onse-seal.png';

    const updated = await prisma.barangayOfficial.update({
      where: { id },
      data: updateData,
    });

    const isSK = updated.position.toLowerCase().includes('sk') || (updated.committee && updated.committee.toLowerCase().includes('youth'));

    return NextResponse.json({
      success: true,
      official: {
        id: updated.id,
        name: updated.name,
        position: updated.position,
        category: isSK ? 'sk' : 'barangay',
        committee: updated.committee,
        term: updated.term,
        contact: updated.contact,
        email: `${updated.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}@onse.gov.ph`,
        status: 'ACTIVE',
        avatar: updated.avatarUrl || '/images/barangay-onse-seal.png',
      },
      message: 'Official profile updated successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update official';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/officials/[id] - Remove official
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
    await prisma.barangayOfficial.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Official profile removed successfully!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete official';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
