'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, MapPin, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  if (success) {
    return (
      <div className="min-h-screen py-16 bg-slate-50 dark:bg-[#070D18] flex items-center justify-center px-4 transition-colors duration-200">
        <div className="w-full max-w-md bg-white dark:bg-[#0E1B33] rounded-3xl p-8 border border-slate-200 dark:border-blue-900/50 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Registration Received!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Welcome to SmartOnse! Your account has been registered. You may now log in to request certificates and access e-services.
          </p>
          <Link
            href="/login"
            className="inline-block w-full py-3 bg-[#9C2007] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#8B1A05] transition"
          >
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 bg-gradient-to-br from-[#9C2007]/10 via-slate-50 to-slate-100 dark:from-[#330A04] dark:via-[#070D18] dark:to-[#0B1528] flex items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0E1B33] rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-blue-900/50 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#9C2007]/20 flex items-center justify-center mx-auto shadow-md p-1.5">
            <img src="/images/barangay-onse-seal.png" alt="Seal" className="w-full h-full object-contain"  />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Resident Registration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Create your official Barangay Onse citizen profile</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan Martinez Dela Cruz"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007]"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Mobile Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0917-xxx-xxxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Address in Barangay Onse *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Unit #, Street, Barangay Onse, San Juan City"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Password *</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007]"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Confirm Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007]"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded text-[#9C2007] focus:ring-[#9C2007]"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-600 dark:text-slate-400">
              I agree to the <Link href="/terms" className="text-[#9C2007] dark:text-rose-400 font-bold hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#9C2007] dark:text-rose-400 font-bold hover:underline">Privacy Policy</Link> of Barangay Onse.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-extrabold uppercase tracking-wider shadow-md shadow-[#9C2007]/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-slate-100 dark:border-blue-900/40 pt-4 text-center text-xs text-slate-600 dark:text-slate-400">
          <span>Already registered? </span>
          <Link href="/login" className="font-extrabold text-[#9C2007] dark:text-rose-400 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}

