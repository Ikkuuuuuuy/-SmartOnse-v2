'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getPhNowParts, MONTH_NAMES_FULL } from '@/lib/ph-time';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  Printer, 
  Download, 
  RefreshCw, 
  Calendar, 
  CalendarRange, 
  Search, 
  Filter, 
  ShieldCheck, 
  Building2, 
  FileCheck, 
  Layers, 
  Info, 
  ChevronRight, 
  ArrowUpRight,
  ExternalLink,
  Award,
  Sparkles,
  HelpCircle,
  XCircle,
  Eye,
  Check,
  Users,
  Home,
  Vote
} from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableSortHeader from '@/components/ui/TableSortHeader';

interface DocumentTypeStat {
  id: string;
  code: string;
  name: string;
  description: string;
  fee: number;
  feeDisplay: string;
  processingDays: number;
  requirements: string[];
  category: string;
  legalBasis: string;
  totalRequested: number;
  completed: number;
  readyForPickup: number;
  processing: number;
  pending: number;
  rejected: number;
  inProgress: number;
  completionRate: number;
  realizedRevenue: number;
  potentialRevenue: number;
  freeCompleted: number;
  waivedValue: number;
  avgTurnaroundHours: number;
  avgTurnaroundDays: string;
}

interface CompletedRecord {
  id: string;
  trackingNumber: string;
  applicant: string;
  documentCode: string;
  documentName: string;
  purpose: string;
  fee: number;
  feeDisplay: string;
  feeStatus: string;
  dateFiled: string;
  dateCompleted: string;
  turnaroundDays: string;
  status: string;
  remarks: string;
}

interface ReportData {
  reportMetadata: {
    barangayName: string;
    city: string;
    office: string;
    generatedAt: string;
    generatedBy: string;
    userRole: string;
    periodLabel: string;
    timeframe: string;
  };
  summary: {
    totalApplications: number;
    totalCompleted: number;
    totalReady: number;
    totalProcessing: number;
    totalPending: number;
    totalActive: number;
    totalRejected: number;
    overallCompletionRate: number;
    totalRealizedRevenue: number;
    totalWaivedRevenue: number;
    totalFreeGrants: number;
    avgTurnaroundDays: string;
    totalCatalogedDocuments: number;
    slaComplianceRate?: number;
    avgSatisfactionRating?: string;
    ratedCount?: number;
  };
  populationReport?: {
    totalPopulation: number;
    votersCount: number;
    nonVotersCount: number;
    voterPercentage: number;
    familiesCount?: number;
    headsOfFamilyCount?: number;
    avgMembersPerHousehold?: number;
    employedCount?: number;
    unemployedCount?: number;
    minorsUnder18?: number;
    housingBreakdown: {
      homeowners: number;
      renters: number;
      commercialSpaces?: number;
      livingWithRelatives: number;
      boarders: number;
    };
    genderBreakdown: {
      male: number;
      female: number;
    };
    ageGroups: {
      youthUnder18: number;
      youngAdults18To30: number;
      adults31To59: number;
      seniors60Plus: number;
    };
    civilStatusBreakdown: {
      single: number;
      married: number;
      widowed: number;
      separated: number;
    };
    sectoralBreakdown: {
      seniorCitizens: number;
      pwd: number;
      soloParents: number;
      fourPs: number;
      students: number;
      employed: number;
      unemployed?: number;
    };
    records: Array<{
      id: string;
      rbiNumber: string;
      fullName: string;
      firstName?: string;
      middleName?: string;
      lastName?: string;
      age: number;
      sex: string;
      civilStatus: string;
      housingStatus: string;
      isHeadOfFamily?: boolean;
      familyMembersCount?: number;
      isRegisteredVoter: boolean;
      employmentStatus: string;
      yearsOfResidency: number;
      address: string;
      sectors: string[];
      hasPortalAccount: boolean;
      isVerified: boolean;
      registeredAt: string;
    }>;
  };
  documents: DocumentTypeStat[];
  completedRecords: CompletedRecord[];
}

