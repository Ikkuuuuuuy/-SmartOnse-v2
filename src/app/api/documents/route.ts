import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateTrackingNumber } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const trackingNumber = generateTrackingNumber();

    const docType = await prisma.documentType.findFirst({
      where: { code: data.documentTypeCode || 'BRGY_CLEARANCE' },
    });

    if (!docType) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    const newRequest = await prisma.documentRequest.create({
      data: {
        trackingNumber,
        documentTypeId: docType.id,
        fullName: data.fullName,
        contactNumber: data.contactNumber,
        email: data.email || null,
        address: data.address,
        purpose: data.purpose,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, trackingNumber: newRequest.trackingNumber });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
