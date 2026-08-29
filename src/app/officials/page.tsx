import React from 'react';
import prisma from '@/lib/prisma';
import OfficialCard from '@/components/officials/OfficialCard';
import { isSkOfficial } from '@/utils/officialImage';

export const revalidate = 60;

const FALLBACK_OFFICIALS = [
  // Sangguniang Barangay
  {
    id: 1,
    name: 'Hon. Roberto B. Alba',
    position: 'Punong Barangay (Captain)',
    committee: 'Executive & Peace and Order',
    contact: '0917-888-0011',
    avatarUrl: '/images/Chairman.webp',
  },
  {
    id: 2,
    name: 'Hon. Danilo A. Florano',
    position: 'Barangay Kagawad',
    committee: 'Committee on Public Works',
    contact: '0917-888-0012',
    avatarUrl: '/images/Dan.webp',
  },
  {
    id: 3,
    name: 'Hon. Zenaida C. Casao',
    position: 'Barangay Kagawad',
    committee: 'Committee on Health & Sanitation',
    contact: '0917-888-0013',
    avatarUrl: '/images/Zenaida.webp',
  },
  {
    id: 4,
    name: 'Hon. Ryan Lopez Lorbes',
    position: 'Barangay Kagawad',
    committee: 'Committee on Cleanliness & Environment',
    contact: '0917-888-0014',
    avatarUrl: '/images/Ryan.webp',
  },
  {
    id: 5,
    name: 'Hon. John Mark Cortez Daradal',
    position: 'Barangay Kagawad',
    committee: 'Committee on Ways and Means',
    contact: '0917-888-0015',
    avatarUrl: '/images/JM.webp',
  },
  {
    id: 6,
    name: 'Hon. Federico Soller Deniega',
    position: 'Barangay Kagawad',
    committee: 'Committee on Peace and Order',
    contact: '0917-888-0016',
    avatarUrl: '/images/Federico.webp',
  },
  {
    id: 7,
    name: 'Hon. Miguel Arguelles Zamora Jr.',
    position: 'Barangay Kagawad',
    committee: 'Committee on Education',
    contact: '0917-888-0017',
    avatarUrl: '/images/Miguel.webp',
  },
  {
    id: 8,
    name: 'Hon. Rafael Lasin Borjal Jr.',
    position: 'Barangay Kagawad',
    committee: 'Committee on Transportation & Traffic',
    contact: '0917-888-0018',
    avatarUrl: '/images/RAF.webp',
  },
  // Sangguniang Kabataan
  {
    id: 9,
    name: 'Hon. John Michael D. Permato',
    position: 'SK Chairperson',
    committee: 'Youth Leadership & Sports Development',
    contact: '0917-888-0019',
    avatarUrl: '/images/Permato.webp',
  },
  {
    id: 10,
    name: 'Michaelito Bongalos',
    position: 'SK Treasurer',
    committee: 'Youth Budget & Appropriations',
    contact: '0917-888-0020',
    avatarUrl: '/images/Bongalos.webp',
  },
  {
    id: 11,
    name: 'Jonathan D. Sorio',
    position: 'SK Secretary',
    committee: 'Youth Records & Secretariat',
    contact: '0917-888-0021',
    avatarUrl: '/images/Sorio.webp',
  },
  {
    id: 12,
    name: 'Hon. Abigail A. Reyes',
    position: 'SK Kagawad',
    committee: 'Committee on Health & Nutrition',
    contact: '0917-888-0022',
    avatarUrl: '/images/Mybaby.webp',
  },
  {
    id: 13,
    name: 'Hon. Ethan Jetter D.G. Garcia',
    position: 'SK Kagawad',
    committee: 'Committee on Education & Culture',
    contact: '0917-888-0023',
    avatarUrl: '/images/Garcia.webp',
  },
  {
    id: 14,
    name: 'Hon. Alexis Adrianne R. Luciano',
    position: 'SK Kagawad',
    committee: 'Committee on Digital Arts & Innovation',
    contact: '0917-888-0024',
    avatarUrl: '/images/Luciano.webp',
  },
  {
    id: 15,
    name: 'Hon. Sherric Q. Pantaleon',
    position: 'SK Kagawad',
    committee: 'Committee on Anti-Drug Abuse (YADAS)',
    contact: '0917-888-0025',
    avatarUrl: '/images/Sherric.webp',
  },
  {
    id: 16,
    name: 'Hon. Althea Nicole B. Panganiban',
    position: 'SK Kagawad',
    committee: 'Committee on Youth Livelihood & Skills',
    contact: '0917-888-0026',
    avatarUrl: '/images/Althea.webp',
  },
  {
    id: 17,
    name: 'Hon. John Paul G. Del Rosario',
    position: 'SK Kagawad',
    committee: 'Committee on Environmental Protection',
    contact: '0917-888-0027',
    avatarUrl: '/images/Del Rosario.webp',
  },
  {
    id: 18,
    name: 'Hon. Samantha Nicole S. Cruz',
    position: 'SK Kagawad',
    committee: 'Committee on Gender & Development',
    contact: '0917-888-0028',
    avatarUrl: '/images/Samantha.webp',
  },
];

export default async function OfficialsPage() {
  let officials: any[] = [];
  try {
    officials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (e) {
    console.error(e);
  }

  const allOfficials = officials && officials.length > 0 ? officials : FALLBACK_OFFICIALS;

  const barangayOfficials = allOfficials.filter((o) => !isSkOfficial({ role: o.position }));
  const skOfficials = allOfficials.filter((o) => isSkOfficial({ role: o.position }));

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
