'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Sparkles, 
  Award, 
  Landmark, 
  Wallet, 
  FileText, 
  ArrowRight, 
  Phone, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { isSkOfficial, sortOfficialsByHierarchy, getOfficialRank } from '@/utils/officials';

export interface OfficialPreview {
  id: string | number;
  name: string;
  position: string;
  committee?: string | null;
  avatarUrl?: string | null;
  contact?: string | null;
  category?: 'barangay' | 'sk';
}

export default function LeadershipSpotlight({ officials }: { officials: OfficialPreview[] }) {
  const [activeTab, setActiveTab] = useState<'barangay' | 'sk'>('barangay');

  const barangayList = sortOfficialsByHierarchy(
    officials.filter((o) => !isSkOfficial({ role: o.position, position: o.position, category: o.category }))
  );

  const skList = sortOfficialsByHierarchy(
    officials.filter((o) => isSkOfficial({ role: o.position, position: o.position, category: o.category }))
  );

  const currentList = activeTab === 'barangay' ? barangayList : skList;

  // Split into Top Executive Officers (Chairman, Treasurer, Secretary) and Kagawads
  const executiveOfficers = currentList.filter((o) => getOfficialRank(o.position) <= 3);
  const kagawads = currentList.filter((o) => getOfficialRank(o.position) === 4);

  return (
    <div className="space-y-8">
      {/* Tab Switcher & Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 dark:bg-[#0E1B33]/70 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-white dark:border-blue-900/50 shadow-lg">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-[#070D18] rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('barangay')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'barangay'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Barangay Council</span>
          </button>
          <button
            onClick={() => setActiveTab('sk')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'sk'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sangguniang Kabataan (SK)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <span className="hidden md:inline">Structured in Official Civic Hierarchy:</span>
          <span className="font-extrabold text-slate-800 dark:text-slate-200">
            Chairman &bull; Treasurer &bull; Secretary &bull; Kagawads
          </span>
        </div>
      </div>

      {/* TIER 1: Executive Officers (Chairman, Treasurer, Secretary) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-3 py-1 rounded-full">
            Executive Leadership &bull; Ranks 1 to 3
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {executiveOfficers.map((official) => {
            const rank = getOfficialRank(official.position);
            const isChairman = rank === 1;
            const isTreasurer = rank === 2;
            const isSecretary = rank === 3;
            const isSeal = !official.avatarUrl || official.avatarUrl.includes('seal');

            let badgeConfig = {
              label: 'Executive Officer',
              badgeColor: 'bg-rose-50 dark:bg-rose-950/70 text-[#9C2007] dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
              icon: <Award className="w-3.5 h-3.5" />,
              borderGlow: 'border-slate-200 dark:border-blue-900/50',
            };

            if (isChairman) {
              badgeConfig = {
                label: activeTab === 'sk' ? 'SK Chairperson' : 'Barangay Chairman',
                badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
                icon: <Landmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
                borderGlow: 'border-amber-300 dark:border-amber-700/50 shadow-xl shadow-amber-500/5 ring-1 ring-amber-400/20',
              };
            } else if (isTreasurer) {
              badgeConfig = {
                label: activeTab === 'sk' ? 'SK Treasurer' : 'Barangay Treasurer',
                badgeColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60',
                icon: <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
                borderGlow: 'border-emerald-200 dark:border-emerald-900/50 shadow-lg',
              };
            } else if (isSecretary) {
              badgeConfig = {
                label: activeTab === 'sk' ? 'SK Secretary' : 'Barangay Secretary',
                badgeColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-900 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/60',
                icon: <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
                borderGlow: 'border-indigo-200 dark:border-indigo-900/50 shadow-lg',
              };
            }

            return (
              <div
                key={official.id}
                className={`relative bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-6 sm:p-7 rounded-[2.5rem] border ${badgeConfig.borderGlow} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${badgeConfig.badgeColor}`}>
                      {badgeConfig.icon}
                      <span>{badgeConfig.label}</span>
                    </span>
                    <span className="text-[10px] font-black uppercase text-slate-400 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
                      Rank {rank}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 ${
                      isChairman 
                        ? 'border-amber-400 dark:border-amber-500/80' 
                        : isTreasurer 
                        ? 'border-emerald-400 dark:border-emerald-500/80' 
                        : 'border-indigo-400 dark:border-indigo-500/80'
                    } ${isSeal ? 'bg-slate-50 dark:bg-slate-900 p-1.5' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Image
                        src={official.avatarUrl || '/images/barangay-onse-seal.png'}
                        alt={official.name}
                        fill
                        sizes="80px"
                        className={isSeal ? 'object-contain p-1' : 'object-cover object-top'}
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base leading-snug">
                        {official.name}
                      </h4>
                      <p className="text-xs font-bold text-[#9C2007] dark:text-rose-400 uppercase tracking-wide mt-0.5">
                        {official.position}
                      </p>
                    </div>
                  </div>

                  {official.committee && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-4">
                      {official.committee}
                    </p>
                  )}
                </div>

                {official.contact && (
                  <div className="pt-3 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {official.contact}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Active Term
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* TIER 2: Kagawads Grid (Councilors) */}
      <div>
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            {activeTab === 'sk' ? 'SK Kagawads' : 'Barangay Kagawads'} &bull; Rank 4 ({kagawads.length} Members)
          </span>
          <Link
            href="/officials"
            className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-[#9C2007] dark:text-rose-400 hover:underline"
          >
            <span>View Full Directory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {kagawads.map((kagawad) => {
            const isSeal = !kagawad.avatarUrl || kagawad.avatarUrl.includes('seal');
            return (
              <div
                key={kagawad.id}
                className="bg-white/70 dark:bg-[#0E1B33]/70 backdrop-blur-md p-4 rounded-3xl border border-white dark:border-blue-900/40 text-center flex flex-col items-center justify-between hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden mb-2.5 border-2 border-slate-200 dark:border-blue-900/60 group-hover:border-[#9C2007] dark:group-hover:border-rose-500 transition-colors">
                  <Image
                    src={kagawad.avatarUrl || '/images/barangay-onse-seal.png'}
                    alt={kagawad.name}
                    fill
                    sizes="56px"
                    className={isSeal ? 'object-contain p-1' : 'object-cover object-top'}
                  />
                </div>
                <div>
                  <h5 className="font-black text-xs text-slate-900 dark:text-white leading-tight line-clamp-2">
                    {kagawad.name}
                  </h5>
                  <p className="text-[10px] font-bold text-[#9C2007] dark:text-rose-400 uppercase tracking-tight mt-0.5">
                    {kagawad.position}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-[#070D18] rounded-3xl border border-slate-200/80 dark:border-blue-900/40">
        <div>
          <h4 className="font-black text-sm uppercase text-slate-900 dark:text-white">
            Want to contact an official or check committee schedules?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View full contact numbers, public hearing calendars, and council profiles on the dedicated page.
          </p>
        </div>
        <Link
          href="/officials"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#9C2007] hover:bg-[#821804] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md shrink-0"
        >
          <span>Explore All Officials</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
