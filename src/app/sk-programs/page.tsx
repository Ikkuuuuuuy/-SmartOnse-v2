import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Trophy, BookOpen, Users, Leaf, HeartPulse, Sparkles, ArrowRight } from 'lucide-react';

export const revalidate = 60;

const FALLBACK_PROGRAMS = [
  {
    id: 'SK-PROG-01',
    title: 'SK Inter-Purok Youth Tournament 2026',
    category: 'Sports & Wellness',
    status: 'ACTIVE',
    objective: 'Promote healthy lifestyles, teamwork, and drug-free youth through inter-purok basketball and volleyball leagues.',
    targetAudience: 'Youth aged 15-30 residing in Barangay Onse',
    schedule: 'Every Saturday & Sunday • 2:00 PM - 7:00 PM',
    budget: 150000,
  },
  {
    id: 'SK-PROG-02',
    title: 'Onse Youth Academic Excellence & Educational Assistance',
    category: 'Education',
    status: 'OPEN',
    objective: 'Provide cash subsidies, school supplies, and digital learning modules for deserving senior high and college students.',
    targetAudience: 'Enrolled Onse High School & College Students',
    schedule: 'Quarterly Application & Distribution',
    budget: 250000,
  },
  {
    id: 'SK-PROG-03',
    title: 'Katipunan ng Kabataan (KK) Youth Summit',
    category: 'Governance & Leadership',
    status: 'UPCOMING',
    objective: 'Engage youth in local governance, participatory budgeting, and anti-drug advocacy (YADAS) workshops.',
    targetAudience: 'All registered Katipunan ng Kabataan members',
    schedule: 'September 2026 • Onse Multi-Purpose Court',
    budget: 85000,
  },
  {
    id: 'SK-PROG-04',
    title: 'Green Onse: Youth Clean-Up & Tree Planting Drive',
    category: 'Environment',
    status: 'UPCOMING',
    objective: 'Community tree-planting, plastic recycling awareness, and drainage clean-up in partnership with DENR.',
    targetAudience: 'SK Volunteers & Community Youth Groups',
    schedule: 'Last Saturday of the Month • 6:00 AM',
    budget: 45000,
  },
  {
    id: 'SK-PROG-05',
    title: 'Digital Arts, Media & Tech Innovation Workshop',
    category: 'Skills & Livelihood',
    status: 'ACTIVE',
    objective: 'Free graphic design, video editing, and coding bootcamps for aspiring youth freelancers and digital creators.',
    targetAudience: 'Onse Out-of-School Youth & Students',
    schedule: 'Bi-weekly Sessions at the SK Digital Hub',
    budget: 120000,
  },
  {
    id: 'SK-PROG-06',
    title: 'Youth Mental Health & Resilience Awareness',
    category: 'Health & Wellness',
    status: 'ACTIVE',
    objective: 'Safe space counseling, stress management seminars, and peer-to-peer wellness support circles.',
    targetAudience: 'Teens & Young Adults (15-24)',
    schedule: 'Monthly Wellness Forums',
    budget: 60000,
  },
];

export default async function SkProgramsPage() {
  let programs: any[] = [];
  try {
    programs = await prisma.skProgram.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.error(e);
  }

  const allPrograms = programs && programs.length > 0 ? programs : FALLBACK_PROGRAMS;

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Header Section */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Sangguniang Kabataan • San Juan City
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            SK Youth <span className="text-[#9C2007] dark:text-rose-500">Programs</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">
            Browse &amp; Participate in Youth Initiatives in Barangay Onse
          </p>
          <div className="h-1 w-20 bg-[#9C2007] mx-auto rounded-full"></div>
        </header>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white dark:bg-[#0E1B33] p-7 md:p-8 rounded-3xl sm:rounded-[2.5rem] shadow-xl border border-slate-200/80 dark:border-blue-900/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40">
                    {program.category}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full ${
                    program.status === 'ACTIVE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40'
                  }`}>
                    {program.status}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 leading-snug">
                  {program.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-6">
                  {program.objective}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-blue-900/40 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Target:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-right truncate max-w-[180px]">{program.targetAudience}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Schedule:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200 text-right truncate max-w-[180px]">{program.schedule}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">Budget Allocation:</span>
                  <span className="font-black text-[#9C2007] dark:text-rose-400">₱{program.budget.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
