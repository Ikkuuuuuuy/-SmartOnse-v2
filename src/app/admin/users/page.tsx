'use client';

import React, { useState } from 'react';
import { 
  UserCheck, 
  Shield, 
  Key, 
  Plus, 
  Search, 
  ShieldCheck, 
  Lock, 
  Edit3,
  X
} from 'lucide-react';

export default function AdminUsersPage() {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const [users, setUsers] = useState([
    { id: 'USR-01', name: 'Hon. Roberto Alba', email: 'captain@onse.gov.ph', role: 'Super Admin / Captain', roleBadge: 'bg-purple-100 text-purple-900', status: 'ACTIVE', twoFactor: 'ENABLED', lastLogin: '10 mins ago' },
    { id: 'USR-02', name: 'Jonathan D. Sorio', email: 'records@onse.gov.ph', role: 'Desk Staff', roleBadge: 'bg-amber-100 text-amber-900', status: 'ACTIVE', twoFactor: 'ENABLED', lastLogin: '25 mins ago' },
    { id: 'USR-03', name: 'Hon. Danilo Florano', email: 'kagawad.florano@onse.gov.ph', role: 'Barangay Kagawad', roleBadge: 'bg-blue-100 text-blue-900', status: 'ACTIVE', twoFactor: 'ENABLED', lastLogin: '2 hours ago' },
    { id: 'USR-04', name: 'Hon. John Michael Permato', email: 'sk@onse.gov.ph', role: 'SK Chairperson', roleBadge: 'bg-purple-100 text-purple-900', status: 'ACTIVE', twoFactor: 'ENABLED', lastLogin: 'Yesterday' },
    { id: 'USR-05', name: 'Juan Dela Cruz', email: 'juan@onse.ph', role: 'Verified Resident', roleBadge: 'bg-emerald-100 text-emerald-900', status: 'ACTIVE', twoFactor: 'DISABLED', lastLogin: 'Aug 27, 2026' },
  ]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Access Control &bull; RBAC Roles
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Security Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            User Accounts &amp; Permissions
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create System Account</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            System Accounts &amp; Role-Based Access List
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {users.length} Active Accounts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Assigned RBAC Role</th>
                <th className="py-3 px-4">2FA Security</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{u.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${u.roleBadge} dark:bg-slate-900/90 dark:border dark:border-slate-700`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 border border-transparent dark:border-blue-900/40 text-[10px] font-bold">
                      {u.twoFactor}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{u.lastLogin}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black uppercase">
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Managing permissions for ${u.name}`)}
                      className="px-3 py-1 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-lg font-bold text-[11px] transition cursor-pointer border border-transparent dark:border-blue-900/40"
                    >
                      Permissions &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
