import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, hashPassword } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// GET /api/admin/residents
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
    const type = searchParams.get('type'); // 'pending' | 'verified' | null = all

    // If requesting pending verifications specifically (for /admin/verifications)
    if (type === 'pending') {
      const users = await prisma.user.findMany({
        where: { role: 'resident', isVerified: false },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          isVerified: true,
          avatarUrl: true,
          createdAt: true,
          inhabitant: {
            select: {
              rbiNumber: true,
            },
          },
        },
      });
      return NextResponse.json({ success: true, users });
    }

    // For /admin/residents directory: Return unified list of all registered residents and inhabitants
    const [registeredUsers, inhabitants] = await Promise.all([
      prisma.user.findMany({
        where: { role: 'resident' },
        include: { inhabitant: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.barangayInhabitant.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const inhabitantMap = new Map<string, typeof inhabitants[0]>();
    inhabitants.forEach((inh) => {
      inhabitantMap.set(inh.id, inh);
      if (inh.userId) inhabitantMap.set(inh.userId, inh);
    });

    const formattedList = [];
    const seenEmails = new Set<string>();

    // 1. First add all portal registered residents
    for (const u of registeredUsers) {
      seenEmails.add(u.email.toLowerCase());
      const linkedInh = u.inhabitant || inhabitantMap.get(u.id);
      formattedList.push({
        id: u.id,
        inhabitantId: linkedInh?.id || null,
        rbiNumber: linkedInh?.rbiNumber || 'PORTAL-REG',
        name: u.name,
        precinct: linkedInh?.precinct || 'PRECINCT-0042A',
        address: u.address || linkedInh?.street || 'Barangay Onse, San Juan City',
        civil: (linkedInh?.civilStatus as any) || 'Single',
        contact: u.phone || '0917-888-0000',
        email: u.email,
        registered: u.createdAt.toISOString().slice(0, 10),
        verified: u.isVerified,
        householdRole: linkedInh?.householdRole || 'Head of Household',
      });
    }

    // 2. Add remaining inhabitants who don't have portal users yet
    for (const inh of inhabitants) {
      if (inh.userId && registeredUsers.some((u) => u.id === inh.userId)) continue;
      const inhFullName = `${inh.firstName} ${inh.middleName ? inh.middleName + ' ' : ''}${inh.lastName}${inh.suffix ? ' ' + inh.suffix : ''}`.trim();
      const mockEmail = `${inh.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${inh.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}@onse.ph`;
      
      formattedList.push({
        id: inh.id,
        inhabitantId: inh.id,
        rbiNumber: inh.rbiNumber,
        name: inhFullName,
        precinct: inh.precinct || 'PRECINCT-0042A',
        address: `${inh.houseNumber ? inh.houseNumber + ' ' : ''}${inh.street}`,
        civil: (inh.civilStatus as any) || 'Single',
        contact: '0917-888-' + String(Math.floor(1000 + Math.random() * 9000)),
        email: mockEmail,
        registered: inh.createdAt.toISOString().slice(0, 10),
        verified: true,
        householdRole: inh.householdRole || 'Member',
      });
    }

    return NextResponse.json({ success: true, residents: formattedList });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/residents - Add a new resident record
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
    const { name, email, contact, address, precinct, civil, householdRole } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: 'Name and address are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.trim().toLowerCase() : `${name.toLowerCase().replace(/\s+/g, '')}@onse.ph`;
    const cleanContact = contact ? contact.trim() : '0917-888-0000';
    const cleanPrecinct = precinct ? precinct.trim() : 'PRECINCT-0042A';
    const cleanCivil = civil || 'Single';
    const cleanRole = householdRole || 'Head of Household';

    const count = await prisma.barangayInhabitant.count();
    const nextNum = String(count + 1).padStart(5, '0');
    const rbiNumber = `RBI-${new Date().getFullYear()}-${nextNum}`;

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Resident';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Citizen';

    // 1. Upsert / Create User
    const defaultPassword = await hashPassword('password123');
    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: name.trim(),
        phone: cleanContact,
        address: address.trim(),
        isVerified: true,
      },
      create: {
        name: name.trim(),
        email: cleanEmail,
        password: defaultPassword,
        phone: cleanContact,
        address: address.trim(),
        role: 'resident',
        isVerified: true,
      },
    });

    // 2. Create Inhabitant entry
    const inhabitant = await prisma.barangayInhabitant.create({
      data: {
        rbiNumber,
        firstName,
        lastName,
        birthDate: new Date('1995-01-01'),
        age: 30,
        sex: 'Male',
        civilStatus: cleanCivil,
        street: address.trim(),
        precinct: cleanPrecinct,
        householdRole: cleanRole,
        isRegisteredVoter: true,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      resident: {
        id: user.id,
        inhabitantId: inhabitant.id,
        rbiNumber: inhabitant.rbiNumber,
        name: user.name,
        precinct: cleanPrecinct,
        address: user.address,
        civil: cleanCivil,
        contact: user.phone,
        email: user.email,
        registered: user.createdAt.toISOString().slice(0, 10),
        verified: true,
        householdRole: cleanRole,
      },
      message: 'Resident successfully registered and indexed!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to register resident.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
