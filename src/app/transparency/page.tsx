'use client';

import React from 'react';
import { FileText, Download, ShieldCheck, FileCheck2, DollarSign } from 'lucide-react';

const FALLBACK_TRANSPARENCY = [
  {
    id: 'DOC-01',
    title: 'CY 2026 Annual Barangay Budget & Appropriations Ordinance',
    category: 'Financial Statement',
    year: '2026',
    quarter: 'Annual',
    fileUrl: '/documents/transparency-annual-budget-2026.pdf',
    fileSize: '2.4 MB PDF',
  },
  {
    id: 'DOC-02',
    title: 'Q2 2026 20% Barangay Development Fund (BDF) Utilization Report',
    category: 'Quarterly Report',
    year: '2026',
    quarter: 'Q2',
    fileUrl: '/documents/transparency-bdf-q2-2026.pdf',
    fileSize: '1.8 MB PDF',
  },
  {
    id: 'DOC-03',
    title: 'CY 2026 Annual Procurement Plan (APP) & BAC Resolutions',
    category: 'Procurement',
    year: '2026',
    quarter: 'Annual',
    fileUrl: '/documents/transparency-app-2026.pdf',
    fileSize: '3.1 MB PDF',
  },
  {
    id: 'DOC-04',
    title: 'Q2 2026 Gender and Development (GAD) Fund Accomplishment Report',
    category: 'GAD Fund',
    year: '2026',
    quarter: 'Q2',
    fileUrl: '/documents/transparency-gad-q2-2026.pdf',
    fileSize: '1.2 MB PDF',
  },
  {
    id: 'DOC-05',
    title: 'SK Annual Barangay Youth Investment Program (ABYIP) 2026',
    category: 'SK Financial',
    year: '2026',
    quarter: 'Annual',
    fileUrl: '/documents/transparency-sk-abyip-2026.pdf',
    fileSize: '2.1 MB PDF',
  },
  {
    id: 'DOC-06',
    title: 'SK Q2 2026 Youth Development Fund (YDF) Itemized Receipts',
    category: 'SK Youth',
    year: '2026',
    quarter: 'Q2',
    fileUrl: '/documents/transparency-sk-ydf-q2-2026.pdf',
    fileSize: '1.5 MB PDF',
  },
];

export default function TransparencyPage() {
  const allDocs = FALLBACK_TRANSPARENCY;

  const skDocs = allDocs.filter((doc) => doc.category.toLowerCase().includes('sk') || doc.category.toLowerCase().includes('youth'));
  const barangayDocs = allDocs.filter((doc) => !doc.category.toLowerCase().includes('sk') && !doc.category.toLowerCase().includes('youth'));

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header Section */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-black uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            DILG Full Disclosure Policy (FDP) Compliance
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            Transparency <span className="text-[#9C2007] dark:text-rose-500">Board</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">
            Public Financial &amp; Administrative Records of Barangay Onse
          </p>
          <div className="h-1 w-20 bg-[#9C2007] mx-auto rounded-full"></div>
        </header>

        {/* Barangay Disclosure Section */}
        <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl sm:rounded-[3.5rem] shadow-2xl border border-slate-200 dark:border-blue-900/50 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Barangay Council <span className="text-[#9C2007] dark:text-rose-400">Disclosure</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              In compliance with the DILG directives, Barangay Onse maintains this board to provide
              residents open access to official financial ledgers, budget allotments, and procurement.
            </p>
          </div>

          {/* Barangay Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {barangayDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-7 bg-slate-50/80 dark:bg-[#152747]/80 rounded-3xl border border-slate-200 dark:border-blue-900/40 hover:bg-white dark:hover:bg-[#1C335C] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-black text-[#9C2007] dark:text-rose-400 uppercase tracking-widest bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-900/40">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">{doc.year} • {doc.quarter}</span>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base mb-4 leading-snug group-hover:text-[#9C2007] dark:group-hover:text-rose-400 transition-colors">
                    {doc.title}
                  </h3>
                </div>

                <div className="pt-4 border-t border-slate-200/60 dark:border-blue-900/40">
                  <a
                    href={doc.fileUrl || '#'}
                    onClick={(e) => {
                      if (!doc.fileUrl || doc.fileUrl === '#') {
                        e.preventDefault();
                        alert(`Opening official certified ledger: ${doc.title}`);
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-black uppercase text-slate-700 dark:text-slate-200 group-hover:text-white group-hover:bg-[#9C2007] transition-all bg-white dark:bg-[#0E1B33] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-blue-900/50 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ({doc.fileSize})</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SK Disclosure Section */}
        <div className="bg-white dark:bg-[#0B1528] text-slate-900 dark:text-white p-8 md:p-12 rounded-3xl sm:rounded-[3.5rem] shadow-xl border border-blue-200 dark:border-blue-900/50 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Sangguniang Kabataan <span className="text-blue-600 dark:text-blue-400">Disclosure</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
              Supporting youth empowerment through clear and accessible documentation of SK funds,
              activities, and developmental programs under R.A. 10742.
            </p>
          </div>

          {/* SK Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {skDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-7 bg-blue-50/60 dark:bg-[#152747]/80 rounded-3xl border border-blue-100 dark:border-blue-900/40 hover:bg-blue-50/90 dark:hover:bg-[#1C335C] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/50">
                      {doc.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400">{doc.year} • {doc.quarter}</span>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base mb-4 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {doc.title}
                  </h3>
                </div>

                <div className="pt-4 border-t border-blue-200/50 dark:border-blue-900/40">
                  <a
                    href={doc.fileUrl || '#'}
                    onClick={(e) => {
                      if (!doc.fileUrl || doc.fileUrl === '#') {
                        e.preventDefault();
                        alert(`Opening official certified ledger: ${doc.title}`);
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 text-xs font-black uppercase text-slate-700 dark:text-slate-200 group-hover:text-white group-hover:bg-blue-600 transition-all bg-white dark:bg-[#0E1B33] px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ({doc.fileSize})</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
