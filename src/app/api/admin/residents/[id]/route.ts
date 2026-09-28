import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// PATCH /api/admin/residents/[id] - Edit resident details
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
    const { name, email, contact, address, precinct, civil, householdRole } = body;

    // Check if ID is a User or BarangayInhabitant
    const user = await prisma.user.findUnique({
      where: { id },
      include: { inhabitant: true },
    });

    if (user) {
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(email ? { email: email.trim().toLowerCase() } : {}),
          ...(contact ? { phone: contact.trim() } : {}),
          ...(address ? { address: address.trim() } : {}),
        },
      });

      if (user.inhabitant) {
        await prisma.barangayInhabitant.update({
          where: { id: user.inhabitant.id },
          data: {
            ...(address ? { street: address.trim() } : {}),
            ...(precinct ? { precinct: precinct.trim() } : {}),
            ...(civil ? { civilStatus: civil } : {}),
            ...(householdRole ? { householdRole } : {}),
          },
        });
      }

      return NextResponse.json({
        success: true,
        resident: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          contact: updatedUser.phone,
          address: updatedUser.address,
          precinct: precinct || user.inhabitant?.precinct || 'PRECINCT-0042A',
          civil: civil || user.inhabitant?.civilStatus || 'Single',
          householdRole: householdRole || user.inhabitant?.householdRole || 'Head of Household',
          registered: updatedUser.createdAt.toISOString().slice(0, 10),
          verified: updatedUser.isVerified,
        },
        message: 'Resident updated successfully!',
      });
    }

    // Try finding by BarangayInhabitant ID
    const inhabitant = await prisma.barangayInhabitant.findUnique({
      where: { id },
    });

    if (inhabitant) {
      let firstName = inhabitant.firstName;
      let lastName = inhabitant.lastName;
      if (name) {
        const parts = name.trim().split(/\s+/);
        firstName = parts[0] || firstName;
        lastName = parts.length > 1 ? parts.slice(1).join(' ') : lastName;
      }

      const updatedInh = await prisma.barangayInhabitant.update({
        where: { id },
        data: {
          firstName,
          lastName,
          ...(address ? { street: address.trim() } : {}),
          ...(precinct ? { precinct: precinct.trim() } : {}),
          ...(civil ? { civilStatus: civil } : {}),
          ...(householdRole ? { householdRole } : {}),
        },
      });

      return NextResponse.json({
        success: true,
        resident: {
          id: updatedInh.id,
          name: `${updatedInh.firstName} ${updatedInh.lastName}`,
          email: email || 'resident@onse.ph',
          contact: contact || '0917-888-0000',
          address: updatedInh.street,
          precinct: updatedInh.precinct,
          civil: updatedInh.civilStatus,
          householdRole: updatedInh.householdRole,
          registered: updatedInh.createdAt.toISOString().slice(0, 10),
          verified: true,
        },
        message: 'Inhabitant record updated successfully!',
      });
    }

    return NextResponse.json({ error: 'Resident not found' }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update resident.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/residents/[id] - Remove resident record
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

    // Check if ID matches a User
    const user = await prisma.user.findUnique({
      where: { id },
      include: { inhabitant: true },
    });

    if (user) {
      if (user.inhabitant) {
        await prisma.barangayInhabitant.delete({ where: { id: user.inhabitant.id } }).catch(() => {});
      }
      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Resident record removed successfully!' });
    }

    // Check if ID matches an Inhabitant
    const inhabitant = await prisma.barangayInhabitant.findUnique({ where: { id } });
    if (inhabitant) {
      await prisma.barangayInhabitant.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Inhabitant record removed successfully!' });
    }

    return NextResponse.json({ error: 'Resident record not found' }, { status: 404 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete resident.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
