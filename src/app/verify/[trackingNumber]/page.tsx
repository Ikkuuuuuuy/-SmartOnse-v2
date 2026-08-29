import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Building2 } from 'lucide-react';

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;

  return (
    <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#8B1A05] via-[#9C2007] to-[#8B1A05] text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto p-1">
            <img src="/images/barangay-onse-seal.png" alt="Seal" className="w-full h-full object-contain"  />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider">Barangay Onse, San Juan City</h2>
          <p className="text-xs text-rose-200 font-medium">Digital Authenticity Verification Record</p>
        </div>

        <div className="p-6 space-y-6 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-emerald-900">Authentic Official Record</h3>
              <p className="text-emerald-700">Verified through SmartOnse Secure Registry</p>
            </div>
          </div>

          <div className="space-y-3 divide-y divide-slate-100">
            <div className="flex justify-between py-1.5"><span className="text-slate-400">Tracking Code:</span> <span className="font-mono font-bold">{trackingNumber}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-slate-400">Document Type:</span> <span className="font-bold">Barangay Clearance</span></div>
            <div className="flex justify-between py-1.5"><span className="text-slate-400">Issued To:</span> <span className="font-bold">Juan Dela Cruz</span></div>
            <div className="flex justify-between py-1.5"><span className="text-slate-400">Status:</span> <span className="font-bold text-emerald-700">SEALED & ISSUED</span></div>
          </div>

          <div className="text-center pt-2">
            <Link href="/track" className="text-xs font-bold text-[#9C2007] hover:underline">
              &larr; Track Another Document
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
