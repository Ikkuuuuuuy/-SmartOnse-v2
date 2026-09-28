'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { QrCode, Search, ShieldCheck, ArrowRight, FileCheck } from 'lucide-react';

export default function VerifyIndexPage() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (clean) {
      router.push(`/verify/${clean}`);
    }
  };

  return (
    <div className="py-20 pt-40 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center px-4 font-sans transition-colors duration-200">
      <div className="max-w-lg w-full bg-white dark:bg-[#0E1B33] rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 dark:border-blue-900/50 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-[#9C2007]/10 dark:bg-rose-950/40 text-[#9C2007] dark:text-rose-400 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-rose-200 dark:border-rose-900/40">
            Digital Certificate Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Verify Barangay Document
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Enter the official tracking or QR verification code printed on your Barangay Clearance, Certificate of Residency, or Indigency to verify its cryptographic authenticity.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-3 text-left">
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Tracking / Document Code
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ONSE-2026-8891"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl focus:ring-1 focus:ring-[#9C2007] text-slate-900 dark:text-white font-mono text-sm uppercase placeholder:normal-case"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black text-xs uppercase tracking-wider transition shadow-md shadow-[#9C2007]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Verify Document</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 dark:border-blue-900/40 grid grid-cols-2 gap-3 text-left">
          <div className="p-3 bg-slate-50 dark:bg-[#0B1528] rounded-2xl border border-slate-100 dark:border-blue-900/30">
            <QrCode className="w-5 h-5 text-[#9C2007] dark:text-rose-400 mb-1" />
            <h2 className="text-[11px] font-bold text-slate-900 dark:text-white">Scan QR Code</h2>
            <p className="text-[10px] text-slate-500">Scan the QR code printed at the lower right of your official seal.</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-[#0B1528] rounded-2xl border border-slate-100 dark:border-blue-900/30">
            <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
            <h2 className="text-[11px] font-bold text-slate-900 dark:text-white">Anti-Counterfeit</h2>
            <p className="text-[10px] text-slate-500">Directly matched against the Barangay Onse civil registry database.</p>
          </div>
        </div>

        <div className="pt-1">
          <Link href="/" className="text-xs font-bold text-slate-500 hover:text-[#9C2007] dark:hover:text-rose-400 transition">
            &larr; Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
