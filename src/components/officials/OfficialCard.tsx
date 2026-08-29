'use client';

import React from 'react';
import Image from 'next/image';

interface Official {
  id: number;
  name: string;
  position: string;
  committee?: string;
  avatarUrl?: string;
  contact?: string;
}

export default function OfficialCard({
  official,
  accent = 'barangay',
}: {
  official: Official;
  accent?: 'barangay' | 'sk';
}) {
  const isSK = accent === 'sk';

  return (
    <div
      className={`p-6 rounded-[2.5rem] border shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col items-center text-center bg-white dark:bg-[#0E1B33] ${
        isSK
          ? 'border-blue-200 dark:border-blue-900/60'
          : 'border-slate-200 dark:border-blue-900/50'
      }`}
    >
      <div className={`relative w-28 h-28 mb-4 rounded-full overflow-hidden border-4 ${
        isSK ? 'border-blue-500/30 dark:border-blue-500/40' : 'border-[#9C2007]/20 dark:border-rose-500/30'
      } shadow-md`}>
        <Image
          src={official.avatarUrl || '/images/barangay-onse-seal.png'}
          alt={official.name}
          fill
          className="object-cover"
        />
      </div>

      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2 ${
        isSK 
          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50'
          : 'bg-rose-50 dark:bg-rose-950/80 text-[#9C2007] dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
      }`}>
        {isSK ? 'SK Council' : 'Barangay Council'}
      </span>

      <h3 className="font-black text-base uppercase tracking-tight mb-1 text-slate-900 dark:text-white">
        {official.name}
      </h3>
      
      <p
        className={`text-xs font-black uppercase tracking-wider mb-2 ${
          isSK ? 'text-blue-600 dark:text-amber-400' : 'text-[#9C2007] dark:text-rose-400'
        }`}
      >
        {official.position}
      </p>

      {official.committee && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          {official.committee}
        </p>
      )}

      {official.contact && (
        <p className="mt-3 text-[10px] font-mono text-slate-400 dark:text-slate-500 font-semibold">
          {official.contact}
        </p>
      )}
    </div>
  );
}
