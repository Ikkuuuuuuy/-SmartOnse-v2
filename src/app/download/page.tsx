'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Smartphone,
  Download,
  ShieldCheck,
  QrCode,
  Camera,
  Bell,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  FileCheck2,
  FileText,
  Clock,
} from 'lucide-react';

interface ApkMeta {
  available: boolean;
  fileName: string;
  version: string;
  sizeMB: string | null;
  updatedAt: string | null;
}

export default function DownloadMobileAppPage() {
  const [apkMeta, setApkMeta] = useState<ApkMeta | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInfo() {
      try {
        const res = await fetch('/api/download/apk?mode=info');
        if (res.ok) {
          const data = await res.json();
          setApkMeta(data);
        }
      } catch {
        // fallback handled below
      } finally {
        setLoading(false);
      }
    }
    loadInfo();

    // Generate QR code pointing to direct APK download URL on current host
    import('qrcode')
      .then((QRCode) => {
        const downloadUrl = `${window.location.origin}/api/download/apk`;
        QRCode.toDataURL(downloadUrl, {
          width: 220,
          margin: 1,
          color: { dark: '#800000', light: '#FFFFFF' },
        })
          .then(setQrDataUrl)
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-10 bg-slate-50 dark:bg-[#070D18] text-slate-900 dark:text-slate-100">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#800000] via-[#9C2007] to-slate-950 text-white p-8 sm:p-12 shadow-2xl border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-black uppercase tracking-widest">
                <Smartphone className="w-4 h-4 text-amber-300" />
                <span>Official Barangay Onse Mobile Application</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Download the <span className="text-amber-300">SmartOnse</span> Mobile App
              </h1>

              <p className="text-sm sm:text-base text-rose-100/90 leading-relaxed max-w-2xl">
                Access Barangay Onse E-Governance anytime, anywhere on your smartphone. Request official barangay clearances
                and certificates, track your document status in real time, verify your resident ID with your phone camera,
                and stay updated on community announcements and Sangguniang Kabataan (SK) programs.
              </p>

              {/* Spec Pills */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs font-bold">
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  24/7 Online Document Requests
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-emerald-300" />
                  Real-Time Status Tracking
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/30 border border-white/15 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                  R.A. 10173 Data Privacy Protected
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <a
                  href="/api/download/apk"
                  download="SmartOnse-BarangayOnse-v2.0.apk"
                  className="inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-white text-[#800000] hover:bg-amber-50 font-black text-sm uppercase tracking-wider shadow-xl shadow-black/30 transition transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  <span>
                    Download for Android {apkMeta?.sizeMB ? `(${apkMeta.sizeMB} MB)` : '(v2.0)'}
                  </span>
                </a>

                <Link
                  href="/portal/request"
                  className="inline-flex items-center gap-2 px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition"
                >
                  <span>Continue on Web Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Status Line */}
              <div className="text-xs text-rose-200/90 flex items-center gap-2 pt-1">
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Checking official installer...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                    <span>
                      Official Barangay Onse Release • Free for all Residents • Supports Android 7.0 and newer
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: QR Code & Phone Preview Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl max-w-xs w-full text-center space-y-4 border-4 border-amber-300/80">
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-[#800000]">
                  <QrCode className="w-4 h-4" />
                  <span>Scan to Install on Your Phone</span>
                </div>

                <div className="w-48 h-48 mx-auto bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center p-2">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="SmartOnse Mobile App Download QR Code" className="w-full h-full object-contain" />
                  ) : (
                    <QrCode className="w-20 h-20 text-[#800000]/40" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-black text-slate-900">SmartOnse Mobile App</div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Open your phone camera and scan this QR code, or tap the download button to install the official Barangay Onse app.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0E1B33] p-6 rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-[#800000] dark:text-rose-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base">Fast Certificate &amp; Clearance Requests</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Apply for Barangay Clearance, Certificate of Residency, Certificate of Indigency, and First-Time Jobseeker certificates from home without waiting in long lines.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0E1B33] p-6 rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base">Easy Camera ID &amp; QR Verification</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Use your phone camera to quickly capture your valid ID during resident verification and scan document QR codes to confirm authenticity at Barangay Onse Hall.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0E1B33] p-6 rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base">Pickup Alerts &amp; Barangay Updates</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Get notified as your request moves from <em>Pending</em> to <em>Ready for Pickup</em>, view Full Public Disclosure reports, and join SK youth activities.
            </p>
          </div>
        </div>

        {/* Installation Guide */}
        <div className="bg-white dark:bg-[#0E1B33] rounded-3xl border border-slate-200 dark:border-blue-900/50 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-[#800000] dark:text-rose-400" />
            <h2 className="text-lg font-black uppercase tracking-tight">How to Install on Your Android Phone</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152747]/50 border border-slate-200/70 dark:border-blue-900/40 space-y-1.5">
              <div className="font-black text-[#800000] dark:text-rose-300 uppercase">Step 1 • Download the App</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Tap <strong>Download for Android</strong> above or scan the QR code with your phone camera to download the official SmartOnse installer.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152747]/50 border border-slate-200/70 dark:border-blue-900/40 space-y-1.5">
              <div className="font-black text-[#800000] dark:text-rose-300 uppercase">Step 2 • Tap Install</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Open the downloaded file on your phone. If prompted by Android, tap <strong>Settings → Allow from this source</strong>, then tap <strong>Install</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152747]/50 border border-slate-200/70 dark:border-blue-900/40 space-y-1.5">
              <div className="font-black text-[#800000] dark:text-rose-300 uppercase">Step 3 • Sign In &amp; Request</div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Open <strong>SmartOnse</strong> from your home screen and sign in with your Barangay Onse resident account to request and track your documents.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
