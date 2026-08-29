import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export default async function AboutPage() {
  let stats: any[] = [];
  try {
    stats = await prisma.barangayStatistic.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (e) {
    console.error(e);
  }

  // Fallback stats if empty
  if (!stats || stats.length === 0) {
    stats = [
      { id: 1, label: 'Population', value: '3,824' },
      { id: 2, label: 'Registered Voters', value: '1,250' },
      { id: 3, label: 'Active Businesses', value: '412' },
      { id: 4, label: 'Citizen Inquiries', value: '12,500+' },
    ];
  }

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">

        {/* DASHBOARD HEADER */}
        <header className="mb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
            Barangay <span className="text-[#9C2007] dark:text-rose-500">Onse</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-3">
            Leadership &amp; Community Overview
          </p>
          <div className="h-1 w-20 bg-[#9C2007] mx-auto rounded-full mb-12"></div>

          {/* STATISTICS GRID - GLASSMORPHISM */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-white/60 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 rounded-[3.5rem] border border-white dark:border-blue-900/50 shadow-xl shadow-red-900/5 dark:shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <p className="text-[#9C2007] dark:text-rose-400 text-4xl font-black mb-2 tracking-tighter">{stat.value}</p>
                <p className="text-slate-500 dark:text-slate-400 font-black uppercase text-[9px] tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* MANDATE, VISION, MISSION SECTION */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mandate */}
            <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-lg hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#9C2007] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Our Mandate</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Barangay Onse, San Juan City oversees implementation of the Ease of Doing Business and Efficient Government Services Delivery Act of 2018. It outlines services offered, procedures for accessing these services, requirements, time it takes to deliver, and fees.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-lg hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#000055] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Our Vision</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Barangay Onse envision to create a transparent, efficient and accessible barangay administration where services are delivered promptly, processes are simplified, and community participation is fostered.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white dark:border-blue-900/50 shadow-lg hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#9C2007] to-[#000055] rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Our Mission</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                Barangay Onse is centered on promoting efficiency, transparency and accessibility in public service delivery. Our mission aims to reduce bureaucratic obstacles and simplify processes.
              </p>
            </div>
          </div>
        </section>

        {/* SERVICE PLEDGE SECTION */}
        <section className="mb-20">
          <div className="bg-white/80 dark:bg-[#0E1B33]/80 backdrop-blur-xl p-12 rounded-[4rem] border border-white dark:border-blue-900/50 shadow-xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#9C2007] to-[#000055] rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2zm5.586-2H7a1 1 0 01-.707-.293l5.414-5.414a1 1 0 01.707.293l.414.414a1 1 0 01.293.707L6.586 16H9a1 1 0 001-1z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Service Pledge</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Our commitment to deliver exceptional service to every resident of Barangay Onse
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white/90 dark:bg-[#152747]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-blue-900/40 text-center hover:shadow-lg transition-all duration-500">
                <div className="text-3xl font-black text-[#9C2007] dark:text-rose-400 mb-3">✓</div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">&ldquo;Tapat na Serbisyo, Para sa Tao&rdquo;</p>
              </div>
              <div className="bg-white/90 dark:bg-[#152747]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-blue-900/40 text-center hover:shadow-lg transition-all duration-500">
                <div className="text-3xl font-black text-[#9C2007] dark:text-rose-400 mb-3">✓</div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">&ldquo;Mabilis, Malinis, Makataong Serbisyo&rdquo;</p>
              </div>
              <div className="bg-white/90 dark:bg-[#152747]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-blue-900/40 text-center hover:shadow-lg transition-all duration-500">
                <div className="text-3xl font-black text-[#9C2007] dark:text-rose-400 mb-3">✓</div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">&ldquo;Barangay Mo, Kaagapay Mo&rdquo;</p>
              </div>
              <div className="bg-white/90 dark:bg-[#152747]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/50 dark:border-blue-900/40 text-center hover:shadow-lg transition-all duration-500">
                <div className="text-3xl font-black text-[#9C2007] dark:text-rose-400 mb-3">✓</div>
                <p className="text-sm font-black text-slate-800 dark:text-slate-200 leading-tight">&ldquo;Kaagapay sa Bawat Hakbang, Serbisyong Barangay&rdquo;</p>
              </div>
            </div>

            {/* SOCIAL MEDIA SECTION */}
            <div className="border-t border-white/50 dark:border-blue-900/50 pt-12">
              <div className="text-center mb-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Connect With Us</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  Stay updated with our latest announcements and community activities
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/90 dark:bg-[#152747]/80 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 dark:border-blue-900/40 text-center hover:shadow-xl transition-all duration-500 group">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-slate-900 dark:text-white text-lg mb-1">Barangay Onse</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Official Facebook Page</p>
                    </div>
                  </div>
                  <a 
                    href="https://www.facebook.com/barangayonsesjcity" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#166FE5] transition-colors group-hover:scale-105 transition-transform"
                  >
                    Visit Page
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>

                <div className="bg-white/90 dark:bg-[#152747]/80 backdrop-blur-md p-8 rounded-[2rem] border border-white/50 dark:border-blue-900/40 text-center hover:shadow-xl transition-all duration-500 group">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#000055] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <h4 className="font-black text-slate-900 dark:text-white text-lg mb-1">SK Barangay Onse</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">Youth Council Facebook</p>
                    </div>
                  </div>
                  <a 
                    href="https://www.facebook.com/profile.php?id=100094839384187" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#000055] text-white px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#000080] transition-colors group-hover:scale-105 transition-transform"
                  >
                    Visit Page
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Link to Officials page */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-[#9C2007] to-[#000055] p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Meet Our Officials</h2>
              <p className="text-white/80 font-medium max-w-xl">
                View the Barangay Council and SK Council members serving Barangay Onse.
              </p>
            </div>
            <Link
              href="/officials"
              className="inline-flex items-center gap-2 bg-white text-[#9C2007] px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-rose-50 transition-colors shrink-0"
            >
              View Officials
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

