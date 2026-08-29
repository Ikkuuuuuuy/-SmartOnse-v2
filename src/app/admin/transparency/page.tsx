'use client';

import React, { useState } from 'react';
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
  X
} from 'lucide-react';

export default function AdminTransparencyPage() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const [documents, setDocuments] = useState([
    {
      id: 'FDB-2026-01',
      title: 'Annual Budget & Internal Revenue Allotment (IRA) - Form 83',
      year: 'FY 2026',
      quarter: 'Q2 (Ending June 2026)',
      fileSize: '2.4 MB (PDF)',
      status: 'VERIFIED_COA',
      uploadedBy: 'Barangay Treasurer',
      date: 'July 15, 2026',
    },
    {
      id: 'FDB-2026-02',
      title: 'Barangay Disaster Risk Reduction Management Fund (BDRRMF) Utilization',
      year: 'FY 2026',
      quarter: 'Q2',
      fileSize: '1.8 MB (PDF)',
      status: 'VERIFIED_COA',
      uploadedBy: 'DRRM Officer',
      date: 'July 18, 2026',
    },
    {
      id: 'FDB-2026-03',
      title: 'Sangguniang Kabataan (SK) 10% Comprehensive Barangay Youth Plan & Budget',
      year: 'FY 2026',
      quarter: 'Annual 2026',
      fileSize: '3.1 MB (PDF)',
      status: 'VERIFIED_NYC',
      uploadedBy: 'SK Treasurer',
      date: 'January 20, 2026',
    },
    {
      id: 'FDB-2026-04',
      title: 'Annual Procurement Plan (APP) & Bids and Awards Committee (BAC) Resolutions',
      year: 'FY 2026',
      quarter: 'Q1 - Q2',
      fileSize: '4.2 MB (PDF)',
      status: 'DILG_POSTED',
      uploadedBy: 'BAC Secretariat',
      date: 'July 10, 2026',
    },
  ]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              DILG Full Disclosure Policy (FDP) &bull; COA Audit
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Executive Order No. 2, s. 2016</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Full Disclosure Board &amp; Financials
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>+ Upload Disclosure File</span>
          </button>
        </div>
      </div>

      {/* Disclosures Table */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Mandatory Published Disclosures (DILG Form 83 &amp; COA)
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {documents.length} Disclosures Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Date Published</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#9C2007] dark:text-rose-400 shrink-0" />
                      <span>{doc.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 pl-6">{doc.fileSize}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">{doc.quarter} ({doc.year})</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{doc.uploadedBy}</td>
                  <td className="py-3.5 px-4 text-slate-400">{doc.date}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-black uppercase flex items-center gap-1 w-fit">
                      <ShieldCheck className="w-3 h-3" />
                      COA Audited
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Downloading ${doc.title}`)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-[#0E1B33] hover:bg-[#9C2007] dark:hover:bg-[#9C2007] text-slate-800 dark:text-slate-200 hover:text-white rounded-xl font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer border border-transparent dark:border-blue-900/40"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0B1528] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 dark:border-blue-900/50 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white">Upload Disclosure Document</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Publish quarterly financial statement or procurement record to DILG board.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsUploadModalOpen(false);
                alert('Document published to Public Transparency Board!');
              }}
              className="space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Disclosure Title</label>
                <input required placeholder="e.g. Q3 Quarterly Financial Statement" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Fiscal Year</label>
                  <input required placeholder="FY 2026" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Quarter</label>
                  <input required placeholder="Q3 (July - Sept)" className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Upload PDF File</label>
                <input type="file" accept=".pdf" required className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-[#9C2007]" />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0E1B33] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#152747] font-bold uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black uppercase shadow-md transition cursor-pointer"
                >
                  Publish Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
