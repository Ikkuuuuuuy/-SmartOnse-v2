import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

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
    const { action } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { inhabitant: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (action === 'approve') {
      // 1. Mark User as Verified
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isVerified: true },
      });

      // 2. If not already enrolled in Barangay Registry of Inhabitants (RBI), auto-enroll!
      let rbiNumber = user.inhabitant?.rbiNumber;

      if (!user.inhabitant) {
        const count = await prisma.barangayInhabitant.count();
        const year = new Date().getFullYear();
        const nextNum = String(count + 1).padStart(5, '0');
        rbiNumber = `RBI-${year}-${nextNum}`;

        // Parse Name
        const nameParts = user.name.trim().split(/\s+/);
        const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Resident';

        // Extract street from address
        const street = user.address && user.address.trim() ? user.address.trim() : 'Lt. Artiaga St.';

        await prisma.barangayInhabitant.create({
          data: {
            rbiNumber,
            firstName,
            lastName,
            birthDate: new Date('2000-01-01'),
            age: 26,
            sex: 'Unspecified',
            civilStatus: 'Single',
            nationality: 'Filipino',
            street,
            yearsOfResidency: 1,
            householdRole: 'Member',
            status: 'ACTIVE',
            userId: user.id,
          },
        });

        console.log(`[Admin Verification] Enrolled new resident ${user.name} into Census with RBI: ${rbiNumber}`);
      }

      return NextResponse.json({
        success: true,
        message: `${updatedUser.name} has been approved and enrolled in the Barangay Onse Registry of Inhabitants (${rbiNumber}).`,
        rbiNumber,
      });
    }

    if (action === 'reject') {
      // If user had an inhabitant record, unlink it or keep it intact
      if (user.inhabitant) {
        await prisma.barangayInhabitant.update({
          where: { id: user.inhabitant.id },
          data: { userId: null },
        });
      }

      const deleted = await prisma.user.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: `${deleted.name}'s registration has been rejected and removed.`,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
