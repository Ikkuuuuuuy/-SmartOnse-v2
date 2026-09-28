'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  X,
  Search,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  Loader2,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Eye,
  FileCheck2,
  UserPlus
} from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: string;
  inhabitant: { rbiNumber: string } | null;
}

export default function AdminVerificationsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'name' | 'email'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedUserForId, setSelectedUserForId] = useState<PendingUser | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/residents?type=pending');
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch {
      showToast('Failed to load pending registrations.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleAction = async (userId: string, userName: string, action: 'approve' | 'reject') => {
    const confirmed =
      action === 'reject'
        ? confirm(`Reject and permanently remove ${userName}'s registration?`)
        : true;

    if (!confirmed) return;

    setActionLoading(userId + action);
    try {
      const res = await fetch(`/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, 'success');
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (selectedUserForId?.id === userId) {
          setSelectedUserForId(null);
        }
      } else {
        showToast(data.error || 'Action failed.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSort = (field: 'createdAt' | 'name' | 'email') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const processedUsers = useMemo(() => {
    return users
      .filter((u) => {
        const q = searchTerm.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.address ?? '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField] ?? '';
        let valB = b[sortField] ?? '';

        if (sortField === 'createdAt') {
          const timeA = new Date(valA).getTime();
          const timeB = new Date(valB).getTime();
          return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
        }

        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [users, searchTerm, sortField, sortDirection]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, currentPage, pageSize]);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[999] px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200 ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-950/20'
              : 'bg-rose-600 text-white shadow-rose-950/20'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldAlert className="w-4 h-4 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/50 px-2.5 py-0.5 rounded-full">
              Registration & Census Queue
            </span>
            <span className="text-[10px] font-bold text-slate-400">•</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Barangay Onse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Pending Resident Verifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Inspect uploaded Government or Student IDs and approve registrations into the Barangay Registry of Inhabitants (RBI).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-black text-amber-800 dark:text-amber-300">
              {users.length} Pending
            </span>
          </div>
          <button
            onClick={fetchPending}
            className="p-2.5 bg-slate-100 dark:bg-[#0E1B33] hover:bg-slate-200 dark:hover:bg-[#152747] text-slate-600 dark:text-slate-300 rounded-2xl transition cursor-pointer border border-transparent dark:border-blue-900/40"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="text-xs space-y-0.5">
          <p className="font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider">
            Dual-Action Verification & Census Enrollment
          </p>
          <p className="text-blue-700 dark:text-blue-400 leading-relaxed">
            Existing residents already in the printed census are auto-approved instantly. Applicants listed below are <strong>new transferees, renters, or students</strong>.
            Click <strong className="text-emerald-700 dark:text-emerald-300">Inspect ID</strong> to review their document, then click <strong className="text-emerald-700 dark:text-emerald-300">Approve & Enroll in Census</strong> to generate an official <strong>RBI Census Number</strong> automatically!
          </p>
        </div>
      </div>

      {/* Search & Sort Toolbar */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by applicant name, email, or address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-[#9C2007] outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sort by:</span>
            <button
              onClick={() => handleSort('createdAt')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                sortField === 'createdAt'
                  ? 'bg-[#9C2007] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>Date</span>
              {sortField === 'createdAt' ? (
                sortDirection === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              )}
            </button>

            <button
              onClick={() => handleSort('name')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                sortField === 'name'
                  ? 'bg-[#9C2007] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300'
              }`}
            >
              <span>Name</span>
              {sortField === 'name' ? (
                sortDirection === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowUpDown className="w-3 h-3 opacity-60" />
              )}
            </button>
          </div>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="flex items-center justify-center py-16 space-x-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-bold">Loading pending registrations...</span>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {searchTerm ? 'No results found' : 'All Clear!'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {searchTerm
                  ? 'Try a different search term.'
                  : 'No pending resident registrations at this time.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedUsers.map((u) => {
              const isApproving = actionLoading === u.id + 'approve';
              const isRejecting = actionLoading === u.id + 'reject';
              return (
                <div
                  key={u.id}
                  className="border border-amber-200 dark:border-amber-800/40 bg-amber-50/40 dark:bg-amber-950/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-400 dark:hover:border-amber-600 transition"
                >
                  {/* Info */}
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{u.name}</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/50 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase">
                        Pending Census Enrollment
                      </span>
                      {u.avatarUrl ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                          <FileCheck2 className="w-3 h-3" /> ID Attached
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                          No ID Uploaded
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate font-mono">{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="font-mono">{u.phone}</span>
                        </div>
                      )}
                      {u.address && (
                        <div className="flex items-center gap-1.5 sm:col-span-2">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{u.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>Registered: {formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {u.avatarUrl && (
                      <button
                        onClick={() => setSelectedUserForId(u)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect ID
                      </button>
                    )}

                    <button
                      onClick={() => handleAction(u.id, u.name, 'approve')}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-sm shadow-emerald-900/20"
                    >
                      {isApproving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <UserPlus className="w-3.5 h-3.5" />
                      )}
                      Approve & Enroll in Census
                    </button>

                    <button
                      onClick={() => handleAction(u.id, u.name, 'reject')}
                      disabled={!!actionLoading}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900/60 disabled:opacity-50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                      {isRejecting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reusable Pagination */}
        {processedUsers.length > 0 && (
          <TablePagination
            currentPage={currentPage}
            totalItems={processedUsers.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        )}
      </div>

      {/* ID Inspection Modal */}
      {selectedUserForId && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-[#0E1B33] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-900/60 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-blue-900/40 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400">
                  Document Inspection
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedUserForId.name}&apos;s Submitted ID
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForId(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-[#152747] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-2xl p-2 flex items-center justify-center overflow-hidden max-h-[360px] border border-slate-800">
              {selectedUserForId.avatarUrl ? (
                <img
                  src={selectedUserForId.avatarUrl}
                  alt={`${selectedUserForId.name} ID`}
                  className="max-h-[340px] w-auto object-contain rounded-lg"
                />
              ) : (
                <div className="py-12 text-slate-400 text-xs font-bold">No image file found.</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-[#152747] p-3.5 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Applicant</span>
                <p className="font-black text-slate-900 dark:text-white">{selectedUserForId.name}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedUserForId.phone || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Address Provided</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{selectedUserForId.address || 'Barangay Onse, San Juan City'}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedUserForId(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-900/60 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#152747] transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => handleAction(selectedUserForId.id, selectedUserForId.name, 'approve')}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-emerald-900/20"
              >
                <UserPlus className="w-4 h-4" />
                Approve & Enroll in Census
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