export default function ReportAnalyticsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Timeframe filter state (auto-adapted to Philippine Standard Time)
  const initialPh = getPhNowParts();
  const [timeframe, setTimeframe] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<number>(initialPh.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialPh.month);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(initialPh.quarter);
  const [selectedDay, setSelectedDay] = useState<string>(initialPh.dateStr);
  const [customStart, setCustomStart] = useState<string>(`${initialPh.year}-${String(initialPh.month).padStart(2, '0')}-01`);
  const [customEnd, setCustomEnd] = useState<string>(initialPh.dateStr);

  // Filter & Search states for the itemized completed records table
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDocFilter, setSelectedDocFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [recordsCurrentPage, setRecordsCurrentPage] = useState<number>(1);
  const [recordsPageSize, setRecordsPageSize] = useState<number>(10);
  const [recordsSortField, setRecordsSortField] = useState<string>('dateCompleted');
  const [recordsSortDir, setRecordsSortDir] = useState<'asc' | 'desc'>('desc');

  const handleRecordsSort = (field: string) => {
    if (recordsSortField === field) {
      setRecordsSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setRecordsSortField(field);
      setRecordsSortDir('desc');
    }
  };

  // Active view tab inside module matching Thesis Objective 2:
  // 'population' | 'performance' (Transaction Volume) | 'service_performance' | 'catalog' | 'audit_log'
  const [activeTab, setActiveTab] = useState<'population' | 'performance' | 'service_performance' | 'catalog' | 'audit_log'>('population');
  const [popSearch, setPopSearch] = useState<string>('');
  const [popHousingFilter, setPopHousingFilter] = useState<string>('ALL');
  const [popVoterFilter, setPopVoterFilter] = useState<string>('ALL');

  // Selected document for the details modal
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentTypeStat | null>(null);

  // Fetch report data from API
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('timeframe', timeframe);
      if (selectedStatusFilter !== 'ALL') {
        params.set('status', selectedStatusFilter);
      }
      if (timeframe === 'custom') {
        params.set('startDate', customStart);
        params.set('endDate', customEnd);
      } else if (timeframe === 'day') {
        params.set('day', selectedDay);
      } else if (timeframe === 'month') {
        params.set('year', String(selectedYear));
        params.set('month', String(selectedMonth));
      } else if (timeframe === 'quarter') {
        params.set('year', String(selectedYear));
        params.set('quarter', String(selectedQuarter));
      } else if (timeframe === 'year') {
        params.set('year', String(selectedYear));
      }

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load report analytics (Status: ${res.status})`);
      }
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        throw new Error(json.error || 'Unable to retrieve report analytics');
      }
    } catch (err: any) {
      console.error('Error fetching report analytics:', err);
      setError(err.message || 'An error occurred while compiling reports');
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, customStart, customEnd, selectedDay, selectedYear, selectedMonth, selectedQuarter, selectedStatusFilter]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Active Report Title & Label Helper
  const ACTIVE_REPORT_META: Record<
    'population' | 'performance' | 'service_performance' | 'audit_log' | 'catalog',
    { title: string; shortLabel: string; subtitle: string }
  > = {
    population: {
      title: 'Official Barangay Population & RBI Census Report',
      shortLabel: 'Population Report',
      subtitle: 'Demographic distribution, Homeowners vs. Renters, Registered Voters vs. Non-Voters, and Sectoral Classifications sourced from Resident Registration.',
    },
    performance: {
      title: 'Official Transaction Volume & Revenue Audit Report',
      shortLabel: 'Transaction Volume Report',
      subtitle: 'Total document applications filed, completed releases, active queue volume, realized collections, and statutory fee waivers per document service.',
    },
    service_performance: {
      title: 'Official Barangay Service Performance & SLA Compliance Report',
      shortLabel: 'Service Performance Report',
      subtitle: 'Service completion efficiency, actual processing turnaround time vs. statutory SLA targets, and citizen satisfaction ratings.',
    },
    audit_log: {
      title: 'Official Completed & Released Certificates Registry Log',
      shortLabel: 'Completed Issuances Report',
      subtitle: 'Itemized audit trail of all verified, signed, dry-sealed, and claimed barangay certificates and clearances.',
    },
    catalog: {
      title: 'Official Barangay Document Catalog & Statutory Requirements Report',
      shortLabel: 'Document Catalog Report',
      subtitle: 'Inventory of official barangay issuances, legal foundations, standard fees, SLA processing days, and documentary prerequisites.',
    },
  };

  // Dedicated CSV Download per Report Type (each has its own tailored format & columns)
  const handleDownloadReport = (targetTab: typeof activeTab = activeTab) => {
    if (!data) return;

    const meta = ACTIVE_REPORT_META[targetTab];
    const dateStamp = new Date().toISOString().slice(0, 10);
    const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows: string[] = [];

    // Official Report Header Block specific to this report
    rows.push(`${esc('REPUBLIC OF THE PHILIPPINES - CITY OF SAN JUAN, METRO MANILA')}`);
    rows.push(`${esc('BARANGAY ONSE COUNCIL - Ibuna corner P. Guevarra St., Barangay Onse (Tel: (02) 8723-0011 | Email: info@onse.gov.ph)')}`);
    rows.push(`${esc(meta.title.toUpperCase())}`);
    rows.push(`${esc('Reporting Period:')},${esc(data.reportMetadata.periodLabel)}`);
    rows.push(`${esc('Generated as of:')},${esc(new Date(data.reportMetadata.generatedAt).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }))}`);
    rows.push(`${esc('Generated by:')},${esc(`${data.reportMetadata.generatedBy} (${data.reportMetadata.userRole})`)}`);
    rows.push('');

    let fileSlug = 'Report';

    if (targetTab === 'population' && data.populationReport) {
      fileSlug = 'Population_Report';
      const pop = data.populationReport;

      rows.push(esc('1. CITY HALL POPULATION & HOUSEHOLD DEMOGRAPHIC SUMMARY'));
      rows.push(`${esc('City Hall Demographic Category')},${esc('Count')},${esc('Details / Share')}`);
      rows.push(`${esc('Total Registered Population')},${esc(pop.totalPopulation)},${esc('100% of RBI Census Registry')}`);
      rows.push(`${esc('Registered Voters (Brgy. Onse)')},${esc(pop.votersCount)},${esc(`${pop.voterPercentage}% of Population`)}`);
      rows.push(`${esc('Number of Families / Households')},${esc(pop.familiesCount ?? 12)},${esc('Distinct Registered Family Units')}`);
      rows.push(`${esc('Heads of the Family')},${esc(pop.headsOfFamilyCount ?? 12)},${esc('Designated Household Heads')}`);
      rows.push(`${esc('Average Members per Household')},${esc(pop.avgMembersPerHousehold ?? 3.2)},${esc('Average Family Size')}`);
      rows.push(`${esc('Employed Residents')},${esc(pop.employedCount ?? pop.sectoralBreakdown.employed)},${esc('Employed / Self-Employed / OFW')}`);
      rows.push(`${esc('Unemployed / Dependent Residents')},${esc(pop.unemployedCount ?? (pop.totalPopulation - (pop.employedCount ?? pop.sectoralBreakdown.employed)))},${esc('Jobseekers / Students / Dependents')}`);
      rows.push(`${esc('Senior Citizens (60+ yrs)')},${esc(pop.ageGroups.seniors60Plus)},${esc('Republic Act No. 9994 Sector')}`);
      rows.push(`${esc('Minors / Children (<18 yrs)')},${esc(pop.minorsUnder18 ?? pop.ageGroups.youthUnder18)},${esc('Youth & Pediatric Demographic')}`);
      rows.push(`${esc('Male Residents')},${esc(pop.genderBreakdown.male)},${esc(`${pop.totalPopulation ? Math.round((pop.genderBreakdown.male / pop.totalPopulation) * 100) : 0}%`)}`);
      rows.push(`${esc('Female Residents')},${esc(pop.genderBreakdown.female)},${esc(`${pop.totalPopulation ? Math.round((pop.genderBreakdown.female / pop.totalPopulation) * 100) : 0}%`)}`);
      rows.push('');

      rows.push(esc('2. HOUSING & RESIDENCY CLASSIFICATION BREAKDOWN'));
      rows.push(`${esc('Housing / Residency Type')},${esc('Resident Count')},${esc('Percentage Share')}`);
      rows.push(`${esc('Homeowner (May-ari ng Bahay)')},${esc(pop.housingBreakdown.homeowners)},${esc(`${pop.totalPopulation ? Math.round((pop.housingBreakdown.homeowners / pop.totalPopulation) * 100) : 0}%`)}`);
      rows.push(`${esc('Renter / Tenant (Nangungupahan)')},${esc(pop.housingBreakdown.renters)},${esc(`${pop.totalPopulation ? Math.round((pop.housingBreakdown.renters / pop.totalPopulation) * 100) : 0}%`)}`);
      rows.push(`${esc('Living with Relatives (Nakikitira)')},${esc(pop.housingBreakdown.livingWithRelatives)},${esc(`${pop.totalPopulation ? Math.round((pop.housingBreakdown.livingWithRelatives / pop.totalPopulation) * 100) : 0}%`)}`);
      rows.push(`${esc('Boarder / Student Dorm')},${esc(pop.housingBreakdown.boarders)},${esc(`${pop.totalPopulation ? Math.round((pop.housingBreakdown.boarders / pop.totalPopulation) * 100) : 0}%`)}`);
      rows.push('');

      rows.push(esc('3. AGE BRACKET, CIVIL STATUS & SECTORAL CLASSIFICATIONS'));
      rows.push(`${esc('Category')},${esc('Classification')},${esc('Count')}`);
      rows.push(`${esc('Age Bracket')},${esc('Youth (<18 yrs)')},${esc(pop.ageGroups.youthUnder18)}`);
      rows.push(`${esc('Age Bracket')},${esc('Young Adults (18-30 yrs)')},${esc(pop.ageGroups.youngAdults18To30)}`);
      rows.push(`${esc('Age Bracket')},${esc('Adults (31-59 yrs)')},${esc(pop.ageGroups.adults31To59)}`);
      rows.push(`${esc('Age Bracket')},${esc('Senior Citizens (60+ yrs)')},${esc(pop.ageGroups.seniors60Plus)}`);
      rows.push(`${esc('Civil Status')},${esc('Single')},${esc(pop.civilStatusBreakdown.single)}`);
      rows.push(`${esc('Civil Status')},${esc('Married')},${esc(pop.civilStatusBreakdown.married)}`);
      rows.push(`${esc('Civil Status')},${esc('Widowed')},${esc(pop.civilStatusBreakdown.widowed)}`);
      rows.push(`${esc('Civil Status')},${esc('Separated')},${esc(pop.civilStatusBreakdown.separated)}`);
      rows.push(`${esc('Priority Sector')},${esc('Senior Citizens (60+)')},${esc(pop.sectoralBreakdown.seniorCitizens)}`);
      rows.push(`${esc('Priority Sector')},${esc('Persons with Disability (PWD)')},${esc(pop.sectoralBreakdown.pwd)}`);
      rows.push(`${esc('Priority Sector')},${esc('Solo Parents')},${esc(pop.sectoralBreakdown.soloParents)}`);
      rows.push(`${esc('Priority Sector')},${esc('4Ps / DSWD Beneficiaries')},${esc(pop.sectoralBreakdown.fourPs)}`);
      rows.push('');

      rows.push(esc('4. INDIVIDUAL REGISTERED POPULATION & RBI CENSUS ROSTER'));
      rows.push(
        [
          'RBI Census Number',
          'Full Name',
          'Age',
          'Sex',
          'Civil Status',
          'Housing / Residency Status',
          'Voter Status',
          'Employment / Sector',
          'Sector Classifications',
          'Years in Brgy. Onse',
          'Residential Address',
          'Registered Date',
        ]
          .map(esc)
          .join(',')
      );

      pop.records.forEach((rec) => {
        rows.push(
          [
            rec.rbiNumber,
            rec.fullName,
            rec.age,
            rec.sex,
            rec.civilStatus,
            rec.housingStatus,
            rec.isRegisteredVoter ? 'Registered Voter' : 'Non-Voter',
            rec.employmentStatus,
            rec.sectors.join(' | '),
            rec.yearsOfResidency,
            rec.address,
            rec.registeredAt,
          ]
            .map(esc)
            .join(',')
        );
      });
    } else if (targetTab === 'performance') {
      fileSlug = 'Transaction_Volume_Report';

      rows.push(esc('1. TRANSACTION VOLUME & REVENUE SUMMARY'));
      rows.push(`${esc('Metric')},${esc('Value')}`);
      rows.push(`${esc('Total Applications Filed')},${esc(data.summary.totalApplications)}`);
      rows.push(`${esc('Completed & Released Certificates')},${esc(data.summary.totalCompleted)}`);
      rows.push(`${esc('Ready for Pickup (Window 2)')},${esc(data.summary.totalReady)}`);
      rows.push(`${esc('Under Processing')},${esc(data.summary.totalProcessing)}`);
      rows.push(`${esc('Pending Initial Review')},${esc(data.summary.totalPending)}`);
      rows.push(`${esc('Rejected Applications')},${esc(data.summary.totalRejected)}`);
      rows.push(`${esc('Realized Fee Revenue')},${esc(`PHP ${data.summary.totalRealizedRevenue.toFixed(2)}`)}`);
      rows.push(`${esc('Free Issuances Granted (RA 11261 & Indigency)')},${esc(data.summary.totalFreeGrants)}`);
      rows.push(`${esc('Total Fee Value Waived for Social Aid')},${esc(`PHP ${data.summary.totalWaivedRevenue.toFixed(2)}`)}`);
      rows.push('');

      rows.push(esc('2. TRANSACTION VOLUME BREAKDOWN BY DOCUMENT TYPE'));
      rows.push(
        [
          'Document Code',
          'Document Name',
          'Category',
          'Standard Fee',
          'Total Filed',
          'Volume Share (%)',
          'Completed',
          'Ready for Pickup',
          'Processing / Pending',
          'Rejected',
          'Realized Revenue (PHP)',
          'Free Grants Issued',
        ]
          .map(esc)
          .join(',')
      );

      data.documents.forEach((d) => {
        const volShare = data.summary.totalApplications > 0
          ? `${Math.round((d.totalRequested / data.summary.totalApplications) * 100)}%`
          : '0%';
        rows.push(
          [
            d.code,
            d.name,
            d.category,
            d.feeDisplay,
            d.totalRequested,
            volShare,
            d.completed,
            d.readyForPickup,
            d.processing + d.pending,
            d.rejected,
            `PHP ${d.realizedRevenue.toFixed(2)}`,
            d.freeCompleted,
          ]
            .map(esc)
            .join(',')
        );
      });
    } else if (targetTab === 'service_performance') {
      fileSlug = 'Service_Performance_Report';

      rows.push(esc('1. SERVICE PERFORMANCE & SLA COMPLIANCE SUMMARY'));
      rows.push(`${esc('Performance Indicator')},${esc('Result')}`);
      rows.push(`${esc('Overall Service Completion Rate')},${esc(`${data.summary.overallCompletionRate}%`)}`);
      rows.push(`${esc('Average Processing Turnaround Time')},${esc(`${data.summary.avgTurnaroundDays} Days`)}`);
      rows.push(`${esc('SLA Target Compliance Rate')},${esc(`${data.summary.slaComplianceRate ?? 100}%`)}`);
      rows.push(`${esc('Resident Service Satisfaction Rating')},${esc(`${data.summary.avgSatisfactionRating || '4.90'} / 5.00`)}`);
      rows.push('');

      rows.push(esc('2. PER-SERVICE SLA TURNAROUND & EFFICIENCY BREAKDOWN'));
      rows.push(
        [
          'Service Code',
          'Barangay Document Service',
          'Category',
          'Statutory Legal Basis',
          'Standard SLA Target (Days)',
          'Actual Avg. Turnaround (Days)',
          'Actual Avg. Turnaround (Hours)',
          'Total Filed',
          'Completed',
          'Ready for Pickup',
          'Active Queue',
          'Completion Efficiency (%)',
          'SLA Status',
        ]
          .map(esc)
          .join(',')
      );

      data.documents.forEach((d) => {
        const actualDays = parseFloat(d.avgTurnaroundDays) || d.processingDays;
        const withinSla = actualDays <= d.processingDays + 0.5;
        rows.push(
          [
            d.code,
            d.name,
            d.category,
            d.legalBasis,
            `${d.processingDays} Business Day(s)`,
            `${d.avgTurnaroundDays} Days`,
            `${d.avgTurnaroundHours} Hours`,
            d.totalRequested,
            d.completed,
            d.readyForPickup,
            d.processing + d.pending,
            `${d.completionRate}%`,
            withinSla ? 'ON-TIME SLA' : 'HIGH VOLUME',
          ]
            .map(esc)
            .join(',')
        );
      });
    } else if (targetTab === 'audit_log') {
      fileSlug = 'Completed_Issuances_Log';

      rows.push(esc('ITEMIZED COMPLETED & RELEASED CERTIFICATES AUDIT LOG'));
      rows.push(
        [
          'Tracking Code',
          'Applicant Name',
          'Document Code',
          'Certificate Type',
          'Purpose',
          'Official Fee',
          'Fee Status',
          'Date Filed (PHT)',
          'Date Completed (PHT)',
          'Turnaround Time',
          'Release Status',
          'Official Remarks',
        ]
          .map(esc)
          .join(',')
      );

      filteredRecords.forEach((r) => {
        rows.push(
          [
            r.trackingNumber,
            r.applicant,
            r.documentCode,
            r.documentName,
            r.purpose,
            r.feeDisplay,
            r.feeStatus,
            r.dateFiled,
            r.dateCompleted,
            r.turnaroundDays,
            r.status,
            r.remarks || 'Officially verified and released.',
          ]
            .map(esc)
            .join(',')
        );
      });
    } else if (targetTab === 'catalog') {
      fileSlug = 'Document_Catalog_Report';

      rows.push(esc('OFFICIAL BARANGAY DOCUMENT CATALOG & STATUTORY REQUIREMENTS'));
      rows.push(
        [
          'Document Code',
          'Official Document Title',
          'Service Category',
          'Statutory Legal Authority',
          'Standard Fee',
          'SLA Processing Days',
          'Mandatory Resident Prerequisites',
          'Total Issued',
          'Completion Rate (%)',
        ]
          .map(esc)
          .join(',')
      );

      data.documents.forEach((d) => {
        rows.push(
          [
            d.code,
            d.name,
            d.category,
            d.legalBasis,
            d.feeDisplay,
            `${d.processingDays} Business Day(s)`,
            d.requirements.join('; '),
            d.completed,
            `${d.completionRate}%`,
          ]
            .map(esc)
            .join(',')
        );
      });
    }

    const csvString = '\uFEFF' + rows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Barangay_Onse_${fileSlug}_${dateStamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dedicated Print Report Generator — each report tab prints with its own tailored official layout
  const handlePrintReport = (targetTab: typeof activeTab = activeTab) => {
    if (!data || typeof window === 'undefined') return;

    const meta = ACTIVE_REPORT_META[targetTab];
    const generatedTime = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });
    const escHtml = (str: any) =>
      String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    let bodyHtml = '';

    if (targetTab === 'population' && data.populationReport) {
      const pop = data.populationReport;
      const pct = (n: number) => (pop.totalPopulation > 0 ? Math.round((n / pop.totalPopulation) * 100) : 0);

      const filteredPop = pop.records.filter((rec) => {
        if (popHousingFilter !== 'ALL' && !rec.housingStatus.toLowerCase().includes(popHousingFilter.toLowerCase())) return false;
        if (popVoterFilter === 'VOTER' && !rec.isRegisteredVoter) return false;
        if (popVoterFilter === 'NON_VOTER' && rec.isRegisteredVoter) return false;
        if (popSearch.trim()) {
          const q = popSearch.toLowerCase();
          return (
            rec.fullName.toLowerCase().includes(q) ||
            rec.rbiNumber.toLowerCase().includes(q) ||
            rec.address.toLowerCase().includes(q)
          );
        }
        return true;
      });

      bodyHtml = `
        <div class="kpi-grid">
          <div class="kpi-box">
            <div class="kpi-label">Total Population &amp; Voters</div>
            <div class="kpi-val">${pop.totalPopulation} Residents</div>
            <div class="kpi-sub">${pop.votersCount} Registered Voters (${pop.voterPercentage}%)</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Families &amp; Household Heads</div>
            <div class="kpi-val">${pop.familiesCount ?? 12} Families</div>
            <div class="kpi-sub">${pop.headsOfFamilyCount ?? 12} Heads • Avg ${pop.avgMembersPerHousehold ?? 3.2} Members/HH</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Employed vs. Unemployed</div>
            <div class="kpi-val">${pop.employedCount ?? pop.sectoralBreakdown.employed} Employed</div>
            <div class="kpi-sub">${pop.unemployedCount ?? (pop.totalPopulation - (pop.employedCount ?? pop.sectoralBreakdown.employed))} Unemployed / Dependents</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Seniors (60+) &amp; Minors (&lt;18)</div>
            <div class="kpi-val">${pop.ageGroups.seniors60Plus} Seniors</div>
            <div class="kpi-sub">${pop.minorsUnder18 ?? pop.ageGroups.youthUnder18} Minors / Children (&lt;18 yrs)</div>
          </div>
        </div>

        <div class="two-col">
          <div>
            <h3 class="sec-title">A. City Hall Demographic &amp; Household Sub-Categories</h3>
            <table>
              <thead>
                <tr>
                  <th>City Hall Demographic Sub-Category</th>
                  <th class="num">Total Count</th>
                  <th class="num">Share / Metric</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1. Registered Voters (COMELEC Brgy. Onse)</td><td class="num"><strong>${pop.votersCount}</strong></td><td class="num">${pop.voterPercentage}%</td></tr>
                <tr><td>2. Number of Families / Households</td><td class="num"><strong>${pop.familiesCount ?? 12}</strong></td><td class="num">Distinct Households</td></tr>
                <tr><td>3. Heads of the Family</td><td class="num"><strong>${pop.headsOfFamilyCount ?? 12}</strong></td><td class="num">Household Heads</td></tr>
                <tr><td>4. Average Members per Household</td><td class="num"><strong>${pop.avgMembersPerHousehold ?? 3.2}</strong></td><td class="num">Members / Family</td></tr>
                <tr><td>5. Employed vs. Unemployed Residents</td><td class="num"><strong>${pop.employedCount ?? pop.sectoralBreakdown.employed} / ${pop.unemployedCount ?? 0}</strong></td><td class="num">Employed / Unemployed</td></tr>
                <tr><td>6. Senior Citizens (60+ years old)</td><td class="num"><strong>${pop.ageGroups.seniors60Plus}</strong></td><td class="num">${pct(pop.ageGroups.seniors60Plus)}%</td></tr>
                <tr><td>7. Minors / Children (&lt;18 years old)</td><td class="num"><strong>${pop.minorsUnder18 ?? pop.ageGroups.youthUnder18}</strong></td><td class="num">${pct(pop.minorsUnder18 ?? pop.ageGroups.youthUnder18)}%</td></tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 class="sec-title">B. Residency Type &amp; Sector Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>Residency Type / Priority Sector</th>
                  <th class="num">Count</th>
                  <th>Classification</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Homeowner / Permanent Resident</td><td class="num">${pop.housingBreakdown.homeowners}</td><td>Residency Type</td></tr>
                <tr><td>Tenant / Renter (Nangungupahan)</td><td class="num">${pop.housingBreakdown.renters}</td><td>Residency Type</td></tr>
                <tr><td>Commercial Space</td><td class="num">${pop.housingBreakdown.commercialSpaces ?? 0}</td><td>Residency Type</td></tr>
                <tr><td>Living with Relatives / Boarders</td><td class="num">${pop.housingBreakdown.livingWithRelatives + pop.housingBreakdown.boarders}</td><td>Residency Type</td></tr>
                <tr><td>Persons with Disability (PWD) / Solo Parents</td><td class="num">${pop.sectoralBreakdown.pwd} / ${pop.sectoralBreakdown.soloParents}</td><td>Priority Sector</td></tr>
                <tr><td>4Ps Beneficiaries / Students</td><td class="num">${pop.sectoralBreakdown.fourPs} / ${pop.sectoralBreakdown.students}</td><td>Socioeconomic</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <h3 class="sec-title">C. Official Barangay Population &amp; RBI Census Registry (${filteredPop.length} Records)</h3>
        <table>
          <thead>
            <tr>
              <th>RBI Number</th>
              <th>Full Legal Name</th>
              <th>Age / Sex / Civil</th>
              <th>Housing / Residency Status</th>
              <th>Voter Status</th>
              <th>Sector Tags</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            ${filteredPop
              .map(
                (r) => `
              <tr>
                <td class="mono">${escHtml(r.rbiNumber)}</td>
                <td><strong>${escHtml(r.fullName)}</strong></td>
                <td>${r.age} / ${escHtml(r.sex)} / ${escHtml(r.civilStatus)}</td>
                <td>${escHtml(r.housingStatus)}</td>
                <td><strong>${r.isRegisteredVoter ? 'Registered Voter' : 'Non-Voter'}</strong></td>
                <td>${escHtml(r.sectors.join(', '))}</td>
                <td>${escHtml(r.address)}</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else if (targetTab === 'performance') {
      bodyHtml = `
        <div class="kpi-grid">
          <div class="kpi-box">
            <div class="kpi-label">Total Applications Filed</div>
            <div class="kpi-val">${data.summary.totalApplications}</div>
            <div class="kpi-sub">Across ${data.summary.totalCatalogedDocuments} Document Types</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Completed &amp; Released</div>
            <div class="kpi-val">${data.summary.totalCompleted}</div>
            <div class="kpi-sub">${data.summary.overallCompletionRate}% Completion Rate</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">In-Progress / Pending Queue</div>
            <div class="kpi-val">${data.summary.totalActive}</div>
            <div class="kpi-sub">${data.summary.totalReady} Ready • ${data.summary.totalProcessing + data.summary.totalPending} Processing</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Realized Revenue &amp; Free Aid</div>
            <div class="kpi-val">₱${data.summary.totalRealizedRevenue.toFixed(2)}</div>
            <div class="kpi-sub">${data.summary.totalFreeGrants} Free Grants (RA 11261 / Indigency)</div>
          </div>
        </div>

        <h3 class="sec-title">Transaction Volume Breakdown by Barangay Document Type</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Document Type</th>
              <th>Category</th>
              <th class="num">Fee</th>
              <th class="num">Total Filed</th>
              <th class="num">Volume Share</th>
              <th class="num">Completed</th>
              <th class="num">In-Progress</th>
              <th class="num">Rejected</th>
              <th class="num">Realized Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${data.documents
              .map((d) => {
                const share = data.summary.totalApplications > 0
                  ? Math.round((d.totalRequested / data.summary.totalApplications) * 100)
                  : 0;
                return `
                <tr>
                  <td class="mono">${escHtml(d.code)}</td>
                  <td><strong>${escHtml(d.name)}</strong></td>
                  <td>${escHtml(d.category)}</td>
                  <td class="num">${escHtml(d.feeDisplay)}</td>
                  <td class="num"><strong>${d.totalRequested}</strong></td>
                  <td class="num">${share}%</td>
                  <td class="num">${d.completed}</td>
                  <td class="num">${d.inProgress}</td>
                  <td class="num">${d.rejected}</td>
                  <td class="num">${d.fee === 0 ? `FREE (${d.freeCompleted})` : `₱${d.realizedRevenue.toFixed(2)}`}</td>
                </tr>`;
              })
              .join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4"><strong>TOTAL TRANSACTION VOLUME &amp; COLLECTIONS</strong></td>
              <td class="num"><strong>${data.summary.totalApplications}</strong></td>
              <td class="num"><strong>100%</strong></td>
              <td class="num"><strong>${data.summary.totalCompleted}</strong></td>
              <td class="num"><strong>${data.summary.totalActive}</strong></td>
              <td class="num"><strong>${data.summary.totalRejected}</strong></td>
              <td class="num"><strong>₱${data.summary.totalRealizedRevenue.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>
      `;
    } else if (targetTab === 'service_performance') {
      bodyHtml = `
        <div class="kpi-grid">
          <div class="kpi-box">
            <div class="kpi-label">Overall Completion Efficiency</div>
            <div class="kpi-val">${data.summary.overallCompletionRate}%</div>
            <div class="kpi-sub">${data.summary.totalCompleted} of ${data.summary.totalApplications} Requests Completed</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Average Turnaround Time</div>
            <div class="kpi-val">${data.summary.avgTurnaroundDays} Days</div>
            <div class="kpi-sub">Intake to Window 2 Release</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">SLA Target Compliance</div>
            <div class="kpi-val">${data.summary.slaComplianceRate ?? 100}%</div>
            <div class="kpi-sub">Processed within Statutory SLA</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Citizen Satisfaction Rating</div>
            <div class="kpi-val">${data.summary.avgSatisfactionRating || '4.90'} / 5.0</div>
            <div class="kpi-sub">Quality of Service Delivery</div>
          </div>
        </div>

        <h3 class="sec-title">Service Performance &amp; SLA Turnaround Evaluation per Document Service</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Barangay Service / Document</th>
              <th>Statutory Basis</th>
              <th class="num">SLA Target</th>
              <th class="num">Actual Avg. Turnaround</th>
              <th class="num">Ready for Pickup</th>
              <th class="num">Active Queue</th>
              <th class="num">Completion Rate</th>
              <th>SLA Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.documents
              .map((d) => {
                const actualDays = parseFloat(d.avgTurnaroundDays) || d.processingDays;
                const withinSla = actualDays <= d.processingDays + 0.5;
                return `
                <tr>
                  <td class="mono">${escHtml(d.code)}</td>
                  <td><strong>${escHtml(d.name)}</strong></td>
                  <td>${escHtml(d.legalBasis)}</td>
                  <td class="num">${d.processingDays} Business Day(s)</td>
                  <td class="num"><strong>${d.avgTurnaroundDays} days (${d.avgTurnaroundHours} hrs)</strong></td>
                  <td class="num">${d.readyForPickup}</td>
                  <td class="num">${d.processing + d.pending}</td>
                  <td class="num"><strong>${d.completionRate}%</strong></td>
                  <td><strong>${withinSla ? 'ON-TIME SLA' : 'HIGH VOLUME'}</strong></td>
                </tr>`;
              })
              .join('')}
          </tbody>
        </table>
      `;
    } else if (targetTab === 'audit_log') {
      bodyHtml = `
        <div class="kpi-grid">
          <div class="kpi-box">
            <div class="kpi-label">Total Released &amp; Ready</div>
            <div class="kpi-val">${filteredRecords.length}</div>
            <div class="kpi-sub">Filtered Certificate Records</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Completed Releases</div>
            <div class="kpi-val">${data.summary.totalCompleted}</div>
            <div class="kpi-sub">Claimed by Residents</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Ready at Window 2</div>
            <div class="kpi-val">${data.summary.totalReady}</div>
            <div class="kpi-sub">Signed &amp; Dry-Sealed</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-label">Total Realized Collections</div>
            <div class="kpi-val">₱${data.summary.totalRealizedRevenue.toFixed(2)}</div>
            <div class="kpi-sub">${data.summary.totalFreeGrants} Free Statutory Grants</div>
          </div>
        </div>

        <h3 class="sec-title">Itemized Registry Log of Completed &amp; Released Certificates</h3>
        <table>
          <thead>
            <tr>
              <th>Tracking Code</th>
              <th>Applicant Name</th>
              <th>Certificate Type</th>
              <th>Purpose</th>
              <th class="num">Fee</th>
              <th>Date Filed</th>
              <th>Date Completed</th>
              <th class="num">Turnaround</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredRecords
              .map(
                (r) => `
              <tr>
                <td class="mono"><strong>${escHtml(r.trackingNumber)}</strong></td>
                <td><strong>${escHtml(r.applicant)}</strong></td>
                <td>${escHtml(r.documentName)}</td>
                <td>${escHtml(r.purpose)}</td>
                <td class="num">${escHtml(r.feeDisplay)}</td>
                <td class="mono">${escHtml(r.dateFiled)}</td>
                <td class="mono">${escHtml(r.dateCompleted)}</td>
                <td class="num">${escHtml(r.turnaroundDays)}</td>
                <td><strong>${escHtml(r.status)}</strong></td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      `;
    } else if (targetTab === 'catalog') {
      bodyHtml = `
        <h3 class="sec-title">Official Barangay Onse Document Catalog &amp; Mandatory Requirements</h3>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Document Title &amp; Category</th>
              <th>Statutory Legal Authority</th>
              <th class="num">Official Fee</th>
              <th class="num">Standard SLA</th>
              <th>Required Resident Documents</th>
              <th class="num">Issued</th>
            </tr>
          </thead>
          <tbody>
            ${data.documents
              .map(
                (d) => `
              <tr>
                <td class="mono"><strong>${escHtml(d.code)}</strong></td>
                <td><strong>${escHtml(d.name)}</strong><br/><span style="font-size:10px;color:#555;">${escHtml(d.category)}</span></td>
                <td>${escHtml(d.legalBasis)}</td>
                <td class="num"><strong>${escHtml(d.feeDisplay)}</strong></td>
                <td class="num">${d.processingDays} Business Day(s)</td>
                <td>${d.requirements.map((req) => `• ${escHtml(req)}`).join('<br/>')}</td>
                <td class="num">${d.completed} (${d.completionRate}%)</td>
              </tr>`
              )
              .join('')}
          </tbody>
        </table>
      `;
    }

    const printWindow = window.open('', '_blank', 'width=1050,height=800');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${escHtml(meta.title)} - Barangay Onse</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: Arial, Helvetica, sans-serif; color: #111827; margin: 0; padding: 0; font-size: 11px; line-height: 1.4; }
            .report-sheet { border: 2px solid #9C2007; padding: 16px 20px; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2.5px solid #9C2007; padding-bottom: 10px; margin-bottom: 12px; }
            .header-left { display: flex; align-items: center; gap: 12px; }
            .seal { width: 58px; height: 58px; object-fit: contain; }
            .gov-lines p { margin: 1px 0; }
            .rep-ph { font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #374151; }
            .council { font-size: 17px; font-weight: 900; color: #9C2007; text-transform: uppercase; letter-spacing: 0.02em; }
            .addr { font-size: 10px; font-weight: 700; color: #1f2937; }
            .contact { font-size: 9.5px; color: #9C2007; font-weight: 700; }
            .email { font-size: 9.5px; color: #1d4ed8; font-weight: 700; }
            .title-banner { text-align: center; background: #fef2f2; border: 1px solid #fecaca; padding: 8px 12px; border-radius: 6px; margin-bottom: 12px; }
            .title-banner h1 { margin: 0; font-size: 14px; font-weight: 900; color: #9C2007; text-transform: uppercase; letter-spacing: 0.04em; }
            .title-banner p { margin: 2px 0 0; font-size: 10px; color: #4b5563; }
            .meta-bar { display: flex; justify-content: space-between; font-size: 10px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 10px; border-radius: 4px; margin-bottom: 12px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 14px; }
            .kpi-box { border: 1px solid #cbd5e1; border-left: 4px solid #9C2007; border-radius: 6px; padding: 8px 10px; background: #ffffff; }
            .kpi-label { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #64748b; }
            .kpi-val { font-size: 16px; font-weight: 900; color: #0f172a; margin: 2px 0; }
            .kpi-sub { font-size: 9.5px; color: #475569; }
            .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px; }
            .sec-title { font-size: 11px; font-weight: 900; text-transform: uppercase; color: #9C2007; margin: 10px 0 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 10px; }
            th { background: #9C2007; color: #ffffff; font-weight: 800; text-transform: uppercase; font-size: 9px; padding: 6px 7px; text-align: left; border: 1px solid #9C2007; }
            td { padding: 5px 7px; border: 1px solid #cbd5e1; vertical-align: top; }
            tr:nth-child(even) td { background: #f8fafc; }
            tfoot td { background: #fef2f2 !important; border-top: 2px solid #9C2007; font-weight: 800; }
            .num { text-align: right; font-family: 'Courier New', monospace; }
            .mono { font-family: 'Courier New', monospace; }
            .sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin-top: 26px; text-align: center; page-break-inside: avoid; }
            .sig-line { border-bottom: 1.5px solid #111827; padding-bottom: 3px; font-weight: 900; text-transform: uppercase; font-size: 11px; margin-top: 24px; }
            .sig-role { font-size: 9.5px; font-weight: 700; color: #4b5563; text-transform: uppercase; margin-top: 3px; }
          </style>
        </head>
        <body>
          <div class="report-sheet">
            <div class="header">
              <div class="header-left">
                <img src="/images/barangay-onse-seal.png" class="seal" alt="Seal" />
                <div class="gov-lines">
                  <p class="rep-ph">Republic of the Philippines</p>
                  <p class="council">Barangay Onse Council</p>
                  <p class="addr">J.P. Rizal St., Barangay Onse, City of San Juan, Metro Manila</p>
                  <p><span class="contact">(Tel No.) 7744 - 0740</span> &nbsp;|&nbsp; <span class="email">(Email) onse.sanjuan@gmail.com</span></p>
                </div>
              </div>
              <div style="text-align:right;font-size:10px;color:#374151;">
                <strong>OFFICIAL BARANGAY REPORT</strong><br/>
                Document Control: ONSE-RPT-${new Date().getFullYear()}<br/>
                Page 1 of 1
              </div>
            </div>

            <div class="title-banner">
              <h1>${escHtml(meta.title)}</h1>
              <p>${escHtml(meta.subtitle)}</p>
            </div>

            <div class="meta-bar">
              <span><strong>Reporting Period:</strong> ${escHtml(data.reportMetadata.periodLabel)}</span>
              <span><strong>Generated as of:</strong> ${escHtml(generatedTime)}</span>
              <span><strong>Generated by:</strong> ${escHtml(data.reportMetadata.generatedBy)} (${escHtml(data.reportMetadata.userRole)})</span>
            </div>

            ${bodyHtml}

            <div class="sig-grid">
              <div>
                <div class="sig-line">${escHtml(data.reportMetadata.generatedBy || 'Records Officer')}</div>
                <div class="sig-role">Prepared By: Barangay Records Officer</div>
              </div>
              <div>
                <div class="sig-line">HON. DANILO FLORANO</div>
                <div class="sig-role">Attested By: Committee on Rules</div>
              </div>
              <div>
                <div class="sig-line">ROBERTO B. ALBA</div>
                <div class="sig-role">Approved By: Punong Barangay, Barangay Onse SJMM</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Filtered & sorted completed records
  const filteredRecords = useMemo(() => {
    if (!data?.completedRecords) return [];
    let list = [...data.completedRecords];

    if (selectedDocFilter !== 'ALL') {
      list = list.filter((r) => r.documentCode === selectedDocFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.trackingNumber.toLowerCase().includes(q) ||
          r.applicant.toLowerCase().includes(q) ||
          r.documentName.toLowerCase().includes(q) ||
          r.purpose.toLowerCase().includes(q)
      );
    }

    list.sort((a: any, b: any) => {
      let valA = a[recordsSortField] ?? '';
      let valB = b[recordsSortField] ?? '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return recordsSortDir === 'asc' ? -1 : 1;
      if (valA > valB) return recordsSortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [data?.completedRecords, selectedDocFilter, searchTerm, recordsSortField, recordsSortDir]);

  const paginatedRecords = useMemo(() => {
    const start = (recordsCurrentPage - 1) * recordsPageSize;
    return filteredRecords.slice(start, start + recordsPageSize);
  }, [filteredRecords, recordsCurrentPage, recordsPageSize]);

  const buildBreakdownHref = useCallback(
    (metric: string) => {
      const params = new URLSearchParams();
      params.set('metric', metric);
      params.set('timeframe', timeframe);
      if (timeframe === 'custom') {
        params.set('startDate', customStart);
        params.set('endDate', customEnd);
      } else if (timeframe === 'day') {
        params.set('day', selectedDay);
      } else if (timeframe === 'month') {
        params.set('year', String(selectedYear));
        params.set('month', String(selectedMonth));
      } else if (timeframe === 'quarter') {
        params.set('year', String(selectedYear));
        params.set('quarter', String(selectedQuarter));
      } else if (timeframe === 'year') {
        params.set('year', String(selectedYear));
      }
      return `/admin/reports/breakdown?${params.toString()}`;
    },
    [timeframe, customStart, customEnd, selectedDay, selectedYear, selectedMonth, selectedQuarter]
  );

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* ============================================================== */}
      {/* 1. Header & Actions Bar (Hidden or stylized during Print)      */}
      {/* ============================================================== */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-200 dark:border-blue-900/40 pb-6 print:border-b-2 print:border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-[#9C2007] dark:text-rose-400 shrink-0" />
            Report Analytics &amp; Document Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Centralized document issuance statistics, per-document completion velocity, revenue audits, and statutory fee exemption disclosures.
          </p>
        </div>

        {/* Action Buttons (Export, Print, Refresh) */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          <button
            type="button"
            onClick={fetchReport}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#0E1B33] hover:bg-slate-200 dark:hover:bg-[#152747] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 border border-slate-200 dark:border-blue-900/40 cursor-pointer disabled:opacity-50"
            title="Reload report data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => handleDownloadReport(activeTab)}
            disabled={!data || isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#0E1B33] hover:bg-slate-200 dark:hover:bg-[#152747] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 border border-slate-200 dark:border-blue-900/40 cursor-pointer disabled:opacity-50"
            title={`Download ${ACTIVE_REPORT_META[activeTab].shortLabel} (CSV)`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Download {ACTIVE_REPORT_META[activeTab].shortLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrintReport(activeTab)}
            disabled={!data || isLoading}
            className="px-4 py-2 rounded-xl bg-[#9C2007] hover:bg-[#821B06] text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            title={`Print ${ACTIVE_REPORT_META[activeTab].shortLabel}`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Printable Official Header (Shows ONLY when printing)            */}
      {/* ============================================================== */}
      <div className="hidden print:block text-center space-y-1 mb-6 border-b pb-4 border-slate-400">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">Republic of the Philippines</p>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">City of San Juan • Metro Manila</p>
        <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">BARANGAY ONSE</h2>
        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Office of the Punong Barangay &amp; Civil Registry</p>
        <div className="pt-2 text-sm font-black uppercase text-[#9C2007] underline underline-offset-4">
          Official Document Issuance &amp; Performance Audit Report
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 px-4">
          <span>Reporting Period: <strong>{data?.reportMetadata.periodLabel || 'All Time'}</strong></span>
          <span>Generated On: <strong>{new Date().toLocaleString()}</strong></span>
          <span>Prepared By: <strong>{data?.reportMetadata.generatedBy || 'Administrator'}</strong></span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. Interactive Timeframe Granularity Filter                     */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-3 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Audit &amp; Reporting Timeframe Window
            </span>
          </div>

          {/* Granularity, Category & Status Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Category:</span>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as typeof activeTab)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="population">Population &amp; City Hall Census</option>
              <option value="performance">Transaction Volume &amp; Revenue</option>
              <option value="service_performance">Service Performance &amp; SLA</option>
              <option value="audit_log">Completed Issuances Log</option>
              <option value="catalog">Document Catalog</option>
            </select>

            <span className="text-[11px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY_FOR_PICKUP">Ready for Pickup</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <span className="text-[11px] font-bold text-slate-400 uppercase">Period:</span>
            <div className="relative">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider cursor-pointer outline-none focus:ring-1 focus:ring-[#9C2007]"
              >
                <option value="all">All Time (Complete Registry)</option>
                <option value="month">Current Month ({initialPh.monthName} {initialPh.year})</option>
                <option value="quarter">Current Quarter (Q{initialPh.quarter} {initialPh.year})</option>
                <option value="year">Full Year (FY {initialPh.year})</option>
                <option value="day">Select Single Day</option>
                <option value="custom">Custom Date Range</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {timeframe === 'month' && (
              <div className="flex items-center gap-1.5 text-xs">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {MONTH_NAMES_FULL.map((name, idx) => (
                    <option key={name} value={idx + 1}>{name}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {timeframe === 'quarter' && (
              <div className="flex items-center gap-1.5 text-xs">
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value={1}>Q1 (Jan – Mar)</option>
                  <option value={2}>Q2 (Apr – Jun)</option>
                  <option value={3}>Q3 (Jul – Sep)</option>
                  <option value={4}>Q4 (Oct – Dec)</option>
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            )}

            {timeframe === 'year' && (
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>FY {y}</option>
                ))}
              </select>
            )}

            {timeframe === 'day' && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setSelectedDay(getPhNowParts().dateStr)}
                  className="px-2.5 py-1.5 bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1c345f] text-slate-700 dark:text-slate-300 rounded-lg font-bold text-[10px] uppercase transition cursor-pointer"
                >
                  Today
                </button>
              </div>
            )}

            {timeframe === 'custom' && (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-lg text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Current Active Window Banner */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0E1B33]/60 px-3.5 py-2 rounded-xl border border-slate-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>Active Reporting Scope: <strong className="text-slate-800 dark:text-slate-200">{data?.reportMetadata.periodLabel || 'Compiling...'}</strong></span>
          </div>
          <span className="font-mono text-[10px] text-slate-400">
            {data?.summary.totalApplications || 0} Total Requests Found
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. Top KPI Metric Summary Cards (Clickable Data Source Links)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Filed */}
        <Link
          href={buildBreakdownHref('total-filed')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-1 hover:border-slate-400 dark:hover:border-blue-700 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Filed</span>
            <span className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {isLoading ? '...' : data?.summary.totalApplications || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Across {data?.summary.totalCatalogedDocuments || 5} Document Types</p>
        </Link>

        {/* Total Completed */}
        <Link
          href={buildBreakdownHref('completed')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-emerald-500/20 dark:border-emerald-800/40 shadow-xs space-y-1 hover:border-emerald-500/60 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Completed &amp; Released</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
            {isLoading ? '...' : data?.summary.totalCompleted || 0}
          </div>
          <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {data?.summary.overallCompletionRate || 0}% Completion Rate
          </p>
        </Link>

        {/* In-Progress Pipeline */}
        <Link
          href={buildBreakdownHref('in-progress')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-blue-500/20 dark:border-blue-800/40 shadow-xs space-y-1 hover:border-blue-500/60 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 block">In-Progress Queue</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 font-mono">
            {isLoading ? '...' : data?.summary.totalActive || 0}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {data?.summary.totalReady || 0} Ready • {data?.summary.totalProcessing || 0} Proc.
          </p>
        </Link>

        {/* Total Realized Revenue */}
        <Link
          href={buildBreakdownHref('revenue')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-1 hover:border-slate-400 dark:hover:border-blue-700 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Realized Revenue</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
            {isLoading ? '...' : `₱${(data?.summary.totalRealizedRevenue || 0).toLocaleString()}`}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Clearances &amp; Permits</p>
        </Link>

        {/* Free Grants (RA 11261 / Indigent) */}
        <Link
          href={buildBreakdownHref('free-issuances')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-purple-500/20 dark:border-purple-800/40 shadow-xs space-y-1 hover:border-purple-500/60 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400 block">Free Issuances</span>
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 font-mono">
            {isLoading ? '...' : data?.summary.totalFreeGrants || 0}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">RA 11261 &amp; Indigency</p>
        </Link>

        {/* Average Turnaround SLA */}
        <Link
          href={buildBreakdownHref('turnaround')}
          className="group bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-amber-500/20 dark:border-amber-800/40 shadow-xs space-y-1 hover:border-amber-500/60 hover:shadow-md transition cursor-pointer block text-left"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block">Avg. Turnaround</span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition no-print">View &rarr;</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 font-mono">
            {isLoading ? '...' : `${data?.summary.avgTurnaroundDays || '1.0'} d`}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Intake to Window 2</p>
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 4. Tab Navigation: Objective 2 Report Categories               */}
      {/* ============================================================== */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-blue-900/40 no-print gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('population')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'population'
              ? 'border-[#9C2007] text-[#9C2007] dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. Population Reports ({data?.populationReport?.totalPopulation || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('performance')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'performance'
              ? 'border-[#9C2007] text-[#9C2007] dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>2. Transaction Volume Reports ({data?.summary.totalApplications || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('service_performance')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'service_performance'
              ? 'border-[#9C2007] text-[#9C2007] dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>3. Service Performance Reports</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit_log')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'audit_log'
              ? 'border-[#9C2007] text-[#9C2007] dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>4. Completed Issuances Log ({data?.completedRecords.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-[#9C2007] text-[#9C2007] dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Document Catalog</span>
        </button>
      </div>

      {/* Active Report Banner with Individual Print & Download Controls */}
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 no-print">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#9C2007]/10 text-[#9C2007] dark:text-rose-400 font-black text-[10px] uppercase tracking-wider">
              {ACTIVE_REPORT_META[activeTab].shortLabel}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              Scope: {data?.reportMetadata.periodLabel || 'All Time'}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {ACTIVE_REPORT_META[activeTab].title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {ACTIVE_REPORT_META[activeTab].subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleDownloadReport(activeTab)}
            disabled={!data || isLoading}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download {ACTIVE_REPORT_META[activeTab].shortLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => handlePrintReport(activeTab)}
            disabled={!data || isLoading}
            className="px-4 py-2 rounded-xl bg-[#9C2007] hover:bg-[#821B06] text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 0: POPULATION REPORTS (Sourced from Resident Registration) */}
      {/* ============================================================== */}
      {activeTab === 'population' && data?.populationReport && (
        <div className="space-y-6">
          {/* City Hall Required Population & Household Sub-Categories Grid (7 Official Metrics) */}
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-blue-900/40 pb-2.5">
              <div>
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>San Juan City Hall Population &amp; Household Sub-Categories</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Official demographic breakdown required for City Hall &amp; DILG barangay census reporting.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-[10px] uppercase tracking-wider self-start sm:self-center">
                City Hall Standard
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 space-y-0.5">
                <span className="text-[9.5px] font-black uppercase text-emerald-800 dark:text-emerald-300 block">1. Registered Voters</span>
                <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                  {data.populationReport.votersCount}
                </div>
                <span className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 block">{data.populationReport.voterPercentage}% of Brgy. Onse</span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/40 space-y-0.5">
                <span className="text-[9.5px] font-black uppercase text-blue-800 dark:text-blue-300 block">2. No. of Families</span>
                <div className="text-xl font-black font-mono text-blue-700 dark:text-blue-400">
                  {data.populationReport.familiesCount ?? 12}
                </div>
                <span className="text-[10px] text-blue-700/80 dark:text-blue-400/80 block">Distinct Households</span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-800/40 space-y-0.5">
                <span className="text-[9.5px] font-black uppercase text-indigo-800 dark:text-indigo-300 block">3. Heads of Family</span>
                <div className="text-xl font-black font-mono text-indigo-700 dark:text-indigo-400">
                  {data.populationReport.headsOfFamilyCount ?? 12}
                </div>
                <span className="text-[10px] text-indigo-700/80 dark:text-indigo-400/80 block">Household Heads</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/40 space-y-0.5">
                <span className="text-[9.5px] font-black uppercase text-slate-600 dark:text-slate-300 block">4. Members / Family</span>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  {data.populationReport.avgMembersPerHousehold ?? 3.2}
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Avg. Household Size</span>
              </div>

              <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/40 space-y-0.5">
                <span className="text-[9.5px] font-black uppercase text-teal-800 dark:text-teal-300 block">5. Employed vs Unemp.</span>
                <div className="text-xl font-black font-mono text-teal-700 dark:text-teal-400">
                  {data.populationReport.employedCount ?? data.populationReport.sectoralBreakdown.employed} <span className="text-xs text-slate-400">/ {data.populationReport.unemployedCount ?? (data.populationReport.totalPopulation - (data.populationReport.employedCount ?? data.populationReport.sectoralBreakdown.employed))}</span>
                </div>
                <span className="text-[10px] text-teal-700/80 dark:text-teal-400/80 block">Employed / Unemployed</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 space-y-0.5">
                <span className="text-[9.5px] font-black uppercase text-amber-800 dark:text-amber-300 block">6. Senior Citizens</span>
                <div className="text-xl font-black font-mono text-amber-700 dark:text-amber-400">
                  {data.populationReport.ageGroups.seniors60Plus}
                </div>
                <span className="text-[10px] text-amber-700/80 dark:text-amber-400/80 block">Aged 60+ Years Old</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/40 space-y-0.5">
                <span className="text-[9.5px] font-black uppercase text-purple-800 dark:text-purple-300 block">7. Minors / Children</span>
                <div className="text-xl font-black font-mono text-purple-700 dark:text-purple-400">
                  {data.populationReport.minorsUnder18 ?? data.populationReport.ageGroups.youthUnder18}
                </div>
                <span className="text-[10px] text-purple-700/80 dark:text-purple-400/80 block">Under 18 Years Old</span>
              </div>
            </div>
          </div>

          {/* Top Population Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400" />
                Total Registered Population
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">
                {data.populationReport.totalPopulation}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {data.populationReport.genderBreakdown.male} Male • {data.populationReport.genderBreakdown.female} Female
              </p>
            </div>

            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-emerald-500/20 dark:border-emerald-800/40 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Vote className="w-3.5 h-3.5" />
                Voter vs. Non-Voter
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {data.populationReport.votersCount} <span className="text-xs font-bold text-slate-400">/ {data.populationReport.nonVotersCount} Non-Voters</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {data.populationReport.voterPercentage}% Registered Voters in Brgy. Onse
              </p>
            </div>

            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-blue-500/20 dark:border-blue-800/40 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" />
                Homeowners (May-ari ng Bahay)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 font-mono">
                {data.populationReport.housingBreakdown.homeowners}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {data.populationReport.housingBreakdown.livingWithRelatives} Living with Family/Relatives
              </p>
            </div>

            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-amber-500/20 dark:border-amber-800/40 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Renters &amp; Boarders
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 font-mono">
                {data.populationReport.housingBreakdown.renters + data.populationReport.housingBreakdown.boarders}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {data.populationReport.housingBreakdown.renters} Renting • {data.populationReport.housingBreakdown.boarders} Boarders
              </p>
            </div>
          </div>

          {/* Demographic & Sectoral Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Housing & Residency Classification */}
            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs border-b border-slate-100 dark:border-blue-900/40 pb-2">
                Housing &amp; Residency Classification
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Homeowner / Permanent Resident', val: data.populationReport.housingBreakdown.homeowners, color: 'bg-blue-600' },
                  { label: 'Tenant / Renter (Nangungupahan)', val: data.populationReport.housingBreakdown.renters, color: 'bg-amber-500' },
                  { label: 'Commercial Space', val: data.populationReport.housingBreakdown.commercialSpaces ?? 0, color: 'bg-indigo-500' },
                  { label: 'Living with Relatives (Nakikitira)', val: data.populationReport.housingBreakdown.livingWithRelatives, color: 'bg-emerald-500' },
                  { label: 'Boarder / Student Dorm', val: data.populationReport.housingBreakdown.boarders, color: 'bg-purple-500' },
                ].map((item) => {
                  const pct = data.populationReport!.totalPopulation > 0
                    ? Math.round((item.val / data.populationReport!.totalPopulation) * 100)
                    : 0;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between font-bold text-[11px]">
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className="font-mono text-slate-900 dark:text-white">{item.val} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-[#0E1B33] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.max(4, pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Age & Civil Status Breakdown */}
            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs border-b border-slate-100 dark:border-blue-900/40 pb-2">
                Age Bracket &amp; Civil Status Distribution
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Youth (&lt;18)</span>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">{data.populationReport.ageGroups.youthUnder18}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Young Adult (18–30)</span>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">{data.populationReport.ageGroups.youngAdults18To30}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Adults (31–59)</span>
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white">{data.populationReport.ageGroups.adults31To59}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Seniors (60+)</span>
                  <span className="font-mono font-black text-base text-[#9C2007] dark:text-rose-400">{data.populationReport.ageGroups.seniors60Plus}</span>
                </div>
              </div>
              <div className="pt-1 flex flex-wrap items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-semibold border-t border-slate-100 dark:border-blue-900/30">
                <span>Single: <strong>{data.populationReport.civilStatusBreakdown.single}</strong></span>
                <span>Married: <strong>{data.populationReport.civilStatusBreakdown.married}</strong></span>
                <span>Widowed: <strong>{data.populationReport.civilStatusBreakdown.widowed}</strong></span>
                <span>Separated: <strong>{data.populationReport.civilStatusBreakdown.separated}</strong></span>
              </div>
            </div>

            {/* Special Sectoral Classifications */}
            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 space-y-3">
              <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs border-b border-slate-100 dark:border-blue-900/40 pb-2">
                Sectoral &amp; Priority Classifications
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">Registered Voters</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">{data.populationReport.votersCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">Non-Voters</span>
                  <span className="font-mono font-black text-slate-700 dark:text-slate-200">{data.populationReport.nonVotersCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">Senior Citizens</span>
                  <span className="font-mono font-black text-[#9C2007] dark:text-rose-400">{data.populationReport.sectoralBreakdown.seniorCitizens}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">PWD Citizens</span>
                  <span className="font-mono font-black text-blue-600 dark:text-blue-400">{data.populationReport.sectoralBreakdown.pwd}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">Solo Parents</span>
                  <span className="font-mono font-black text-purple-600 dark:text-purple-400">{data.populationReport.sectoralBreakdown.soloParents}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] flex items-center justify-between">
                  <span className="font-bold text-slate-600 dark:text-slate-300 text-[11px]">4Ps Beneficiaries</span>
                  <span className="font-mono font-black text-amber-600 dark:text-amber-400">{data.populationReport.sectoralBreakdown.fourPs}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Data dynamically populated from Resident Registration (`/register`) and the Barangay RBI Census Registry.
              </p>
            </div>
          </div>

          {/* Searchable Registered Population & Census Table */}
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-blue-900/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#9C2007] dark:text-rose-400" />
                  Registered Barangay Population &amp; RBI Census Records
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Individual resident profiles collected from Online Registration (`/register`) showing housing status, voter registration, and sector classifications.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={popHousingFilter}
                  onChange={(e) => setPopHousingFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                >
                  <option value="ALL">All Housing Types</option>
                  <option value="Homeowner">Homeowner (May-ari ng Bahay)</option>
                  <option value="Renter">Renter / Tenant (Nangungupahan)</option>
                  <option value="Relatives">Living with Relatives</option>
                  <option value="Boarder">Boarder / Student Dorm</option>
                </select>

                <select
                  value={popVoterFilter}
                  onChange={(e) => setPopVoterFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl font-bold text-slate-900 dark:text-white outline-none"
                >
                  <option value="ALL">All Voter Status</option>
                  <option value="VOTER">Registered Voters Only</option>
                  <option value="NON_VOTER">Non-Voters Only</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    value={popSearch}
                    onChange={(e) => setPopSearch(e.target.value)}
                    placeholder="Search resident or RBI #..."
                    className="w-48 sm:w-56 pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-blue-900/40">
                  <tr>
                    <th className="py-3 px-4">RBI Number</th>
                    <th className="py-3 px-4">Resident Full Name</th>
                    <th className="py-3 px-4">Age / Sex / Civil</th>
                    <th className="py-3 px-4">Housing / Residency Status</th>
                    <th className="py-3 px-4 text-center">Voter Status</th>
                    <th className="py-3 px-4">Sector Classifications</th>
                    <th className="py-3 px-4">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                  {data.populationReport.records
                    .filter((rec) => {
                      if (popHousingFilter !== 'ALL' && !rec.housingStatus.toLowerCase().includes(popHousingFilter.toLowerCase())) {
                        return false;
                      }
                      if (popVoterFilter === 'VOTER' && !rec.isRegisteredVoter) return false;
                      if (popVoterFilter === 'NON_VOTER' && rec.isRegisteredVoter) return false;
                      if (popSearch.trim()) {
                        const q = popSearch.toLowerCase();
                        return (
                          rec.fullName.toLowerCase().includes(q) ||
                          rec.rbiNumber.toLowerCase().includes(q) ||
                          rec.address.toLowerCase().includes(q) ||
                          rec.housingStatus.toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .slice(0, 25)
                    .map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                        <td className="py-3 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">
                          {rec.rbiNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          {rec.fullName}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                          {rec.age} yrs • {rec.sex} • {rec.civilStatus}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold text-[10px]">
                            {rec.housingStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              rec.isRegisteredVoter
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-[#152747] text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {rec.isRegisteredVoter ? 'Registered Voter' : 'Non-Voter'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {rec.sectors.map((sec) => (
                              <span
                                key={sec}
                                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 font-semibold text-[10px]"
                              >
                                {sec}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                          {rec.address}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SERVICE PERFORMANCE REPORTS (SLA, Turnaround & Rating)  */}
      {/* ============================================================== */}
      {activeTab === 'service_performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Overall Completion Rate</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                {data?.summary.overallCompletionRate || 0}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {data?.summary.totalCompleted || 0} of {data?.summary.totalApplications || 0} requests completed
              </p>
            </div>

            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Average Processing Turnaround</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 font-mono">
                {data?.summary.avgTurnaroundDays || '1.0'} days
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Submission to Window 2 release
              </p>
            </div>

            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">SLA Target Compliance</span>
              <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 font-mono">
                {data?.summary.slaComplianceRate ?? 100}%
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Processed within statutory SLA days
              </p>
            </div>

            <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Resident Service Rating</span>
              <div className="text-2xl sm:text-3xl font-black text-[#9C2007] dark:text-rose-400 font-mono">
                {data?.summary.avgSatisfactionRating || '4.90'} / 5.0
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Citizen feedback &amp; service quality score
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-blue-900/40">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#9C2007] dark:text-rose-400" />
                Service Performance Report per Barangay Document Service
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluates standard SLA turnaround vs. actual processing speed, service completion efficiency, and queue backlog per service.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-blue-900/40">
                  <tr>
                    <th className="py-3 px-4">Barangay Service / Document</th>
                    <th className="py-3 px-4 text-center">Standard SLA Target</th>
                    <th className="py-3 px-4 text-center">Actual Avg. Turnaround</th>
                    <th className="py-3 px-4 text-center">Ready for Pickup</th>
                    <th className="py-3 px-4 text-center">Active Processing</th>
                    <th className="py-3 px-4">Service Completion Efficiency</th>
                    <th className="py-3 px-4 text-center">SLA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                  {data?.documents.map((doc) => {
                    const actualDays = parseFloat(doc.avgTurnaroundDays) || doc.processingDays;
                    const withinSla = actualDays <= doc.processingDays + 0.5;
                    return (
                      <tr key={doc.code} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {doc.name}
                          <span className="block text-[10px] text-slate-400 font-normal">{doc.category}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-slate-300">
                          {doc.processingDays} {doc.processingDays === 1 ? 'Business Day' : 'Business Days'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-700 dark:text-amber-400">
                          {doc.avgTurnaroundDays} days ({doc.avgTurnaroundHours} hrs)
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">
                          {doc.readyForPickup}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-600 dark:text-slate-300">
                          {doc.processing + doc.pending}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 dark:bg-[#0E1B33] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(8, doc.completionRate))}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[11px]">{doc.completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              withinSla
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            {withinSla ? 'On-Time SLA' : 'High Volume'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: TOTAL PER DOCUMENTS & COMPLETED PERFORMANCE            */}
      {/* ============================================================== */}
      {(activeTab === 'performance' || typeof window === 'undefined') && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#9C2007] dark:text-rose-400" />
                  Total Documents Issued &amp; Completion Performance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed breakdown of total requests, successful issuances, completion percentage, and revenue per document code.
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                {data?.documents.length || 0} Official Documents Cataloged
              </span>
            </div>

            {/* Document Performance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-blue-900/40">
                  <tr>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Standard Fee</th>
                    <th className="py-3 px-4 text-center">Total Filed</th>
                    <th className="py-3 px-4 text-center">Completed</th>
                    <th className="py-3 px-4 text-center">In-Progress</th>
                    <th className="py-3 px-4 text-center">Rejected</th>
                    <th className="py-3 px-4">Completion Velocity</th>
                    <th className="py-3 px-4 text-right">Realized Revenue</th>
                    <th className="py-3 px-4 text-center no-print">Info</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        Compiling document analytics and issuance records...
                      </td>
                    </tr>
                  ) : !data?.documents || data.documents.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                        No document records found for the selected reporting period.
                      </td>
                    </tr>
                  ) : (
                    data.documents.map((doc) => (
                      <tr key={doc.code} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{doc.name}</span>
                              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#152747] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-blue-900/40">
                                {doc.code}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 max-w-sm">
                              {doc.category}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black ${
                              doc.fee === 0
                                ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                                : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {doc.feeDisplay}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white">
                          {doc.totalRequested}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-[11px]">
                            {doc.completed}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-blue-600 dark:text-blue-400 font-bold">
                          {doc.inProgress > 0 ? doc.inProgress : '—'}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono text-rose-600 dark:text-rose-400 font-bold">
                          {doc.rejected > 0 ? doc.rejected : '—'}
                        </td>

                        {/* Completion Rate & Visual Bar */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 min-w-[120px]">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-600 dark:text-slate-300 font-mono">
                                {doc.completionRate}%
                              </span>
                              <span className="text-slate-400 text-[9px]">
                                {doc.completed} of {doc.totalRequested}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-[#0E1B33] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  doc.completionRate >= 80
                                    ? 'bg-emerald-500'
                                    : doc.completionRate >= 50
                                    ? 'bg-blue-500'
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, doc.completionRate))}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {doc.fee === 0 ? (
                            <span className="text-purple-600 dark:text-purple-400 text-[11px]">
                              FREE ({doc.completed} granted)
                            </span>
                          ) : (
                            `₱${doc.realizedRevenue.toFixed(2)}`
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center no-print">
                          <button
                            type="button"
                            onClick={() => setSelectedDocDetails(doc)}
                            className="p-1.5 text-slate-400 hover:text-[#9C2007] dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-[#152747] transition cursor-pointer"
                            title="View document requirements & legal details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {data?.documents && data.documents.length > 0 && (
                  <tfoot className="bg-slate-50/80 dark:bg-[#0E1B33]/80 font-bold border-t-2 border-slate-200 dark:border-blue-900/60 text-[11px]">
                    <tr>
                      <td className="py-3 px-4 text-slate-900 dark:text-white uppercase font-black">
                        Total Sum / Registry Totals
                      </td>
                      <td className="py-3 px-4">—</td>
                      <td className="py-3 px-4 text-center font-mono font-black text-slate-900 dark:text-white">
                        {data.summary.totalApplications}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-emerald-700 dark:text-emerald-400">
                        {data.summary.totalCompleted}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-blue-700 dark:text-blue-400">
                        {data.summary.totalActive}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-black text-rose-700 dark:text-rose-400">
                        {data.summary.totalRejected}
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-white">
                        {data.summary.overallCompletionRate}% Overall
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                        ₱{data.summary.totalRealizedRevenue.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center no-print">—</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: DOCUMENT DEFINITIONS & "WHAT ARE THE DOCUMENTS" CATALOG */}
      {/* ============================================================== */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#9C2007] dark:text-rose-400" />
              Barangay Onse Document Catalog &amp; Documentary Requirements
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete inventory of official barangay issuances, their legal foundations, standard processing turnarounds (SLA), authorized fees, and prerequisites required from resident applicants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.documents.map((doc) => (
              <div
                key={doc.code}
                className="bg-white dark:bg-[#0B1528] rounded-2xl p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs hover:border-[#9C2007]/40 transition space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-[#152747] text-[#9C2007] dark:text-rose-400 border border-slate-200 dark:border-blue-900/40">
                          {doc.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {doc.processingDays} Business Day Turnaround
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white uppercase mt-1">
                        {doc.name}
                      </h4>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        doc.fee === 0
                          ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40'
                          : 'bg-[#9C2007]/10 text-[#9C2007] dark:text-rose-400 border border-[#9C2007]/20'
                      }`}
                    >
                      {doc.feeDisplay}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {doc.description}
                  </p>

                  {/* Legal Basis */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0E1B33]/60 border border-slate-100 dark:border-blue-900/30 text-[11px] space-y-1">
                    <span className="font-bold text-slate-400 uppercase text-[9px] block">
                      Category &amp; Statutory Authority
                    </span>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {doc.category}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px]">
                      {doc.legalBasis}
                    </p>
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Required Resident Documents:
                    </span>
                    <ul className="space-y-1 text-xs">
                      {doc.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-3 border-t border-slate-100 dark:border-blue-900/40 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>Total Issued: <strong>{doc.completed}</strong></span>
                  <span>Completion Rate: <strong className="text-emerald-600 dark:text-emerald-400">{doc.completionRate}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: AUDIT REGISTRY - ITEMIZED COMPLETED ISSUANCES           */}
      {/* ============================================================== */}
      {activeTab === 'audit_log' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0B1528] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-blue-900/40 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Itemized Registry of Released Certificates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Audit-ready transaction records of officially signed, sealed, and claimed certificates.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Document Type Filter */}
                <select
                  value={selectedDocFilter}
                  onChange={(e) => {
                    setSelectedDocFilter(e.target.value);
                    setRecordsCurrentPage(1);
                  }}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white outline-none"
                >
                  <option value="ALL">All Document Types</option>
                  {data?.documents.map((d) => (
                    <option key={d.code} value={d.code}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>

                {/* Search Box */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setRecordsCurrentPage(1);
                    }}
                    placeholder="Search applicant or tracking #..."
                    className="w-48 sm:w-60 pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-blue-900/40">
                  <tr>
                    <TableSortHeader
                      label="Tracking Code"
                      field="trackingNumber"
                      currentField={recordsSortField}
                      currentDirection={recordsSortDir}
                      onSort={handleRecordsSort}
                      className="py-3 px-4"
                    />
                    <TableSortHeader
                      label="Applicant"
                      field="applicant"
                      currentField={recordsSortField}
                      currentDirection={recordsSortDir}
                      onSort={handleRecordsSort}
                      className="py-3 px-4"
                    />
                    <th className="py-3 px-4">Certificate</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4 text-center">Fee</th>
                    <TableSortHeader
                      label="Date Completed"
                      field="dateCompleted"
                      currentField={recordsSortField}
                      currentDirection={recordsSortDir}
                      onSort={handleRecordsSort}
                      className="py-3 px-4"
                    />
                    <th className="py-3 px-4">Turnaround</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30">
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                        No completed records match the search filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((r) => (
                      <tr key={r.trackingNumber} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">
                          {r.trackingNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {r.applicant}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {r.documentName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate" title={r.purpose}>
                          {r.purpose}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                              r.feeStatus === 'FREE'
                                ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-800 dark:text-purple-300'
                                : 'bg-slate-100 dark:bg-[#0E1B33] text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            {r.feeDisplay}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {r.dateCompleted}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                          {r.turnaroundDays}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href={`/verify/${r.trackingNumber}`}
                            target="_blank"
                            className="text-[#9C2007] dark:text-rose-400 hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                          >
                            <span>Verify</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredRecords.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-blue-900/40">
                <TablePagination
                  currentPage={recordsCurrentPage}
                  pageSize={recordsPageSize}
                  totalItems={filteredRecords.length}
                  onPageChange={setRecordsCurrentPage}
                  onPageSizeChange={(newSize) => {
                    setRecordsPageSize(newSize);
                    setRecordsCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. Official Signature & Certification Block (For Printing)     */}
      {/* ============================================================== */}
      <div className="hidden print:block pt-8 mt-12 border-t border-slate-400 text-xs">
        <p className="text-[10px] text-slate-500 mb-8 italic">
          I hereby attest that the document issuance statistics and revenue summaries recorded in this official report are accurate reflections of the records in the Barangay Civil Registry.
        </p>

        <div className="grid grid-cols-3 gap-8 text-center">
          <div className="space-y-1">
            <div className="border-b border-slate-800 pb-8 font-bold uppercase text-slate-900">
              {data?.reportMetadata.generatedBy || 'Desk Officer'}
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Prepared By: Records Officer</p>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-800 pb-8 font-bold uppercase text-slate-900">
              Hon. Danilo Florano
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Attested: Committee on Rules</p>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-800 pb-8 font-bold uppercase text-slate-900">
              Hon. Roberto Alba
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-500">Approved: Punong Barangay</p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. Document Specs Detail Modal                                 */}
      {/* ============================================================== */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-blue-900/50">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 dark:bg-[#152747] text-[#9C2007] dark:text-rose-400">
                  {selectedDocDetails.code}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-1">
                  {selectedDocDetails.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Description</span>
                <p className="text-slate-700 dark:text-slate-200 mt-0.5 leading-relaxed">
                  {selectedDocDetails.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0E1B33]">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Official Fee</span>
                  <p className="font-black text-[#9C2007] dark:text-rose-400 text-sm">
                    {selectedDocDetails.feeDisplay}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[9px] block">Standard Turnaround</span>
                  <p className="font-black text-slate-900 dark:text-white text-sm">
                    {selectedDocDetails.processingDays} Business Day
                  </p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Statutory Legal Authority</span>
                <p className="text-slate-700 dark:text-slate-300 mt-0.5 font-medium">
                  {selectedDocDetails.legalBasis}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">
                  Prerequisite Documents for Release
                </span>
                <ul className="space-y-1">
                  {selectedDocDetails.requirements.map((req, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDocDetails(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-[#0E1B33] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#152747] font-bold text-xs uppercase rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

