import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// GET /api/admin/transparency - List all transparency disclosures
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const docs = await prisma.transparencyDocument.findMany({
      orderBy: { publishedDate: 'desc' },
    });

    const formatted = docs.map((doc, index) => {
      const code = `FDB-${doc.year}-${String(index + 1).padStart(2, '0')}`;
      return {
        id: doc.id,
        code,
        title: doc.title,
        year: `FY ${doc.year}`,
        quarter: doc.quarter || `Q${Math.floor(index / 3) + 1} ${doc.year}`,
        fileSize: `${doc.fileSize} (PDF)`,
        status: doc.category.includes('SK') ? 'VERIFIED_NYC' : 'VERIFIED_COA',
        uploadedBy: doc.category.includes('SK') ? 'SK Treasurer' : 'Barangay Treasurer',
        date: doc.publishedDate.toISOString().slice(0, 10),
        category: doc.category,
      };
    });

    return NextResponse.json({ success: true, documents: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch transparency records';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/transparency - Create new disclosure record
export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, year, quarter, category, fileSize } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Document title is required.' },
        { status: 400 }
      );
    }

    const parsedYear = year ? parseInt(String(year).replace(/[^0-9]/g, '')) || 2026 : 2026;
    const cleanCategory = category || 'Financial Statement';
    const cleanQuarter = quarter || `Q3 ${parsedYear}`;

    const newDoc = await prisma.transparencyDocument.create({
      data: {
        title: title.trim(),
        category: cleanCategory,
        year: parsedYear,
        quarter: cleanQuarter,
        fileUrl: '#',
        fileSize: fileSize || '1.8 MB',
        publishedDate: new Date(),
      },
    });

    const count = await prisma.transparencyDocument.count();

    return NextResponse.json({
      success: true,
      document: {
        id: newDoc.id,
        code: `FDB-${newDoc.year}-${String(count).padStart(2, '0')}`,
        title: newDoc.title,
        year: `FY ${newDoc.year}`,
        quarter: newDoc.quarter,
        fileSize: `${newDoc.fileSize} (PDF)`,
        status: 'VERIFIED_COA',
        uploadedBy: sessionUser.name || 'Barangay Treasurer',
        date: newDoc.publishedDate.toISOString().slice(0, 10),
        category: newDoc.category,
      },
      message: 'Transparency document published successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create transparency record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
