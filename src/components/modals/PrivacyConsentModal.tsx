'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, ChevronDown, ChevronUp, ShieldCheck, ExternalLink } from 'lucide-react';

export default function PrivacyConsentModal() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (user) {
      const consentKey = `smartonse_privacy_consent_${user.id || user.email}`;
      const hasConsented = localStorage.getItem(consentKey);
      if (!hasConsented) {
        setIsOpen(true);
        setAgreed(false);
      } else {
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  }, [user]);

  // Do NOT block the user if they are currently viewing the /privacy or /terms page
  if (!isOpen || !user || pathname === '/privacy' || pathname === '/terms') {
    return null;
  }

  const handleConsent = () => {
    if (!agreed) return;
    const consentKey = `smartonse_privacy_consent_${user.id || user.email}`;
    localStorage.setItem(consentKey, JSON.stringify({
      timestamp: new Date().toISOString(),
      user: user.email,
      law: 'R.A. 10173',
      agreed: true,
    }));
    setIsOpen(false);
  };

  const handleDecline = () => {
    logout();
    setIsOpen(false);
  };

  const roleDisplay = user.roleTitle || user.role.toUpperCase();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-sm font-sans animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0E1B33] rounded-3xl sm:rounded-[2rem] max-w-lg w-full shadow-2xl border border-slate-200 dark:border-blue-900/60 overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-200">
        
        {/* Civic Navy & Emerald Trust Header (Non-error informational palette) */}
        <div className="bg-gradient-to-r from-slate-900 via-[#0F172A] to-emerald-950 px-6 py-5 text-white shadow-sm text-center sm:text-left">
          <div className="text-[10px] font-black tracking-[0.2em] text-emerald-300 uppercase">
            Republic of the Philippines &bull; R.A. 10173
          </div>
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">
            Data Privacy Advisory &amp; Consent
          </h2>
          <p className="text-[11px] text-slate-300 font-medium">
            Barangay Onse Digital E-Governance Website
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs leading-relaxed max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Welcome User Banner (Neutral Blue/Emerald Trust Styling — No Red) */}
          <div className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-slate-800 dark:text-slate-200 text-[11px] flex items-center justify-between gap-2">
            <span>
              Signed in as <strong className="text-slate-900 dark:text-white">{user.name}</strong> (<span className="text-emerald-700 dark:text-emerald-400 font-bold">{roleDisplay}</span>)
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
              R.A. 10173
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Barangay Onse protects your personal identity records in accordance with the <strong className="text-slate-900 dark:text-white">Data Privacy Act of 2012 (R.A. 10173)</strong>. Your submitted data is securely processed solely for official resident services, clearances, and community welfare.
          </p>

          {/* Expandable "See Summary" Toggle (Neutral Slate/Blue — No Red) */}
          <div className="rounded-2xl border border-slate-200 dark:border-blue-900/50 bg-slate-50 dark:bg-[#152747]/60 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setShowSummary(!showSummary)}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a3158] transition cursor-pointer"
            >
              <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-blue-700 dark:text-blue-300 font-black">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {showSummary ? 'Hide Policy Summary' : 'See Privacy Summary & Highlights'}
              </span>
              {showSummary ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showSummary && (
              <div className="p-4 pt-1 border-t border-slate-200 dark:border-blue-900/40 space-y-2.5 text-[11px] text-slate-600 dark:text-slate-300 animate-in fade-in duration-150">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white">1. Data Collected:</strong> Legal name, address, contact details, and uploaded verification IDs.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white">2. Lawful Purpose:</strong> Document issuance (Clearance, Residency, Indigency) and community welfare (R.A. 7160).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white">3. Security Vault:</strong> Encrypted storage with strict role-based access; no commercial third-party sharing.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <span><strong className="text-slate-900 dark:text-white">4. Resident Rights:</strong> Inquire, update, or dispute data anytime via <code className="text-blue-700 dark:text-blue-300 font-bold">privacy@onse.gov.ph</code>.</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick link to full policy page */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#152747]/40 border border-slate-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">View entire legal manual:</span>
            <Link
              href="/privacy"
              className="text-blue-700 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 text-[11px] uppercase tracking-wider"
            >
              <span>Full Privacy Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Consent Checkbox (Emerald/Slate Trust Styling — No Red) */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-500 transition-colors">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                I have read and agree to the Data Privacy Terms &amp; Conditions.
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#080E1A] border-t border-slate-200 dark:border-blue-900/50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDecline}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-300 dark:border-blue-900/50 hover:bg-slate-100 dark:hover:bg-[#152747] text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Decline
          </button>

          <button
            type="button"
            onClick={handleConsent}
            disabled={!agreed}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer ${
              agreed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>Agree &amp; Proceed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
