'use client';

import React, { useState } from 'react';
import { FileText, Printer, CheckCircle2, Search, X, QrCode } from 'lucide-react';

export default function AdminRequestsPage() {
  const [filter, setFilter] = useState('ALL');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [requests, setRequests] = useState([
    {
      id: '1',
      trackingNumber: 'ONSE-2026-8891',
      fullName: 'Juan Dela Cruz',
      documentType: 'Barangay Clearance',
      fee: 50.0,
      status: 'READY_FOR_PICKUP',
      purpose: 'Local Employment Application',
      address: '124 Gomez St., Barangay Onse, San Juan City',
      contactNumber: '0917-123-4567',
      createdAt: '2026-08-27',
    },
    {
      id: '2',
      trackingNumber: 'ONSE-2026-9012',
      fullName: 'Maria Clara Santos',
      documentType: 'Certificate of Indigency',
      fee: 0.0,
      status: 'PROCESSING',
      purpose: 'Medical and Hospital Assistance',
      address: '45 Blumentritt St., Barangay Onse, San Juan City',
      contactNumber: '0917-234-5678',
      createdAt: '2026-08-27',
    },
    {
      id: '3',
      trackingNumber: 'ONSE-2026-9045',
      fullName: 'Roberto Mendoza',
      documentType: 'Certificate of Residency',
      fee: 30.0,
      status: 'PENDING',
      purpose: 'Opening Bank Account',
      address: '88 Onse Compound, San Juan City',
      contactNumber: '0918-345-6789',
      createdAt: '2026-08-28',
    },
  ]);

  const updateStatus = (id: string, newStatus: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#9C2007]">Document Review Pipeline</span>
          <h1 className="text-3xl font-black text-slate-900 uppercase">Clearance Requests Queue</h1>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Tracking Code</th>
                <th className="p-4">Applicant</th>
                <th className="p-4">Document Type</th>
                <th className="p-4">Purpose</th>
                <th className="p-4">Fee</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-mono font-bold text-[#9C2007]">{r.trackingNumber}</td>
                  <td className="p-4 font-bold text-slate-900">{r.fullName}</td>
                  <td className="p-4">{r.documentType}</td>
                  <td className="p-4 max-w-xs truncate text-slate-500">{r.purpose}</td>
                  <td className="p-4 font-bold">{r.fee === 0 ? 'FREE' : `₱${r.fee}`}</td>
                  <td className="p-4">
                    <select
                      value={r.status}
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border-none ${
                        r.status === 'READY_FOR_PICKUP'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'PROCESSING'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="READY_FOR_PICKUP">READY FOR PICKUP</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedRequest(r)}
                      className="px-3 py-1.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-lg font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Certificate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT CERTIFICATE MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center no-print">
              <h3 className="font-black text-slate-900 uppercase">Printable Official Certificate</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Official Certificate Paper */}
            <div className="border-4 border-double border-[#9C2007] p-8 sm:p-12 space-y-6 text-slate-900 bg-white">
              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-[#9C2007] pb-4">
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full overflow-hidden p-1 bg-white">
                    <img src="/images/barangay-onse-seal.png" alt="Barangay Onse Seal" className="w-full h-full object-contain" />
                  </div>
                </div>
                <p className="text-xs uppercase font-semibold text-slate-600">Republic of the Philippines &bull; City of San Juan</p>
                <h2 className="text-xl font-black uppercase text-[#9C2007]">OFFICE OF THE PUNONG BARANGAY</h2>
                <p className="text-xs font-bold text-slate-800 uppercase tracking-widest">BARANGAY ONSE</p>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h1 className="text-2xl font-black uppercase tracking-wider underline decoration-[#9C2007] decoration-2">
                  {selectedRequest.documentType}
                </h1>
                <p className="text-xs font-mono font-bold text-slate-500 mt-1">
                  Control No: {selectedRequest.trackingNumber}
                </p>
              </div>

              {/* Body */}
              <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-justify">
                <p>
                  <strong>TO WHOM IT MAY CONCERN:</strong>
                </p>
                <p>
                  This is to certify that <strong>{selectedRequest.fullName.toUpperCase()}</strong>, of legal age, is a bonafide resident of <strong>{selectedRequest.address}</strong>, Barangay Onse, San Juan City.
                </p>
                <p>
                  Based on records of this office, the aforementioned individual is known to be of good moral character, a law-abiding citizen, and has no derogatory records or pending criminal case filed in the Lupong Tagapamayapa.
                </p>
                <p>
                  This certification is issued upon the request of the interested party for the purpose of <strong>{selectedRequest.purpose.toUpperCase()}</strong> and for whatever legal purposes it may serve.
                </p>
                <p>
                  Issued this <strong>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> at Barangay Onse, San Juan City, Metro Manila.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="w-32 border-b border-slate-400 mx-auto mb-1"></div>
                  <p className="font-bold uppercase">Applicant Signature</p>
                </div>
                <div>
                  <p className="font-black text-sm uppercase text-[#9C2007]">HON. ALEJANDRO SANTOS</p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase">Punong Barangay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
