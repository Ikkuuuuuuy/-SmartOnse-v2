import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// GET /api/profile/export - RA 10173 Right to Data Portability Export
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        inhabitant: true,
        requests: {
          include: {
            documentType: {
              select: { code: true, name: true, fee: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        appointments: {
          orderBy: { createdAt: 'desc' },
        },
        consentRecords: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'User record not found.' }, { status: 404 });
    }

    // Sanitize sensitive internal credentials before exporting
    const { password: _, ...safeUser } = userData;

    const exportPayload = {
      compliance: {
        regulation: 'Republic Act No. 10173 (Data Privacy Act of 2012)',
        jurisdiction: 'Republic of the Philippines',
        dataController: 'Barangay Onse, City of San Juan, Metro Manila',
        exportDate: new Date().toISOString(),
        requestingCitizen: sessionUser.name,
      },
      citizenProfile: safeUser,
    };

    return new Response(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="smartonse-data-export-${sessionUser.id.slice(-6)}.json"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to export citizen data';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

