'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight, 
  Printer, 
  DollarSign, 
  Users, 
  FileText, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
  PieChart,
  X,
  CalendarRange,
  Loader2
} from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableSortHeader from '@/components/ui/TableSortHeader';
import DashboardCharts, { AnalyticsData } from '@/components/admin/DashboardCharts';

type TimeframeMode = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';

export default function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly: August 2026');
  const [timeframeMode, setTimeframeMode] = useState<TimeframeMode>('month');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(8); // August default
  const [selectedQuarter, setSelectedQuarter] = useState<number>(3); // Q3 default
  const [selectedDay, setSelectedDay] = useState<string>('2026-08-28');
  const [customStartDate, setCustomStartDate] = useState<string>('2026-05-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-08-31');

  const [activeTableTab, setActiveTableTab] = useState<'requests' | 'citizens' | 'audit'>('requests');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // default new to old
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('ALL');
  const [registeredCitizensCount, setRegisteredCitizensCount] = useState<number>(3824);
  const [dashboardLogs, setDashboardLogs] = useState<any[]>([]);

  // 2. Clearances from Database
  const [clearances, setClearances] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // Dynamic KPI calculations from live data (automatically reflects filtered period)
  const totalRequestsCount = analyticsData?.summary.totalRequests ?? clearances.length;

  const pendingCount = useMemo(() => {
    if (analyticsData?.summary.pendingCount !== undefined) {
      return analyticsData.summary.pendingCount + (analyticsData.summary.processingCount || 0);
    }
    return clearances.filter((r) => r.status === 'PENDING' || r.status === 'PENDING_REVIEW' || r.status === 'PROCESSING').length;
  }, [clearances, analyticsData]);

  const readyCount = useMemo(() => {
    if (analyticsData?.summary.readyCount !== undefined) {
      return analyticsData.summary.readyCount;
    }
    return clearances.filter((r) => r.status === 'READY_FOR_PICKUP').length;
  }, [clearances, analyticsData]);

  const completedCount = useMemo(() => {
    if (analyticsData?.summary.completedCount !== undefined) {
      return analyticsData.summary.completedCount;
    }
    return clearances.filter((r) => r.status === 'COMPLETED').length;
  }, [clearances, analyticsData]);

  const realizedRevenue = useMemo(() => {
    if (analyticsData?.summary.realizedRevenue !== undefined) {
      return analyticsData.summary.realizedRevenue;
    }
    return clearances
      .filter((r) => r.status === 'COMPLETED' || r.status === 'READY_FOR_PICKUP')
      .reduce((sum, r) => {
        const val = parseFloat(r.fee.replace(/[^0-9.]/g, ''));
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
  }, [clearances, analyticsData]);

  const pipelineRevenue = analyticsData?.summary.pipelineRevenue ?? 0;
  const waivedRevenue = analyticsData?.summary.waivedRevenue ?? 0;
  const freeGrantsCount = analyticsData?.summary.freeRequestsCount ?? clearances.filter((r) => r.fee === 'FREE').length;

  const kpiCards = useMemo(() => [
    {
      label: 'Total Requests Gathered',
      value: `${totalRequestsCount} ${totalRequestsCount === 1 ? 'Request' : 'Requests'}`,
      subtext: `${completedCount} Released • ${pendingCount} In Queue`,
      badge: 'Volume',
      badgeColor: 'border-slate-500/30 bg-slate-500/10 text-slate-800 dark:text-slate-200',
      color: 'text-black dark:text-white',
    },
    {
      label: 'Realized Fee Revenue',
      value: `₱${realizedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      subtext: `+₱${pipelineRevenue.toLocaleString()} Pipeline • ₱${waivedRevenue.toLocaleString()} Waived`,
      badge: 'Collections',
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Pending Applications',
      value: `${pendingCount} ${pendingCount === 1 ? 'Request' : 'Requests'}`,
      subtext: 'Awaiting desk officer review',
      badge: 'Queue',
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      color: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Ready for Pickup',
      value: `${readyCount} ${readyCount === 1 ? 'Certificate' : 'Certificates'}`,
      subtext: 'Printed & sealed at Window 2',
      badge: 'Release',
      badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Verified Citizens',
      value: registeredCitizensCount.toLocaleString(),
      subtext: `${freeGrantsCount} Free Grants (RA 11261)`,
      badge: 'Registry',
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400',
      color: 'text-purple-600 dark:text-purple-400',
    },
  ], [totalRequestsCount, completedCount, pendingCount, readyCount, realizedRevenue, pipelineRevenue, waivedRevenue, registeredCitizensCount, freeGrantsCount]);

  // Sync analytics dynamically whenever timeframe mode or date parameters change
  const fetchAnalyticsData = async () => {
    setIsAnalyticsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('timeframe', timeframeMode);
      params.set('year', String(selectedYear));
      params.set('month', String(selectedMonth));
      params.set('quarter', String(selectedQuarter));
      if (timeframeMode === 'day' || timeframeMode === 'week') {
        params.set('day', selectedDay);
      }
      if (timeframeMode === 'custom') {
        params.set('startDate', customStartDate);
        params.set('endDate', customEndDate);
      }

      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAnalyticsData(json.data);
          if (json.period) {
            setSelectedPeriod(json.period);
          }
          if (json.data.summary?.totalInhabitants) {
            setRegisteredCitizensCount(json.data.summary.totalInhabitants);
          }
        }
      }
    } catch (err) {
      console.error('Failed to sync period analytics:', err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframeMode, selectedYear, selectedMonth, selectedQuarter, selectedDay, customStartDate, customEndDate]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const [resRequests, resResidents, resLogs] = await Promise.all([
          fetch('/api/admin/requests'),
          fetch('/api/admin/residents').catch(() => null),
          fetch('/api/admin/audit-logs').catch(() => null),
        ]);
        
        if (resRequests.ok) {
          const data = await resRequests.json();
          if (data.success && Array.isArray(data.requests) && data.requests.length > 0) {
            const mapped = data.requests.map((r: any) => ({
              id: r.trackingNumber,
              applicant: r.fullName,
              type: r.documentType,
              purpose: r.purpose,
              fee: r.fee === 0 ? 'FREE' : `₱${r.fee.toFixed(2)}`,
              feeStatus: r.fee === 0 ? 'FREE' : 'PAID',
              date: r.createdAt,
              status: r.status === 'PENDING' ? 'PENDING_REVIEW' : r.status,
            }));
            setClearances(mapped);
          }
        }

        if (resResidents && resResidents.ok) {
          const resData = await resResidents.json();
          if (resData.success) {
            if (resData.totalResidents !== undefined) {
              setRegisteredCitizensCount(resData.totalResidents);
            }
            if (Array.isArray(resData.residents) && resData.residents.length > 0) {
              const mappedCitizens = resData.residents.map((r: any) => ({
                name: r.name,
                address: r.address || 'Barangay Onse',
                civil: r.civil || 'Single',
                registered: r.registered || '2026-01-01',
                verified: Boolean(r.verified),
              }));
              setCitizens(mappedCitizens);
            }
          }
        }

        if (resLogs && resLogs.ok) {
          const logData = await resLogs.json();
          if (logData.success && Array.isArray(logData.logs)) {
            setDashboardLogs(logData.logs);
          }
        }
      } catch (err) {
        console.error('Failed to sync admin dashboard data:', err);
      }
    };
    fetchLatest();
  }, []);

  const [citizens, setCitizens] = useState<any[]>([]);

  // Tab change handler
  const handleTabChange = (tab: 'requests' | 'citizens' | 'audit') => {
    setActiveTableTab(tab);
    setCurrentPage(1);
    setSearchFilter('');
    if (tab === 'citizens') {
      setSortField('registered');
    } else if (tab === 'audit') {
      setSortField('timestamp');
    } else {
      setSortField('date');
    }
    setSortDirection('desc'); // default new to old
  };

  // Sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc'); // default new to old
    }
    setCurrentPage(1);
  };

  // Processed requests (Dynamically reacts to real clearances & status chips)
  const processedRequests = useMemo(() => {
    const q = searchFilter.toLowerCase();
    return clearances
      .filter((item) => {
        const matchesQuery =
          item.id.toLowerCase().includes(q) ||
          item.applicant.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.purpose.toLowerCase().includes(q);

        const matchesStatus =
          requestStatusFilter === 'ALL' ||
          (requestStatusFilter === 'PENDING_REVIEW' && (item.status === 'PENDING_REVIEW' || item.status === 'PENDING')) ||
          item.status === requestStatusFilter;

        return matchesQuery && matchesStatus;
      })
      .sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [clearances, searchFilter, requestStatusFilter, sortField, sortDirection]);

  // Processed citizens
  const processedCitizens = useMemo(() => {
    const q = searchFilter.toLowerCase();
    return citizens
      .filter((item) =>
        item.name.toLowerCase().includes(q) ||
        (item.address && item.address.toLowerCase().includes(q))
      )
      .sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [citizens, searchFilter, sortField, sortDirection]);

  // Processed live audit logs
  const processedAuditLogs = useMemo(() => {
    const q = searchFilter.toLowerCase();
    return dashboardLogs
      .filter((item) =>
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.action && item.action.toLowerCase().includes(q)) ||
        (item.details && item.details.toLowerCase().includes(q)) ||
        (item.actor && item.actor.toLowerCase().includes(q)) ||
        (item.timestamp && item.timestamp.toLowerCase().includes(q))
      )
      .sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [dashboardLogs, searchFilter, sortField, sortDirection]);

  // Active items calculation based on current tab
  const activeDataLength =
    activeTableTab === 'requests'
      ? processedRequests.length
      : activeTableTab === 'citizens'
      ? processedCitizens.length
      : processedAuditLogs.length;

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRequests.slice(start, start + pageSize);
  }, [processedRequests, currentPage, pageSize]);

  const paginatedCitizens = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedCitizens.slice(start, start + pageSize);
  }, [processedCitizens, currentPage, pageSize]);

  const paginatedAuditLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedAuditLogs.slice(start, start + pageSize);
  }, [processedAuditLogs, currentPage, pageSize]);

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-slate-100">
      
      {/* 1. Header Filter Ribbon & Action Bar */}
      <div className="bg-white dark:bg-[#0B1528] p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
                Executive Dashboard
              </span>
              <span className="text-[10px] font-bold text-slate-400">&bull;</span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">San Juan City &bull; District 1</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Dashboard Analytics &amp; Operations
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/requests"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Certificate Queue ({clearances.length})</span>
            </Link>
          </div>
        </div>

        {/* Timeframe Mode Dropdown & Contextual Calendar Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-blue-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Timeframe Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarRange className="w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400" />
              <span>Timeframe:</span>
            </span>
            <div className="relative">
              <select
                value={timeframeMode}
                onChange={(e) => setTimeframeMode(e.target.value as TimeframeMode)}
                className="appearance-none bg-slate-100/90 dark:bg-[#0E1B33] hover:bg-slate-200/70 dark:hover:bg-[#132342] border border-slate-200 dark:border-blue-900/60 text-slate-900 dark:text-slate-100 text-xs font-black uppercase tracking-wider py-2 pl-3.5 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer transition shadow-xs"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="quarter">Quarter</option>
                <option value="year">Year</option>
                <option value="all">All Time</option>
                <option value="custom">Custom Range</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Contextual Date/Month/Quarter Pickers */}
          <div className="flex flex-wrap items-center gap-2">
            {timeframeMode === 'month' && (
              <>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                    className="appearance-none bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                  >
                    {[
                      { v: 1, l: 'January' },
                      { v: 2, l: 'February' },
                      { v: 3, l: 'March' },
                      { v: 4, l: 'April' },
                      { v: 5, l: 'May' },
                      { v: 6, l: 'June' },
                      { v: 7, l: 'July' },
                      { v: 8, l: 'August' },
                      { v: 9, l: 'September' },
                      { v: 10, l: 'October' },
                      { v: 11, l: 'November' },
                      { v: 12, l: 'December' },
                    ].map((m) => (
                      <option key={m.v} value={m.v}>{m.l}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="appearance-none bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </>
            )}

            {timeframeMode === 'quarter' && (
              <>
                <div className="relative">
                  <select
                    value={selectedQuarter}
                    onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                    className="appearance-none bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                  >
                    <option value={1}>Q1 (Jan – Mar)</option>
                    <option value={2}>Q2 (Apr – Jun)</option>
                    <option value={3}>Q3 (Jul – Sep)</option>
                    <option value={4}>Q4 (Oct – Dec)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="appearance-none bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                  >
                    {[2024, 2025, 2026, 2027].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </>
            )}

            {timeframeMode === 'year' && (
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="appearance-none bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold py-2 pl-3 pr-7 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>FY {y}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}

            {(timeframeMode === 'day' || timeframeMode === 'week') && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDay('2026-08-28')}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1c345f] text-slate-700 dark:text-slate-300 rounded-xl font-bold text-[10px] uppercase transition cursor-pointer"
                >
                  Aug 28
                </button>
              </div>
            )}

            {timeframeMode === 'custom' && (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-bold">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 pl-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              {isAnalyticsLoading ? (
                <span className="flex items-center gap-1 text-[#9C2007] dark:text-rose-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Filtering...</span>
                </span>
              ) : (
                <span className="bg-slate-100 dark:bg-[#12213F] px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300 font-medium">
                  {selectedPeriod}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards Row (Clean Black Theme, Full Labels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#0B1528] rounded-3xl p-5 border border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2 min-h-[36px]">
              <span className="text-[11px] font-bold text-black dark:text-white uppercase tracking-wider leading-snug">
                {card.label}
              </span>
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
                {card.value}
              </div>

              <p className="text-[11px] text-black/70 dark:text-white/70 font-medium leading-tight">
                {card.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Charts & Analytics Row (Data-driven & Interactive) */}
      <DashboardCharts selectedPeriod={selectedPeriod} analytics={analyticsData} />

      {/* 4. Real-time Collections & Operational Performance */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 flex items-center justify-center text-black dark:text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase text-black dark:text-white tracking-wider">
                Internal Revenue &amp; Operational Audit (On-System Report)
              </h3>
              <p className="text-[11px] text-black/60 dark:text-white/60 font-medium">
                Live ledger compiled from verified citizen document requests, official fee payments, and statutory assistance waivers.
              </p>
            </div>
          </div>

          <Link
            href="/admin/requests"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 font-bold text-xs uppercase tracking-wider transition"
          >
            <span>View All Requests</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Realization KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#080E1A] border border-slate-200/60 dark:border-blue-900/30 text-xs">
          <div>
            <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider block">Realized Collections</span>
            <span className="text-base sm:text-lg font-black text-black dark:text-white">
              ₱{(analyticsData?.summary.realizedRevenue ?? realizedRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-black/50 dark:text-white/50 block font-medium">Paid &amp; released issuances</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider block">Pipeline Receivables</span>
            <span className="text-base sm:text-lg font-black text-black dark:text-white">
              ₱{(analyticsData?.summary.pipelineRevenue ?? pipelineRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-black/50 dark:text-white/50 block font-medium">{pendingCount} requests in review</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider block">Social Aid Waived</span>
            <span className="text-base sm:text-lg font-black text-black dark:text-white">
              ₱{(analyticsData?.summary.waivedRevenue ?? waivedRevenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-black/50 dark:text-white/50 block font-medium">Indigency &amp; RA 11261 aid</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider block">Avg. Velocity Turnaround</span>
            <span className="text-base sm:text-lg font-black text-black dark:text-white">
              {analyticsData?.summary.avgTurnaroundDays ?? '1.0'} <span className="text-[10px] text-black/50 dark:text-white/50 font-normal">days / doc</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-semibold">{analyticsData?.summary.collectionEfficiency ?? 100}% collection rate</span>
          </div>
        </div>
      </div>

      {/* 5. Interactive Tabbed Data Table & Real-time Management */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        
        {/* Tab Headers & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-blue-900/40 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTabChange('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'requests'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              Certificate Requests ({clearances.length})
            </button>

            <button
              onClick={() => handleTabChange('citizens')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'citizens'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              Citizen Roster ({citizens.length})
            </button>

            <button
              onClick={() => handleTabChange('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'audit'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              Live Security &amp; Audit ({dashboardLogs.length})
            </button>
          </div>

          {/* Quick Status Chips & Search Input */}
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTableTab === 'requests' && (
              <div className="flex flex-wrap items-center gap-1 text-[10px]">
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'PENDING_REVIEW', label: 'Pending' },
                  { key: 'PROCESSING', label: 'Processing' },
                  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup' },
                  { key: 'COMPLETED', label: 'Completed' },
                  { key: 'REJECTED', label: 'Rejected' },
                ].map((st) => (
                  <button
                    key={st.key}
                    type="button"
                    onClick={() => {
                      setRequestStatusFilter(st.key);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-bold uppercase transition cursor-pointer ${
                      requestStatusFilter === st.key
                        ? 'bg-[#9C2007] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#152747]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}

            <div className="relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search record by code or name..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-[#9C2007] outline-none"
              />
              {searchFilter && (
                <button
                  onClick={() => {
                    setSearchFilter('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TAB 1: CLEARANCE QUEUE TABLE */}
        {activeTableTab === 'requests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                <tr>
                  <TableSortHeader
                    field="id"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Tracking Code"
                  />
                  <TableSortHeader
                    field="applicant"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Applicant Name"
                  />
                  <TableSortHeader
                    field="type"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Certificate Type"
                  />
                  <TableSortHeader
                    field="purpose"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Purpose"
                  />
                  <TableSortHeader
                    field="feeStatus"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Fee Status"
                  />
                  <TableSortHeader
                    field="date"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Date Filed"
                  />
                  <TableSortHeader
                    field="status"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Status"
                  />
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No certificate requests found matching your filter.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">{row.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.applicant}</td>
                      <td className="py-3.5 px-4">{row.type}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">{row.purpose}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 border border-transparent dark:border-blue-900/40 text-[10px] font-bold">
                          {row.feeStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{row.date}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {row.status === 'READY_FOR_PICKUP' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black uppercase whitespace-nowrap">
                            Ready for Pickup
                          </span>
                        )}
                        {row.status === 'PROCESSING' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-[10px] font-black uppercase whitespace-nowrap">
                            Processing
                          </span>
                        )}
                        {row.status === 'PENDING_REVIEW' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-[10px] font-black uppercase whitespace-nowrap">
                            Pending Review
                          </span>
                        )}
                        {row.status === 'COMPLETED' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-[10px] font-black uppercase whitespace-nowrap">
                            Completed
                          </span>
                        )}
                        {row.status === 'REJECTED' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-[10px] font-black uppercase whitespace-nowrap">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/requests?search=${encodeURIComponent(row.id)}`}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 border border-transparent dark:border-blue-900/40"
                            title="Review and process request in queue"
                          >
                            <span>Process &rarr;</span>
                          </Link>
                          <Link
                            href={`/admin/requests?search=${encodeURIComponent(row.id)}`}
                            className="p-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-[#9C2007] text-[#9C2007] dark:text-rose-300 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center justify-center border border-rose-200/60 dark:border-rose-900/40"
                            title="Print official certificate"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: CITIZEN ROSTER */}
        {activeTableTab === 'citizens' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                <tr>
                  <TableSortHeader
                    field="name"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Full Legal Name"
                  />
                  <TableSortHeader
                    field="address"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Barangay Onse Address"
                  />
                  <TableSortHeader
                    field="civil"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Civil Status"
                  />
                  <TableSortHeader
                    field="registered"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Member Since"
                  />
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                {paginatedCitizens.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No citizen records found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedCitizens.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                      <td className="py-3.5 px-4">{row.address}</td>
                      <td className="py-3.5 px-4">{row.civil}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{row.registered}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: LIVE SECURITY & AUDIT TRAIL */}
        {activeTableTab === 'audit' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#080E1A] rounded-2xl border border-slate-200/60 dark:border-blue-900/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Live System Audit Stream ({dashboardLogs.length} events logged)
                </span>
              </div>
              <Link
                href="/admin/audit-logs"
                className="font-bold text-[#9C2007] dark:text-rose-400 hover:underline flex items-center gap-1"
              >
                <span>Full Audit Page &amp; CSV Export</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                  <tr>
                    <TableSortHeader
                      field="id"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      label="Event ID"
                    />
                    <TableSortHeader
                      field="action"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      label="Action"
                    />
                    <TableSortHeader
                      field="details"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      label="Description"
                    />
                    <TableSortHeader
                      field="actor"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      label="Actor"
                    />
                    <TableSortHeader
                      field="timestamp"
                      currentField={sortField}
                      currentDirection={sortDirection}
                      onSort={handleSort}
                      label="Timestamp"
                    />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                  {paginatedAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        No audit events found matching your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedAuditLogs.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-slate-400">{row.id}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border bg-rose-50 text-[#9C2007] border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/50">
                            {row.action}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-sm text-slate-800 dark:text-slate-200">{row.details}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{row.actor}</td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{row.timestamp}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reusable Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={activeDataLength}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => setPageSize(size)}
        />
      </div>

    </div>
  );
}
