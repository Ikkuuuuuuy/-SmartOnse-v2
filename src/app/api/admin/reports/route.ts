import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

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

    // Determine timeframe mode
    let mode = timeframeParam;
    if (!mode) {
      if (periodParam.includes('August') || periodParam.toLowerCase() === 'month') mode = 'month';
      else if (periodParam.includes('Q3') || periodParam.includes('Quarter') || periodParam.toLowerCase() === 'quarter') mode = 'quarter';
      else if (periodParam.includes('Annual') || periodParam.toLowerCase() === 'year') mode = 'year';
      else if (startDateParam && endDateParam) mode = 'custom';
      else if (dayParam) mode = 'day';
      else mode = 'all'; // Default report shows comprehensive all-time unless filtered
    }

    const selectedYear = yearParam ? parseInt(yearParam, 10) : 2026;
    const selectedMonth = monthParam ? parseInt(monthParam, 10) : 8; // Aug default
    const selectedQuarter = quarterParam ? parseInt(quarterParam, 10) : 3;

    const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let filterStart: Date | null = null;
    let filterEnd: Date | null = null;
    let periodLabel = 'All Time Records';

    if (mode === 'day') {
      const targetDayStr = dayParam || (startDateParam || '2026-08-28');
      filterStart = new Date(`${targetDayStr}T00:00:00.000Z`);
      filterEnd = new Date(`${targetDayStr}T23:59:59.999Z`);
      periodLabel = `Daily Report: ${targetDayStr}`;
    } else if (mode === 'week') {
      const baseDate = startDateParam ? new Date(startDateParam) : new Date('2026-08-28T00:00:00.000Z');
      const dayOfWeek = baseDate.getUTCDay();
      const diffToMonday = (dayOfWeek + 6) % 7;
      filterStart = new Date(baseDate);
      filterStart.setUTCDate(baseDate.getUTCDate() - diffToMonday);
      filterStart.setUTCHours(0, 0, 0, 0);

      filterEnd = new Date(filterStart);
      filterEnd.setUTCDate(filterStart.getUTCDate() + 6);
      filterEnd.setUTCHours(23, 59, 59, 999);
      periodLabel = `Weekly Report: ${filterStart.toISOString().slice(0, 10)} to ${filterEnd.toISOString().slice(0, 10)}`;
    } else if (mode === 'month') {
      filterStart = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0));
      filterEnd = new Date(Date.UTC(selectedYear, selectedMonth, 0, 23, 59, 59, 999));
      periodLabel = `Monthly Report: ${MONTH_NAMES_FULL[selectedMonth - 1]} ${selectedYear}`;
    } else if (mode === 'quarter') {
      const startM = (selectedQuarter - 1) * 3;
      const endM = startM + 2;
      filterStart = new Date(Date.UTC(selectedYear, startM, 1, 0, 0, 0));
      filterEnd = new Date(Date.UTC(selectedYear, endM + 1, 0, 23, 59, 59, 999));
      periodLabel = `Quarterly Report: Q${selectedQuarter} (${MONTH_NAMES_SHORT[startM]} - ${MONTH_NAMES_SHORT[endM]} ${selectedYear})`;
    } else if (mode === 'year') {
      filterStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0));
      filterEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));
      periodLabel = `Annual Fiscal Report: FY ${selectedYear}`;
    } else if (mode === 'custom' && startDateParam && endDateParam) {
      filterStart = new Date(`${startDateParam}T00:00:00.000Z`);
      filterEnd = new Date(`${endDateParam}T23:59:59.999Z`);
      periodLabel = `Custom Audit Window: ${startDateParam} to ${endDateParam}`;
    } else {
      mode = 'all';
      periodLabel = 'Complete Historical Registry (All Time)';
    }

    // Fetch all document types and requests
    const [documentTypes, allRequests] = await Promise.all([
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
        requirements: dt.requirements ? dt.requirements.split(',').map((s) => s.trim()) : [],
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
          dateFiled: r.createdAt.toISOString().slice(0, 10),
          dateCompleted: r.updatedAt ? r.updatedAt.toISOString().slice(0, 10) : r.createdAt.toISOString().slice(0, 10),
          turnaroundDays: `${diffDays} days`,
          status: r.status,
          remarks: r.remarks || 'Officially verified and released.',
        };
      });

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
      },
      documents: docTypeStats,
      completedRecords,
    });
  } catch (error) {
    console.error('Failed to generate report analytics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while compiling report analytics.' },
      { status: 500 }
    );
  }
}

