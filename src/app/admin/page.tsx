'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart3, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  ArrowRight, 
  Printer, 
  DollarSign, 
  Users, 
  FileText, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronDown,
  ArrowUpRight,
  PieChart,
  X
} from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableSortHeader from '@/components/ui/TableSortHeader';
import DashboardCharts from '@/components/admin/DashboardCharts';

export default function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('FY 2026 (August 2026)');
  const [activeTableTab, setActiveTableTab] = useState<'requests' | 'citizens' | 'blotter'>('requests');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // default new to old
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // 1. KPI Financial & Operational Metrics (Clean Black Theme, Full Labels)
  const kpiCards = [
    {
      label: 'IRA Budget (Current Year)',
      value: '₱14,850,000.00',
      subtext: '42% Utilized • ₱8.61M Available',
      badge: 'IRA',
      badgeColor: 'border-black/15 bg-black/5 text-black dark:border-white/20 dark:bg-white/10 dark:text-white',
      color: 'text-black dark:text-white',
    },
    {
      label: 'Projected Local Revenue',
      value: '₱4,285,600.00',
      subtext: '64% Realized Collections YTD',
      badge: 'Revenue',
      badgeColor: 'border-black/15 bg-black/5 text-black dark:border-white/20 dark:bg-white/10 dark:text-white',
      color: 'text-black dark:text-white',
    },
    {
      label: 'Pending Applications',
      value: '14 Requests',
      subtext: 'Avg 3.5 hrs turnaround',
      badge: 'Queue',
      badgeColor: 'border-black/15 bg-black/5 text-black dark:border-white/20 dark:bg-white/10 dark:text-white',
      color: 'text-black dark:text-white',
    },
    {
      label: 'Ready for Pickup',
      value: '9 Vouchers',
      subtext: 'Printed & sealed at Window 2',
      badge: 'Release',
      badgeColor: 'border-black/15 bg-black/5 text-black dark:border-white/20 dark:bg-white/10 dark:text-white',
      color: 'text-black dark:text-white',
    },
    {
      label: 'Verified Citizens',
      value: '3,824',
      subtext: '1,250 Registered Households',
      badge: 'Verified',
      badgeColor: 'border-black/15 bg-black/5 text-black dark:border-white/20 dark:bg-white/10 dark:text-white',
      color: 'text-black dark:text-white',
    },
  ];

  // 2. Sample Data for Interactive Tabs (Expanded for Multi-Page Testing)
  const clearanceQueue = [
    { id: 'ONSE-2026-9045', applicant: 'Roberto Mendoza', type: 'Certificate of Residency', purpose: 'Bank Account Opening', fee: '₱30.00', feeStatus: 'PAID (Cash)', date: '2026-08-28 14:30', status: 'PENDING_REVIEW' },
    { id: 'ONSE-2026-9012', applicant: 'Maria Clara Santos', type: 'Certificate of Indigency', purpose: 'Medical Subsidy (San Juan Hosp.)', fee: 'FREE', feeStatus: 'EXEMPTED', date: '2026-08-28 11:15', status: 'PROCESSING' },
    { id: 'ONSE-2026-8891', applicant: 'Juan Dela Cruz', type: 'Barangay Clearance', purpose: 'Local Employment Application', fee: '₱50.00', feeStatus: 'PAID (GCash)', date: '2026-08-27 16:40', status: 'READY_FOR_PICKUP' },
    { id: 'ONSE-2026-8840', applicant: 'Danilo A. Florano', type: 'First Time Jobseeker Certificate', purpose: 'BPO Job Application (RA 11261)', fee: 'FREE', feeStatus: 'WAIVED (RA 11261)', date: '2026-08-27 14:00', status: 'COMPLETED' },
    { id: 'ONSE-2026-8815', applicant: 'Crisostomo Ibarra', type: 'Barangay Business Clearance', purpose: 'Retail Store Permit Renewal', fee: '₱250.00', feeStatus: 'PAID (Cash)', date: '2026-08-26 15:20', status: 'READY_FOR_PICKUP' },
    { id: 'ONSE-2026-8790', applicant: 'Elias Salome', type: 'Barangay Clearance', purpose: 'Philippine Passport Renewal', fee: '₱50.00', feeStatus: 'PAID (GCash)', date: '2026-08-26 10:15', status: 'PROCESSING' },
    { id: 'ONSE-2026-8755', applicant: 'Sisa Tiago', type: 'Certificate of Indigency', purpose: 'DSWD AICS Subsidy Endorsement', fee: 'FREE', feeStatus: 'EXEMPTED', date: '2026-08-25 16:30', status: 'READY_FOR_PICKUP' },
    { id: 'ONSE-2026-8720', applicant: 'Basilio M. Evangelista', type: 'Certificate of Residency', purpose: 'University Scholarship Filing', fee: '₱30.00', feeStatus: 'PAID (Cash)', date: '2026-08-25 11:00', status: 'COMPLETED' },
    { id: 'ONSE-2026-8692', applicant: 'Crispin M. Evangelista', type: 'First Time Jobseeker Certificate', purpose: 'Entry Level IT Trainee (RA 11261)', fee: 'FREE', feeStatus: 'WAIVED (RA 11261)', date: '2026-08-24 15:45', status: 'COMPLETED' },
    { id: 'ONSE-2026-8650', applicant: 'Paulita Gomez', type: 'Barangay Clearance', purpose: 'Postal ID Government Filing', fee: '₱50.00', feeStatus: 'PAID (Cash)', date: '2026-08-24 09:20', status: 'PENDING_REVIEW' },
    { id: 'ONSE-2026-8622', applicant: 'Isagani R. Villanueva', type: 'Barangay Clearance', purpose: 'TIN ID Registration', fee: '₱50.00', feeStatus: 'PAID (GCash)', date: '2026-08-23 14:10', status: 'PROCESSING' },
    { id: 'ONSE-2026-8590', applicant: 'Donya Victorina Delos Reyes', type: 'Barangay Business Clearance', purpose: 'Commercial Space Sublease Permit', fee: '₱250.00', feeStatus: 'REFUNDED', date: '2026-08-23 10:00', status: 'COMPLETED' },
    { id: 'ONSE-2026-8565', applicant: 'Tiburcio De Espadaña', type: 'Certificate of Residency', purpose: 'Senior Citizen OSCA Registration', fee: '₱30.00', feeStatus: 'PAID (Cash)', date: '2026-08-22 16:00', status: 'COMPLETED' },
    { id: 'ONSE-2026-8530', applicant: 'Padre Florentino Santos', type: 'Barangay Clearance', purpose: 'Legal Affidavit of Guardianship', fee: '₱50.00', feeStatus: 'PAID (Cash)', date: '2026-08-22 11:30', status: 'COMPLETED' },
    { id: 'ONSE-2026-8501', applicant: 'Simoun Ibarra', type: 'Barangay Business Clearance', purpose: 'Jewelry & Gem Trading Shop', fee: '₱250.00', feeStatus: 'PAID (Bank Transfer)', date: '2026-08-21 15:40', status: 'COMPLETED' },
    // --- Page 2 items ---
    { id: 'ONSE-2026-8480', applicant: 'Placido Penitente', type: 'Certificate of Indigency', purpose: 'Medical Hospital Waiver', fee: 'FREE', feeStatus: 'EXEMPTED', date: '2026-08-20 14:20', status: 'COMPLETED' },
    { id: 'ONSE-2026-8452', applicant: 'Juli De Dios', type: 'First Time Jobseeker Certificate', purpose: 'Hospital Ward Attendant Trainee', fee: 'FREE', feeStatus: 'WAIVED (RA 11261)', date: '2026-08-19 11:15', status: 'COMPLETED' },
    { id: 'ONSE-2026-8420', applicant: 'Kabesang Tales', type: 'Barangay Blotter Certification', purpose: 'Boundary Dispute Docket Proof', fee: '₱100.00', feeStatus: 'PAID (Cash)', date: '2026-08-18 16:00', status: 'COMPLETED' },
    { id: 'ONSE-2026-8395', applicant: 'Tandang Selo', type: 'Certificate of Indigency', purpose: 'Dialysis Maintenance Subsidy', fee: 'FREE', feeStatus: 'EXEMPTED', date: '2026-08-17 10:30', status: 'COMPLETED' },
    { id: 'ONSE-2026-8360', applicant: 'Macaraig San Pedro', type: 'Certificate of Residency', purpose: 'LTO Driver License Application', fee: '₱30.00', feeStatus: 'PAID (Cash)', date: '2026-08-16 13:45', status: 'COMPLETED' },
  ];

  const [clearances, setClearances] = useState(clearanceQueue);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch('/api/admin/requests');
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.requests) && data.requests.length > 0) {
          const mapped = data.requests.map((r: any) => ({
            id: r.trackingNumber,
            applicant: r.fullName,
            type: r.documentType,
            purpose: r.purpose,
            fee: r.fee === 0 ? 'FREE' : `₱${r.fee.toFixed(2)}`,
            feeStatus: r.fee === 0 ? 'EXEMPTED' : 'PAID',
            date: r.createdAt,
            status: r.status === 'PENDING' ? 'PENDING_REVIEW' : r.status,
          }));
          setClearances(mapped);
        }
      } catch (err) {
        console.error('Failed to sync admin dashboard requests:', err);
      }
    };
    fetchLatest();
  }, []);

  const citizenList = [
    { name: 'Alfonso V. Quintero', precinct: 'PRECINCT-0042A', address: '188 Lt. Artiaga St.', civil: 'Single', registered: '2026-08-20', verified: true },
    { name: 'Carmela D. Ocampo', precinct: 'PRECINCT-0043A', address: '39 N. Domingo St.', civil: 'Married', registered: '2026-07-18', verified: true },
    { name: 'Rodrigo P. Manansala', precinct: 'PRECINCT-0041A', address: '83 A. Luna St.', civil: 'Widowed', registered: '2026-06-12', verified: true },
    { name: 'Flordeliza M. Buan', precinct: 'PRECINCT-0044B', address: '15 Onse Compound', civil: 'Single', registered: '2026-05-04', verified: true },
    { name: 'Danilo P. Soriano', precinct: 'PRECINCT-0042B', address: '102 Blumentritt St.', civil: 'Married', registered: '2026-03-30', verified: true },
    { name: 'Leticia T. Ramos', precinct: 'PRECINCT-0043A', address: '48 J.V. Panganiban St.', civil: 'Widowed', registered: '2026-02-15', verified: true },
    { name: 'Gerardo K. Ilustre', precinct: 'PRECINCT-0041A', address: '29 F. Manalo St.', civil: 'Married', registered: '2026-01-22', verified: true },
    { name: 'Corazon E. Natividad', precinct: 'PRECINCT-0042A', address: '71 Gomez St.', civil: 'Single', registered: '2025-11-19', verified: true },
    { name: 'Victorino S. Cruz', precinct: 'PRECINCT-0044B', address: '62 Lt. Artiaga St.', civil: 'Married', registered: '2025-10-08', verified: true },
    { name: 'Josefina R. Padilla', precinct: 'PRECINCT-0043A', address: '11 N. Domingo St.', civil: 'Married', registered: '2025-08-14', verified: true },
    { name: 'Eduardo G. De Leon', precinct: 'PRECINCT-0042B', address: '95 Blumentritt St.', civil: 'Single', registered: '2025-06-25', verified: true },
    { name: 'Marilou C. Alcantara', precinct: 'PRECINCT-0041A', address: '14 A. Luna St.', civil: 'Married', registered: '2025-04-10', verified: true },
    { name: 'Manuel L. Roxas Jr.', precinct: 'PRECINCT-0042A', address: '53 Gomez St.', civil: 'Married', registered: '2025-02-01', verified: true },
    { name: 'Teresa B. Magbanua', precinct: 'PRECINCT-0044B', address: '110 Onse Compound', civil: 'Single', registered: '2024-12-14', verified: true },
    { name: 'Apolinario M. Mabini', precinct: 'PRECINCT-0043A', address: '24 N. Domingo St.', civil: 'Single', registered: '2024-10-09', verified: true },
    // --- Page 2 items ---
    { name: 'Melchora I. Aquino', precinct: 'PRECINCT-0042B', address: '77 Blumentritt St.', civil: 'Widowed', registered: '2024-08-20', verified: true },
    { name: 'Marcelo H. Del Pilar', precinct: 'PRECINCT-0041A', address: '66 A. Luna St.', civil: 'Married', registered: '2024-06-15', verified: true },
    { name: 'Graciano L. Jaena', precinct: 'PRECINCT-0042A', address: '130 Gomez St.', civil: 'Single', registered: '2024-04-18', verified: true },
    { name: 'Juan Dela Cruz', precinct: 'PRECINCT-0042A', address: '145 Lt. Artiaga St.', civil: 'Single', registered: '2023-01-14', verified: true },
    { name: 'Maria Clara Santos', precinct: 'PRECINCT-0042B', address: '88 J.V. Panganiban St.', civil: 'Married', registered: '2023-03-22', verified: true },
  ];

  const blotterCases = [
    { caseNo: 'BLOT-2026-025', parties: 'Complainant: E. Salome vs. F. Deniega', nature: 'Property Right of Way Obstruction', date: '2026-08-28 15:00', luponStatus: 'Summons Issued' },
    { caseNo: 'BLOT-2026-024', parties: 'Complainant: T. Cruz vs. M. Gomez', nature: 'Boundary Wall Drainage Dispute', date: '2026-08-27 16:30', luponStatus: 'Hearing Set (Aug 31)' },
    { caseNo: 'BLOT-2026-023', parties: 'Complainant: G. Reyes vs. R. Santos', nature: 'Neighborhood Videoke Noise Disturbance', date: '2026-08-26 21:15', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-022', parties: 'Complainant: B. Alcantara vs. D. Soriano', nature: 'Pet Dog Unleashed Animal Trespass', date: '2026-08-25 14:00', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-021', parties: 'Complainant: L. Ramos vs. C. Natividad', nature: 'Commercial Signage Encroachment', date: '2026-08-24 10:20', luponStatus: 'Hearing Set (Sept 02)' },
    { caseNo: 'BLOT-2026-020', parties: 'Complainant: J. Padilla vs. V. Cruz', nature: 'Tree Branches Hanging Over Roof', date: '2026-08-23 16:45', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-019', parties: 'Complainant: M. Roxas vs. T. Magbanua', nature: 'Alleyway Garbage Dumping Complaint', date: '2026-08-22 09:15', luponStatus: 'Referred to Tanod Roster' },
    { caseNo: 'BLOT-2026-018', parties: 'Complainant: S. Tiago vs. K. Tales', nature: 'Unsettled Small Borrowed Sum (₱2,500)', date: '2026-08-21 14:30', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-017', parties: 'Complainant: A. Mabini vs. M. Aquino', nature: 'Late Night Motorcycle Revving Noise', date: '2026-08-20 22:00', luponStatus: 'Reprimand Issued' },
    { caseNo: 'BLOT-2026-016', parties: 'Complainant: P. Penitente vs. J. De Dios', nature: 'Disputed Water Submeter Reading', date: '2026-08-19 11:30', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-015', parties: 'Complainant: M. Del Pilar vs. G. Jaena', nature: 'Illegal Parking Blocking Garage Gate', date: '2026-08-18 17:10', luponStatus: 'Settled via Barangay Tanod' },
    { caseNo: 'BLOT-2026-014', parties: 'Complainant: D. Florano vs. C. Ibarra', nature: 'Street Vendor Sidewalk Clearance', date: '2026-08-17 15:40', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-013', parties: 'Complainant: R. Mendoza vs. M. Santos', nature: 'Shared Wall Renovation Water Leakage', date: '2026-08-16 10:00', luponStatus: 'Hearing Set (Aug 25)' },
    { caseNo: 'BLOT-2026-012', parties: 'Complainant: E. Salome vs. S. Tiago', nature: 'Stray Cat Nuisance Concern', date: '2026-08-15 13:20', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-011', parties: 'Complainant: B. Evangelista vs. P. Gomez', nature: 'Unreturned Tools Equipment Dispute', date: '2026-08-14 16:50', luponStatus: 'Amicably Settled (Lupon)' },
    // --- Page 2 items ---
    { caseNo: 'BLOT-2026-010', parties: 'Complainant: I. Villanueva vs. D. Delos Reyes', nature: 'Commercial Billboard Glare at Night', date: '2026-08-13 19:30', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-009', parties: 'Complainant: T. De Espadaña vs. P. Santos', nature: 'Boundary Wall Plaster Repair Cost', date: '2026-08-12 11:00', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-008', parties: 'Complainant: S. Ibarra vs. K. Tales', nature: 'Barangay Basketball Court Scheduling Conflict', date: '2026-08-11 16:00', luponStatus: 'Settled via SK Chairman' },
  ];

  // Tab change handler
  const handleTabChange = (tab: 'requests' | 'citizens' | 'blotter') => {
    setActiveTableTab(tab);
    setCurrentPage(1);
    setSearchFilter('');
    if (tab === 'citizens') {
      setSortField('registered');
    } else {
      setSortField('date');
    }
    setSortDirection('desc'); // default new to old
  };

  // Sort handler
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc'); // default new to old
    }
    setCurrentPage(1);
  };

  // Processed requests
  const processedRequests = useMemo(() => {
    const q = searchFilter.toLowerCase();
    return clearances
      .filter((item) =>
        item.id.toLowerCase().includes(q) ||
        item.applicant.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q)
      )
      .sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [clearanceQueue, searchFilter, sortField, sortDirection]);

  // Processed citizens
  const processedCitizens = useMemo(() => {
    const q = searchFilter.toLowerCase();
    return citizenList
      .filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.precinct.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q)
      )
      .sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [citizenList, searchFilter, sortField, sortDirection]);

  // Processed blotter
  const processedBlotter = useMemo(() => {
    const q = searchFilter.toLowerCase();
    return blotterCases
      .filter((item) =>
        item.caseNo.toLowerCase().includes(q) ||
        item.parties.toLowerCase().includes(q) ||
        item.nature.toLowerCase().includes(q) ||
        item.luponStatus.toLowerCase().includes(q)
      )
      .sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [blotterCases, searchFilter, sortField, sortDirection]);

  // Active items calculation based on current tab
  const activeDataLength =
    activeTableTab === 'requests'
      ? processedRequests.length
      : activeTableTab === 'citizens'
      ? processedCitizens.length
      : processedBlotter.length;

  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedRequests.slice(start, start + pageSize);
  }, [processedRequests, currentPage, pageSize]);

  const paginatedCitizens = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedCitizens.slice(start, start + pageSize);
  }, [processedCitizens, currentPage, pageSize]);

  const paginatedBlotter = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedBlotter.slice(start, start + pageSize);
  }, [processedBlotter, currentPage, pageSize]);

  return (
    <div className="space-y-8 font-sans text-slate-800 dark:text-slate-100">
      
      {/* 1. Header Filter Ribbon & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Executive Dashboard
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">San Juan City &bull; District 1</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Dashboard Analytics &amp; Operations
          </h1>
        </div>

        {/* Period Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/60 text-slate-800 dark:text-slate-100 text-xs font-bold py-2.5 pl-3.5 pr-8 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#9C2007] cursor-pointer shadow-2xs"
            >
              <option value="FY 2026 (August 2026)">This Period: FY 2026 (August 2026)</option>
              <option value="FY 2026 (Q3 July-Sept)">Quarter: Q3 (July - Sept 2026)</option>
              <option value="FY 2026 Annual">Annual: Full Year FY 2026</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link
            href="/admin/requests"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Clearance Queue ({clearanceQueue.length})</span>
          </Link>
        </div>
      </div>

      {/* 2. Top KPI Cards Row (Clean Black Theme, Full Labels) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#0B1528] rounded-3xl p-5 border border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2 min-h-[36px]">
              <span className="text-[11px] font-bold text-black dark:text-white uppercase tracking-wider leading-snug">
                {card.label}
              </span>
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
                {card.value}
              </div>

              <p className="text-[11px] text-black/70 dark:text-white/70 font-medium leading-tight">
                {card.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Charts & Analytics Row (Data-driven & Interactive) */}
      <DashboardCharts selectedPeriod={selectedPeriod} />

      {/* 4. Real-time Collections & Budget Allocation */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 flex items-center justify-center text-black dark:text-white">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase text-black dark:text-white tracking-wider">
                Projected Income &amp; Revenue Forecasting (Credit &amp; Collections)
              </h3>
              <p className="text-[11px] text-black/60 dark:text-white/60 font-medium">
                Auto-calculated from DILG Form 83 subsidiary ledgers, recurring clearance issuances, and community tax fees.
              </p>
            </div>
          </div>

          <Link
            href="/admin/transparency"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-black/85 dark:hover:bg-white/85 font-bold text-xs uppercase tracking-wider transition"
          >
            <span>Manage Ledgers</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Realization KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#080E1A] border border-slate-200/60 dark:border-blue-900/30 text-xs">
          <div>
            <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider block">Annual Projected Local</span>
            <span className="text-base sm:text-lg font-black text-black dark:text-white">₱4,285,600.00</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider block">Monthly Expected Run-Rate</span>
            <span className="text-base sm:text-lg font-black text-black dark:text-white">₱357,133.33 <span className="text-[10px] text-black/50 dark:text-white/50 font-normal">/ mo</span></span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider block">Realized Collections YTD</span>
            <span className="text-base sm:text-lg font-black text-black dark:text-white">₱2,740,500.00</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-black/70 dark:text-white/70 uppercase tracking-wider block">Realization Efficiency</span>
            <span className="text-base sm:text-lg font-black text-black dark:text-white">64% Target Met</span>
          </div>
        </div>
      </div>

      {/* 5. Interactive Tabbed Data Table & Real-time Management */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        
        {/* Tab Headers & Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-blue-900/40 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleTabChange('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'requests'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              Clearance Requests ({clearanceQueue.length})
            </button>

            <button
              onClick={() => handleTabChange('citizens')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'citizens'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              Citizen Roster ({citizenList.length})
            </button>

            <button
              onClick={() => handleTabChange('blotter')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'blotter'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              Peace &amp; Order ({blotterCases.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search record by code or name..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-[#9C2007] outline-none"
            />
            {searchFilter && (
              <button
                onClick={() => {
                  setSearchFilter('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: CLEARANCE QUEUE TABLE */}
        {activeTableTab === 'requests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                <tr>
                  <TableSortHeader
                    field="id"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Tracking Code"
                  />
                  <TableSortHeader
                    field="applicant"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Applicant Name"
                  />
                  <TableSortHeader
                    field="type"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Document Type"
                  />
                  <TableSortHeader
                    field="purpose"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Purpose"
                  />
                  <TableSortHeader
                    field="feeStatus"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Fee Status"
                  />
                  <TableSortHeader
                    field="date"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Date Filed"
                  />
                  <TableSortHeader
                    field="status"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Status"
                  />
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No clearance requests found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">{row.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.applicant}</td>
                      <td className="py-3.5 px-4">{row.type}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">{row.purpose}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 border border-transparent dark:border-blue-900/40 text-[10px] font-bold">
                          {row.feeStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{row.date}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {row.status === 'READY_FOR_PICKUP' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black uppercase whitespace-nowrap">
                            Ready for Pickup
                          </span>
                        )}
                        {row.status === 'PROCESSING' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-[10px] font-black uppercase whitespace-nowrap">
                            Processing
                          </span>
                        )}
                        {row.status === 'PENDING_REVIEW' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-[10px] font-black uppercase whitespace-nowrap">
                            Pending Review
                          </span>
                        )}
                        {row.status === 'COMPLETED' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-[10px] font-black uppercase whitespace-nowrap">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/track?trackingNumber=${row.id}`}
                          className="px-3 py-1 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-lg font-bold text-[11px] transition inline-block border border-transparent dark:border-blue-900/40"
                        >
                          Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: CITIZEN ROSTER */}
        {activeTableTab === 'citizens' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                <tr>
                  <TableSortHeader
                    field="name"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Full Legal Name"
                  />
                  <TableSortHeader
                    field="precinct"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Precinct Number"
                  />
                  <TableSortHeader
                    field="address"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Barangay Onse Address"
                  />
                  <TableSortHeader
                    field="civil"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Civil Status"
                  />
                  <TableSortHeader
                    field="registered"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Member Since"
                  />
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                {paginatedCitizens.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No citizen records found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedCitizens.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">{row.precinct}</td>
                      <td className="py-3.5 px-4">{row.address}</td>
                      <td className="py-3.5 px-4">{row.civil}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{row.registered}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: BLOTTER & PEACE AND ORDER */}
        {activeTableTab === 'blotter' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                <tr>
                  <TableSortHeader
                    field="caseNo"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Docket No."
                  />
                  <TableSortHeader
                    field="parties"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Involved Parties"
                  />
                  <TableSortHeader
                    field="nature"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Nature of Incident"
                  />
                  <TableSortHeader
                    field="date"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Date Logged"
                  />
                  <TableSortHeader
                    field="luponStatus"
                    currentField={sortField}
                    currentDirection={sortDirection}
                    onSort={handleSort}
                    label="Lupon Status"
                  />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                {paginatedBlotter.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      No blotter cases found matching your search.
                    </td>
                  </tr>
                ) : (
                  paginatedBlotter.map((row) => (
                    <tr key={row.caseNo} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{row.caseNo}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.parties}</td>
                      <td className="py-3.5 px-4">{row.nature}</td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">{row.date}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-[10px] font-bold">
                          {row.luponStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Reusable Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={activeDataLength}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => setPageSize(size)}
        />
      </div>

    </div>
  );
}
