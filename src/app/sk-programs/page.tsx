import React from 'react';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export default async function SkProgramsPage() {
  let programs: any[] = [];
  try {
    programs = await prisma.skProgram.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="mb-16 text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
              SK Youth <span className="text-[#9C2007] dark:text-rose-500">Programs</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-2">
              Browse &amp; Participate in Youth Initiatives in Barangay Onse
            </p>
            <div className="h-1 w-20 bg-[#9C2007] mx-auto rounded-full"></div>
          </div>
        </header>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {programs.map((program) => (
            <div
              key={program.id}
              className="bg-white dark:bg-[#0E1B33] p-8 md:p-10 rounded-[3.5rem] shadow-xl border border-slate-100 dark:border-blue-900/50 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-[#000055]/10 dark:bg-blue-950/80 text-[#000055] dark:text-blue-300">
                    {program.category}
                  </span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                    {program.status}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight">
                  {program.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                  {program.objective}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-blue-900/40 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">Target Participants:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{program.targetAudience}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">Schedule:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{program.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-500 font-bold">Allocated Budget:</span>
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

