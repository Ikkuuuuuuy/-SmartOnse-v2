'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatPhDateTime } from '@/lib/ph-time';
import { 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Plus, 
  Minus, 
  Calculator, 
  Receipt, 
  Clock, 
  Building2, 
  AlertTriangle,
  ExternalLink,
  Printer
} from 'lucide-react';

interface CertificateType {
  code: string;
  name: string;
  fee: string;
  time: string;
  description?: string;
}

const DOC_TYPES: CertificateType[] = [
  { code: 'BRGY_CLEARANCE', name: 'Barangay Clearance', fee: '₱50.00', time: '24 Hours', description: 'General clearance for employment, postal ID, bank, or NBI application.' },
  { code: 'CERT_RESIDENCY', name: 'Certificate of Residency', fee: '₱30.00', time: 'Same Day', description: 'Official verification that you are a bonafide resident of Barangay Onse.' },
  { code: 'CERT_INDIGENCY', name: 'Certificate of Indigency', fee: 'FREE', time: 'Same Day', description: 'Fee-exempted certificate for hospital financial assistance, DSWD, and scholarships.' },
  { code: 'FIRST_TIME_JOBSEEKER', name: 'First-Time Jobseeker Certificate', fee: 'FREE (R.A. 11261)', time: 'Same Day', description: 'Statutory fee exemption for pre-employment requirements under RA 11261.' },
  { code: 'BUSINESS_CLEARANCE', name: 'Barangay Business Clearance', fee: '₱250.00', time: '2 Days', description: 'Commercial clearance endorsement for San Juan City Hall business permit.' },
];

