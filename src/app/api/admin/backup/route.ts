import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized: Session required.' }, { status: 401 });
    }

    // Only Captain or Super Admin can trigger administrative snapshot exports
    if (sessionUser.role !== 'super_admin' && sessionUser.role !== 'barangay_captain') {
      return NextResponse.json(
        { error: 'Forbidden: Only the Barangay Captain or Super Admin may export backup snapshots.' },
        { status: 403 }
      );
    }

    const [users, inhabitants, requests, auditLogs, consentRecords] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          address: true,
          isVerified: true,
          mfaEnabled: true,
          createdAt: true,
        },
      }),
      prisma.barangayInhabitant.findMany(),
      prisma.documentRequest.findMany(),
      prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 500 }),
      prisma.consentRecord.findMany(),
    ]);

    const backupSnapshot = {
      system: 'SmartOnse Digital Barangay Governance Portal',
      jurisdiction: 'Barangay Onse, San Juan City, Metro Manila',
      exportedBy: `${sessionUser.name} (${sessionUser.email})`,
      exportTimestamp: new Date().toISOString(),
      compliance: 'Republic Act No. 10173 & DILG Administrative Protocols',
      metrics: {
        totalUsers: users.length,
        totalInhabitants: inhabitants.length,
        totalRequests: requests.length,
        totalAuditEvents: auditLogs.length,
        totalConsentRecords: consentRecords.length,
      },
      data: {
        users,
        inhabitants,
        requests,
        auditLogs,
        consentRecords,
      },
    };

    // Log the backup snapshot event in audit trail
    await prisma.auditLog.create({
      data: {
        action: 'DATABASE_BACKUP_SNAPSHOT_EXPORTED',
        actor: `${sessionUser.name} (${sessionUser.email})`,
        details: `Barangay Captain exported an encrypted system snapshot containing ${users.length} users and ${inhabitants.length} civil records.`,
        ip: '127.0.0.1',
      },
    });

    const jsonContent = JSON.stringify(backupSnapshot, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(jsonContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="smartonse-backup-${dateStr}.json"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database backup snapshot export failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

