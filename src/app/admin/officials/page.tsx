'use client';

import React, { useState } from 'react';
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
  Search,
  Users,
  Sparkles,
  X
} from 'lucide-react';

export default function AdminOfficialsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'barangay' | 'sk'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [officials, setOfficials] = useState([
    // Sangguniang Barangay (Council)
    {
      id: 'OFF-01',
      name: 'Hon. Roberto B. Alba',
      position: 'Punong Barangay (Captain)',
      category: 'barangay',
      committee: 'Executive & Peace and Order',
      term: '2023 - 2026',
      contact: '0917-888-0011',
      email: 'captain@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Chairman.webp',
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
      name: 'Hon. Miguel Arguelles Zamora Jr.',
      position: 'Barangay Kagawad',
      category: 'barangay',
      committee: 'Committee on Education',
      term: '2023 - 2026',
      contact: '0917-888-0017',
      email: 'kagawad.zamora@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Miguel.webp',
    },
    {
      id: 'OFF-08',
      name: 'Hon. Rafael Lasin Borjal Jr.',
      position: 'Barangay Kagawad',
      category: 'barangay',
      committee: 'Committee on Transportation & Traffic',
      term: '2023 - 2026',
      contact: '0917-888-0018',
      email: 'kagawad.borjal@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/RAF.webp',
    },
    // Sangguniang Kabataan (SK)
    {
      id: 'OFF-09',
      name: 'Hon. John Michael D. Permato',
      position: 'SK Chairperson',
      category: 'sk',
      committee: 'Youth Leadership & Sports Development',
      term: '2023 - 2026',
      contact: '0917-888-0019',
      email: 'sk@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Permato.webp',
    },
    {
      id: 'OFF-10',
      name: 'Michaelito Bongalos',
      position: 'SK Treasurer',
      category: 'sk',
      committee: 'Youth Budget & Appropriations',
      term: '2023 - 2026',
      contact: '0917-888-0020',
      email: 'sk.treasurer@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Bongalos.webp',
    },
    {
      id: 'OFF-11',
      name: 'Jonathan D. Sorio',
      position: 'SK Secretary',
      category: 'sk',
      committee: 'Youth Records & Secretariat',
      term: '2023 - 2026',
      contact: '0917-888-0021',
      email: 'records@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Sorio.webp',
    },
    {
      id: 'OFF-12',
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
    {
      id: 'OFF-13',
      name: 'Hon. Ethan Jetter D.G. Garcia',
      position: 'SK Kagawad',
      category: 'sk',
      committee: 'Committee on Education & Culture',
      term: '2023 - 2026',
      contact: '0917-888-0023',
      email: 'sk.garcia@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Garcia.webp',
    },
    {
      id: 'OFF-14',
      name: 'Hon. Alexis Adrianne R. Luciano',
      position: 'SK Kagawad',
      category: 'sk',
      committee: 'Committee on Digital Arts & Innovation',
      term: '2023 - 2026',
      contact: '0917-888-0024',
      email: 'sk.luciano@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Luciano.webp',
    },
    {
      id: 'OFF-15',
      name: 'Hon. Sherric Q. Pantaleon',
      position: 'SK Kagawad',
      category: 'sk',
      committee: 'Committee on Sports Development',
      term: '2023 - 2026',
      contact: '0917-888-0025',
      email: 'sk.pantaleon@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Pantaleon.webp',
    },
    {
      id: 'OFF-16',
      name: 'Hon. Sherwin Reyes',
      position: 'SK Kagawad',
      category: 'sk',
      committee: 'Committee on Environmental Protection',
      term: '2023 - 2026',
      contact: '0917-888-0026',
      email: 'sk.sreyes@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Reyes.webp',
    },
    {
      id: 'OFF-17',
      name: 'Hon. Ian Jeffrey L. Cadiang',
      position: 'SK Kagawad',
      category: 'sk',
      committee: 'Committee on Anti-Drug Abuse Campaign',
      term: '2023 - 2026',
      contact: '0917-888-0027',
      email: 'sk.cadiang@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Cadiang.webp',
    },
    {
      id: 'OFF-18',
      name: 'Hon. Joshua D. Munsayac',
      position: 'SK Kagawad',
      category: 'sk',
      committee: 'Committee on Disaster Preparedness',
      term: '2023 - 2026',
      contact: '0917-888-0028',
      email: 'sk.munsayac@onse.gov.ph',
      status: 'ACTIVE',
      avatar: '/images/Munsayac.webp',
    },
  ]);

  const filteredOfficials = officials.filter((off) => {
    const matchesTab = activeTab === 'all' || off.category === activeTab;
    const matchesSearch = off.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          off.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          off.committee.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Sangguniang Barangay &amp; Sangguniang Kabataan
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Term 2023 &ndash; 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Barangay Council &amp; Officials Management
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Official / Staff</span>
          </button>
        </div>
      </div>

      {/* Tab Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-4 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
            }`}
          >
            All Officials ({officials.length})
          </button>

          <button
            onClick={() => setActiveTab('barangay')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'barangay'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
            }`}
          >
            🏛️ Barangay Council (8)
          </button>

          <button
            onClick={() => setActiveTab('sk')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'sk'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
            }`}
          >
            🎓 Sangguniang Kabataan (10)
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or committee..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]"
          />
        </div>
      </div>

      {/* Officials 18 Grid Cards with Real Photos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredOfficials.map((off) => {
          const isSK = off.category === 'sk';

          return (
            <div
              key={off.id}
              className="bg-white dark:bg-[#0B1528] rounded-3xl p-5 border border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:shadow-lg transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Official Photo Avatar */}
                <div className="flex items-start justify-between">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-blue-900/50 shadow-md bg-slate-100 dark:bg-[#0E1B33] shrink-0">
                    <img
                      src={off.avatar}
                      alt={off.name}
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(off.name)}&background=9C2007&color=fff&bold=true`;
                      }}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                    isSK 
                      ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800/40' 
                      : 'bg-rose-50 dark:bg-rose-950/70 text-[#9C2007] dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
                  }`}>
                    {isSK ? 'SK Official' : 'Barangay'}
                  </span>
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
                <button
                  onClick={() => alert(`Editing official ${off.name}`)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-xl font-bold text-[11px] transition cursor-pointer border border-transparent dark:border-blue-900/40"
                >
                  Edit &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Official Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Add Council Member / Staff</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Record a newly elected council member or appointed staff officer.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsAddModalOpen(false);
                alert('Official profile added successfully!');
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Official Name</label>
                <input required placeholder="Hon. Juan Dela Cruz" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Designation</label>
                  <input required placeholder="Barangay Kagawad" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Category</label>
                  <select className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer">
                    <option value="barangay">Barangay Council</option>
                    <option value="sk">Sangguniang Kabataan</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Assigned Committee</label>
                <input required placeholder="e.g. Committee on Public Safety" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747] font-bold uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black uppercase shadow-md transition cursor-pointer"
                >
                  Save Official
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
