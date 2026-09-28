import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// PATCH /api/admin/transparency/[id] - Update transparency disclosure
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { title, year, quarter, category, fileSize } = body;

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title.trim();
    if (category) updateData.category = category.trim();
    if (quarter) updateData.quarter = quarter.trim();
    if (fileSize) updateData.fileSize = fileSize.trim();
    if (year) updateData.year = parseInt(String(year).replace(/[^0-9]/g, '')) || 2026;

    const updated = await prisma.transparencyDocument.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      document: {
        id: updated.id,
        title: updated.title,
        year: `FY ${updated.year}`,
        quarter: updated.quarter,
        fileSize: `${updated.fileSize} (PDF)`,
        status: updated.category.includes('SK') ? 'VERIFIED_NYC' : 'VERIFIED_COA',
        uploadedBy: 'Barangay Treasurer',
        date: updated.publishedDate.toISOString().slice(0, 10),
        category: updated.category,
      },
      message: 'Transparency document updated successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update transparency record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/transparency/[id] - Remove transparency disclosure
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await prisma.transparencyDocument.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Disclosure record removed successfully!' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete transparency record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
