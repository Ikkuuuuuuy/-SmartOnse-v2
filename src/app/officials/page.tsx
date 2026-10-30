import React from 'react';
import prisma from '@/lib/prisma';
import OfficialsClient from '@/components/officials/OfficialsClient';
import { isSkOfficial, sortOfficialsByHierarchy } from '@/utils/officials';

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

  const barangayOfficials = sortOfficialsByHierarchy(
    allOfficials.filter((o) => !isSkOfficial({ role: o.position, position: o.position, category: o.category }))
  );

  const skOfficials = sortOfficialsByHierarchy(
    allOfficials.filter((o) => isSkOfficial({ role: o.position, position: o.position, category: o.category }))
  );

  return <OfficialsClient barangayOfficials={barangayOfficials} skOfficials={skOfficials} />;
}
