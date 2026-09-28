import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import LeadershipSpotlight from '@/components/officials/LeadershipSpotlight';
import { 
  Building2, 
  ShieldCheck, 
  Target, 
  Eye, 
  FileText, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  HeartHandshake,
  Bot
} from 'lucide-react';

export const revalidate = 60;

const FALLBACK_OFFICIALS = [
  // Sangguniang Barangay
  {
    id: 'brgy-01',
    name: 'Hon. Roberto B. Alba',
    position: 'Barangay Chairman',
    committee: 'Executive & Peace and Order',
    contact: '0917-888-0011',
    avatarUrl: '/images/Chairman.webp',
  },
  {
    id: 'brgy-02',
    name: 'Elena V. Gutierrez',
    position: 'Barangay Treasurer',
    committee: 'Finance, Budget & Appropriations',
    contact: '0917-888-0029',
    avatarUrl: '/images/barangay-onse-seal.png',
  },
  {
    id: 'brgy-03',
    name: 'Maria Elena C. Gomez',
    position: 'Barangay Secretary',
    committee: 'Secretariat & Administrative Records',
    contact: '0917-888-0030',
    avatarUrl: '/images/barangay-onse-seal.png',
  },
  {
    id: 'brgy-04',
    name: 'Hon. Danilo A. Florano',
    position: 'Barangay Kagawad',
    committee: 'Committee on Public Works & Infrastructure',
    contact: '0917-888-0012',
    avatarUrl: '/images/Dan.webp',
  },
  {
    id: 'brgy-05',
    name: 'Hon. Zenaida C. Casao',
    position: 'Barangay Kagawad',
    committee: 'Committee on Health & Sanitation',
    contact: '0917-888-0013',
    avatarUrl: '/images/Zenaida.webp',
  },
  {
    id: 'brgy-06',
    name: 'Hon. Ryan Lopez Lorbes',
    position: 'Barangay Kagawad',
    committee: 'Committee on Cleanliness & Environment',
    contact: '0917-888-0014',
    avatarUrl: '/images/Ryan.webp',
  },
  {
    id: 'brgy-07',
    name: 'Hon. John Mark Cortez Daradal',
    position: 'Barangay Kagawad',
    committee: 'Committee on Ways and Means',
    contact: '0917-888-0015',
    avatarUrl: '/images/JM.webp',
  },
  {
    id: 'brgy-08',
    name: 'Hon. Federico Soller Deniega',
    position: 'Barangay Kagawad',
    committee: 'Committee on Peace and Order',
    contact: '0917-888-0016',
    avatarUrl: '/images/Federico.webp',
  },
  {
    id: 'brgy-09',
    name: 'Hon. Miguel Arguelles Zamora Jr.',
    position: 'Barangay Kagawad',
    committee: 'Committee on Education & Culture',
    contact: '0917-888-0017',
    avatarUrl: '/images/Miguel.webp',
  },
  {
    id: 'brgy-10',
    name: 'Hon. Rafael Lasin Borjal Jr.',
    position: 'Barangay Kagawad',
    committee: 'Committee on Transportation & Traffic',
    contact: '0917-888-0018',
    avatarUrl: '/images/RAF.webp',
  },

  // Sangguniang Kabataan
  {
    id: 'sk-01',
    name: 'Hon. John Michael D. Permato',
    position: 'SK Chairperson',
    committee: 'Youth Leadership & Sports Development',
    contact: '0917-888-0019',
    avatarUrl: '/images/Permato.webp',
  },
  {
    id: 'sk-02',
    name: 'Michaelito Bongalos',
    position: 'SK Treasurer',
    committee: 'Youth Budget & Appropriations',
    contact: '0917-888-0020',
    avatarUrl: '/images/Bongalos.webp',
  },
  {
    id: 'sk-03',
    name: 'Jonathan D. Sorio',
    position: 'SK Secretary',
    committee: 'Youth Records & Secretariat',
    contact: '0917-888-0021',
    avatarUrl: '/images/Sorio.webp',
  },
  {
    id: 'sk-04',
    name: 'Hon. Abigail A. Reyes',
    position: 'SK Kagawad',
    committee: 'Committee on Health & Nutrition',
    contact: '0917-888-0022',
    avatarUrl: '/images/Mybaby.webp',
  },
  {
    id: 'sk-05',
    name: 'Hon. Ethan Jetter D.G. Garcia',
    position: 'SK Kagawad',
    committee: 'Committee on Education & Culture',
    contact: '0917-888-0023',
    avatarUrl: '/images/Garcia.webp',
  },
  {
    id: 'sk-06',
    name: 'Hon. Alexis Adrianne R. Luciano',
    position: 'SK Kagawad',
    committee: 'Committee on Digital Arts & Innovation',
    contact: '0917-888-0024',
    avatarUrl: '/images/Luciano.webp',
  },
  {
    id: 'sk-07',
    name: 'Hon. Sherric Q. Pantaleon',
    position: 'SK Kagawad',
    committee: 'Committee on Anti-Drug Abuse (YADAS)',
    contact: '0917-888-0025',
    avatarUrl: '/images/Sherric.webp',
  },
  {
    id: 'sk-08',
    name: 'Hon. Sherwin Reyes',
    position: 'SK Kagawad',
    committee: 'Committee on Environmental Protection',
    contact: '0917-888-0026',
    avatarUrl: '/images/Reyes.webp',
  },
  {
    id: 'sk-09',
    name: 'Hon. Ian Jeffrey L. Cadiang',
    position: 'SK Kagawad',
    committee: 'Committee on Youth Livelihood & Skills',
    contact: '0917-888-0027',
    avatarUrl: '/images/Cadiang.webp',
  },
  {
    id: 'sk-10',
    name: 'Hon. Joshua D. Munsayac',
    position: 'SK Kagawad',
    committee: 'Committee on Disaster Preparedness',
    contact: '0917-888-0028',
    avatarUrl: '/images/Munsayac.webp',
  },
];

