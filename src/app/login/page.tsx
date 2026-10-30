'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import RealCaptcha from '@/components/ui/RealCaptcha';
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
  Loader2,
  ShieldCheck,
  RotateCcw,
  KeyRound
} from 'lucide-react';

interface DemoRole {
  id: string;
  role: string;
  name: string;
  email: string;
  destination: string;
  icon: React.ReactNode;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [error, setError] = useState('');

  // 2FA / MFA States
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaToken, setMfaToken] = useState('');
  const [mfaEmail, setMfaEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendingOtp, setResendingOtp] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const errorParam = searchParams.get('error');
    const mfaParam = searchParams.get('mfa');
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (errorParam === 'NO_REGISTERED_ACCOUNT') {
      setError('NO_REGISTERED_ACCOUNT');
    } else if (errorParam === 'UNVERIFIED_ACCOUNT') {
      setError('__UNVERIFIED__');
    } else if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }

    if (mfaParam === 'true' && tokenParam) {
      setMfaRequired(true);
      setMfaToken(tokenParam);
      if (emailParam) setMfaEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

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

  const handle1ClickLogin = async (role: DemoRole) => {
    setError('');
    setActiveRole(role.id);
    setEmail(role.email);
    setPassword('password123');
    setIsCaptchaVerified(true);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: role.id }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Demo login failed. Please try again.');
        setLoading(false);
        return;
      }

      login(data.user);
      router.push(data.user.destination || role.destination);
    } catch {
      setError('Network error during demo login. Please try again.');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isCaptchaVerified) {
      setError('Please enter the 6-character security code shown in the image.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'UNVERIFIED') {
          setError('__UNVERIFIED__');
        } else {
          setError(data.error || 'Login failed. Please try again.');
        }
        setLoading(false);
        return;
      }

      // Check if 2FA is required
      if (data.mfaRequired) {
        setMfaRequired(true);
        setMfaToken(data.mfaToken);
        setMfaEmail(data.email || email);
        setLoading(false);
        return;
      }

      login(data.user);
      router.push(data.user.destination);
    } catch {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken, otp: otpCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid verification code.');
        setLoading(false);
        return;
      }

      login(data.user);
      router.push(data.user.destination);
    } catch {
      setError('Failed to verify security code. Please check your network.');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!mfaToken) return;
    setResendingOtp(true);
    setResendMessage('');
    setError('');

    try {
      const res = await fetch('/api/auth/resend-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mfaToken }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResendMessage(data.message || 'A new code has been sent to your email.');
      } else {
        setError(data.error || 'Failed to resend code.');
      }
    } catch {
      setError('Could not connect to the authentication server.');
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-[#0E1B33] rounded-[2.5rem] p-8 sm:p-12 border border-slate-200/80 dark:border-blue-900/50 shadow-2xl space-y-7">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-20 h-20 rounded-3xl bg-white border border-[#9C2007]/20 flex items-center justify-center mx-auto shadow-lg p-2">
          <img src="/images/barangay-onse-seal.png" alt="Barangay Onse Seal" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          {mfaRequired ? 'Two-Factor Authentication' : 'SmartOnse Login'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          {mfaRequired 
            ? 'Enhanced Security Verification via Registered Email' 
            : 'Barangay Onse Digital E-Governance Portal'}
        </p>
      </div>

      {/* 2FA Challenge Mode */}
      {mfaRequired ? (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#152747]/60 border border-slate-200 dark:border-blue-900/40 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center mx-auto text-[#9C2007] dark:text-rose-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              We dispatched a 6-digit verification code to:
            </p>
            <p className="font-mono font-bold text-sm text-slate-900 dark:text-white bg-white dark:bg-[#0B1528] py-1.5 px-3 rounded-xl border border-slate-200 dark:border-blue-900/50 inline-block">
              {mfaEmail}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resendMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{resendMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerify2fa} className="space-y-4">
            <div className="space-y-2 text-center">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">
                Enter 6-Digit Code
              </label>
              <div className="relative max-w-xs mx-auto">
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center tracking-[8px] font-mono font-black text-xl py-3.5 pl-10 pr-4 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#9C2007]/50 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full py-4 rounded-2xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-extrabold uppercase tracking-wider shadow-lg shadow-[#9C2007]/30 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>{loading ? 'Verifying Code...' : 'Confirm & Sign In'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              onClick={() => {
                setMfaRequired(false);
                setOtpCode('');
                setError('');
              }}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold cursor-pointer"
            >
              &larr; Back to Login
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendingOtp}
              className="text-[#9C2007] dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resendingOtp ? 'animate-spin' : ''}`} />
              <span>{resendingOtp ? 'Sending...' : 'Resend Code'}</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 1-Click Demo Login Panel */}
          <div className="p-5 rounded-3xl bg-slate-50/90 dark:bg-[#152747]/80 border border-slate-200 dark:border-blue-900/40 space-y-3.5 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#9C2007] dark:text-rose-400 fill-current" />
                1-Click Demo Login
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-400 font-bold">Select any role to test</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {demoRoles.map((role) => {
                const isLoggingIn = activeRole === role.id && loading;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handle1ClickLogin(role)}
                    disabled={loading}
                    className={`flex items-center gap-3 p-3 rounded-2xl border bg-white dark:bg-[#0B1528] text-left transition-all cursor-pointer shadow-xs ${
                      isLoggingIn
                        ? 'border-[#9C2007] bg-rose-50 dark:bg-rose-950/40 ring-2 ring-[#9C2007]/30'
                        : 'border-slate-200 dark:border-blue-900/40 hover:border-[#9C2007] dark:hover:border-rose-400 hover:bg-slate-50 dark:hover:bg-[#152747]'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin text-[#9C2007] dark:text-rose-400" /> : role.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                        {role.role}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                        {role.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alerts */}
          {error === 'NO_REGISTERED_ACCOUNT' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>No Registered Resident Account Found</span>
              </div>
              <p className="text-amber-700 dark:text-amber-400 leading-relaxed pl-6">
                Residents cannot register with Gmail alone. For security and identity verification, you must complete the official Barangay Onse resident onboarding.
              </p>
              <div className="pl-6 pt-1">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 font-bold text-[#9C2007] dark:text-rose-400 hover:underline"
                >
                  <span>Complete Official Registration &rarr;</span>
                </Link>
              </div>
            </div>
          )}

          {error === '__UNVERIFIED__' && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-2 font-black uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Account Pending Verification</span>
              </div>
              <p className="text-amber-700 dark:text-amber-400 leading-relaxed pl-6">
                Your account is awaiting barangay staff approval. Please visit the Barangay Hall or wait 1–2 business days for verification.
              </p>
            </div>
          )}

          {error && error !== '__UNVERIFIED__' && error !== 'NO_REGISTERED_ACCOUNT' && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Manual Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#9C2007]/50 text-sm font-medium outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#9C2007] dark:text-rose-400 font-bold hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#9C2007]/50 text-sm font-medium outline-none transition"
                />
              </div>
            </div>

            {/* Real System Visual Distorted Alphanumeric Security CAPTCHA */}
            <RealCaptcha onVerify={setIsCaptchaVerified} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-extrabold uppercase tracking-wider shadow-lg shadow-[#9C2007]/30 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="border-t border-slate-200 dark:border-blue-900/40 w-full" />
            <span className="bg-white dark:bg-[#0E1B33] px-4 text-xs uppercase font-bold tracking-wider text-slate-400 whitespace-nowrap">
              or continue with
            </span>
          </div>

          {/* Google Sign In Button */}
          <div>
            <a
              href="/api/auth/google"
              className="w-full py-3.5 px-4 rounded-2xl border border-slate-200 dark:border-blue-900/60 bg-white dark:bg-[#0B1528] hover:bg-slate-50 dark:hover:bg-[#152747] text-slate-800 dark:text-slate-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition shadow-xs hover:shadow cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </a>
          </div>

          <div className="border-t border-slate-100 dark:border-blue-900/40 pt-4 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            <span>Don&apos;t have an account? </span>
            <Link href="/register" className="font-extrabold text-[#9C2007] dark:text-rose-400 hover:underline">
              Register as Verified Resident
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen py-20 md:py-28 bg-gradient-to-br from-[#9C2007]/10 via-slate-50 to-slate-100 dark:from-[#330A04] dark:via-[#070D18] dark:to-[#0B1528] flex items-center justify-center px-4 transition-colors duration-200">
      <Suspense fallback={<div className="text-center text-slate-400 font-bold p-8">Loading SmartOnse Security Portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
