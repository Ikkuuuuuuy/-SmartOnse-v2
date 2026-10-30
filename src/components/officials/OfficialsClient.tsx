'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import OfficialCard from '@/components/officials/OfficialCard';
import { Building2, Sparkles, Users, ArrowRight } from 'lucide-react';

interface OfficialsClientProps {
  barangayOfficials: any[];
  skOfficials: any[];
}

export default function OfficialsClient({ barangayOfficials, skOfficials }: OfficialsClientProps) {
  const { language, t } = useLanguage();
  const isFil = language === 'fil';

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-24 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header Section */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            {isFil ? 'Mga Opisyal ng ' : 'Barangay '}
            <span className="text-[#9C2007] dark:text-rose-500">
              {isFil ? 'Barangay' : 'Officials'}
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
            {t('officials.subtitle')}
          </p>

          <div className="h-1 w-24 bg-gradient-to-r from-[#9C2007] to-amber-500 mx-auto rounded-full"></div>

          {/* Quick jumps */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#barangay-council"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/50 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5 text-[#9C2007]" />
              <span>{t('officials.jump_brgy')} ({barangayOfficials.length})</span>
            </a>
            <a
              href="#sk-council"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/50 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>{t('officials.jump_sk')} ({skOfficials.length})</span>
            </a>
            <Link
              href="/about"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              <span>{t('officials.jump_about')}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Sangguniang Barangay Section */}
        <section id="barangay-council" className="scroll-mt-32 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-blue-900/50">
            <div>
              <div className="flex items-center gap-2 text-[#9C2007] dark:text-rose-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
                <Building2 className="w-4 h-4" />
                <span>Sangguniang Barangay</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {t('officials.brgy_heading')}
              </h2>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isFil ? 'Namumuno: ' : 'Presiding: '}
              <span className="font-bold text-slate-800 dark:text-slate-200">Hon. Roberto B. Alba</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {barangayOfficials.map((official) => (
              <OfficialCard key={official.id} official={official} accent="barangay" />
            ))}
          </div>
        </section>

        {/* Sangguniang Kabataan Section */}
        <section id="sk-council" className="scroll-mt-32 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-blue-900/50">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Sangguniang Kabataan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {t('officials.sk_heading')}
              </h2>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isFil ? 'Namumuno: ' : 'Presiding: '}
              <span className="font-bold text-slate-800 dark:text-slate-200">Hon. John Michael D. Permato</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {skOfficials.map((official) => (
              <OfficialCard key={official.id} official={official} accent="sk" />
            ))}
          </div>
        </section>

        {/* Civic Contact Strip */}
        <div className="bg-gradient-to-br from-[#9C2007] via-[#821804] to-[#000055] p-8 sm:p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20">
              {isFil ? 'Tulong Pampubliko sa Frontline' : 'Frontline Public Assistance'}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {isFil ? 'Kailangan ng tulong mula sa Konseho ng Barangay?' : 'Need assistance from the Barangay Council?'}
            </h3>
            <p className="text-white/80 text-sm max-w-xl">
              {isFil
                ? 'Magsumite ng kahilingan para sa mga sertipiko, mga katanungan, o reklamo online gamit ang 24/7 SmartOnse citizen portal.'
                : 'File certificate requests, inquiries, or blotter concerns directly online through our 24/7 SmartOnse citizen portal.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/services"
              className="px-6 py-3.5 bg-white text-[#9C2007] rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-rose-50 transition shadow-lg"
            >
              {isFil ? 'Tingnan ang mga Serbisyo' : 'Browse Services'}
            </Link>
            <Link
              href="/about"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition"
            >
              {isFil ? 'Alamin ang Tungkol Dito' : 'Learn More'}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

