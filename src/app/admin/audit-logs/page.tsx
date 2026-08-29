'use client';

import React, { useState } from 'react';
import { 
  FolderLock, 
  ShieldCheck, 
  Search, 
  Download, 
  Key, 
  Clock, 
  User, 
  FileText,
  Lock
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([
    {
      id: 'LOG-8891',
      action: 'CLEARANCE_APPROVED',
      details: 'Approved Barangay Clearance #ONSE-2026-8891 for Juan Dela Cruz',
      actor: 'Hon. Roberto Alba (Captain)',
      ip: '192.168.1.45',
      timestamp: '2026-08-28 16:32:10',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      id: 'LOG-8890',
      action: 'LEDGER_DISBURSEMENT',
      details: 'Recorded Form 83 disbursement of ₱145,200.00 for Philippine Red Cross Blood Drive',
      actor: 'Jonathan D. Sorio (Staff)',
      ip: '192.168.1.12',
      timestamp: '2026-08-28 15:45:00',
      sha256: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    },
    {
      id: 'LOG-8889',
      action: 'CITIZEN_REGISTERED',
      details: 'Indexed and verified new resident profile Maria Clara Santos',
      actor: 'Jonathan D. Sorio (Staff)',
      ip: '192.168.1.12',
      timestamp: '2026-08-28 14:12:35',
      sha256: '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce',
    },
    {
      id: 'LOG-8888',
      action: 'RBAC_ROLE_SWITCH',
      details: 'User authenticated with 2FA and activated Barangay Captain session',
      actor: 'Hon. Roberto Alba (Captain)',
      ip: '192.168.1.45',
      timestamp: '2026-08-28 13:00:22',
      sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    },
  ]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0B1528] p-6 rounded-3xl border border-slate-200/80 dark:border-blue-900/40 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9C2007] dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900/50 px-2.5 py-0.5 rounded-full">
              Tamper-Proof Ledger &bull; ISO/IEC 27001
            </span>
            <span className="text-[10px] font-bold text-slate-400">&bull;</span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Security Audit Trail</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Cryptographic Audit Logs (SHA-256)
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Exporting signed audit logs...')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-[#0E1B33] hover:bg-slate-200 dark:hover:bg-[#152747] text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-transparent dark:border-blue-900/40"
          >
            <Download className="w-4 h-4" />
            <span>Export Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="bg-white dark:bg-[#0B1528] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-blue-900/40 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
            System Event &amp; Modification Log
          </h3>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            All Hashes Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#080E1A] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Event Description</th>
                <th className="py-3 px-4">Actor / Officer</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-blue-950/40 font-medium text-slate-700 dark:text-slate-300">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-[#0E1B33]/60 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500 dark:text-slate-400">{l.id}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#0E1B33] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-blue-900/40 text-[10px] font-bold font-mono">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-900 dark:text-white font-bold max-w-xs">{l.details}</td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{l.actor}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400 dark:text-slate-500">{l.ip}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{l.timestamp}</td>
                  <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[120px]" title={l.sha256}>
                    {l.sha256}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
