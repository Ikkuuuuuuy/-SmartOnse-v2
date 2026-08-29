import React from 'react';
import { barangayMap, nearbyServiceCategories } from '@/data/nearbyServices';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="mb-16 text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
              Emergency <span className="text-[#9C2007] dark:text-rose-500">&amp; Contact</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-2">
              24/7 Hotlines, Office Information &amp; Location Map
            </p>
            <div className="h-1 w-20 bg-[#9C2007] mx-auto rounded-full"></div>
          </div>
        </header>

        {/* Emergency Hotlines */}
        <div className="mb-16">
          <div className="bg-white dark:bg-[#0E1B33] p-8 rounded-[2rem] shadow-2xl border-2 border-slate-200 dark:border-blue-900/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-3xl">🚨</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Emergency Hotlines</h2>
                <p className="text-slate-600 dark:text-slate-300 font-bold">Available 24/7 for urgent matters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-red-50 dark:bg-rose-950/40 border-2 border-red-200 dark:border-rose-900/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🚑</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Medical Emergency</h3>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-rose-400 mb-1">911</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">National Emergency</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-900/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">👮</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Barangay Hotline</h3>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">(02) 8123-4567</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Local Emergency</p>
              </div>
              <div className="bg-orange-50 dark:bg-amber-950/40 border-2 border-orange-200 dark:border-amber-900/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🔥</span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Fire Emergency</h3>
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-amber-400 mb-1">160</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">Fire Department</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="bg-white dark:bg-[#0E1B33] p-10 rounded-[3rem] shadow-xl border-2 border-slate-200 dark:border-blue-900/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#9C2007] rounded-full flex items-center justify-center">
                <span className="text-2xl">🏛️</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Barangay Hall</h2>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-[#9C2007] pl-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 mb-2">📍 Office Address</h3>
                <p className="text-slate-700 dark:text-slate-200 font-medium text-lg">{barangayMap.address}</p>
              </div>
              <div className="border-l-4 border-blue-600 pl-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">📞 Office Numbers</h3>
                <p className="text-slate-700 dark:text-slate-200 font-medium text-lg whitespace-pre-line">
                  {"Telephone: (02) 8123-4567\nMobile: +63 917 123 4567"}
                </p>
              </div>
              <div className="border-l-4 border-green-600 pl-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-green-600 dark:text-emerald-400 mb-2">✉️ Email</h3>
                <p className="text-slate-700 dark:text-slate-200 font-medium text-lg whitespace-pre-line">
                  {"admin@brgyonse.gov.ph\nhotlines@brgyonse.gov.ph"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0E1B33] p-10 rounded-[3rem] shadow-xl border-2 border-slate-200 dark:border-blue-900/50">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-[#9C2007] rounded-full flex items-center justify-center">
                <span className="text-2xl">🕐</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Office Hours</h2>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-[#152747] rounded-xl">
                <span className="font-bold text-slate-700 dark:text-slate-200">Monday - Friday</span>
                <span className="font-black text-[#9C2007] dark:text-rose-400">8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-rose-950/40 rounded-xl border-2 border-red-200 dark:border-rose-900/50">
                <span className="font-bold text-red-700 dark:text-rose-300">Saturday, Sunday &amp; Holidays</span>
                <span className="font-black text-red-600 dark:text-rose-400">CLOSED</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Embedded Map */}
        <div className="bg-white dark:bg-[#0E1B33] p-6 md:p-8 rounded-[3rem] shadow-xl border-2 border-slate-200 dark:border-blue-900/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#9C2007] rounded-full flex items-center justify-center">
              <span className="text-2xl">🗺️</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Find Us Here</h2>
          </div>
          <div className="w-full h-[520px] lg:h-[580px] rounded-3xl overflow-hidden border-2 border-slate-100 dark:border-blue-900/40 shadow-inner">
            <iframe
              src={barangayMap.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="mt-4 flex justify-end">
            <a
              href={barangayMap.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#9C2007] text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-[#800000] transition-colors shadow-lg shadow-[#9C2007]/20"
            >
              Get Directions
            </a>
          </div>
        </div>

        {/* Nearby Services Directory */}
        <div className="mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400">City Directory</span>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mt-1">Nearby Services in City of San Juan</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Common facilities across the city</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyServiceCategories.map((category: any) => (
              <div key={category.id} className="bg-white dark:bg-[#0E1B33] rounded-3xl border-2 border-slate-200 dark:border-blue-900/50 shadow-xl p-6 hover:border-[#9C2007]/30 transition-colors">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-blue-900/40">
                  <span className="text-2xl">{category.icon}</span>
                  <h3 className="font-black text-slate-900 dark:text-white text-lg">{category.title} ({category.places.length})</h3>
                </div>
                <ul className="space-y-3">
                  {category.places.map((place: any) => (
                    <li key={place.name} className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-slate-700 dark:text-slate-200 font-semibold">{place.name}</span>
                      <span className="text-slate-400 dark:text-slate-400 font-bold whitespace-nowrap text-xs bg-slate-100 dark:bg-[#152747] px-2 py-0.5 rounded-full">{place.distance}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
