'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  FileText, 
  Download, 
  Upload, 
  CheckCircle2, 
  Scale, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Edit3,
  Trash2,
  X, 
  Search, 
  Filter,
  RefreshCw,
  Loader2,
  UploadCloud,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import TablePagination from '@/components/ui/TablePagination';
import TableSortHeader from '@/components/ui/TableSortHeader';

export interface TransparencyDoc {
  id: string;
  code?: string;
  title: string;
  year: string;
  quarter: string;
  fileSize: string;
  fileUrl?: string;
  status: string;
  uploadedBy: string;
  date: string;
  category?: string;
}

const INITIAL_DOCUMENTS: TransparencyDoc[] = [];
/*
const DEPRECATED_DOCUMENTS: TransparencyDoc[] = [
  { id: 'FDB-2026-20', code: 'FDB-2026-20', title: 'Monthly Barangay Financial Report (Form 83) - July 2026', year: 'FY 2026', quarter: 'July 2026', fileSize: '1.9 MB (PDF)', status: 'VERIFIED_COA', uploadedBy: 'Barangay Treasurer', date: '2026-08-10' },
  { id: 'FDB-2026-19', code: 'FDB-2026-19', title: 'SK Monthly Statement of Receipts & Expenditures - July 2026', year: 'FY 2026', quarter: 'July 2026', fileSize: '1.2 MB (PDF)', status: 'VERIFIED_NYC', uploadedBy: 'SK Treasurer', date: '2026-08-08' },
  { id: 'FDB-2026-18', code: 'FDB-2026-18', title: 'Barangay Disaster Risk Reduction Management Fund (BDRRMF) Utilization Q2', year: 'FY 2026', quarter: 'Q2 2026', fileSize: '2.1 MB (PDF)', status: 'VERIFIED_COA', uploadedBy: 'DRRM Officer', date: '2026-07-28' },
  { id: 'FDB-2026-17', code: 'FDB-2026-17', title: 'Annual Budget & Internal Revenue Allotment (IRA) - Form 83 Q2 Summary', year: 'FY 2026', quarter: 'Q2 2026', fileSize: '2.8 MB (PDF)', status: 'VERIFIED_COA', uploadedBy: 'Barangay Treasurer', date: '2026-07-15' },
  { id: 'FDB-2026-16', code: 'FDB-2026-16', title: 'Annual Procurement Plan (APP) & BAC Bid Resolutions Q2', year: 'FY 2026', quarter: 'Q2 2026', fileSize: '4.2 MB (PDF)', status: 'DILG_POSTED', uploadedBy: 'BAC Secretariat', date: '2026-07-10' },
  { id: 'FDB-2026-15', code: 'FDB-2026-15', title: 'Quarterly Summary of Barangay Clearances and Fees Realization', year: 'FY 2026', quarter: 'Q2 2026', fileSize: '1.5 MB (PDF)', status: 'VERIFIED_COA', uploadedBy: 'Desk Officer', date: '2026-07-05' },
  { id: 'FDB-2026-14', code: 'FDB-2026-14', title: 'Barangay Assembly SOBA Financial Accomplishment Presentation', year: 'FY 2026', quarter: 'Q2 2026', fileSize: '5.1 MB (PDF)', status: 'DILG_POSTED', uploadedBy: 'Punong Barangay', date: '2026-06-30' },
  { id: 'FDB-2026-13', code: 'FDB-2026-13', title: 'Senior Citizens & PWD 1% Statutory Fund Allocation Ledger', year: 'FY 2026', quarter: 'Q2 2026', fileSize: '1.3 MB (PDF)', status: 'VERIFIED_COA', uploadedBy: 'Barangay Treasurer', date: '2026-06-25' },
  { id: 'FDB-2026-12', code: 'FDB-2026-12', title: 'GAD (Gender and Development) 5% Mandatory Plan & Budget Audit', year: 'FY 2026', quarter: 'Q2 2026', fileSize: '2.4 MB (PDF)', status: 'VERIFIED_COA', uploadedBy: 'GAD Focal Person', date: '2026-06-15' },
  { id: 'FDB-2026-11', code: 'FDB-2026-11', title: 'SK 10% Comprehensive Barangay Youth Development Plan (CBYDP) Mid-Year Review', year: 'FY 2026', quarter: 'Q2 2026', fileSize: '3.4 MB (PDF)', status: 'VERIFIED_NYC', uploadedBy: 'SK Treasurer', date: '2026-06-01' },
];
*/

