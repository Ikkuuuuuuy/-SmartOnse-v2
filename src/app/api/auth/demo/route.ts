import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSessionToken, hashPassword, SESSION_COOKIE_NAME } from '@/lib/auth';

interface DemoAccount {
  name: string;
  email: string;
  role: string;
  roleTitle: string;
  destination: string;
  phone: string;
  address: string;
}

const DEMO_ACCOUNTS: Record<string, DemoAccount> = {
  admin: {
    name: 'Hon. Roberto Alba (Captain)',
    email: 'captain@onse.gov.ph',
    role: 'barangay_captain',
    roleTitle: 'Admin / Captain',
    destination: '/admin',
    phone: '0917-111-0002',
    address: 'Barangay Hall, Onse, San Juan City',
  },
  captain: {
    name: 'Hon. Roberto Alba (Captain)',
    email: 'captain@onse.gov.ph',
    role: 'barangay_captain',
    roleTitle: 'Admin / Captain',
    destination: '/admin',
    phone: '0917-111-0002',
    address: 'Barangay Hall, Onse, San Juan City',
  },
  super_admin: {
    name: 'Wayne Superadmin',
    email: 'superadmin@smartonse.com',
    role: 'super_admin',
    roleTitle: 'Super Admin',
    destination: '/admin',
    phone: '0917-111-0001',
    address: 'Barangay Onse, San Juan City',
  },
  barangay_captain: {
    name: 'Hon. Roberto Alba (Captain)',
    email: 'captain@onse.gov.ph',
    role: 'barangay_captain',
    roleTitle: 'Admin / Captain',
    destination: '/admin',
    phone: '0917-111-0002',
    address: 'Barangay Hall, Onse, San Juan City',
  },
  staff: {
    name: 'Jonathan D. Sorio',
    email: 'records@onse.gov.ph',
    role: 'staff',
    roleTitle: 'Desk Staff',
    destination: '/admin/requests',
    phone: '0917-111-0006',
    address: 'Barangay Hall Desk, Onse, San Juan City',
  },
  kagawad: {
    name: 'Hon. Danilo Florano',
    email: 'kagawad@onse.gov.ph',
    role: 'barangay_councilor',
    roleTitle: 'Barangay Kagawad',
    destination: '/admin/services',
    phone: '0917-111-0003',
    address: 'Barangay Onse, San Juan City',
  },
  barangay_councilor: {
    name: 'Hon. Danilo Florano',
    email: 'kagawad@onse.gov.ph',
    role: 'barangay_councilor',
    roleTitle: 'Barangay Kagawad',
    destination: '/admin/services',
    phone: '0917-111-0003',
    address: 'Barangay Onse, San Juan City',
  },
  sk: {
    name: 'Hon. John Michael Permato',
    email: 'sk@onse.gov.ph',
    role: 'sk_chairperson',
    roleTitle: 'SK Chairman',
    destination: '/sk-programs',
    phone: '0917-111-0004',
    address: 'SK Hall, Onse, San Juan City',
  },
  sk_chairperson: {
    name: 'Hon. John Michael Permato',
    email: 'sk@onse.gov.ph',
    role: 'sk_chairperson',
    roleTitle: 'SK Chairman',
    destination: '/sk-programs',
    phone: '0917-111-0004',
    address: 'SK Hall, Onse, San Juan City',
  },
  resident: {
    name: 'Juan Dela Cruz',
    email: 'juan@onse.ph',
    role: 'resident',
    roleTitle: 'Resident Citizen',
    destination: '/portal/request',
    phone: '0917-111-0007',
    address: '3 J V Panganiban, Barangay Onse, San Juan City',
  },
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = (body.roleId || body.role || body.email || 'admin').toString().toLowerCase().trim();

    // Match by key or by email
    const target =
      DEMO_ACCOUNTS[key] ||
      Object.values(DEMO_ACCOUNTS).find((acc) => acc.email.toLowerCase() === key) ||
      DEMO_ACCOUNTS.admin;

    // Ensure account exists and is verified in Prisma DB
    let user = await prisma.user.findUnique({
      where: { email: target.email },
    });

    if (!user) {
      const defaultHashedPassword = await hashPassword('password123');
      user = await prisma.user.create({
        data: {
          name: target.name,
          email: target.email,
          password: defaultHashedPassword,
          role: target.role,
          isVerified: true,
          phone: target.phone,
          address: target.address,
        },
      });
    } else if (!user.isVerified) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: target.role,
      roleTitle: target.roleTitle,
      destination: target.destination,
    };

    const token = await createSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        ...sessionPayload,
        phone: user.phone || target.phone,
        address: user.address || target.address,
        avatarUrl: user.avatarUrl || null,
      },
    });

    // Set secure httpOnly session cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Demo login failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
