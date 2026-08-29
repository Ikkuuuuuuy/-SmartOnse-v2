'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ShieldCheck, Clock, Users, Award, Phone } from 'lucide-react';

export default function WelcomePage() {
  const [trackingCode, setTrackingCode] = useState('');
  const router = useRouter();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/track?trackingNumber=${encodeURIComponent(trackingCode.trim())}`);
    } else {
      router.push('/track');
    }
  };

  const stats = [
    { label: 'Registered Residents', value: '4,850+', icon: '👥', color: 'from-[#9C2007]/10 to-[#9C2007]/5' },
    { label: 'Active Youth Scholars', value: '180+', icon: '🎓', color: 'from-blue-500/10 to-blue-500/5' },
    { label: 'Service Turnaround Time', value: '< 24 Hrs', icon: '⏱️', color: 'from-green-500/10 to-green-500/5' },
    { label: 'Cryptographically Secured', value: '100%', icon: '🛡️', color: 'from-purple-500/10 to-purple-500/5' },
  ];

  const emergencyHotlines = [
    { name: 'San Juan CDRRMO', phone: '(02) 8722-9837', desc: 'Disaster response & rescue' },
    { name: 'Barangay Onse Hotline', phone: '(02) 8123-4567', desc: 'Local administrative officer' },
    { name: 'San Juan Police Station', phone: '(02) 8724-2509', desc: 'Law enforcement & security' },
    { name: 'San Juan Fire Station', phone: '(02) 8723-9371', desc: 'Fire emergencies' },
  ];

  return (
    <div className="flex flex-col font-sans transition-colors duration-200">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 px-6 md:px-12 text-center bg-gradient-to-br from-[#9C2007]/20 via-[#9C2007]/5 to-slate-50 dark:from-[#380903] dark:via-[#150406] dark:to-[#070D18] border-b border-[#9C2007]/10 dark:border-rose-950/40 overflow-hidden min-h-[90vh] flex flex-col justify-center transition-colors duration-200">
        {/* Vector Grid Background */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100L50 80C100 60 200 20 300 40C400 60 500 140 600 160C700 180 800 140 900 100C1000 60 1100 20 1150 0L1200 -20V400H1150C1100 400 1000 400 900 400C800 400 700 400 600 400C500 400 400 400 300 400C200 400 100 400 50 400H0V100Z" fill="#9C2007"/>
          </svg>
        </div>

        <div className="absolute top-20 left-10 w-24 h-24 bg-[#9C2007]/10 dark:bg-[#9C2007]/20 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto z-10">
          <div>
            <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9] mb-8">
              SMART<span className="text-[#9C2007] dark:text-rose-500">ONSE</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-slate-300 mb-10 leading-relaxed font-medium">
              Welcome to the official digital platform of Barangay Onse. Access e-governance services, track documents in real-time with cryptographic proof of integrity, and stay updated with local initiatives.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/login" 
                className="bg-[#9C2007] hover:bg-[#8B1A05] text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-xl transition cursor-pointer"
              >
                Log In
              </Link>
              <Link 
                href="/register" 
                className="bg-white dark:bg-[#0E1B33] hover:bg-slate-50 dark:hover:bg-[#152747] border border-gray-200 dark:border-blue-900/60 text-slate-700 dark:text-slate-200 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-sm transition cursor-pointer"
              >
                Register Account
              </Link>
            </div>

            {/* Quick Track Search */}
            <div className="pt-8 max-w-xl mx-auto">
              <form onSubmit={handleTrackSubmit} className="bg-white/90 dark:bg-[#0E1B33]/90 backdrop-blur-xl p-2 sm:p-3 rounded-3xl border border-slate-200 dark:border-blue-900/60 shadow-2xl flex items-center gap-3">
                <span className="text-xl pl-3">🔍</span>
                <input
                  type="text"
                  placeholder="Paste Tracking Code (e.g. ONSE-2026-XXXX)..."
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="flex-1 bg-transparent border-none text-slate-900 dark:text-white text-sm font-bold focus:outline-none focus:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal font-mono"
                />
                <button
                  type="submit"
                  className="bg-[#9C2007] hover:bg-[#8B1A05] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-[#9C2007]/20 cursor-pointer shrink-0"
                >
                  Track Status
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS DISPLAY */}
      <section className="py-16 px-6 md:px-12 bg-white dark:bg-[#070D18] transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`bg-gradient-to-br ${stat.color} dark:bg-[#0B1528] dark:from-[#0B1528] dark:to-[#0E1B33] p-6 rounded-3xl border border-slate-100 dark:border-blue-900/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EMERGENCY HOTLINES BANNER */}
      <section className="py-16 px-6 md:px-12 bg-slate-50 dark:bg-[#070D18] border-t border-slate-100 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400">Emergency Contacts</span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-1">24/7 Barangay Hotlines</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyHotlines.map((hotline) => (
              <div key={hotline.name} className="bg-white dark:bg-[#0E1B33] p-6 rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-sm hover:shadow-md transition">
                <h3 className="font-black text-slate-900 dark:text-white text-base mb-1">{hotline.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">{hotline.desc}</p>
                <a 
                  href={`tel:${hotline.phone}`}
                  className="text-sm font-black text-[#9C2007] dark:text-rose-400 hover:underline flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>{hotline.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
