import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// GET /api/admin/requests - Fetch all clearance requests from database
export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const whereClause: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter;
    }

    const requests = await prisma.documentRequest.findMany({
      where: whereClause,
      include: {
        documentType: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedRequests = requests.map((r) => {
      const d = new Date(r.createdAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

      return {
        id: r.id,
        trackingNumber: r.trackingNumber,
        fullName: r.fullName,
        documentType: r.documentType.name,
        documentTypeCode: r.documentType.code,
        fee: r.documentType.fee,
        status: r.status,
        purpose: r.purpose,
        address: r.address,
        contactNumber: r.contactNumber,
        email: r.email,
        remarks: r.remarks,
        pickupDate: r.pickupDate ? r.pickupDate.toISOString() : null,
        createdAt: dateStr,
      };
    });

    return NextResponse.json({
      success: true,
      requests: formattedRequests,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch admin requests';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/admin/requests - Update request status, remarks, or pickup date
export async function PATCH(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, trackingNumber, status, remarks, pickupDate } = body;

    if (!id && !trackingNumber) {
      return NextResponse.json({ error: 'Request id or trackingNumber is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;
    if (pickupDate !== undefined) updateData.pickupDate = pickupDate ? new Date(pickupDate) : null;

    let updated;
    if (id) {
      updated = await prisma.documentRequest.update({
        where: { id },
        data: updateData,
        include: { documentType: true },
      });
    } else {
      updated = await prisma.documentRequest.update({
        where: { trackingNumber },
        data: updateData,
        include: { documentType: true },
      });
    }

    return NextResponse.json({
      success: true,
      request: {
        id: updated.id,
        trackingNumber: updated.trackingNumber,
        fullName: updated.fullName,
        documentType: updated.documentType.name,
        fee: updated.documentType.fee,
        status: updated.status,
        remarks: updated.remarks,
        pickupDate: updated.pickupDate,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update clearance request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/requests - Remove clearance request
export async function DELETE(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Request id is required.' }, { status: 400 });
    }

    await prisma.documentRequest.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Clearance request removed successfully!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete clearance request';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

