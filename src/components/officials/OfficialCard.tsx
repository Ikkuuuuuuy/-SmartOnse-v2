'use client';

import React from 'react';
import Image from 'next/image';
import { Phone, Shield, Award, Landmark, FileText, Wallet } from 'lucide-react';
import { getOfficialRank } from '@/utils/officials';

interface Official {
  id: number | string;
  name: string;
  position: string;
  committee?: string | null;
  avatarUrl?: string | null;
  contact?: string | null;
}

export default function OfficialCard({
  official,
  accent = 'barangay',
}: {
  official: Official;
  accent?: 'barangay' | 'sk';
}) {
  const isSK = accent === 'sk';
  const rank = getOfficialRank(official.position);

  // Determine badge styling based on rank
  let roleBadge = {
    label: isSK ? 'SK Kagawad' : 'Barangay Kagawad',
    color: isSK 
      ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50' 
      : 'bg-rose-50 dark:bg-rose-950/70 text-[#9C2007] dark:text-rose-300 border-rose-200 dark:border-rose-900/50',
    icon: <Award className="w-3 h-3" />,
  };

  if (rank === 1) {
    roleBadge = {
      label: isSK ? 'SK Chairperson' : 'Punong Barangay',
      color: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700/60 shadow-xs',
      icon: <Landmark className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
    };
  } else if (rank === 2) {
    roleBadge = {
      label: isSK ? 'SK Treasurer' : 'Barangay Treasurer',
      color: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/60',
      icon: <Wallet className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
    };
  } else if (rank === 3) {
    roleBadge = {
      label: isSK ? 'SK Secretary' : 'Barangay Secretary',
      color: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800/60',
      icon: <FileText className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />,
    };
  }

  const isSeal = !official.avatarUrl || official.avatarUrl.includes('seal');

  return (
    <div
      className={`group relative p-6 rounded-[2.5rem] border backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col items-center text-center ${
        rank === 1
          ? isSK
            ? 'bg-gradient-to-b from-blue-50/70 via-white to-white dark:from-[#0E2042] dark:via-[#091326] dark:to-[#091326] border-blue-300 dark:border-blue-700/60 shadow-lg shadow-blue-500/5 ring-1 ring-blue-500/20'
            : 'bg-gradient-to-b from-rose-50/70 via-white to-white dark:from-[#240C10] dark:via-[#0E1524] dark:to-[#0E1524] border-rose-300 dark:border-rose-900/60 shadow-lg shadow-red-900/10 ring-1 ring-rose-500/20'
          : 'bg-white/90 dark:bg-[#0E1B33]/90 border-slate-200/90 dark:border-blue-900/50 shadow-md'
      }`}
    >

      {/* Avatar / Portrait */}
      <div
        className={`relative w-28 h-28 mb-4 rounded-full overflow-hidden border-4 transition-transform duration-300 group-hover:scale-105 shadow-md ${
          rank === 1
            ? 'border-amber-400 dark:border-amber-500/70 shadow-amber-500/20'
            : isSK
            ? 'border-blue-400/50 dark:border-blue-500/40'
            : 'border-[#9C2007]/30 dark:border-rose-500/40'
        } ${isSeal ? 'bg-slate-50 dark:bg-slate-900 p-2' : 'bg-slate-100 dark:bg-slate-800'}`}
      >
        <Image
          src={official.avatarUrl || '/images/barangay-onse-seal.png'}
          alt={official.name}
          fill
          sizes="(max-width: 768px) 112px, 112px"
          className={isSeal ? 'object-contain p-2' : 'object-cover object-top'}
        />
      </div>

      {/* Role Pill */}
      <span
        className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2.5 border ${roleBadge.color}`}
      >
        {roleBadge.icon}
        <span>{roleBadge.label}</span>
      </span>

      {/* Name */}
      <h3 className="font-black text-base tracking-tight mb-1 text-slate-900 dark:text-white line-clamp-1 group-hover:text-[#9C2007] dark:group-hover:text-rose-400 transition-colors">
        {official.name}
      </h3>

      {/* Designation */}
      <p
        className={`text-xs font-black uppercase tracking-wide mb-2 ${
          rank === 1
            ? isSK ? 'text-blue-600 dark:text-blue-400' : 'text-[#9C2007] dark:text-rose-400'
            : isSK ? 'text-blue-600 dark:text-sky-400' : 'text-[#9C2007] dark:text-rose-400'
        }`}
      >
        {official.position}
      </p>

      {/* Committee */}
      {official.committee && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 px-2 min-h-[2.5rem]">
          {official.committee}
        </p>
      )}

      {/* Contact Hotline */}
      {official.contact && (
        <a
          href={`tel:${official.contact}`}
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-400 hover:text-[#9C2007] dark:hover:text-rose-400 bg-slate-50 dark:bg-[#070E1C] px-3 py-1 rounded-xl border border-slate-100 dark:border-blue-900/40 transition-colors"
        >
          <Phone className="w-3 h-3 text-slate-400" />
          <span>{official.contact}</span>
        </a>
      )}
    </div>
  );
}
