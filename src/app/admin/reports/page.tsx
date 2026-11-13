'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getPhNowParts, MONTH_NAMES_FULL } from '@/lib/ph-time';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Printer, 
  Download, 
  RefreshCw, 
  Calendar, 
  CalendarRange, 
  Search, 
  Filter, 
  ShieldCheck, 
  Building2, 
  FileCheck, 
  Layers, 
  Info, 
  ChevronRight, 
  ArrowUpRight,
  ExternalLink,
  Award,
  Sparkles,
  HelpCircle,
  XCircle,
  Eye,
  Check
} from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableSortHeader from '@/components/ui/TableSortHeader';

interface DocumentTypeStat {
  id: string;
  code: string;
  name: string;
  description: string;
  fee: number;
  feeDisplay: string;
  processingDays: number;
  requirements: string[];
  category: string;
  legalBasis: string;
  totalRequested: number;
  completed: number;
  readyForPickup: number;
  processing: number;
  pending: number;
  rejected: number;
  inProgress: number;
  completionRate: number;
  realizedRevenue: number;
  potentialRevenue: number;
  freeCompleted: number;
  waivedValue: number;
  avgTurnaroundHours: number;
  avgTurnaroundDays: string;
}

interface CompletedRecord {
  id: string;
  trackingNumber: string;
  applicant: string;
  documentCode: string;
  documentName: string;
  purpose: string;
  fee: number;
  feeDisplay: string;
  feeStatus: string;
  dateFiled: string;
  dateCompleted: string;
  turnaroundDays: string;
  status: string;
  remarks: string;
}

interface ReportData {
  reportMetadata: {
    barangayName: string;
    city: string;
    office: string;
    generatedAt: string;
    generatedBy: string;
    userRole: string;
    periodLabel: string;
    timeframe: string;
  };
  summary: {
    totalApplications: number;
    totalCompleted: number;
    totalReady: number;
    totalProcessing: number;
    totalPending: number;
    totalActive: number;
    totalRejected: number;
    overallCompletionRate: number;
    totalRealizedRevenue: number;
    totalWaivedRevenue: number;
    totalFreeGrants: number;
    avgTurnaroundDays: string;
    totalCatalogedDocuments: number;
  };
  documents: DocumentTypeStat[];
  completedRecords: CompletedRecord[];
}

