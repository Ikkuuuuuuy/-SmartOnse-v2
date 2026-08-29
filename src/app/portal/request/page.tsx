'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, CheckCircle2, Clock, Search, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

const DOC_TYPES = [
  { code: 'BRGY_CLEARANCE', name: 'Barangay Clearance', fee: '₱50.00', time: '24 Hours' },
  { code: 'CERT_RESIDENCY', name: 'Certificate of Residency', fee: '₱30.00', time: 'Same Day' },
  { code: 'CERT_INDIGENCY', name: 'Certificate of Indigency', fee: 'FREE', time: 'Same Day' },
  { code: 'FIRST_TIME_JOBSEEKER', name: 'First Time Jobseeker Certificate', fee: 'FREE', time: 'Same Day' },
  { code: 'BUSINESS_CLEARANCE', name: 'Barangay Business Clearance', fee: '₱250.00', time: '2 Days' },
];

function RequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading } = useAuth();

  const [docType, setDocType] = useState(searchParams.get('type') || 'BRGY_CLEARANCE');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [purpose, setPurpose] = useState('');
  const [civilStatus, setCivilStatus] = useState('Single');
  const [years, setYears] = useState('2');
  const [loading, setLoading] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

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
      setContactNumber(user.phone || '0917-888-0011');
      setAddress(user.address || 'Lt. Artiaga St., Barangay Onse, San Juan City');
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="pt-40 pb-20 bg-slate-50 min-h-screen flex flex-col items-center justify-center font-sans">
        <div className="w-14 h-14 rounded-2xl bg-[#9C2007] text-white flex items-center justify-center font-black text-xl animate-pulse shadow-lg">
          O
        </div>
        <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest">
          Securing Portal &bull; Redirecting to Login...
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const code = `ONSE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      setTrackingNumber(code);
      setLoading(false);
    }, 800);
  };

  if (trackingNumber) {
    return (
      <div className="py-20 pt-40 bg-slate-50 min-h-screen flex items-center justify-center px-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase">Application Filed!</h2>
          <p className="text-xs text-slate-600">Your application has been received by Barangay Onse Administration.</p>
          <div className="p-4 rounded-2xl bg-[#9C2007]/10 border border-[#9C2007]/20 space-y-1">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Tracking Code</span>
            <div className="text-2xl font-black font-mono text-[#9C2007] select-all">{trackingNumber}</div>
          </div>
          <div className="flex gap-2">
            <Link href={`/track?trackingNumber=${trackingNumber}`} className="flex-1 py-3 bg-[#9C2007] text-white rounded-xl font-bold text-xs uppercase text-center shadow-md">
              Track Application
            </Link>
            <button onClick={() => { setTrackingNumber(null); setPurpose(''); }} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs uppercase cursor-pointer">
              New Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 md:pt-40 pb-20 bg-slate-50 min-h-screen font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">

        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] bg-[#9C2007]/10 px-3 py-1 rounded-full">
            Citizen E-Services &bull; R.A. 11032
          </span>
          <h1 className="text-4xl font-black text-slate-900 uppercase">Request Document Online</h1>
          <p className="text-xs sm:text-sm text-slate-600">Submit your official barangay certificate or clearance application.</p>
        </div>

        {/* Verified Resident Indicator */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">
                Logged in as <strong className="text-slate-900">{user.name}</strong> ({user.roleTitle || user.role.toUpperCase()})
              </p>
              <p className="text-[11px] text-emerald-700">Verified Citizen Session &bull; Auto-filled details</p>
            </div>
          </div>
          <Link href="/profile" className="text-[11px] font-black uppercase tracking-wider text-[#9C2007] hover:underline shrink-0">
            Edit Info &rarr;
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="space-y-3">
            <label className="font-bold uppercase tracking-wider text-slate-700">1. Select Certificate Type *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DOC_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.code}
                  onClick={() => setDocType(type.code)}
                  className={`p-3.5 rounded-xl text-left border transition cursor-pointer ${
                    docType === type.code 
                      ? 'border-[#9C2007] bg-[#9C2007]/10 ring-2 ring-[#9C2007]/20 font-bold text-[#9C2007]' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{type.name}</span>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white shadow-2xs text-[#9C2007]">{type.fee}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block font-medium">Processing: {type.time}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="font-bold uppercase tracking-wider text-slate-700">2. Applicant Verified Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Dela Cruz"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="0917-xxx-xxxx"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#9C2007] font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-slate-700 uppercase">Email Address</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono cursor-not-allowed"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Address in Barangay Onse *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="124 Gomez St., Barangay Onse, San Juan City"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-slate-700 uppercase">Purpose of Request *</label>
                <textarea
                  required
                  rows={2}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Local Employment, Bank Requirement, Postal ID, Scholarship..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black uppercase tracking-wider shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
