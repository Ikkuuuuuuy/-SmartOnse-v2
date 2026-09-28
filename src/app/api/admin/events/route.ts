import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// GET /api/admin/events - List all community events
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
    });

    const formatted = events.map((evt) => {
      const d = new Date(evt.eventDate);
      const isPast = d.getTime() < Date.now();
      const dateStr = d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      const timeStr = d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        id: evt.id,
        title: evt.title,
        date: dateStr,
        rawDate: evt.eventDate.toISOString().slice(0, 10),
        time: timeStr || '09:00 AM - 04:00 PM',
        location: evt.location,
        category: evt.category || 'General Assembly',
        attendees: '150+ Expected',
        status: isPast ? 'COMPLETED' : 'SCHEDULED',
        desc: evt.description,
        imageUrl: evt.imageUrl,
        isFeatured: evt.isFeatured,
      };
    });

    return NextResponse.json({ success: true, events: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/events - Create new event
export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, date, time, location, category, description } = body;

    if (!title || !location) {
      return NextResponse.json(
        { error: 'Title and location are required.' },
        { status: 400 }
      );
    }

    const eventDate = date ? new Date(date) : new Date();

    const newEvt = await prisma.event.create({
      data: {
        title: title.trim(),
        category: category || 'Community Activity',
        description: description ? description.trim() : `Community program: ${title.trim()}`,
        location: location.trim(),
        eventDate,
        imageUrl: '/images/barangay-onse-seal.png',
        isFeatured: false,
      },
    });

    const d = new Date(newEvt.eventDate);
    const dateStr = d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    return NextResponse.json({
      success: true,
      event: {
        id: newEvt.id,
        title: newEvt.title,
        date: dateStr,
        rawDate: newEvt.eventDate.toISOString().slice(0, 10),
        time: time || '09:00 AM - 12:00 PM',
        location: newEvt.location,
        category: newEvt.category,
        attendees: '0 Registered',
        status: 'SCHEDULED',
        desc: newEvt.description,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
