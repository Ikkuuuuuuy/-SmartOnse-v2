'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2,
  CheckCircle2, 
  Clock, 
  DollarSign, 
  FileText, 
  ShieldCheck,
  Search,
  ArrowRight,
  RefreshCw,
  X,
  Loader2
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  fee: string;
  turnaround: string;
  requirements: string;
  status: 'ACTIVE' | 'INACTIVE';
  monthlyVolume: string;
  description?: string;
}

const FALLBACK_SERVICES: ServiceItem[] = [
  {
    id: '1',
    code: 'SRV-001',
    name: 'Barangay Clearance',
    category: 'General Issuance',
    fee: '₱50.00',
    turnaround: '24 Hours',
    requirements: '1 Valid Government ID, Proof of Residency (Utility Bill)',
    status: 'ACTIVE',
    monthlyVolume: '420 issued / mo',
  },
  {
    id: '2',
    code: 'SRV-002',
    name: 'Certificate of Residency',
    category: 'Civil Verification',
    fee: '₱30.00',
    turnaround: 'Same Day (2 Hours)',
    requirements: 'Valid ID, Minimum 6 months barangay residency',
    status: 'ACTIVE',
    monthlyVolume: '280 issued / mo',
  },
  {
    id: '3',
    code: 'SRV-003',
    name: 'Certificate of Indigency',
    category: 'Social Welfare & Health',
    fee: 'FREE',
    turnaround: 'Same Day (1 Hour)',
    requirements: 'Valid ID, Case Assessment / MSWDO Endorsement',
    status: 'ACTIVE',
    monthlyVolume: '195 issued / mo',
  },
  {
    id: '4',
    code: 'SRV-004',
    name: 'First Time Jobseeker Certificate (R.A. 11261)',
    category: 'Youth & Employment Aid',
    fee: 'FREE (R.A. 11261)',
    turnaround: 'Same Day',
    requirements: 'Barangay Oath of Undertaking, Valid School ID / Birth Cert',
    status: 'ACTIVE',
    monthlyVolume: '110 issued / mo',
  },
  {
    id: '5',
    code: 'SRV-005',
    name: 'Barangay Business Clearance',
    category: 'Commerce & Permits',
    fee: '₱250.00',
    turnaround: '2 Business Days',
    requirements: 'DTI / SEC Registration, Contract of Lease, Sanitary Clearance',
    status: 'ACTIVE',
    monthlyVolume: '85 issued / mo',
  },
  {
    id: '6',
    code: 'SRV-006',
    name: 'Barangay Incident / Blotter Certification',
    category: 'Peace & Order',
    fee: '₱100.00',
    turnaround: '24 Hours',
    requirements: 'Personal Appearance before Desk Officer / Tanod Roster',
    status: 'ACTIVE',
    monthlyVolume: '25 issued / mo',
  },
];

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>(FALLBACK_SERVICES);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [addForm, setAddForm] = useState({
    name: '',
    category: 'General Issuance',
    fee: '₱50.00',
    turnaround: '24 Hours',
    requirements: '',
  });

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/services');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.services) && data.services.length > 0) {
        setServices(data.services);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok && data.success && data.service) {
        setServices((prev) => [data.service, ...prev]);
        setIsAddModalOpen(false);
        setAddForm({
          name: '',
          category: 'General Issuance',
          fee: '₱50.00',
          turnaround: '24 Hours',
          requirements: '',
        });
      } else {
        alert(data.error || 'Failed to add service.');
      }
    } catch (err) {
      console.error('Error adding service:', err);
      alert('An error occurred while creating service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/services/${editingService.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingService),
      });
      const data = await res.json();
      if (res.ok && data.success && data.service) {
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? { ...s, ...data.service } : s))
        );
        setEditingService(null);
      } else {
        alert(data.error || 'Failed to update service.');
      }
    } catch (err) {
      console.error('Error updating service:', err);
      alert('An error occurred while updating service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from document services?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setServices((prev) => prev.filter((s) => s.id !== id));
      } else {
        alert(data.error || 'Failed to delete service.');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('An error occurred while deleting service.');
    }
  };

  const filteredServices = services.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.requirements.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Citizen&apos;s Charter &bull; Service Catalog
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">R.A. 11032 Anti-Red Tape</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Document Rates &amp; Online Services
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchServices}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Rates'}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Rate</span>
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white dark:bg-[#0B1528] p-4 rounded-2xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search service title, code, category, or requirements..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((s) => (
          <div
            key={s.id || s.code}
            className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 border border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
                  {s.code}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  s.status === 'ACTIVE'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200'
                }`}>
                  {s.status}
                </span>
              </div>

              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white leading-snug">{s.name}</h3>
                <p className="text-xs text-slate-400 font-medium">{s.category}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#080E1A] rounded-2xl border border-slate-100 dark:border-blue-900/30 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">Standard Fee:</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">{s.fee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">Processing Time:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{s.turnaround}</span>
                </div>
                <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-700 dark:text-slate-300">Requirements:</strong> {s.requirements}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-medium">{s.monthlyVolume}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setEditingService({ ...s })}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-xl font-bold text-[11px] transition cursor-pointer border border-transparent dark:border-blue-900/40 inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteService(s.id, s.name)}
                  className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white rounded-xl font-bold text-[11px] transition cursor-pointer border border-rose-200/60 dark:border-rose-900/40 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Add Service / Document Rate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure new barangay document issuance fees and required documents.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Service / Document Title</label>
                <input
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Good Moral Certificate"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Category</label>
                <select
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                >
                  <option value="General Issuance">General Issuance</option>
                  <option value="Civil Verification">Civil Verification</option>
                  <option value="Social Welfare & Health">Social Welfare & Health</option>
                  <option value="Youth & Employment Aid">Youth & Employment Aid</option>
                  <option value="Commerce & Permits">Commerce & Permits</option>
                  <option value="Peace & Order">Peace & Order</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Fee (PHP)</label>
                  <input
                    required
                    value={addForm.fee}
                    onChange={(e) => setAddForm({ ...addForm, fee: e.target.value })}
                    placeholder="₱50.00 or FREE"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Turnaround Time</label>
                  <input
                    required
                    value={addForm.turnaround}
                    onChange={(e) => setAddForm({ ...addForm, turnaround: e.target.value })}
                    placeholder="24 Hours"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Checklist Requirements</label>
                <textarea
                  rows={2}
                  required
                  value={addForm.requirements}
                  onChange={(e) => setAddForm({ ...addForm, requirements: e.target.value })}
                  placeholder="Valid IDs, proof of residency..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 font-bold uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black uppercase shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Saving...' : 'Save Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingService(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Edit Service Rate</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update rates and details for {editingService.name}</p>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Service Title</label>
                <input
                  required
                  value={editingService.name}
                  onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Fee</label>
                  <input
                    required
                    value={editingService.fee}
                    onChange={(e) => setEditingService({ ...editingService, fee: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Status</label>
                  <select
                    value={editingService.status}
                    onChange={(e) => setEditingService({ ...editingService, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Turnaround Time</label>
                <input
                  required
                  value={editingService.turnaround}
                  onChange={(e) => setEditingService({ ...editingService, turnaround: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Checklist Requirements</label>
                <textarea
                  rows={2}
                  required
                  value={editingService.requirements}
                  onChange={(e) => setEditingService({ ...editingService, requirements: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 font-bold uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black uppercase shadow-md transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Updating...' : 'Update Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
