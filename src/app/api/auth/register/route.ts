import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateSimilarity } from '@/lib/idScanner';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name,
      email,
      phone,
      address,
      password,
      birthDate,
      gender,
      idType,
      idCardImage,
    } = body;

    if (!name || !phone || !password || typeof name !== 'string' || typeof phone !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Full name, mobile phone number, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: 'Password must be between 8 and 128 characters.' },
        { status: 400 }
      );
    }

    if (name.trim().length > 120) {
      return NextResponse.json(
        { error: 'Name exceeds maximum allowed length.' },
        { status: 400 }
      );
    }

    // Validate Philippine Mobile Phone Number
    const rawDigits = phone.replace(/\D/g, '');
    let cleanPhone = phone.trim();
    if (rawDigits.length === 11 && rawDigits.startsWith('09')) {
      cleanPhone = rawDigits;
    } else if (rawDigits.length === 12 && rawDigits.startsWith('639')) {
      cleanPhone = '0' + rawDigits.slice(2);
    } else if (rawDigits.length === 10 && rawDigits.startsWith('9')) {
      cleanPhone = '0' + rawDigits;
    } else {
      return NextResponse.json(
        { error: 'Please provide a valid 11-digit Philippine mobile number (e.g. 09171234567).' },
        { status: 400 }
      );
    }

    // Check for existing mobile number
    const formattedDashed = `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4, 7)}-${cleanPhone.slice(7)}`;
    const existingPhone = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { phone: formattedDashed },
        ],
      },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: 'An account with this mobile phone number already exists. Please log in or use a different number.' },
        { status: 409 }
      );
    }

    // Email Address is OPTIONAL (Accommodates Senior Citizens & Residents without email)
    let cleanEmail: string | null = null;
    if (email && typeof email === 'string' && email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      cleanEmail = email.trim().toLowerCase();
      if (!emailRegex.test(cleanEmail) || cleanEmail.length > 255) {
        return NextResponse.json(
          { error: 'Invalid email address format. If you do not have an email, you may leave it blank.' },
          { status: 400 }
        );
      }

      // Check for existing email
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email address already exists.' },
          { status: 409 }
        );
      }
    }

    // Securely hash password with bcrypt (10 rounds)
    const hashedPassword = await hashPassword(password);

    // Step 1: Check against Barangay Onse Registry of Inhabitants (RBI)
    // Fetch active inhabitants who do not have an attached user account yet
    const activeInhabitants = await prisma.barangayInhabitant.findMany({
      where: {
        status: 'ACTIVE',
        userId: null,
      },
    });

    let matchedInhabitant = null;
    let highestScore = 0;

    const applicantCleanName = name.trim().toLowerCase();

    for (const inh of activeInhabitants) {
      const inhFullName = `${inh.firstName} ${inh.middleName ? inh.middleName + ' ' : ''}${inh.lastName}`.trim().toLowerCase();
      const directScore = calculateSimilarity(applicantCleanName, inhFullName);

      // Check first + last name separately
      const firstScore = calculateSimilarity(applicantCleanName, inh.firstName.toLowerCase());
      const lastScore = calculateSimilarity(applicantCleanName, inh.lastName.toLowerCase());

      // If birthdate is provided, check birthdate match
      let birthdateMatched = false;
      if (birthDate && inh.birthDate) {
        const d1 = new Date(birthDate).toISOString().split('T')[0];
        const d2 = new Date(inh.birthDate).toISOString().split('T')[0];
        if (d1 === d2) {
          birthdateMatched = true;
        }
      }

      let totalScore = directScore;
      if (firstScore > 70 && lastScore > 70) {
        totalScore = Math.max(totalScore, 90);
      }

      if (birthdateMatched) {
        totalScore += 15;
      }

      if (totalScore >= 85 && totalScore > highestScore) {
        highestScore = totalScore;
        matchedInhabitant = inh;
      }
    }

    // Step 2: Auto-Approval Decision
    if (matchedInhabitant) {
      // Inhabitant is confirmed in Barangay Census -> Auto-Approve immediately!
      const user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          address: address || `${matchedInhabitant.houseNumber || ''} ${matchedInhabitant.street}, Barangay Onse`.trim(),
          password: hashedPassword,
          role: 'resident',
          isVerified: true, // AUTO-APPROVED!
          avatarUrl: idCardImage || null,
        },
      });

      // Link User to the RBI record
      await prisma.barangayInhabitant.update({
        where: { id: matchedInhabitant.id },
        data: { userId: user.id },
      });

      console.log(`[SmartOnse Register] Resident "${name}" AUTO-APPROVED against RBI: ${matchedInhabitant.rbiNumber}`);

      return NextResponse.json({
        success: true,
        autoApproved: true,
        rbiNumber: matchedInhabitant.rbiNumber,
        message: `Welcome to Barangay Onse! Your record was verified against the official Registry of Inhabitants (${matchedInhabitant.rbiNumber}). Your account is instantly active.`,
      });
    }

    // Step 3: Not yet in pre-existing RBI (Transferee / New Renter / Unlisted)
    // Save as pending verification so Desk Staff can review and enroll in Census
    await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        address: address || null,
        password: hashedPassword,
        role: 'resident',
        isVerified: false, // Pending desk officer verification
        avatarUrl: idCardImage || null,
      },
    });

    console.log(`[SmartOnse Register] Resident "${name}" queued for Desk Officer verification & RBI Census enrollment.`);

    return NextResponse.json({
      success: true,
      autoApproved: false,
      message:
        'Registration submitted! Because your address or details are new to our digital census, your registration and ID have been routed to the Barangay Onse Desk Officer for fast verification and RBI Census enrollment.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
