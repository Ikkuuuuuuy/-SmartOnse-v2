import React from 'react';
import prisma from '@/lib/prisma';
import SkCommunityHub from '@/components/sk/SkCommunityHub';

export const revalidate = 30;

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
    console.error('Error loading SK programs from DB:', e);
  }

  const allPrograms = programs && programs.length > 0 ? programs : FALLBACK_PROGRAMS;

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-20 px-4 sm:px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <SkCommunityHub initialPrograms={allPrograms} />
      </div>
    </div>
  );
}