export default function AdminTransparencyPage() {
  const [documents, setDocuments] = useState<TransparencyDoc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<TransparencyDoc | null>(null);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewName, setFilePreviewName] = useState('');
  const [calculatedFileSize, setCalculatedFileSize] = useState('');
  const [fileBase64, setFileBase64] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Upload Form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    year: 'FY 2026',
    quarter: 'Q3 2026',
    category: 'Financial Statement',
  });

  const handleFileSelect = (file: File) => {
    const validExts = ['.pdf', '.doc', '.docx', '.xlsx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validExts.includes(ext)) {
      setFileError('Invalid file type. Please upload a PDF, DOC, DOCX, or XLSX file.');
      return;
    }
    // 8MB limit
    if (file.size > 8 * 1024 * 1024) {
      setFileError('File size exceeds 8MB limit. Please upload a smaller document.');
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    setFilePreviewName(file.name);

    // Auto-calculate formatted file size
    const extClean = ext.replace('.', '').toUpperCase();
    const formattedSize = file.size >= 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB (${extClean})`
      : `${Math.round(file.size / 1024)} KB (${extClean})`;
    setCalculatedFileSize(formattedSize);

    // Autofill title if blank
    if (!uploadForm.title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setUploadForm((prev) => ({ ...prev, title: cleanName }));
    }

    // Convert file to Base64 data URL
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFilePreviewName('');
    setCalculatedFileSize('');
    setFileBase64('');
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/transparency');
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.documents) && data.documents.length > 0) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to fetch transparency records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/transparency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadForm,
          fileSize: calculatedFileSize || '1.8 MB (PDF)',
          fileUrl: fileBase64 || '#',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.document) {
        setDocuments((prev) => [data.document, ...prev]);
        setIsUploadModalOpen(false);
        setUploadForm({
          title: '',
          year: 'FY 2026',
          quarter: 'Q3 2026',
          category: 'Financial Statement',
        });
        handleClearFile();
      } else {
        alert(data.error || 'Failed to upload disclosure.');
      }
    } catch (err) {
      console.error('Error uploading disclosure:', err);
      alert('An error occurred while uploading disclosure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/transparency/${editingDoc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingDoc),
      });
      const data = await res.json();
      if (res.ok && data.success && data.document) {
        setDocuments((prev) =>
          prev.map((d) => (d.id === editingDoc.id ? { ...d, ...data.document } : d))
        );
        setEditingDoc(null);
      } else {
        alert(data.error || 'Failed to update disclosure.');
      }
    } catch (err) {
      console.error('Error updating disclosure:', err);
      alert('An error occurred while updating disclosure.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to remove disclosure "${title}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/transparency/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(data.error || 'Failed to delete disclosure.');
      }
    } catch (err) {
      console.error('Error deleting disclosure:', err);
      alert('An error occurred while deleting disclosure.');
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const processedDocs = useMemo(() => {
    return documents
      .filter((d) => {
        const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
        const matchesYear = yearFilter === 'ALL' || d.year === yearFilter;
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          (d.id && d.id.toLowerCase().includes(q)) ||
          (d.title && d.title.toLowerCase().includes(q)) ||
          (d.quarter && d.quarter.toLowerCase().includes(q)) ||
          (d.uploadedBy && d.uploadedBy.toLowerCase().includes(q));
        return matchesStatus && matchesYear && matchesSearch;
      })
      .sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [documents, searchTerm, statusFilter, yearFilter, sortField, sortDirection]);

  const paginatedDocs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedDocs.slice(startIndex, startIndex + pageSize);
  }, [processedDocs, currentPage, pageSize]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Full Disclosure Board &bull; Public Records
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">DILG &amp; COA Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Barangay Financial Transparency Board
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDocs}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Syncing...' : 'Sync Records'}</span>
          </button>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        
        {/* Search and Filters Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by disclosure title, document code, quarter, or poster..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-2xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-1 focus:ring-[#9C2007] outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Year:</span>
              <select
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-xs font-bold text-slate-900 dark:text-white cursor-pointer outline-none focus:ring-1 focus:ring-[#9C2007]"
              >
                <option value="ALL">All Years</option>
                <option value="FY 2026">FY 2026</option>
                <option value="FY 2025">FY 2025</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
              <tr>
                <TableSortHeader
                  field="id"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Document Code"
                />
                <TableSortHeader
                  field="title"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Disclosure Title"
                />
                <TableSortHeader
                  field="year"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Fiscal Year"
                />
                <TableSortHeader
                  field="quarter"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Period"
                />
                <TableSortHeader
                  field="fileSize"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Size"
                />
                <TableSortHeader
                  field="date"
                  currentField={sortField}
                  currentDirection={sortDirection}
                  onSort={handleSort}
                  label="Published Date"
                />
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
              {paginatedDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No transparency disclosures found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedDocs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-slate-400">
                      {d.code || d.id.slice(0, 11)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white max-w-sm">{d.title}</div>
                      <div className="text-[10px] text-slate-400">Posted by {d.uploadedBy}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#9C2007] dark:text-rose-400">{d.year}</td>
                    <td className="py-3.5 px-4">{d.quarter}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{d.fileSize}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">{d.date}</td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {d.fileUrl && d.fileUrl !== '#' && (
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={d.title}
                            className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-emerald-200/60 dark:border-emerald-900/40"
                            title="Download/view uploaded file"
                          >
                            <Download className="w-3 h-3" />
                            <span>View</span>
                          </a>
                        )}
                        <button
                          onClick={() => setEditingDoc({ ...d })}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-700 dark:text-slate-300 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-transparent dark:border-blue-900/40"
                          title="Edit disclosure record"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(d.id, d.title)}
                          className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white rounded-lg font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-rose-200/60 dark:border-rose-900/40"
                          title="Delete disclosure record"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination */}
        <TablePagination
          currentPage={currentPage}
          totalItems={processedDocs.length}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => setPageSize(size)}
        />
      </div>

      {/* Upload Disclosure Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Upload Disclosure Document</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Post certified public finance ledgers or DILG Form 83 reports.</p>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* Interactive File Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Document File Attachment</span>
                  {calculatedFileSize && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px] normal-case font-bold">
                      {calculatedFileSize}
                    </span>
                  )}
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xlsx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                />

                {selectedFile ? (
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-[#0E1B33] border border-emerald-500/40 dark:border-emerald-500/30 rounded-2xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        {filePreviewName.endsWith('.xlsx') ? (
                          <FileSpreadsheet className="w-5 h-5" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate text-xs">
                          {filePreviewName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          Ready to attach • {calculatedFileSize}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearFile}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                      isDragging
                        ? 'border-[#9C2007] bg-red-500/10'
                        : 'border-slate-300 dark:border-blue-900/60 hover:border-[#9C2007] dark:hover:border-[#9C2007] bg-slate-50/50 dark:bg-[#0E1B33]/40'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#152747] text-slate-600 dark:text-slate-300 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5 text-[#9C2007]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        Click to browse or drag and drop document here
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Accepts PDF, DOC, DOCX, XLSX (Max 8MB)
                      </p>
                    </div>
                  </div>
                )}

                {fileError && (
                  <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-[11px] pt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fileError}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Document Title</label>
                <input
                  required
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="e.g. Monthly Statement of Receipts and Expenditures"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Fiscal Year</label>
                  <select
                    value={uploadForm.year}
                    onChange={(e) => setUploadForm({ ...uploadForm, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  >
                    <option value="FY 2026">FY 2026</option>
                    <option value="FY 2025">FY 2025</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Period / Quarter</label>
                  <input
                    required
                    value={uploadForm.quarter}
                    onChange={(e) => setUploadForm({ ...uploadForm, quarter: e.target.value })}
                    placeholder="e.g. Q3 2026"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 rounded-xl font-bold uppercase text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#9C2007] text-white rounded-xl font-bold uppercase text-[11px] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Uploading...' : 'Upload & Publish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Disclosure Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingDoc(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Edit Disclosure Record</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Modify transparency disclosure details.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Document Title</label>
                <input
                  required
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Fiscal Year</label>
                  <input
                    value={editingDoc.year}
                    onChange={(e) => setEditingDoc({ ...editingDoc, year: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Period / Quarter</label>
                  <input
                    value={editingDoc.quarter}
                    onChange={(e) => setEditingDoc({ ...editingDoc, quarter: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 rounded-xl font-bold uppercase text-[11px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#9C2007] text-white rounded-xl font-bold uppercase text-[11px] shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{isSubmitting ? 'Updating...' : 'Update Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
