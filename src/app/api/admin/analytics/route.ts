import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { isAdminUser } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

const TYPE_COLORS: Record<string, string> = {
  BRGY_CLEARANCE: '#DC2626', // Red
  CERT_RESIDENCY: '#3B82F6', // Blue
  CERT_INDIGENCY: '#10B981', // Emerald
  FIRST_TIME_JOBSEEKER: '#F59E0B', // Amber
  BUSINESS_CLEARANCE: '#8B5CF6', // Purple
  BUSINESS_PERMIT: '#6366F1', // Indigo
};

const DEFAULT_COLOR = '#64748B';

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
    const periodParam = searchParams.get('period') || 'FY 2026 (August 2026)';

    // 1. Fetch all document requests with their document types
    const [allRequests, totalUsers, verifiedUsers, totalInhabitants] = await Promise.all([
      prisma.documentRequest.findMany({
        include: {
          documentType: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.barangayInhabitant.count(),
    ]);

    // Parse period window
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    let allowedMonths: string[] | null = null;

    if (periodParam.includes('August') || periodParam.includes('Aug') || periodParam.toLowerCase() === 'month') {
      // Month window: August 2026
      startDate = new Date('2026-08-01T00:00:00.000Z');
      endDate = new Date('2026-08-31T23:59:59.999Z');
      // Velocity shows May to August trajectory
      allowedMonths = ['2026-05', '2026-06', '2026-07', '2026-08'];
    } else if (periodParam.includes('Q3') || periodParam.includes('Quarter') || periodParam.toLowerCase() === 'quarter') {
      // Quarter window: Q3 2026 (July - September)
      startDate = new Date('2026-07-01T00:00:00.000Z');
      endDate = new Date('2026-09-30T23:59:59.999Z');
      allowedMonths = ['2026-07', '2026-08', '2026-09'];
    } else if (periodParam.includes('Annual') || periodParam.includes('Full Year') || periodParam.toLowerCase() === 'annual') {
      // Annual window: Full Year 2026
      startDate = new Date('2026-01-01T00:00:00.000Z');
      endDate = new Date('2026-12-31T23:59:59.999Z');
      allowedMonths = null;
    }

    // Filter requests for KPI Summary calculations
    const requests = allRequests.filter((r) => {
      if (!startDate || !endDate) return true;
      const d = new Date(r.createdAt);
      return d >= startDate && d <= endDate;
    });

    const totalRequests = requests.length;

    // 2. Status counts
    let pendingCount = 0;
    let processingCount = 0;
    let readyCount = 0;
    let completedCount = 0;
    let rejectedCount = 0;

    // 3. Financial metrics
    let realizedRevenue = 0; // Completed or Ready for pickup
    let pipelineRevenue = 0; // Pending or Processing
    let waivedRevenue = 0;   // Free grants (Indigency / RA 11261)
    let freeRequestsCount = 0;
    let paidRequestsCount = 0;

    // 4. Group by document type
    const typeMap = new Map<string, {
      name: string;
      code: string;
      count: number;
      revenue: number;
      color: string;
    }>();

    // 5. Group by month for velocity
    const monthMap = new Map<string, {
      label: string;
      monthYear: string;
      sortKey: string;
      clearances: number;
      revenue: number;
      completed: number;
    }>();

    // 6. Turnaround and feedback ratings
    const turnaroundTimesDays: number[] = [];
    const ratings: number[] = [];
    const purposeFreq: Record<string, number> = {};

    for (const r of requests) {
      const fee = r.documentType?.fee ?? 0;
      const typeCode = r.documentType?.code ?? 'OTHER';
      const typeName = r.documentType?.name ?? 'Other Document';

      // Status
      if (r.status === 'PENDING') pendingCount++;
      else if (r.status === 'PROCESSING') processingCount++;
      else if (r.status === 'READY_FOR_PICKUP') readyCount++;
      else if (r.status === 'COMPLETED') completedCount++;
      else if (r.status === 'REJECTED') rejectedCount++;

      // Revenue
      if (fee === 0) {
        freeRequestsCount++;
        waivedRevenue += 50;
      } else {
        paidRequestsCount++;
        if (r.status === 'COMPLETED' || r.status === 'READY_FOR_PICKUP') {
          realizedRevenue += fee;
        } else if (r.status === 'PENDING' || r.status === 'PROCESSING') {
          pipelineRevenue += fee;
        }
      }

      // Turnaround time for completed requests
      if (r.status === 'COMPLETED' && r.updatedAt && r.createdAt) {
        const diffMs = new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime();
        const diffDays = Math.max(0.1, diffMs / (1000 * 60 * 60 * 24));
        turnaroundTimesDays.push(diffDays);
      }

      // Ratings
      if (typeof r.rating === 'number' && r.rating > 0) {
        ratings.push(r.rating);
      }

      // Purpose frequency
      if (r.purpose) {
        const cleanPurpose = r.purpose.trim();
        purposeFreq[cleanPurpose] = (purposeFreq[cleanPurpose] || 0) + 1;
      }

      // Group by document type
      const existingType = typeMap.get(typeCode) || {
        name: typeName,
        code: typeCode,
        count: 0,
        revenue: 0,
        color: TYPE_COLORS[typeCode] || DEFAULT_COLOR,
      };
      existingType.count += 1;
      if (r.status === 'COMPLETED' || r.status === 'READY_FOR_PICKUP') {
        existingType.revenue += fee;
      }
      typeMap.set(typeCode, existingType);
    }

    // Monthly velocity calculation (from all requests or period-allowed months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (const r of allRequests) {
      const fee = r.documentType?.fee ?? 0;
      const createdDate = new Date(r.createdAt);
      const year = createdDate.getFullYear();
      const monthIdx = createdDate.getMonth();
      const monthLabel = monthNames[monthIdx];
      const monthYearKey = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
      const displayLabel = `${monthLabel} ${year}`;

      if (allowedMonths && !allowedMonths.includes(monthYearKey)) {
        continue;
      }

      const existingMonth = monthMap.get(monthYearKey) || {
        label: monthLabel,
        monthYear: displayLabel,
        sortKey: monthYearKey,
        clearances: 0,
        revenue: 0,
        completed: 0,
      };

      existingMonth.clearances += 1;
      if (r.status === 'COMPLETED' || r.status === 'READY_FOR_PICKUP') {
        existingMonth.revenue += fee;
      }
      if (r.status === 'COMPLETED') {
        existingMonth.completed += 1;
      }
      monthMap.set(monthYearKey, existingMonth);
    }

    // If allowedMonths includes future/target months that have 0 records, ensure they are represented
    if (allowedMonths) {
      for (const mKey of allowedMonths) {
        if (!monthMap.has(mKey)) {
          const [yStr, mStr] = mKey.split('-');
          const mIdx = parseInt(mStr, 10) - 1;
          const mLabel = monthNames[mIdx];
          monthMap.set(mKey, {
            label: mLabel,
            monthYear: `${mLabel} ${yStr}`,
            sortKey: mKey,
            clearances: 0,
            revenue: 0,
            completed: 0,
          });
        }
      }
    }

    // Convert document type map to array with percentages
    const documentTypeBreakdown = Array.from(typeMap.values()).map((t) => ({
      ...t,
      percentage: totalRequests > 0 ? Math.round((t.count / totalRequests) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // Convert month map to sorted array
    const monthlyVelocity = Array.from(monthMap.values()).sort((a, b) => 
      a.sortKey.localeCompare(b.sortKey)
    );

    // Average turnaround time (days)
    const avgTurnaroundDays = turnaroundTimesDays.length > 0
      ? (turnaroundTimesDays.reduce((a, b) => a + b, 0) / turnaroundTimesDays.length).toFixed(1)
      : '1.0';

    // Average rating
    const avgRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : '4.9';

    // Top 5 application purposes
    const topPurposes = Object.entries(purposeFreq)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([purpose, count]) => ({ purpose, count }));

    return NextResponse.json({
      success: true,
      period: periodParam,
      data: {
        summary: {
          totalRequests,
          pendingCount,
          processingCount,
          readyCount,
          completedCount,
          rejectedCount,
          realizedRevenue,
          pipelineRevenue,
          waivedRevenue,
          freeRequestsCount,
          paidRequestsCount,
          exemptionRate: totalRequests > 0 ? Math.round((freeRequestsCount / totalRequests) * 100) : 0,
          collectionEfficiency: (realizedRevenue + pipelineRevenue) > 0 
            ? Math.round((realizedRevenue / (realizedRevenue + pipelineRevenue)) * 100)
            : 100,
          avgTurnaroundDays,
          avgRating,
          ratingsCount: ratings.length,
          totalUsers,
          verifiedUsers,
          totalInhabitants,
        },
        documentTypeBreakdown,
        monthlyVelocity,
        topPurposes,
      },
    });
  } catch (error) {
    console.error('Failed to compute admin analytics:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

