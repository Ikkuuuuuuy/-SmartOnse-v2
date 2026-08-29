import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding full exact SmartOnse database with RBAC roles...');

  // 18 Official Council & SK Leaders
  const officials = [
    { name: 'Hon. Roberto B. Alba', position: 'Punong Barangay', committee: 'Executive & Peace and Order', order: 1, contact: '0917-888-0011', term: '2023-2026', avatarUrl: '/images/Chairman.webp' },
    { name: 'Hon. Danilo A. Florano', position: 'Barangay Kagawad', committee: 'Committee on Public Works', order: 2, contact: '0917-888-0012', term: '2023-2026', avatarUrl: '/images/Dan.webp' },
    { name: 'Hon. Zenaida C. Casao', position: 'Barangay Kagawad', committee: 'Committee on Health & Sanitation', order: 3, contact: '0917-888-0013', term: '2023-2026', avatarUrl: '/images/Zenaida.webp' },
    { name: 'Hon. Ryan Lopez Lorbes', position: 'Barangay Kagawad', committee: 'Committee on Cleanliness & Environment', order: 4, contact: '0917-888-0014', term: '2023-2026', avatarUrl: '/images/Ryan.webp' },
    { name: 'Hon. John Mark Cortez Daradal', position: 'Barangay Kagawad', committee: 'Committee on Ways and Means', order: 5, contact: '0917-888-0015', term: '2023-2026', avatarUrl: '/images/JM.webp' },
    { name: 'Hon. Federico Soller Deniega', position: 'Barangay Kagawad', committee: 'Committee on Peace and Order', order: 6, contact: '0917-888-0016', term: '2023-2026', avatarUrl: '/images/Federico.webp' },
    { name: 'Hon. Miguel Arguelles Zamora Jr.', position: 'Barangay Kagawad', committee: 'Committee on Education', order: 7, contact: '0917-888-0017', term: '2023-2026', avatarUrl: '/images/Miguel.webp' },
    { name: 'Hon. Rafael Lasin Borjal Jr.', position: 'Barangay Kagawad', committee: 'Committee on Transportation & Traffic', order: 8, contact: '0917-888-0018', term: '2023-2026', avatarUrl: '/images/RAF.webp' },
    // SK Officials
    { name: 'Hon. John Michael D. Permato', position: 'SK Chairman', committee: 'Youth Leadership & Sports', order: 9, contact: '0917-888-0019', term: '2023-2026', avatarUrl: '/images/Permato.webp' },
    { name: 'Michaelito Bongalos', position: 'SK Treasurer', committee: 'Youth Budget & Appropriations', order: 10, contact: '0917-888-0020', term: '2023-2026', avatarUrl: '/images/Bongalos.webp' },
    { name: 'Jonathan D. Sorio', position: 'SK Secretary', committee: 'Youth Records & Secretariat', order: 11, contact: '0917-888-0021', term: '2023-2026', avatarUrl: '/images/Sorio.webp' },
    { name: 'Hon. Abigail A. Reyes', position: 'SK Kagawad', committee: 'Committee on Health & Nutrition', order: 12, contact: '0917-888-0022', term: '2023-2026', avatarUrl: '/images/Mybaby.webp' },
    { name: 'Hon. Ethan Jetter D.G. Garcia', position: 'SK Kagawad', committee: 'Committee on Education & Culture', order: 13, contact: '0917-888-0023', term: '2023-2026', avatarUrl: '/images/Garcia.webp' },
    { name: 'Hon. Alexis Adrianne R. Luciano', position: 'SK Kagawad', committee: 'Committee on Digital Arts & Innovation', order: 14, contact: '0917-888-0024', term: '2023-2026', avatarUrl: '/images/Luciano.webp' },
    { name: 'Hon. Sherric Q. Pantaleon', position: 'SK Kagawad', committee: 'Committee on Sports Development', order: 15, contact: '0917-888-0025', term: '2023-2026', avatarUrl: '/images/Pantaleon.webp' },
    { name: 'Hon. Sherwin Reyes', position: 'SK Kagawad', committee: 'Committee on Environmental Protection', order: 16, contact: '0917-888-0026', term: '2023-2026', avatarUrl: '/images/Reyes.webp' },
    { name: 'Hon. Ian Jeffrey L. Cadiang', position: 'SK Kagawad', committee: 'Committee on Anti-Drug Abuse Youth Campaign', order: 17, contact: '0917-888-0027', term: '2023-2026', avatarUrl: '/images/Cadiang.webp' },
    { name: 'Hon. Joshua D. Munsayac', position: 'SK Kagawad', committee: 'Committee on Disaster Preparedness', order: 18, contact: '0917-888-0028', term: '2023-2026', avatarUrl: '/images/Munsayac.webp' },
  ];

  await prisma.barangayOfficial.deleteMany();
  for (const off of officials) {
    await prisma.barangayOfficial.create({ data: off });
  }

  // Statistics
  const stats = [
    { label: 'Population', value: '3,824', subtext: 'Total registered residents', icon: '👥', order: 1 },
    { label: 'Registered Voters', value: '1,250', subtext: 'COMELEC statistics 2023', icon: '🗳️', order: 2 },
    { label: 'Active Businesses', value: '412', subtext: 'Local establishments in Onse', icon: '🏢', order: 3 },
    { label: 'Citizen Inquiries', value: '12,500+', subtext: 'Queries handled by SmartOnse AI', icon: '💬', order: 4 },
  ];

  await prisma.barangayStatistic.deleteMany();
  for (const st of stats) {
    await prisma.barangayStatistic.create({ data: st });
  }

  // Document Types
  const docTypes = [
    {
      code: 'BRGY_CLEARANCE',
      name: 'Barangay Clearance',
      description: 'Official clearance certifying residency and good moral standing for employment, legal needs, or business.',
      fee: 50.0,
      processingDays: 1,
      requirements: JSON.stringify(['Valid Government ID or School ID', 'Proof of residency (Utility Bill)', 'Community Tax Certificate (Cedula)']),
    },
    {
      code: 'CERT_RESIDENCY',
      name: 'Certificate of Residency',
      description: 'Document proving that the applicant is a bonafide resident of Barangay Onse.',
      fee: 30.0,
      processingDays: 1,
      requirements: JSON.stringify(['Valid ID with Barangay Onse address', 'Minimum 6 months residency']),
    },
    {
      code: 'CERT_INDIGENCY',
      name: 'Certificate of Indigency',
      description: 'Issued to low-income residents for medical, educational, legal, or financial assistance.',
      fee: 0.0,
      processingDays: 1,
      requirements: JSON.stringify(['Voter Certificate or Barangay ID', 'Hospital/School Referral assessment']),
    },
    {
      code: 'BUSINESS_PERMIT',
      name: 'Barangay Business Clearance',
      description: 'Required clearance for businesses operating within Barangay Onse.',
      fee: 250.0,
      processingDays: 2,
      requirements: JSON.stringify(['DTI or SEC Registration', 'Contract of Lease / Ownership Proof', 'Sanitary & Fire Permit']),
    },
  ];

  for (const dt of docTypes) {
    await prisma.documentType.upsert({
      where: { code: dt.code },
      update: dt,
      create: dt,
    });
  }

  // Transparency Board Documents
  const transparencyDocs = [
    {
      title: 'Barangay Annual Budget 2026 (Appropriation Ordinance)',
      category: 'Financial Budget',
      year: 2026,
      quarter: 'Annual',
      fileUrl: '#',
      publishedDate: new Date('2026-01-15'),
      fileSize: '2.4 MB',
    },
    {
      title: 'Quarterly Financial Statement - Q4 2025 (Income & Expenses)',
      category: 'Financial Statement',
      year: 2025,
      quarter: 'Q4',
      fileUrl: '#',
      publishedDate: new Date('2026-01-10'),
      fileSize: '1.8 MB',
    },
    {
      title: 'Annual Procurement Plan (APP) FY 2026',
      category: 'Procurement',
      year: 2026,
      quarter: 'Annual',
      fileUrl: '#',
      publishedDate: new Date('2026-01-05'),
      fileSize: '3.1 MB',
    },
    {
      title: 'Notice of Award - Multi-Purpose Hall Rehabilitation Project',
      category: 'Bids & Awards',
      year: 2025,
      quarter: 'Q4',
      fileUrl: '#',
      publishedDate: new Date('2025-12-20'),
      fileSize: '950 KB',
    },
    // SK Disclosure Docs
    {
      title: 'SK Annual Budget 2026 & Youth Development Fund',
      category: 'SK Financial',
      year: 2026,
      quarter: 'Annual',
      fileUrl: '#',
      publishedDate: new Date('2026-01-12'),
      fileSize: '1.9 MB',
    },
    {
      title: 'Annual Barangay Youth Investment Program (ABYIP 2026)',
      category: 'SK Investment Plan',
      year: 2026,
      quarter: 'Annual',
      fileUrl: '#',
      publishedDate: new Date('2026-01-08'),
      fileSize: '2.7 MB',
    },
    {
      title: 'Comprehensive Barangay Youth Development Plan (CBYDP 2024-2026)',
      category: 'SK Strategic Plan',
      year: 2024,
      quarter: 'Annual',
      fileUrl: '#',
      publishedDate: new Date('2024-01-10'),
      fileSize: '4.5 MB',
    },
    {
      title: 'SK Quarterly Financial Report - Q4 2025',
      category: 'SK Financial',
      year: 2025,
      quarter: 'Q4',
      fileUrl: '#',
      publishedDate: new Date('2026-01-14'),
      fileSize: '1.2 MB',
    },
  ];

  await prisma.transparencyDocument.deleteMany();
  for (const doc of transparencyDocs) {
    await prisma.transparencyDocument.create({ data: doc });
  }

  // Events & Announcements
  const events = [
    {
      title: 'General Barangay Assembly & State of the Barangay Address (SOBA)',
      category: 'barangay',
      description: 'Mandatory assembly for all residents of Barangay Onse to discuss local projects, budget utilization, peace and order, and upcoming community programs for 2026.',
      location: 'Barangay Onse Covered Court',
      eventDate: new Date('2026-09-15T09:00:00Z'),
      imageUrl: '/images/barangay-onse-seal.png',
      isFeatured: true,
    },
    {
      title: 'SK Inter-Barangay Basketball League & Youth Sportsfest 2026',
      category: 'sk',
      description: 'Annual youth sports tournament featuring basketball, volleyball, and e-sports tournaments with scholarship awards for outstanding student-athletes.',
      location: 'San Juan Sports Complex & Onse Court',
      eventDate: new Date('2026-09-20T14:00:00Z'),
      imageUrl: '/images/barangay-onse-seal.png',
      isFeatured: true,
    },
    {
      title: 'Free Anti-Rabies Vaccination & Pet Microchipping Drive',
      category: 'barangay',
      description: 'Free pet immunization campaign in partnership with the San Juan City Veterinary Office. Bring your cats and dogs for free vaccination and health check.',
      location: 'Barangay Onse Multi-Purpose Hall',
      eventDate: new Date('2026-09-28T08:00:00Z'),
      imageUrl: '/images/barangay-onse-seal.png',
      isFeatured: false,
    },
    {
      title: 'SK Digital Literacy & AI Coding Workshop for Onse Youth',
      category: 'sk',
      description: 'Free workshop series on computer basics, modern web skills, and safe digital citizenship for high school and college students in Barangay Onse.',
      location: 'Onse Youth Center / DigiParc',
      eventDate: new Date('2026-10-05T13:00:00Z'),
      imageUrl: '/images/barangay-onse-seal.png',
      isFeatured: false,
    },
    {
      title: 'Community Clean-Up Drive & Dengue Vector Control',
      category: 'barangay',
      description: 'Barangay-wide sanitation initiative and larvicide application to prevent dengue and maintain clean streets and waterways across Barangay Onse.',
      location: 'Assembly at Barangay Hall',
      eventDate: new Date('2026-10-12T06:00:00Z'),
      imageUrl: '/images/barangay-onse-seal.png',
      isFeatured: false,
    },
  ];

  await prisma.event.deleteMany();
  for (const ev of events) {
    await prisma.event.create({ data: ev });
  }

  // SK Programs
  const skPrograms = [
    {
      title: 'SK Educational Assistance & Scholarship Grant 2026',
      category: 'Education & Academics',
      objective: 'Provide semesterly financial subsidies and book allowances to deserving indigent college and high school scholars residing in Barangay Onse.',
      targetAudience: 'Youth residents aged 15-30 enrolled in recognized institutions',
      budget: 250000.0,
      status: 'Active / Accepting Applications',
      schedule: 'Year-Round / Per Semester',
    },
    {
      title: 'Youth Leadership & Nation-Building Summit',
      category: 'Leadership & Good Governance',
      objective: 'Train youth leaders in parliamentary procedures, project planning, disaster response, and active civic participation in local governance.',
      targetAudience: 'Youth council officers, student leaders, and SK volunteers',
      budget: 120000.0,
      status: 'Ongoing',
      schedule: 'Quarterly Assemblies',
    },
    {
      title: 'Anti-Drug Abuse & Mental Health Wellness Campaign (Barkada Kontra Droga)',
      category: 'Health & Youth Protection',
      objective: 'Promote mental health support groups, stress-management art therapy, and drug-free lifestyle awareness among Onse teenagers.',
      targetAudience: 'All youth and adolescent constituents',
      budget: 85000.0,
      status: 'Active',
      schedule: 'Monthly Sessions',
    },
    {
      title: 'Eco-Youth Green Movement & Tree Planting Project',
      category: 'Environmental Protection',
      objective: 'Encourage urban gardening, recycling incentives, and tree planting along community roads and pocket parks.',
      targetAudience: 'Youth volunteers and community youth orgs',
      budget: 60000.0,
      status: 'Active',
      schedule: 'Bi-Monthly',
    },
  ];

  await prisma.skProgram.deleteMany();
  for (const sk of skPrograms) {
    await prisma.skProgram.create({ data: sk });
  }

  // 7 RBAC User Roles from original SmartOnse
  const users = [
    {
      name: 'Wayne Superadmin',
      email: 'superadmin@smartonse.com',
      password: 'password123',
      role: 'super_admin',
      isVerified: true,
      address: 'Barangay Onse, San Juan City',
      phone: '0917-111-0001',
    },
    {
      name: 'Hon. Roberto B. Alba (Chairman)',
      email: 'testchairman@smartonse.com',
      password: 'password123',
      role: 'barangay_captain',
      isVerified: true,
      address: 'Barangay Hall, Onse, San Juan City',
      phone: '0917-111-0002',
    },
    {
      name: 'Hon. Danilo A. Florano (Kagawad)',
      email: 'kagawad@smartonse.com',
      password: 'password123',
      role: 'barangay_councilor',
      isVerified: true,
      address: 'Barangay Onse, San Juan City',
      phone: '0917-111-0003',
    },
    {
      name: 'Hon. John Michael Permato (SK Chair)',
      email: 'testskchairperson@smartonse.com',
      password: 'password123',
      role: 'sk_chairperson',
      isVerified: true,
      address: 'SK Hall, Onse, San Juan City',
      phone: '0917-111-0004',
    },
    {
      name: 'Hon. Abigail Reyes (SK Kagawad)',
      email: 'skkagawad@smartonse.com',
      password: 'password123',
      role: 'sk_councilor',
      isVerified: true,
      address: 'Barangay Onse, San Juan City',
      phone: '0917-111-0005',
    },
    {
      name: 'Onse Admin Desk Staff',
      email: 'admin@smartonse.com',
      password: 'password123',
      role: 'staff',
      isVerified: true,
      address: 'Barangay Hall Desk, Onse, San Juan City',
      phone: '0917-111-0006',
    },
    {
      name: 'Juan Dela Cruz (Resident)',
      email: 'testresident@smartonse.com',
      password: 'password123',
      role: 'resident',
      isVerified: true,
      address: '3 J V Panganiban, Barangay Onse, San Juan City',
      phone: '0917-111-0007',
    },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }

  console.log('✅ Full database seeded with all 7 RBAC roles and records!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
