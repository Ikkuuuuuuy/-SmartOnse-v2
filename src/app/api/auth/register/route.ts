import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateSimilarity } from '@/lib/idScanner';
import { hashPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      name,
      firstName: rawFirstName,
      middleName: rawMiddleName,
      lastName: rawLastName,
      email,
      phone,
      address,
      password,
      birthDate,
      gender,
      civilStatus,
      residencyType,
      isHeadOfFamily,
      familyMembersCount,
      yearsOfResidency,
      employmentStatus,
      isRegisteredVoter,
      isSeniorCitizen,
      isPwd,
      isSoloParent,
      is4psBeneficiary,
      idType,
      idCardImage,
    } = body;

    const cleanFirst = typeof rawFirstName === 'string' ? rawFirstName.trim() : '';
    const cleanMiddle = typeof rawMiddleName === 'string' ? rawMiddleName.trim() : '';
    const cleanLast = typeof rawLastName === 'string' ? rawLastName.trim() : '';
    const combinedName =
      cleanFirst && cleanLast
        ? [cleanFirst, cleanMiddle, cleanLast].filter(Boolean).join(' ')
        : typeof name === 'string'
        ? name.trim()
        : '';

    if (!combinedName || !phone || !password || typeof phone !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Last name, first name, mobile phone number, and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { error: 'Password must be between 8 and 128 characters.' },
        { status: 400 }
      );
    }

    if (combinedName.length > 120) {
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

    const applicantCleanName = combinedName.toLowerCase();

    for (const inh of activeInhabitants) {
      const inhFullName = `${inh.firstName} ${inh.middleName ? inh.middleName + ' ' : ''}${inh.lastName}`.trim().toLowerCase();
      const directScore = calculateSimilarity(applicantCleanName, inhFullName);

      // Check first + last name separately
      const firstScore = calculateSimilarity(cleanFirst ? cleanFirst.toLowerCase() : applicantCleanName, inh.firstName.toLowerCase());
      const lastScore = calculateSimilarity(cleanLast ? cleanLast.toLowerCase() : applicantCleanName, inh.lastName.toLowerCase());

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

    // Parse demographic & census fields for Population Reports
    const parsedDob = birthDate ? new Date(birthDate) : new Date('1998-01-01');
    const safeDob = isNaN(parsedDob.getTime()) ? new Date('1998-01-01') : parsedDob;
    const computedAge = Math.max(1, Math.floor((Date.now() - safeDob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
    const safeSex = gender === 'Female' ? 'Female' : 'Male';
    const safeCivilStatus = typeof civilStatus === 'string' && civilStatus.trim() ? civilStatus.trim() : 'Single';
    const safeResidencyType = typeof residencyType === 'string' && residencyType.trim()
      ? residencyType.trim()
      : 'Homeowner / Permanent Resident';
    const safeIsHead = Boolean(isHeadOfFamily);
    const safeFamilyCount = Math.min(30, Math.max(1, Number(familyMembersCount) || 1));
    const encodedHouseholdRole = `${safeIsHead ? 'Head' : 'Member'} | ${safeResidencyType} | Family:${safeFamilyCount}`;
    const safeYears = typeof yearsOfResidency === 'number' && yearsOfResidency >= 0
      ? Math.round(yearsOfResidency)
      : 1;
    const safeEmployment = typeof employmentStatus === 'string' && employmentStatus.trim()
      ? employmentStatus.trim()
      : 'Employed';
    const safeVoter = typeof isRegisteredVoter === 'boolean' ? isRegisteredVoter : true;
    const safeSenior = Boolean(isSeniorCitizen) || computedAge >= 60;
    const safePwd = Boolean(isPwd);
    const safeSoloParent = Boolean(isSoloParent);
    const safe4ps = Boolean(is4psBeneficiary);

    // Step 2: Auto-Approval Decision
    if (matchedInhabitant) {
      // Inhabitant is confirmed in Barangay Census -> Auto-Approve immediately!
      const user = await prisma.user.create({
        data: {
          name: combinedName,
          email: cleanEmail,
          phone: cleanPhone,
          address: address || `${matchedInhabitant.houseNumber || ''} ${matchedInhabitant.street}, Barangay Onse`.trim(),
          password: hashedPassword,
          role: 'resident',
          isVerified: true, // AUTO-APPROVED!
          avatarUrl: idCardImage || null,
        },
      });

      // Link User to the RBI record and sync latest census classifications
      await prisma.barangayInhabitant.update({
        where: { id: matchedInhabitant.id },
        data: {
          userId: user.id,
          firstName: cleanFirst || matchedInhabitant.firstName,
          middleName: cleanMiddle || matchedInhabitant.middleName,
          lastName: cleanLast || matchedInhabitant.lastName,
          sex: safeSex,
          civilStatus: safeCivilStatus,
          householdRole: encodedHouseholdRole,
          yearsOfResidency: safeYears,
          employmentStatus: safeEmployment,
          isRegisteredVoter: safeVoter,
          isSeniorCitizen: safeSenior,
          isPwd: safePwd,
          isSoloParent: safeSoloParent,
          is4psBeneficiary: safe4ps,
        },
      });

      const sessionPayload = {
        id: user.id,
        name: user.name,
        email: user.email || user.phone || 'Resident',
        phone: user.phone || undefined,
        role: 'resident',
        roleTitle: 'Verified Resident',
        destination: '/portal/request',
        isVerified: true,
      };
      const token = await createSessionToken(sessionPayload);
      const res = NextResponse.json({
        success: true,
        autoApproved: true,
        rbiNumber: matchedInhabitant.rbiNumber,
        user: {
          ...sessionPayload,
          address: user.address,
          residencyType: safeResidencyType,
        },
        message: `Welcome to Barangay Onse! Your record was verified against the official Registry of Inhabitants (${matchedInhabitant.rbiNumber}). Your account is instantly active.`,
      });
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    // Step 3: Not yet in pre-existing RBI (Transferee / New Renter / Unlisted)
    // Save user and immediately issue browsing session (while document requests wait for admin verification)
    const newUser = await prisma.user.create({
      data: {
        name: combinedName,
        email: cleanEmail,
        phone: cleanPhone,
        address: address || null,
        password: hashedPassword,
        role: 'resident',
        isVerified: false, // Pending desk officer verification for document requests
        avatarUrl: idCardImage || null,
      },
    });

    // Generate next RBI number and record census profile for Population Reports
    const rbiCount = await prisma.barangayInhabitant.count();
    const rbiYear = new Date().getFullYear();
    const generatedRbi = `RBI-${rbiYear}-${String(rbiCount + 10001).slice(-5)}`;
    const nameTokens = combinedName.split(/\s+/);
    const firstName = cleanFirst || nameTokens[0] || 'Resident';
    const middleName = cleanMiddle || null;
    const lastName = cleanLast || (nameTokens.length > 1 ? nameTokens.slice(1).join(' ') : 'Citizen');

    await prisma.barangayInhabitant.create({
      data: {
        rbiNumber: generatedRbi,
        firstName,
        middleName,
        lastName,
        birthDate: safeDob,
        age: computedAge,
        sex: safeSex,
        civilStatus: safeCivilStatus,
        street: (address && address.trim()) || 'Barangay Onse, San Juan City',
        precinct: safeVoter ? 'PRECINCT-0042A' : 'NON-VOTER',
        yearsOfResidency: safeYears,
        householdRole: encodedHouseholdRole,
        employmentStatus: safeEmployment,
        isRegisteredVoter: safeVoter,
        isSeniorCitizen: safeSenior,
        isPwd: safePwd,
        isSoloParent: safeSoloParent,
        is4psBeneficiary: safe4ps,
        status: 'ACTIVE',
        userId: newUser.id,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email || newUser.phone || 'Resident',
      phone: newUser.phone || undefined,
      role: 'resident',
      roleTitle: 'Resident (Pending Verification)',
      destination: '/',
      isVerified: false,
    };
    const token = await createSessionToken(sessionPayload);
    const res = NextResponse.json({
      success: true,
      autoApproved: false,
      rbiNumber: generatedRbi,
      user: {
        ...sessionPayload,
        address: newUser.address,
        residencyType: safeResidencyType,
      },
      message:
        'Registration complete! You are now signed in and may browse the SmartOnse portal immediately. Document requests will unlock once the Barangay Admin verifies your uploaded ID.',
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
