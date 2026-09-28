'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserCheck, 
  Shield, 
  Key, 
  Plus, 
  Search, 
  ShieldCheck, 
  Lock, 
  Edit3,
  Trash2,
  X, 
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableSortHeader from '@/components/ui/TableSortHeader';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  roleBadge: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string;
  createdAt: string;
}

const INITIAL_USERS: UserAccount[] = [
  { id: 'USR-20', name: 'Alfonso V. Quintero', email: 'alfonso@onse.ph', role: 'resident', roleBadge: 'bg-emerald-100 text-emerald-900', status: 'ACTIVE', lastLogin: '5 mins ago', createdAt: '2026-08-28 14:00' },
  { id: 'USR-19', name: 'Carmela D. Ocampo', email: 'carmela@onse.ph', role: 'resident', roleBadge: 'bg-emerald-100 text-emerald-900', status: 'ACTIVE', lastLogin: '18 mins ago', createdAt: '2026-08-28 11:30' },
  { id: 'USR-18', name: 'Rodrigo P. Manansala', email: 'rodrigo@onse.ph', role: 'resident', roleBadge: 'bg-emerald-100 text-emerald-900', status: 'ACTIVE', lastLogin: '1 hour ago', createdAt: '2026-08-27 16:45' },
  { id: 'USR-17', name: 'Flordeliza M. Buan', email: 'flordeliza@onse.ph', role: 'resident', roleBadge: 'bg-emerald-100 text-emerald-900', status: 'ACTIVE', lastLogin: '2 hours ago', createdAt: '2026-08-27 10:15' },
  { id: 'USR-16', name: 'Danilo P. Soriano', email: 'danilo.s@onse.ph', role: 'resident', roleBadge: 'bg-emerald-100 text-emerald-900', status: 'ACTIVE', lastLogin: '4 hours ago', createdAt: '2026-08-26 15:20' },
  { id: 'USR-15', name: 'Leticia T. Ramos', email: 'leticia@onse.ph', role: 'resident', roleBadge: 'bg-emerald-100 text-emerald-900', status: 'ACTIVE', lastLogin: '6 hours ago', createdAt: '2026-08-26 09:00' },
  { id: 'USR-14', name: 'Hon. Alexis Adrianne R. Luciano', email: 'sk.luciano@onse.gov.ph', role: 'sk_councilor', roleBadge: 'bg-blue-100 text-blue-900', status: 'ACTIVE', lastLogin: '8 hours ago', createdAt: '2026-08-25 17:30' },
  { id: 'USR-13', name: 'Hon. Ethan Jetter D.G. Garcia', email: 'sk.garcia@onse.gov.ph', role: 'sk_councilor', roleBadge: 'bg-blue-100 text-blue-900', status: 'ACTIVE', lastLogin: 'Yesterday', createdAt: '2026-08-25 14:10' },
  { id: 'USR-12', name: 'Hon. Ryan Lopez Lorbes', email: 'kagawad.lorbes@onse.gov.ph', role: 'barangay_councilor', roleBadge: 'bg-blue-100 text-blue-900', status: 'ACTIVE', lastLogin: 'Yesterday', createdAt: '2026-08-24 16:00' },
  { id: 'USR-11', name: 'Hon. Zenaida C. Casao', email: 'kagawad.casao@onse.gov.ph', role: 'barangay_councilor', roleBadge: 'bg-blue-100 text-blue-900', status: 'ACTIVE', lastLogin: '2 days ago', createdAt: '2026-08-24 11:25' },
  { id: 'USR-10', name: 'Hon. John Mark C. Daradal', email: 'kagawad.daradal@onse.gov.ph', role: 'barangay_councilor', roleBadge: 'bg-blue-100 text-blue-900', status: 'ACTIVE', lastLogin: '2 days ago', createdAt: '2026-08-23 15:40' },
  { id: 'USR-09', name: 'Hon. Federico S. Deniega', email: 'kagawad.deniega@onse.gov.ph', role: 'barangay_councilor', roleBadge: 'bg-blue-100 text-blue-900', status: 'ACTIVE', lastLogin: '3 days ago', createdAt: '2026-08-23 09:10' },
  { id: 'USR-08', name: 'Hon. Miguel A. Zamora Jr.', email: 'kagawad.zamora@onse.gov.ph', role: 'barangay_councilor', roleBadge: 'bg-blue-100 text-blue-900', status: 'ACTIVE', lastLogin: '3 days ago', createdAt: '2026-08-22 14:50' },
  { id: 'USR-07', name: 'Elena V. Gutierrez', email: 'treasurer@onse.gov.ph', role: 'staff', roleBadge: 'bg-amber-100 text-amber-900', status: 'ACTIVE', lastLogin: '4 days ago', createdAt: '2026-08-22 10:20' },
  { id: 'USR-06', name: 'Atty. Victorina Delos Reyes', email: 'legal@onse.gov.ph', role: 'staff', roleBadge: 'bg-purple-100 text-purple-900', status: 'ACTIVE', lastLogin: '5 days ago', createdAt: '2026-08-21 16:15' },
  { id: 'USR-05', name: 'Juan Dela Cruz', email: 'juan@onse.ph', role: 'resident', roleBadge: 'bg-emerald-100 text-emerald-900', status: 'ACTIVE', lastLogin: 'Aug 20, 2026', createdAt: '2026-08-20 12:00' },
  { id: 'USR-04', name: 'Hon. John Michael Permato', email: 'sk@onse.gov.ph', role: 'sk_chairperson', roleBadge: 'bg-purple-100 text-purple-900', status: 'ACTIVE', lastLogin: 'Aug 19, 2026', createdAt: '2026-08-19 15:30' },
  { id: 'USR-03', name: 'Hon. Danilo Florano', email: 'kagawad.florano@onse.gov.ph', role: 'barangay_councilor', roleBadge: 'bg-blue-100 text-blue-900', status: 'ACTIVE', lastLogin: 'Aug 18, 2026', createdAt: '2026-08-18 10:45' },
  { id: 'USR-02', name: 'Jonathan D. Sorio', email: 'records@onse.gov.ph', role: 'staff', roleBadge: 'bg-amber-100 text-amber-900', status: 'ACTIVE', lastLogin: 'Aug 17, 2026', createdAt: '2026-08-17 08:30' },
  { id: 'USR-01', name: 'Hon. Roberto Alba', email: 'captain@onse.gov.ph', role: 'super_admin', roleBadge: 'bg-purple-100 text-purple-900', status: 'ACTIVE', lastLogin: 'Aug 16, 2026', createdAt: '2026-08-16 08:00' },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Add Form
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'staff',
    phone: '',
  });

  const fetchUsers = () => {
    setIsLoading(true);
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setUsers(data.users);
        }
      })
      .catch((err) => console.error('Failed to fetch users:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        fetchUsers();
        setIsAddUserModalOpen(false);
        setAddForm({
          name: '',
          email: '',
          password: 'password123',
          role: 'staff',
          phone: '',
        });
      } else {
        alert(data.error || 'Failed to create user account.');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      alert('An error occurred while creating user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingUser),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUsers((prev) =>
          prev.map((u) => (u.id === editingUser.id ? { ...u, ...data.user } : u))
        );
        setEditingUser(null);
      } else {
        alert(data.error || 'Failed to update user.');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      alert('An error occurred while updating user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove user account for ${name}?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('An error occurred while deleting user.');
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

  // Filtering + Sorting
  const processedUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesRole = roleFilter === 'ALL' || u.role.toLowerCase().includes(roleFilter.toLowerCase());
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          (u.name && u.name.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.role && u.role.toLowerCase().includes(q)) ||
          (u.id && u.id.toLowerCase().includes(q));
        return matchesRole && matchesSearch;
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
  }, [users, searchTerm, roleFilter, sortField, sortDirection]);

  // Paginated items
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedUsers.slice(startIndex, startIndex + pageSize);
  }, [processedUsers, currentPage, pageSize]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Access Control &amp; RBAC
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Security Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            System Accounts &amp; User Access
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Accounts'}</span>
          </button>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        
        {/* Search, Filter & Controls Toolbar */}
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
              placeholder="Search by user name, email, or role..."
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
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer outline-none focus:ring-1 focus:ring-[#9C2007]"
              >
                <option value="ALL">All Roles</option>
                <option value="super_admin">Super Admin / Captain</option>
                <option value="barangay_councilor">Barangay Councilor</option>
                <option value="sk">SK Officials</option>
                <option value="staff">Desk Staff</option>
                <option value="resident">Residents</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
              <tr>
                <TableSortHeader
                  field="id"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="User ID"
                />
                <TableSortHeader
                  field="name"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Account Holder"
                />
                <TableSortHeader
                  field="email"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Email Address"
                />
                <TableSortHeader
                  field="role"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Role Permission"
                />
                <TableSortHeader
                  field="lastLogin"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Last Seen"
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
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No user accounts found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-slate-400 text-[11px]">{u.id.slice(0, 10)}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${u.roleBadge} dark:bg-slate-900/90 dark:border dark:border-slate-700`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{u.lastLogin}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingUser({ ...u })}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-transparent dark:border-blue-900/40"
                          title="Edit user role or status"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
                          title="Delete user account"
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
          totalItems={processedUsers.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => setPageSize(size)}
        />
      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Create System Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Provision a new staff, council official, or desk account.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Full Legal Name</label>
                <input
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Jonathan D. Sorio"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Email Address</label>
                <input
                  required
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. staff@onse.gov.ph"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Initial Password</label>
                <input
                  required
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Role Permission</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                >
                  <option value="staff">Desk Staff (staff)</option>
                  <option value="barangay_councilor">Barangay Kagawad</option>
                  <option value="barangay_captain">Barangay Captain</option>
                  <option value="sk_chairperson">SK Chairperson</option>
                  <option value="sk_councilor">SK Kagawad</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="resident">Resident Citizen</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 rounded-xl font-bold uppercase text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#9C2007] text-white rounded-xl font-bold uppercase text-[11px] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Creating...' : 'Save Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Edit User Account</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Modify access privileges and details for {editingUser.name}</p>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Account Name</label>
                <input
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Role Permission</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                >
                  <option value="staff">Desk Staff (staff)</option>
                  <option value="barangay_councilor">Barangay Kagawad</option>
                  <option value="barangay_captain">Barangay Captain</option>
                  <option value="sk_chairperson">SK Chairperson</option>
                  <option value="sk_councilor">SK Kagawad</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="resident">Resident Citizen</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Account Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 rounded-xl font-bold uppercase text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#9C2007] text-white rounded-xl font-bold uppercase text-[11px] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Updating...' : 'Update Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
