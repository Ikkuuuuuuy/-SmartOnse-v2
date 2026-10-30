import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';
import { verifySignedKycUrl } from '@/lib/kyc-vault';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doc = searchParams.get('doc');
    const user = searchParams.get('user');
    const exp = searchParams.get('exp');
    const sig = searchParams.get('sig');

    if (!doc || !user || !exp || !sig) {
      return NextResponse.json(
        { error: 'Missing required signed security parameters.' },
        { status: 400 }
      );
    }

    // 1. Verify Cryptographic Signature & 15-Minute Expiration
    const verification = verifySignedKycUrl(doc, user, exp, sig);
    if (!verification.valid) {
      return NextResponse.json(
        { error: `Access Denied: ${verification.reason}` },
        { status: 403 }
      );
    }

    // 2. Dual Authorization: Viewer must be the owner OR an authorized Barangay Official
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Authentication required to view sensitive resident records.' },
        { status: 401 }
      );
    }

    const isOwner = sessionUser.id === user;
    const isOfficial = isAdminUser(sessionUser.role);

    if (!isOwner && !isOfficial) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to view this resident document.' },
        { status: 403 }
      );
    }

    // 3. Write Immutable Audit Log for every KYC Inspection
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        action: 'KYC_DOCUMENT_INSPECTED',
        actor: `${sessionUser.name} (${sessionUser.email})`,
        details: `Inspected protected KYC document "${doc}" for resident ID: ${user}.`,
        ip,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'KYC Verification passed. Document authorized.',
      documentId: doc,
      ownerUserId: user,
      authorizedViewer: sessionUser.email,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to inspect KYC document';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

