'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  LayoutGrid, 
  List, 
  Building2, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  X,
  FileCheck2,
  HelpCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface TransparencyDoc {
  id: string;
  code: string;
  title: string;
  category: string;
  year: string;
  quarter: string;
  fileUrl: string;
  fileSize: string;
  publishedDate: string;
  council: 'BARANGAY' | 'SK';
}

const FALLBACK_TRANSPARENCY: TransparencyDoc[] = [
  {
    id: 'DOC-01',
    code: 'FDB-2026-01',
    title: 'CY 2026 Annual Barangay Budget & Appropriations Ordinance',
    category: 'Financial Budget',
    year: '2026',
    quarter: 'Annual',
    fileUrl: '/documents/transparency-annual-budget-2026.pdf',
    fileSize: '2.4 MB PDF',
    publishedDate: '2026-01-15',
    council: 'BARANGAY',
  },
  {
    id: 'DOC-02',
    code: 'FDB-2026-02',
    title: 'Q2 2026 20% Barangay Development Fund (BDF) Utilization Report',
    category: 'Development Fund',
    year: '2026',
    quarter: 'Q2',
    fileUrl: '/documents/transparency-bdf-q2-2026.pdf',
    fileSize: '1.8 MB PDF',
    publishedDate: '2026-07-28',
    council: 'BARANGAY',
  },
  {
    id: 'DOC-03',
    code: 'FDB-2026-03',
    title: 'CY 2026 Annual Procurement Plan (APP) & BAC Bid Resolutions',
    category: 'Procurement',
    year: '2026',
    quarter: 'Annual',
    fileUrl: '/documents/transparency-app-2026.pdf',
    fileSize: '3.1 MB PDF',
    publishedDate: '2026-01-05',
    council: 'BARANGAY',
  },
  {
    id: 'DOC-04',
    code: 'FDB-2026-04',
    title: 'Q2 2026 Gender and Development (GAD) Fund Accomplishment Report',
    category: 'GAD Fund',
    year: '2026',
    quarter: 'Q2',
    fileUrl: '/documents/transparency-gad-q2-2026.pdf',
    fileSize: '1.2 MB PDF',
    publishedDate: '2026-06-15',
    council: 'BARANGAY',
  },
  {
    id: 'DOC-05',
    code: 'FDB-2026-05',
    title: 'SK Annual Barangay Youth Investment Program (ABYIP 2026)',
    category: 'SK Investment Plan',
    year: '2026',
    quarter: 'Annual',
    fileUrl: '/documents/transparency-sk-abyip-2026.pdf',
    fileSize: '2.1 MB PDF',
    publishedDate: '2026-01-08',
    council: 'SK',
  },
  {
    id: 'DOC-06',
    code: 'FDB-2026-06',
    title: 'SK Q2 2026 Youth Development Fund (YDF) Itemized Receipts',
    category: 'SK Financial',
    year: '2026',
    quarter: 'Q2',
    fileUrl: '/documents/transparency-sk-ydf-q2-2026.pdf',
    fileSize: '1.5 MB PDF',
    publishedDate: '2026-07-12',
    council: 'SK',
  },
  {
    id: 'DOC-07',
    code: 'FDB-2025-07',
    title: 'Comprehensive Barangay Youth Development Plan (CBYDP 2024-2026)',
    category: 'SK Strategic Plan',
    year: '2024',
    quarter: 'Annual',
    fileUrl: '/documents/transparency-cbydp.pdf',
    fileSize: '4.5 MB PDF',
    publishedDate: '2024-01-10',
    council: 'SK',
  },
  {
    id: 'DOC-08',
    code: 'FDB-2025-08',
    title: 'Notice of Award - Multi-Purpose Hall Rehabilitation Project',
    category: 'Bids & Awards',
    year: '2025',
    quarter: 'Q4',
    fileUrl: '/documents/transparency-hall-award.pdf',
    fileSize: '950 KB PDF',
    publishedDate: '2025-12-20',
    council: 'BARANGAY',
  },
];

