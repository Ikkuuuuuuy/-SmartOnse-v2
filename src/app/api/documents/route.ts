import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateTrackingNumber } from '@/lib/utils';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

function maskName(name: string): string {
  if (!name) return 'Citizen Applicant';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => (p.length > 2 ? `${p[0]}***${p[p.length - 1]}` : `${p[0]}***`))
    .join(' ');
}

function maskPhone(phone: string | null): string {
  if (!phone) return '0917-***-****';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length >= 7) {
    return `${clean.slice(0, 4)}-***-${clean.slice(-2)}`;
  }
  return '0917-***-****';
}

function maskEmail(email: string | null): string | null {
  if (!email) return null;
  const [userPart, domain] = email.split('@');
  if (!domain) return 'c***@domain.com';
  const maskedUser = userPart.length > 2 ? `${userPart[0]}***${userPart[userPart.length - 1]}` : 'c***';
  return `${maskedUser}@${domain}`;
}

// GET /api/documents - Search by tracking number or list requests
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingNumber = searchParams.get('trackingNumber');
    const userId = searchParams.get('userId');
    const sessionUser = await getSessionUser();

    if (trackingNumber) {
      const cleanCode = trackingNumber.trim().toUpperCase();
      const documentRequest = await prisma.documentRequest.findFirst({
        where: {
          trackingNumber: {
            equals: cleanCode,
          },
        },
        include: {
          documentType: true,
        },
      });

      if (!documentRequest) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
      }

      const isPrivileged = sessionUser && (isAdminUser(sessionUser.role) || sessionUser.id === documentRequest.userId);

      return NextResponse.json({
        success: true,
        request: {
          id: documentRequest.id,
          trackingNumber: documentRequest.trackingNumber,
          fullName: isPrivileged ? documentRequest.fullName : maskName(documentRequest.fullName),
          documentType: documentRequest.documentType.name,
          documentTypeCode: documentRequest.documentType.code,
          fee: documentRequest.documentType.fee,
          purpose: isPrivileged ? documentRequest.purpose : 'Verified Clearance Purpose',
          address: isPrivileged ? documentRequest.address : 'Barangay Onse, San Juan City',
          contactNumber: isPrivileged ? documentRequest.contactNumber : maskPhone(documentRequest.contactNumber),
          email: isPrivileged ? documentRequest.email : maskEmail(documentRequest.email),
          status: documentRequest.status,
          remarks: documentRequest.remarks,
          pickupDate: documentRequest.pickupDate,
          createdAt: documentRequest.createdAt.toISOString(),
        },
      });
    }

    if (userId) {
      // IDOR Protection: Caller must be logged in as that user OR be an admin/staff
      if (!sessionUser || (sessionUser.id !== userId && !isAdminUser(sessionUser.role))) {
        return NextResponse.json(
          { error: 'Unauthorized: You may only view your own document records.' },
          { status: 403 }
        );
      }

      const requests = await prisma.documentRequest.findMany({
        where: { userId },
        include: { documentType: true },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        requests: requests.map((r) => ({
          id: r.id,
          trackingNumber: r.trackingNumber,
          fullName: r.fullName,
          documentType: r.documentType.name,
          documentTypeCode: r.documentType.code,
          fee: r.documentType.fee,
          purpose: r.purpose,
          status: r.status,
          remarks: r.remarks,
          createdAt: r.createdAt.toISOString(),
        })),
      });
    }

    return NextResponse.json({ error: 'Missing trackingNumber or userId query parameter' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query documents';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/documents - Submit a new document request
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const trackingNumber = generateTrackingNumber();

    // Match document type by code or name
    const requestedCode = (data.documentTypeCode || '').trim();
    let docType = await prisma.documentType.findFirst({
      where: {
        OR: [
          { code: requestedCode },
          { name: { contains: requestedCode } },
        ],
      },
    });

    if (!docType) {
      // Fallback to Barangay Clearance if not found
      docType = await prisma.documentType.findFirst({
        where: { code: 'BRGY_CLEARANCE' },
      });
    }

    if (!docType) {
      return NextResponse.json({ error: 'Invalid document type requested' }, { status: 400 });
    }

    const newRequest = await prisma.documentRequest.create({
      data: {
        trackingNumber,
        documentTypeId: docType.id,
        fullName: data.fullName || 'Citizen Applicant',
        contactNumber: data.contactNumber || '0917-000-0000',
        email: data.email || null,
        address: data.address || 'Barangay Onse, San Juan City',
        purpose: data.purpose || 'Official Document Request',
        civilStatus: data.civilStatus || 'Single',
        yearsOfResidency: Number(data.yearsOfResidency) || 1,
        userId: data.userId || null,
        status: 'PENDING',
      },
      include: {
        documentType: true,
      },
    });

    return NextResponse.json({
      success: true,
      trackingNumber: newRequest.trackingNumber,
      id: newRequest.id,
      documentType: newRequest.documentType.name,
      status: newRequest.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred while creating document request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
