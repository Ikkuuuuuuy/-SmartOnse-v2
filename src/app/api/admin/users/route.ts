import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// GET /api/admin/users - Fetch all system users from Prisma
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        address: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const formatted = users.map((u) => {
      const roleBadge = u.role.includes('admin') || u.role.includes('captain')
        ? 'bg-purple-100 text-purple-900'
        : u.role.includes('councilor') || u.role.includes('sk')
        ? 'bg-blue-100 text-blue-900'
        : u.role === 'staff'
        ? 'bg-amber-100 text-amber-900'
        : 'bg-emerald-100 text-emerald-900';

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        roleBadge,
        status: u.isVerified ? 'ACTIVE' : 'PENDING',
        lastLogin: 'Recent',
        createdAt: u.createdAt.toISOString().slice(0, 16).replace('T', ' '),
      };
    });

    return NextResponse.json({ success: true, users: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/users - Create new official or staff account
export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const { name, email, password, role, phone, address } = await req.json();
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role,
        phone: phone || null,
        address: address || null,
        isVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create user account';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
