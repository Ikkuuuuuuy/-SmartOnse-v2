'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Scale, FileText, Lock, Building2, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();

  // Hide footer on admin portal routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="pt-20 pb-12 px-6 lg:px-12 bg-slate-950 text-white font-sans border-t border-slate-800">

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-16">
        
        {/* Col 1: Barangay Overview */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-1 shadow-md shrink-0">
              <img src="/images/barangay-onse-seal.png" alt="Barangay Onse Seal" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider">
                Smart<span className="text-[#9C2007]">Onse</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Barangay Onse, San Juan City
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-xs leading-relaxed">
            The official digital e-governance platform of Barangay Onse, providing transparent, secure, and expedited public services to every resident and constituent.
          </p>

          <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              NPC Registered DPO
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              National Privacy Commission compliance certified for public sector e-services.
            </p>
          </div>
        </div>

        {/* Col 2: Citizen E-Services & Quick Links */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#9C2007]" />
            <span>Citizen E-Services</span>
          </h3>

          <ul className="space-y-2.5 text-xs text-slate-400">
            <li>
              <Link href="/portal/request" className="hover:text-white hover:underline transition">
                &bull; Request Barangay Clearance
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-white hover:underline transition">
                &bull; Track Document Application
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-white hover:underline transition">
                &bull; Citizen&apos;s Charter &amp; Fees
              </Link>
            </li>
            <li>
              <Link href="/transparency" className="hover:text-white hover:underline transition">
                &bull; Full Disclosure &amp; Budget Board
              </Link>
            </li>
            <li>
              <Link href="/sk-programs" className="hover:text-white hover:underline transition">
                &bull; SK Youth Development Programs
              </Link>
            </li>
            <li>
              <Link href="/officials" className="hover:text-white hover:underline transition">
                &bull; Barangay Council &amp; Officials
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-white hover:underline transition">
                &bull; Community Events &amp; News
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Statutory Compliance & Philippine Laws */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#9C2007]" />
            <span>Statutory Mandates</span>
          </h3>

          <div className="space-y-3 text-[11px] text-slate-400 leading-snug">
            <div className="border-l-2 border-emerald-500 pl-2.5">
              <span className="font-bold text-slate-200">Republic Act No. 10173</span>
              <p className="text-[10px] text-slate-400">Data Privacy Act of 2012 &bull; Protection of resident identity &amp; PII</p>
            </div>

            <div className="border-l-2 border-[#9C2007] pl-2.5">
              <span className="font-bold text-slate-200">Republic Act No. 7160</span>
              <p className="text-[10px] text-slate-400">Local Government Code of 1991 &bull; Barangay governance standards</p>
            </div>

            <div className="border-l-2 border-blue-500 pl-2.5">
              <span className="font-bold text-slate-200">Republic Act No. 11032</span>
              <p className="text-[10px] text-slate-400">Ease of Doing Business &amp; Efficient Govt Service Delivery Act</p>
            </div>

            <div className="border-l-2 border-purple-500 pl-2.5">
              <span className="font-bold text-slate-200">R.A. 10742 / R.A. 11768</span>
              <p className="text-[10px] text-slate-400">Sangguniang Kabataan Reform &amp; Financial Autonomy Act</p>
            </div>

            <div className="border-l-2 border-amber-500 pl-2.5">
              <span className="font-bold text-slate-200">Executive Order No. 2, s. 2016</span>
              <p className="text-[10px] text-slate-400">Freedom of Information &amp; Barangay Full Public Disclosure</p>
            </div>
          </div>
        </div>

        {/* Col 4: Barangay Hall & Data Protection Officer (DPO) Contact */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-200 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#9C2007]" />
            <span>Barangay Hall &amp; DPO</span>
          </h3>

          <ul className="space-y-3 text-xs text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#9C2007] shrink-0 mt-0.5" />
              <span>3 J.V. Panganiban St., Barangay Onse, San Juan City, Metro Manila</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#9C2007] shrink-0" />
              <span>Hotline: (02) 8123-4567</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#9C2007] shrink-0" />
              <span>Email: contact@smartonse.com</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>DPO: privacy@onse.gov.ph</span>
            </li>
          </ul>

          <div className="pt-2 flex items-center gap-3">
            <a
              href="https://www.facebook.com/barangayonsesjcity"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#1877F2] text-white text-[11px] font-bold flex items-center gap-1.5 hover:scale-105 transition"
            >
              <span>Brgy Onse FB</span>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=100094839384187"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#000055] text-white text-[11px] font-bold flex items-center gap-1.5 hover:scale-105 transition"
            >
              <span>SK Onse FB</span>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Legal Sub-bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-800/80 pt-8 text-xs text-slate-500">
        <div className="text-center md:text-left space-y-1">
          <p className="font-bold text-slate-400">
            &copy; 2026 Barangay Onse, San Juan City &bull; SmartOnse Digital E-Governance System.
          </p>
          <p className="text-[10px] text-slate-500">
            In compliance with the Data Privacy Act of 2012 (R.A. 10173) and National Privacy Commission regulations.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-400">
          <Link href="/privacy" className="hover:text-emerald-400 transition">
            Data Privacy Policy (R.A. 10173)
          </Link>
          <span>&bull;</span>
          <Link href="/terms" className="hover:text-white transition">
            Terms of Service
          </Link>
          <span>&bull;</span>
          <Link href="/transparency" className="hover:text-white transition">
            Citizen&apos;s Charter
          </Link>
        </div>
      </div>
    </footer>
  );
}
