'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList,
  ShieldCheck, 
  Search, 
  Download, 
  Clock, 
  User, 
  FileText,
  Filter,
  X
} from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableSortHeader from '@/components/ui/TableSortHeader';

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  actor: string;
  ip: string;
  timestamp: string;
}

const INITIAL_LOGS: AuditLog[] = [
  { id: 'LOG-8915', action: 'CLEARANCE_APPROVED', details: 'Approved Barangay Clearance #ONSE-2026-9045 for Roberto Mendoza', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-28 17:15:02' },
  { id: 'LOG-8914', action: 'RESIDENT_VERIFIED', details: 'KYC Address verification approved for Alfonso V. Quintero', actor: 'Jonathan D. Sorio (Staff)', ip: '192.168.1.12', timestamp: '2026-08-28 16:48:30' },
  { id: 'LOG-8913', action: 'CLEARANCE_APPROVED', details: 'Approved Certificate of Indigency #ONSE-2026-9012 for Maria Clara Santos', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-28 16:32:10' },
  { id: 'LOG-8912', action: 'LEDGER_DISBURSEMENT', details: 'Recorded Form 83 disbursement of ₱145,200.00 for Red Cross Blood Drive', actor: 'Elena V. Gutierrez (Treasurer)', ip: '192.168.1.20', timestamp: '2026-08-28 15:45:00' },
  { id: 'LOG-8911', action: 'CITIZEN_REGISTERED', details: 'Indexed and verified new resident profile Carmela D. Ocampo', actor: 'Jonathan D. Sorio (Staff)', ip: '192.168.1.12', timestamp: '2026-08-28 14:12:35' },
  { id: 'LOG-8910', action: 'RBAC_ROLE_SWITCH', details: 'User authenticated with session and activated Barangay Captain role', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-28 13:00:22' },
  { id: 'LOG-8909', action: 'CLEARANCE_STATUS_UPDATE', details: 'Updated #ONSE-2026-8891 status to READY_FOR_PICKUP', actor: 'Jonathan D. Sorio (Staff)', ip: '192.168.1.12', timestamp: '2026-08-28 11:20:10' },
  { id: 'LOG-8908', action: 'DISCLOSURE_UPLOADED', details: 'Uploaded FY 2026 Q2 BDRRMF Utilization Report to Disclosure Board', actor: 'Elena V. Gutierrez (Treasurer)', ip: '192.168.1.20', timestamp: '2026-08-28 10:05:40' },
  { id: 'LOG-8907', action: 'EVENT_SCHEDULED', details: 'Posted public advisory: Barangay General Assembly & SOBA (Sept 12)', actor: 'Jonathan D. Sorio (Staff)', ip: '192.168.1.12', timestamp: '2026-08-27 16:30:15' },
  { id: 'LOG-8906', action: 'CLEARANCE_APPROVED', details: 'Approved First Time Jobseeker Cert #ONSE-2026-8840 for Danilo Florano', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-27 15:10:00' },
  { id: 'LOG-8905', action: 'BLOTTER_RECORDED', details: 'Filed incident report Case #2026-BL-042 (Noise Complaint)', actor: 'Desk Officer on Duty', ip: '192.168.1.18', timestamp: '2026-08-27 14:00:22' },
  { id: 'LOG-8904', action: 'RATE_CONFIG_UPDATED', details: 'Verified document rate catalog consistency (R.A. 11032 Anti-Red Tape)', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-27 11:45:00' },
  { id: 'LOG-8903', action: 'USER_CREATED', details: 'Created desk staff account for Jonathan D. Sorio', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-26 17:00:00' },
  { id: 'LOG-8902', action: 'CLEARANCE_APPROVED', details: 'Approved Business Clearance #ONSE-2026-8815 for Crisostomo Ibarra', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-26 14:20:10' },
  { id: 'LOG-8901', action: 'DISCLOSURE_UPLOADED', details: 'Uploaded FY 2026 Q2 Form 83 IRA utilization ledger to Portal', actor: 'Elena V. Gutierrez (Treasurer)', ip: '192.168.1.20', timestamp: '2026-08-26 10:15:30' },
  // --- Page 2 items ---
  { id: 'LOG-8900', action: 'CLEARANCE_APPROVED', details: 'Approved Clearance #ONSE-2026-8790 for Elias Salome (Passport)', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-25 16:00:00' },
  { id: 'LOG-8899', action: 'RESIDENT_VERIFIED', details: 'KYC Address verification approved for Rodrigo P. Manansala', actor: 'Jonathan D. Sorio (Staff)', ip: '192.168.1.12', timestamp: '2026-08-25 14:30:15' },
  { id: 'LOG-8898', action: 'CLEARANCE_APPROVED', details: 'Approved Indigency #ONSE-2026-8755 for Sisa Tiago (DSWD AICS)', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-25 11:20:45' },
  { id: 'LOG-8897', action: 'LEDGER_DISBURSEMENT', details: 'Disbursed ₱22,500.00 for Anti-Dengue Misting Chemical Supplies', actor: 'Elena V. Gutierrez (Treasurer)', ip: '192.168.1.20', timestamp: '2026-08-24 16:45:10' },
  { id: 'LOG-8896', action: 'CLEARANCE_APPROVED', details: 'Approved Residency Cert #ONSE-2026-8720 for Basilio Evangelista', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-24 14:00:00' },
  { id: 'LOG-8895', action: 'BLOTTER_RESOLVED', details: 'Lupong Tagapamayapa amicable settlement reached for Case #2026-BL-039', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-24 10:30:00' },
  { id: 'LOG-8894', action: 'DISCLOSURE_UPLOADED', details: 'Uploaded SK Comprehensive Barangay Youth Plan (CBYDP) 2026', actor: 'Hon. John Michael Permato (SK)', ip: '192.168.1.30', timestamp: '2026-08-23 15:10:00' },
  { id: 'LOG-8893', action: 'CLEARANCE_REJECTED', details: 'Rejected Business Clearance #ONSE-2026-8590 (Lacked DTI Registration)', actor: 'Jonathan D. Sorio (Staff)', ip: '192.168.1.12', timestamp: '2026-08-23 11:40:00' },
  { id: 'LOG-8892', action: 'SECURITY_LOGIN', details: 'Successful administrative login from San Juan City Gov Network', actor: 'Hon. Roberto Alba (Captain)', ip: '192.168.1.45', timestamp: '2026-08-23 08:00:15' },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // default new to old
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
          setLogs(data.logs);
        }
      })
      .catch(() => {});
  }, []);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc'); // default new to old
    }
    setCurrentPage(1);
  };

  const processedLogs = useMemo(() => {
    return logs
      .filter((l) => {
        const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          l.id.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          l.actor.toLowerCase().includes(q) ||
          l.ip.toLowerCase().includes(q) ||
          l.timestamp.toLowerCase().includes(q);
        return matchesAction && matchesSearch;
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
  }, [logs, searchTerm, actionFilter, sortField, sortDirection]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedLogs.slice(start, start + pageSize);
  }, [processedLogs, currentPage, pageSize]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              System &amp; Security
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            System Audit Logs
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Exporting signed audit logs...')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-[#0E1B33] hover:bg-slate-200 dark:hover:bg-[#152747] text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-transparent dark:border-blue-900/40"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        
        {/* Search & Action Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by event ID, action, description, actor, or IP address..."
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Action:</span>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer outline-none focus:ring-1 focus:ring-[#9C2007]"
              >
                <option value="ALL">All Actions</option>
                <option value="CLEARANCE_APPROVED">Clearance Approved</option>
                <option value="CLEARANCE_STATUS_UPDATE">Clearance Status Update</option>
                <option value="CLEARANCE_REJECTED">Clearance Rejected</option>
                <option value="RESIDENT_VERIFIED">Resident Verified</option>
                <option value="CITIZEN_REGISTERED">Citizen Registered</option>
                <option value="LEDGER_DISBURSEMENT">Ledger Disbursement</option>
                <option value="DISCLOSURE_UPLOADED">Disclosure Uploaded</option>
                <option value="RBAC_ROLE_SWITCH">RBAC Role Switch</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
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
                  field="ip"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="IP Address"
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
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No audit records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-slate-400">{l.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[10px] font-bold text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-sm text-slate-800 dark:text-slate-200">{l.details}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{l.actor}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">{l.ip}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{l.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={processedLogs.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => setPageSize(size)}
        />
      </div>
    </div>
  );
}
