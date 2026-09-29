import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 0; // Dynamic, real-time

// GET /api/services - Public endpoint returning all active services & document types
export async function GET() {
  try {
    // Prefer DocumentType table for requestable certificates, fallback/enrich with Service table
    const [docTypes, services] = await Promise.all([
      prisma.documentType.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
    ]);

    // Format document types for request portal
    const certificates = docTypes.map((dt) => {
      // Find matching service for processing time or requirements
      const matchingService = services.find(
        (s) =>
          s.title.toLowerCase().includes(dt.name.toLowerCase()) ||
          dt.name.toLowerCase().includes(s.title.toLowerCase())
      );

      const feeFormatted = dt.fee === 0 ? 'FREE' : `₱${dt.fee.toFixed(2)}`;
      const timeFormatted = matchingService
        ? matchingService.processingTime
        : dt.processingDays === 1
        ? 'Same Day'
        : `${dt.processingDays} Days`;

      return {
        id: dt.id,
        code: dt.code,
        name: dt.name,
        description: dt.description,
        fee: feeFormatted,
        time: timeFormatted,
        requirements: dt.requirements,
      };
    });

    // Format all public services
    const publicServices = services.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      description: s.description,
      fee: s.fee,
      turnaround: s.processingTime,
      requirements: s.requirements,
    }));

    return NextResponse.json({
      success: true,
      certificates,
      services: publicServices,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch services';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
