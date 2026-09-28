import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  // Document Types - 6 Official Services
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
      code: 'FIRST_TIME_JOBSEEKER',
      name: 'First Time Jobseeker Certificate',
      description: 'Waives government pre-employment document fees under Republic Act No. 11261 for entry-level job applicants.',
      fee: 0.0,
      processingDays: 1,
      requirements: JSON.stringify(['Barangay Oath of Undertaking', 'Valid School ID or PSA Birth Certificate', 'Proof of Barangay Onse residency']),
    },
    {
      code: 'BUSINESS_CLEARANCE',
      name: 'Barangay Business Clearance',
      description: 'Required clearance for businesses operating within Barangay Onse.',
      fee: 250.0,
      processingDays: 2,
      requirements: JSON.stringify(['DTI or SEC Registration', 'Contract of Lease / Ownership Proof', 'Sanitary & Fire Permit']),
    },
    {
      code: 'BUSINESS_PERMIT',
      name: 'Barangay Business Clearance (Permit)',
      description: 'Required clearance for businesses operating within Barangay Onse.',
      fee: 250.0,
      processingDays: 2,
      requirements: JSON.stringify(['DTI or SEC Registration', 'Contract of Lease / Ownership Proof', 'Sanitary & Fire Permit']),
    },
    {
      code: 'BLOTTER_REPORT',
      name: 'Barangay Incident / Blotter Certification',
      description: 'Official certification of recorded blotter, incident entry, or settlement before the Lupong Tagapamayapa.',
      fee: 100.0,
      processingDays: 1,
      requirements: JSON.stringify(['Valid Government ID', 'Blotter Case / Docket reference number', 'Personal appearance or Desk Officer interview']),
    },
  ];

  for (const dt of docTypes) {
    await prisma.documentType.upsert({
      where: { code: dt.code },
      update: dt,
      create: dt,
    });
  }

  // Services Catalog
  const publicServices = [
    {
      title: 'Barangay Clearance',
      category: 'General Issuance',
      description: 'Official clearance certifying residency and good moral standing for employment, legal needs, or business requirements.',
      fee: '₱50.00',
      requirements: 'Valid Government ID or Student ID with photo, Proof of residency (Utility bill / Barangay certificate), Community Tax Certificate (Cedula)',
      processingTime: '1 Business Day',
      order: 1,
    },
    {
      title: 'Certificate of Residency',
      category: 'Civil Verification',
      description: 'Official certificate verifying that the applicant is a bonafide resident of Barangay Onse.',
      fee: '₱30.00',
      requirements: 'Valid ID with Barangay Onse residential address, Minimum 6 months continuous residency verification',
      processingTime: '1 Business Day',
      order: 2,
    },
    {
      title: 'Certificate of Indigency',
      category: 'Social Welfare & Health',
      description: 'Official certificate issued to low-income residents for medical, educational, legal, or financial assistance.',
      fee: 'FREE',
      requirements: 'Barangay ID or Voter Certificate, Hospital, School, or DSWD Referral Assessment slip',
      processingTime: 'Same Day',
      order: 3,
    },
    {
      title: 'First-Time Jobseeker Certificate',
      category: 'Youth & Employment Aid',
      description: 'Waives government pre-employment document fees under Republic Act No. 11261 for entry-level applicants.',
      fee: 'FREE (R.A. 11261)',
      requirements: 'Barangay Oath of Undertaking, Valid School ID or PSA Birth Certificate, Proof of Barangay Onse residency',
      processingTime: 'Same Day',
      order: 4,
    },
    {
      title: 'Barangay Business Clearance',
      category: 'Commerce & Permits',
      description: 'Required commercial clearance for business establishments and micro-enterprises operating within Barangay Onse.',
      fee: '₱250.00',
      requirements: 'DTI or SEC Certificate of Registration, Contract of Lease or Proof of Property Ownership, Sanitary and Fire Safety Inspection clearance',
      processingTime: '2 Business Days',
      order: 5,
    },
    {
      title: 'Barangay Incident / Blotter Certification',
      category: 'Peace & Order',
      description: 'Official certification of recorded blotter, incident entry, or settlement before the Lupong Tagapamayapa.',
      fee: '₱100.00',
      requirements: 'Valid Government ID of complainant or authorized party, Blotter Case / Docket reference number, Personal appearance or verification with Desk Officer',
      processingTime: '24 Hours',
      order: 6,
    },
  ];

  await prisma.service.deleteMany();
  for (const s of publicServices) {
    await prisma.service.create({ data: s });
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
    // Official Barangay Onse Demo Accounts
    {
      name: 'Hon. Roberto Alba (Captain)',
      email: 'captain@onse.gov.ph',
      password: 'password123',
      role: 'barangay_captain',
      isVerified: true,
      address: 'Barangay Hall, Onse, San Juan City',
      phone: '0917-111-0002',
    },
    {
      name: 'Jonathan D. Sorio',
      email: 'records@onse.gov.ph',
      password: 'password123',
      role: 'staff',
      isVerified: true,
      address: 'Barangay Hall Desk, Onse, San Juan City',
      phone: '0917-111-0006',
    },
    {
      name: 'Hon. Danilo Florano',
      email: 'kagawad@onse.gov.ph',
      password: 'password123',
      role: 'barangay_councilor',
      isVerified: true,
      address: 'Barangay Onse, San Juan City',
      phone: '0917-111-0003',
    },
    {
      name: 'Hon. John Michael Permato',
      email: 'sk@onse.gov.ph',
      password: 'password123',
      role: 'sk_chairperson',
      isVerified: true,
      address: 'SK Hall, Onse, San Juan City',
      phone: '0917-111-0004',
    },
    {
      name: 'Juan Dela Cruz',
      email: 'juan@onse.ph',
      password: 'password123',
      role: 'resident',
      isVerified: true,
      address: '3 J V Panganiban, Barangay Onse, San Juan City',
      phone: '0917-111-0007',
    },
  ];

  const defaultHashedPassword = await bcrypt.hash('password123', 10);

  for (const u of users) {
    const userData = {
      ...u,
      password: defaultHashedPassword,
    };
    await prisma.user.upsert({
      where: { email: u.email },
      update: userData,
      create: userData,
    });
  }

  console.log('Seeding BarangayInhabitant (RBI) records...');
  await prisma.barangayInhabitant.deleteMany();

  const rbiRecords = [
    // === Household 1: Dela Cruz Family (Lt. Artiaga St.) ===
    {
      rbiNumber: 'RBI-2024-00001', firstName: 'Juan', middleName: 'Martinez', lastName: 'Dela Cruz',
      birthDate: new Date('1979-06-15'), age: 45, sex: 'Male', civilStatus: 'Married',
      religion: 'Roman Catholic', bloodType: 'O+',
      houseNumber: '145', street: 'Lt. Artiaga St.', precinct: 'PRECINCT-0042A', yearsOfResidency: 15,
      householdRole: 'Head', educationalAttainment: 'College Graduate',
      occupation: 'Jeepney Driver', employmentStatus: 'Self-Employed', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00002', firstName: 'Maria', middleName: 'Cruz', lastName: 'Dela Cruz',
      birthDate: new Date('1981-03-22'), age: 43, sex: 'Female', civilStatus: 'Married',
      religion: 'Roman Catholic', bloodType: 'A+',
      houseNumber: '145', street: 'Lt. Artiaga St.', precinct: 'PRECINCT-0042A', yearsOfResidency: 15,
      householdRole: 'Spouse', educationalAttainment: 'High School',
      occupation: 'Sari-sari Store Owner', employmentStatus: 'Self-Employed', monthlyIncome: '₱5,000-₱10,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00003', firstName: 'Jose', middleName: 'Juan', lastName: 'Dela Cruz',
      birthDate: new Date('2004-09-10'), age: 20, sex: 'Male', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'O+',
      houseNumber: '145', street: 'Lt. Artiaga St.', precinct: 'PRECINCT-0042A', yearsOfResidency: 15,
      householdRole: 'Child', educationalAttainment: 'College Level',
      occupation: 'Student', employmentStatus: 'Student', monthlyIncome: null,
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00004', firstName: 'Ana', middleName: 'Juan', lastName: 'Dela Cruz',
      birthDate: new Date('2008-12-01'), age: 16, sex: 'Female', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'A+',
      houseNumber: '145', street: 'Lt. Artiaga St.', precinct: 'PRECINCT-0042A', yearsOfResidency: 15,
      householdRole: 'Child', educationalAttainment: 'High School Level',
      occupation: 'Student', employmentStatus: 'Student', monthlyIncome: null,
      isRegisteredVoter: false, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 2: Santos Family (J.V. Panganiban St.) ===
    {
      rbiNumber: 'RBI-2024-00005', firstName: 'Roberto', middleName: 'Reyes', lastName: 'Santos',
      birthDate: new Date('1968-11-20'), age: 56, sex: 'Male', civilStatus: 'Married',
      religion: 'Roman Catholic', bloodType: 'B+',
      houseNumber: '88', street: 'J.V. Panganiban St.', precinct: 'PRECINCT-0042B', yearsOfResidency: 28,
      householdRole: 'Head', educationalAttainment: 'Vocational',
      occupation: 'Electrician', employmentStatus: 'Employed', monthlyIncome: '₱15,000-₱25,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00006', firstName: 'Luisa', middleName: 'Garcia', lastName: 'Santos',
      birthDate: new Date('1971-07-08'), age: 53, sex: 'Female', civilStatus: 'Married',
      religion: 'Roman Catholic', bloodType: 'O-',
      houseNumber: '88', street: 'J.V. Panganiban St.', precinct: 'PRECINCT-0042B', yearsOfResidency: 28,
      householdRole: 'Spouse', educationalAttainment: 'College Graduate',
      occupation: 'Public School Teacher', employmentStatus: 'Employed', monthlyIncome: '₱25,000-₱40,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 3: Ramos Family (F. Manalo St.) — Senior + 4Ps ===
    {
      rbiNumber: 'RBI-2024-00007', firstName: 'Teresita', middleName: 'Villanueva', lastName: 'Ramos',
      suffix: null, birthDate: new Date('1952-04-30'), age: 72, sex: 'Female', civilStatus: 'Widowed',
      religion: 'Roman Catholic', bloodType: 'AB+',
      houseNumber: '204', street: 'F. Manalo St.', precinct: 'PRECINCT-0044B', yearsOfResidency: 45,
      householdRole: 'Head', educationalAttainment: 'Elementary',
      occupation: 'None', employmentStatus: 'Retired', monthlyIncome: '₱0-₱5,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: true, is4psBeneficiary: true, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00008', firstName: 'Mark', middleName: 'Ramos', lastName: 'Aguilar',
      birthDate: new Date('1994-01-15'), age: 30, sex: 'Male', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'O+',
      houseNumber: '204', street: 'F. Manalo St.', precinct: 'PRECINCT-0044B', yearsOfResidency: 30,
      householdRole: 'Child', educationalAttainment: 'High School',
      occupation: 'Construction Worker', employmentStatus: 'Self-Employed', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 4: Ibarra Family (N. Domingo St.) ===
    {
      rbiNumber: 'RBI-2024-00009', firstName: 'Crisostomo', middleName: 'Antonio', lastName: 'Ibarra',
      birthDate: new Date('1982-08-25'), age: 42, sex: 'Male', civilStatus: 'Married',
      religion: 'Roman Catholic', bloodType: 'A-',
      houseNumber: '12', street: 'N. Domingo St.', precinct: 'PRECINCT-0043A', yearsOfResidency: 10,
      householdRole: 'Head', educationalAttainment: 'College Graduate',
      occupation: 'BPO Agent', employmentStatus: 'Employed', monthlyIncome: '₱25,000-₱40,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00010', firstName: 'Clara', middleName: 'Macaraeg', lastName: 'Ibarra',
      birthDate: new Date('1985-02-14'), age: 39, sex: 'Female', civilStatus: 'Married',
      religion: 'Roman Catholic', bloodType: 'B+',
      houseNumber: '12', street: 'N. Domingo St.', precinct: 'PRECINCT-0043A', yearsOfResidency: 10,
      householdRole: 'Spouse', educationalAttainment: 'Post-Graduate',
      occupation: 'Nurse (OFW)', employmentStatus: 'OFW', monthlyIncome: '₱60,000+',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00011', firstName: 'Emilio', middleName: 'Crisostomo', lastName: 'Ibarra',
      birthDate: new Date('2012-06-20'), age: 12, sex: 'Male', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'A-',
      houseNumber: '12', street: 'N. Domingo St.', precinct: 'PRECINCT-0043A', yearsOfResidency: 10,
      householdRole: 'Child', educationalAttainment: 'Elementary Level',
      occupation: 'Student', employmentStatus: 'Student', monthlyIncome: null,
      isRegisteredVoter: false, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 5: Florano Family (A. Luna St.) — PWD member ===
    {
      rbiNumber: 'RBI-2024-00012', firstName: 'Danilo', middleName: 'Aquino', lastName: 'Florano',
      birthDate: new Date('1971-05-18'), age: 53, sex: 'Male', civilStatus: 'Married',
      religion: 'Iglesia ni Cristo', bloodType: 'O+',
      houseNumber: '55', street: 'A. Luna St.', precinct: 'PRECINCT-0041A', yearsOfResidency: 32,
      householdRole: 'Head', educationalAttainment: 'College Graduate',
      occupation: 'Barangay Kagawad', employmentStatus: 'Government', monthlyIncome: '₱15,000-₱25,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00013', firstName: 'Grace', middleName: 'Bautista', lastName: 'Florano',
      birthDate: new Date('1974-09-03'), age: 50, sex: 'Female', civilStatus: 'Married',
      religion: 'Iglesia ni Cristo', bloodType: 'A+',
      houseNumber: '55', street: 'A. Luna St.', precinct: 'PRECINCT-0041A', yearsOfResidency: 25,
      householdRole: 'Spouse', educationalAttainment: 'High School',
      occupation: 'Housewife', employmentStatus: 'Unemployed', monthlyIncome: null,
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00014', firstName: 'Renz', middleName: 'Danilo', lastName: 'Florano',
      birthDate: new Date('2001-11-30'), age: 23, sex: 'Male', civilStatus: 'Single',
      religion: 'Iglesia ni Cristo', bloodType: 'O-',
      houseNumber: '55', street: 'A. Luna St.', precinct: 'PRECINCT-0041A', yearsOfResidency: 23,
      householdRole: 'Child', educationalAttainment: 'College Level',
      occupation: 'Freelance Graphic Designer', employmentStatus: 'Self-Employed', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: true, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 6: Salome (F. Manalo St.) — Solo Parent ===
    {
      rbiNumber: 'RBI-2024-00015', firstName: 'Elias', middleName: 'Tiago', lastName: 'Salome',
      birthDate: new Date('1990-07-22'), age: 34, sex: 'Male', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'B-',
      houseNumber: '204B', street: 'F. Manalo St.', precinct: 'PRECINCT-0042A', yearsOfResidency: 8,
      householdRole: 'Head', educationalAttainment: 'High School',
      occupation: 'Security Guard', employmentStatus: 'Employed', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: true,
    },
    {
      rbiNumber: 'RBI-2024-00016', firstName: 'Cardo', middleName: 'Elias', lastName: 'Salome',
      birthDate: new Date('2015-03-11'), age: 9, sex: 'Male', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'B+',
      houseNumber: '204B', street: 'F. Manalo St.', precinct: 'PRECINCT-0042A', yearsOfResidency: 8,
      householdRole: 'Child', educationalAttainment: 'Elementary Level',
      occupation: 'Student', employmentStatus: 'Student', monthlyIncome: null,
      isRegisteredVoter: false, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: true, isSoloParent: false,
    },

    // === Household 7: Sisa (Lt. Artiaga St.) — Senior + Widow ===
    {
      rbiNumber: 'RBI-2024-00017', firstName: 'Sisa', middleName: 'Tiago', lastName: 'Mendoza',
      birthDate: new Date('1958-01-07'), age: 66, sex: 'Female', civilStatus: 'Widowed',
      religion: 'Roman Catholic', bloodType: 'AB-',
      houseNumber: '77', street: 'Lt. Artiaga St.', precinct: 'PRECINCT-0044B', yearsOfResidency: 40,
      householdRole: 'Head', educationalAttainment: 'Elementary',
      occupation: 'Labandera', employmentStatus: 'Self-Employed', monthlyIncome: '₱0-₱5,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: true, is4psBeneficiary: true, isSoloParent: false,
    },

    // === Household 8: Reyes Family (Emilio Jacinto St.) ===
    {
      rbiNumber: 'RBI-2024-00018', firstName: 'Carlos', middleName: 'Pascual', lastName: 'Reyes',
      birthDate: new Date('1975-10-05'), age: 49, sex: 'Male', civilStatus: 'Married',
      religion: 'Born Again Christian', bloodType: 'A+',
      houseNumber: '33', street: 'Emilio Jacinto St.', precinct: 'PRECINCT-0043B', yearsOfResidency: 20,
      householdRole: 'Head', educationalAttainment: 'College Graduate',
      occupation: 'Accountant', employmentStatus: 'Employed', monthlyIncome: '₱40,000-₱60,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00019', firstName: 'Abigail', middleName: 'Pascual', lastName: 'Reyes',
      birthDate: new Date('2003-05-17'), age: 21, sex: 'Female', civilStatus: 'Single',
      religion: 'Born Again Christian', bloodType: 'O+',
      houseNumber: '33', street: 'Emilio Jacinto St.', precinct: 'PRECINCT-0043B', yearsOfResidency: 20,
      householdRole: 'Child', educationalAttainment: 'College Level',
      occupation: 'Student / Part-time Cashier', employmentStatus: 'Employed', monthlyIncome: '₱5,000-₱10,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00020', firstName: 'Sherwin', middleName: 'Carlos', lastName: 'Reyes',
      birthDate: new Date('2007-08-28'), age: 17, sex: 'Male', civilStatus: 'Single',
      religion: 'Born Again Christian', bloodType: 'A+',
      houseNumber: '33', street: 'Emilio Jacinto St.', precinct: 'PRECINCT-0043B', yearsOfResidency: 17,
      householdRole: 'Child', educationalAttainment: 'High School Level',
      occupation: 'Student', employmentStatus: 'Student', monthlyIncome: null,
      isRegisteredVoter: false, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 9: Macaraeg Family (Pinaglabanan St.) ===
    {
      rbiNumber: 'RBI-2024-00021', firstName: 'Rodrigo', middleName: 'Soria', lastName: 'Macaraeg',
      birthDate: new Date('1965-02-28'), age: 59, sex: 'Male', civilStatus: 'Married',
      religion: 'Roman Catholic', bloodType: 'B+',
      houseNumber: '9', street: 'Pinaglabanan St.', precinct: 'PRECINCT-0045A', yearsOfResidency: 35,
      householdRole: 'Head', educationalAttainment: 'High School',
      occupation: 'Tricycle Operator', employmentStatus: 'Self-Employed', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00022', firstName: 'Esperanza', middleName: 'Tan', lastName: 'Macaraeg',
      birthDate: new Date('1968-06-12'), age: 56, sex: 'Female', civilStatus: 'Married',
      religion: 'Roman Catholic', bloodType: 'O+',
      houseNumber: '9', street: 'Pinaglabanan St.', precinct: 'PRECINCT-0045A', yearsOfResidency: 30,
      householdRole: 'Spouse', educationalAttainment: 'College Graduate',
      occupation: 'Barangay Health Worker', employmentStatus: 'Government', monthlyIncome: '₱5,000-₱10,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 10: Pantaleon Family (M.H. Del Pilar St.) — PWD + 4Ps ===
    {
      rbiNumber: 'RBI-2024-00023', firstName: 'Sherric', middleName: 'Quinto', lastName: 'Pantaleon',
      birthDate: new Date('1998-12-05'), age: 26, sex: 'Male', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'A+',
      houseNumber: '67', street: 'M.H. Del Pilar St.', precinct: 'PRECINCT-0041B', yearsOfResidency: 26,
      householdRole: 'Child', educationalAttainment: 'College Graduate',
      occupation: 'SK Kagawad / Entrepreneur', employmentStatus: 'Self-Employed', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00024', firstName: 'Nena', middleName: 'Delos Santos', lastName: 'Pantaleon',
      birthDate: new Date('1972-03-14'), age: 52, sex: 'Female', civilStatus: 'Widowed',
      religion: 'Roman Catholic', bloodType: 'O-',
      houseNumber: '67', street: 'M.H. Del Pilar St.', precinct: 'PRECINCT-0041B', yearsOfResidency: 30,
      householdRole: 'Head', educationalAttainment: 'Elementary',
      occupation: 'Vendor', employmentStatus: 'Self-Employed', monthlyIncome: '₱5,000-₱10,000',
      isRegisteredVoter: true, isPwd: true, isSeniorCitizen: false, is4psBeneficiary: true, isSoloParent: true,
    },

    // === Household 11: Garcia Family (Kalayaan St.) ===
    {
      rbiNumber: 'RBI-2024-00025', firstName: 'Ethan', middleName: 'Jetter', lastName: 'Garcia',
      birthDate: new Date('2000-04-25'), age: 24, sex: 'Male', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'B+',
      houseNumber: '15', street: 'Kalayaan St.', precinct: 'PRECINCT-0045B', yearsOfResidency: 24,
      householdRole: 'Child', educationalAttainment: 'College Graduate',
      occupation: 'SK Kagawad / Content Creator', employmentStatus: 'Self-Employed', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00026', firstName: 'Manolo', middleName: 'Datu', lastName: 'Garcia',
      birthDate: new Date('1960-09-09'), age: 64, sex: 'Male', civilStatus: 'Married',
      religion: 'Roman Catholic', bloodType: 'A-',
      houseNumber: '15', street: 'Kalayaan St.', precinct: 'PRECINCT-0045B', yearsOfResidency: 35,
      householdRole: 'Head', educationalAttainment: 'Vocational',
      occupation: 'Retired Government Employee', employmentStatus: 'Retired', monthlyIncome: '₱15,000-₱25,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: true, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 12: Cadiang (Concepcion St.) — Boarder ===
    {
      rbiNumber: 'RBI-2024-00027', firstName: 'Ian', middleName: 'Jeffrey', lastName: 'Cadiang',
      birthDate: new Date('1999-07-14'), age: 25, sex: 'Male', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'O+',
      houseNumber: '102', street: 'Concepcion St.', precinct: 'PRECINCT-0044A', yearsOfResidency: 3,
      householdRole: 'Boarder', educationalAttainment: 'College Graduate',
      occupation: 'SK Kagawad / Delivery Rider', employmentStatus: 'Employed', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 13: Munsayac Family (San Isidro St.) ===
    {
      rbiNumber: 'RBI-2024-00028', firstName: 'Joshua', middleName: 'Delgado', lastName: 'Munsayac',
      birthDate: new Date('2001-02-19'), age: 23, sex: 'Male', civilStatus: 'Single',
      religion: 'Roman Catholic', bloodType: 'AB+',
      houseNumber: '28', street: 'San Isidro St.', precinct: 'PRECINCT-0043A', yearsOfResidency: 23,
      householdRole: 'Child', educationalAttainment: 'College Graduate',
      occupation: 'SK Kagawad / Volunteer BPSO', employmentStatus: 'Government', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },

    // === Household 14: Torres Family (Lt. Artiaga St.) — 4Ps ===
    {
      rbiNumber: 'RBI-2024-00029', firstName: 'Analiza', middleName: 'Bong', lastName: 'Torres',
      birthDate: new Date('1987-08-05'), age: 37, sex: 'Female', civilStatus: 'Married',
      religion: 'Islam', bloodType: 'O+',
      houseNumber: '201', street: 'Lt. Artiaga St.', precinct: 'PRECINCT-0042B', yearsOfResidency: 12,
      householdRole: 'Head', educationalAttainment: 'High School',
      occupation: 'Market Vendor', employmentStatus: 'Self-Employed', monthlyIncome: '₱5,000-₱10,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: true, isSoloParent: false,
    },
    {
      rbiNumber: 'RBI-2024-00030', firstName: 'Bong', middleName: 'Cruz', lastName: 'Torres',
      birthDate: new Date('1985-11-22'), age: 39, sex: 'Male', civilStatus: 'Married',
      religion: 'Islam', bloodType: 'B+',
      houseNumber: '201', street: 'Lt. Artiaga St.', precinct: 'PRECINCT-0042B', yearsOfResidency: 12,
      householdRole: 'Spouse', educationalAttainment: 'Elementary',
      occupation: 'Construction Worker', employmentStatus: 'Self-Employed', monthlyIncome: '₱10,000-₱15,000',
      isRegisteredVoter: true, isPwd: false, isSeniorCitizen: false, is4psBeneficiary: false, isSoloParent: false,
    },
  ];

  for (const record of rbiRecords) {
    await prisma.barangayInhabitant.create({ data: record });
  }
  console.log(`✅ Seeded ${rbiRecords.length} RBI (BarangayInhabitant) records!`);

  // Canonical Document Requests (Connected to Admin Queue and Live Tracking)
  console.log('Seeding canonical Document Requests...');
  await prisma.documentRequest.deleteMany();

  // Look up document types by code for relations
  const dtClearance = await prisma.documentType.findUnique({ where: { code: 'BRGY_CLEARANCE' } });
  const dtResidency = await prisma.documentType.findUnique({ where: { code: 'CERT_RESIDENCY' } });
  const dtIndigency = await prisma.documentType.findUnique({ where: { code: 'CERT_INDIGENCY' } });
  const dtJobseeker = await prisma.documentType.findUnique({ where: { code: 'FIRST_TIME_JOBSEEKER' } });
  const dtBusiness = await prisma.documentType.findUnique({ where: { code: 'BUSINESS_CLEARANCE' } });
  const dtBlotter = await prisma.documentType.findUnique({ where: { code: 'BLOTTER_REPORT' } });

  const requestsToSeed = [
    {
      trackingNumber: 'ONSE-2026-9045',
      documentTypeId: dtResidency!.id,
      fullName: 'Roberto Mendoza',
      contactNumber: '0918-345-6789',
      email: 'roberto.mendoza@gmail.com',
      address: '88 Onse Compound, San Juan City',
      purpose: 'Opening Bank Account',
      status: 'PENDING',
      createdAt: new Date('2026-08-28T14:30:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-9012',
      documentTypeId: dtIndigency!.id,
      fullName: 'Maria Clara Santos',
      contactNumber: '0917-234-5678',
      email: 'maria.santos@gmail.com',
      address: '45 Blumentritt St., Barangay Onse, San Juan City',
      purpose: 'Medical and Hospital Assistance',
      status: 'PROCESSING',
      createdAt: new Date('2026-08-27T11:15:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8891',
      documentTypeId: dtClearance!.id,
      fullName: 'Juan Dela Cruz',
      contactNumber: '0917-123-4567',
      email: 'testresident@smartonse.com',
      address: '124 Gomez St., Barangay Onse, San Juan City',
      purpose: 'Local Employment Application',
      status: 'READY_FOR_PICKUP',
      remarks: 'Your document is printed and verified. You may pick it up at Window 2 with 1 valid ID.',
      createdAt: new Date('2026-08-27T09:40:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8840',
      documentTypeId: dtJobseeker!.id,
      fullName: 'Danilo A. Florano',
      contactNumber: '0917-888-0012',
      email: 'kagawad@smartonse.com',
      address: '55 A. Luna St., Barangay Onse, San Juan City',
      purpose: 'BPO Job Application (RA 11261)',
      status: 'COMPLETED',
      remarks: 'Issued free of charge pursuant to R.A. 11261 First-Time Jobseekers Act.',
      createdAt: new Date('2026-08-27T14:00:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8815',
      documentTypeId: dtBusiness!.id,
      fullName: 'Crisostomo Ibarra',
      contactNumber: '0917-555-0101',
      email: 'crisostomo.ibarra@gmail.com',
      address: '12 N. Domingo St., Barangay Onse, San Juan City',
      purpose: 'Retail Store Permit Renewal',
      status: 'READY_FOR_PICKUP',
      remarks: 'Sanitary inspection verified. Ready for fee collection and seal stamping.',
      createdAt: new Date('2026-08-26T15:20:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8790',
      documentTypeId: dtClearance!.id,
      fullName: 'Elias Salome',
      contactNumber: '0917-555-0102',
      email: 'elias.salome@gmail.com',
      address: '204B F. Manalo St., Barangay Onse, San Juan City',
      purpose: 'Philippine Passport Renewal',
      status: 'PROCESSING',
      createdAt: new Date('2026-08-26T10:15:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8755',
      documentTypeId: dtIndigency!.id,
      fullName: 'Sisa Tiago',
      contactNumber: '0917-555-0103',
      email: 'sisa.tiago@gmail.com',
      address: '77 Lt. Artiaga St., Barangay Onse, San Juan City',
      purpose: 'DSWD AICS Subsidy Endorsement',
      status: 'READY_FOR_PICKUP',
      remarks: 'Certificate endorsed for DSWD social relief aid.',
      createdAt: new Date('2026-08-25T16:30:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8720',
      documentTypeId: dtResidency!.id,
      fullName: 'Basilio M. Evangelista',
      contactNumber: '0917-555-0104',
      email: 'basilio.evangelista@gmail.com',
      address: '145 Lt. Artiaga St., Barangay Onse, San Juan City',
      purpose: 'University Scholarship Filing',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-25T11:00:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8692',
      documentTypeId: dtJobseeker!.id,
      fullName: 'Crispin M. Evangelista',
      contactNumber: '0917-555-0105',
      email: 'crispin.evangelista@gmail.com',
      address: '145 Lt. Artiaga St., Barangay Onse, San Juan City',
      purpose: 'Entry Level IT Trainee (RA 11261)',
      status: 'COMPLETED',
      remarks: 'Certificate released with signed Barangay Oath of Undertaking.',
      createdAt: new Date('2026-08-24T15:45:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8650',
      documentTypeId: dtClearance!.id,
      fullName: 'Paulita Gomez',
      contactNumber: '0917-555-0106',
      email: 'paulita.gomez@gmail.com',
      address: '18 Pinaglabanan St., Barangay Onse, San Juan City',
      purpose: 'Postal ID Government Filing',
      status: 'PENDING',
      createdAt: new Date('2026-08-24T09:20:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8622',
      documentTypeId: dtClearance!.id,
      fullName: 'Isagani R. Villanueva',
      contactNumber: '0917-555-0107',
      email: 'isagani.villanueva@gmail.com',
      address: '93 J.V. Panganiban St., Barangay Onse, San Juan City',
      purpose: 'TIN ID Registration',
      status: 'PROCESSING',
      createdAt: new Date('2026-08-23T14:10:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8590',
      documentTypeId: dtBusiness!.id,
      fullName: 'Donya Victorina Delos Reyes',
      contactNumber: '0917-555-0108',
      email: 'victorina.delosreyes@gmail.com',
      address: '105 N. Domingo St., Barangay Onse, San Juan City',
      purpose: 'Commercial Space Sublease Permit',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-23T10:00:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8565',
      documentTypeId: dtResidency!.id,
      fullName: 'Tiburcio De Espadaña',
      contactNumber: '0917-555-0109',
      email: 'tiburcio.espana@gmail.com',
      address: '105 N. Domingo St., Barangay Onse, San Juan City',
      purpose: 'Senior Citizen OSCA Registration',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-22T16:00:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8530',
      documentTypeId: dtClearance!.id,
      fullName: 'Padre Florentino Santos',
      contactNumber: '0917-555-0110',
      email: 'florentino.santos@gmail.com',
      address: '40 Kalayaan St., Barangay Onse, San Juan City',
      purpose: 'Legal Affidavit of Guardianship',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-22T11:30:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8501',
      documentTypeId: dtBusiness!.id,
      fullName: 'Simoun Ibarra',
      contactNumber: '0917-555-0111',
      email: 'simoun.ibarra@gmail.com',
      address: '14 N. Domingo St., Barangay Onse, San Juan City',
      purpose: 'Jewelry & Gem Trading Shop',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-21T15:40:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8480',
      documentTypeId: dtIndigency!.id,
      fullName: 'Placido Penitente',
      contactNumber: '0917-555-0112',
      email: 'placido.penitente@gmail.com',
      address: '22 Concepcion St., Barangay Onse, San Juan City',
      purpose: 'Medical Hospital Waiver',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-20T14:20:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8452',
      documentTypeId: dtJobseeker!.id,
      fullName: 'Juli De Dios',
      contactNumber: '0917-555-0113',
      email: 'juli.dedios@gmail.com',
      address: '31 San Isidro St., Barangay Onse, San Juan City',
      purpose: 'Hospital Ward Attendant Trainee',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-19T11:15:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8420',
      documentTypeId: dtBlotter!.id,
      fullName: 'Kabesang Tales',
      contactNumber: '0917-555-0114',
      email: 'tales.kabesa@gmail.com',
      address: '60 F. Manalo St., Barangay Onse, San Juan City',
      purpose: 'Boundary Dispute Docket Proof',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-18T16:00:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8395',
      documentTypeId: dtIndigency!.id,
      fullName: 'Tandang Selo',
      contactNumber: '0917-555-0115',
      email: 'tandang.selo@gmail.com',
      address: '60 F. Manalo St., Barangay Onse, San Juan City',
      purpose: 'Dialysis Maintenance Subsidy',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-17T10:30:00Z'),
    },
    {
      trackingNumber: 'ONSE-2026-8360',
      documentTypeId: dtResidency!.id,
      fullName: 'Macaraig San Pedro',
      contactNumber: '0917-555-0116',
      email: 'macaraig.sanpedro@gmail.com',
      address: '11 Pinaglabanan St., Barangay Onse, San Juan City',
      purpose: 'LTO Driver License Application',
      status: 'COMPLETED',
      createdAt: new Date('2026-08-16T13:45:00Z'),
    },
  ];

  for (const req of requestsToSeed) {
    await prisma.documentRequest.create({ data: req });
  }
  console.log(`✅ Seeded ${requestsToSeed.length} canonical Document Requests!`);

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
