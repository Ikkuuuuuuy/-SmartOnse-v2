'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Printer, CheckCircle2, Search, X, QrCode, Filter, RefreshCw, Trash2 } from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableSortHeader from '@/components/ui/TableSortHeader';

export interface ClearanceRequest {
  id: string;
  trackingNumber: string;
  fullName: string;
  documentType: string;
  fee: number;
  status: 'PENDING' | 'PROCESSING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'REJECTED';
  purpose: string;
  address: string;
  contactNumber: string;
  createdAt: string;
  remarks?: string | null;
}

const INITIAL_REQUESTS: ClearanceRequest[] = [
  {
    id: '1',
    trackingNumber: 'ONSE-2026-9045',
    fullName: 'Roberto Mendoza',
    documentType: 'Certificate of Residency',
    fee: 30.0,
    status: 'PENDING',
    purpose: 'Opening Bank Account',
    address: '88 Onse Compound, San Juan City',
    contactNumber: '0918-345-6789',
    createdAt: '2026-08-28 14:30',
  },
  {
    id: '2',
    trackingNumber: 'ONSE-2026-9012',
    fullName: 'Maria Clara Santos',
    documentType: 'Certificate of Indigency',
    fee: 0.0,
    status: 'PROCESSING',
    purpose: 'Medical and Hospital Assistance',
    address: '45 Blumentritt St., Barangay Onse, San Juan City',
    contactNumber: '0917-234-5678',
    createdAt: '2026-08-27 11:15',
  },
  {
    id: '3',
    trackingNumber: 'ONSE-2026-8891',
    fullName: 'Juan Dela Cruz',
    documentType: 'Barangay Clearance',
    fee: 50.0,
    status: 'READY_FOR_PICKUP',
    purpose: 'Local Employment Application',
    address: '124 Gomez St., Barangay Onse, San Juan City',
    contactNumber: '0917-123-4567',
    createdAt: '2026-08-27 09:40',
  },
  {
    id: '4',
    trackingNumber: 'ONSE-2026-8840',
    fullName: 'Danilo A. Florano',
    documentType: 'First Time Jobseeker Certificate',
    fee: 0.0,
    status: 'COMPLETED',
    purpose: 'BPO Job Application (R.A. 11261)',
    address: '55 A. Luna St., Barangay Onse',
    contactNumber: '0920-111-9988',
    createdAt: '2026-08-26 16:20',
  },
  {
    id: '5',
    trackingNumber: 'ONSE-2026-8815',
    fullName: 'Crisostomo Ibarra',
    documentType: 'Barangay Business Clearance',
    fee: 250.0,
    status: 'READY_FOR_PICKUP',
    purpose: 'Bakery Business Permit Renewal',
    address: '12 N. Domingo St., Barangay Onse',
    contactNumber: '0919-444-5566',
    createdAt: '2026-08-26 13:05',
  },
  {
    id: '6',
    trackingNumber: 'ONSE-2026-8790',
    fullName: 'Elias Salome',
    documentType: 'Barangay Clearance',
    fee: 50.0,
    status: 'PROCESSING',
    purpose: 'Philippine Passport Renewal',
    address: '204 F. Manalo St., Barangay Onse',
    contactNumber: '0915-333-7711',
    createdAt: '2026-08-25 15:45',
  },
  {
    id: '7',
    trackingNumber: 'ONSE-2026-8755',
    fullName: 'Sisa Tiago',
    documentType: 'Certificate of Indigency',
    fee: 0.0,
    status: 'READY_FOR_PICKUP',
    purpose: 'DSWD AICS Financial Assistance',
    address: '77 Lt. Artiaga St., Barangay Onse',
    contactNumber: '0916-222-8844',
    createdAt: '2026-08-25 10:10',
  },
  {
    id: '8',
    trackingNumber: 'ONSE-2026-8720',
    fullName: 'Basilio M. Evangelista',
    documentType: 'Certificate of Residency',
    fee: 30.0,
    status: 'COMPLETED',
    purpose: 'School Scholarship Requirement',
    address: '109 Gomez St., Barangay Onse',
    contactNumber: '0922-333-4455',
    createdAt: '2026-08-24 14:15',
  },
  {
    id: '9',
    trackingNumber: 'ONSE-2026-8692',
    fullName: 'Crispin M. Evangelista',
    documentType: 'First Time Jobseeker Certificate',
    fee: 0.0,
    status: 'COMPLETED',
    purpose: 'Entry Level IT Trainee (R.A. 11261)',
    address: '109 Gomez St., Barangay Onse',
    contactNumber: '0922-333-4456',
    createdAt: '2026-08-24 11:20',
  },
  {
    id: '10',
    trackingNumber: 'ONSE-2026-8650',
    fullName: 'Paulita Gomez',
    documentType: 'Barangay Clearance',
    fee: 50.0,
    status: 'PENDING',
    purpose: 'Postal ID Application',
    address: '33 J.V. Panganiban St., Barangay Onse',
    contactNumber: '0917-555-6677',
    createdAt: '2026-08-23 16:50',
  },
  {
    id: '11',
    trackingNumber: 'ONSE-2026-8622',
    fullName: 'Isagani R. Villanueva',
    documentType: 'Barangay Clearance',
    fee: 50.0,
    status: 'PROCESSING',
    purpose: 'TIN ID Registration',
    address: '15 Onse Compound, San Juan City',
    contactNumber: '0918-666-7788',
    createdAt: '2026-08-23 10:35',
  },
  {
    id: '12',
    trackingNumber: 'ONSE-2026-8590',
    fullName: 'Donya Victorina Delos Reyes',
    documentType: 'Barangay Business Clearance',
    fee: 250.0,
    status: 'REJECTED',
    purpose: 'Commercial Space Sublease Permit',
    address: '60 Blumentritt St., Barangay Onse',
    contactNumber: '0919-777-8899',
    createdAt: '2026-08-22 17:00',
  },
  {
    id: '13',
    trackingNumber: 'ONSE-2026-8565',
    fullName: 'Tiburcio De Espadaña',
    documentType: 'Certificate of Residency',
    fee: 30.0,
    status: 'COMPLETED',
    purpose: 'Senior Citizen OSCA Registration',
    address: '60 Blumentritt St., Barangay Onse',
    contactNumber: '0920-888-9900',
    createdAt: '2026-08-22 13:40',
  },
  {
    id: '14',
    trackingNumber: 'ONSE-2026-8530',
    fullName: 'Padre Florentino Santos',
    documentType: 'Barangay Clearance',
    fee: 50.0,
    status: 'COMPLETED',
    purpose: 'Legal Affidavit of Guardianship',
    address: '18 N. Domingo St., Barangay Onse',
    contactNumber: '0917-999-0011',
    createdAt: '2026-08-21 09:15',
  },
  {
    id: '15',
    trackingNumber: 'ONSE-2026-8501',
    fullName: 'Simoun Ibarra',
    documentType: 'Barangay Business Clearance',
    fee: 250.0,
    status: 'COMPLETED',
    purpose: 'Jewelry & Gem Trading Shop',
    address: '22 Lt. Artiaga St., Barangay Onse',
    contactNumber: '0918-111-2233',
    createdAt: '2026-08-20 15:25',
  },
  // --- Page 2 items ---
  {
    id: '16',
    trackingNumber: 'ONSE-2026-8480',
    fullName: 'Placido Penitente',
    documentType: 'Certificate of Indigency',
    fee: 0.0,
    status: 'COMPLETED',
    purpose: 'Hospital Confinement Medical Waiver',
    address: '92 A. Luna St., Barangay Onse',
    contactNumber: '0919-222-3344',
    createdAt: '2026-08-19 14:10',
  },
  {
    id: '17',
    trackingNumber: 'ONSE-2026-8452',
    fullName: 'Juli De Dios',
    documentType: 'First Time Jobseeker Certificate',
    fee: 0.0,
    status: 'COMPLETED',
    purpose: 'Nursing Attendant Trainee (R.A. 11261)',
    address: '41 Gomez St., Barangay Onse',
    contactNumber: '0920-333-4455',
    createdAt: '2026-08-18 11:30',
  },
  {
    id: '18',
    trackingNumber: 'ONSE-2026-8420',
    fullName: 'Kabesang Tales',
    documentType: 'Barangay Incident / Blotter Certification',
    fee: 100.0,
    status: 'COMPLETED',
    purpose: 'Property Boundary Dispute Documentation',
    address: '41 Gomez St., Barangay Onse',
    contactNumber: '0921-444-5566',
    createdAt: '2026-08-17 16:45',
  },
  {
    id: '19',
    trackingNumber: 'ONSE-2026-8395',
    fullName: 'Tandang Selo',
    documentType: 'Certificate of Indigency',
    fee: 0.0,
    status: 'COMPLETED',
    purpose: 'Dialysis Treatment Subsidy',
    address: '41 Gomez St., Barangay Onse',
    contactNumber: '0922-555-6677',
    createdAt: '2026-08-16 10:00',
  },
  {
    id: '20',
    trackingNumber: 'ONSE-2026-8360',
    fullName: 'Macaraig San Pedro',
    documentType: 'Certificate of Residency',
    fee: 30.0,
    status: 'COMPLETED',
    purpose: 'Driver License Application (LTO)',
    address: '112 F. Manalo St., Barangay Onse',
    contactNumber: '0923-666-7788',
    createdAt: '2026-08-15 15:10',
  },
  {
    id: '21',
    trackingNumber: 'ONSE-2026-8325',
    fullName: 'Sandoval Rivera',
    documentType: 'Barangay Clearance',
    fee: 50.0,
    status: 'COMPLETED',
    purpose: 'Civil Service Examination Requirement',
    address: '78 J.V. Panganiban St., Barangay Onse',
    contactNumber: '0924-777-8899',
    createdAt: '2026-08-14 09:25',
  },
  {
    id: '22',
    trackingNumber: 'ONSE-2026-8290',
    fullName: 'Pecson Alcantara',
    documentType: 'Barangay Clearance',
    fee: 50.0,
    status: 'COMPLETED',
    purpose: 'NBI Clearance Renewal Supporting Doc',
    address: '5 Blumentritt St., Barangay Onse',
    contactNumber: '0925-888-9900',
    createdAt: '2026-08-13 14:00',
  },
];

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ClearanceRequest[]>(INITIAL_REQUESTS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // default new to old
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedRequest, setSelectedRequest] = useState<ClearanceRequest | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/requests');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error('Failed to fetch requests from API:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: string, newStatus: any) => {
    // Optimistic UI update
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await fetch('/api/admin/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to persist status change:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteRequest = async (id: string, trackingNumber: string) => {
    if (!window.confirm(`Are you sure you want to remove request ${trackingNumber}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/requests?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(data.error || 'Failed to delete request.');
      }
    } catch (err) {
      console.error('Failed to delete request:', err);
      alert('An error occurred while deleting request.');
    }
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

  // Filtering + Sorting
  const processedRequests = useMemo(() => {
    return requests
      .filter((r) => {
        const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          r.trackingNumber.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q) ||
          r.documentType.toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q);
        return matchesStatus && matchesSearch;
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
  }, [requests, searchTerm, statusFilter, sortField, sortDirection]);

  // Paginated items
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedRequests.slice(startIndex, startIndex + pageSize);
  }, [processedRequests, currentPage, pageSize]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Document Review Pipeline
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Barangay Onse</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Clearance Requests Queue
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchRequests}
            disabled={isLoading}
            className="px-3.5 py-2 bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Refresh requests from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <div className="px-4 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300">
            Total Requests: <strong className="text-slate-900 dark:text-white">{requests.length}</strong>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        {/* Search, Filter & Controls Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by tracking code, applicant name, purpose, or address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-[#9C2007] outline-none"
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

          {/* Status Filter Dropdown & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer outline-none focus:ring-1 focus:ring-[#9C2007]"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
              <tr>
                <TableSortHeader
                  field="trackingNumber"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Tracking Code"
                />
                <TableSortHeader
                  field="fullName"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Applicant"
                />
                <TableSortHeader
                  field="documentType"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Document Type"
                />
                <TableSortHeader
                  field="purpose"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Purpose"
                />
                <TableSortHeader
                  field="fee"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Fee"
                />
                <TableSortHeader
                  field="createdAt"
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
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No clearance requests found matching your filter.
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">
                      {r.trackingNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{r.fullName}</div>
                      <div className="text-[10px] text-slate-400">{r.contactNumber}</div>
                    </td>
                    <td className="py-3.5 px-4">{r.documentType}</td>
                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-500 dark:text-slate-400" title={r.purpose}>
                      {r.purpose}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                      {r.fee === 0 ? 'FREE' : `₱${r.fee.toFixed(2)}`}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {r.createdAt}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={r.status}
                        onChange={(e) => updateStatus(r.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap inline-block ${
                          r.status === 'READY_FOR_PICKUP'
                            ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                            : r.status === 'PROCESSING'
                            ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/40'
                            : r.status === 'COMPLETED'
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/40'
                            : r.status === 'REJECTED'
                            ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/40'
                            : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40'
                        } cursor-pointer outline-none`}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedRequest(r)}
                          className="px-3 py-1.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-lg font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer shadow-xs transition"
                          title="Print official document certificate"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(r.id, r.trackingNumber)}
                          className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
                          title="Cancel or delete request"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={processedRequests.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => setPageSize(size)}
        />
      </div>

      {/* PRINT CERTIFICATE MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-blue-900/50 my-8">
            <div className="flex justify-between items-center no-print">
              <h3 className="font-black text-slate-900 dark:text-white uppercase">Printable Official Certificate</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Certificate Paper */}
            <div className="border-4 border-double border-[#9C2007] p-8 sm:p-12 space-y-6 text-slate-900 bg-white">
              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-[#9C2007] pb-4">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden p-1 bg-white">
                    <img src="/images/barangay-onse-seal.png" alt="Barangay Onse Seal" className="w-full h-full object-contain" />
                  </div>
                </div>
                <p className="text-xs uppercase font-semibold text-slate-600">Republic of the Philippines &bull; City of San Juan</p>
                <h2 className="text-xl font-black uppercase text-[#9C2007]">OFFICE OF THE PUNONG BARANGAY</h2>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">BARANGAY ONSE</p>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h1 className="text-2xl font-black uppercase tracking-wider underline decoration-[#9C2007] decoration-2">
                  {selectedRequest.documentType}
                </h1>
                <p className="text-xs font-mono font-bold text-slate-500 mt-1">
                  Control No: {selectedRequest.trackingNumber}
                </p>
              </div>

              {/* Body */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify">
                <p>
                  <strong>TO WHOM IT MAY CONCERN:</strong>
                </p>
                <p>
                  This is to certify that <strong>{selectedRequest.fullName.toUpperCase()}</strong>, of legal age, is a bonafide resident of <strong>{selectedRequest.address}</strong>, Barangay Onse, San Juan City.
                </p>
                <p>
                  Based on records of this office, the aforementioned individual is known to be of good moral character, a law-abiding citizen, and has no derogatory records or pending criminal case filed in the Lupong Tagapamayapa.
                </p>
                <p>
                  This certification is issued upon the request of the interested party for the purpose of <strong>{selectedRequest.purpose.toUpperCase()}</strong> and for whatever legal purposes it may serve.
                </p>
                <p>
                  Issued this <strong>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> at Barangay Onse, San Juan City, Metro Manila.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                  <p className="font-bold uppercase">Applicant Signature</p>
                </div>
                <div>
                  <p className="font-black text-sm uppercase text-[#9C2007]">HON. ALEJANDRO SANTOS</p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase">Punong Barangay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
