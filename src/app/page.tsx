'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Users, 
  Award, 
  Phone, 
  FileText, 
  CheckCircle2, 
  Building2, 
  Sparkles, 
  Lock, 
  QrCode, 
  Calendar, 
  HeartPulse, 
  Scale, 
  FileCheck2, 
  TrendingUp, 
  ChevronRight, 
  ExternalLink,
  MapPin,
  HelpCircle,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [trackingCode, setTrackingCode] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/track?trackingNumber=${encodeURIComponent(trackingCode.trim())}`);
    } else {
      router.push('/track');
    }
  };

  const services = [
    {
      title: 'Barangay Clearance',
      desc: 'Official certificate for local employment, postal ID, bank accounts, and legal requirements.',
      fee: '₱50.00',
      time: '24 Hours',
      badge: 'Most Requested',
      code: 'BRGY_CLEARANCE',
      icon: <FileCheck2 className="w-6 h-6 text-[#9C2007] dark:text-rose-400" />,
    },
    {
      title: 'Certificate of Residency',
      desc: 'Certified proof of official residency in Barangay Onse for government and commercial uses.',
      fee: '₱30.00',
      time: 'Same Day',
      badge: 'Fast Track',
      code: 'CERT_RESIDENCY',
      icon: <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    },
    {
      title: 'Certificate of Indigency',
      desc: 'Free official documentation for medical assistance, burial aid, and social welfare subsidies.',
      fee: 'FREE',
      time: 'Same Day',
      badge: 'Social Welfare',
      code: 'CERT_INDIGENCY',
      icon: <HeartPulse className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      title: 'First-Time Jobseeker Certificate',
      desc: 'Waives government pre-employment document fees under Republic Act No. 11261.',
      fee: 'FREE (R.A. 11261)',
      time: 'Same Day',
      badge: 'Youth & Job Aid',
      code: 'FIRST_TIME_JOBSEEKER',
      icon: <Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
    },
    {
      title: 'Barangay Business Clearance',
      desc: 'Mandatory commercial permit for new business registration and annual mayor\'s permit renewal.',
      fee: '₱250.00',
      time: '2-3 Days',
      badge: 'Commercial',
      code: 'BUSINESS_CLEARANCE',
      icon: <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    },
    {
      title: 'Lupon Tagapamayapa Assistance',
      desc: 'Community dispute resolution, conciliation mediation, and barangay blotter recording.',
      fee: 'FREE',
      time: 'By Schedule',
      badge: 'Peace & Order',
      code: 'BLOTTER',
      icon: <Scale className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Fill Application Online',
      desc: 'Select your needed certificate, fill in your resident profile details, and attach valid government photo ID.',
      icon: <FileText className="w-6 h-6 text-[#9C2007] dark:text-rose-400" />,
    },
    {
      num: '02',
      title: 'Desk Officer Verification',
      desc: 'Barangay records officers cross-reference voter precinct lists and verify legitimate residency.',
      icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
    },
    {
      num: '03',
      title: 'QR & Digital Cryptographic Signing',
      desc: 'The certificate is signed by Captain Roberto Alba and stamped with a unique anti-counterfeit QR code.',
      icon: <QrCode className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      num: '04',
      title: 'Express Pickup or Digital Copy',
      desc: 'Download your certified digital clearance or pick up the printed official seal at Desk Window 2.',
      icon: <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
    },
  ];

  const stats = [
    { label: 'Registered Constituents', value: '4,850+', sub: 'Census Verified', icon: '👥' },
    { label: 'Avg Turnaround Time', value: '3.5 Hrs', sub: 'Anti-Red Tape Certified', icon: '⚡' },
    { label: 'Cryptographic Security', value: '100% SHA-256', sub: 'Tamper-Proof QR', icon: '🛡️' },
    { label: 'Youth Scholars Supported', value: '180+', sub: 'SK Onse Program', icon: '🎓' },
  ];

  const emergencyHotlines = [
    { name: 'San Juan CDRRMO Disaster Rescue', phone: '(02) 8722-9837', desc: 'Emergency response, flooding & rescue' },
    { name: 'Barangay Onse Administrative Desk', phone: '(02) 8123-4567', desc: 'Local barangay hall duty officer' },
    { name: 'San Juan PNP Police Station', phone: '(02) 8724-2509', desc: 'Peace & order, law enforcement' },
    { name: 'San Juan BFP Fire Station', phone: '(02) 8723-9371', desc: 'Fire alarms & immediate suppression' },
  ];

  const testimonials = [
    {
      quote: "Applying for my Barangay Clearance online took only 5 minutes. When I arrived at the barangay hall, my printed document with QR code was already waiting!",
      author: "Ma. Teresa Santos",
      role: "Resident • Purok 2, Lt. Artiaga St.",
      rating: 5,
    },
    {
      quote: "The First-Time Jobseeker Certificate was 100% free under R.A. 11261. The staff were efficient, and tracking my tracking code online was completely hassle-free.",
      author: "Joshua Lim",
      role: "College Graduate • J.V. Panganiban St.",
      rating: 5,
    },
    {
      quote: "SmartOnse sets the standard for modern e-governance in Metro Manila. The full financial transparency and public event advisories keep all residents well-informed.",
      author: "Engr. Carlos Mendoza",
      role: "Business Owner • F. Manalo St.",
      rating: 5,
    },
  ];

  return (
    <div className="flex flex-col font-sans transition-colors duration-200 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 sm:pt-36 md:pt-44 pb-24 px-4 sm:px-6 lg:px-12 text-center bg-gradient-to-br from-[#9C2007]/20 via-[#9C2007]/5 to-slate-50 dark:from-[#2e0803] dark:via-[#0c1322] dark:to-[#070D18] border-b border-[#9C2007]/10 dark:border-blue-900/40 overflow-hidden min-h-[92vh] flex flex-col justify-center transition-colors duration-200">
        
        {/* Dynamic Glowing Ambient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#9C2007]/15 dark:bg-[#9C2007]/25 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto z-10 space-y-8">
          
          {/* Official Seal & Government Pill */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white dark:bg-[#0B1528] p-2.5 shadow-2xl border-2 border-[#9C2007]/30 dark:border-rose-500/40 mx-auto animate-in zoom-in-90 duration-300">
              <img src="/images/barangay-onse-seal.png" alt="Barangay Onse Official Seal" className="w-full h-full object-contain" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#0E1B33]/90 border border-slate-200 dark:border-blue-900/60 shadow-sm text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Republic of the Philippines &bull; City of San Juan
            </div>
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-[1.05]">
              Smart Governance <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-[#9C2007] via-[#c5321f] to-[#800000] dark:from-rose-500 dark:via-rose-400 dark:to-amber-300 bg-clip-text text-transparent">
                At Your Fingertips
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Welcome to the official digital portal of <strong>Barangay Onse</strong>. Request civil clearances online, verify documents with anti-counterfeit QR codes, track public finances, and access 24/7 community services.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-2">
            <Link 
              href="/portal/request" 
              className="bg-[#9C2007] hover:bg-[#8B1A05] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-[#9C2007]/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Request Clearance Online</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link 
              href="/track" 
              className="bg-white dark:bg-[#0E1B33] hover:bg-slate-50 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-200 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Track Application</span>
            </Link>

            {user ? (
              <Link 
                href={user.destination || '/admin'} 
                className="bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Portal &rarr;</span>
              </Link>
            ) : (
              <Link 
                href="/login" 
                className="bg-slate-900 dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Resident Login</span>
              </Link>
            )}
          </div>

          {/* Quick Tracking Search Bar */}
          <div className="pt-4 max-w-xl mx-auto">
            <form onSubmit={handleTrackSubmit} className="bg-white dark:bg-[#0E1B33] p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-blue-900/60 shadow-2xl flex items-center gap-2 sm:gap-3">
              <span className="text-lg pl-3">🔍</span>
              <input
                type="text"
                placeholder="Paste Tracking Code (e.g. ONSE-2026-8891)..."
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="flex-1 bg-transparent border-none text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
              />
              <button
                type="submit"
                className="bg-[#9C2007] hover:bg-[#8B1A05] text-white px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-[#9C2007]/20 cursor-pointer shrink-0"
              >
                Track
              </button>
            </form>
          </div>

        </div>
      </section>


      {/* 2. LIVE SYSTEM TELEMETRY STRIP */}
      <section className="py-10 px-4 sm:px-6 lg:px-12 bg-white dark:bg-[#0B1528] border-b border-slate-200 dark:border-blue-900/40 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-5 sm:p-6 rounded-3xl bg-slate-50/80 dark:bg-[#0E1B33] border border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:shadow-md transition text-center space-y-1"
              >
                <div className="text-2xl sm:text-3xl mb-1">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</div>
                <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{stat.label}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* 3. CITIZEN E-SERVICES GATEWAY */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-[#FDF8F6] dark:bg-[#070D18] transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-1 rounded-full border border-rose-200/60 dark:border-rose-900/40">
              Citizen E-Services &bull; R.A. 11032
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Online Document Applications
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              File official certifications from home. Verified applications are processed within 24 hours with cryptographic authenticity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-white dark:bg-[#0E1B33] p-7 rounded-3xl sm:rounded-[2.5rem] border border-slate-200 dark:border-blue-900/50 shadow-lg hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-[#152747] border border-slate-200/80 dark:border-blue-900/60 flex items-center justify-center shadow-xs">
                      {service.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-blue-900/40">
                      {service.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-[#9C2007] dark:group-hover:text-rose-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-blue-900/40 space-y-3 mt-6 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Fee / Rate:</span>
                    <span className="font-black text-[#9C2007] dark:text-rose-400">{service.fee}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Turnaround:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{service.time}</span>
                  </div>

                  <Link
                    href={`/portal/request?type=${service.code}`}
                    className="w-full py-3 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-extrabold uppercase tracking-wider text-center text-xs flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <span>Apply Online</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 4. HOW IT WORKS (4 STEP FLOW) */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-white dark:bg-[#0B1528] border-y border-slate-200 dark:border-blue-900/40 transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3.5 py-1 rounded-full border border-blue-200 dark:border-blue-900/40">
              Seamless Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              How Online Clearance Issuance Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              Fast, paperless, and transparent from application submission to cryptographic certification.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {steps.map((step) => (
              <div
                key={step.num}
                className="p-7 rounded-3xl bg-slate-50/80 dark:bg-[#0E1B33] border border-slate-200/80 dark:border-blue-900/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#152747] border border-slate-200 dark:border-blue-900/50 flex items-center justify-center shadow-xs">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black text-slate-300 dark:text-slate-600 font-mono">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 5. PUNONG BARANGAY LEADERSHIP MESSAGE */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-[#FDF8F6] dark:bg-[#070D18] transition-colors duration-200">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-white via-slate-50 to-rose-50/30 dark:from-[#0E1B33] dark:via-[#0B1528] dark:to-[#170907] rounded-3xl sm:rounded-[3rem] p-8 sm:p-12 border border-slate-200/80 dark:border-blue-900/50 shadow-2xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            <div className="relative shrink-0">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-[#9C2007]/20 dark:border-rose-500/30 shadow-2xl bg-white">
                <img src="/images/Chairman.webp" alt="Hon. Roberto B. Alba" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-[#9C2007] text-white px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                Punong Barangay
              </div>
            </div>

            <div className="space-y-4 text-center md:text-left flex-1">
              <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400">
                Message from the Leadership
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug">
                &ldquo;Serving Barangay Onse with Honor, Integrity &amp; Innovation&rdquo;
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                As we modernize our public services, <strong>SmartOnse</strong> embodies our commitment to accessible, paperless governance. Through anti-red tape transparency and modern digital technology, we guarantee that every constituent in Barangay Onse receives swift, honest, and dignified public assistance.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div>
                  <div className="text-base font-black text-slate-900 dark:text-white">Hon. Roberto B. Alba</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">Barangay Captain &bull; Sangguniang Barangay Onse</div>
                </div>

                <Link
                  href="/officials"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1C335C] text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Meet the Council &rarr;
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* 6. VERIFIED CITIZEN TESTIMONIALS */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-white dark:bg-[#0B1528] border-y border-slate-200 dark:border-blue-900/40 transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/40">
              Constituent Voice
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Trusted by Barangay Onse Residents
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-slate-50/80 dark:bg-[#0E1B33] border border-slate-200/80 dark:border-blue-900/50 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400 text-sm">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-blue-900/40">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{item.author}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.role}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>


      {/* 7. EMERGENCY HOTLINES 24/7 HUB */}
      <section className="py-20 px-4 sm:px-6 lg:px-12 bg-gradient-to-b from-[#FDF8F6] to-rose-50/50 dark:from-[#070D18] dark:to-[#120608] transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-3.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/50">
              Immediate Assistance
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              24/7 Barangay Emergency Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Save these official hotlines on your mobile device for immediate medical, fire, disaster, or police response.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {emergencyHotlines.map((hotline) => (
              <div
                key={hotline.name}
                className="bg-white dark:bg-[#0E1B33] p-6 rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-md hover:shadow-xl transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <h3 className="font-black text-slate-900 dark:text-white text-sm leading-tight">{hotline.name}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{hotline.desc}</p>
                </div>
                
                <a 
                  href={`tel:${hotline.phone}`}
                  className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-[#9C2007] hover:text-white text-[#9C2007] dark:text-rose-400 font-black text-xs flex items-center justify-center gap-2 transition cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
                >
                  <Phone className="w-3.5 h-3.5" />
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
