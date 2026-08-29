import React from 'react';
import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-[#9C2007]/5 to-[#000055]/5 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
          <h1 className="text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Terms of Service</h1>
          
          <div className="prose prose-slate max-w-none space-y-6 text-slate-600 leading-relaxed font-medium">
            <p className="text-sm text-slate-400 font-bold mb-8">Last Updated: {new Date().toLocaleDateString()}</p>
            
            <div>
              <h2 className="text-xl font-black text-[#9C2007] uppercase tracking-tight mb-2">1. Acceptance of Terms</h2>
              <p>By accessing and using the SmartOnse portal, you accept and agree to be bound by the terms and provision of this agreement.</p>
            </div>
            
            <div>
              <h2 className="text-xl font-black text-[#9C2007] uppercase tracking-tight mb-2">2. Description of Service</h2>
              <p>SmartOnse provides residents of Barangay Onse with access to online services, announcements, document requests, and a transparency board. We reserve the right to modify or discontinue any part of the service at any time.</p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#9C2007] uppercase tracking-tight mb-2">3. User Accounts & Security</h2>
              <p>To use certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#9C2007] uppercase tracking-tight mb-2">4. Document Requests & Falsification Penalties</h2>
              <p>Documents requested through this portal are official barangay records. Any falsification of information provided during a request is punishable under Philippine law (Article 171 & 172 of the Revised Penal Code). We reserve the right to deny requests that fail verification.</p>
            </div>

            <div>
              <h2 className="text-xl font-black text-[#9C2007] uppercase tracking-tight mb-2">5. Code of Conduct</h2>
              <p>You agree to use the portal only for lawful purposes. You are prohibited from violating or attempting to violate the security of the website.</p>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100">
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#9C2007] hover:text-slate-900 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
