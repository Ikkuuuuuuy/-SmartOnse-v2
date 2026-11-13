import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getNextSequentialTrackingNumber } from '@/lib/tracking';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';
import { formatPhDateTime } from '@/lib/ph-time';
import { createNotification } from '@/lib/notifications';
import { sendStatusUpdateEmail } from '@/lib/mailer';

function maskName(name: string): string {
  if (!name) return 'Citizen Applicant';
  const parts = name.trim().split(/\s+/);
  return parts
    .map((p) => (p.length > 2 ? `${p[0]}***${p[p.length - 1]}` : `${p[0]}***`))
    .join(' ');
}

function maskPhone(phone: string | null): string {
  if (!phone || phone === 'Unprovided' || phone.trim() === '') return '—';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length >= 7) {
    return `${clean.slice(0, 4)}-***-${clean.slice(-2)}`;
  }
  return clean || '—';
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
          updatedAt: documentRequest.updatedAt.toISOString(),
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
          pickupDate: r.pickupDate,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      });
    }

    return NextResponse.json({ error: 'Missing trackingNumber or userId query parameter' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to query documents';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/documents - Submit a new document request (supports single or multi-clearance with copy counts)
export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    const data = await req.json();

    // Security Hardening (IDOR Prevention):
    // Users cannot spoof another citizen's userId. If authenticated, force their actual session ID.
    const resolvedUserId = sessionUser ? sessionUser.id : (isAdminUser(sessionUser?.role) ? data.userId : null);

    // ==============================================================
    // Anti-Troll & Anti-Spam Rate Limiting Guards
    // ==============================================================
    if (resolvedUserId) {
      // 1. Cap on Active (Pending / Processing / Ready) Requests
      const activeRequestsCount = await prisma.documentRequest.count({
        where: {
          userId: resolvedUserId,
          status: { in: ['PENDING', 'PROCESSING', 'READY_FOR_PICKUP'] },
        },
      });

      if (activeRequestsCount >= 6) {
        return NextResponse.json(
          {
            error:
              'Anti-Spam Policy: You already have 6 active requests currently being processed or waiting for pickup. Please claim or wait for your existing requests to finish before submitting new applications.',
          },
          { status: 429 }
        );
      }

      // 2. Cooldown timer against rapid-fire bot submissions (10 seconds)
      const lastRequest = await prisma.documentRequest.findFirst({
        where: { userId: resolvedUserId },
        orderBy: { createdAt: 'desc' },
      });

      if (lastRequest) {
        const secondsSinceLast = (Date.now() - new Date(lastRequest.createdAt).getTime()) / 1000;
        if (secondsSinceLast < 10) {
          return NextResponse.json(
            { error: 'Please wait at least 10 seconds before submitting another application.' },
            { status: 429 }
          );
        }
      }
    }

    // ==============================================================
    // Parse Requested Items (Supports Multi-Document & Copy Count)
    // ==============================================================
    interface RequestedItem {
      documentTypeCode: string;
      copies: number;
    }

    let itemsToProcess: RequestedItem[] = [];

    if (Array.isArray(data.items) && data.items.length > 0) {
      itemsToProcess = data.items
        .map((it: any) => ({
          documentTypeCode: String(it.documentTypeCode || it.code || '').trim(),
          copies: Math.min(5, Math.max(1, parseInt(it.copies, 10) || 1)), // 1 to 5 copies per document type
        }))
        .filter((it: RequestedItem) => it.documentTypeCode);
    } else if (data.documentTypeCode) {
      itemsToProcess = [
        {
          documentTypeCode: String(data.documentTypeCode).trim(),
          copies: Math.min(5, Math.max(1, parseInt(data.copies, 10) || 1)),
        },
      ];
    }

    if (itemsToProcess.length === 0) {
      return NextResponse.json({ error: 'Please select at least one document to request.' }, { status: 400 });
    }

    // Calculate total copies across all requested certificates
    const totalCopies = itemsToProcess.reduce((sum, item) => sum + item.copies, 0);

    if (totalCopies > 10) {
      return NextResponse.json(
        { error: 'Application limit exceeded: A maximum of 10 total certificate copies can be requested in a single batch.' },
        { status: 400 }
      );
    }

    // Fetch all active document types from DB
    const allDocTypes = await prisma.documentType.findMany({
      where: { isActive: true },
    });

    const fallbackDocType = allDocTypes.find((d) => d.code === 'BRGY_CLEARANCE') || allDocTypes[0];

    // ==============================================================
    // Generate Strictly Sequential Tracking Numbers
    // ==============================================================
    const sequentialTrackingNumbers = await getNextSequentialTrackingNumber(totalCopies);

    // ==============================================================
    // Create Document Requests in Database
    // ==============================================================
    const createdRequests: any[] = [];
    const breakdown: Array<{
      code: string;
      name: string;
      copies: number;
      unitFee: number;
      subtotal: number;
      isFree: boolean;
    }> = [];

    let seqIndex = 0;
    let totalFee = 0;

    for (const item of itemsToProcess) {
      const docType =
        allDocTypes.find((d) => d.code.toLowerCase() === item.documentTypeCode.toLowerCase()) ||
        fallbackDocType;

      if (!docType) continue;

      const unitFee = docType.fee;
      const subtotal = unitFee * item.copies;
      totalFee += subtotal;

      breakdown.push({
        code: docType.code,
        name: docType.name,
        copies: item.copies,
        unitFee,
        subtotal,
        isFree: unitFee === 0,
      });

      for (let c = 1; c <= item.copies; c++) {
        const trackingNum = sequentialTrackingNumbers[seqIndex++];
        const copyRemark = item.copies > 1 ? ` (Copy ${c} of ${item.copies})` : '';

        const created = await prisma.documentRequest.create({
          data: {
            trackingNumber: trackingNum,
            documentTypeId: docType.id,
            fullName: data.fullName || 'Citizen Applicant',
            contactNumber:
              data.contactNumber && String(data.contactNumber).trim()
                ? String(data.contactNumber).trim()
                : 'Unprovided',
            email: data.email || null,
            address: data.address || 'Barangay Onse, San Juan City',
            purpose: (data.purpose || 'Official Document Request') + copyRemark,
            civilStatus: data.civilStatus || 'Single',
            yearsOfResidency: Number(data.yearsOfResidency) || 1,
            userId: resolvedUserId,
            status: 'PENDING',
          },
          include: {
            documentType: true,
          },
        });

        createdRequests.push({
          id: created.id,
          trackingNumber: created.trackingNumber,
          documentType: created.documentType.name,
          documentTypeCode: created.documentType.code,
          fee: created.documentType.fee,
          status: created.status,
          copyNumber: c,
          totalCopies: item.copies,
          createdAt: created.createdAt.toISOString(),
          filedAtPh: formatPhDateTime(created.createdAt),
        });
      }
    }

    const trackingList = createdRequests.map((r) => r.trackingNumber);
    const primaryTracking = trackingList[0] || 'ONSE-2026-0000';
    const docSummary = breakdown.map((b) => `${b.copies}x ${b.name}`).join(', ');

    // 1. Real-time notification for Barangay Staff & Admin
    await createNotification({
      title: `New Certificate Request (${totalCopies} ${totalCopies === 1 ? 'Copy' : 'Copies'})`,
      description: `${data.fullName || 'Resident'} submitted ${docSummary} (${trackingList.join(', ')}).`,
      type: 'request',
      targetRole: 'admin',
      href: '/admin/requests',
    });

    // 2. Real-time notification for the Resident
    if (resolvedUserId) {
      await createNotification({
        title: `Application Submitted (#${primaryTracking})`,
        description: `Your request for ${docSummary} has been received and is pending desk review.`,
        type: 'request',
        targetRole: 'resident',
        targetUserId: resolvedUserId,
        href: `/track?code=${encodeURIComponent(primaryTracking)}`,
      });
    }

    // 3. Initial PENDING confirmation email via SMTP (awaited for serverless reliability)
    const applicantEmail = data.email || sessionUser?.email;
    if (applicantEmail) {
      try {
        await sendStatusUpdateEmail({
          to: applicantEmail,
          recipientName: data.fullName || sessionUser?.name || 'Resident',
          trackingNumber: trackingList.join(', '),
          documentType: docSummary,
          status: 'PENDING',
          remarks: `Total Fee: ${totalFee === 0 ? 'FREE' : `₱${totalFee.toFixed(2)}`}. Filed at ${createdRequests[0]?.filedAtPh || formatPhDateTime(new Date())}.`,
        });
      } catch (emailErr) {
        console.error('[SMTP Initial Submission Email Error]:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      trackingNumber: primaryTracking,
      trackingNumbers: trackingList,
      requests: createdRequests,
      totalCopies,
      totalFee,
      totalFeeDisplay: totalFee === 0 ? 'FREE' : `₱${totalFee.toFixed(2)}`,
      breakdown,
      filedAtPh: createdRequests[0]?.filedAtPh || formatPhDateTime(new Date()),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An error occurred while creating document requests';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
