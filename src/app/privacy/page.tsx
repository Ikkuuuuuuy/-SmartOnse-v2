'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Scale, 
  FileText, 
  Building2, 
  Mail, 
  Phone, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FDF8F6] pt-28 md:pt-36 pb-24 px-4 sm:px-6 lg:px-12 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500 hover:text-[#9C2007] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Home</span>
        </Link>

        {/* Official Header Card */}
        <div className="bg-white rounded-3xl sm:rounded-[3rem] p-8 sm:p-12 shadow-xl border border-slate-100 relative overflow-hidden space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-black uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                NPC Advisory Compliance &bull; R.A. 10173
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
                Data Privacy Policy &amp; Security Manual
              </h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                Barangay Onse, City of San Juan, Metro Manila
              </p>
            </div>

            <div className="w-20 h-20 bg-emerald-50 rounded-3xl border border-emerald-200 flex items-center justify-center p-3 shrink-0">
              <img src="/images/barangay-onse-seal.png" alt="Barangay Seal" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong>Effective Date:</strong> August 2026 &bull; <strong>Statutory Mandate:</strong> Republic Act No. 10173 (Data Privacy Act of 2012) &amp; National Privacy Commission (NPC) Circular No. 16-01 on Personal Data Protection.
          </div>
        </div>

        {/* Comprehensive Policy Clauses */}
        <div className="bg-white rounded-3xl sm:rounded-[3rem] p-8 sm:p-12 shadow-xl border border-slate-100 space-y-10 text-xs sm:text-sm leading-relaxed text-slate-700">
          
          {/* Section 1: Declaration of Policy */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
              <Scale className="w-5 h-5 text-[#9C2007]" />
              <span>1. Declaration of Policy &amp; Legal Basis</span>
            </h2>
            <p>
              Barangay Onse adheres strictly to the state policy declared in <strong>Republic Act No. 10173</strong>, otherwise known as the <em>Data Privacy Act of 2012</em>, to protect the fundamental human right of privacy of communication while ensuring the free flow of information to promote government innovation and public welfare.
            </p>
            <p>
              This Privacy Manual governs the collection, recording, storage, updating, modification, retrieval, consultation, use, consolidation, blocking, erasure, or destruction of Personal Identifiable Information (PII) and Sensitive Personal Information (SPI) within the <strong>SmartOnse E-Governance Platform</strong>.
            </p>
          </section>

          {/* Section 2: Personal Data Collected */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-5 h-5 text-[#9C2007]" />
              <span>2. Categories of Personal Data Collected</span>
            </h2>
            <p>
              To process civil certificates, clearance verifications, business clearances, indigent certifications, and emergency assistance, the barangay collects the following:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">👤 Citizen Identification</strong>
                Full legal name, birthdate, civil status, gender, and voter precinct number.
              </li>
              <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">📍 Residential Proof</strong>
                Complete household address in Barangay Onse and length of residency.
              </li>
              <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">📞 Contact Information</strong>
                Mobile phone number, email address, and emergency contact details.
              </li>
              <li className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900 block mb-1">🪪 Government ID Records</strong>
                Scanned copies of valid government-issued photo IDs for clearance verification.
              </li>
            </ul>
          </section>

          {/* Section 3: Purpose of Processing */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="w-5 h-5 text-[#9C2007]" />
              <span>3. Lawful Purpose &amp; Use of Information</span>
            </h2>
            <p>
              Under <strong>Section 12 and Section 13 of R.A. 10173</strong>, data processing is carried out pursuant to official functions of Barangay Onse under the <strong>Local Government Code of 1991 (R.A. 7160)</strong> for the following purposes:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Issuance of digital Barangay Clearances, Certificates of Residency, and Indigency Documents.</li>
              <li>Verification of applicant identity and anti-fraud cross-referencing.</li>
              <li>Disaster Risk Reduction Management (DRRM) and emergency community advisories.</li>
              <li>Sangguniang Kabataan (SK) youth educational assistance and community welfare tracking.</li>
            </ol>
          </section>

          {/* Section 4: Security Measures & Encryption */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="w-5 h-5 text-emerald-700" />
              <span>4. Technical &amp; Organizational Security Measures</span>
            </h2>
            <div className="space-y-2">
              <p>
                SmartOnse implements multi-layered security controls to protect citizen data against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block">🔒 AES-256 Encryption</span>
                  Sensitive records and password credentials are cryptographic hashes.
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block">🛡️ Role-Based Access</span>
                  Only vetted Barangay desk officers with authorized RBAC clearance can view documents.
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="font-bold text-emerald-900 block">📜 Audit Logs</span>
                  Every record lookup, approval, and print job is logged with timestamp.
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Statutory Rights of Data Subjects */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase flex items-center gap-2 border-b border-slate-100 pb-2">
              <Eye className="w-5 h-5 text-[#9C2007]" />
              <span>5. Rights of the Citizen (Data Subject)</span>
            </h2>
            <p>
              As a constituent of Barangay Onse, you are endowed with the statutory rights under Chapter VIII of R.A. 10173:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900">Right to be Informed:</strong> You have the right to know whether personal data pertaining to you is being processed.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900">Right to Access:</strong> You may request reasonable access to your personal data records held by the barangay.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900">Right to Rectification:</strong> You have the right to dispute and correct any inaccuracies in your profile.
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="text-slate-900">Right to Erasure or Blocking:</strong> You may suspend, withdraw, or order the removal of unlawfully obtained data.
              </div>
            </div>
          </section>

          {/* Section 6: Contact Data Protection Officer */}
          <section className="p-6 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl space-y-4">
            <h3 className="text-base font-black uppercase tracking-wider flex items-center gap-2 text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
              <span>Data Protection Officer (DPO) Contact Details</span>
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed">
              If you have any questions, clarifications, complaints, or inquiries regarding your rights under the Data Privacy Act of 2012, please reach out to our designated Data Protection Officer:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                <span className="text-emerald-300 font-bold block">Office of the DPO</span>
                Barangay Onse Hall, 3 J.V. Panganiban St., San Juan City
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/20">
                <span className="text-emerald-300 font-bold block">Direct Inquiries</span>
                Email: <span className="underline font-mono">privacy@onse.gov.ph</span> / Tel: (02) 8123-4567
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
