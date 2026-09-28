'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Search, CheckCircle2, Clock, QrCode, AlertCircle, Calendar, User, FileText, ArrowRight, PlusCircle, Filter, X } from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';

interface TrackedDocument {
  id: string;
  trackingNumber: string;
  fullName: string;
  documentType: string;
  documentTypeCode: string;
  fee: number;
  purpose: string;
  address: string;
  contactNumber: string;
  email?: string;
  status: 'PENDING' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'REJECTED';
  remarks?: string | null;
  pickupDate?: string | null;
  createdAt: string;
}

function TrackContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('trackingNumber') || '');
  const [docData, setDocData] = useState<TrackedDocument | null>(null);
  const [userRequests, setUserRequests] = useState<TrackedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Table Filtering & Pagination State
  const [tableSearchTerm, setTableSearchTerm] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('ALL');
  const [tableCurrentPage, setTableCurrentPage] = useState(1);
  const [tablePageSize, setTablePageSize] = useState(5);

  // Fetch logged in resident's requested documents
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/documents?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.requests)) {
            setUserRequests(data.requests);
            // If no trackingNumber in URL and we haven't loaded any doc yet, load latest requested doc
            const codeParam = searchParams.get('trackingNumber');
            if (!codeParam && data.requests.length > 0 && !docData) {
              setTrackingNumber(data.requests[0].trackingNumber);
              handleSearch(data.requests[0].trackingNumber);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSearch = async (code?: string) => {
    const val = (code !== undefined ? code : trackingNumber).trim().toUpperCase();
    if (!val) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/documents?trackingNumber=${encodeURIComponent(val)}`);
      const data = await res.json();

      if (!res.ok || !data.success || !data.request) {
        setDocData(null);
        setErrorMsg(`No document request found for tracking code "${val}". Please double check your code or file a new request.`);
      } else {
        setDocData(data.request);
      }
    } catch (err: unknown) {
      setDocData(null);
      setErrorMsg('Failed to look up document tracking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const codeParam = searchParams.get('trackingNumber');
    if (codeParam) {
      setTrackingNumber(codeParam);
      handleSearch(codeParam);
    } else if (!user) {
      handleSearch('ONSE-2026-8891');
    }
  }, [searchParams, user]);

  const getStepStatus = (step: number) => {
    if (!docData) return 'upcoming';
    const status = docData.status;

    if (status === 'REJECTED') return 'rejected';

    if (step === 1) return 'completed'; // Received
    if (step === 2) return ['PROCESSING', 'READY_FOR_PICKUP', 'COMPLETED'].includes(status) ? 'completed' : 'active';
    if (step === 3) return ['READY_FOR_PICKUP', 'COMPLETED'].includes(status) ? 'completed' : 'upcoming';
    if (step === 4) return status === 'COMPLETED' ? 'completed' : 'upcoming';

    return 'upcoming';
  };

  // Table Filtering & Pagination
  const filteredUserRequests = useMemo(() => {
    return userRequests.filter((req) => {
      const matchesStatus = tableStatusFilter === 'ALL' || req.status === tableStatusFilter;
      const q = tableSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.trackingNumber.toLowerCase().includes(q) ||
        req.documentType.toLowerCase().includes(q) ||
        (req.purpose && req.purpose.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [userRequests, tableSearchTerm, tableStatusFilter]);

  const paginatedUserRequests = useMemo(() => {
    const startIndex = (tableCurrentPage - 1) * tablePageSize;
    return filteredUserRequests.slice(startIndex, startIndex + tablePageSize);
  }, [filteredUserRequests, tableCurrentPage, tablePageSize]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/40 text-[10px] font-black rounded-full uppercase whitespace-nowrap inline-block">PENDING REVIEW</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800/40 text-[10px] font-black rounded-full uppercase whitespace-nowrap inline-block">PROCESSING</span>;
      case 'READY_FOR_PICKUP':
        return <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/40 text-[10px] font-black rounded-full uppercase whitespace-nowrap inline-block">READY FOR PICKUP</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800/40 text-[10px] font-black rounded-full uppercase whitespace-nowrap inline-block">COMPLETED &amp; RELEASED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/40 text-[10px] font-black rounded-full uppercase whitespace-nowrap inline-block">DISAPPROVED</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] font-black rounded-full uppercase whitespace-nowrap inline-block">{status}</span>;
    }
  };

  return (
    <div className="pt-32 md:pt-40 pb-20 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">

        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-[#9C2007]/10 dark:bg-rose-950/60 px-3 py-1 rounded-full">
            Real-Time Tracking &bull; Central Registry
          </span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase">Track Document Request</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Enter your ONSE tracking number to view real-time verification and release status.
          </p>
        </div>

        {/* Logged in Resident's Requested Documents - Paginated Table with Filters */}
        {user && (
          <div className="bg-white dark:bg-[#0E1B33] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-5">
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-blue-900/40">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#9C2007] dark:text-rose-400" />
                  <span>Your Requested Documents</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select any of your applications below to view real-time tracking progress.
                </p>
              </div>
              <Link
                href="/portal/request"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Request New Document</span>
              </Link>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearchTerm}
                  onChange={(e) => {
                    setTableSearchTerm(e.target.value);
                    setTableCurrentPage(1);
                  }}
                  placeholder="Search tracking code, type, purpose..."
                  className="w-full pl-10 pr-8 py-2 bg-slate-50 dark:bg-[#080E1A] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
                {tableSearchTerm && (
                  <button
                    onClick={() => {
                      setTableSearchTerm('');
                      setTableCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status:</span>
                <select
                  value={tableStatusFilter}
                  onChange={(e) => {
                    setTableStatusFilter(e.target.value);
                    setTableCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-[#080E1A] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer outline-none focus:ring-1 focus:ring-[#9C2007]"
                >
                  <option value="ALL">All Statuses ({userRequests.length})</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                  <option value="COMPLETED">Completed &amp; Released</option>
                  <option value="REJECTED">Disapproved</option>
                </select>
              </div>
            </div>

            {/* Requested Documents Table */}
            {userRequests.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">You haven&apos;t filed any document requests yet.</p>
                <Link
                  href="/portal/request"
                  className="text-xs font-bold text-[#9C2007] dark:text-rose-400 hover:underline inline-block"
                >
                  File your first document request &rarr;
                </Link>
              </div>
            ) : filteredUserRequests.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No requested documents match your search or status filter.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-blue-900/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                      <tr>
                        <th className="py-3 px-4">Tracking Code</th>
                        <th className="py-3 px-4">Document Type</th>
                        <th className="py-3 px-4">Purpose</th>
                        <th className="py-3 px-4">Date Filed</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                      {paginatedUserRequests.map((req) => {
                        const isCurrent = docData?.trackingNumber === req.trackingNumber;
                        return (
                          <tr
                            key={req.id || req.trackingNumber}
                            className={`transition-colors ${
                              isCurrent
                                ? 'bg-rose-50/70 dark:bg-rose-950/40 font-bold'
                                : 'hover:bg-slate-50/80 dark:hover:bg-[#152747]/60'
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono font-black text-[#9C2007] dark:text-rose-400 text-xs">
                              {req.trackingNumber}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {req.documentType}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-[180px] truncate" title={req.purpose}>
                              {req.purpose}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {getStatusBadge(req.status)}
                            </td>
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  setTrackingNumber(req.trackingNumber);
                                  handleSearch(req.trackingNumber);
                                }}
                                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider ${
                                  isCurrent
                                    ? 'bg-[#9C2007] text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-[#080E1A] hover:bg-[#9C2007] text-slate-700 dark:text-slate-300 hover:text-white'
                                }`}
                              >
                                <span>{isCurrent ? 'Viewing' : 'Track'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                <TablePagination
                  currentPage={tableCurrentPage}
                  totalItems={filteredUserRequests.length}
                  pageSize={tablePageSize}
                  onPageChange={(p) => setTableCurrentPage(p)}
                  onPageSizeChange={(s) => {
                    setTablePageSize(s);
                    setTableCurrentPage(1);
                  }}
                  pageSizeOptions={[5, 10, 15]}
                />
              </div>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="bg-white dark:bg-[#0E1B33] rounded-2xl p-2.5 border border-slate-200 dark:border-blue-900/50 shadow-sm flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. ONSE-2026-8891"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white font-bold text-xs uppercase rounded-xl cursor-pointer transition disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Tracking Lookup Notice</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {docData && (
          <div className="bg-white dark:bg-[#0E1B33] rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-sm overflow-hidden space-y-6">
            <div className="bg-slate-950 dark:bg-[#050B14] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Official Tracking Code</span>
                <h3 className="text-2xl font-black font-mono tracking-tight">{docData.trackingNumber}</h3>
                <p className="text-xs text-slate-300 font-semibold mt-0.5">{docData.documentType}</p>
              </div>
              <div>
                {getStatusBadge(docData.status)}
              </div>
            </div>

            {/* 4 Step Progress Flow */}
            <div className="px-6 py-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
                <div
                  className={`p-3 rounded-xl border font-bold transition ${
                    getStepStatus(1) === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-[#152747] border-slate-200 dark:border-blue-900/40 text-slate-400'
                  }`}
                >
                  1. Received
                </div>
                <div
                  className={`p-3 rounded-xl border font-bold transition ${
                    getStepStatus(2) === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                      : getStepStatus(2) === 'active'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800/60 text-blue-800 dark:text-blue-300 ring-2 ring-blue-400/20'
                      : 'bg-slate-50 dark:bg-[#152747] border-slate-200 dark:border-blue-900/40 text-slate-400'
                  }`}
                >
                  2. Processing
                </div>
                <div
                  className={`p-3 rounded-xl border font-bold transition ${
                    getStepStatus(3) === 'completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-400/20'
                      : 'bg-slate-50 dark:bg-[#152747] border-slate-200 dark:border-blue-900/40 text-slate-400'
                  }`}
                >
                  3. Ready for Pickup
                </div>
                <div
                  className={`p-3 rounded-xl border font-bold transition ${
                    getStepStatus(4) === 'completed'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800/60 text-purple-800 dark:text-purple-300'
                      : 'bg-slate-50 dark:bg-[#152747] border-slate-200 dark:border-blue-900/40 text-slate-400'
                  }`}
                >
                  4. Completed
                </div>
              </div>
            </div>

            {/* Document Details Table */}
            <div className="mx-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-xs space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Applicant Name</span>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{docData.fullName}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Official Fee</span>
                  <p className="font-bold text-[#9C2007] dark:text-rose-400">
                    {docData.fee === 0 ? 'FREE / EXEMPTED' : `₱${docData.fee.toFixed(2)}`}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Purpose</span>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">{docData.purpose}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Date Filed</span>
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    {new Date(docData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {docData.remarks && (
                <div className="pt-3 border-t border-slate-200 dark:border-blue-900/40">
                  <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px]">Desk Officer Remarks:</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 italic">{docData.remarks}</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 border-t border-slate-100 dark:border-blue-900/40 pt-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
              <Link
                href={`/verify/${docData.trackingNumber}`}
                className="text-[#9C2007] dark:text-rose-400 font-bold flex items-center gap-1.5 hover:underline"
              >
                <QrCode className="w-4 h-4" /> View Digital Verification Record
              </Link>
              <span className="text-slate-400 text-[11px]">
                Barangay Hall Window 2 &bull; Mon-Fri 8:00 AM - 5:00 PM
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Loading tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
