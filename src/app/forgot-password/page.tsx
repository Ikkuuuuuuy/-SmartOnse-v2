'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen py-16 bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6 text-center">
        <h1 className="text-2xl font-black text-slate-900 uppercase">Forgot Password</h1>
        <p className="text-xs text-slate-600">
          Enter your registered email address to receive password reset instructions.
        </p>

        {sent ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            Password reset link has been sent to <strong>{email}</strong>.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4 text-xs">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#9C2007]"
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold uppercase tracking-wider"
            >
              Send Reset Link
            </button>
          </form>
        )}

        <div className="pt-2">
          <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-[#9C2007] inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
