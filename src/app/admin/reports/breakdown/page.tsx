'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Database,
  Search,
  Download,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Gift,
  Timer,
  Info,
} from 'lucide-react';

interface SourceRecord {
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
}

interface BreakdownApiResponse {
  success: boolean;
  reportMetadata: {
    periodLabel: string;
    timeframe: string;
  };
  summary: {
    totalApplications: number;
    totalCompleted: number;
    totalActive: number;
    totalRealizedRevenue: number;
    totalFreeGrants: number;
    avgTurnaroundDays: string;
    totalReady: number;
    totalProcessing: number;
    totalPending: number;
    totalRejected: number;
    overallCompletionRate: number;
  };
  sourceRecords: SourceRecord[];
}

const METRIC_META: Record<
  string,
  {
    title: string;
    subtitle: string;
    sourceRule: string;
    accentClass: string;
    badgeClass: string;
  }
> = {
  'total-filed': {
    title: 'Total Filed Requests',
    subtitle: 'Every certificate & clearance application submitted within the selected reporting window.',
    sourceRule: 'Source: DocumentRequest table — all statuses (PENDING, PROCESSING, READY_FOR_PICKUP, COMPLETED, REJECTED) created within the active Philippine Time window.',
    accentClass: 'text-slate-900 dark:text-white',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  },
  completed: {
    title: 'Completed & Released',
    subtitle: 'Applications officially verified, signed, and released to residents.',
    sourceRule: 'Source: DocumentRequest table filtered where status = "COMPLETED". Completion Rate = (Completed / Total Filed) × 100.',
    accentClass: 'text-emerald-700 dark:text-emerald-400',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  'in-progress': {
    title: 'In-Progress Queue',
    subtitle: 'Active applications currently pending review, being processed, or ready for pickup at Window 2.',
    sourceRule: 'Source: DocumentRequest table filtered where status IN ("PENDING", "PROCESSING", "READY_FOR_PICKUP").',
    accentClass: 'text-blue-700 dark:text-blue-400',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  },
  pending: {
    title: 'Pending Applications',
    subtitle: 'Newly filed resident applications awaiting initial desk officer review.',
    sourceRule: 'Source: DocumentRequest table filtered where status = "PENDING" within the active reporting window.',
    accentClass: 'text-amber-700 dark:text-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  },
  ready: {
    title: 'Ready for Pickup',
    subtitle: 'Printed and sealed certificates awaiting resident claiming at Window 2.',
    sourceRule: 'Source: DocumentRequest table filtered where status = "READY_FOR_PICKUP" within the active reporting window.',
    accentClass: 'text-blue-700 dark:text-blue-400',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  },
  revenue: {
    title: 'Realized Revenue',
    subtitle: 'Fees collected from paid clearances and permits that are ready for pickup or completed.',
    sourceRule: 'Source: Sum of DocumentType.fee for DocumentRequest rows where status IN ("COMPLETED", "READY_FOR_PICKUP") AND DocumentType.fee > 0.',
    accentClass: 'text-slate-900 dark:text-white',
    badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  },
  'free-issuances': {
    title: 'Free Issuances (Statutory Exemptions)',
    subtitle: 'Zero-fee certificates granted under R.A. 11261 (First Time Jobseekers) and Certificates of Indigency.',
    sourceRule: 'Source: DocumentRequest rows where status = "COMPLETED" AND DocumentType.fee = 0.',
    accentClass: 'text-purple-700 dark:text-purple-400',
    badgeClass: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  },
  turnaround: {
    title: 'Average Turnaround Time',
    subtitle: 'Mean processing duration from resident intake (createdAt) to official completion (updatedAt).',
    sourceRule: 'Source: Mean of (updatedAt − createdAt) in days across DocumentRequest rows where status = "COMPLETED".',
    accentClass: 'text-amber-700 dark:text-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  },
};

const METRIC_TABS = [
  { key: 'total-filed', label: 'Total Filed', icon: FileText },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  { key: 'in-progress', label: 'In-Progress', icon: Clock },
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'ready', label: 'Ready for Pickup', icon: CheckCircle2 },
  { key: 'revenue', label: 'Revenue', icon: DollarSign },
  { key: 'free-issuances', label: 'Free Issuances', icon: Gift },
  { key: 'turnaround', label: 'Turnaround', icon: Timer },
];

function getStatusPill(status: string) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
    case 'READY_FOR_PICKUP':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
    case 'PROCESSING':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}

function BreakdownContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const metric = (searchParams.get('metric') || 'total-filed').toLowerCase();
  const meta = METRIC_META[metric] || METRIC_META['total-filed'];

  const [data, setData] = useState<BreakdownApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const queryString = useMemo(() => {
    const p = new URLSearchParams(searchParams.toString());
    if (!p.get('metric')) p.set('metric', metric);
    return p.toString();
  }, [searchParams, metric]);

  useEffect(() => {
    let active = true;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/reports?${queryString}`);
        if (!res.ok) throw new Error(`Failed to load source records (Status: ${res.status})`);
        const json = await res.json();
        if (active) setData(json);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load breakdown data');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [queryString]);

  const filteredRecords = useMemo(() => {
    const records = data?.sourceRecords || [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.trackingNumber.toLowerCase().includes(q) ||
        r.applicant.toLowerCase().includes(q) ||
        r.documentName.toLowerCase().includes(q) ||
        r.purpose.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const switchMetric = (nextMetric: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set('metric', nextMetric);
    router.push(`/admin/reports/breakdown?${p.toString()}`);
  };

  const handleExportCsv = () => {
    if (!filteredRecords.length) return;
    const headers = [
      'Tracking Number',
      'Applicant',
      'Document Type',
      'Purpose',
      'Fee',
      'Status',
      'Date Filed (PHT)',
      'Last Updated (PHT)',
      'Turnaround',
    ];
    const rows = filteredRecords.map((r) => [
      r.trackingNumber,
      r.applicant,
      r.documentName,
      r.purpose,
      r.feeDisplay,
      r.status,
      r.dateFiled,
      r.dateCompleted,
      r.turnaroundDays,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartonse-${metric}-breakdown.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const headlineValue = useMemo(() => {
    if (!data) return '...';
    switch (metric) {
      case 'total-filed':
        return String(data.summary.totalApplications);
      case 'completed':
        return `${data.summary.totalCompleted} (${data.summary.overallCompletionRate}%)`;
      case 'in-progress':
        return String(data.summary.totalActive);
      case 'pending':
        return String(data.summary.totalPending);
      case 'ready':
        return String(data.summary.totalReady);
      case 'revenue':
        return `₱${data.summary.totalRealizedRevenue.toLocaleString()}`;
      case 'free-issuances':
        return String(data.summary.totalFreeGrants);
      case 'turnaround':
        return `${data.summary.avgTurnaroundDays} d`;
      default:
        return String(filteredRecords.length);
    }
  }, [data, metric, filteredRecords.length]);

  return (
    <div className="space-y-6">
      {/* Header & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9C2007] dark:text-rose-400 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Report Analytics
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              {meta.title}
            </h1>
            <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${meta.badgeClass}`}>
              {headlineValue}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{meta.subtitle}</p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          disabled={!filteredRecords.length}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#9C2007] hover:bg-[#821a05] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export Source CSV
        </button>
      </div>

      {/* Metric Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {METRIC_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = metric === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchMetric(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                active
                  ? 'bg-[#9C2007] text-white border-[#9C2007]'
                  : 'bg-white dark:bg-[#0B1528] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-blue-900/40 hover:border-slate-300 dark:hover:border-blue-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Data Provenance / Audit Explanation Card */}
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
            <Database className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
            Data Origin &amp; Calculation Rule
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Scope: <strong className="text-slate-800 dark:text-slate-200">{data?.reportMetadata.periodLabel || 'Loading...'}</strong>
          </span>
        </div>
        <div className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0E1B33] p-3 rounded-xl border border-slate-100 dark:border-blue-900/30">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <span>{meta.sourceRule}</span>
        </div>
      </div>

      {/* Source Records Table */}
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-blue-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Underlying Source Records ({filteredRecords.length})
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Individual certificate requests contributing to this metric
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracking code, applicant..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="p-10 flex items-center justify-center gap-2 text-xs text-slate-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading underlying database records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400">
            No matching source records found for this metric and timeframe.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0E1B33] text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-blue-900/40">
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Filed (PHT)</th>
                  <th className="py-3 px-4">Updated (PHT)</th>
                  <th className="py-3 px-4 text-right">Turnaround</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                {filteredRecords.map((rec) => (
                  <tr
                    key={rec.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#0E1B33]/60 transition"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400 whitespace-nowrap">
                      {rec.trackingNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {rec.applicant}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {rec.documentName}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[220px] truncate" title={rec.purpose}>
                      {rec.purpose}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold whitespace-nowrap">
                      {rec.fee === 0 ? (
                        <span className="text-purple-600 dark:text-purple-400">FREE</span>
                      ) : (
                        rec.feeDisplay
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusPill(rec.status)}`}>
                        {rec.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {rec.dateFiled}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {rec.dateCompleted}
                    </td>
                    <td className="py-3 px-4 font-mono text-right text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {rec.turnaroundDays}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReportBreakdownPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 flex items-center justify-center gap-2 text-xs text-slate-500">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading data breakdown...
        </div>
      }
    >
      <BreakdownContent />
    </Suspense>
  );
}
