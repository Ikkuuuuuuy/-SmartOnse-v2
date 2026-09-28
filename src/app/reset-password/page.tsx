'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing password reset token. Please request a new link from the Forgot Password page.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#0E1B33] rounded-3xl p-8 border border-slate-200 dark:border-blue-900/50 shadow-2xl space-y-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#9C2007]/10 dark:bg-rose-950/40 text-[#9C2007] dark:text-rose-400 flex items-center justify-center mx-auto">
        <Lock className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Set New Password</h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Create a secure password with at least 8 characters.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs text-left flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600 dark:text-emerald-400" />
          <p className="font-bold text-sm">Password Updated Successfully!</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
            Redirecting to sign in page...
          </p>
        </div>
      ) : (
        <form onSubmit={handleReset} className="space-y-4 text-xs text-left">
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl focus:ring-1 focus:ring-[#9C2007] text-slate-900 dark:text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl focus:ring-1 focus:ring-[#9C2007] text-slate-900 dark:text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-md shadow-[#9C2007]/20 flex items-center justify-center gap-2"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      )}

      <div className="pt-2">
        <Link href="/login" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#9C2007] dark:hover:text-rose-400 inline-flex items-center gap-1 transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen py-16 bg-[#FDF8F6] dark:bg-[#070D18] flex items-center justify-center px-4 font-sans transition-colors duration-200">
      <Suspense fallback={<div className="text-xs font-bold text-slate-400">Loading form...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

