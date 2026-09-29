import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const revalidate = 60; // Cache for 60 seconds

// GET /api/transparency - Public listing of transparency documents
export async function GET() {
  try {
    const docs = await prisma.transparencyDocument.findMany({
      orderBy: [
        { year: 'desc' },
        { publishedDate: 'desc' },
      ],
    });

    const formatted = docs.map((doc, index) => {
      const isSk = doc.category.toLowerCase().includes('sk') || doc.category.toLowerCase().includes('youth');
      return {
        id: doc.id,
        code: `FDB-${doc.year}-${String(index + 1).padStart(2, '0')}`,
        title: doc.title,
        category: doc.category,
        year: String(doc.year),
        quarter: doc.quarter || 'Annual',
        fileUrl: doc.fileUrl || '#',
        fileSize: doc.fileSize ? (doc.fileSize.toUpperCase().includes('PDF') ? doc.fileSize : `${doc.fileSize} PDF`) : '2.0 MB PDF',
        publishedDate: doc.publishedDate ? doc.publishedDate.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        council: isSk ? 'SK' : 'BARANGAY',
      };
    });

    return NextResponse.json({ success: true, documents: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch transparency documents';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