export default function ReportAnalyticsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Timeframe filter state (auto-adapted to Philippine Standard Time)
  const initialPh = getPhNowParts();
  const [timeframe, setTimeframe] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(initialPh.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialPh.month);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(initialPh.quarter);
  const [selectedDay, setSelectedDay] = useState<string>(initialPh.dateStr);
  const [customStart, setCustomStart] = useState<string>(`${initialPh.year}-${String(initialPh.month).padStart(2, '0')}-01`);
  const [customEnd, setCustomEnd] = useState<string>(initialPh.dateStr);

  // Filter & Search states for the itemized completed records table
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>('ALL');
  const [recordsCurrentPage, setRecordsCurrentPage] = useState<number>(1);
  const [recordsPageSize, setRecordsPageSize] = useState<number>(10);
  const [recordsSortField, setRecordsSortField] = useState<string>('dateCompleted');
  const [recordsSortDir, setRecordsSortDir] = useState<'asc' | 'desc'>('desc');

  const handleRecordsSort = (field: string) => {
    if (recordsSortField === field) {
      setRecordsSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setRecordsSortField(field);
      setRecordsSortDir('desc');
    }
  };

  // Active view tab inside module: 'performance' | 'catalog' | 'audit_log'
  const [activeTab, setActiveTab] = useState<'performance' | 'catalog' | 'audit_log'>('performance');

  // Selected document for the details modal
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentTypeStat | null>(null);

  // Fetch report data from API
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('timeframe', timeframe);
      if (timeframe === 'custom') {
        params.set('startDate', customStart);
        params.set('endDate', customEnd);
      } else if (timeframe === 'day') {
        params.set('day', selectedDay);
      } else if (timeframe === 'month') {
        params.set('year', String(selectedYear));
        params.set('month', String(selectedMonth));
      } else if (timeframe === 'quarter') {
        params.set('year', String(selectedYear));
        params.set('quarter', String(selectedQuarter));
      } else if (timeframe === 'year') {
        params.set('year', String(selectedYear));
      }

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load report analytics (Status: ${res.status})`);
      }
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.error || 'Unable to retrieve report analytics');
      }
    } catch (err: any) {
      console.error('Error fetching report analytics:', err);
      setError(err.message || 'An error occurred while compiling reports');
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, customStart, customEnd, selectedDay, selectedYear, selectedMonth, selectedQuarter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Export report to CSV
  const handleExportCSV = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Header block
    csvContent += `"BARANGAY ONSE - SAN JUAN CITY"\n`;
    csvContent += `"OFFICIAL REPORT & DOCUMENT ISSUANCE ANALYTICS"\n`;
    csvContent += `"Period:","${data.reportMetadata.periodLabel}"\n`;
    csvContent += `"Generated At:","${new Date(data.reportMetadata.generatedAt).toLocaleString()}"\n`;
    csvContent += `"Generated By:","${data.reportMetadata.generatedBy} (${data.reportMetadata.userRole})"\n\n`;

    // Summary KPIs
    csvContent += `"SUMMARY KPIS"\n`;
    csvContent += `"Total Applications","${data.summary.totalApplications}"\n`;
    csvContent += `"Total Completed","${data.summary.totalCompleted}"\n`;
    csvContent += `"Overall Completion Rate","${data.summary.overallCompletionRate}%"\n`;
    csvContent += `"Realized Revenue","PHP ${data.summary.totalRealizedRevenue.toFixed(2)}"\n`;
    csvContent += `"Free Grants Issued (RA 11261 / Indigent)","${data.summary.totalFreeGrants}"\n`;
    csvContent += `"Average Turnaround Time","${data.summary.avgTurnaroundDays} days"\n\n`;

    // Document Breakdown
    csvContent += `"DOCUMENT PERFORMANCE BREAKDOWN"\n`;
    csvContent += `"Code","Document Name","Category","Standard Fee","Total Filed","Completed","In-Progress","Rejected","Completion Rate","Realized Revenue","Free Completed"\n`;
    
    data.documents.forEach((d) => {
      csvContent += `"${d.code}","${d.name}","${d.category}","${d.feeDisplay}","${d.totalRequested}","${d.completed}","${d.inProgress}","${d.rejected}","${d.completionRate}%","PHP ${d.realizedRevenue.toFixed(2)}","${d.freeCompleted}"\n`;
    });

    csvContent += `\n"ITEMIZED COMPLETED AND ISSUED DOCUMENTS LOG"\n`;
    csvContent += `"Tracking Code","Applicant Name","Document Type","Purpose","Fee","Fee Status","Date Filed","Date Completed","Turnaround","Status","Remarks"\n`;
    
    data.completedRecords.forEach((r) => {
      csvContent += `"${r.trackingNumber}","${r.applicant}","${r.documentName}","${r.purpose.replace(/"/g, '""')}","${r.feeDisplay}","${r.feeStatus}","${r.dateFiled}","${r.dateCompleted}","${r.turnaroundDays}","${r.status}","${(r.remarks || '').replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Barangay_Onse_Report_Analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  // Filtered & sorted completed records
  const filteredRecords = useMemo(() => {
    if (!data?.completedRecords) return [];
    let list = [...data.completedRecords];

    if (selectedDocFilter !== 'ALL') {
      list = list.filter((r) => r.documentCode === selectedDocFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.trackingNumber.toLowerCase().includes(q) ||
          r.applicant.toLowerCase().includes(q) ||
          r.documentName.toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q)
      );
    }

    list.sort((a: any, b: any) => {
      let valA = a[recordsSortField] ?? '';
      let valB = b[recordsSortField] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return recordsSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return recordsSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [data?.completedRecords, selectedDocFilter, searchTerm, recordsSortField, recordsSortDir]);

  const paginatedRecords = useMemo(() => {
    const start = (recordsCurrentPage - 1) * recordsPageSize;
    return filteredRecords.slice(start, start + recordsPageSize);
  }, [filteredRecords, recordsCurrentPage, recordsPageSize]);

  const buildBreakdownHref = useCallback(
    (metric: string) => {
      const params = new URLSearchParams();
      params.set('metric', metric);
      params.set('timeframe', timeframe);
      if (timeframe === 'custom') {
        params.set('startDate', customStart);
        params.set('endDate', customEnd);
      } else if (timeframe === 'day') {
        params.set('day', selectedDay);
      } else if (timeframe === 'month') {
        params.set('year', String(selectedYear));
        params.set('month', String(selectedMonth));
      } else if (timeframe === 'quarter') {
        params.set('year', String(selectedYear));
        params.set('quarter', String(selectedQuarter));
      } else if (timeframe === 'year') {
        params.set('year', String(selectedYear));
      }
      return `/admin/reports/breakdown?${params.toString()}`;
    },
    [timeframe, customStart, customEnd, selectedDay, selectedYear, selectedMonth, selectedQuarter]
  );

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* ============================================================== */}
      {/* 1. Header & Actions Bar (Hidden or stylized during Print)      */}
      {/* ============================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/40 pb-6 print:border-b-2 print:border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-[#9C2007] dark:text-rose-400 shrink-0" />
            Report Analytics &amp; Document Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Centralized document issuance statistics, per-document completion velocity, revenue audits, and statutory fee exemption disclosures.
          </p>
        </div>

        {/* Action Buttons (Export, Print, Refresh) */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={fetchReport}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#0E1B33] hover:bg-slate-200 dark:hover:bg-[#152747] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 border border-slate-200 dark:border-blue-900/40 cursor-pointer disabled:opacity-50"
            title="Reload report data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            disabled={!data || isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#0E1B33] hover:bg-slate-200 dark:hover:bg-[#152747] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 border border-slate-200 dark:border-blue-900/40 cursor-pointer disabled:opacity-50"
            title="Export CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={!data || isLoading}
            className="px-4 py-2 rounded-xl bg-[#9C2007] hover:bg-[#821B06] text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            title="Print Official Document Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Printable Official Header (Shows ONLY when printing)            */}
      {/* ============================================================== */}
      <div className="hidden print:block text-center space-y-1 mb-6 border-b pb-4 border-slate-400">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">Republic of the Philippines</p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">City of San Juan • Metro Manila</p>
        <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">BARANGAY ONSE</h2>
        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Office of the Punong Barangay &amp; Civil Registry</p>
        <div className="pt-2 text-sm font-black uppercase text-[#9C2007] underline underline-offset-4">
          Official Document Issuance &amp; Performance Audit Report
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 px-4">
          <span>Reporting Period: <strong>{data?.reportMetadata.periodLabel || 'All Time'}</strong></span>
          <span>Generated On: <strong>{new Date().toLocaleString()}</strong></span>
          <span>Prepared By: <strong>{data?.reportMetadata.generatedBy || 'Administrator'}</strong></span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Interactive Timeframe Granularity Filter                     */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-3 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Audit &amp; Reporting Timeframe Window
            </span>
          </div>

          {/* Granularity Dropdown Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Period:</span>
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer outline-none focus:ring-1 focus:ring-[#9C2007]"
              >
                <option value="all">All Time (Complete Registry)</option>
                <option value="month">Current Month ({initialPh.monthName} {initialPh.year})</option>
                <option value="quarter">Current Quarter (Q{initialPh.quarter} {initialPh.year})</option>
                <option value="year">Full Year (FY {initialPh.year})</option>
                <option value="day">Select Single Day</option>
                <option value="custom">Custom Date Range</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {timeframe === 'month' && (
              <div className="flex items-center gap-1.5 text-xs">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {MONTH_NAMES_FULL.map((name, idx) => (
                    <option key={name} value={idx + 1}>{name}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {timeframe === 'quarter' && (
              <div className="flex items-center gap-1.5 text-xs">
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value={1}>Q1 (Jan – Mar)</option>
                  <option value={2}>Q2 (Apr – Jun)</option>
                  <option value={3}>Q3 (Jul – Sep)</option>
                  <option value={4}>Q4 (Oct – Dec)</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {timeframe === 'year' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>FY {y}</option>
                ))}
              </select>
            )}

            {timeframe === 'day' && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDay(getPhNowParts().dateStr)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1c345f] text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[10px] uppercase transition cursor-pointer"
                >
                  Today
                </button>
              </div>
            )}

            {timeframe === 'custom' && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Current Active Window Banner */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0E1B33]/60 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Active Reporting Scope: <strong className="text-slate-800 dark:text-slate-200">{data?.reportMetadata.periodLabel || 'Compiling...'}</strong></span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {data?.summary.totalApplications || 0} Total Requests Found
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. Top KPI Metric Summary Cards (Clickable Data Source Links)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Filed */}
        <Link
          href={buildBreakdownHref('total-filed')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-1 hover:border-slate-400 dark:hover:border-blue-700 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Filed</span>
            <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {isLoading ? '...' : data?.summary.totalApplications || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Across {data?.summary.totalCatalogedDocuments || 5} Document Types</p>
        </Link>

        {/* Total Completed */}
        <Link
          href={buildBreakdownHref('completed')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-emerald-500/20 dark:border-emerald-800/40 shadow-xs space-y-1 hover:border-emerald-500/60 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Completed &amp; Released</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {isLoading ? '...' : data?.summary.totalCompleted || 0}
          </div>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {data?.summary.overallCompletionRate || 0}% Completion Rate
          </p>
        </Link>

        {/* In-Progress Pipeline */}
        <Link
          href={buildBreakdownHref('in-progress')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-blue-500/20 dark:border-blue-800/40 shadow-xs space-y-1 hover:border-blue-500/60 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 block">In-Progress Queue</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 font-mono">
            {isLoading ? '...' : data?.summary.totalActive || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {data?.summary.totalReady || 0} Ready • {data?.summary.totalProcessing || 0} Proc.
          </p>
        </Link>

        {/* Total Realized Revenue */}
        <Link
          href={buildBreakdownHref('revenue')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-1 hover:border-slate-400 dark:hover:border-blue-700 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Realized Revenue</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {isLoading ? '...' : `₱${(data?.summary.totalRealizedRevenue || 0).toLocaleString()}`}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Clearances &amp; Permits</p>
        </Link>

        {/* Free Grants (RA 11261 / Indigent) */}
        <Link
          href={buildBreakdownHref('free-issuances')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-purple-500/20 dark:border-purple-800/40 shadow-xs space-y-1 hover:border-purple-500/60 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 block">Free Issuances</span>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 font-mono">
            {isLoading ? '...' : data?.summary.totalFreeGrants || 0}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">RA 11261 &amp; Indigency</p>
        </Link>

        {/* Average Turnaround SLA */}
        <Link
          href={buildBreakdownHref('turnaround')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-amber-500/20 dark:border-amber-800/40 shadow-xs space-y-1 hover:border-amber-500/60 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">Avg. Turnaround</span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 font-mono">
            {isLoading ? '...' : `${data?.summary.avgTurnaroundDays || '1.0'} d`}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Intake to Window 2</p>
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 4. Tab Navigation: Performance vs Catalog vs Audit Log        */}
      {/* ============================================================== */}
      <div className="flex border-b border-slate-200 dark:border-blue-900/40 no-print">
        <button
          type="button"
          onClick={() => setActiveTab('performance')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'performance'
              ? 'border-[#9C2007] text-[#9C2007] dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Total per Documents &amp; Completed</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-[#9C2007] text-[#9C2007] dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Document Definitions &amp; Requirements</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit_log')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'audit_log'
              ? 'border-[#9C2007] text-[#9C2007] dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Completed Issuances Log ({data?.completedRecords.length || 0})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TOTAL PER DOCUMENTS & COMPLETED PERFORMANCE            */}
      {/* ============================================================== */}
      {(activeTab === 'performance' || typeof window === 'undefined') && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#9C2007] dark:text-rose-400" />
                  Total Documents Issued &amp; Completion Performance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed breakdown of total requests, successful issuances, completion percentage, and revenue per document code.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {data?.documents.length || 0} Official Documents Cataloged
              </span>
            </div>

            {/* Document Performance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-blue-900/40">
                  <tr>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Standard Fee</th>
                    <th className="py-3 px-4 text-center">Total Filed</th>
                    <th className="py-3 px-4 text-center">Completed</th>
                    <th className="py-3 px-4 text-center">In-Progress</th>
                    <th className="py-3 px-4 text-center">Rejected</th>
                    <th className="py-3 px-4">Completion Velocity</th>
                    <th className="py-3 px-4 text-right">Realized Revenue</th>
                    <th className="py-3 px-4 text-center no-print">Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        Compiling document analytics and issuance records...
                      </td>
                    </tr>
                  ) : !data?.documents || data.documents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        No document records found for the selected reporting period.
                      </td>
                    </tr>
                  ) : (
                    data.documents.map((doc) => (
                      <tr key={doc.code} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{doc.name}</span>
                              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#152747] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40">
                                {doc.code}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-sm">
                              {doc.category}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black ${
                              doc.fee === 0
                                ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                                : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {doc.feeDisplay}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {doc.totalRequested}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-[11px]">
                            {doc.completed}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-blue-600 dark:text-blue-400 font-bold">
                          {doc.inProgress > 0 ? doc.inProgress : '—'}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-rose-600 dark:text-rose-400 font-bold">
                          {doc.rejected > 0 ? doc.rejected : '—'}
                        </td>

                        {/* Completion Rate & Visual Bar */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-600 dark:text-slate-300 font-mono">
                                {doc.completionRate}%
                              </span>
                              <span className="text-slate-400 text-[9px]">
                                {doc.completed} of {doc.totalRequested}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-[#0E1B33] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  doc.completionRate >= 80
                                    ? 'bg-emerald-500'
                                    : doc.completionRate >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, doc.completionRate))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {doc.fee === 0 ? (
                            <span className="text-purple-600 dark:text-purple-400 text-[11px]">
                              FREE ({doc.completed} granted)
                            </span>
                          ) : (
                            `₱${doc.realizedRevenue.toFixed(2)}`
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center no-print">
                          <button
                            type="button"
                            onClick={() => setSelectedDocDetails(doc)}
                            className="p-1.5 text-slate-400 hover:text-[#9C2007] dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#152747] transition cursor-pointer"
                            title="View document requirements & legal details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {data?.documents && data.documents.length > 0 && (
                  <tfoot className="bg-slate-50/80 dark:bg-[#0E1B33]/80 font-bold border-t-2 border-slate-200 dark:border-blue-900/60 text-[11px]">
                    <tr>
                      <td className="py-3 px-4 text-slate-900 dark:text-white uppercase font-black">
                        Total Sum / Registry Totals
                      </td>
                      <td className="py-3 px-4">—</td>
                      <td className="py-3 px-4 text-center font-mono font-black text-slate-900 dark:text-white">
                        {data.summary.totalApplications}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-emerald-700 dark:text-emerald-400">
                        {data.summary.totalCompleted}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-blue-700 dark:text-blue-400">
                        {data.summary.totalActive}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-rose-700 dark:text-rose-400">
                        {data.summary.totalRejected}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-white">
                        {data.summary.overallCompletionRate}% Overall
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                        ₱{data.summary.totalRealizedRevenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center no-print">—</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DOCUMENT DEFINITIONS & "WHAT ARE THE DOCUMENTS" CATALOG */}
      {/* ============================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#9C2007] dark:text-rose-400" />
              Barangay Onse Document Catalog &amp; Documentary Requirements
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete inventory of official barangay issuances, their legal foundations, standard processing turnarounds (SLA), authorized fees, and prerequisites required from resident applicants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.documents.map((doc) => (
              <div
                key={doc.code}
                className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs hover:border-[#9C2007]/40 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-[#152747] text-[#9C2007] dark:text-rose-400 border border-slate-200 dark:border-blue-900/40">
                          {doc.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {doc.processingDays} Business Day Turnaround
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white uppercase mt-1">
                        {doc.name}
                      </h4>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        doc.fee === 0
                          ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                          : 'bg-[#9C2007]/10 text-[#9C2007] dark:text-rose-400 border border-[#9C2007]/20'
                      }`}
                    >
                      {doc.feeDisplay}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {doc.description}
                  </p>

                  {/* Legal Basis */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E1B33]/60 border border-slate-100 dark:border-blue-900/30 text-[11px] space-y-1">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">
                      Category &amp; Statutory Authority
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {doc.category}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                      {doc.legalBasis}
                    </p>
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Required Resident Documents:
                    </span>
                    <ul className="space-y-1 text-xs">
                      {doc.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Total Issued: <strong>{doc.completed}</strong></span>
                  <span>Completion Rate: <strong className="text-emerald-600 dark:text-emerald-400">{doc.completionRate}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: AUDIT REGISTRY - ITEMIZED COMPLETED ISSUANCES           */}
      {/* ============================================================== */}
      {activeTab === 'audit_log' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Itemized Registry of Released Certificates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Audit-ready transaction records of officially signed, sealed, and claimed certificates.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Document Type Filter */}
                <select
                  value={selectedDocFilter}
                  onChange={(e) => {
                    setSelectedDocFilter(e.target.value);
                    setRecordsCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  <option value="ALL">All Document Types</option>
                  {data?.documents.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>

                {/* Search Box */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setRecordsCurrentPage(1);
                    }}
                    placeholder="Search applicant or tracking #..."
                    className="w-48 sm:w-60 pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-blue-900/40">
                  <tr>
                    <TableSortHeader
                      label="Tracking Code"
                      field="trackingNumber"
                      currentField={recordsSortField}
                      currentDirection={recordsSortDir}
                      onSort={handleRecordsSort}
                      className="py-3 px-4"
                    />
                    <TableSortHeader
                      label="Applicant"
                      field="applicant"
                      currentField={recordsSortField}
                      currentDirection={recordsSortDir}
                      onSort={handleRecordsSort}
                      className="py-3 px-4"
                    />
                    <th className="py-3 px-4">Certificate</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4 text-center">Fee</th>
                    <TableSortHeader
                      label="Date Completed"
                      field="dateCompleted"
                      currentField={recordsSortField}
                      currentDirection={recordsSortDir}
                      onSort={handleRecordsSort}
                      className="py-3 px-4"
                    />
                    <th className="py-3 px-4">Turnaround</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        No completed records match the search filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((r) => (
                      <tr key={r.trackingNumber} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">
                          {r.trackingNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {r.applicant}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {r.documentName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={r.purpose}>
                          {r.purpose}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              r.feeStatus === 'FREE'
                                ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300'
                                : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {r.feeDisplay}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {r.dateCompleted}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                          {r.turnaroundDays}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/verify/${r.trackingNumber}`}
                            target="_blank"
                            className="text-[#9C2007] dark:text-rose-400 hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                          >
                            <span>Verify</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredRecords.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-blue-900/40">
                <TablePagination
                  currentPage={recordsCurrentPage}
                  pageSize={recordsPageSize}
                  totalItems={filteredRecords.length}
                  onPageChange={setRecordsCurrentPage}
                  onPageSizeChange={(newSize) => {
                    setRecordsPageSize(newSize);
                    setRecordsCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. Official Signature & Certification Block (For Printing)     */}
      {/* ============================================================== */}
      <div className="hidden print:block pt-8 mt-12 border-t border-slate-400 text-xs">
        <p className="text-[10px] text-slate-500 mb-8 italic">
          I hereby attest that the document issuance statistics and revenue summaries recorded in this official report are accurate reflections of the records in the Barangay Civil Registry.
        </p>

        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <div className="border-b border-slate-800 pb-8 font-bold uppercase text-slate-900">
              {data?.reportMetadata.generatedBy || 'Desk Officer'}
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Prepared By: Records Officer</p>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-800 pb-8 font-bold uppercase text-slate-900">
              Hon. Danilo Florano
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Attested: Committee on Rules</p>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-800 pb-8 font-bold uppercase text-slate-900">
              Hon. Roberto Alba
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Approved: Punong Barangay</p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. Document Specs Detail Modal                                 */}
      {/* ============================================================== */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-blue-900/50">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-[#152747] text-[#9C2007] dark:text-rose-400">
                  {selectedDocDetails.code}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-1">
                  {selectedDocDetails.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Description</span>
                <p className="text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
                  {selectedDocDetails.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0E1B33]">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Official Fee</span>
                  <p className="font-black text-[#9C2007] dark:text-rose-400 text-sm">
                    {selectedDocDetails.feeDisplay}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Standard Turnaround</span>
                  <p className="font-black text-slate-900 dark:text-white text-sm">
                    {selectedDocDetails.processingDays} Business Day
                  </p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Statutory Legal Authority</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  {selectedDocDetails.legalBasis}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                  Prerequisite Documents for Release
                </span>
                <ul className="space-y-1">
                  {selectedDocDetails.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDocDetails(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-[#0E1B33] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#152747] font-bold text-xs uppercase rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

