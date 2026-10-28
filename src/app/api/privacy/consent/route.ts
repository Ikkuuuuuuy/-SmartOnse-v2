import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

// POST /api/privacy/consent - Persist citizen consent under RA 10173
export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    const body = await req.json().catch(() => ({}));
    const { consentType, granted, name, email } = body;

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown';

    const record = await prisma.consentRecord.create({
      data: {
        userId: sessionUser?.id || null,
        name: name || sessionUser?.name || null,
        email: email || sessionUser?.email || null,
        consentType: consentType || 'DATA_PROCESSING',
        granted: granted !== false,
        ipAddress: ipAddress.split(',')[0].trim(),
        userAgent,
      },
    });

    return NextResponse.json({ success: true, recordId: record.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record consent';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

