import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// PATCH /api/admin/services/[id] - Update service / document rate
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
    const { name, category, fee, turnaround, requirements, description, status } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.title = name.trim();
    if (category) updateData.category = category.trim();
    if (fee !== undefined) updateData.fee = fee.trim();
    if (turnaround) updateData.processingTime = turnaround.trim();
    if (requirements) updateData.requirements = requirements.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (status) updateData.isActive = status === 'ACTIVE';

    const updated = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      service: {
        id: updated.id,
        name: updated.title,
        category: updated.category,
        fee: updated.fee,
        turnaround: updated.processingTime,
        requirements: updated.requirements,
        status: updated.isActive ? 'ACTIVE' : 'INACTIVE',
        description: updated.description,
      },
      message: 'Service updated successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update service';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/services/[id] - Remove service
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
    await prisma.service.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Service removed successfully!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete service';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
