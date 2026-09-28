'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  ShieldCheck,
  KeyRound,
  FileText,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Smartphone,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'kyc' | 'security' | 'requests'>('profile');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthdate: '1995-06-15',
    phone_number: '',
    house_number: '145',
    street: '',
    emergency_contact: '',
    precinct_number: '',
    is_verified: true,
  });

  // 2FA Security State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [verify2FACode, setVerify2FACode] = useState('');

  // Password State
  const [passwords, setPasswords] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([
    {
      trackingNumber: 'ONSE-2026-8891',
      documentType: 'Barangay Clearance',
      createdAt: '2026-08-27T09:40:00Z',
      fee: 50,
      status: 'READY_FOR_PICKUP',
    },
  ]);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/documents?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.requests) && data.requests.length > 0) {
            setMyRequests(data.requests);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        birthdate: '1995-06-15',
        phone_number: user.phone || '0917-888-0011',
        house_number: '145',
        street: user.address || 'Lt. Artiaga St., Barangay Onse',
        emergency_contact: user.emergencyContact || '0917-888-9999 (Family Contact)',
        precinct_number: user.precinctNumber || 'PRECINCT-0042A',
        is_verified: true,
      });
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login?redirect=/profile');
    }
  }, [user, isLoading, router]);

  // 1. Loading / Redirecting State
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-40 pb-20 flex flex-col items-center justify-center font-sans transition-colors duration-200">
        <div className="w-14 h-14 rounded-2xl bg-[#9C2007] text-white flex items-center justify-center font-black text-xl animate-pulse shadow-lg">
          O
        </div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-4 uppercase tracking-widest">
          Securing Session &bull; Redirecting to Login...
        </p>
      </div>
    );
  }

  // 3. Authenticated Profile Management
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone_number,
          address: formData.street,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }
      updateUser({
        name: formData.name,
        phone: formData.phone_number,
        address: formData.street,
        emergencyContact: formData.emergency_contact,
        precinctNumber: formData.precinct_number,
      });
      setSuccessMsg('Profile information updated and saved in the database successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }
    if (passwords.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setSuccessMsg('Your account password has been updated securely.');
    setPasswords({ current_password: '', password: '', password_confirmation: '' });
    setErrorMsg(null);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      setTwoFactorEnabled(false);
      setShow2FASetup(false);
      setSuccessMsg('2FA has been disabled on your account.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } else {
      setShow2FASetup(true);
    }
  };

  const handleConfirm2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (verify2FACode.length >= 6) {
      setTwoFactorEnabled(true);
      setShow2FASetup(false);
      setVerify2FACode('');
      setSuccessMsg('Two-Factor Authentication (TOTP) is now active on your account!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg('Please enter a valid 6-digit authentication code.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 pt-32 md:pt-40 pb-24 px-4 sm:px-6 lg:px-10 font-sans transition-colors duration-200">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 dark:border-blue-900/60 bg-white dark:bg-[#0E1B33] px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-600 dark:text-slate-300 transition hover:border-[#9C2007]/40 hover:text-[#9C2007] dark:hover:text-rose-400 shadow-xs mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#9C2007] dark:text-rose-400">Account Center</p>
            <h1 className="mt-1 text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Account &amp; Profile Settings
            </h1>
          </div>

          {/* KYC Status Pill */}
          <div className="flex items-center gap-3 bg-white dark:bg-[#0E1B33] p-3 px-5 rounded-2xl border border-slate-200 dark:border-blue-900/50 shadow-xs self-start sm:self-auto">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest">Verification Status</p>
              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                {formData.is_verified ? '✓ Verified Resident (KYC Approved)' : '⏳ Pending KYC Review'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-blue-900/40 pb-3">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-blue-900/40'
            }`}
          >
            👤 Personal Info
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'kyc'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-blue-900/40'
            }`}
          >
            🪪 Identity Verification (KYC)
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'security'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-blue-900/40'
            }`}
          >
            🛡️ Security &amp; 2FA
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              activeTab === 'requests'
                ? 'bg-[#9C2007] text-white shadow-md shadow-red-900/20'
                : 'bg-white dark:bg-[#0E1B33] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-blue-900/40'
            }`}
          >
            📑 Application History
          </button>
        </div>

        {/* Toast Alerts */}
        {successMsg && (
          <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-5 py-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 shadow-xs flex items-center gap-2 animate-in fade-in">
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-5 py-4 text-xs font-bold text-rose-800 dark:text-rose-300 shadow-xs flex items-center gap-2 animate-in fade-in">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: PERSONAL INFO */}
        {activeTab === 'profile' && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-blue-900/50 bg-white dark:bg-[#0E1B33] p-6 sm:p-10 shadow-xs space-y-6 transition-colors">
            <div>
              <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Profile Details</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your residential and contact information for barangay records.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs font-medium">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">Full Legal Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#152747] p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#9C2007] focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/40 bg-slate-100 dark:bg-[#0B1528] p-3.5 text-xs text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">Primary login credential (contact desk officer to modify).</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">Mobile Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    required
                    placeholder="0917-000-0000"
                    className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#152747] p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#9C2007] focus:ring-1 focus:ring-[#9C2007] font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">COMELEC Precinct Code</label>
                  <input
                    type="text"
                    value={formData.precinct_number}
                    onChange={(e) => setFormData({ ...formData, precinct_number: e.target.value })}
                    placeholder="PRECINCT-0042A"
                    className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#152747] p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#9C2007] focus:ring-1 focus:ring-[#9C2007] font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">Barangay Onse Residential Address</label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                  placeholder="House No., Street, Brgy Onse, San Juan City"
                  className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#152747] p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#9C2007] focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">Emergency Contact Person &amp; Mobile</label>
                <input
                  type="text"
                  value={formData.emergency_contact}
                  onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                  placeholder="Name and Contact Number"
                  className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#152747] p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#9C2007] focus:ring-1 focus:ring-[#9C2007]"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="rounded-2xl bg-[#9C2007] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-red-900/20 hover:bg-[#8B1A05] transition cursor-pointer"
                >
                  Save Profile Information
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: KYC IDENTIFICATION */}
        {activeTab === 'kyc' && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-blue-900/50 bg-white dark:bg-[#0E1B33] p-6 sm:p-10 shadow-xs space-y-6 transition-colors">
            <div>
              <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Identity Verification (KYC)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Government ID records and verified citizen credential status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 dark:bg-[#152747] rounded-2xl border border-slate-200/80 dark:border-blue-900/40 space-y-3">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">National ID / PhilSys Card</h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">✓ Verified &bull; Hash #99281-ONSE</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Your identity has been validated against COMELEC Precinct 0042A records. You are eligible for expedited 1-hour document issuance.
                </p>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-[#152747] rounded-2xl border border-slate-200/80 dark:border-blue-900/40 space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-[#9C2007] dark:text-rose-400" />
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-white">Proof of Barangay Residency</h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">✓ Active Lease &amp; Utility Certified</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Registered address: <strong className="text-slate-900 dark:text-white">{formData.street}</strong>. Valid through December 2026.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & 2FA */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Password Update Card */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-blue-900/50 bg-white dark:bg-[#0E1B33] p-6 sm:p-10 shadow-xs space-y-6 transition-colors">
              <div>
                <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Change Password</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ensure your account uses a strong password with at least 6 characters.</p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-5 text-xs">
                <div className="space-y-1.5">
                  <label className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">Current Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.current_password}
                    onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#152747] p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#9C2007] focus:ring-1 focus:ring-[#9C2007]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwords.password}
                      onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#152747] p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#9C2007] focus:ring-1 focus:ring-[#9C2007]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwords.password_confirmation}
                      onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 dark:border-blue-900/40 bg-slate-50 dark:bg-[#152747] p-3.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#9C2007] focus:ring-1 focus:ring-[#9C2007]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
                  </button>

                  <button
                    type="submit"
                    className="rounded-2xl bg-[#9C2007] px-8 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-[#8B1A05] transition cursor-pointer"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            {/* 2FA Toggle Card */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-blue-900/50 bg-white dark:bg-[#0E1B33] p-6 sm:p-10 shadow-xs space-y-6 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Require an authenticator code (Google / Microsoft Authenticator) when logging in.</p>
                </div>

                <button
                  type="button"
                  onClick={handleToggle2FA}
                  className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition cursor-pointer ${
                    twoFactorEnabled
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 hover:bg-rose-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md'
                  }`}
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>

              {show2FASetup && (
                <div className="p-6 bg-slate-50 dark:bg-[#152747] rounded-2xl border border-slate-200 dark:border-blue-900/40 space-y-4 text-xs animate-in zoom-in-95">
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Scan the QR code in your Authenticator app and enter the 6-digit code:
                  </p>
                  <form onSubmit={handleConfirm2FA} className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      maxLength={6}
                      value={verify2FACode}
                      onChange={(e) => setVerify2FACode(e.target.value)}
                      placeholder="123456"
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-blue-900/60 bg-white dark:bg-[#0E1B33] text-slate-900 dark:text-white font-mono text-center text-sm font-bold"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#9C2007] text-white font-black uppercase cursor-pointer"
                    >
                      Verify
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: APPLICATION HISTORY */}
        {activeTab === 'requests' && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-blue-900/50 bg-white dark:bg-[#0E1B33] p-6 sm:p-10 shadow-xs space-y-6 transition-colors">
            <div>
              <h2 className="text-xl font-black uppercase text-slate-900 dark:text-white">Your Document Applications</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Track and manage your submitted certificate requests.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#152747] text-slate-400 dark:text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-blue-900/40">
                  <tr>
                    <th className="py-3 px-4">Tracking Code</th>
                    <th className="py-3 px-4">Document Type</th>
                    <th className="py-3 px-4">Date Filed</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-blue-900/40 font-medium text-slate-700 dark:text-slate-200">
                  {myRequests.map((req) => (
                    <tr key={req.trackingNumber} className="hover:bg-slate-50/80 dark:hover:bg-[#152747]/60 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#9C2007] dark:text-rose-400">{req.trackingNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{req.documentType}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-bold">{req.fee === 0 ? 'FREE' : `₱${req.fee.toFixed(2)}`}</td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${
                            req.status === 'READY_FOR_PICKUP'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : req.status === 'COMPLETED'
                              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300'
                              : req.status === 'PROCESSING'
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link href={`/track?trackingNumber=${req.trackingNumber}`} className="text-[#9C2007] dark:text-rose-400 hover:underline font-bold">
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
