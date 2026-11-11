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
    const timeframeParam = (searchParams.get('timeframe') || searchParams.get('granularity') || '').toLowerCase();
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    const quarterParam = searchParams.get('quarter');
    const dayParam = searchParams.get('day');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const periodParam = searchParams.get('period') || '';

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

    // Determine timeframe mode
    let mode = timeframeParam;
    if (!mode) {
      if (periodParam.includes('August') || periodParam.toLowerCase() === 'month') mode = 'month';
      else if (periodParam.includes('Q3') || periodParam.includes('Quarter') || periodParam.toLowerCase() === 'quarter') mode = 'quarter';
      else if (periodParam.includes('Annual') || periodParam.toLowerCase() === 'year') mode = 'year';
      else if (startDateParam && endDateParam) mode = 'custom';
      else if (dayParam) mode = 'day';
      else mode = 'month';
    }

    const selectedYear = yearParam ? parseInt(yearParam, 10) : 2026;
    const selectedMonth = monthParam ? parseInt(monthParam, 10) : 8; // 1-12 (Aug default for seed)
    const selectedQuarter = quarterParam ? parseInt(quarterParam, 10) : 3; // 1-4

    const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const MONTH_NAMES_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    interface VelocityBucket {
      label: string;
      monthYear: string;
      sortKey: string;
      clearances: number;
      revenue: number;
      completed: number;
      start: Date;
      end: Date;
    }

    const velocityBuckets: VelocityBucket[] = [];
    let filterStart: Date | null = null;
    let filterEnd: Date | null = null;
    let labelTitle = '';

    if (mode === 'day') {
      const targetDayStr = dayParam || (startDateParam || '2026-08-28');
      filterStart = new Date(`${targetDayStr}T00:00:00.000Z`);
      filterEnd = new Date(`${targetDayStr}T23:59:59.999Z`);
      labelTitle = `Daily: ${targetDayStr}`;

      // 6 Hourly slots: 8am, 10am, 12pm, 2pm, 4pm, 6pm
      const hours = [8, 10, 12, 14, 16, 18];
      hours.forEach((h, idx) => {
        const slotStart = new Date(`${targetDayStr}T${String(h).padStart(2, '0')}:00:00.000Z`);
        const nextH = idx < hours.length - 1 ? hours[idx + 1] : 23;
        const slotEnd = new Date(`${targetDayStr}T${String(nextH).padStart(2, '0')}:59:59.999Z`);
        const displayTime = h === 12 ? '12:00 PM' : h < 12 ? `${h}:00 AM` : `${h - 12}:00 PM`;
        velocityBuckets.push({
          label: displayTime,
          monthYear: `${targetDayStr} ${displayTime}`,
          sortKey: `${targetDayStr}-${String(h).padStart(2, '0')}`,
          clearances: 0,
          revenue: 0,
          completed: 0,
          start: slotStart,
          end: slotEnd,
        });
      });
    } else if (mode === 'week') {
      const refDayStr = dayParam || startDateParam || '2026-08-28';
      const refDate = new Date(`${refDayStr}T12:00:00.000Z`);
      
      // 7 consecutive days up to reference date
      const daysList: Date[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(refDate);
        d.setDate(d.getDate() - i);
        daysList.push(d);
      }

      filterStart = new Date(daysList[0].toISOString().slice(0, 10) + 'T00:00:00.000Z');
      filterEnd = new Date(daysList[daysList.length - 1].toISOString().slice(0, 10) + 'T23:59:59.999Z');
      labelTitle = `Weekly: ${filterStart.toISOString().slice(0, 10)} to ${filterEnd.toISOString().slice(0, 10)}`;

      const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      daysList.forEach((d) => {
        const dStr = d.toISOString().slice(0, 10);
        const dayLabel = `${dayNamesShort[d.getUTCDay()]} ${d.getUTCDate()}`;
        velocityBuckets.push({
          label: dayLabel,
          monthYear: dStr,
          sortKey: dStr,
          clearances: 0,
          revenue: 0,
          completed: 0,
          start: new Date(`${dStr}T00:00:00.000Z`),
          end: new Date(`${dStr}T23:59:59.999Z`),
        });
      });
    } else if (mode === 'month') {
      filterStart = new Date(Date.UTC(selectedYear, selectedMonth - 1, 1, 0, 0, 0));
      filterEnd = new Date(Date.UTC(selectedYear, selectedMonth, 0, 23, 59, 59, 999));
      const mName = MONTH_NAMES_FULL[selectedMonth - 1];
      const mShort = MONTH_NAMES_SHORT[selectedMonth - 1];
      labelTitle = `Monthly: ${mName} ${selectedYear}`;

      const totalDaysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const intervals = [
        { label: `W1 (${mShort} 1-7)`, startDay: 1, endDay: 7 },
        { label: `W2 (${mShort} 8-14)`, startDay: 8, endDay: 14 },
        { label: `W3 (${mShort} 15-21)`, startDay: 15, endDay: 21 },
        { label: `W4 (${mShort} 22-28)`, startDay: 22, endDay: 28 },
        ...(totalDaysInMonth > 28 ? [{ label: `W5 (${mShort} 29-${totalDaysInMonth})`, startDay: 29, endDay: totalDaysInMonth }] : []),
      ];

      intervals.forEach((inv, idx) => {
        velocityBuckets.push({
          label: inv.label,
          monthYear: `${inv.label} ${selectedYear}`,
          sortKey: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-W${idx + 1}`,
          clearances: 0,
          revenue: 0,
          completed: 0,
          start: new Date(Date.UTC(selectedYear, selectedMonth - 1, inv.startDay, 0, 0, 0)),
          end: new Date(Date.UTC(selectedYear, selectedMonth - 1, inv.endDay, 23, 59, 59, 999)),
        });
      });
    } else if (mode === 'quarter') {
      const startMonthIdx = (selectedQuarter - 1) * 3;
      const endMonthIdx = startMonthIdx + 2;
      filterStart = new Date(Date.UTC(selectedYear, startMonthIdx, 1, 0, 0, 0));
      filterEnd = new Date(Date.UTC(selectedYear, endMonthIdx + 1, 0, 23, 59, 59, 999));
      labelTitle = `Quarterly: Q${selectedQuarter} ${selectedYear} (${MONTH_NAMES_SHORT[startMonthIdx]} – ${MONTH_NAMES_SHORT[endMonthIdx]})`;

      for (let m = startMonthIdx; m <= endMonthIdx; m++) {
        const mLabel = MONTH_NAMES_SHORT[m];
        const mKey = `${selectedYear}-${String(m + 1).padStart(2, '0')}`;
        velocityBuckets.push({
          label: `${mLabel} ${selectedYear}`,
          monthYear: `${mLabel} ${selectedYear}`,
          sortKey: mKey,
          clearances: 0,
          revenue: 0,
          completed: 0,
          start: new Date(Date.UTC(selectedYear, m, 1, 0, 0, 0)),
          end: new Date(Date.UTC(selectedYear, m + 1, 0, 23, 59, 59, 999)),
        });
      }
    } else if (mode === 'year') {
      filterStart = new Date(Date.UTC(selectedYear, 0, 1, 0, 0, 0));
      filterEnd = new Date(Date.UTC(selectedYear, 11, 31, 23, 59, 59, 999));
      labelTitle = `Annual: Full Year ${selectedYear}`;

      for (let m = 0; m < 12; m++) {
        const mLabel = MONTH_NAMES_SHORT[m];
        const mKey = `${selectedYear}-${String(m + 1).padStart(2, '0')}`;
        velocityBuckets.push({
          label: mLabel,
          monthYear: `${mLabel} ${selectedYear}`,
          sortKey: mKey,
          clearances: 0,
          revenue: 0,
          completed: 0,
          start: new Date(Date.UTC(selectedYear, m, 1, 0, 0, 0)),
          end: new Date(Date.UTC(selectedYear, m + 1, 0, 23, 59, 59, 999)),
        });
      }
    } else if (mode === 'custom' && startDateParam && endDateParam) {
      filterStart = new Date(`${startDateParam}T00:00:00.000Z`);
      filterEnd = new Date(`${endDateParam}T23:59:59.999Z`);
      labelTitle = `Custom: ${startDateParam} to ${endDateParam}`;

      // Calculate days difference
      const diffDays = Math.max(1, Math.round((filterEnd.getTime() - filterStart.getTime()) / (1000 * 60 * 60 * 24)));
      if (diffDays <= 14) {
        // Daily breakdown
        for (let i = 0; i < diffDays; i++) {
          const d = new Date(filterStart);
          d.setDate(d.getDate() + i);
          const dStr = d.toISOString().slice(0, 10);
          velocityBuckets.push({
            label: `${MONTH_NAMES_SHORT[d.getUTCMonth()]} ${d.getUTCDate()}`,
            monthYear: dStr,
            sortKey: dStr,
            clearances: 0,
            revenue: 0,
            completed: 0,
            start: new Date(`${dStr}T00:00:00.000Z`),
            end: new Date(`${dStr}T23:59:59.999Z`),
          });
        }
      } else {
        // Monthly breakdown
        const curr = new Date(filterStart);
        while (curr <= filterEnd) {
          const y = curr.getUTCFullYear();
          const m = curr.getUTCMonth();
          const mLabel = MONTH_NAMES_SHORT[m];
          const mKey = `${y}-${String(m + 1).padStart(2, '0')}`;
          const bStart = new Date(Date.UTC(y, m, 1, 0, 0, 0));
          const bEnd = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
          velocityBuckets.push({
            label: `${mLabel} ${y}`,
            monthYear: `${mLabel} ${y}`,
            sortKey: mKey,
            clearances: 0,
            revenue: 0,
            completed: 0,
            start: bStart,
            end: bEnd,
          });
          curr.setUTCMonth(curr.getUTCMonth() + 1);
        }
      }
    } else {
      // 'all' (All-time)
      filterStart = null;
      filterEnd = null;
      labelTitle = 'All-Time Analytics';

      // Group all months from data
      const monthKeySet = new Set<string>();
      allRequests.forEach((r) => {
        const d = new Date(r.createdAt);
        monthKeySet.add(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`);
      });
      const sortedKeys = Array.from(monthKeySet).sort();
      sortedKeys.forEach((key) => {
        const [y, m] = key.split('-').map(Number);
        const mLabel = MONTH_NAMES_SHORT[m - 1];
        velocityBuckets.push({
          label: `${mLabel} ${y}`,
          monthYear: `${mLabel} ${y}`,
          sortKey: key,
          clearances: 0,
          revenue: 0,
          completed: 0,
          start: new Date(Date.UTC(y, m - 1, 1, 0, 0, 0)),
          end: new Date(Date.UTC(y, m, 0, 23, 59, 59, 999)),
        });
      });
    }

    // Filter requests for KPI Summary calculations
    const requests = allRequests.filter((r) => {
      if (!filterStart || !filterEnd) return true;
      const d = new Date(r.createdAt);
      return d >= filterStart && d <= filterEnd;
    });

    const totalRequests = requests.length;

    // 2. Status counts
    let pendingCount = 0;
    let processingCount = 0;
    let readyCount = 0;
    let completedCount = 0;
    let rejectedCount = 0;

    // 3. Financial metrics
    let realizedRevenue = 0;
    let pipelineRevenue = 0;
    let waivedRevenue = 0;
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

    // 5. Turnaround and feedback ratings
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

    // Populate velocity buckets
    for (const r of allRequests) {
      const createdDate = new Date(r.createdAt);
      const fee = r.documentType?.fee ?? 0;

      for (const bucket of velocityBuckets) {
        if (createdDate >= bucket.start && createdDate <= bucket.end) {
          bucket.clearances += 1;
          if (r.status === 'COMPLETED' || r.status === 'READY_FOR_PICKUP') {
            bucket.revenue += fee;
          }
          if (r.status === 'COMPLETED') {
            bucket.completed += 1;
          }
          break;
        }
      }
    }

    // Convert document type map to array with percentages
    const documentTypeBreakdown = Array.from(typeMap.values()).map((t) => ({
      ...t,
      percentage: totalRequests > 0 ? Math.round((t.count / totalRequests) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // Format velocity output (without start/end date properties)
    const monthlyVelocity = velocityBuckets.map((b) => ({
      label: b.label,
      monthYear: b.monthYear,
      sortKey: b.sortKey,
      clearances: b.clearances,
      revenue: b.revenue,
      completed: b.completed,
    }));

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
      period: labelTitle,
      timeframe: mode,
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

