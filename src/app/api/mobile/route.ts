import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, hashPassword, createSessionToken } from '@/lib/auth';
import { normalizeRole } from '@/lib/rbac';
import { getNextSequentialTrackingNumber } from '@/lib/tracking';
import { createNotification } from '@/lib/notifications';
import { formatPhDateTime } from '@/lib/ph-time';
import { getClientIp } from '@/lib/rate-limit';

const ROLE_TITLES: Record<string, string> = {
  super_admin: 'Super Admin',
  barangay_captain: 'Punong Barangay (Captain)',
  barangay_councilor: 'Barangay Kagawad',
  sk_chairperson: 'SK Chairperson',
  sk_councilor: 'SK Kagawad',
  staff: 'Barangay Desk Staff',
  resident: 'Verified Resident',
};

/**
 * GET /api/mobile
 * Unified Mobile Database Endpoint for the Native Kotlin Android App:
 * - ?action=sync -> Fetches live Officials, Services, Transparency Docs, SK Programs, Events, and Recent Requests from PostgreSQL
 * - ?action=track&code=ONSE-... -> Live tracking lookup from PostgreSQL DocumentRequest table
 * - ?action=dashboard&email=...&role=... -> Live Resident / Admin Full System Dashboard data (requests queue, unverified users, RBI inhabitants, audit logs)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = (searchParams.get('action') || 'sync').toLowerCase();

    if (action === 'track') {
      const code = (searchParams.get('code') || '').trim().toUpperCase();
      if (!code) {
        return NextResponse.json({ error: 'Tracking number is required.' }, { status: 400 });
      }

      const docReq = await prisma.documentRequest.findFirst({
        where: { trackingNumber: code },
        include: { documentType: true },
      });

      if (!docReq) {
        return NextResponse.json({ error: 'Tracking number not found in database.' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        record: {
          id: docReq.id,
          trackingNumber: docReq.trackingNumber,
          applicantName: docReq.fullName,
          contactNumber: docReq.contactNumber,
          address: docReq.address,
          documentType: docReq.documentType.name,
          purpose: docReq.purpose,
          copies: 1,
          fee: docReq.documentType.fee === 0 ? 'FREE' : `₱${docReq.documentType.fee.toFixed(2)}`,
          status: docReq.status.replace(/_/g, ' '),
          filedDate: formatPhDateTime(docReq.createdAt),
          remarks:
            docReq.remarks ||
            (docReq.status === 'READY_FOR_PICKUP'
              ? 'Approved and stamped with Official Barangay Seal. Please claim at Window 2 with 1 Valid ID.'
              : docReq.status === 'PROCESSING'
              ? 'Step 2 of 4: Barangay Desk Officer verification in progress.'
              : docReq.status === 'COMPLETED'
              ? 'Step 4 of 4: Document claimed by applicant at Barangay Onse Hall.'
              : 'Step 1 of 4: Application received in Barangay Onse database and queued for desk verification.'),
        },
      });
    }

    if (action === 'dashboard') {
      const email = (searchParams.get('email') || '').trim().toLowerCase();
      const role = (searchParams.get('role') || 'resident').toLowerCase();
      const isStaffOrAdmin =
        role.includes('admin') ||
        role.includes('captain') ||
        role.includes('councilor') ||
        role.includes('kagawad') ||
        role.includes('sk') ||
        role.includes('staff');

      const [allRequests, myUser, unverifiedUsers, rbiList, auditLogs, counts] = await Promise.all([
        prisma.documentRequest.findMany({
          take: 25,
          orderBy: { createdAt: 'desc' },
          include: { documentType: true },
        }),
        email ? prisma.user.findUnique({ where: { email }, include: { inhabitant: true } }) : Promise.resolve(null),
        isStaffOrAdmin
          ? prisma.user.findMany({
              where: { isVerified: false },
              take: 15,
              orderBy: { createdAt: 'desc' },
              select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true },
            })
          : Promise.resolve([]),
        isStaffOrAdmin
          ? prisma.barangayInhabitant.findMany({
              take: 15,
              orderBy: { rbiNumber: 'asc' },
            })
          : Promise.resolve([]),
        isStaffOrAdmin
          ? prisma.auditLog.findMany({
              take: 15,
              orderBy: { timestamp: 'desc' },
            })
          : Promise.resolve([]),
        Promise.all([
          prisma.user.count(),
          prisma.barangayInhabitant.count(),
          prisma.documentRequest.count(),
          prisma.documentRequest.count({ where: { status: 'PENDING' } }),
          prisma.documentRequest.count({ where: { status: 'READY_FOR_PICKUP' } }),
        ]),
      ]);

      const filteredRequests = isStaffOrAdmin
        ? allRequests
        : allRequests.filter(
            (r) =>
              (myUser && r.userId === myUser.id) ||
              (email && r.email?.toLowerCase() === email) ||
              (myUser && r.fullName.toLowerCase() === myUser.name.toLowerCase())
          );

      return NextResponse.json({
        success: true,
        isStaffOrAdmin,
        metrics: {
          totalUsers: counts[0],
          totalRbiInhabitants: counts[1],
          totalRequests: counts[2],
          pendingRequests: counts[3],
          readyForPickupRequests: counts[4],
        },
        userProfile: myUser
          ? {
              id: myUser.id,
              name: myUser.name,
              email: myUser.email,
              phone: myUser.phone || '0917-123-4567',
              address: myUser.address || 'Barangay Onse, San Juan City',
              role: myUser.role,
              isVerified: myUser.isVerified,
              rbiNumber: myUser.inhabitant?.rbiNumber || 'RBI-2024-00001',
              precinct: myUser.inhabitant?.precinct || 'PRECINCT-0042A',
            }
          : null,
        requests: (filteredRequests.length > 0 ? filteredRequests : allRequests.slice(0, 8)).map((r) => ({
          id: r.id,
          trackingNumber: r.trackingNumber,
          applicantName: r.fullName,
          contactNumber: r.contactNumber,
          address: r.address,
          documentType: r.documentType.name,
          purpose: r.purpose,
          fee: r.documentType.fee === 0 ? 'FREE' : `₱${r.documentType.fee.toFixed(2)}`,
          status: r.status,
          filedDate: formatPhDateTime(r.createdAt),
          remarks: r.remarks || 'Synced with Barangay Onse PostgreSQL Database',
        })),
        unverifiedUsers,
        rbiList: rbiList.map((inh) => ({
          id: inh.id,
          rbiNumber: inh.rbiNumber,
          fullName: `${inh.firstName} ${inh.middleName ? inh.middleName + ' ' : ''}${inh.lastName}`,
          age: inh.age,
          sex: inh.sex,
          address: `${inh.houseNumber || ''} ${inh.street}, Barangay Onse`.trim(),
          precinct: inh.precinct || 'N/A',
          occupation: inh.occupation || 'Resident',
          isVoter: inh.isRegisteredVoter,
        })),
        auditLogs: auditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          actor: log.actor,
          details: log.details,
          timestamp: formatPhDateTime(log.timestamp),
        })),
      });
    }

    // Default: ?action=sync
    const [officials, docTypes, transparencyDocs, skPrograms, events, recentRequests] = await Promise.all([
      prisma.barangayOfficial.findMany({ orderBy: { order: 'asc' } }),
      prisma.documentType.findMany({ where: { isActive: true } }),
      prisma.transparencyDocument.findMany({ orderBy: { year: 'desc' } }),
      prisma.skProgram.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.event.findMany({ orderBy: { eventDate: 'asc' } }),
      prisma.documentRequest.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: { documentType: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      officials,
      docTypes,
      transparencyDocs,
      skPrograms,
      events,
      recentRequests: recentRequests.map((r) => ({
        id: r.id,
        trackingNumber: r.trackingNumber,
        applicantName: r.fullName,
        contactNumber: r.contactNumber,
        address: r.address,
        documentType: r.documentType.name,
        purpose: r.purpose,
        copies: 1,
        fee: r.documentType.fee === 0 ? 'FREE' : `₱${r.documentType.fee.toFixed(2)}`,
        status: r.status.replace(/_/g, ' '),
        filedDate: formatPhDateTime(r.createdAt),
        remarks:
          r.remarks ||
          (r.status === 'READY_FOR_PICKUP'
            ? 'Signed by Punong Barangay Roberto B. Alba. Ready for pickup at Window 2.'
            : 'Synced live from SmartOnse PostgreSQL Database.'),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database sync failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/mobile
 * Handles live database mutations from the Native Kotlin Android App:
 * - action: "login" (Direct database credential verification without email OTP friction for mobile app)
 * - action: "demo_login" (1-click database demo account login)
 * - action: "register" (Create new Resident account + ConsentRecord + AuditLog in PostgreSQL)
 * - action: "submit_request" (Create real DocumentRequest + Notification + AuditLog in PostgreSQL)
 * - action: "update_request_status" (Admin/Staff status transition in PostgreSQL + AuditLog)
 * - action: "verify_user" (Admin/Staff resident verification in PostgreSQL + AuditLog)
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '').toLowerCase();

    // 1. LIVE DATABASE LOGIN
    if (action === 'login') {
      const identifier = String(body.email || body.identifier || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!identifier || !password) {
        return NextResponse.json({ error: 'Email/mobile and password are required.' }, { status: 400 });
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
        },
      });

      if (!user || !user.password) {
        return NextResponse.json({ error: 'Account not found in SmartOnse database.' }, { status: 401 });
      }

      const valid = await comparePassword(password, user.password);
      if (!valid) {
        await prisma.auditLog.create({
          data: {
            action: 'MOBILE_LOGIN_FAILED',
            actor: identifier,
            details: 'Invalid password on SmartOnse Android App.',
            ip,
          },
        });
        return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
      }

      const role = normalizeRole(user.role);
      const roleTitle = ROLE_TITLES[role] || 'Verified Resident';
      const token = await createSessionToken({
        id: user.id,
        name: user.name,
        email: user.email || identifier,
        role,
        roleTitle,
        destination: '/portal',
      });

      await prisma.auditLog.create({
        data: {
          action: 'MOBILE_USER_LOGIN',
          actor: `${user.name} (${user.email || identifier})`,
          details: `Signed in via SmartOnse Native Android App as ${roleTitle}.`,
          ip,
        },
      });

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email || identifier,
          phone: user.phone || '0917-123-4567',
          address: user.address || 'Barangay Onse, San Juan City',
          role,
          roleTitle,
          isVerified: user.isVerified,
        },
      });
    }

    // 2. LIVE DATABASE 1-CLICK DEMO ROLE SWITCH
    if (action === 'demo_login') {
      const roleKey = String(body.roleId || 'resident').toLowerCase();
      const emailMap: Record<string, string> = {
        resident: 'juan@onse.ph',
        captain: 'captain@onse.gov.ph',
        kagawad: 'kagawad@onse.gov.ph',
        sk: 'sk@onse.gov.ph',
        staff: 'records@onse.gov.ph',
      };
      const targetEmail = emailMap[roleKey] || 'juan@onse.ph';

      let user = await prisma.user.findUnique({ where: { email: targetEmail } });
      if (!user) {
        const hashedPassword = await hashPassword('password123');
        user = await prisma.user.create({
          data: {
            name: roleKey === 'captain' ? 'Hon. Roberto B. Alba' : 'Juan Dela Cruz',
            email: targetEmail,
            password: hashedPassword,
            role: roleKey === 'captain' ? 'barangay_captain' : 'resident',
            isVerified: true,
            address: 'Barangay Onse, San Juan City',
          },
        });
      }

      const role = normalizeRole(user.role);
      const roleTitle = ROLE_TITLES[role] || 'Verified Resident';
      const token = await createSessionToken({
        id: user.id,
        name: user.name,
        email: user.email || targetEmail,
        role,
        roleTitle,
        destination: '/portal',
      });

      await prisma.auditLog.create({
        data: {
          action: 'MOBILE_ROLE_SWITCH',
          actor: `${user.name} (${roleTitle})`,
          details: `Switched active role on SmartOnse Android App to ${roleTitle}.`,
          ip,
        },
      });

      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email || targetEmail,
          phone: user.phone || '0917-123-4567',
          address: user.address || 'Barangay Onse, San Juan City',
          role,
          roleTitle,
          isVerified: user.isVerified,
        },
      });
    }

    // 3. LIVE DATABASE RESIDENT REGISTRATION (With R.A. 10173 ConsentRecord)
    if (action === 'register') {
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const phone = String(body.phone || '').trim();
      const address = String(body.address || '').trim();
      const password = String(body.password || '');

      if (!name || !email || !password || password.length < 6) {
        return NextResponse.json(
          { error: 'Full name, valid email, and password (6+ chars) are required.' },
          { status: 400 }
        );
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          phone: phone || '0917-000-0000',
          address: address || 'Barangay Onse, San Juan City',
          password: hashedPassword,
          role: 'resident',
          isVerified: true,
        },
      });

      await Promise.all([
        prisma.consentRecord.create({
          data: {
            userId: newUser.id,
            name: newUser.name,
            email: newUser.email,
            consentType: 'REGISTRATION',
            granted: true,
            ipAddress: ip,
            userAgent: 'SmartOnse-Android-Native/2.0',
          },
        }),
        prisma.auditLog.create({
          data: {
            action: 'MOBILE_USER_REGISTERED',
            actor: `${newUser.name} (${newUser.email})`,
            details: `New resident account registered via SmartOnse Android App with R.A. 10173 Data Privacy consent.`,
            ip,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          address: newUser.address,
          role: 'resident',
          roleTitle: 'Verified Resident',
        },
      });
    }

    // 4. LIVE DATABASE DOCUMENT REQUEST SUBMISSION
    if (action === 'submit_request') {
      const fullName = String(body.fullName || '').trim();
      const contactNumber = String(body.contactNumber || '').trim();
      const address = String(body.address || '').trim();
      const purpose = String(body.purpose || '').trim();
      const documentTitleOrCode = String(body.documentType || 'BRGY_CLEARANCE').trim();
      const copies = Math.min(10, Math.max(1, Number(body.copies) || 1));
      const email = String(body.email || '').trim().toLowerCase() || null;

      if (!fullName || !contactNumber || !address || !purpose) {
        return NextResponse.json({ error: 'All applicant fields are required.' }, { status: 400 });
      }

      const allDocTypes = await prisma.documentType.findMany();
      const matchedDocType =
        allDocTypes.find(
          (d) =>
            d.code.toLowerCase() === documentTitleOrCode.toLowerCase() ||
            d.name.toLowerCase().includes(documentTitleOrCode.toLowerCase()) ||
            documentTitleOrCode.toLowerCase().includes(d.name.toLowerCase())
        ) || allDocTypes[0];

      if (!matchedDocType) {
        return NextResponse.json({ error: 'No active document types configured in database.' }, { status: 500 });
      }

      const [trackingNumber] = await getNextSequentialTrackingNumber(1);
      const userRecord = email ? await prisma.user.findUnique({ where: { email } }) : null;

      const created = await prisma.documentRequest.create({
        data: {
          trackingNumber,
          documentTypeId: matchedDocType.id,
          userId: userRecord?.id || null,
          fullName,
          contactNumber,
          email,
          address,
          purpose: copies > 1 ? `${purpose} (${copies} Copies)` : purpose,
          status: 'PENDING',
          remarks: `Submitted via SmartOnse Native Android App (${copies} ${copies === 1 ? 'copy' : 'copies'}).`,
        },
        include: { documentType: true },
      });

      const totalFee = matchedDocType.fee * copies;
      const feeDisplay = totalFee === 0 ? 'FREE' : `₱${totalFee.toFixed(2)}`;

      await Promise.all([
        createNotification({
          title: `Mobile App Request (#${created.trackingNumber})`,
          description: `${fullName} requested ${copies}x ${matchedDocType.name} via SmartOnse Android App.`,
          type: 'request',
          targetRole: 'admin',
          href: '/admin/requests',
        }),
        prisma.auditLog.create({
          data: {
            action: 'MOBILE_DOCUMENT_REQUEST_CREATED',
            actor: `${fullName} (${email || contactNumber})`,
            details: `Created DocumentRequest #${created.trackingNumber} for ${copies}x ${matchedDocType.name} (${feeDisplay}).`,
            ip,
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        trackingNumber: created.trackingNumber,
        documentType: created.documentType.name,
        feeDisplay,
        status: 'PENDING',
        filedDate: formatPhDateTime(created.createdAt),
        remarks: created.remarks,
      });
    }

    // 5. LIVE DATABASE ADMIN/STAFF STATUS TRANSITION
    if (action === 'update_request_status') {
      const trackingNumber = String(body.trackingNumber || '').trim().toUpperCase();
      const newStatus = String(body.status || 'PROCESSING').trim().toUpperCase();
      const actor = String(body.actor || 'Barangay Admin (Mobile App)');
      const customRemarks = String(body.remarks || '').trim();

      const existing = await prisma.documentRequest.findUnique({
        where: { trackingNumber },
        include: { documentType: true },
      });

      if (!existing) {
        return NextResponse.json({ error: 'Document request not found.' }, { status: 404 });
      }

      const defaultRemarks: Record<string, string> = {
        PENDING: 'Application queued for Barangay Desk verification.',
        PROCESSING: 'Step 2 of 4: Verified by Barangay Desk Officer. Forwarded to Punong Barangay for signature.',
        READY_FOR_PICKUP: 'Step 3 of 4: Signed by Punong Barangay Roberto B. Alba & stamped with Official Seal. Ready for pickup at Window 2.',
        COMPLETED: 'Step 4 of 4: Document released and claimed by applicant at Barangay Onse Hall.',
        REJECTED: 'Application returned: Please bring complete documentary requirements to Barangay Onse Desk.',
      };

      const updated = await prisma.documentRequest.update({
        where: { trackingNumber },
        data: {
          status: newStatus,
          remarks: customRemarks || defaultRemarks[newStatus] || existing.remarks,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: 'DOCUMENT_STATUS_UPDATED',
          actor,
          details: `Updated #${trackingNumber} (${existing.documentType.name}) status from ${existing.status} to ${newStatus} via Android App.`,
          ip,
        },
      });

      return NextResponse.json({
        success: true,
        trackingNumber: updated.trackingNumber,
        status: updated.status,
        remarks: updated.remarks,
      });
    }

    // 6. LIVE DATABASE ADMIN RESIDENT VERIFICATION
    if (action === 'verify_user') {
      const userId = String(body.userId || '').trim();
      const actor = String(body.actor || 'Barangay Admin (Mobile App)');

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });

      await prisma.auditLog.create({
        data: {
          action: 'USER_VERIFIED',
          actor,
          details: `Verified resident account for ${updatedUser.name} (${updatedUser.email}) via SmartOnse Android App.`,
          ip,
        },
      });

      return NextResponse.json({
        success: true,
        userId: updatedUser.id,
        name: updatedUser.name,
      });
    }

    return NextResponse.json({ error: `Unsupported mobile action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database operation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
