import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// GET /api/admin/services - List all services and document rates
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' },
    });

    const formatted = services.map((s, index) => {
      const code = `SRV-${String(index + 1).padStart(3, '0')}`;
      return {
        id: s.id,
        code,
        name: s.title,
        category: s.category,
        fee: s.fee,
        turnaround: s.processingTime,
        requirements: s.requirements,
        status: s.isActive ? 'ACTIVE' : 'INACTIVE',
        monthlyVolume: `${Math.floor(50 + index * 45)} issued / mo`,
        description: s.description,
      };
    });

    return NextResponse.json({ success: true, services: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch services';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/services - Create new service / document rate
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
    const { name, category, fee, turnaround, requirements, description } = body;

    if (!name || !requirements) {
      return NextResponse.json(
        { error: 'Service name and requirements are required.' },
        { status: 400 }
      );
    }

    const count = await prisma.service.count();
    const newService = await prisma.service.create({
      data: {
        title: name.trim(),
        category: category || 'General Issuance',
        fee: fee ? fee.trim() : 'Free',
        requirements: requirements.trim(),
        processingTime: turnaround ? turnaround.trim() : '24 Hours',
        description: description ? description.trim() : `Official barangay service for ${name.trim()}`,
        isActive: true,
        order: count + 1,
      },
    });

    const formatted = {
      id: newService.id,
      code: `SRV-${String(count + 1).padStart(3, '0')}`,
      name: newService.title,
      category: newService.category,
      fee: newService.fee,
      turnaround: newService.processingTime,
      requirements: newService.requirements,
      status: newService.isActive ? 'ACTIVE' : 'INACTIVE',
      monthlyVolume: '0 issued / mo',
      description: newService.description,
    };

    return NextResponse.json({ success: true, service: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create service';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
