import React from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen py-16 bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#9C2007]/10 text-[#9C2007] flex items-center justify-center mx-auto">
          <MailCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 uppercase">Verify Your Email</h1>
        <p className="text-xs text-slate-600">
          Thanks for signing up! Before getting started, please verify your email address by clicking on the link we just emailed to you.
        </p>
        <div className="pt-2">
          <Link href="/login" className="inline-block w-full py-3 bg-[#9C2007] text-white rounded-xl font-bold text-xs uppercase tracking-wider">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
