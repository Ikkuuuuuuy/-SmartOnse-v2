'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  ShieldCheck,
  Search,
  ArrowRight,
  X
} from 'lucide-react';

export default function AdminServicesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [services, setServices] = useState([
    {
      code: 'BRGY_CLEARANCE',
      name: 'Barangay Clearance',
      category: 'General Issuance',
      fee: '₱50.00',
      turnaround: '24 Hours',
      requirements: '1 Valid Government ID, Proof of Residency (Utility Bill)',
      status: 'ACTIVE',
      monthlyVolume: '420 issued / mo',
    },
    {
      code: 'CERT_RESIDENCY',
      name: 'Certificate of Residency',
      category: 'Civil Verification',
      fee: '₱30.00',
      turnaround: 'Same Day (2 Hours)',
      requirements: 'Valid ID, Minimum 6 months barangay residency',
      status: 'ACTIVE',
      monthlyVolume: '280 issued / mo',
    },
    {
      code: 'CERT_INDIGENCY',
      name: 'Certificate of Indigency',
      category: 'Social Welfare & Health',
      fee: 'FREE',
      turnaround: 'Same Day (1 Hour)',
      requirements: 'Valid ID, Case Assessment / MSWDO Endorsement',
      status: 'ACTIVE',
      monthlyVolume: '195 issued / mo',
    },
    {
      code: 'FIRST_TIME_JOBSEEKER',
      name: 'First Time Jobseeker Certificate (R.A. 11261)',
      category: 'Youth & Employment Aid',
      fee: 'FREE (R.A. 11261)',
      turnaround: 'Same Day',
      requirements: 'Barangay Oath of Undertaking, Valid School ID / Birth Cert',
      status: 'ACTIVE',
      monthlyVolume: '110 issued / mo',
    },
    {
      code: 'BUSINESS_CLEARANCE',
      name: 'Barangay Business Clearance',
      category: 'Commerce & Permits',
      fee: '₱250.00',
      turnaround: '2 Business Days',
      requirements: 'DTI / SEC Registration, Contract of Lease, Sanitary Clearance',
      status: 'ACTIVE',
      monthlyVolume: '85 issued / mo',
    },
    {
      code: 'BLOTTER_REPORT',
      name: 'Barangay Incident / Blotter Certification',
      category: 'Peace & Order',
      fee: '₱100.00',
      turnaround: '24 Hours',
      requirements: 'Personal Appearance before Desk Officer / Tanod Roster',
      status: 'ACTIVE',
      monthlyVolume: '25 issued / mo',
    },
  ]);

  return (
    <div className="space-y-6 font-sans text-slate-800">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              Citizen&apos;s Charter &bull; Service Catalog
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500">R.A. 11032 Anti-Red Tape</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Document Rates &amp; Online Services
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Service Rate</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((s) => (
          <div
            key={s.code}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#9C2007] bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200">
                  {s.code}
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {s.status}
                </span>
              </div>

              <div>
                <h3 className="font-black text-base text-slate-900 leading-snug">{s.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{s.category}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">Standard Fee:</span>
                  <span className="font-black text-slate-900 text-sm">{s.fee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">Processing Time:</span>
                  <span className="font-bold text-slate-700">{s.turnaround}</span>
                </div>
                <div className="pt-1 text-[11px] text-slate-500">
                  <strong>Requirements:</strong> {s.requirements}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">{s.monthlyVolume}</span>
              <button
                onClick={() => alert(`Editing rates for ${s.name}`)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-[#9C2007] hover:text-white rounded-xl font-bold text-[11px] transition cursor-pointer"
              >
                Edit &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900">Add Service / Document Rate</h3>
            <p className="text-xs text-slate-500">Configure new barangay document issuance fees and required documents.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddModalOpen(false);
                alert('New service rate published to Citizen Charter!');
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Service / Document Title</label>
                <input required placeholder="e.g. Good Moral Certificate" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Fee (PHP)</label>
                  <input required placeholder="₱50.00 or FREE" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Turnaround Time</label>
                  <input required placeholder="24 Hours" className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Checklist Requirements</label>
                <textarea rows={2} required placeholder="Valid IDs, proof of residency..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
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
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
