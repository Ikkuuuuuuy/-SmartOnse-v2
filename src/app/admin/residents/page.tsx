'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Eye, 
  Edit3, 
  FileText,
  UserPlus,
  Home,
  X
} from 'lucide-react';

export default function AdminResidentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [residents, setResidents] = useState([
    { id: 'RES-001', name: 'Juan Dela Cruz', precinct: 'PRECINCT-0042A', address: '145 Lt. Artiaga St.', civil: 'Single', contact: '0917-888-0011', email: 'juan@onse.ph', registered: '2023-01-14', verified: true, householdRole: 'Head of Household' },
    { id: 'RES-002', name: 'Maria Clara Santos', precinct: 'PRECINCT-0042B', address: '88 J.V. Panganiban St.', civil: 'Married', contact: '0918-777-2233', email: 'maria@onse.ph', registered: '2023-03-22', verified: true, householdRole: 'Spouse' },
    { id: 'RES-003', name: 'Crisostomo Ibarra', precinct: 'PRECINCT-0043A', address: '12 N. Domingo St.', civil: 'Single', contact: '0919-444-5566', email: 'ibarra@onse.ph', registered: '2022-11-05', verified: true, householdRole: 'Head of Household' },
    { id: 'RES-004', name: 'Danilo Florano', precinct: 'PRECINCT-0041A', address: '55 A. Luna St.', civil: 'Married', contact: '0920-111-9988', email: 'danilo@onse.gov.ph', registered: '2021-08-19', verified: true, householdRole: 'Head of Household' },
    { id: 'RES-005', name: 'Elias Salome', precinct: 'PRECINCT-0042A', address: '204 F. Manalo St.', civil: 'Single', contact: '0915-333-7711', email: 'elias@onse.ph', registered: '2024-02-10', verified: true, householdRole: 'Member' },
    { id: 'RES-006', name: 'Sisa Tiago', precinct: 'PRECINCT-0044B', address: '77 Lt. Artiaga St.', civil: 'Widowed', contact: '0916-222-8844', email: 'sisa@onse.ph', registered: '2023-09-01', verified: true, householdRole: 'Head of Household' },
  ]);

  const filteredResidents = residents.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.precinct.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              Barangay Census &amp; Registry
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500">San Juan City</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Resident &amp; Household Directory
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Register Resident</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Population</span>
          <div className="text-2xl font-black text-slate-900">3,824</div>
          <p className="text-[11px] text-slate-400">Verified residents</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Households</span>
          <div className="text-2xl font-black text-emerald-700">1,250</div>
          <p className="text-[11px] text-slate-400">Registered addresses</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Voters</span>
          <div className="text-2xl font-black text-[#9C2007]">2,910</div>
          <p className="text-[11px] text-slate-400">Active COMELEC precinct</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Senior Citizens (60+)</span>
          <div className="text-2xl font-black text-purple-700">412</div>
          <p className="text-[11px] text-slate-400">OSCA registered</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by resident name, precinct number, or street address..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-1 focus:ring-[#9C2007] outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Showing <strong>{filteredResidents.length}</strong> verified profiles
            </span>
          </div>
        </div>

        {/* Residents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Resident ID</th>
                <th className="py-3 px-4">Full Legal Name</th>
                <th className="py-3 px-4">Precinct Code</th>
                <th className="py-3 px-4">Barangay Onse Address</th>
                <th className="py-3 px-4">Civil Status</th>
                <th className="py-3 px-4">Contact Number</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredResidents.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500">{r.id}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-black text-slate-900 text-sm">{r.name}</div>
                    <div className="text-[10px] text-slate-400">{r.householdRole}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007]">{r.precinct}</td>
                  <td className="py-3.5 px-4">{r.address}</td>
                  <td className="py-3.5 px-4">{r.civil}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-600">{r.contact}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3" />
                      Verified
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Viewing profile for ${r.name}`)}
                      className="px-3 py-1 bg-slate-100 hover:bg-[#9C2007] hover:text-white rounded-lg font-bold text-[11px] transition inline-block cursor-pointer"
                    >
                      View &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Add Resident Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900">Register Resident</h3>
            <p className="text-xs text-slate-500">Add a new verified citizen profile to the Barangay Onse registry.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddModalOpen(false);
                alert('Resident registration submitted and indexed successfully!');
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Full Legal Name</label>
                <input required placeholder="e.g. Antonio Luna" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Precinct Code</label>
                  <input required placeholder="PRECINCT-0042A" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Contact Number</label>
                  <input required placeholder="0917-000-0000" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Barangay Address</label>
                <input required placeholder="House No., Street, Brgy Onse" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#9C2007] text-white font-black uppercase shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
