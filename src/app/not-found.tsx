import React from 'react';
import Link from 'next/link';
import { Compass, Home, Search, FileText } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 flex items-center justify-center p-6 font-sans transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-[#0E1B33] rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-blue-900/50 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
        <div className="w-18 h-18 rounded-3xl bg-[#9C2007]/10 dark:bg-rose-950/40 text-[#9C2007] dark:text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <Compass className="w-10 h-10 animate-spin" style={{ animationDuration: '10s' }} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-200 dark:border-rose-900/40">
            404 &bull; Page Not Found
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Lost Your Way?
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The page or official record you are searching for does not exist or has been relocated to another section of the website.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <Link
            href="/"
            className="p-3 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-[#9C2007]/20 flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" /> Home
          </Link>
          <Link
            href="/track"
            className="p-3 rounded-xl bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1f3765] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
          >
            <Search className="w-3.5 h-3.5" /> Track Code
          </Link>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-blue-900/40">
          <Link
            href="/services"
            className="text-xs font-bold text-[#9C2007] dark:text-rose-400 hover:underline inline-flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Explore Barangay Online Services &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
