'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    alert('Password reset successful! You may now login.');
    router.push('/login');
  };

  return (
    <div className="min-h-screen py-16 bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6 text-center">
        <h1 className="text-2xl font-black text-slate-900 uppercase">Set New Password</h1>
        <form onSubmit={handleReset} className="space-y-4 text-xs text-left">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">New Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#9C2007]"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#9C2007]"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold uppercase tracking-wider"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
