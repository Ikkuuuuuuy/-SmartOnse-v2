'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Check, ArrowRight } from 'lucide-react';

export default function PrivacyConsentModal() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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

  if (!isOpen || !user) return null;

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
      <div className="bg-white rounded-3xl sm:rounded-[2rem] max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* Simple SmartOnse Red Header */}
        <div className="bg-gradient-to-r from-[#9C2007] to-[#7A1906] px-6 py-5 text-white shadow-sm text-center sm:text-left">
          <div className="text-[10px] font-black tracking-[0.2em] text-rose-200 uppercase">
            Republic of the Philippines &bull; R.A. 10173
          </div>
          <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight">
            Data Privacy Advisory &amp; Consent
          </h2>
          <p className="text-[11px] text-rose-100/90 font-medium">
            Barangay Onse Digital E-Governance Portal
          </p>
        </div>

        {/* Modal Simplified Body */}
        <div className="p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
          
          {/* Welcome User Banner */}
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-slate-800 text-[11px]">
            Welcome, <strong className="text-slate-900">{user.name}</strong> (<span className="text-[#9C2007] font-bold">{roleDisplay}</span>). Please review and accept the privacy notice to proceed.
          </div>

          <p className="text-[11px] text-slate-600">
            In compliance with the <strong className="text-slate-900">Data Privacy Act of 2012 (R.A. 10173)</strong>, Barangay Onse protects your personal identity records and ensures lawful processing:
          </p>

          {/* Simple Bullet Points */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-[11px] text-slate-600">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9C2007] mt-1.5 shrink-0" />
              <span><strong className="text-slate-900">Data Collected:</strong> Name, contact details, residency address, and valid IDs.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9C2007] mt-1.5 shrink-0" />
              <span><strong className="text-slate-900">Purpose:</strong> Issuing digital clearances, civil certificates, and community welfare.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9C2007] mt-1.5 shrink-0" />
              <span><strong className="text-slate-900">Security Vault:</strong> Encrypted storage accessible only by authorized officers.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9C2007] mt-1.5 shrink-0" />
              <span><strong className="text-slate-900">Your Rights:</strong> Right to be informed, access, or dispute data via <code className="text-[#9C2007] font-bold">privacy@onse.gov.ph</code>.</span>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 hover:border-[#9C2007] transition-colors">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-[#9C2007] rounded cursor-pointer shrink-0"
              />
              <span className="text-[11px] font-bold text-slate-800 leading-tight">
                I have read and agree to the collection &amp; processing of my data under <span className="text-[#9C2007]">R.A. 10173 (Data Privacy Act)</span>.
              </span>
            </label>
          </div>
        </div>

        {/* Simple Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleDecline}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            Decline
          </button>

          <button
            type="button"
            onClick={handleConsent}
            disabled={!agreed}
            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 cursor-pointer ${
              agreed
                ? 'bg-[#9C2007] hover:bg-[#8B1A05] text-white shadow-red-900/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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
