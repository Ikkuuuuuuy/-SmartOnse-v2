import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import OfficialCard from '@/components/officials/OfficialCard';
import { isSkOfficial, sortOfficialsByHierarchy } from '@/utils/officials';
import { Shield, Sparkles, Building2, Users, ArrowRight } from 'lucide-react';

export const revalidate = 60;

const FALLBACK_OFFICIALS = [
  // Sangguniang Barangay
  {
    id: 'brgy-01',
    name: 'Hon. Roberto B. Alba',
    position: 'Punong Barangay (Captain)',
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

export default async function OfficialsPage() {
  let dbOfficials: any[] = [];
  try {
    dbOfficials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (e) {
    console.error('Failed to fetch officials from DB:', e);
  }

  const allOfficials = dbOfficials && dbOfficials.length > 0 ? dbOfficials : FALLBACK_OFFICIALS;

  // Filter and sort by strict hierarchy:
  // Chairman (1) -> Treasurer (2) -> Secretary (3) -> Kagawads (4)
  const barangayOfficials = sortOfficialsByHierarchy(
    allOfficials.filter((o) => !isSkOfficial({ role: o.position, position: o.position, category: o.category }))
  );

  const skOfficials = sortOfficialsByHierarchy(
    allOfficials.filter((o) => isSkOfficial({ role: o.position, position: o.position, category: o.category }))
  );

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-24 px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-16">

        {/* Header Section */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 text-[#9C2007] dark:text-rose-300 text-[10px] font-black uppercase tracking-widest shadow-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>Official Civic Leadership Directory</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            Barangay <span className="text-[#9C2007] dark:text-rose-500">Officials</span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-medium leading-relaxed">
            The dedicated public servants and youth leaders guiding Barangay Onse, City of San Juan. 
            Structured in service hierarchy: <span className="font-bold text-slate-900 dark:text-white">Chairman &bull; Treasurer &bull; Secretary &bull; Kagawads</span>.
          </p>

          <div className="h-1 w-24 bg-gradient-to-r from-[#9C2007] to-amber-500 mx-auto rounded-full"></div>

          {/* Quick jumps */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#barangay-council"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/50 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-[#9C2007] dark:hover:text-rose-400 hover:border-[#9C2007] transition-all shadow-xs"
            >
              <Building2 className="w-3.5 h-3.5 text-[#9C2007]" />
              <span>Barangay Council ({barangayOfficials.length})</span>
            </a>
            <a
              href="#sk-council"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/50 text-xs font-black uppercase text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500 transition-all shadow-xs"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>SK Council ({skOfficials.length})</span>
            </a>
            <Link
              href="/about"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              <span>About Barangay</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Sangguniang Barangay Section */}
        <section id="barangay-council" className="scroll-mt-32 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-blue-900/50">
            <div>
              <div className="flex items-center gap-2 text-[#9C2007] dark:text-rose-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
                <Building2 className="w-4 h-4" />
                <span>Sangguniang Barangay</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Barangay Council Officials
              </h2>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Presiding: <span className="font-bold text-slate-800 dark:text-slate-200">Hon. Roberto B. Alba</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {barangayOfficials.map((official) => (
              <OfficialCard key={official.id} official={official} accent="barangay" />
            ))}
          </div>
        </section>

        {/* Sangguniang Kabataan Section */}
        <section id="sk-council" className="scroll-mt-32 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-blue-900/50">
            <div>
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Sangguniang Kabataan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                SK Youth Council Officials
              </h2>
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Presiding: <span className="font-bold text-slate-800 dark:text-slate-200">Hon. John Michael D. Permato</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
            {skOfficials.map((official) => (
              <OfficialCard key={official.id} official={official} accent="sk" />
            ))}
          </div>
        </section>

        {/* Civic Contact Strip */}
        <div className="bg-gradient-to-br from-[#9C2007] via-[#821804] to-[#000055] p-8 sm:p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/20">
              Frontline Public Assistance
            </span>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Need assistance from the Barangay Council?</h3>
            <p className="text-white/80 text-sm max-w-xl">
              File document requests, inquiries, or blotter concerns directly online through our 24/7 SmartOnse citizen portal.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/services"
              className="px-6 py-3.5 bg-white text-[#9C2007] rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-rose-50 transition shadow-lg"
            >
              Browse Services
            </Link>
            <Link
              href="/about"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition"
            >
              Learn More
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
