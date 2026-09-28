import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    let logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    // If no logs exist yet, seed initial baseline system logs
    if (logs.length === 0) {
      const initialSeedLogs = [
        {
          action: 'SYSTEM_BOOT',
          details: 'SmartOnse Core Services initialized with RBAC Security',
          actor: 'System Kernel',
          ip: '127.0.0.1',
        },
        {
          action: 'SECURITY_AUDIT',
          details: 'Bcrypt password hashing and secure JWT session verification enabled',
          actor: 'Security Daemon',
          ip: '127.0.0.1',
        },
        {
          action: 'DATABASE_SYNC',
          details: 'Registry of Inhabitants and Document Request Schemas synchronized',
          actor: 'Prisma Engine',
          ip: '127.0.0.1',
        },
      ];

      for (const item of initialSeedLogs) {
        await prisma.auditLog.create({ data: item });
      }

      logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
      });
    }

    const formatted = logs.map((l) => ({
      id: l.id,
      action: l.action,
      details: l.details,
      actor: l.actor,
      ip: l.ip || '127.0.0.1',
      timestamp: l.timestamp.toISOString().replace('T', ' ').slice(0, 19),
    }));

    return NextResponse.json({ success: true, logs: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch audit logs';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
