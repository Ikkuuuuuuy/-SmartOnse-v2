import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 0; // Dynamic, real-time

function normalizeTitle(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// GET /api/services - Public endpoint returning all active services & document types
export async function GET() {
  try {
    // Use Service table (managed in /admin/services) as the single source of truth
    // so the resident request portal always mirrors Admin Service Management 1-to-1.
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

    const certificates = services.map((s) => {
      const normService = normalizeTitle(s.title);
      const matchingDocType = docTypes.find((dt) => {
        const normDoc = normalizeTitle(dt.name);
        return (
          normDoc === normService ||
          normDoc.includes(normService) ||
          normService.includes(normDoc)
        );
      });

      const fallbackCode =
        s.title
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 30) || 'SERVICE_DOC';

      return {
        id: matchingDocType?.id || s.id,
        code: matchingDocType?.code || fallbackCode,
        name: s.title,
        description: s.description,
        fee: s.fee,
        time: s.processingTime,
        requirements: s.requirements,
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
