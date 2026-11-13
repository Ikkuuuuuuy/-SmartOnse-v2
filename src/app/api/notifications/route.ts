import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';
import { formatRelativePhTimestamp, createNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

function buildNotificationWhere(sessionUser: { id: string; role: string }) {
  const roleLower = sessionUser.role.toLowerCase();
  if (isAdminUser(sessionUser.role)) {
    return {
      OR: [
        { targetUserId: sessionUser.id },
        { targetRole: { in: ['all', 'admin', 'staff', roleLower] } },
      ],
    };
  }
  return {
    OR: [
      { targetUserId: sessionUser.id },
      { targetUserId: null, targetRole: { in: ['all', 'resident'] } },
    ],
  };
}

// GET /api/notifications - Fetch real-time notifications for the logged-in user
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const where = buildNotificationWhere(sessionUser);
    const items = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const formatted = items.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      timestamp: formatRelativePhTimestamp(n.createdAt),
      createdAt: n.createdAt.toISOString(),
      type: n.type,
      targetRole: n.targetRole,
      targetUserId: n.targetUserId,
      href: n.href || undefined,
      read: n.read,
    }));

    return NextResponse.json({
      notifications: formatted,
      unreadCount: formatted.filter((n) => !n.read).length,
    });
  } catch (err) {
    console.error('[GET /api/notifications Error]:', err);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

// POST /api/notifications - Create a notification (for authenticated actions)
export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, type, targetRole, targetUserId, href } = body;
    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const created = await createNotification({
      title,
      description,
      type: type || 'system',
      targetRole: targetRole || (isAdminUser(sessionUser.role) ? 'admin' : 'resident'),
      targetUserId: targetUserId ?? sessionUser.id,
      href,
    });

    return NextResponse.json({ success: true, notification: created });
  } catch (err) {
    console.error('[POST /api/notifications Error]:', err);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PATCH /api/notifications - Mark one or all notifications as read
export async function PATCH(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, markAll } = body;
    const scopeWhere = buildNotificationWhere(sessionUser);

    if (markAll) {
      await prisma.notification.updateMany({
        where: { AND: [scopeWhere, { read: false }] },
        data: { read: true },
      });
    } else if (id) {
      await prisma.notification.updateMany({
        where: { AND: [scopeWhere, { id }] },
        data: { read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[PATCH /api/notifications Error]:', err);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}

// DELETE /api/notifications - Delete one or clear all notifications in user scope
export async function DELETE(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clearAll = searchParams.get('clearAll') === 'true';
    const scopeWhere = buildNotificationWhere(sessionUser);

    if (clearAll) {
      await prisma.notification.deleteMany({ where: scopeWhere });
    } else if (id) {
      await prisma.notification.deleteMany({
        where: { AND: [scopeWhere, { id }] },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/notifications Error]:', err);
    return NextResponse.json({ error: 'Failed to delete notification' }, { status: 500 });
  }
}
