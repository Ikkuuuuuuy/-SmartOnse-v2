'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[SmartOnse Application Error]:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 flex items-center justify-center p-6 font-sans transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-[#0E1B33] rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-blue-900/50 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
        <div className="w-18 h-18 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200 dark:border-amber-900/40">
            System Notice &bull; Unexpected Interrupt
          </span>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            An unexpected error occurred while loading this page. Our technical team has been notified. You can retry the request or return to the main portal.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          <button
            onClick={() => reset()}
            className="p-3 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-[#9C2007]/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
          <Link
            href="/"
            className="p-3 rounded-xl bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1f3765] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
