'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import LeadershipSpotlight from '@/components/officials/LeadershipSpotlight';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  ArrowRight,
  ExternalLink,
  Users
} from 'lucide-react';

interface AboutClientProps {
  stats: any[];
  officials: any[];
}

export default function AboutClient({ stats, officials }: AboutClientProps) {
  const { language, t } = useLanguage();
  const isFil = language === 'fil';

  const localizedStats = [
    {
      id: '1',
      label: isFil ? 'Rehistradong Populasyon' : 'Registered Population',
      value: '3,824',
      subtext: isFil ? 'Sensus ng Lungsod ng San Juan' : 'San Juan City Census',
    },
    {
      id: '2',
      label: isFil ? 'Rehistradong Botante' : 'Registered Voters',
      value: '1,250',
      subtext: isFil ? 'Mga Presinto ng COMELEC' : 'COMELEC Precincts',
    },
    {
      id: '3',
      label: isFil ? 'Aktibong Negosyo' : 'Active Businesses',
      value: '412',
      subtext: isFil ? 'Mga Komersyal na Establisimyento' : 'Commercial Establishments',
    },
    {
      id: '4',
      label: isFil ? 'Tugon sa Mamamayan' : 'Citizen Inquiries',
      value: '12,500+',
      subtext: isFil ? 'Frontline ng SmartOnse' : 'SmartOnse Frontline',
    },
  ];

  const displayStats = stats && stats.length > 0 ? stats : localizedStats;

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-28 md:pt-36 pb-24 px-6 lg:px-12 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-24">

        {/* HERO SECTION */}
        <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
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
              {t('about.badge')}
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[1.05]">
            {t('about.title_prefix')}<span className="text-[#9C2007] dark:text-rose-500">{t('about.title_name')}</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            {t('about.subtitle')}
          </p>

          <div className="h-1.5 w-24 bg-gradient-to-r from-[#9C2007] via-rose-500 to-[#000055] mx-auto rounded-full"></div>

          {/* Quick Nav Anchors */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-4">
            <a
              href="#key-metrics"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              {t('about.nav_metrics')}
            </a>
            <a
              href="#mandate-vision-mission"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              {t('about.nav_vision')}
            </a>
            <a
              href="#council-leadership"
              className="px-4 py-2 rounded-xl bg-[#9C2007] text-white text-xs font-black uppercase tracking-wider hover:bg-[#821804] transition-all shadow-md shadow-red-900/20"
            >
              {t('about.nav_leadership')}
            </a>
            <a
              href="#service-charter"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              {t('about.nav_charter')}
            </a>
            <a
              href="#civic-hub"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              {t('about.nav_hall')}
            </a>
          </div>
        </section>

        {/* KEY COMMUNITY METRICS / STATS */}
        <section id="key-metrics" className="scroll-mt-32">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {displayStats.map((stat, idx) => (
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
              {isFil ? 'Mga Pundasyon at Batayang Legal' : 'Guiding Principles & Legal Framework'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              {isFil ? 'Ang Ating Pangunahing Simulain' : 'Our Core Foundations'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mandate */}
            <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 sm:p-9 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400">
                    {t('about.mandate_badge')}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                  {t('about.mandate_title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  {t('about.mandate_desc')}
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 sm:p-9 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {t('about.vision_badge')}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                  {t('about.vision_title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  {t('about.vision_desc')}
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 sm:p-9 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    {t('about.mission_badge')}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                  {t('about.mission_title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm">
                  {t('about.mission_desc')}
                </p>
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
                <span>{isFil ? 'Istruktura ng Pamamahala at Konseho' : 'Governance & Council Structure'}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                {isFil ? 'Pamunuan ng Barangay at SK' : 'Barangay & SK Leadership'}
              </h2>
            </div>
          </div>

          <LeadershipSpotlight officials={officials} />
        </section>

        {/* SERVICE PLEDGE & CITIZENS' CHARTER */}
        <section id="service-charter" className="scroll-mt-32">
          <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 sm:p-14 rounded-[3.5rem] border border-white dark:border-blue-900/50 shadow-2xl space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {t('about.charter_title')}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-medium text-sm leading-relaxed">
                {t('about.charter_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-50/80 dark:bg-[#152747]/70 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 dark:border-blue-900/40 hover:shadow-lg transition-all duration-300 space-y-2">
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                  {t('about.charter_c1_title')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {t('about.charter_c1_desc')}
                </p>
              </div>

              <div className="bg-slate-50/80 dark:bg-[#152747]/70 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 dark:border-blue-900/40 hover:shadow-lg transition-all duration-300 space-y-2">
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                  {t('about.charter_c2_title')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {t('about.charter_c2_desc')}
                </p>
              </div>

              <div className="bg-slate-50/80 dark:bg-[#152747]/70 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 dark:border-blue-900/40 hover:shadow-lg transition-all duration-300 space-y-2">
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                  {t('about.charter_c3_title')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {t('about.charter_c3_desc')}
                </p>
              </div>

              <div className="bg-slate-50/80 dark:bg-[#152747]/70 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200/60 dark:border-blue-900/40 hover:shadow-lg transition-all duration-300 space-y-2">
                <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white">
                  {t('about.charter_c4_title')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                  {t('about.charter_c4_desc')}
                </p>
              </div>
            </div>

            {/* Social Media & Official Communication Channels */}
            <div className="border-t border-slate-200 dark:border-blue-900/40 pt-10 space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  {t('about.social_title')}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                  {t('about.social_desc')}
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
                  className="group bg-white dark:bg-[#152747]/80 p-6 rounded-[2rem] border border-slate-200/80 dark:border-blue-900/50 flex items-center justify-between hover:shadow-xl hover:border-blue-500 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1877F2] rounded-2xl flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base">SK Barangay Onse</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Youth Council Facebook Page</p>
                    </div>
                  </div>
                  <span className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-[#1877F2] transition-colors">
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
                  <span>{isFil ? 'Opisyal na Sentro ng Komunidad' : 'Physical Civic Center'}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase text-slate-900 dark:text-white tracking-tight mb-3">
                  {t('about.hall_title')}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                  {t('about.hall_desc')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-blue-900/40">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs uppercase text-slate-900 dark:text-white">
                      {t('about.hall_hours_title')}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('about.hall_hours_val')}
                    </p>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                      {t('about.hall_hours_sub')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-black text-xs uppercase text-slate-900 dark:text-white">
                      {t('about.hall_contact_title')}
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('about.hall_contact_val')}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('about.hall_contact_sub')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Service Request Card */}
            <div className="bg-gradient-to-br from-[#9C2007] via-[#821804] to-[#000055] p-8 sm:p-10 rounded-[3rem] text-white flex flex-col justify-between shadow-2xl space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20">
                  {t('about.cta_badge')}
                </span>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  {t('about.cta_title')}
                </h3>
                <p className="text-white/80 text-xs sm:text-sm font-medium leading-relaxed">
                  {t('about.cta_desc')}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/20">
                <Link
                  href="/services"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white text-[#9C2007] px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-rose-50 transition shadow-lg"
                >
                  <span>{t('about.cta_apply_btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/officials"
                  className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition"
                >
                  <span>{t('about.cta_officials_btn')}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
