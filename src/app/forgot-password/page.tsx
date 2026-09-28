'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request password reset.');
      }
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 bg-[#FDF8F6] dark:bg-[#070D18] flex items-center justify-center px-4 font-sans transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0E1B33] rounded-3xl p-8 border border-slate-200 dark:border-blue-900/50 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#9C2007]/10 dark:bg-rose-950/40 text-[#9C2007] dark:text-rose-400 flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Forgot Password</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Enter your registered email address to receive password reset instructions.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs text-left">
            {error}
          </div>
        )}

        {sent ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
            <p className="font-bold">Password Reset Link Dispatched!</p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
              If an account exists with <strong>{email}</strong>, we have sent instructions to your inbox. Please check your spam folder as well.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase text-[11px]">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-xl focus:ring-1 focus:ring-[#9C2007] text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-md shadow-[#9C2007]/20 flex items-center justify-center gap-2"
            >
              {loading ? <span>Sending...</span> : <><span>Send Reset Link</span> <Send className="w-3.5 h-3.5" /></>}
            </button>
          </form>
        )}

        <div className="pt-2">
          <Link href="/login" className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-[#9C2007] dark:hover:text-rose-400 inline-flex items-center gap-1 transition">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