export default async function AboutPage() {
  let stats: any[] = [];
  try {
    stats = await prisma.barangayStatistic.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (e) {
    console.error('Failed to load stats:', e);
  }

  if (!stats || stats.length === 0) {
    stats = [
      { id: '1', label: 'Registered Population', value: '3,824', subtext: 'San Juan City Census' },
      { id: '2', label: 'Registered Voters', value: '1,250', subtext: 'COMELEC Precincts' },
      { id: '3', label: 'Active Businesses', value: '412', subtext: 'Commercial Establishments' },
      { id: '4', label: 'Citizen Inquiries', value: '12,500+', subtext: 'SmartOnse Frontline' },
    ];
  }

  let dbOfficials: any[] = [];
  try {
    dbOfficials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (e) {
    console.error('Failed to load officials:', e);
  }

  const officials = dbOfficials && dbOfficials.length > 0 ? dbOfficials : FALLBACK_OFFICIALS;

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-28 md:pt-36 pb-24 px-6 lg:px-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-24">

        {/* HERO SECTION */}
        <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#9C2007]/10 dark:bg-rose-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

          {/* Civic Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#0E1B33]/80 border border-slate-200 dark:border-blue-900/50 shadow-xs backdrop-blur-md">
            <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0">
              <Image
                src="/images/barangay-onse-seal.png"
                alt="Barangay Onse Seal"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400">
              Republic of the Philippines &bull; City of San Juan
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[1.05]">
            Barangay <span className="text-[#9C2007] dark:text-rose-500">Onse</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            A progressive, resilient, and digitally-transformed barangay dedicated to prompt, transparent, and compassionate public service for every resident.
          </p>

          <div className="h-1.5 w-24 bg-gradient-to-r from-[#9C2007] via-rose-500 to-[#000055] mx-auto rounded-full"></div>

          {/* Quick Nav Anchors */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
            <a
              href="#key-metrics"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              Key Metrics
            </a>
            <a
              href="#mandate-vision-mission"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              Pillars &amp; Vision
            </a>
            <a
              href="#council-leadership"
              className="px-4 py-2 rounded-xl bg-[#9C2007] text-white text-xs font-black uppercase tracking-wider hover:bg-[#821804] transition-all shadow-md shadow-red-900/20"
            >
              Council Leadership
            </a>
            <a
              href="#service-charter"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              Service Pledge
            </a>
            <a
              href="#civic-hub"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              Barangay Hall
            </a>
          </div>
        </section>

        {/* KEY COMMUNITY METRICS / STATS */}
        <section id="key-metrics" className="scroll-mt-32">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={stat.id || idx}
                className="group relative bg-white/70 dark:bg-[#0E1B33]/70 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white dark:border-blue-900/50 shadow-xl shadow-red-900/5 dark:shadow-black/40 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#9C2007]/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
                <p className="text-[#9C2007] dark:text-rose-400 text-3xl sm:text-4xl font-black mb-1.5 tracking-tighter">
                  {stat.value}
                </p>
                <h4 className="text-slate-800 dark:text-slate-200 font-black uppercase text-xs tracking-wider mb-1">
                  {stat.label}
                </h4>
                {stat.subtext && (
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {stat.subtext}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* MANDATE, VISION, MISSION PILLARS */}
        <section id="mandate-vision-mission" className="scroll-mt-32 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9C2007] dark:text-rose-400">
              Guiding Principles &amp; Legal Framework
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Our Core Foundations
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mandate */}
            <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 sm:p-9 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#9C2007] to-rose-700 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-red-900/20 text-white">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400">
                    Republic Act 7160 &bull; RA 11032
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                  Our Mandate
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  Under the Local Government Code of 1991 and the Ease of Doing Business &amp; Efficient Government Services Delivery Act of 2018 (RA 11032), Barangay Onse delivers statutory community services, promotes general welfare, maintains public safety, and safeguards community rights with utmost transparency and accountability.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-blue-900/40 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Statutory front-line governance</span>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 sm:p-9 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#000055] to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-900/20 text-white">
                  <Eye className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    Smart San Juan Future
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                  Our Vision
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  Barangay Onse envisions itself as a benchmark smart community in San Juan City—an empowered, resilient, and inclusive barangay where frontline services are automated, neighborhood safety is guaranteed, youth leadership flourishes, and every family experiences dignity and progress.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-blue-900/40 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Citizen-empowered ecosystem</span>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 sm:p-9 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-[#9C2007] via-amber-600 to-[#000055] rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-red-900/20 text-white">
                  <Target className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    Frontline Action Plan
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                  Our Mission
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  To eliminate red tape through digital innovation, maintain 24/7 peace and disaster preparedness, provide prompt assistance for senior citizens, solo parents, and indigent families, and maintain an open-door policy where citizen voices actively shape local governance.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-blue-900/40 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Transparent public delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* LEADERSHIP HIERARCHY SPOTLIGHT */}
        <section id="council-leadership" className="scroll-mt-32 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#9C2007] dark:text-rose-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
                <Building2 className="w-4 h-4" />
                <span>Governance &amp; Council Structure</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Barangay &amp; SK Leadership
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md font-medium">
              Governed according to civic leadership hierarchy: <span className="font-bold text-slate-800 dark:text-slate-200">Chairman &bull; Treasurer &bull; Secretary &bull; Kagawads</span>.
            </p>
          </div>

          {/* Interactive Component */}
          <LeadershipSpotlight officials={officials} />
        </section>

        {/* SERVICE PLEDGE & CITIZENS' CHARTER */}
        <section id="service-charter" className="scroll-mt-32">
          <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 sm:p-14 rounded-[3.5rem] border border-white dark:border-blue-900/50 shadow-2xl space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#9C2007] to-[#000055] rounded-2xl mb-2 text-white shadow-lg">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Citizens&apos; Service Charter
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-medium text-sm leading-relaxed">
                Four unyielding commitments upholding our pledge to deliver responsive public administration to every Juan and Juana.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-50/80 dark:bg-[#152747]/70 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 dark:border-blue-900/40 hover:shadow-lg transition-all duration-300 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-[#9C2007] dark:text-rose-400 flex items-center justify-center font-black text-base">
                  01
                </div>
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                  Tapat na Serbisyo, Para sa Tao
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Transparent fiscal allocations, open council proceedings, and zero tolerance for red tape.
                </p>
              </div>

              <div className="bg-slate-50/80 dark:bg-[#152747]/70 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 dark:border-blue-900/40 hover:shadow-lg transition-all duration-300 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-black text-base">
                  02
                </div>
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                  Mabilis, Malinis, Makataong Serbisyo
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Same-day processing for clearances, clean public spaces, and courteous desk frontline officers.
                </p>
              </div>

              <div className="bg-slate-50/80 dark:bg-[#152747]/70 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 dark:border-blue-900/40 hover:shadow-lg transition-all duration-300 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-base">
                  03
                </div>
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                  Barangay Mo, Kaagapay Mo
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  Dedicated social welfare desks for senior citizens, solo parents, PWDs, and children in need.
                </p>
              </div>

              <div className="bg-slate-50/80 dark:bg-[#152747]/70 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 dark:border-blue-900/40 hover:shadow-lg transition-all duration-300 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-base">
                  04
                </div>
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                  Digital na Pamamahala
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  24/7 SmartOnse citizen portal, QR code document verification, and real-time status tracking.
                </p>
              </div>
            </div>

            {/* Social Media & Official Communication Channels */}
            <div className="border-t border-slate-200 dark:border-blue-900/40 pt-10 space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Verified Social Channels &amp; Announcements
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  Follow official announcements, disaster advisories, and community program schedules
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a
                  href="https://www.facebook.com/barangayonsesjcity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-[#152747]/80 p-6 rounded-[2rem] border border-slate-200/80 dark:border-blue-900/50 flex items-center justify-between hover:shadow-xl hover:border-blue-500 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1877F2] rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base">Barangay Onse</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Official Facebook Page</p>
                    </div>
                  </div>
                  <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-[#1877F2] transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=100094839384187"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white dark:bg-[#152747]/80 p-6 rounded-[2rem] border border-slate-200/80 dark:border-blue-900/50 flex items-center justify-between hover:shadow-xl hover:border-[#000055] transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#000055] rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base">SK Barangay Onse</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Youth Council Facebook Page</p>
                    </div>
                  </div>
                  <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-blue-500 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* BARANGAY HALL LOCATION & CIVIC HUB */}
        <section id="civic-hub" className="scroll-mt-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-xl space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#9C2007] dark:text-rose-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Physical Civic Center</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white tracking-tight mb-3">
                  Barangay Onse Hall &bull; San Juan City
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                  Located in the heart of San Juan City, Metro Manila. Our barangay hall houses the Punong Barangay executive office, Session Hall, Lupong Tagapamayapa conciliation room, Barangay Health Station, Day Care Center, and 24/7 BDRRM Emergency Operations Center.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-blue-900/40">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs uppercase text-slate-900 dark:text-white">Operating Hours</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Monday to Friday: 8:00 AM &ndash; 5:00 PM
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                      Emergency &amp; Blotter: 24/7 Active
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs uppercase text-slate-900 dark:text-white">Frontline Contact</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Hotline: (02) 8723-0011 / 0917-888-0011
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Email: info@onse.gov.ph
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Service Request Card */}
            <div className="bg-gradient-to-br from-[#9C2007] via-[#821804] to-[#000055] p-8 sm:p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  SmartOnse 24/7 Digital Desk
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Request Barangay Certificates Online
                </h3>
                <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
                  Skip the long line. Apply for Barangay Clearance, Certificate of Residency, Indigency, and First Time Jobseeker certificates with secure digital verification.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/20">
                <Link
                  href="/services"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#9C2007] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-rose-50 transition shadow-lg"
                >
                  <span>Apply for Document</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/officials"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition"
                >
                  <span>View All Council Officials</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
