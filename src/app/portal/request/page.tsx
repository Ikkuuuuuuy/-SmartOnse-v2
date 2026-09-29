'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { FileText, CheckCircle2, ShieldCheck, ArrowRight, Lock } from 'lucide-react';

const DOC_TYPES = [
  { code: 'BRGY_CLEARANCE', name: 'Barangay Clearance', fee: '₱50.00', time: '24 Hours' },
  { code: 'CERT_RESIDENCY', name: 'Certificate of Residency', fee: '₱30.00', time: 'Same Day' },
  { code: 'CERT_INDIGENCY', name: 'Certificate of Indigency', fee: 'FREE', time: 'Same Day' },
  { code: 'FIRST_TIME_JOBSEEKER', name: 'First-Time Jobseeker Certificate', fee: 'FREE (R.A. 11261)', time: 'Same Day' },
  { code: 'BUSINESS_CLEARANCE', name: 'Barangay Business Clearance', fee: '₱250.00', time: '2 Days' },
];

function resolveDocTypeCode(typeParam: string | null, available = DOC_TYPES): string {
  if (!typeParam) return available[0]?.code || 'BRGY_CLEARANCE';
  const param = typeParam.trim().toLowerCase();

  const matchByCode = available.find((d) => d.code.toLowerCase() === param);
  if (matchByCode) return matchByCode.code;

  const matchByName = available.find((d) => {
    const dName = d.name.toLowerCase();
    return (
      dName === param ||
      dName.includes(param) ||
      param.includes(dName) ||
      (param.includes('jobseeker') && d.code === 'FIRST_TIME_JOBSEEKER') ||
      (param.includes('indigency') && d.code === 'CERT_INDIGENCY') ||
      (param.includes('residency') && d.code === 'CERT_RESIDENCY') ||
      (param.includes('business') && d.code === 'BUSINESS_CLEARANCE') ||
      (param.includes('clearance') && d.code === 'BRGY_CLEARANCE')
    );
  });

  return matchByName ? matchByName.code : (available[0]?.code || 'BRGY_CLEARANCE');
}

function RequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const { addNotification } = useNotifications();

  const [availableDocTypes, setAvailableDocTypes] = useState(DOC_TYPES);
  const [docType, setDocType] = useState(() => resolveDocTypeCode(searchParams.get('type')));
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [civilStatus, setCivilStatus] = useState('Single');
  const [years, setYears] = useState('2');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

  // Dynamically load active certificate types from database
  useEffect(() => {
    async function loadActiveCertificates() {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          if (data.certificates && data.certificates.length > 0) {
            setAvailableDocTypes(data.certificates);
            // If current selected docType is not in the active list, switch to first active
            const currentParam = searchParams.get('type');
            setDocType((prev) => {
              const exists = data.certificates.some((c: { code: string }) => c.code === prev);
              return exists ? prev : resolveDocTypeCode(currentParam, data.certificates);
            });
          }
        }
      } catch {
        // Fallback initialized
      }
    }
    loadActiveCertificates();
  }, [searchParams]);

  // Require Login / Auto-Redirect for Non-Registered Users
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/portal/request');
    }
  }, [user, isLoading, router]);

  // Sync with URL query parameter changes
  useEffect(() => {
    const t = searchParams.get('type');
    if (t) {
      setDocType(resolveDocTypeCode(t));
    }
  }, [searchParams]);

  // Autofill verified citizen details from active session
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setContactNumber(user.phone || '0917-888-0011');
      setAddress(user.address || 'Lt. Artiaga St., Barangay Onse, San Juan City');
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="pt-40 pb-20 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 min-h-screen flex flex-col items-center justify-center font-sans transition-colors duration-200">
        <div className="w-14 h-14 rounded-2xl bg-[#9C2007] text-white flex items-center justify-center font-black text-xl animate-pulse shadow-lg">
          O
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 uppercase tracking-widest">
          Securing Session &bull; Redirecting to Login...
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTypeCode: docType,
          fullName: user?.name || fullName || 'Citizen Applicant',
          contactNumber: user?.phone || contactNumber || '0917-888-0011',
          email: user?.email || email || '',
          address: user?.address || address || 'Barangay Onse, San Juan City',
          purpose: purpose || 'Official Document Application',
          civilStatus,
          yearsOfResidency: Number(years) || 1,
          userId: user?.id || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit document application');
      }

      const code = data.trackingNumber;
      setTrackingNumber(code);

      const selectedDoc = DOC_TYPES.find((d) => d.code === docType)?.name || 'Barangay Document';
      addNotification({
        title: `New ${selectedDoc} Application`,
        description: `${fullName || user?.name || 'Citizen'} submitted application #${code} for ${purpose || 'verification'}.`,
        type: 'request',
        targetRole: 'admin',
        href: '/admin/requests',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error submitting request';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (trackingNumber) {
    return (
      <div className="py-20 pt-40 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center px-4 font-sans transition-colors duration-200">
        <div className="max-w-md w-full bg-white dark:bg-[#0E1B33] rounded-3xl p-8 border border-slate-200 dark:border-blue-900/50 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase">Application Filed!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Your application has been stored in the Barangay Onse registry and is ready for desk verification.
          </p>
          <div className="p-4 rounded-2xl bg-[#9C2007]/10 dark:bg-rose-950/40 border border-[#9C2007]/20 dark:border-rose-900/50 space-y-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Tracking Code</span>
            <div className="text-2xl font-black font-mono text-[#9C2007] dark:text-rose-400 select-all">{trackingNumber}</div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/track?trackingNumber=${trackingNumber}`}
              className="flex-1 py-3 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold text-xs uppercase text-center shadow-md transition"
            >
              Track Application
            </Link>
            <button
              onClick={() => {
                setTrackingNumber(null);
                setPurpose('');
              }}
              className="flex-1 py-3 bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1C335C] text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs uppercase cursor-pointer transition"
            >
              New Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-40 pb-20 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-[#9C2007]/10 dark:bg-rose-950/60 px-3.5 py-1 rounded-full border border-[#9C2007]/20 dark:border-rose-900/40">
            Citizen E-Services &bull; R.A. 11032
          </span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Request Document Online
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Submit your official barangay certificate or clearance application directly to desk officers.
          </p>
        </div>

        {/* Verified Resident Indicator */}
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-300">
                Logged in as <strong className="text-slate-900 dark:text-white">{user.name}</strong> ({user.roleTitle || user.role.toUpperCase()})
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Verified Citizen Session &bull; Auto-filled details</p>
            </div>
          </div>
          <Link href="/profile" className="text-[11px] font-black uppercase tracking-wider text-[#9C2007] dark:text-rose-400 hover:underline shrink-0">
            Edit Info &rarr;
          </Link>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0E1B33] rounded-3xl p-8 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-6 text-xs transition-colors">
          <div className="space-y-3">
            <label className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
              1. Select Certificate Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {availableDocTypes.map((type) => {
                const isSelected = docType === type.code;
                return (
                  <button
                    type="button"
                    key={type.code}
                    onClick={() => setDocType(type.code)}
                    className={`p-3.5 rounded-2xl text-left border transition cursor-pointer ${
                      isSelected
                        ? 'border-[#9C2007] dark:border-rose-500 bg-[#9C2007]/10 dark:bg-rose-950/40 ring-2 ring-[#9C2007]/20 dark:ring-rose-500/30 font-bold text-[#9C2007] dark:text-rose-400'
                        : 'border-slate-200 dark:border-blue-900/40 bg-white dark:bg-[#152747] hover:border-slate-300 dark:hover:border-blue-700/60 text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{type.name}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white dark:bg-[#0E1B33] shadow-2xs text-[#9C2007] dark:text-rose-400 border border-slate-100 dark:border-blue-900/40">
                        {type.fee}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 mt-1 block font-medium">
                      Processing: {type.time}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-blue-900/40">
            <div className="flex items-center justify-between">
              <h3 className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <span>2. Applicant Verified Details</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-blue-950 text-slate-500 dark:text-blue-300 text-[10px] font-bold border border-slate-200 dark:border-blue-800 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" /> Read-Only
                </span>
              </h3>
              <Link href="/profile" className="text-[11px] font-bold text-[#9C2007] dark:text-rose-400 hover:underline">
                Update in Profile &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs">Full Name *</label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={fullName}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-3.5 py-2.5 bg-slate-100/90 dark:bg-[#0B1528] border border-slate-200 dark:border-blue-900/40 rounded-xl text-slate-600 dark:text-slate-300 font-medium cursor-not-allowed select-none opacity-90 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs">Mobile Number *</label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <input
                  type="tel"
                  readOnly
                  disabled
                  value={contactNumber}
                  placeholder="0917-xxx-xxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-100/90 dark:bg-[#0B1528] border border-slate-200 dark:border-blue-900/40 rounded-xl font-mono text-slate-600 dark:text-slate-300 font-medium cursor-not-allowed select-none opacity-90 shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs">Email Address</label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <input
                  type="email"
                  readOnly
                  disabled
                  value={email}
                  placeholder="juan@onse.ph"
                  className="w-full px-3.5 py-2.5 bg-slate-100/90 dark:bg-[#0B1528] border border-slate-200 dark:border-blue-900/40 rounded-xl text-slate-600 dark:text-slate-300 font-mono font-medium cursor-not-allowed select-none opacity-90 shadow-2xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-xs">Address in Barangay Onse *</label>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={address}
                  placeholder="124 Gomez St., Barangay Onse, San Juan City"
                  className="w-full px-3.5 py-2.5 bg-slate-100/90 dark:bg-[#0B1528] border border-slate-200 dark:border-blue-900/40 rounded-xl text-slate-600 dark:text-slate-300 font-medium cursor-not-allowed select-none opacity-90 shadow-2xs"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">Purpose of Request *</label>
                <textarea
                  required
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Local Employment, Bank Requirement, Postal ID, Scholarship..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl focus:ring-1 focus:ring-[#9C2007] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black uppercase tracking-wider shadow-md shadow-[#9C2007]/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{loading ? 'Submitting Application...' : 'Submit Clearance Request'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="py-40 text-center text-xs text-slate-500">Loading form...</div>}>
      <RequestContent />
    </Suspense>
  );
}