function parseFee(feeStr: string): number {
  if (feeStr.toUpperCase().includes('FREE')) return 0;
  const num = parseFloat(feeStr.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? 0 : num;
}

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

interface SubmittedRequestResult {
  id: string;
  trackingNumber: string;
  documentType: string;
  documentTypeCode: string;
  fee: number;
  copyNumber: number;
  totalCopies: number;
}

interface SubmissionSuccessData {
  trackingNumbers: string[];
  requests: SubmittedRequestResult[];
  totalCopies: number;
  totalFee: number;
  totalFeeDisplay: string;
  filedAtPh?: string;
  breakdown: Array<{
    code: string;
    name: string;
    copies: number;
    unitFee: number;
    subtotal: number;
    isFree: boolean;
  }>;
}

function RequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();
  const { addNotification } = useNotifications();

  const [availableDocTypes, setAvailableDocTypes] = useState<CertificateType[]>(DOC_TYPES);

  // Multi-Document selection state: Record<documentCode, copiesCount>
  // Initialized with query param document code (or Barangay Clearance) with 1 copy
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(() => {
    const initialCode = resolveDocTypeCode(searchParams.get('type'));
    return { [initialCode]: 1 };
  });

  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [civilStatus, setCivilStatus] = useState('Single');
  const [years, setYears] = useState('2');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Submission success result
  const [successData, setSuccessData] = useState<SubmissionSuccessData | null>(null);
  const [phClock, setPhClock] = useState<string>(() => formatPhDateTime(new Date()));

  useEffect(() => {
    const timer = setInterval(() => {
      setPhClock(formatPhDateTime(new Date()));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Dynamically load active certificate types from database
  useEffect(() => {
    async function loadActiveCertificates() {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          if (data.certificates && data.certificates.length > 0) {
            setAvailableDocTypes(data.certificates);
          }
        }
      } catch {
        // Fallback initialized
      }
    }
    loadActiveCertificates();
  }, []);

  // Require Login / Auto-Redirect for Non-Registered Users
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/portal/request');
    }
  }, [user, isLoading, router]);

  // Autofill verified citizen details from active session
  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setContactNumber(user.phone || '');
      setAddress(user.address || 'Lt. Artiaga St., Barangay Onse, San Juan City');
    }
  }, [user]);

  // Handlers for copy counter and selection
  const handleToggleItem = (code: string) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[code]) {
        delete next[code];
      } else {
        next[code] = 1;
      }
      return next;
    });
  };

  const handleIncrementCopies = (code: string) => {
    setSelectedItems((prev) => {
      const current = prev[code] || 0;
      if (current >= 5) return prev; // Maximum 5 copies per document type
      return { ...prev, [code]: current + 1 };
    });
  };

  const handleDecrementCopies = (code: string) => {
    setSelectedItems((prev) => {
      const current = prev[code] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[code];
        return next;
      }
      return { ...prev, [code]: current - 1 };
    });
  };

  // Live computation of totals and itemized breakdown
  const computation = useMemo(() => {
    const itemsList: Array<{
      code: string;
      name: string;
      copies: number;
      unitFee: number;
      subtotal: number;
      isFree: boolean;
      feeDisplay: string;
    }> = [];

    let totalAmount = 0;
    let totalCopiesCount = 0;

    Object.entries(selectedItems).forEach(([code, copies]) => {
      if (copies <= 0) return;
      const doc = availableDocTypes.find((d) => d.code === code);
      if (!doc) return;

      const unitFee = parseFee(doc.fee);
      const subtotal = unitFee * copies;
      totalAmount += subtotal;
      totalCopiesCount += copies;

      itemsList.push({
        code: doc.code,
        name: doc.name,
        copies,
        unitFee,
        subtotal,
        isFree: unitFee === 0,
        feeDisplay: doc.fee,
      });
    });

    return {
      itemsList,
      totalAmount,
      totalCopiesCount,
      totalFeeDisplay: totalAmount === 0 ? 'FREE' : `₱${totalAmount.toFixed(2)}`,
    };
  }, [selectedItems, availableDocTypes]);

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
    if (computation.totalCopiesCount === 0) {
      setErrorMessage('Please select at least one document and specify the number of copies.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const itemsPayload = Object.entries(selectedItems)
        .filter(([, count]) => count > 0)
        .map(([code, copies]) => ({ documentTypeCode: code, copies }));

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: itemsPayload,
          fullName: user?.name || fullName || 'Citizen Applicant',
          contactNumber: contactNumber || user?.phone || '',
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

      setSuccessData(data);

      // Notification for admin desk
      const itemSummary = computation.itemsList.map((i) => `${i.name} (${i.copies}x)`).join(', ');
      addNotification({
        title: `New Certificate Applications (${data.totalCopies} copies)`,
        description: `${fullName || user?.name || 'Citizen'} submitted ${itemSummary}. Tracking codes: ${data.trackingNumbers.join(', ')}.`,
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

  // ==============================================================
  // Success Screen (Receipt & Sequential Tracking Number List)
  // ==============================================================
  if (successData) {
    return (
      <div className="py-20 pt-36 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 min-h-screen px-4 font-sans transition-colors duration-200">
        <div className="max-w-2xl mx-auto bg-white dark:bg-[#0E1B33] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-900/50 shadow-2xl space-y-6 animate-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Applications Successfully Filed!
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              Your requested documents have been assigned official sequential tracking codes and are queued for desk intake and verification.
            </p>
          </div>

          {/* Sequential Tracking Numbers Registry List */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Official Sequential Tracking Codes ({successData.totalCopies} Copies Issued):
            </span>
            <div className="divide-y divide-slate-100 dark:divide-blue-900/40 rounded-2xl bg-slate-50 dark:bg-[#0A1220] border border-slate-200 dark:border-blue-900/40 overflow-hidden">
              {successData.requests.map((r, idx) => (
                <div key={r.trackingNumber} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white dark:bg-[#152747] font-mono font-bold text-[10px] flex items-center justify-center text-slate-500 border border-slate-200 dark:border-blue-900/40">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-mono font-black text-sm text-[#9C2007] dark:text-rose-400">
                        {r.trackingNumber}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {r.documentType} {r.totalCopies > 1 ? `(Copy ${r.copyNumber} of ${r.totalCopies})` : ''}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/track?trackingNumber=${r.trackingNumber}`}
                    className="px-3 py-1.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-lg font-bold text-[11px] uppercase transition flex items-center gap-1 shadow-xs"
                  >
                    <span>Track</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Fee Summary Receipt Box */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B1528] border border-slate-200 dark:border-blue-900/50 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold border-b border-slate-200 dark:border-blue-900/40 pb-2">
              <span className="uppercase text-slate-500">Document Breakdown</span>
              <span className="uppercase text-slate-500">Subtotal</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {successData.breakdown.map((item) => (
                <div key={item.code} className="flex justify-between items-center">
                  <span className="text-slate-800 dark:text-slate-200">
                    {item.name} &times; {item.copies} {item.copies === 1 ? 'copy' : 'copies'}
                  </span>
                  <span className="font-mono font-bold">
                    {item.isFree ? (
                      <span className="text-purple-600 dark:text-purple-400">FREE</span>
                    ) : (
                      `₱${item.subtotal.toFixed(2)}`
                    )}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-blue-900/40 flex justify-between items-center text-sm font-black">
              <span className="uppercase text-slate-900 dark:text-white">Total Payment Due:</span>
              <span className="font-mono text-base text-[#9C2007] dark:text-rose-400">
                {successData.totalFeeDisplay}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              * Payment is collected upon claiming at Window 2 (exact amount preferred). Free certificates (R.A. 11261 and Indigency) require zero payment.
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-blue-900/40 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Filed Timestamp (Philippines Time):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {successData.filedAtPh || formatPhDateTime(new Date())}
              </span>
            </div>
          </div>

          {/* Pickup Deadline & Office Hours Advisory */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider text-[11px]">
                Claiming Instructions &amp; Pickup Deadline
              </span>
            </div>
            <p className="text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
              Once your status reaches <strong>READY FOR PICKUP</strong>, you have <strong>five (5) business days</strong> to claim your document at <strong>Window 2, Barangay Onse Hall</strong> (Monday to Friday, 8:00 AM – 5:00 PM). Please bring 1 valid government ID.
            </p>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link
              href={`/track?trackingNumber=${successData.trackingNumbers[0]}`}
              className="flex-1 py-3 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold text-xs uppercase text-center shadow-md transition"
            >
              Track Applications
            </Link>
            <button
              type="button"
              onClick={() => {
                setSuccessData(null);
                setPurpose('');
                setSelectedItems({ BRGY_CLEARANCE: 1 });
              }}
              className="flex-1 py-3 bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1C335C] text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs uppercase cursor-pointer transition text-center"
            >
              File Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================
  // Main Request Application Form
  // ==============================================================
  return (
    <div className="pt-32 md:pt-40 pb-20 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-[#9C2007]/10 dark:bg-rose-950/60 px-3.5 py-1 rounded-full border border-[#9C2007]/20 dark:border-rose-900/40">
            Citizen E-Services &bull; R.A. 11032
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Request Official Certificates
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
            Select one or multiple certificates, specify the number of copies needed, and view live fee calculations before filing.
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
          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#0E1B33] border border-emerald-200 dark:border-emerald-800/60 font-mono text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
              <Clock className="w-3 h-3" /> {phClock}
            </span>
            <Link href="/profile" className="text-[11px] font-black uppercase tracking-wider text-[#9C2007] dark:text-rose-400 hover:underline shrink-0">
              Edit Info &rarr;
            </Link>
          </div>
        </div>

        {/* Anti-Spam & Fair Usage Notice */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3 text-xs text-blue-900 dark:text-blue-300">
          <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 text-[11px] leading-relaxed">
            <p className="font-bold uppercase tracking-wider text-blue-950 dark:text-blue-200">
              Policy:
            </p>
            <p>
              Citizens are limited to a maximum of <strong>5 active in-progress requests</strong> at any time. All applications are verified against the Barangay Registry of Inhabitants (RBI). Fictitious submissions or abuse are archived and flagged.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0E1B33] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-blue-900/50 shadow-sm space-y-6 text-xs transition-colors">
          
          {/* 1. Multi-Clearance Selector with Copy Counter */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                1. Select Certificates &amp; Number of Copies *
              </label>
              <span className="text-[11px] font-bold text-slate-400">
                {computation.totalCopiesCount} {computation.totalCopiesCount === 1 ? 'Copy' : 'Copies'} Selected
              </span>
            </div>

            <div className="space-y-2.5">
              {availableDocTypes.map((type) => {
                const copies = selectedItems[type.code] || 0;
                const isSelected = copies > 0;
                const unitFee = parseFee(type.fee);
                const subtotal = unitFee * copies;

                return (
                  <div
                    key={type.code}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-[#9C2007] dark:border-rose-500 bg-[#9C2007]/5 dark:bg-rose-950/20 ring-1 ring-[#9C2007]/20 dark:ring-rose-500/20'
                        : 'border-slate-200 dark:border-blue-900/40 bg-white dark:bg-[#152747] hover:border-slate-300 dark:hover:border-blue-700/60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Checkbox & Info */}
                      <div className="flex items-start gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleItem(type.code)}
                          className="mt-1 w-4 h-4 rounded text-[#9C2007] focus:ring-[#9C2007] cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {type.name}
                            </span>
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded ${
                                unitFee === 0
                                  ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300'
                                  : 'bg-slate-100 dark:bg-[#0E1B33] text-[#9C2007] dark:text-rose-400'
                              }`}
                            >
                              {type.fee}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {type.description || `Turnaround: ${type.time}`}
                          </p>
                        </div>
                      </div>

                      {/* Right: Quantity Counter & Subtotal */}
                      {isSelected ? (
                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-blue-900/40">
                          {/* Stepper */}
                          <div className="flex items-center border border-slate-200 dark:border-blue-900/60 rounded-xl overflow-hidden bg-white dark:bg-[#0E1B33]">
                            <button
                              type="button"
                              onClick={() => handleDecrementCopies(type.code)}
                              className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#152747] transition cursor-pointer"
                              title="Decrease copies"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 font-mono font-black text-xs text-slate-900 dark:text-white min-w-[28px] text-center">
                              {copies}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrementCopies(type.code)}
                              disabled={copies >= 5}
                              className="px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#152747] transition cursor-pointer disabled:opacity-30"
                              title="Increase copies (Max 5)"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right min-w-[70px]">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block">Subtotal</span>
                            <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                              {unitFee === 0 ? 'FREE' : `₱${subtotal.toFixed(2)}`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleItem(type.code)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] hover:text-white text-slate-700 dark:text-slate-300 font-bold text-[11px] uppercase transition cursor-pointer self-start sm:self-center"
                        >
                          + Select
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Live Calculation Receipt Summary */}
          {computation.itemsList.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0B1528] border border-slate-200 dark:border-blue-900/50 space-y-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold uppercase text-[11px]">
                <Receipt className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                <span>Live Fee Computation &amp; Summary</span>
              </div>

              <div className="space-y-1.5 text-xs divide-y divide-slate-100 dark:divide-blue-900/30">
                {computation.itemsList.map((item) => (
                  <div key={item.code} className="pt-1.5 first:pt-0 flex justify-between items-center">
                    <span className="text-slate-700 dark:text-slate-300">
                      {item.name} &times; <strong>{item.copies} {item.copies === 1 ? 'copy' : 'copies'}</strong>
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {item.isFree ? (
                        <span className="text-purple-600 dark:text-purple-400 font-black">FREE (Waived)</span>
                      ) : (
                        `₱${item.subtotal.toFixed(2)}`
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t-2 border-slate-200 dark:border-blue-900/60 flex justify-between items-center text-sm font-black">
                <span className="uppercase text-slate-900 dark:text-white">
                  Total Payment ({computation.totalCopiesCount} {computation.totalCopiesCount === 1 ? 'Certificate' : 'Certificates'}):
                </span>
                <span className="font-mono text-base text-[#9C2007] dark:text-rose-400">
                  {computation.totalFeeDisplay}
                </span>
              </div>
            </div>
          )}

          {/* 3. Applicant Verified Details */}
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
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase">
                  Purpose of Request *
                </label>
                <textarea
                  required
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Local Employment, Bank Loan, Scholarship, Hospital Assistance..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl focus:ring-1 focus:ring-[#9C2007] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || computation.totalCopiesCount === 0}
            className="w-full py-3.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black uppercase tracking-wider shadow-md shadow-[#9C2007]/20 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>
              {loading
                ? 'Processing Applications...'
                : `Submit Request (${computation.totalCopiesCount} ${computation.totalCopiesCount === 1 ? 'Copy' : 'Copies'} • ${computation.totalFeeDisplay})`}
            </span>
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
