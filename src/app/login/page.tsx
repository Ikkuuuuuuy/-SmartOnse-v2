'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  Zap, 
  UserCheck, 
  FileText, 
  Crown, 
  Users, 
  Award,
  Loader2
} from 'lucide-react';

interface DemoRole {
  id: string;
  role: string;
  name: string;
  email: string;
  destination: string;
  icon: React.ReactNode;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion] = useState('4 + 7');
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [error, setError] = useState('');

  const demoRoles: DemoRole[] = [
    {
      id: 'admin',
      role: 'Admin / Captain',
      name: 'Hon. Roberto Alba (Captain)',
      email: 'captain@onse.gov.ph',
      destination: '/admin',
      icon: <Crown className="w-3.5 h-3.5 text-[#9C2007]" />,
    },
    {
      id: 'staff',
      role: 'Desk Staff',
      name: 'Jonathan D. Sorio',
      email: 'records@onse.gov.ph',
      destination: '/admin/requests',
      icon: <FileText className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      id: 'kagawad',
      role: 'Kagawad',
      name: 'Hon. Danilo Florano',
      email: 'kagawad@onse.gov.ph',
      destination: '/admin/services',
      icon: <Award className="w-3.5 h-3.5 text-blue-600" />,
    },
    {
      id: 'sk',
      role: 'SK Chairman',
      name: 'Hon. John Michael Permato',
      email: 'sk@onse.gov.ph',
      destination: '/sk-programs',
      icon: <Users className="w-3.5 h-3.5 text-purple-600" />,
    },
    {
      id: 'resident',
      role: 'Resident',
      name: 'Juan Dela Cruz',
      email: 'juan@onse.ph',
      destination: '/portal/request',
      icon: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
    },
  ];

  const handle1ClickLogin = (role: DemoRole) => {
    setError('');
    setActiveRole(role.id);
    setEmail(role.email);
    setPassword('••••••••••••');
    setCaptchaAnswer('11');
    setLoading(true);

    login({
      id: role.id,
      name: role.name,
      email: role.email,
      role: role.id,
      roleTitle: role.role,
      destination: role.destination,
    });

    setTimeout(() => {
      setLoading(false);
      router.push(role.destination);
    }, 450);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (captchaAnswer.trim() !== '11') {
      setError('Incorrect security math answer.');
      return;
    }

    setLoading(true);
    login({
      id: 'logged_user',
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: 'resident',
      roleTitle: 'Resident Citizen',
      destination: '/admin',
    });

    setTimeout(() => {
      setLoading(false);
      router.push('/admin');
    }, 700);
  };

  return (
    <div className="min-h-screen py-24 md:py-32 bg-gradient-to-br from-[#9C2007]/10 via-slate-50 to-slate-100 dark:from-[#330A04] dark:via-[#070D18] dark:to-[#0B1528] flex items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0E1B33] rounded-3xl p-7 sm:p-9 border border-slate-200 dark:border-blue-900/50 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-white border border-[#9C2007]/20 flex items-center justify-center mx-auto shadow-md p-1.5">
            <img src="/images/barangay-onse-seal.png" alt="Seal" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            SmartOnse Login
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Barangay Onse Digital Portal
          </p>
        </div>

        {/* 1-Click Demo Login Panel */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#152747]/80 border border-slate-200 dark:border-blue-900/40 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400 fill-current" />
              1-Click Demo Login
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold">Select any role</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {demoRoles.map((role) => {
              const isLoggingIn = activeRole === role.id && loading;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handle1ClickLogin(role)}
                  disabled={loading}
                  className={`flex items-center gap-2 p-2 rounded-xl border bg-white dark:bg-[#0B1528] text-left transition-all cursor-pointer shadow-xs ${
                    isLoggingIn
                      ? 'border-[#9C2007] bg-rose-50 dark:bg-rose-950/40 ring-2 ring-[#9C2007]/20'
                      : 'border-slate-200 dark:border-blue-900/40 hover:border-[#9C2007] dark:hover:border-rose-400 hover:bg-slate-50 dark:hover:bg-[#152747]'
                  }`}
                >
                  <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                    {isLoggingIn ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9C2007] dark:text-rose-400" /> : role.icon}
                  </div>
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                      {role.role}
                    </div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-400 truncate">
                      {role.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-blue-900/40 w-full" />
          <span className="bg-white dark:bg-[#0E1B33] px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            or sign in with email
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@example.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] text-xs font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">Password</label>
              <Link href="/forgot-password" className="text-[10px] text-[#9C2007] dark:text-rose-400 font-bold hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] text-xs font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
              Security: <span className="text-[#9C2007] dark:text-rose-400 font-black">{captchaQuestion}</span> = ?
            </label>
            <input
              type="text"
              required
              value={captchaAnswer}
              onChange={(e) => setCaptchaAnswer(e.target.value)}
              placeholder="Enter answer (11)"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] text-xs font-bold text-center"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-extrabold uppercase tracking-wider shadow-md shadow-[#9C2007]/25 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="border-t border-slate-100 dark:border-blue-900/40 pt-3 text-center text-xs text-slate-600 dark:text-slate-400">
          <span>Don&apos;t have an account? </span>
          <Link href="/register" className="font-extrabold text-[#9C2007] dark:text-rose-400 hover:underline">
            Register as Resident
          </Link>
        </div>
      </div>
    </div>
  );
}

