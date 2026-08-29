'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<any | null>(null);

  const services = [
    {
      id: 1,
      title: 'Barangay Clearance',
      description: 'Official clearance certifying residency and good moral standing for employment, legal needs, or business requirements.',
      icon_svg: '📄',
      fee: '₱50.00',
      turnaround: '1 Business Day',
      requirements: [
        'Valid Government ID or Student ID with photo',
        'Proof of residency (Utility bill / Barangay certificate)',
        'Community Tax Certificate (Cedula)',
      ],
    },
    {
      id: 2,
      title: 'Certificate of Residency',
      description: 'Official certificate verifying that the applicant is a bonafide resident of Barangay Onse.',
      icon_svg: '🏠',
      fee: '₱30.00',
      turnaround: '1 Business Day',
      requirements: [
        'Valid ID with Barangay Onse residential address',
        'Minimum 6 months continuous residency verification',
      ],
    },
    {
      id: 3,
      title: 'Certificate of Indigency',
      description: 'Official certificate issued to low-income residents for medical, educational, legal, or financial assistance.',
      icon_svg: '📝',
      fee: 'FREE',
      turnaround: 'Same Day / 24 Hours',
      requirements: [
        'Barangay ID or Voter Certificate',
        'Hospital, School, or DSWD Referral Assessment slip',
      ],
    },
    {
      id: 4,
      title: 'Barangay Business Permit',
      description: 'Required clearance for commercial establishments and micro-businesses operating within Barangay Onse.',
      icon_svg: '💼',
      fee: '₱250.00',
      turnaround: '2 Business Days',
      requirements: [
        'DTI or SEC Certificate of Registration',
        'Contract of Lease or Proof of Property Ownership',
        'Sanitary and Fire Safety Inspection clearance',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="mb-16 text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
              Barangay <span className="text-[#9C2007] dark:text-rose-500">E-Services</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-2">
              Digitized &amp; Streamlined Resident Document Requests
            </p>
            <div className="h-1 w-20 bg-[#9C2007] mx-auto rounded-full"></div>
          </div>
        </header>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-[#0E1B33] p-8 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-blue-900/50 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
            >
              <div>
                <div className="w-16 h-16 bg-red-50 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-400 rounded-3xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  {service.icon_svg}
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-xl mb-3 leading-tight group-hover:text-[#9C2007] dark:group-hover:text-rose-400 transition-colors">
                  {service.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-6 font-medium">
                  {service.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-blue-900/40">
                <div className="flex justify-between items-center text-xs mb-4">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">Fee:</span>
                  <span className="font-black text-[#9C2007] dark:text-rose-400">{service.fee}</span>
                </div>
                <div className="flex justify-between items-center text-xs mb-6">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">Processing:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{service.turnaround}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/portal/request?type=${encodeURIComponent(service.title)}`}
                    className="w-full text-center bg-[#9C2007] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-[#9C2007]/20"
                  >
                    Request Online &rarr;
                  </Link>
                  <button
                    onClick={() => setSelectedService(service)}
                    className="w-full bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1C335C] text-slate-700 dark:text-slate-200 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer"
                  >
                    View Requirements
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Requirements Modal */}
        {selectedService && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-white dark:bg-[#0E1B33] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-blue-900/60 max-w-lg w-full rounded-[3.5rem] p-8 md:p-12 shadow-2xl relative">
              <button
                onClick={() => setSelectedService(null)}
                className="absolute top-8 right-8 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center font-black text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                ✕
              </button>

              <div className="text-3xl mb-4">{selectedService.icon_svg}</div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{selectedService.title}</h2>
              <p className="text-slate-500 dark:text-slate-300 text-xs mb-6 font-medium">{selectedService.description}</p>

              <h3 className="text-xs font-black uppercase tracking-wider text-[#9C2007] dark:text-rose-400 mb-3">Required Documents:</h3>
              <ul className="space-y-2 mb-8">
                {selectedService.requirements.map((req: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span className="text-[#9C2007] dark:text-rose-400 font-bold">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <Link
                  href={`/portal/request?type=${encodeURIComponent(selectedService.title)}`}
                  className="flex-1 text-center bg-[#9C2007] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg shadow-[#9C2007]/20"
                >
                  Proceed to Request
                </Link>
                <button
                  onClick={() => setSelectedService(null)}
                  className="bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1C335C] text-slate-700 dark:text-slate-200 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
