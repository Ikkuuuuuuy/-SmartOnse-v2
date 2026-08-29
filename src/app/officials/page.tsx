import React from 'react';
import prisma from '@/lib/prisma';
import OfficialCard from '@/components/officials/OfficialCard';
import { isSkOfficial } from '@/utils/officialImage';

export const revalidate = 60;

export default async function OfficialsPage() {
  let officials: any[] = [];
  try {
    officials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (e) {
    console.error(e);
  }

  const barangayOfficials = officials.filter((o) => !isSkOfficial({ role: o.position }));
  const skOfficials = officials.filter((o) => isSkOfficial({ role: o.position }));

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="mb-16 text-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
              Barangay <span className="text-[#9C2007] dark:text-rose-500">Officials</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mb-2">
              Barangay Council &amp; Sangguniang Kabataan (SK) Leaders
            </p>
            <div className="h-1 w-20 bg-[#9C2007] mx-auto rounded-full"></div>
          </div>
        </header>


        <div className="space-y-20">
          <section>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Barangay Officials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {barangayOfficials.map((official) => (
                <OfficialCard key={official.id} official={official} accent="barangay" />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Sangguniang Kabataan (SK) Officials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {skOfficials.map((official) => (
                <OfficialCard key={official.id} official={official} accent="sk" />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