export default function TransparencyPage() {
  const [documents, setDocuments] = useState<TransparencyDoc[]>(FALLBACK_TRANSPARENCY);
  const [councilFilter, setCouncilFilter] = useState<'ALL' | 'BARANGAY' | 'SK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedDoc, setSelectedDoc] = useState<TransparencyDoc | null>(null);

  // Fetch real-time records from API
  useEffect(() => {
    async function loadDisclosures() {
      try {
        const res = await fetch('/api/transparency');
        if (res.ok) {
          const data = await res.json();
          if (data.documents && data.documents.length > 0) {
            setDocuments(data.documents);
          }
        }
      } catch {
        // Fallback initialized
      }
    }
    loadDisclosures();
  }, []);

  // Compute distinct years and categories for dropdowns
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(documents.map((d) => d.year))).filter(Boolean);
    return years.sort((a, b) => b.localeCompare(a));
  }, [documents]);

  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(documents.map((d) => d.category))).filter(Boolean);
    return cats.sort();
  }, [documents]);

  // Filtered documents
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      // Council filter
      if (councilFilter !== 'ALL' && doc.council !== councilFilter) {
        return false;
      }
      // Year filter
      if (yearFilter !== 'ALL' && doc.year !== yearFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'ALL' && doc.category !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesCode = doc.code.toLowerCase().includes(query);
        const matchesCat = doc.category.toLowerCase().includes(query);
        return matchesTitle || matchesCode || matchesCat;
      }
      return true;
    });
  }, [documents, councilFilter, yearFilter, categoryFilter, searchQuery]);

  // Aggregate stats
  const totalCount = documents.length;
  const barangayCount = documents.filter((d) => d.council === 'BARANGAY').length;
  const skCount = documents.filter((d) => d.council === 'SK').length;

  const handleDownload = (doc: TransparencyDoc) => {
    if (!doc.fileUrl || doc.fileUrl === '#') {
      setSelectedDoc(doc);
    } else {
      window.open(doc.fileUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-28 md:pt-36 pb-24 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Minimalist Header Section (Badge removed as requested) */}
        <header className="text-center space-y-3 max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9C2007] dark:text-rose-400">
            Barangay Onse • San Juan City
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Transparency <span className="text-[#9C2007] dark:text-rose-500">Board</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Public financial ledgers, annual budget appropriations, procurement documents, and official audit disclosures.
          </p>
          <div className="h-1 w-16 bg-[#9C2007] dark:bg-rose-500 mx-auto rounded-full mt-2" />
        </header>

        {/* Civic Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white/90 dark:bg-[#0E1B33]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Disclosures
            </span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
              {totalCount}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              Permanent public records
            </span>
          </div>

          <div className="bg-white/90 dark:bg-[#0E1B33]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Barangay Council
            </span>
            <div className="text-2xl sm:text-3xl font-black text-[#9C2007] dark:text-rose-400 mt-1">
              {barangayCount}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              Budgets, APPs &amp; BDF audits
            </span>
          </div>

          <div className="bg-white/90 dark:bg-[#0E1B33]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Sangguniang Kabataan
            </span>
            <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">
              {skCount}
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              CBYDP, ABYIP &amp; youth funds
            </span>
          </div>

          <div className="bg-white/90 dark:bg-[#0E1B33]/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-blue-900/40 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Public Accessibility
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              100%
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
              Open to all constituents
            </span>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="bg-white dark:bg-[#0E1B33] p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-md space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            
            {/* Council Selector Tabs */}
            <div className="inline-flex p-1 bg-slate-100 dark:bg-[#070D18] rounded-2xl border border-slate-200 dark:border-blue-900/50 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setCouncilFilter('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  councilFilter === 'ALL'
                    ? 'bg-white dark:bg-[#152747] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Records ({totalCount})
              </button>
              <button
                type="button"
                onClick={() => setCouncilFilter('BARANGAY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  councilFilter === 'BARANGAY'
                    ? 'bg-[#9C2007] text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Barangay Council ({barangayCount})
              </button>
              <button
                type="button"
                onClick={() => setCouncilFilter('SK')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  councilFilter === 'SK'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                SK Youth Council ({skCount})
              </button>
            </div>

            {/* View Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-[#070D18] p-1 rounded-2xl border border-slate-200 dark:border-blue-900/50">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-[#152747] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-[#152747] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Table Ledger View"
                aria-label="Table Ledger View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search, Year and Category Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100 dark:border-blue-900/30">
            {/* Search Input */}
            <div className="md:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search disclosure by title, code, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-blue-900/40 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#9C2007]/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Fiscal Year Filter */}
            <div className="md:col-span-3">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-blue-900/40 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#9C2007]/50"
              >
                <option value="ALL">All Fiscal Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    FY {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:col-span-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#070D18] border border-slate-200 dark:border-blue-900/40 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#9C2007]/50"
              >
                <option value="ALL">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter & Active Filters Reset */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <div>
            Showing <span className="font-bold text-slate-900 dark:text-white">{filteredDocs.length}</span> of {totalCount} records
          </div>
          {(searchQuery || yearFilter !== 'ALL' || categoryFilter !== 'ALL' || councilFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setYearFilter('ALL');
                setCategoryFilter('ALL');
                setCouncilFilter('ALL');
              }}
              className="text-[#9C2007] dark:text-rose-400 hover:underline font-semibold"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Content Section: Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => {
              const isSk = doc.council === 'SK';
              return (
                <div
                  key={doc.id}
                  className="bg-white dark:bg-[#0E1B33] p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-blue-900/40 hover:border-slate-300 dark:hover:border-blue-700/60 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                          isSk
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-400 border-rose-200 dark:border-rose-900/50'
                        }`}
                      >
                        {doc.category}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">
                        {doc.year} • {doc.quarter}
                      </span>
                    </div>

                    {/* Document Title */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-400 block mb-1">
                        {doc.code}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-[#9C2007] dark:group-hover:text-rose-400 transition-colors">
                        {doc.title}
                      </h3>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Published {doc.publishedDate}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-blue-900/30 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all shadow-xs ${
                        isSk
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-[#9C2007] hover:bg-[#7D1905] dark:bg-rose-600 dark:hover:bg-rose-700 text-white'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download ({doc.fileSize})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="p-2.5 bg-slate-50 dark:bg-[#152747] hover:bg-slate-100 dark:hover:bg-[#1C335C] text-slate-600 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-blue-900/40 transition-colors"
                      title="View Details"
                      aria-label="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Content Section: Table Ledger View */}
        {viewMode === 'table' && (
          <div className="bg-white dark:bg-[#0E1B33] rounded-3xl border border-slate-200 dark:border-blue-900/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#070D18] border-b border-slate-200 dark:border-blue-900/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-4 px-5">Ref Code</th>
                    <th className="py-4 px-5">Title</th>
                    <th className="py-4 px-5">Council</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Period</th>
                    <th className="py-4 px-5">Size</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-900/30 text-slate-700 dark:text-slate-200">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/60 dark:hover:bg-[#152747]/50 transition-colors">
                      <td className="py-4 px-5 font-mono text-[11px] text-slate-400">
                        {doc.code}
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900 dark:text-white max-w-sm">
                        {doc.title}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.council === 'SK'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-[#9C2007] dark:text-rose-400'
                        }`}>
                          {doc.council}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-600 dark:text-slate-300">
                        {doc.category}
                      </td>
                      <td className="py-4 px-5 whitespace-nowrap">
                        {doc.year} • {doc.quarter}
                      </td>
                      <td className="py-4 px-5 text-slate-400 whitespace-nowrap">
                        {doc.fileSize}
                      </td>
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDownload(doc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase text-slate-700 dark:text-slate-200 hover:text-white hover:bg-[#9C2007] dark:hover:bg-rose-600 border border-slate-200 dark:border-blue-900/50 transition-all"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty Search Result State */}
        {filteredDocs.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-[#0E1B33] rounded-3xl border border-slate-200 dark:border-blue-900/40 p-8 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No transparency documents found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We couldn&apos;t find any disclosures matching your filter criteria. Try adjusting your search keywords or resetting filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setYearFilter('ALL');
                setCategoryFilter('ALL');
                setCouncilFilter('ALL');
              }}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Freedom of Information (FOI) & Certified Copy Section */}
        <div className="bg-gradient-to-br from-slate-900 to-[#122442] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
              Constituent Freedom of Information
            </span>
            <h2 className="text-2xl font-black tracking-tight">
              Need a Certified Physical Copy or Specific Financial Ledger?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              In accordance with Executive Order on Freedom of Information, verified residents and business owners can request certified true copies of barangay resolutions and financial statements directly through our online portal or at the Barangay Secretariat Desk.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <Link
              href="/portal/request"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#9C2007] hover:bg-rose-700 text-white text-xs font-bold uppercase rounded-xl transition-all shadow-md"
            >
              <span>Submit FOI Request</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase rounded-xl border border-white/20 transition-all"
            >
              <span>Barangay Desk Info</span>
            </Link>
          </div>
        </div>

      </div>

      {/* Document Details & Download Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0E1B33] text-slate-900 dark:text-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-blue-900/60 relative space-y-6">
            <button
              type="button"
              onClick={() => setSelectedDoc(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-[#152747] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 block">
                {selectedDoc.code}
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-snug">
                {selectedDoc.title}
              </h3>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300">
                  {selectedDoc.category}
                </span>
                <span className="text-xs text-slate-400">
                  FY {selectedDoc.year} • {selectedDoc.quarter}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-[#070D18] p-4 rounded-2xl border border-slate-200 dark:border-blue-900/40 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Filing Council:</span>
                <span className="font-semibold">{selectedDoc.council === 'SK' ? 'Sangguniang Kabataan' : 'Barangay Council'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Published:</span>
                <span className="font-semibold">{selectedDoc.publishedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File Format:</span>
                <span className="font-semibold">{selectedDoc.fileSize}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authentication:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Official Certified Copy
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  alert(`Official Certified Document "${selectedDoc.title}" is ready. In production, this opens the verified PDF repository.`);
                  setSelectedDoc(null);
                }}
                className="flex-1 py-3 bg-[#9C2007] hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Open Certified File</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-3 bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1C335C] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
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
