'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Clock, CheckCircle2, QrCode } from 'lucide-react';

function TrackContent() {
  const searchParams = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get('trackingNumber') || 'ONSE-2026-8891');
  const [docData, setDocData] = useState<any>(null);

  useEffect(() => {
    if (searchParams.get('trackingNumber')) {
      handleSearch(searchParams.get('trackingNumber') || '');
    }
  }, [searchParams]);

  const handleSearch = (code?: string) => {
    const val = code || trackingNumber;
    if (val.trim()) {
      setDocData({
        trackingNumber: val.trim().toUpperCase(),
        documentType: 'Barangay Clearance',
        fullName: 'Juan Dela Cruz',
        purpose: 'Local Employment Application',
        status: 'READY_FOR_PICKUP',
        remarks: 'Your document is printed and verified. You may pick it up at Window 2 with 1 valid ID.',
        createdAt: '2026-08-27',
      });
    }
  };

  return (
    <div className="pt-32 md:pt-40 pb-20 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">

        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-[#9C2007]/10 dark:bg-rose-950/60 px-3 py-1 rounded-full">
            Real-Time Tracking
          </span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase">Track Document Request</h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">Enter your ONSE tracking number to view real-time status.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="bg-white dark:bg-[#0E1B33] rounded-2xl p-2.5 border border-slate-200 dark:border-blue-900/50 shadow-sm flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. ONSE-2026-8891"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white font-bold text-xs uppercase rounded-xl cursor-pointer">
            Track
          </button>
        </form>

        {docData && (
          <div className="bg-white dark:bg-[#0E1B33] rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-sm overflow-hidden space-y-6">
            <div className="bg-slate-950 dark:bg-[#050B14] text-white p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase">Tracking Number</span>
                <h3 className="text-2xl font-black font-mono">{docData.trackingNumber}</h3>
                <p className="text-xs text-slate-400">{docData.documentType}</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black rounded-full uppercase">
                {docData.status}
              </span>
            </div>

            <div className="px-6 py-2">
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 font-bold text-emerald-800 dark:text-emerald-300">1. Received</div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 font-bold text-emerald-800 dark:text-emerald-300">2. Verified</div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 font-bold text-emerald-800 dark:text-emerald-300">3. Ready for Pickup</div>
              </div>
            </div>

            {docData.remarks && (
              <div className="mx-6 p-4 rounded-2xl bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-xs space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-200">Remarks:</span>
                <p className="text-slate-600 dark:text-slate-300">{docData.remarks}</p>
              </div>
            )}

            <div className="px-6 pb-6 border-t border-slate-100 dark:border-blue-900/40 pt-4 flex justify-between items-center text-xs">
              <Link href={`/verify/${docData.trackingNumber}`} className="text-[#9C2007] dark:text-rose-400 font-bold flex items-center gap-1.5 hover:underline">
                <QrCode className="w-4 h-4" /> View Digital Verification Record
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default function TrackPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Loading tracker...</div>}>
      <TrackContent />
    </Suspense>
  );
}
