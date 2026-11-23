import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';
import {
  getPhNowParts,
  phDateStart,
  phDateEnd,
  phMonthStart,
  phMonthEnd,
  shiftPhDateStr,
  formatPhCompactDateTime,
  MONTH_NAMES_SHORT,
  MONTH_NAMES_FULL,
} from '@/lib/ph-time';

export const dynamic = 'force-dynamic';

function parseRequirementsList(raw?: string | null): string[] {
  if (!raw) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Fallback to comma-separated parsing
    }
  }
  return trimmed
    .split(',')
    .map((s) => s.replace(/^["'\[\s]+|["'\]\s]+$/g, '').trim())
    .filter(Boolean);
}

const LEGAL_BASIS_MAP: Record<string, { category: string; legalBasis: string }> = {
  BRGY_CLEARANCE: {
    category: 'Civil & Employment Clearance',
    legalBasis: 'Local Government Code of 1991 (R.A. 7160, Sec. 152)',
  },
  CERT_RESIDENCY: {
    category: 'Residency Verification',
    legalBasis: 'Barangay Registry of Inhabitants (RBI) & Civil Records Guidelines',
  },
  CERT_INDIGENCY: {
    category: 'Social Welfare & Assistance',
    legalBasis: 'R.A. 7160 / Social Welfare Act (Exempt from Fees for Indigent Citizens)',
  },
  FIRST_TIME_JOBSEEKER: {
    category: 'Youth & Pre-Employment Privilege',
    legalBasis: 'First Time Jobseekers Assistance Act (Republic Act No. 11261)',
  },
  BUSINESS_CLEARANCE: {
    category: 'Commercial & Trade Endorsement',
    legalBasis: 'San Juan City Revenue Code & Barangay Onse Ordinance No. 04',
  },
};

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
    const timeframeParam = (searchParams.get('timeframe') || searchParams.get('granularity') || '').toLowerCase();
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    const quarterParam = searchParams.get('quarter');
    const dayParam = searchParams.get('day');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const periodParam = searchParams.get('period') || '';
    const metricParam = (searchParams.get('metric') || '').toLowerCase();

    const phNow = getPhNowParts();

    // Determine timeframe mode
    let mode = timeframeParam;
    if (!mode) {
      if (periodParam.toLowerCase().includes('month')) mode = 'month';
      else if (periodParam.toLowerCase().includes('quarter') || /^q[1-4]/i.test(periodParam)) mode = 'quarter';
      else if (periodParam.toLowerCase().includes('annual') || periodParam.toLowerCase().includes('year')) mode = 'year';
      else if (startDateParam && endDateParam) mode = 'custom';
      else if (dayParam) mode = 'day';
      else mode = 'all'; // Default report shows comprehensive all-time unless filtered
    }

    const selectedYear = yearParam ? parseInt(yearParam, 10) : phNow.year;
    const selectedMonth = monthParam ? parseInt(monthParam, 10) : phNow.month;
    const selectedQuarter = quarterParam ? parseInt(quarterParam, 10) : phNow.quarter;

    let filterStart: Date | null = null;
    let filterEnd: Date | null = null;
    let periodLabel = 'All Time Records';

    if (mode === 'day') {
      const targetDayStr = dayParam || startDateParam || phNow.dateStr;
      filterStart = phDateStart(targetDayStr);
      filterEnd = phDateEnd(targetDayStr);
      periodLabel = `Daily Report: ${targetDayStr} (PHT)`;
    } else if (mode === 'week') {
      const anchorStr = dayParam || startDateParam || phNow.dateStr;
      const dayOfWeek = new Date(`${anchorStr}T12:00:00Z`).getUTCDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      const weekStartStr = shiftPhDateStr(anchorStr, -diffToMonday);
      const weekEndStr = shiftPhDateStr(weekStartStr, 6);

      filterStart = phDateStart(weekStartStr);
      filterEnd = phDateEnd(weekEndStr);
      periodLabel = `Weekly Report: ${weekStartStr} to ${weekEndStr} (PHT)`;
    } else if (mode === 'month') {
      filterStart = phMonthStart(selectedYear, selectedMonth);
      filterEnd = phMonthEnd(selectedYear, selectedMonth);
      periodLabel = `Monthly Report: ${MONTH_NAMES_FULL[selectedMonth - 1]} ${selectedYear}`;
    } else if (mode === 'quarter') {
      const startM = (selectedQuarter - 1) * 3 + 1;
      const endM = startM + 2;
      filterStart = phMonthStart(selectedYear, startM);
      filterEnd = phMonthEnd(selectedYear, endM);
      periodLabel = `Quarterly Report: Q${selectedQuarter} (${MONTH_NAMES_SHORT[startM - 1]} - ${MONTH_NAMES_SHORT[endM - 1]} ${selectedYear})`;
    } else if (mode === 'year') {
      filterStart = phMonthStart(selectedYear, 1);
      filterEnd = phMonthEnd(selectedYear, 12);
      periodLabel = `Annual Fiscal Report: FY ${selectedYear}`;
    } else if (mode === 'custom' && startDateParam && endDateParam) {
      filterStart = phDateStart(startDateParam);
      filterEnd = phDateEnd(endDateParam);
      periodLabel = `Custom Audit Window: ${startDateParam} to ${endDateParam} (PHT)`;
    } else {
      mode = 'all';
      periodLabel = 'Complete Historical Registry (All Time)';
    }

    // Fetch all document types, requests, and registered inhabitants (for Population Reports)
    const [documentTypes, allRequests, allInhabitants] = await Promise.all([
      prisma.documentType.findMany({
        orderBy: { code: 'asc' },
      }),
      prisma.documentRequest.findMany({
        include: {
          documentType: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.barangayInhabitant.findMany({
        include: {
          user: {
            select: {
              id: true,
              isVerified: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    // Filter requests based on time period if set
    const filteredRequests = filterStart && filterEnd
      ? allRequests.filter((r) => {
        const d = new Date(r.createdAt);
        return d >= filterStart! && d <= filterEnd!;
      })
      : allRequests;

    // Aggregate statistics per document type
    const docTypeStats = documentTypes.map((dt) => {
      const docsOfThisType = filteredRequests.filter((r) => r.documentTypeId === dt.id || r.documentType?.code === dt.code);
      const totalRequested = docsOfThisType.length;
      const completed = docsOfThisType.filter((r) => r.status === 'COMPLETED').length;
      const readyForPickup = docsOfThisType.filter((r) => r.status === 'READY_FOR_PICKUP').length;
      const processing = docsOfThisType.filter((r) => r.status === 'PROCESSING').length;
      const pending = docsOfThisType.filter((r) => r.status === 'PENDING').length;
      const rejected = docsOfThisType.filter((r) => r.status === 'REJECTED').length;
      const inProgress = readyForPickup + processing + pending;

      const completionRate = totalRequested > 0 ? Math.round((completed / totalRequested) * 100) : 0;
      const realizedRevenue = (completed + readyForPickup) * dt.fee;
      const potentialRevenue = totalRequested * dt.fee;

      // Calculate free issuances
      const isFreeType = dt.fee === 0;
      const freeCompleted = isFreeType ? completed : 0;
      // Value waived for citizens (for example ₱50 standard value if fee is 0)
      const benchmarkFee = 50.0;
      const waivedValue = isFreeType ? completed * benchmarkFee : 0;

      // Turnaround time calculation
      const completedDurations: number[] = [];
      docsOfThisType.forEach((r) => {
        if (r.status === 'COMPLETED' && r.updatedAt && r.createdAt) {
          const diffHours = (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60);
          completedDurations.push(diffHours);
        }
      });

      const avgTurnaroundHours = completedDurations.length > 0
        ? Math.round(completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length)
        : dt.processingDays * 24;

      const legalInfo = LEGAL_BASIS_MAP[dt.code] || {
        category: 'Official Barangay Certification',
        legalBasis: 'Local Government Code of 1991 (R.A. 7160)',
      };

      return {
        id: dt.id,
        code: dt.code,
        name: dt.name,
        description: dt.description,
        fee: dt.fee,
        feeDisplay: dt.fee === 0 ? 'FREE' : `₱${dt.fee.toFixed(2)}`,
        processingDays: dt.processingDays,
        requirements: parseRequirementsList(dt.requirements),
        category: legalInfo.category,
        legalBasis: legalInfo.legalBasis,
        totalRequested,
        completed,
        readyForPickup,
        processing,
        pending,
        rejected,
        inProgress,
        completionRate,
        realizedRevenue,
        potentialRevenue,
        freeCompleted,
        waivedValue,
        avgTurnaroundHours,
        avgTurnaroundDays: (avgTurnaroundHours / 24).toFixed(1),
      };
    });

    // Sort by highest total requests then completed
    docTypeStats.sort((a, b) => b.totalRequested - a.totalRequested || b.completed - a.completed);

    // Compute Overall Summary
    const totalApplications = filteredRequests.length;
    const totalCompleted = filteredRequests.filter((r) => r.status === 'COMPLETED').length;
    const totalReady = filteredRequests.filter((r) => r.status === 'READY_FOR_PICKUP').length;
    const totalProcessing = filteredRequests.filter((r) => r.status === 'PROCESSING').length;
    const totalPending = filteredRequests.filter((r) => r.status === 'PENDING').length;
    const totalRejected = filteredRequests.filter((r) => r.status === 'REJECTED').length;
    const totalActive = totalReady + totalProcessing + totalPending;

    const overallCompletionRate = totalApplications > 0
      ? Math.round((totalCompleted / totalApplications) * 100)
      : 0;

    const totalRealizedRevenue = docTypeStats.reduce((sum, d) => sum + d.realizedRevenue, 0);
    const totalWaivedRevenue = docTypeStats.reduce((sum, d) => sum + d.waivedValue, 0);
    const totalFreeGrants = docTypeStats.reduce((sum, d) => sum + d.freeCompleted, 0);

    // Turnaround for overall completed
    const allDurations: number[] = [];
    filteredRequests.forEach((r) => {
      if (r.status === 'COMPLETED' && r.updatedAt && r.createdAt) {
        const diffDays = (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        allDurations.push(diffDays);
      }
    });

    const avgTurnaroundDays = allDurations.length > 0
      ? (allDurations.reduce((a, b) => a + b, 0) / allDurations.length).toFixed(1)
      : '1.0';

    // Itemized completed records for official log sheet & print export
    const completedRecords = filteredRequests
      .filter((r) => r.status === 'COMPLETED' || r.status === 'READY_FOR_PICKUP')
      .map((r) => {
        const dtFee = r.documentType?.fee ?? 0;
        const diffDays = r.updatedAt && r.createdAt
          ? ((new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)).toFixed(1)
          : '1.0';

        return {
          id: r.id,
          trackingNumber: r.trackingNumber,
          applicant: r.fullName,
          documentCode: r.documentType?.code || 'DOC',
          documentName: r.documentType?.name || 'Certificate',
          purpose: r.purpose,
          fee: dtFee,
          feeDisplay: dtFee === 0 ? 'FREE' : `₱${dtFee.toFixed(2)}`,
          feeStatus: dtFee === 0 ? 'FREE' : 'PAID',
          dateFiled: formatPhCompactDateTime(r.createdAt),
          dateCompleted: formatPhCompactDateTime(r.updatedAt ?? r.createdAt),
          turnaroundDays: `${diffDays} days`,
          status: r.status,
          remarks: r.remarks || 'Officially verified and released.',
        };
      });

    // Optional metric-specific source records for drill-down audit
    let sourceRecords: Array<{
      id: string;
      trackingNumber: string;
      applicant: string;
      contactNumber: string;
      documentCode: string;
      documentName: string;
      purpose: string;
      fee: number;
      feeDisplay: string;
      status: string;
      dateFiled: string;
      dateCompleted: string;
      turnaroundDays: string;
      remarks: string;
    }> | undefined;

    if (metricParam) {
      const matched = filteredRequests.filter((r) => {
        const dtFee = r.documentType?.fee ?? 0;
        switch (metricParam) {
          case 'total-filed':
            return true;
          case 'completed':
            return r.status === 'COMPLETED';
          case 'pending':
            return r.status === 'PENDING';
          case 'ready':
            return r.status === 'READY_FOR_PICKUP';
          case 'in-progress':
            return r.status === 'READY_FOR_PICKUP' || r.status === 'PROCESSING' || r.status === 'PENDING';
          case 'revenue':
            return (r.status === 'COMPLETED' || r.status === 'READY_FOR_PICKUP') && dtFee > 0;
          case 'free-issuances':
            return r.status === 'COMPLETED' && dtFee === 0;
          case 'turnaround':
            return r.status === 'COMPLETED' && Boolean(r.updatedAt && r.createdAt);
          default:
            return true;
        }
      });

      sourceRecords = matched.map((r) => {
        const dtFee = r.documentType?.fee ?? 0;
        const diffDays = r.updatedAt && r.createdAt
          ? ((new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)).toFixed(2)
          : '0.00';
        return {
          id: r.id,
          trackingNumber: r.trackingNumber,
          applicant: r.fullName,
          contactNumber: r.contactNumber || 'Unprovided',
          documentCode: r.documentType?.code || 'DOC',
          documentName: r.documentType?.name || 'Certificate',
          purpose: r.purpose,
          fee: dtFee,
          feeDisplay: dtFee === 0 ? 'FREE' : `₱${dtFee.toFixed(2)}`,
          status: r.status,
          dateFiled: formatPhCompactDateTime(r.createdAt),
          dateCompleted: formatPhCompactDateTime(r.updatedAt ?? r.createdAt),
          turnaroundDays: `${diffDays} d`,
          remarks: r.remarks || '',
        };
      });
    }

    // Compile Population Report from BarangayInhabitant & Resident Registrations
    const totalPopulation = allInhabitants.length;
    let votersCount = 0;
    let nonVotersCount = 0;
    let homeownersCount = 0;
    let rentersCount = 0;
    let relativesCount = 0;
    let boardersCount = 0;
    let maleCount = 0;
    let femaleCount = 0;
    let youthUnder18 = 0;
    let youngAdults18To30 = 0;
    let adults31To59 = 0;
    let seniors60Plus = 0;
    let singleCount = 0;
    let marriedCount = 0;
    let widowedCount = 0;
    let separatedCount = 0;
    let seniorSectorCount = 0;
    let pwdCount = 0;
    let soloParentCount = 0;
    let fourPsCount = 0;
    let studentsCount = 0;
    let employedCount = 0;

    const populationRecords = allInhabitants.map((inh) => {
      if (inh.isRegisteredVoter) votersCount++;
      else nonVotersCount++;

      const roleLower = (inh.householdRole || '').toLowerCase();
      let housingCategory = 'Homeowner (May-ari ng Bahay)';
      if (roleLower.includes('rent') || roleLower.includes('tenant') || roleLower.includes('upa')) {
        rentersCount++;
        housingCategory = 'Renter / Tenant (Nangungupahan)';
      } else if (roleLower.includes('boarder') || roleLower.includes('dorm')) {
        boardersCount++;
        housingCategory = 'Boarder / Student Dorm';
      } else if (roleLower.includes('relative') || roleLower.includes('nakikitira') || roleLower === 'child' || roleLower === 'member') {
        relativesCount++;
        housingCategory = 'Living with Relatives / Family Member';
      } else {
        homeownersCount++;
        housingCategory = 'Homeowner (May-ari ng Bahay)';
      }

      if ((inh.sex || '').toLowerCase() === 'female') femaleCount++;
      else maleCount++;

      const age = inh.age || 25;
      if (age < 18) youthUnder18++;
      else if (age <= 30) youngAdults18To30++;
      else if (age <= 59) adults31To59++;
      else seniors60Plus++;

      const cs = (inh.civilStatus || 'Single').toLowerCase();
      if (cs.includes('marri')) marriedCount++;
      else if (cs.includes('widow')) widowedCount++;
      else if (cs.includes('separat') || cs.includes('annul')) separatedCount++;
      else singleCount++;

      const isSenior = Boolean(inh.isSeniorCitizen) || age >= 60;
      if (isSenior) seniorSectorCount++;
      if (inh.isPwd) pwdCount++;
      if (inh.isSoloParent) soloParentCount++;
      if (inh.is4psBeneficiary) fourPsCount++;

      const emp = (inh.employmentStatus || '').toLowerCase();
      if (emp.includes('student')) studentsCount++;
      else if (emp.includes('employ') || emp.includes('ofw')) employedCount++;

      const sectors: string[] = [];
      if (inh.isRegisteredVoter) sectors.push('Voter');
      else sectors.push('Non-Voter');
      if (isSenior) sectors.push('Senior Citizen');
      if (inh.isPwd) sectors.push('PWD');
      if (inh.isSoloParent) sectors.push('Solo Parent');
      if (inh.is4psBeneficiary) sectors.push('4Ps');

      return {
        id: inh.id,
        rbiNumber: inh.rbiNumber,
        fullName: `${inh.firstName} ${inh.middleName ? inh.middleName + ' ' : ''}${inh.lastName}${inh.suffix ? ' ' + inh.suffix : ''}`.trim(),
        age,
        sex: inh.sex || 'Male',
        civilStatus: inh.civilStatus || 'Single',
        housingStatus: housingCategory,
        rawHouseholdRole: inh.householdRole,
        isRegisteredVoter: inh.isRegisteredVoter,
        employmentStatus: inh.employmentStatus || 'Specified',
        yearsOfResidency: inh.yearsOfResidency || 1,
        address: `${inh.houseNumber ? inh.houseNumber + ' ' : ''}${inh.street}`.trim(),
        sectors,
        hasPortalAccount: Boolean(inh.userId),
        isVerified: inh.user ? Boolean(inh.user.isVerified) : true,
        registeredAt: formatPhCompactDateTime(inh.createdAt),
      };
    });

    // Service Performance SLA & Satisfaction Metrics
    const ratedRequests = filteredRequests.filter((r) => typeof r.rating === 'number' && r.rating > 0);
    const avgSatisfactionRating = ratedRequests.length > 0
      ? (ratedRequests.reduce((sum, r) => sum + (r.rating || 5), 0) / ratedRequests.length).toFixed(2)
      : '4.90';
    const slaCompliantCount = filteredRequests.filter((r) => {
      if (r.status !== 'COMPLETED' || !r.updatedAt || !r.createdAt) return false;
      const actualDays = (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const targetDays = r.documentType?.processingDays || 2;
      return actualDays <= targetDays + 0.5;
    }).length;
    const slaComplianceRate = totalCompleted > 0
      ? Math.min(100, Math.round((slaCompliantCount / totalCompleted) * 100))
      : 100;

    return NextResponse.json({
      success: true,
      reportMetadata: {
        barangayName: 'Barangay Onse',
        city: 'City of San Juan, Metro Manila',
        office: 'Office of the Punong Barangay - Civil Registry & Public Records',
        generatedAt: new Date().toISOString(),
        generatedBy: sessionUser.name,
        userRole: sessionUser.role,
        periodLabel,
        timeframe: mode,
      },
      summary: {
        totalApplications,
        totalCompleted,
        totalReady,
        totalProcessing,
        totalPending,
        totalActive,
        totalRejected,
        overallCompletionRate,
        totalRealizedRevenue,
        totalWaivedRevenue,
        totalFreeGrants,
        avgTurnaroundDays,
        totalCatalogedDocuments: documentTypes.length,
        slaComplianceRate,
        avgSatisfactionRating,
        ratedCount: ratedRequests.length,
      },
      populationReport: {
        totalPopulation,
        votersCount,
        nonVotersCount,
        voterPercentage: totalPopulation > 0 ? Math.round((votersCount / totalPopulation) * 100) : 0,
        housingBreakdown: {
          homeowners: homeownersCount,
          renters: rentersCount,
          livingWithRelatives: relativesCount,
          boarders: boardersCount,
        },
        genderBreakdown: {
          male: maleCount,
          female: femaleCount,
        },
        ageGroups: {
          youthUnder18,
          youngAdults18To30,
          adults31To59,
          seniors60Plus,
        },
        civilStatusBreakdown: {
          single: singleCount,
          married: marriedCount,
          widowed: widowedCount,
          separated: separatedCount,
        },
        sectoralBreakdown: {
          seniorCitizens: seniorSectorCount,
          pwd: pwdCount,
          soloParents: soloParentCount,
          fourPs: fourPsCount,
          students: studentsCount,
          employed: employedCount,
        },
        records: populationRecords,
      },
      documents: docTypeStats,
      completedRecords,
      ...(sourceRecords !== undefined ? { sourceRecords } : {}),
    });
  } catch (error) {
    console.error('Failed to generate report analytics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while compiling report analytics.' },
      { status: 500 }
    );
  }
}

