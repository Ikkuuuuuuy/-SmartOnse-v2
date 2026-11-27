import React from 'react';
import prisma from '@/lib/prisma';
import AboutClient from '@/components/about/AboutClient';

export const revalidate = 60;

const FALLBACK_OFFICIALS = [
  // Sangguniang Barangay
  {
    id: 'brgy-01',
    name: 'Hon. Roberto B. Alba',
    position: 'Barangay Chairman',
    committee: 'Executive & Peace and Order',
    avatarUrl: '/images/Chairman.webp',
  },
  {
    id: 'brgy-02',
    name: 'Elena V. Gutierrez',
    position: 'Barangay Treasurer',
    committee: 'Finance, Budget & Appropriations',
    avatarUrl: '/images/barangay-onse-seal.png',
  },
  {
    id: 'brgy-03',
    name: 'Maria Elena C. Gomez',
    position: 'Barangay Secretary',
    committee: 'Secretariat & Administrative Records',
    avatarUrl: '/images/barangay-onse-seal.png',
  },
  {
    id: 'brgy-04',
    name: 'Hon. Danilo A. Florano',
    position: 'Barangay Kagawad',
    committee: 'Committee on Public Works & Infrastructure',
    avatarUrl: '/images/Dan.webp',
  },
  {
    id: 'brgy-05',
    name: 'Hon. Zenaida C. Casao',
    position: 'Barangay Kagawad',
    committee: 'Committee on Health & Sanitation',
    avatarUrl: '/images/Zenaida.webp',
  },
  {
    id: 'brgy-06',
    name: 'Hon. Ryan Lopez Lorbes',
    position: 'Barangay Kagawad',
    committee: 'Committee on Cleanliness & Environment',
    avatarUrl: '/images/Ryan.webp',
  },
  {
    id: 'brgy-07',
    name: 'Hon. John Mark Cortez Daradal',
    position: 'Barangay Kagawad',
    committee: 'Committee on Ways and Means',
    avatarUrl: '/images/JM.webp',
  },
  {
    id: 'brgy-08',
    name: 'Hon. Federico Soller Deniega',
    position: 'Barangay Kagawad',
    committee: 'Committee on Peace and Order',
    avatarUrl: '/images/Federico.webp',
  },
  {
    id: 'brgy-09',
    name: 'Hon. Miguel Arguelles Zamora Jr.',
    position: 'Barangay Kagawad',
    committee: 'Committee on Education & Culture',
    avatarUrl: '/images/Miguel.webp',
  },
  {
    id: 'brgy-10',
    name: 'Hon. Rafael Lasin Borjal Jr.',
    position: 'Barangay Kagawad',
    committee: 'Committee on Transportation & Traffic',
    avatarUrl: '/images/RAF.webp',
  },

  // Sangguniang Kabataan
  {
    id: 'sk-01',
    name: 'Hon. John Michael D. Permato',
    position: 'SK Chairperson',
    committee: 'Youth Leadership & Sports Development',
    avatarUrl: '/images/Permato.webp',
  },
  {
    id: 'sk-02',
    name: 'Michaelito Bongalos',
    position: 'SK Treasurer',
    committee: 'Youth Budget & Appropriations',
    avatarUrl: '/images/Bongalos.webp',
  },
  {
    id: 'sk-03',
    name: 'Jonathan D. Sorio',
    position: 'SK Secretary',
    committee: 'Youth Records & Secretariat',
    avatarUrl: '/images/Sorio.webp',
  },
  {
    id: 'sk-04',
    name: 'Hon. Abigail A. Reyes',
    position: 'SK Kagawad',
    committee: 'Committee on Health & Nutrition',
    avatarUrl: '/images/Mybaby.webp',
  },
  {
    id: 'sk-05',
    name: 'Hon. Ethan Jetter D.G. Garcia',
    position: 'SK Kagawad',
    committee: 'Committee on Education & Culture',
    avatarUrl: '/images/Garcia.webp',
  },
  {
    id: 'sk-06',
    name: 'Hon. Alexis Adrianne R. Luciano',
    position: 'SK Kagawad',
    committee: 'Committee on Digital Arts & Innovation',
    avatarUrl: '/images/Luciano.webp',
  },
  {
    id: 'sk-07',
    name: 'Hon. Sherric Q. Pantaleon',
    position: 'SK Kagawad',
    committee: 'Committee on Anti-Drug Abuse (YADAS)',
    avatarUrl: '/images/Sherric.webp',
  },
  {
    id: 'sk-08',
    name: 'Hon. Sherwin Reyes',
    position: 'SK Kagawad',
    committee: 'Committee on Environmental Protection',
    avatarUrl: '/images/Reyes.webp',
  },
  {
    id: 'sk-09',
    name: 'Hon. Ian Jeffrey L. Cadiang',
    position: 'SK Kagawad',
    committee: 'Committee on Youth Livelihood & Skills',
    avatarUrl: '/images/Cadiang.webp',
  },
  {
    id: 'sk-10',
    name: 'Hon. Joshua D. Munsayac',
    position: 'SK Kagawad',
    committee: 'Committee on Disaster Preparedness',
    avatarUrl: '/images/Munsayac.webp',
  },
];

export default async function AboutPage() {
  let stats: any[] = [];
  try {
    stats = await prisma.barangayStatistic.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (e) {
    console.error('Failed to load stats:', e);
  }

  let dbOfficials: any[] = [];
  try {
    dbOfficials = await prisma.barangayOfficial.findMany({
      orderBy: { order: 'asc' },
    });
  } catch (e) {
    console.error('Failed to load officials:', e);
  }

  const officials = dbOfficials && dbOfficials.length > 0 ? dbOfficials : FALLBACK_OFFICIALS;

  return <AboutClient stats={stats} officials={officials} />;
}
