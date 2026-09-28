'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Building2, 
  Plus, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Award, 
  UserPlus, 
  Edit3,
  Trash2,
  Search,
  Users,
  RefreshCw,
  X,
  Loader2,
  Landmark,
  Wallet,
  FileText
} from 'lucide-react';
import { 
  sortOfficialsByHierarchy, 
  getOfficialRank, 
  BARANGAY_ROLES, 
  SK_ROLES 
} from '@/utils/officials';

export interface OfficialItem {
  id: string;
  name: string;
  position: string;
  category: 'barangay' | 'sk';
  committee: string;
  term: string;
  contact: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar: string;
}

const FALLBACK_OFFICIALS: OfficialItem[] = [
  {
    id: 'OFF-01',
    name: 'Hon. Roberto B. Alba',
    position: 'Barangay Chairman',
    category: 'barangay',
    committee: 'Executive & Peace and Order',
    term: '2023 - 2026',
    contact: '0917-888-0011',
    email: 'captain@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/Chairman.webp',
  },
  {
    id: 'OFF-01B',
    name: 'Elena V. Gutierrez',
    position: 'Barangay Treasurer',
    category: 'barangay',
    committee: 'Finance, Budget & Appropriations',
    term: '2023 - 2026',
    contact: '0917-888-0029',
    email: 'treasurer@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/barangay-onse-seal.png',
  },
  {
    id: 'OFF-01C',
    name: 'Maria Elena C. Gomez',
    position: 'Barangay Secretary',
    category: 'barangay',
    committee: 'Secretariat & Administrative Records',
    term: '2023 - 2026',
    contact: '0917-888-0030',
    email: 'secretary@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/barangay-onse-seal.png',
  },
  {
    id: 'OFF-02',
    name: 'Hon. Danilo A. Florano',
    position: 'Barangay Kagawad',
    category: 'barangay',
    committee: 'Committee on Public Works',
    term: '2023 - 2026',
    contact: '0917-888-0012',
    email: 'kagawad.florano@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/Dan.webp',
  },
  {
    id: 'OFF-03',
    name: 'Hon. Zenaida C. Casao',
    position: 'Barangay Kagawad',
    category: 'barangay',
    committee: 'Committee on Health & Sanitation',
    term: '2023 - 2026',
    contact: '0917-888-0013',
    email: 'kagawad.casao@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/Zenaida.webp',
  },
  {
    id: 'OFF-04',
    name: 'Hon. Ryan Lopez Lorbes',
    position: 'Barangay Kagawad',
    category: 'barangay',
    committee: 'Committee on Cleanliness & Environment',
    term: '2023 - 2026',
    contact: '0917-888-0014',
    email: 'kagawad.lorbes@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/Ryan.webp',
  },
  {
    id: 'OFF-05',
    name: 'Hon. John Mark Cortez Daradal',
    position: 'Barangay Kagawad',
    category: 'barangay',
    committee: 'Committee on Ways and Means',
    term: '2023 - 2026',
    contact: '0917-888-0015',
    email: 'kagawad.daradal@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/JM.webp',
  },
  {
    id: 'OFF-06',
    name: 'Hon. Federico Soller Deniega',
    position: 'Barangay Kagawad',
    category: 'barangay',
    committee: 'Committee on Peace and Order',
    term: '2023 - 2026',
    contact: '0917-888-0016',
    email: 'kagawad.deniega@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/Federico.webp',
  },
  {
    id: 'OFF-07',
    name: 'Hon. John Michael D. Permato',
    position: 'SK Chairperson',
    category: 'sk',
    committee: 'Youth Leadership & Sports Development',
    term: '2023 - 2026',
    contact: '0917-888-0019',
    email: 'sk.permato@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/Permato.webp',
  },
  {
    id: 'OFF-08',
    name: 'Michaelito Bongalos',
    position: 'SK Treasurer',
    category: 'sk',
    committee: 'Youth Budget & Appropriations',
    term: '2023 - 2026',
    contact: '0917-888-0020',
    email: 'sk.bongalos@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/Bongalos.webp',
  },
  {
    id: 'OFF-09',
    name: 'Jonathan D. Sorio',
    position: 'SK Secretary',
    category: 'sk',
    committee: 'Youth Records & Secretariat',
    term: '2023 - 2026',
    contact: '0917-888-0021',
    email: 'sk.sorio@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/Sorio.webp',
  },
  {
    id: 'OFF-10',
    name: 'Hon. Abigail A. Reyes',
    position: 'SK Kagawad',
    category: 'sk',
    committee: 'Committee on Health & Nutrition',
    term: '2023 - 2026',
    contact: '0917-888-0022',
    email: 'sk.reyes@onse.gov.ph',
    status: 'ACTIVE',
    avatar: '/images/Mybaby.webp',
  },
];

