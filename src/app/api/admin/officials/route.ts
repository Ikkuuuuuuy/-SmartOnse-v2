import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

// GET /api/admin/officials - List all barangay and SK officials
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !isAdminUser(sessionUser.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: Administrative access required.' },
        { status: 401 }
      );
    }

    const officials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });

    const formatted = officials.map((off) => {
      const isSK = off.position.toLowerCase().includes('sk') || (off.committee && off.committee.toLowerCase().includes('youth'));
      return {
        id: off.id,
        name: off.name,
        position: off.position,
        category: isSK ? 'sk' : 'barangay',
        committee: off.committee || 'Council Member',
        term: off.term || '2023 - 2026',
        contact: off.contact || '0917-888-0011',
        email: `${off.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}@onse.gov.ph`,
        status: 'ACTIVE',
        avatar: off.avatarUrl || '/images/Chairman.webp',
      };
    });

    return NextResponse.json({ success: true, officials: formatted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch officials';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/officials - Create new barangay / SK official
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
    const { name, position, committee, contact, term, category, avatarUrl } = body;

    if (!name || !position) {
      return NextResponse.json(
        { error: 'Official name and position are required.' },
        { status: 400 }
      );
    }

    // Validate phone number: must be digits (numbers) only, no alphabetic letters
    let cleanContact = '0917-888-0000';
    if (contact) {
      const trimmed = contact.trim();
      const digits = trimmed.replace(/\D/g, '');
      if (/[a-zA-Z]/.test(trimmed) || digits.length < 7 || digits.length > 15) {
        return NextResponse.json(
          { error: 'Contact number must be a valid numeric phone number (e.g., 0917-888-0000). Letters and symbols are not allowed.' },
          { status: 400 }
        );
      }
      cleanContact = trimmed;
    }

    const count = await prisma.barangayOfficial.count();
    const isSK = category === 'sk' || position.toLowerCase().includes('sk');

    // Default to the official barangay seal if no specific photo is provided
    const finalAvatar = avatarUrl && avatarUrl.trim()
      ? avatarUrl.trim()
      : '/images/barangay-onse-seal.png';

    const newOfficial = await prisma.barangayOfficial.create({
      data: {
        name: name.trim(),
        position: position.trim(),
        committee: committee ? committee.trim() : 'Council Member',
        contact: cleanContact,
        term: term ? term.trim() : '2023 - 2026',
        avatarUrl: finalAvatar,
        order: count + 1,
      },
    });

    return NextResponse.json({
      success: true,
      official: {
        id: newOfficial.id,
        name: newOfficial.name,
        position: newOfficial.position,
        category: isSK ? 'sk' : 'barangay',
        committee: newOfficial.committee,
        term: newOfficial.term,
        contact: newOfficial.contact,
        email: `${newOfficial.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}@onse.gov.ph`,
        status: 'ACTIVE',
        avatar: newOfficial.avatarUrl,
      },
      message: 'Official profile created successfully!',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create official';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
