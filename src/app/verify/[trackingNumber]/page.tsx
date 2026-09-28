import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import prisma from '@/lib/prisma';

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ trackingNumber: string }>;
}) {
  const { trackingNumber } = await params;
  const cleanCode = (trackingNumber || '').trim().toUpperCase();

  let request = null;
  try {
    request = await prisma.documentRequest.findFirst({
      where: {
        trackingNumber: {
          equals: cleanCode,
        },
      },
      include: {
        documentType: true,
      },
    });
  } catch (e) {
    console.error('Error fetching document verification record:', e);
  }

  const isAuthentic = !!request;

  return (
    <div className="py-16 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center px-4 font-sans transition-colors duration-200">
      <div className="max-w-md w-full bg-white dark:bg-[#0E1B33] rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-2xl overflow-hidden">
        
        {/* Header Badge */}
        <div className="bg-gradient-to-r from-[#8B1A05] via-[#9C2007] to-[#8B1A05] text-white p-6 text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mx-auto p-1 shadow-md">
            <img src="/images/barangay-onse-seal.png" alt="Barangay Onse Seal" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider">Barangay Onse, San Juan City</h2>
          <p className="text-xs text-rose-200 font-medium">Digital Authenticity &amp; Verification Registry</p>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {isAuthentic ? (
            <>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-emerald-900 dark:text-emerald-300">Authentic Official Record</h3>
                  <p className="text-emerald-700 dark:text-emerald-400">Cryptographically registered with Barangay Onse</p>
                </div>
              </div>

              <div className="space-y-3 divide-y divide-slate-100 dark:divide-blue-900/40">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">Tracking Code:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{request.trackingNumber}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">Document Type:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{request.documentType.name}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">Applicant Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{request.fullName}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">Purpose:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{request.purpose}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">Registry Status:</span>
                  <span
                    className={`font-black uppercase ${
                      request.status === 'COMPLETED'
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : request.status === 'READY_FOR_PICKUP'
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-amber-700 dark:text-amber-400'
                    }`}
                  >
                    {request.status === 'COMPLETED'
                      ? 'SEALED & ISSUED'
                      : request.status === 'READY_FOR_PICKUP'
                      ? 'VERIFIED & READY'
                      : 'UNDER VERIFICATION'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px]">Date Filed:</span>
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    {new Date(request.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-rose-900 dark:text-rose-300">Unverified / Invalid Record</h3>
                  <p className="text-rose-700 dark:text-rose-400">Tracking code was not found in the official registry</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-[#152747] rounded-xl text-slate-600 dark:text-slate-300">
                <p>The code <strong className="font-mono text-slate-900 dark:text-white">{cleanCode}</strong> does not correspond to an authentic Barangay Onse issuance. Please ensure the QR code was scanned correctly.</p>
              </div>
            </>
          )}

          <div className="text-center pt-2 flex justify-between items-center text-xs">
            <Link href={`/track?trackingNumber=${cleanCode}`} className="font-bold text-[#9C2007] dark:text-rose-400 hover:underline">
              &larr; View Tracking Flow
            </Link>
            <Link href="/services" className="font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
              Services Catalog &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