export default function AdminOfficialsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'barangay' | 'sk'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [officials, setOfficials] = useState<OfficialItem[]>(() => sortOfficialsByHierarchy(FALLBACK_OFFICIALS));
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<OfficialItem | null>(null);

  // Add Form state
  const [addForm, setAddForm] = useState({
    name: '',
    position: 'Barangay Kagawad',
    category: 'barangay' as 'barangay' | 'sk',
    committee: '',
    contact: '',
    term: '2023 - 2026',
    avatarUrl: '/images/barangay-onse-seal.png',
  });
  const [addRoleMode, setAddRoleMode] = useState<string>('Barangay Kagawad');

  // Edit Form role mode
  const [editRoleMode, setEditRoleMode] = useState<string>('');

  const fetchOfficials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/officials');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.officials) && data.officials.length > 0) {
        setOfficials(sortOfficialsByHierarchy(data.officials));
      }
    } catch (err) {
      console.error('Failed to fetch officials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  // When opening add modal, reset properly
  const handleOpenAddModal = () => {
    setAddForm({
      name: '',
      position: 'Barangay Kagawad',
      category: 'barangay',
      committee: 'Committee on Public Safety',
      contact: '',
      term: '2023 - 2026',
      avatarUrl: '/images/barangay-onse-seal.png',
    });
    setAddRoleMode('Barangay Kagawad');
    setIsAddModalOpen(true);
  };

  // When opening edit modal, detect role mode
  const handleOpenEditModal = (off: OfficialItem) => {
    setEditingOfficial({ ...off });
    const available = off.category === 'sk' ? (SK_ROLES as readonly string[]) : (BARANGAY_ROLES as readonly string[]);
    const isExactMatch = available.includes(off.position);
    if (isExactMatch) {
      setEditRoleMode(off.position);
    } else {
      // Check if it fits common variations
      const p = off.position.toLowerCase();
      if (p.includes('chair') || p.includes('punong') || p.includes('captain')) {
        setEditRoleMode(off.category === 'sk' ? 'SK Chairperson' : 'Barangay Chairman');
      } else if (p.includes('treasur')) {
        setEditRoleMode(off.category === 'sk' ? 'SK Treasurer' : 'Barangay Treasurer');
      } else if (p.includes('secretar')) {
        setEditRoleMode(off.category === 'sk' ? 'SK Secretary' : 'Barangay Secretary');
      } else if (p.includes('kagawad')) {
        setEditRoleMode(off.category === 'sk' ? 'SK Kagawad' : 'Barangay Kagawad');
      } else {
        setEditRoleMode('other');
      }
    }
  };

  const handleCategoryChangeForAdd = (cat: 'barangay' | 'sk') => {
    const defaultRole = cat === 'barangay' ? 'Barangay Kagawad' : 'SK Kagawad';
    setAddRoleMode(defaultRole);
    setAddForm({
      ...addForm,
      category: cat,
      position: defaultRole,
    });
  };

  const handleRoleSelectForAdd = (role: string) => {
    setAddRoleMode(role);
    if (role === 'other') {
      setAddForm({ ...addForm, position: '' });
    } else {
      // Suggest committee based on standard role
      let suggestedCommittee = addForm.committee;
      if (role.includes('Chairman') || role.includes('Chairperson')) {
        suggestedCommittee = 'Executive & Governance';
      } else if (role.includes('Treasurer')) {
        suggestedCommittee = 'Finance, Budget & Appropriations';
      } else if (role.includes('Secretary')) {
        suggestedCommittee = 'Secretariat & Administrative Records';
      }
      setAddForm({ 
        ...addForm, 
        position: role, 
        committee: suggestedCommittee || addForm.committee 
      });
    }
  };

  const handleRoleSelectForEdit = (role: string) => {
    if (!editingOfficial) return;
    setEditRoleMode(role);
    if (role === 'other') {
      // Keep existing position or let them customize
    } else {
      let suggestedCommittee = editingOfficial.committee;
      if (role.includes('Chairman') || role.includes('Chairperson')) {
        suggestedCommittee = 'Executive & Governance';
      } else if (role.includes('Treasurer')) {
        suggestedCommittee = 'Finance, Budget & Appropriations';
      } else if (role.includes('Secretary')) {
        suggestedCommittee = 'Secretariat & Administrative Records';
      }
      setEditingOfficial({
        ...editingOfficial,
        position: role,
        committee: suggestedCommittee || editingOfficial.committee,
      });
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict numeric validation: phone number cannot contain letters
    const digits = addForm.contact.replace(/\D/g, '');
    if (/[a-zA-Z]/.test(addForm.contact) || (addForm.contact.trim() && digits.length < 7)) {
      alert('Invalid Contact Number: Please enter numeric phone digits only (e.g., 0917-888-0000 or 09171234567). Letters are not allowed.');
      return;
    }

    if (!addForm.position || !addForm.position.trim()) {
      alert('Please select or specify a valid designation / position.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/officials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok && data.success && data.official) {
        setOfficials((prev) => sortOfficialsByHierarchy([...prev, data.official]));
        setIsAddModalOpen(false);
      } else {
        alert(data.error || 'Failed to add official.');
      }
    } catch (err) {
      console.error('Error adding official:', err);
      alert('An error occurred while saving official profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOfficial) return;

    // Strict numeric validation
    const digits = editingOfficial.contact.replace(/\D/g, '');
    if (/[a-zA-Z]/.test(editingOfficial.contact) || (editingOfficial.contact.trim() && digits.length < 7)) {
      alert('Invalid Contact Number: Please enter numeric phone digits only (e.g., 0917-888-0000). Letters are not allowed.');
      return;
    }

    if (!editingOfficial.position || !editingOfficial.position.trim()) {
      alert('Please select or specify a valid designation / position.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/officials/${editingOfficial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingOfficial,
          avatarUrl: editingOfficial.avatar,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.official) {
        setOfficials((prev) =>
          sortOfficialsByHierarchy(
            prev.map((off) => (off.id === editingOfficial.id ? { ...off, ...data.official } : off))
          )
        );
        setEditingOfficial(null);
      } else {
        alert(data.error || 'Failed to update official.');
      }
    } catch (err) {
      console.error('Error updating official:', err);
      alert('An error occurred while updating official.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOfficial = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from council officials?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/officials/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOfficials((prev) => prev.filter((off) => off.id !== id));
      } else {
        alert(data.error || 'Failed to delete official.');
      }
    } catch (err) {
      console.error('Error deleting official:', err);
      alert('An error occurred while deleting official.');
    }
  };

  const filteredOfficials = sortOfficialsByHierarchy(
    officials.filter((o) => {
      const matchesTab = activeTab === 'all' || o.category === activeTab;
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        o.name.toLowerCase().includes(q) ||
        o.position.toLowerCase().includes(q) ||
        o.committee.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    })
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Civic Hierarchy &amp; Leadership Directory
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Chairman &bull; Treasurer &bull; Secretary &bull; Kagawads</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Barangay &amp; SK Officials
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOfficials}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Officials'}</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Official</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-4 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#080E1A] rounded-2xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#0E1B33] text-[#9C2007] dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Leaders ({officials.length})
          </button>
          <button
            onClick={() => setActiveTab('barangay')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
              activeTab === 'barangay'
                ? 'bg-white dark:bg-[#0E1B33] text-[#9C2007] dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Barangay Council
          </button>
          <button
            onClick={() => setActiveTab('sk')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
              activeTab === 'sk'
                ? 'bg-white dark:bg-[#0E1B33] text-[#9C2007] dark:text-rose-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            SK Council
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search official, position, committee..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
          />
        </div>
      </div>

      {/* Officials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOfficials.map((off) => {
          const isSK = off.category === 'sk';
          const rank = getOfficialRank(off.position);

          let roleBadge = {
            label: isSK ? 'SK Kagawad' : 'Barangay Kagawad',
            color: isSK 
              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800/40' 
              : 'bg-rose-50 dark:bg-rose-950/70 text-[#9C2007] dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
            icon: <Award className="w-3 h-3" />,
          };

          if (rank === 1) {
            roleBadge = {
              label: isSK ? 'SK Chairperson' : 'Barangay Chairman',
              color: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
              icon: <Landmark className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
            };
          } else if (rank === 2) {
            roleBadge = {
              label: isSK ? 'SK Treasurer' : 'Barangay Treasurer',
              color: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60',
              icon: <Wallet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
            };
          } else if (rank === 3) {
            roleBadge = {
              label: isSK ? 'SK Secretary' : 'Barangay Secretary',
              color: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/60',
              icon: <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />,
            };
          }

          return (
            <div
              key={off.id}
              className={`rounded-3xl p-6 border shadow-xs hover:shadow-md transition-all space-y-4 flex flex-col justify-between ${
                rank === 1
                  ? 'bg-gradient-to-b from-amber-50/40 via-white to-white dark:from-amber-950/20 dark:via-[#0B1528] dark:to-[#0B1528] border-amber-300/60 dark:border-amber-700/40 ring-1 ring-amber-400/20'
                  : rank === 2
                  ? 'bg-white dark:bg-[#0B1528] border-emerald-200/60 dark:border-emerald-900/40'
                  : rank === 3
                  ? 'bg-white dark:bg-[#0B1528] border-indigo-200/60 dark:border-indigo-900/40'
                  : 'bg-white dark:bg-[#0B1528] border-slate-200/80 dark:border-blue-900/40'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  {/* Photo / Avatar */}
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-[#9C2007]/20 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={off.avatar || '/images/barangay-onse-seal.png'}
                      alt={off.name}
                      onError={(e: any) => {
                        e.target.src = '/images/barangay-onse-seal.png';
                      }}
                      className={`w-full h-full ${off.avatar?.includes('seal') ? 'object-contain p-1.5' : 'object-cover object-top'}`}
                    />
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${roleBadge.color}`}>
                      {roleBadge.icon}
                      <span>{roleBadge.label}</span>
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      {isSK ? 'SK Council' : 'Barangay Council'}
                    </span>
                  </div>
                </div>

                {/* Name & Position */}
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white leading-snug">{off.name}</h3>
                  <p className="text-xs text-[#9C2007] dark:text-rose-400 font-bold uppercase tracking-wider mt-0.5">
                    {off.position}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-1 line-clamp-2">
                    {off.committee}
                  </p>
                </div>

                {/* Contact Strip */}
                <div className="p-3 bg-slate-50 dark:bg-[#080E1A] rounded-2xl border border-slate-100 dark:border-blue-900/30 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px]">{off.contact}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate text-[11px]">{off.email}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{off.term}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(off)}
                    className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-xl font-bold text-[11px] transition cursor-pointer border border-transparent dark:border-blue-900/40 inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteOfficial(off.id, off.name)}
                    className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white rounded-xl font-bold text-[11px] transition cursor-pointer border border-rose-200/60 dark:border-rose-900/40 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Official Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Add Council Official / Staff</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select from predefined governance roles: Chairman, Treasurer, Secretary, or Kagawad.
              </p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Official Full Name</label>
                <input
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Hon. Juan Dela Cruz"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              {/* Council Category & Role Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Council Category</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => handleCategoryChangeForAdd(e.target.value as 'barangay' | 'sk')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                  >
                    <option value="barangay">Barangay Council</option>
                    <option value="sk">Sangguniang Kabataan (SK)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Role / Position (Dropdown)
                  </label>
                  <select
                    value={addRoleMode}
                    onChange={(e) => handleRoleSelectForAdd(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer font-bold"
                  >
                    {(addForm.category === 'sk' ? SK_ROLES : BARANGAY_ROLES).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                    <option value="other">Other / Custom Title...</option>
                  </select>
                </div>
              </div>

              {/* If "Other" is chosen, display text input to specify */}
              {addRoleMode === 'other' && (
                <div className="space-y-1 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40">
                  <label className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px]">
                    Specify Custom Position Title
                  </label>
                  <input
                    required
                    value={addForm.position}
                    onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                    placeholder="e.g. Chief Executive Officer / Council Clerk"
                    className="w-full px-3.5 py-2 bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Assigned Committee / Office</label>
                <input
                  required
                  value={addForm.committee}
                  onChange={(e) => setAddForm({ ...addForm, committee: e.target.value })}
                  placeholder="e.g. Committee on Public Safety"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Contact Number (Digits only)</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={addForm.contact}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9+-]/g, '');
                      setAddForm({ ...addForm, contact: cleaned });
                    }}
                    placeholder="0917-888-0000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                  <p className="text-[10px] text-slate-400">Numbers only (e.g., 0917-888-0000)</p>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Term Period</label>
                  <input
                    value={addForm.term}
                    onChange={(e) => setAddForm({ ...addForm, term: e.target.value })}
                    placeholder="2023 - 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
              </div>

              {/* Avatar Selection (Defaults to Official Seal) */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-blue-900/40">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block">
                  Official Profile Picture / Seal
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-[#9C2007]/20 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={addForm.avatarUrl || '/images/barangay-onse-seal.png'}
                      alt="Avatar Preview"
                      className={`w-full h-full ${addForm.avatarUrl?.includes('seal') ? 'object-contain p-1.5' : 'object-cover object-top'}`}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={addForm.avatarUrl}
                      onChange={(e) => setAddForm({ ...addForm, avatarUrl: e.target.value })}
                      placeholder="/images/barangay-onse-seal.png"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setAddForm({ ...addForm, avatarUrl: '/images/barangay-onse-seal.png' })}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-bold ${
                          addForm.avatarUrl === '/images/barangay-onse-seal.png'
                            ? 'bg-[#9C2007] text-white border-[#9C2007]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        Default Barangay Seal
                      </button>
                    </div>
                  </div>
                </div>
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
                  <span>{isSubmitting ? 'Saving...' : 'Save Official'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Official Modal */}
      {editingOfficial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingOfficial(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Edit Official Profile</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Modify role and assignment for {editingOfficial.name}
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Official Name</label>
                <input
                  required
                  value={editingOfficial.name}
                  onChange={(e) => setEditingOfficial({ ...editingOfficial, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              {/* Role Dropdown in Edit Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Council Category</label>
                  <select
                    value={editingOfficial.category}
                    onChange={(e) => {
                      const newCat = e.target.value as 'barangay' | 'sk';
                      const defaultRole = newCat === 'barangay' ? 'Barangay Kagawad' : 'SK Kagawad';
                      setEditingOfficial({ ...editingOfficial, category: newCat, position: defaultRole });
                      setEditRoleMode(defaultRole);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer"
                  >
                    <option value="barangay">Barangay Council</option>
                    <option value="sk">Sangguniang Kabataan</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Role / Position (Dropdown)
                  </label>
                  <select
                    value={editRoleMode}
                    onChange={(e) => handleRoleSelectForEdit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer font-bold"
                  >
                    {(editingOfficial.category === 'sk' ? SK_ROLES : BARANGAY_ROLES).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                    <option value="other">Other / Custom Title...</option>
                  </select>
                </div>
              </div>

              {/* If "other" or custom in edit mode */}
              {editRoleMode === 'other' && (
                <div className="space-y-1 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40">
                  <label className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px]">
                    Custom Position Title
                  </label>
                  <input
                    required
                    value={editingOfficial.position}
                    onChange={(e) => setEditingOfficial({ ...editingOfficial, position: e.target.value })}
                    placeholder="Enter custom position"
                    className="w-full px-3.5 py-2 bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Assigned Committee / Office</label>
                <input
                  value={editingOfficial.committee}
                  onChange={(e) => setEditingOfficial({ ...editingOfficial, committee: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Contact Number (Digits only)</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={editingOfficial.contact}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^0-9+-]/g, '');
                      setEditingOfficial({ ...editingOfficial, contact: cleaned });
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                  <p className="text-[10px] text-slate-400">Numbers only (e.g., 0917-888-0000)</p>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Term Period</label>
                  <input
                    value={editingOfficial.term}
                    onChange={(e) => setEditingOfficial({ ...editingOfficial, term: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
              </div>

              {/* Avatar Selection in Edit Modal */}
              <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-blue-900/40">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block">
                  Profile Picture / Seal
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-[#9C2007]/20 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editingOfficial.avatar || '/images/barangay-onse-seal.png'}
                      alt="Avatar Preview"
                      className={`w-full h-full ${editingOfficial.avatar?.includes('seal') ? 'object-contain p-1.5' : 'object-cover object-top'}`}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={editingOfficial.avatar}
                      onChange={(e) => setEditingOfficial({ ...editingOfficial, avatar: e.target.value })}
                      placeholder="/images/barangay-onse-seal.png"
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-1 focus:ring-[#9C2007]"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingOfficial({ ...editingOfficial, avatar: '/images/barangay-onse-seal.png' })}
                        className="text-[10px] px-2 py-0.5 rounded-md border font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      >
                        Reset to Seal
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingOfficial(null)}
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
                  <span>{isSubmitting ? 'Updating...' : 'Update Official'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
