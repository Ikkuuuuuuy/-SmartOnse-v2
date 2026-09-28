import React from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen py-16 bg-[#FDF8F6] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 flex items-center justify-center px-4 font-sans transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0E1B33] rounded-3xl p-8 border border-slate-200 dark:border-blue-900/50 shadow-2xl space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#9C2007]/10 dark:bg-rose-950/60 text-[#9C2007] dark:text-rose-400 flex items-center justify-center mx-auto">
          <MailCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Verify Your Email</h1>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Thanks for signing up! Before getting started, please verify your email address by clicking on the link we just emailed to you.
        </p>
        <div className="pt-2">
          <Link href="/login" className="inline-block w-full py-3 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
