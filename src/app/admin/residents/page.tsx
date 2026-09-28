'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Edit3, 
  Trash2,
  UserPlus,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableSortHeader from '@/components/ui/TableSortHeader';

export interface ResidentRecord {
  id: string;
  inhabitantId?: string | null;
  rbiNumber?: string;
  name: string;
  precinct: string;
  address: string;
  civil: 'Single' | 'Married' | 'Widowed' | 'Separated';
  contact: string;
  email: string;
  registered: string;
  verified: boolean;
  householdRole: string;
}

const INITIAL_FALLBACK_RESIDENTS: ResidentRecord[] = [
  { id: 'RES-024', name: 'Alfonso V. Quintero', precinct: 'PRECINCT-0042A', address: '188 Lt. Artiaga St.', civil: 'Single', contact: '0917-888-0024', email: 'alfonso@onse.ph', registered: '2026-08-20', verified: true, householdRole: 'Member' },
  { id: 'RES-023', name: 'Carmela D. Ocampo', precinct: 'PRECINCT-0043A', address: '39 N. Domingo St.', civil: 'Married', contact: '0917-888-0023', email: 'carmela@onse.ph', registered: '2026-07-18', verified: true, householdRole: 'Spouse' },
  { id: 'RES-022', name: 'Rodrigo P. Manansala', precinct: 'PRECINCT-0041A', address: '83 A. Luna St.', civil: 'Widowed', contact: '0917-888-0022', email: 'rodrigo@onse.ph', registered: '2026-06-12', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-021', name: 'Flordeliza M. Buan', precinct: 'PRECINCT-0044B', address: '15 Onse Compound', civil: 'Single', contact: '0917-888-0021', email: 'flordeliza@onse.ph', registered: '2026-05-04', verified: true, householdRole: 'Member' },
  { id: 'RES-020', name: 'Danilo P. Soriano', precinct: 'PRECINCT-0042B', address: '102 Blumentritt St.', civil: 'Married', contact: '0917-888-0020', email: 'danilo.s@onse.ph', registered: '2026-03-30', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-019', name: 'Leticia T. Ramos', precinct: 'PRECINCT-0043A', address: '48 J.V. Panganiban St.', civil: 'Widowed', contact: '0917-888-0019', email: 'leticia@onse.ph', registered: '2026-02-15', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-018', name: 'Gerardo K. Ilustre', precinct: 'PRECINCT-0041A', address: '29 F. Manalo St.', civil: 'Married', contact: '0917-888-0018', email: 'gerardo@onse.ph', registered: '2026-01-22', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-017', name: 'Corazon E. Natividad', precinct: 'PRECINCT-0042A', address: '71 Gomez St.', civil: 'Single', contact: '0917-888-0017', email: 'corazon@onse.ph', registered: '2025-11-19', verified: true, householdRole: 'Member' },
  { id: 'RES-016', name: 'Victorino S. Cruz', precinct: 'PRECINCT-0044B', address: '62 Lt. Artiaga St.', civil: 'Married', contact: '0917-888-0016', email: 'victorino@onse.ph', registered: '2025-10-08', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-015', name: 'Josefina R. Padilla', precinct: 'PRECINCT-0043A', address: '11 N. Domingo St.', civil: 'Married', contact: '0917-888-0015', email: 'josefina@onse.ph', registered: '2025-08-14', verified: true, householdRole: 'Spouse' },
  { id: 'RES-014', name: 'Eduardo G. De Leon', precinct: 'PRECINCT-0042B', address: '95 Blumentritt St.', civil: 'Single', contact: '0917-888-0014', email: 'eduardo@onse.ph', registered: '2025-06-25', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-013', name: 'Marilou C. Alcantara', precinct: 'PRECINCT-0041A', address: '14 A. Luna St.', civil: 'Married', contact: '0917-888-0013', email: 'marilou@onse.ph', registered: '2025-04-10', verified: true, householdRole: 'Spouse' },
  { id: 'RES-012', name: 'Manuel L. Roxas Jr.', precinct: 'PRECINCT-0042A', address: '53 Gomez St.', civil: 'Married', contact: '0917-888-0012', email: 'manuel@onse.ph', registered: '2025-02-01', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-011', name: 'Teresa B. Magbanua', precinct: 'PRECINCT-0044B', address: '110 Onse Compound', civil: 'Single', contact: '0917-888-0011', email: 'teresa@onse.ph', registered: '2024-12-14', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-010', name: 'Apolinario M. Mabini', precinct: 'PRECINCT-0043A', address: '24 N. Domingo St.', civil: 'Single', contact: '0917-888-0010', email: 'apolinario@onse.ph', registered: '2024-10-09', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-009', name: 'Melchora I. Aquino', precinct: 'PRECINCT-0042B', address: '77 Blumentritt St.', civil: 'Widowed', contact: '0917-888-0009', email: 'melchora@onse.ph', registered: '2024-08-20', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-008', name: 'Marcelo H. Del Pilar', precinct: 'PRECINCT-0041A', address: '66 A. Luna St.', civil: 'Married', contact: '0917-888-0008', email: 'marcelo@onse.ph', registered: '2024-06-15', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-007', name: 'Graciano L. Jaena', precinct: 'PRECINCT-0042A', address: '130 Gomez St.', civil: 'Single', contact: '0917-888-0007', email: 'graciano@onse.ph', registered: '2024-04-18', verified: true, householdRole: 'Member' },
  { id: 'RES-006', name: 'Sisa Tiago', precinct: 'PRECINCT-0044B', address: '77 Lt. Artiaga St.', civil: 'Widowed', contact: '0916-222-8844', email: 'sisa@onse.ph', registered: '2023-09-01', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-005', name: 'Elias Salome', precinct: 'PRECINCT-0042A', address: '204 F. Manalo St.', civil: 'Single', contact: '0915-333-7711', email: 'elias@onse.ph', registered: '2023-08-10', verified: true, householdRole: 'Member' },
  { id: 'RES-004', name: 'Danilo Florano', precinct: 'PRECINCT-0041A', address: '55 A. Luna St.', civil: 'Married', contact: '0920-111-9988', email: 'danilo@onse.gov.ph', registered: '2023-05-19', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-003', name: 'Crisostomo Ibarra', precinct: 'PRECINCT-0043A', address: '12 N. Domingo St.', civil: 'Single', contact: '0919-444-5566', email: 'ibarra@onse.ph', registered: '2023-04-05', verified: true, householdRole: 'Head of Household' },
  { id: 'RES-002', name: 'Maria Clara Santos', precinct: 'PRECINCT-0042B', address: '88 J.V. Panganiban St.', civil: 'Married', contact: '0918-777-2233', email: 'maria@onse.ph', registered: '2023-03-22', verified: true, householdRole: 'Spouse' },
  { id: 'RES-001', name: 'Juan Dela Cruz', precinct: 'PRECINCT-0042A', address: '145 Lt. Artiaga St.', civil: 'Single', contact: '0917-888-0011', email: 'juan@onse.ph', registered: '2023-01-14', verified: true, householdRole: 'Head of Household' },
];

export default function AdminResidentsPage() {
  const [residents, setResidents] = useState<ResidentRecord[]>(INITIAL_FALLBACK_RESIDENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [civilFilter, setCivilFilter] = useState('ALL');
  const [precinctFilter, setPrecinctFilter] = useState('ALL');
  const [sortField, setSortField] = useState('registered');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals & Action States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingResident, setEditingResident] = useState<ResidentRecord | null>(null);

  // Form State for Add
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    contact: '',
    precinct: 'PRECINCT-0042A',
    civil: 'Single' as const,
    householdRole: 'Head of Household',
    address: '',
  });

  // Fetch Residents from Backend
  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/residents');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.residents) && data.residents.length > 0) {
        setResidents(data.residents);
      }
    } catch (err) {
      console.error('Failed to fetch residents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  // Handle Add Resident
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/residents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok && data.success && data.resident) {
        setResidents((prev) => [data.resident, ...prev]);
        setIsAddModalOpen(false);
        setAddForm({
          name: '',
          email: '',
          contact: '',
          precinct: 'PRECINCT-0042A',
          civil: 'Single',
          householdRole: 'Head of Household',
          address: '',
        });
      } else {
        alert(data.error || 'Failed to add resident.');
      }
    } catch (err) {
      console.error('Error adding resident:', err);
      alert('An unexpected error occurred while adding resident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit Resident
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResident) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/residents/${editingResident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingResident.name,
          email: editingResident.email,
          contact: editingResident.contact,
          address: editingResident.address,
          precinct: editingResident.precinct,
          civil: editingResident.civil,
          householdRole: editingResident.householdRole,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.resident) {
        setResidents((prev) =>
          prev.map((r) => (r.id === editingResident.id ? { ...r, ...data.resident } : r))
        );
        setEditingResident(null);
      } else {
        alert(data.error || 'Failed to update resident.');
      }
    } catch (err) {
      console.error('Error editing resident:', err);
      alert('An unexpected error occurred while updating resident.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Resident
  const handleDeleteResident = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from the resident registry?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/residents/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResidents((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(data.error || 'Failed to delete resident.');
      }
    } catch (err) {
      console.error('Error deleting resident:', err);
      alert('An unexpected error occurred while deleting resident.');
    }
  };

  // Sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Filter + Sort
  const processedResidents = useMemo(() => {
    return residents
      .filter((r) => {
        const matchesCivil = civilFilter === 'ALL' || r.civil === civilFilter;
        const matchesPrecinct = precinctFilter === 'ALL' || r.precinct === precinctFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.precinct && r.precinct.toLowerCase().includes(q)) ||
          (r.address && r.address.toLowerCase().includes(q)) ||
          (r.id && r.id.toLowerCase().includes(q)) ||
          (r.contact && r.contact.toLowerCase().includes(q)) ||
          (r.email && r.email.toLowerCase().includes(q));
        return matchesCivil && matchesPrecinct && matchesSearch;
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
  }, [residents, searchTerm, civilFilter, precinctFilter, sortField, sortDirection]);

  // Paginated items
  const paginatedResidents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedResidents.slice(startIndex, startIndex + pageSize);
  }, [processedResidents, currentPage, pageSize]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Barangay Census &amp; Registry
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">San Juan City</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Resident &amp; Household Directory
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchResidents}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Reload residents from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Registry'}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Resident</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0B1528] p-5 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider">Total Residents</span>
          <div className="text-2xl font-black text-black dark:text-white">{residents.length}</div>
          <p className="text-[11px] text-black/60 dark:text-white/60">Registered &amp; census profiles</p>
        </div>

        <div className="bg-white dark:bg-[#0B1528] p-5 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider">Total Households</span>
          <div className="text-2xl font-black text-black dark:text-white">
            {residents.filter((r) => r.householdRole === 'Head of Household').length || Math.ceil(residents.length / 3)}
          </div>
          <p className="text-[11px] text-black/60 dark:text-white/60">Household heads</p>
        </div>

        <div className="bg-white dark:bg-[#0B1528] p-5 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider">Active Precincts</span>
          <div className="text-2xl font-black text-black dark:text-white">5</div>
          <p className="text-[11px] text-black/60 dark:text-white/60">Active COMELEC clusters</p>
        </div>

        <div className="bg-white dark:bg-[#0B1528] p-5 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider">Verified Citizens</span>
          <div className="text-2xl font-black text-black dark:text-white">
            {residents.filter((r) => r.verified).length}
          </div>
          <p className="text-[11px] text-black/60 dark:text-white/60">Barangay ID cleared</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        
        {/* Search and Filters Toolbar */}
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
              placeholder="Search by resident name, precinct, address, ID, contact..."
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
            {/* Civil Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Civil:</span>
              <select
                value={civilFilter}
                onChange={(e) => {
                  setCivilFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer outline-none focus:ring-1 focus:ring-[#9C2007]"
              >
                <option value="ALL">All Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </div>

            {/* Precinct Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Precinct:</span>
              <select
                value={precinctFilter}
                onChange={(e) => {
                  setPrecinctFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer outline-none focus:ring-1 focus:ring-[#9C2007]"
              >
                <option value="ALL">All Precincts</option>
                <option value="PRECINCT-0041A">0041A</option>
                <option value="PRECINCT-0042A">0042A</option>
                <option value="PRECINCT-0042B">0042B</option>
                <option value="PRECINCT-0043A">0043A</option>
                <option value="PRECINCT-0044B">0044B</option>
              </select>
            </div>
          </div>
        </div>

        {/* Residents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
              <tr>
                <TableSortHeader
                  field="id"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Resident ID"
                />
                <TableSortHeader
                  field="name"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Full Legal Name"
                />
                <TableSortHeader
                  field="precinct"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Precinct Code"
                />
                <TableSortHeader
                  field="address"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Barangay Address"
                />
                <TableSortHeader
                  field="civil"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Civil Status"
                />
                <TableSortHeader
                  field="contact"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Contact Number"
                />
                <TableSortHeader
                  field="registered"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Registered Date"
                />
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
              {paginatedResidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No resident records found matching your query.
                  </td>
                </tr>
              ) : (
                paginatedResidents.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                      {r.rbiNumber || r.id.slice(0, 10)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                        <span>{r.name}</span>
                        {r.verified && (
                          <span title="Verified Resident">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{r.householdRole} &bull; {r.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">{r.precinct}</td>
                    <td className="py-3.5 px-4">{r.address}</td>
                    <td className="py-3.5 px-4">{r.civil}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{r.contact}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {r.registered}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingResident({ ...r })}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-700 dark:text-slate-300 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-transparent dark:border-blue-900/40"
                          title="Edit resident details"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteResident(r.id, r.name)}
                          className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
                          title="Delete resident record"
                        >
                          <Trash2 className="w-3 h-3" />
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
          totalItems={processedResidents.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => setPageSize(size)}
        />
      </div>

      {/* Add Resident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Register Resident</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add a new verified citizen profile to the Barangay Onse database registry.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Full Legal Name</label>
                <input
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Antonio Luna"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Email Address</label>
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="antonio@onse.ph"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Contact Number</label>
                  <input
                    required
                    value={addForm.contact}
                    onChange={(e) => setAddForm({ ...addForm, contact: e.target.value })}
                    placeholder="0917-888-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Precinct</label>
                  <select
                    value={addForm.precinct}
                    onChange={(e) => setAddForm({ ...addForm, precinct: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  >
                    <option value="PRECINCT-0041A">PRECINCT-0041A</option>
                    <option value="PRECINCT-0042A">PRECINCT-0042A</option>
                    <option value="PRECINCT-0042B">PRECINCT-0042B</option>
                    <option value="PRECINCT-0043A">PRECINCT-0043A</option>
                    <option value="PRECINCT-0044B">PRECINCT-0044B</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Civil Status</label>
                  <select
                    value={addForm.civil}
                    onChange={(e) => setAddForm({ ...addForm, civil: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Household Role</label>
                <select
                  value={addForm.householdRole}
                  onChange={(e) => setAddForm({ ...addForm, householdRole: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                >
                  <option value="Head of Household">Head of Household</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Member">Member</option>
                  <option value="Boarder">Boarder</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Barangay Onse Address</label>
                <input
                  required
                  value={addForm.address}
                  onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
                  placeholder="e.g. 145 Lt. Artiaga St."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 rounded-xl font-bold uppercase text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold uppercase text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Saving...' : 'Save Resident'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Resident Modal */}
      {editingResident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingResident(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Edit Resident Record</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Modify information for citizen record ID: {editingResident.id}</p>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Full Legal Name</label>
                <input
                  required
                  value={editingResident.name}
                  onChange={(e) => setEditingResident({ ...editingResident, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Email Address</label>
                  <input
                    type="email"
                    value={editingResident.email}
                    onChange={(e) => setEditingResident({ ...editingResident, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Contact Number</label>
                  <input
                    required
                    value={editingResident.contact}
                    onChange={(e) => setEditingResident({ ...editingResident, contact: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Precinct</label>
                  <select
                    value={editingResident.precinct}
                    onChange={(e) => setEditingResident({ ...editingResident, precinct: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  >
                    <option value="PRECINCT-0041A">PRECINCT-0041A</option>
                    <option value="PRECINCT-0042A">PRECINCT-0042A</option>
                    <option value="PRECINCT-0042B">PRECINCT-0042B</option>
                    <option value="PRECINCT-0043A">PRECINCT-0043A</option>
                    <option value="PRECINCT-0044B">PRECINCT-0044B</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Civil Status</label>
                  <select
                    value={editingResident.civil}
                    onChange={(e) => setEditingResident({ ...editingResident, civil: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Household Role</label>
                <select
                  value={editingResident.householdRole}
                  onChange={(e) => setEditingResident({ ...editingResident, householdRole: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                >
                  <option value="Head of Household">Head of Household</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Member">Member</option>
                  <option value="Boarder">Boarder</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Barangay Onse Address</label>
                <input
                  required
                  value={editingResident.address}
                  onChange={(e) => setEditingResident({ ...editingResident, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResident(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 rounded-xl font-bold uppercase text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold uppercase text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Updating...' : 'Update Resident'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
