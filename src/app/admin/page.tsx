'use client';

import React, { useState } from 'react';
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
  Sparkles,
  PieChart,
  Megaphone,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('FY 2026 (August 2026)');
  const [activeTableTab, setActiveTableTab] = useState<'requests' | 'ledgers' | 'citizens' | 'blotter'>('requests');
  const [searchFilter, setSearchFilter] = useState('');

  // 1. KPI Financial & Operational Metrics (Matching Inspo)
  const kpiCards = [
    {
      label: 'Available IRA Budget (Current Year)',
      value: '₱14,850,000.00',
      subtext: '42% Utilized • ₱8.61M Available',
      badge: 'IRA Allotment',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      color: 'text-slate-900',
    },
    {
      label: 'Projected Local Revenue (Clearance / Permits)',
      value: '₱4,285,600.00',
      subtext: '~₱357,133.33 / mo • 14% Target Met',
      badge: 'Revenue Forecast',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      color: 'text-emerald-700',
    },
    {
      label: 'Pending Applications',
      value: '14 Requests',
      subtext: 'Review Queued • Avg 3.5 hrs turnaround',
      badge: 'Queue Active',
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      color: 'text-amber-600',
    },
    {
      label: 'Ready for Pickup / Sealed',
      value: '9 Vouchers',
      subtext: 'Printed & dry-sealed at Window 2',
      badge: 'Release Ready',
      badgeColor: 'bg-rose-50 text-[#9C2007] border-rose-200',
      color: 'text-[#9C2007]',
    },
    {
      label: 'Registered Verified Citizens',
      value: '3,824 Residents',
      subtext: '1,250 Registered Households',
      badge: 'Verified PII',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      color: 'text-purple-700',
    },
  ];

  // 2. Sample Data for Interactive Tabs
  const clearanceQueue = [
    { id: 'ONSE-2026-8891', applicant: 'Juan Dela Cruz', type: 'Barangay Clearance', purpose: 'Local Employment', fee: '₱50.00', feeStatus: 'PAID (GCash)', date: 'Aug 28, 2026', status: 'READY_FOR_PICKUP' },
    { id: 'ONSE-2026-9012', applicant: 'Maria Clara Santos', type: 'Certificate of Indigency', purpose: 'Medical Subsidy (San Juan Hosp.)', fee: 'FREE', feeStatus: 'EXEMPTED', date: 'Aug 28, 2026', status: 'PROCESSING' },
    { id: 'ONSE-2026-9044', applicant: 'Crisostomo Ibarra', type: 'Barangay Business Clearance', purpose: 'Retail Store Renewal', fee: '₱250.00', feeStatus: 'PAID (Cash)', date: 'Aug 27, 2026', status: 'READY_FOR_PICKUP' },
    { id: 'ONSE-2026-9078', applicant: 'Elias Salome', type: 'Certificate of Residency', purpose: 'Bank Account Opening', fee: '₱30.00', feeStatus: 'PAID (Cash)', date: 'Aug 27, 2026', status: 'PENDING_REVIEW' },
    { id: 'ONSE-2026-9102', applicant: 'Sisa Tiago', type: 'First Time Jobseeker Certificate', purpose: 'Job Fair Entry (RA 11261)', fee: 'FREE', feeStatus: 'WAIVED (RA 11261)', date: 'Aug 26, 2026', status: 'COMPLETED' },
  ];

  const ledgerEntries = [
    { code: 'FORM-83-001', account: 'PHILIPPINE RED CROSS BLOOD DRIVE', item: 'Medical & Disaster Supplies', allocated: '₱350,000.00', spent: '₱145,200.00', balance: '₱204,800.00', status: 'Active & Paid' },
    { code: 'FORM-83-002', account: 'SAN JUAN ELECTRIC SOLAR LIGHTING', item: 'Road Safety LED Upgrade', allocated: '₱750,000.00', spent: '₱520,000.00', balance: '₱230,000.00', status: 'Completed' },
    { code: 'FORM-83-003', account: 'SK YOUTH SPORTS TOURNAMENT', item: 'Inter-Purok Basketball League', allocated: '₱180,000.00', spent: '₱180,000.00', balance: '₱0.00', status: 'Fully Liquidated' },
    { code: 'FORM-83-004', account: 'SENIOR CITIZEN NUTRITION PROGRAM', item: 'Weekly Milk & Health Aid', allocated: '₱420,000.00', spent: '₱210,000.00', balance: '₱210,000.00', status: 'Ongoing Disb.' },
  ];

  const citizenList = [
    { name: 'Juan Dela Cruz', precinct: 'PRECINCT-0042A', address: '145 Lt. Artiaga St.', civil: 'Single', registered: '2023-01-14', verified: true },
    { name: 'Maria Clara Santos', precinct: 'PRECINCT-0042B', address: '88 J.V. Panganiban St.', civil: 'Married', registered: '2023-03-22', verified: true },
    { name: 'Crisostomo Ibarra', precinct: 'PRECINCT-0043A', address: '12 N. Domingo St.', civil: 'Single', registered: '2022-11-05', verified: true },
    { name: 'Danilo Florano', precinct: 'PRECINCT-0041A', address: '55 A. Luna St.', civil: 'Married', registered: '2021-08-19', verified: true },
  ];

  const blotterCases = [
    { caseNo: 'BLOT-2026-019', parties: 'Complainant: G. Reyes vs. R. Santos', nature: 'Neighborhood Noise Disturbance', date: 'Aug 26, 2026', luponStatus: 'Amicably Settled (Lupon)' },
    { caseNo: 'BLOT-2026-022', parties: 'Complainant: T. Cruz vs. M. Gomez', nature: 'Boundary Wall Dispute', date: 'Aug 27, 2026', luponStatus: 'Hearing Set (Aug 31)' },
  ];

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

      {/* 2. Top KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#0B1528] rounded-3xl p-5 border border-slate-200/80 dark:border-blue-900/40 shadow-xs hover:shadow-md transition-all space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate max-w-[150px]">
                {card.label}
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${card.badgeColor} dark:bg-slate-900/80 dark:border-slate-700`}>
                {card.badge}
              </span>
            </div>

            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${card.color} dark:text-white`}>
              {card.value}
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium leading-tight">
              {card.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Chart &bull; Monthly Request & Budget Trend */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                <span>Barangay Clearance &amp; Budget Velocity (Last 6 Months)</span>
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                Volume of digital clearance issuances and monthly fund disbursement.
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-blue-900/60 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-[#0E1B33]">
              Monthly View
            </span>
          </div>

          {/* SVG Smooth Curve Area Chart */}
          <div className="h-56 w-full pt-2">
            <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="maroonGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9C2007" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#9C2007" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="40" y1="30" x2="580" y2="30" stroke="currentColor" className="text-slate-100 dark:text-blue-950/60" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="currentColor" className="text-slate-100 dark:text-blue-950/60" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="130" x2="580" y2="130" stroke="currentColor" className="text-slate-100 dark:text-blue-950/60" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="currentColor" className="text-slate-200 dark:text-blue-900/60" strokeWidth="1.5" />

              {/* Y-Axis Labels */}
              <text x="30" y="35" fontSize="9" fill="currentColor" className="text-slate-400 dark:text-slate-500" textAnchor="end">240</text>
              <text x="30" y="85" fontSize="9" fill="currentColor" className="text-slate-400 dark:text-slate-500" textAnchor="end">160</text>
              <text x="30" y="135" fontSize="9" fill="currentColor" className="text-slate-400 dark:text-slate-500" textAnchor="end">80</text>
              <text x="30" y="175" fontSize="9" fill="currentColor" className="text-slate-400 dark:text-slate-500" textAnchor="end">0</text>

              {/* Area Fill */}
              <path
                d="M 50 160 C 130 110, 190 140, 250 80 C 310 110, 370 40, 440 60 C 500 80, 540 30, 570 40 L 570 170 L 50 170 Z"
                fill="url(#maroonGradient)"
              />

              {/* Curved Line (Maroon) */}
              <path
                d="M 50 160 C 130 110, 190 140, 250 80 C 310 110, 370 40, 440 60 C 500 80, 540 30, 570 40"
                fill="none"
                stroke="#DC2626"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data Points */}
              {[
                { x: 50, y: 160, label: 'Mar' },
                { x: 150, y: 120, label: 'Apr' },
                { x: 250, y: 80, label: 'May' },
                { x: 350, y: 75, label: 'Jun' },
                { x: 450, y: 55, label: 'Jul' },
                { x: 570, y: 40, label: 'Aug' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="5" fill="#0B1528" stroke="#DC2626" strokeWidth="2.5" />
                  <text x={pt.x} y="190" fontSize="10" fontWeight="bold" fill="currentColor" className="text-slate-400 dark:text-slate-400" textAnchor="middle">
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-blue-900/40 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#9C2007] dark:bg-rose-500" />
              <strong className="text-slate-800 dark:text-slate-200">Clearance Applications</strong> (+28% MoM Growth)
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">Total YTD: 1,842 Documents Issued</span>
          </div>
        </div>

        {/* Right Chart &bull; Service & Expenditure Breakdown */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-500" />
              <span>Service &amp; Expenditure Breakdown</span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
              Categorical distribution of barangay services and budget.
            </p>
          </div>

          {/* SVG Donut Chart */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#DC2626" strokeWidth="18" strokeDasharray="90.5 238.7" strokeDashoffset="0" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="18" strokeDasharray="57.2 238.7" strokeDashoffset="-90.5" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#8B5CF6" strokeWidth="18" strokeDasharray="42.9 238.7" strokeDashoffset="-147.7" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="18" strokeDasharray="28.6 238.7" strokeDashoffset="-190.6" />
                <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3B82F6" strokeWidth="18" strokeDasharray="19.1 238.7" strokeDashoffset="-219.2" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Total Ops</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">100%</span>
              </div>
            </div>
          </div>

          {/* Legends */}
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-blue-900/40">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              <span>Clearances (38%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Health Aid (24%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span>SK Youth (18%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Infra &amp; LED (12%)</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Projected Income & Realized Collections Banner */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase text-slate-900 dark:text-white tracking-wider">
                Projected Income &amp; Revenue Forecasting (Credit &amp; Collections)
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Auto-calculated from DILG Form 83 subsidiary ledgers, recurring clearance issuances, and community tax fees.
              </p>
            </div>
          </div>

          <Link
            href="/admin/transparency"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider transition"
          >
            <span>Manage Ledgers</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Realization KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#080E1A] border border-slate-200/60 dark:border-blue-900/30 text-xs">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Annual Projected Local</span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">₱4,285,600.00</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Expected Run-Rate</span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">₱357,133.33 <span className="text-[10px] text-slate-400 font-normal">/ mo</span></span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Realized Collections YTD</span>
            <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400">₱2,740,500.00</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Realization Efficiency</span>
            <span className="text-base sm:text-lg font-black text-[#9C2007] dark:text-rose-400">64% Target Met</span>
          </div>
        </div>
      </div>

      {/* 5. Interactive Tabbed Data Table & Real-time Management */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        
        {/* Tab Headers */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-blue-900/40 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTableTab('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'requests'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              📋 Clearance Requests ({clearanceQueue.length})
            </button>

            <button
              onClick={() => setActiveTableTab('ledgers')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'ledgers'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              💰 Barangay Ledgers ({ledgerEntries.length})
            </button>

            <button
              onClick={() => setActiveTableTab('citizens')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'citizens'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              👥 Citizen Roster ({citizenList.length})
            </button>

            <button
              onClick={() => setActiveTableTab('blotter')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTableTab === 'blotter'
                  ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                  : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747]'
              }`}
            >
              ⚖️ Peace &amp; Order ({blotterCases.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search record by code or name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-[#9C2007] outline-none"
            />
          </div>
        </div>

        {/* TAB 1: CLEARANCE QUEUE TABLE */}
        {activeTableTab === 'requests' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                <tr>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Fee Status</th>
                  <th className="py-3 px-4">Date Filed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                {clearanceQueue
                  .filter((item) => 
                    item.id.toLowerCase().includes(searchFilter.toLowerCase()) || 
                    item.applicant.toLowerCase().includes(searchFilter.toLowerCase())
                  )
                  .map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">{row.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.applicant}</td>
                      <td className="py-3.5 px-4">{row.type}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{row.purpose}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 border border-transparent dark:border-blue-900/40 text-[10px] font-bold">
                          {row.feeStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">{row.date}</td>
                      <td className="py-3.5 px-4">
                        {row.status === 'READY_FOR_PICKUP' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black uppercase">
                            Ready for Pickup
                          </span>
                        )}
                        {row.status === 'PROCESSING' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-[10px] font-black uppercase">
                            Processing
                          </span>
                        )}
                        {row.status === 'PENDING_REVIEW' && (
                          <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-[10px] font-black uppercase">
                            Pending Review
                          </span>
                        )}
                        {row.status === 'COMPLETED' && (
                          <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 text-[10px] font-black uppercase">
                            Completed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/track?trackingNumber=${row.id}`}
                          className="px-3 py-1 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-lg font-bold text-[11px] transition inline-block border border-transparent dark:border-blue-900/40"
                        >
                          Review &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: LEDGER ENTRIES TABLE */}
        {activeTableTab === 'ledgers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                <tr>
                  <th className="py-3 px-4">Ledger Code</th>
                  <th className="py-3 px-4">Account / Project Title</th>
                  <th className="py-3 px-4">Expenditure Item</th>
                  <th className="py-3 px-4">Total Allocation</th>
                  <th className="py-3 px-4">Disbursed (YTD)</th>
                  <th className="py-3 px-4">Remaining Balance</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                {ledgerEntries.map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{row.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.account}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{row.item}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-200">{row.allocated}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-700 dark:text-emerald-400 font-bold">{row.spent}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">{row.balance}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-bold">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: CITIZEN ROSTER */}
        {activeTableTab === 'citizens' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                <tr>
                  <th className="py-3 px-4">Full Legal Name</th>
                  <th className="py-3 px-4">Precinct Number</th>
                  <th className="py-3 px-4">Barangay Onse Address</th>
                  <th className="py-3 px-4">Civil Status</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                {citizenList.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">{row.precinct}</td>
                    <td className="py-3.5 px-4">{row.address}</td>
                    <td className="py-3.5 px-4">{row.civil}</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.registered}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: BLOTTER & PEACE AND ORDER */}
        {activeTableTab === 'blotter' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                <tr>
                  <th className="py-3 px-4">Docket No.</th>
                  <th className="py-3 px-4">Involved Parties</th>
                  <th className="py-3 px-4">Nature of Incident</th>
                  <th className="py-3 px-4">Date Logged</th>
                  <th className="py-3 px-4">Lupon Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
                {blotterCases.map((row) => (
                  <tr key={row.caseNo} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">{row.caseNo}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{row.parties}</td>
                    <td className="py-3.5 px-4">{row.nature}</td>
                    <td className="py-3.5 px-4 text-slate-400">{row.date}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-[10px] font-bold">
                        {row.luponStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
