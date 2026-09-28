import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// PATCH /api/admin/events/[id] - Update event details
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
    const { title, date, location, category, description, time } = body;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title.trim();
    if (location) updateData.location = location.trim();
    if (category) updateData.category = category.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (date) updateData.eventDate = new Date(date);

    const updated = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    const d = new Date(updated.eventDate);
    const dateStr = d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return NextResponse.json({
      success: true,
      event: {
        id: updated.id,
        title: updated.title,
        date: dateStr,
        rawDate: updated.eventDate.toISOString().slice(0, 10),
        time: time || '09:00 AM - 12:00 PM',
        location: updated.location,
        category: updated.category,
        desc: updated.description,
      },
      message: 'Event updated successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/events/[id] - Remove event
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
    await prisma.event.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Event removed successfully!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
