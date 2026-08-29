'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ProfileManagementPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'kyc'>('profile');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: 'Juan Dela Cruz',
    email: 'testresident@smartonse.com',
    birthdate: '1995-06-15',
    phone_number: '0917-111-0007',
    house_number: '3',
    street: 'J V Panganiban',
    is_verified: true,
    two_factor_enabled: false,
  });

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [verify2FACode, setVerify2FACode] = useState('');

  // Password State
  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('Profile information updated successfully.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setSuccessMsg('Password updated successfully.');
    setPasswords({ current_password: '', password: '', password_confirmation: '' });
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      setShow2FASetup(false);
      setSuccessMsg('Two-factor authentication disabled.');
    } else {
      setShow2FASetup(true);
    }
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (verify2FACode.length >= 6) {
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setVerify2FACode('');
      setSuccessMsg('Two-Factor Authentication is now enabled on your account!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg('Please enter a valid 6-digit authentication code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F6] pt-32 pb-24 px-4 sm:px-6 lg:px-10 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-600 transition hover:border-[#9C2007]/40 hover:text-[#9C2007] shadow-sm mb-3"
            >
              ← Back to Portal
            </Link>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#9C2007]">Account Settings</p>
            <h1 className="mt-1 text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900">
              Account &amp; Profile Viewing
            </h1>
          </div>

          {/* KYC Status Pill */}
          <div className="flex items-center gap-3 bg-white p-3 px-5 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Status</p>
              <p className="text-xs font-black text-emerald-700 uppercase tracking-wider">
                {formData.is_verified ? '✓ Verified Resident (KYC Approved)' : '⏳ Pending KYC Review'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'profile'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            👤 Personal Info
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'kyc'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            🪪 Identity Verification (KYC)
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition ${
              activeTab === 'security'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            🛡️ Security &amp; 2FA
          </button>
        </div>

        {/* Toast Alerts */}
        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-xs font-bold text-emerald-800 shadow-sm flex items-center gap-2">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-xs font-bold text-rose-800 shadow-sm flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: Profile Information */}
        {activeTab === 'profile' && (
          <section className="rounded-[3rem] border border-slate-200 bg-white p-8 md:p-12 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Profile Details</h2>
            <p className="text-xs text-slate-500 font-medium mb-8">
              Update your residential and contact information for barangay records.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Full Legal Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 p-4 text-sm font-semibold focus:ring-[#9C2007] focus:border-[#9C2007]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 p-4 text-sm font-semibold focus:ring-[#9C2007] focus:border-[#9C2007]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Birthdate</label>
                  <input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 p-4 text-sm font-semibold focus:ring-[#9C2007] focus:border-[#9C2007]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 p-4 text-sm font-semibold focus:ring-[#9C2007] focus:border-[#9C2007]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">House / Unit No.</label>
                  <input
                    type="text"
                    value={formData.house_number}
                    onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 p-4 text-sm font-semibold focus:ring-[#9C2007] focus:border-[#9C2007]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Street Name</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 p-4 text-sm font-semibold focus:ring-[#9C2007] focus:border-[#9C2007]"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#9C2007] hover:bg-[#8B1A05] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-900/20 transition cursor-pointer"
                >
                  Save Profile Information
                </button>
              </div>
            </form>
          </section>
        )}

        {/* TAB 2: Identity Verification (KYC) */}
        {activeTab === 'kyc' && (
          <section className="rounded-[3rem] border border-slate-200 bg-white p-8 md:p-12 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Identity Verification (KYC)</h2>
            <p className="text-xs text-slate-500 font-medium mb-8">
              Verify your identity by uploading official government IDs to request certificates and clearances.
            </p>

            <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 mb-8 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-4xl shrink-0">
                🛡️
              </div>
              <div className="flex-1">
                <h3 className="font-black text-slate-900 text-lg mb-1">Your Identity is Verified</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Your identity has been authenticated against the Barangay Onse Resident Registry. You have full clearance to request digitized documents with cryptographic proof of authenticity.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Upload Updated ID Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                className="block w-full max-w-lg rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs"
              />
              <p className="text-[11px] text-slate-400">Accepted formats: JPEG, PNG, or WebP up to 5MB.</p>
            </div>
          </section>
        )}

        {/* TAB 3: Security & 2FA */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* 2FA Section */}
            <section className="rounded-[3rem] border border-slate-200 bg-white p-8 md:p-12 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">
                    Two-Factor Authentication (2FA)
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Add an extra layer of security using Google Authenticator or Microsoft Authenticator.
                  </p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition cursor-pointer shrink-0 ${
                    twoFactorEnabled
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-[#9C2007] text-white hover:bg-[#8B1A05] shadow-lg shadow-red-900/20'
                  }`}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {show2FASetup && !twoFactorEnabled && (
                <div className="mt-8 bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 space-y-6">
                  <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">
                    Scan Authenticator QR Code
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-36 h-36 bg-white p-3 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center text-5xl">
                      📱
                    </div>
                    <div className="space-y-2 text-xs text-slate-600 font-medium">
                      <p>1. Open your authenticator app (Google Authenticator, Authy, etc.).</p>
                      <p>2. Scan this QR code or manually enter secret key: <strong className="font-mono text-slate-900">SMART-ONSE-2026-KEY</strong></p>
                      <p>3. Enter the 6-digit confirmation code below:</p>
                    </div>
                  </div>

                  <form onSubmit={handleConfirm2FA} className="flex gap-3 max-w-sm">
                    <input
                      type="text"
                      placeholder="e.g. 123456"
                      value={verify2FACode}
                      onChange={(e) => setVerify2FACode(e.target.value)}
                      maxLength={6}
                      className="w-full rounded-2xl border-slate-200 p-3 text-center text-base font-black tracking-widest font-mono focus:ring-[#9C2007] focus:border-[#9C2007]"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-[#9C2007] hover:bg-[#8B1A05] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shrink-0 transition"
                    >
                      Confirm
                    </button>
                  </form>
                </div>
              )}
            </section>

            {/* Password Update Section */}
            <section className="rounded-[3rem] border border-slate-200 bg-white p-8 md:p-12 shadow-xl">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Update Password</h2>
              <p className="text-xs text-slate-500 font-medium mb-8">
                Ensure your account is using a long, random password to stay secure.
              </p>

              <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current_password}
                    onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 p-4 text-sm font-semibold focus:ring-[#9C2007] focus:border-[#9C2007]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwords.password}
                    onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 p-4 text-sm font-semibold focus:ring-[#9C2007] focus:border-[#9C2007]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.password_confirmation}
                    onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })}
                    className="w-full rounded-2xl border-slate-200 p-4 text-sm font-semibold focus:ring-[#9C2007] focus:border-[#9C2007]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#000055] hover:bg-[#000080] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md transition cursor-pointer"
                >
                  Change Password
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
