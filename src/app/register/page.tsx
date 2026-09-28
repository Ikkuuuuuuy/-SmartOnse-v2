'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Upload,
  Calendar,
  Sparkles,
  Smartphone,
  FileBadge,
  Loader2,
  Eye,
  RefreshCw,
  Info,
  Check,
  X,
  GraduationCap
} from 'lucide-react';
import { scanIdentityDocument, SUPPORTED_ID_TYPES, ScanResult } from '@/lib/idScanner';

export default function RegisterPage() {
  // Step State: 1 = Personal Info, 2 = Phone OTP, 3 = ID Upload & Live Scanner, 4 = Account & Submit
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [birthDate, setBirthDate] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Verification Channel: 'EMAIL' or 'PHONE'
  const [verificationChannel, setVerificationChannel] = useState<'EMAIL' | 'PHONE'>('EMAIL');

  // Email SMTP OTP State
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpVerified, setEmailOtpVerified] = useState(false);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [emailSimulatedToast, setEmailSimulatedToast] = useState<string | null>(null);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);

  // Phone SMS OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [simulatedSmsToast, setSimulatedSmsToast] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // ID Scanning State
  const [idType, setIdType] = useState('PHILSYS');
  const [idImageBase64, setIdImageBase64] = useState<string | null>(null);
  const [idFileName, setIdFileName] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submissionResult, setSubmissionResult] = useState<{
    autoApproved: boolean;
    rbiNumber?: string;
    message: string;
  } | null>(null);

  // Timer for SMS OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Timer for Email OTP countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (emailCountdown > 0) {
      timer = setTimeout(() => setEmailCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [emailCountdown]);

  // Handle SMS OTP Send via SmartOnse SMS Gateway
  const handleSendOtp = async () => {
    if (!phone) {
      setError('Please enter your mobile phone number.');
      return;
    }
    setError('');
    setOtpLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send verification code.');
        return;
      }
      setOtpSent(true);
      setCountdown(60);
      if (data.simulatedOtp) {
        setSimulatedSmsToast(data.simulatedOtp);
      }
    } catch {
      setError('Network error. Failed to send verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle SMS OTP Verify
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setError('');
    setOtpLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp: otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid OTP code.');
        return;
      }

      setOtpVerified(true);
      setSimulatedSmsToast(null);
    } catch {
      setError('Network error. Failed to verify OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Email OTP Send via SMTP
  const handleSendEmailOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setEmailOtpLoading(true);
    setEmailNotice(null);
    setEmailSimulatedToast(null);

    try {
      const res = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to dispatch email verification code.');
        return;
      }

      setEmailOtpSent(true);
      setEmailCountdown(60);
      if (data.realSent) {
        setEmailNotice(`Official verification code dispatched via SMTP to ${email}. Please check your inbox and spam folder.`);
      } else {
        setEmailNotice(`Verification code dispatched to ${email}.`);
        if (data.simulatedOtp) {
          setEmailSimulatedToast(data.simulatedOtp);
        }
      }
    } catch {
      setError('Network error. Failed to send email verification code.');
    } finally {
      setEmailOtpLoading(false);
    }
  };

  // Handle Email OTP Verify
  const handleVerifyEmailOtp = async () => {
    if (!emailOtpCode || emailOtpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    setError('');
    setEmailOtpLoading(true);

    try {
      const res = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: emailOtpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid or expired verification code.');
        return;
      }

      setEmailOtpVerified(true);
      setEmailNotice(null);
      setEmailSimulatedToast(null);
    } catch {
      setError('Network error. Failed to verify email code.');
    } finally {
      setEmailOtpLoading(false);
    }
  };

  // Handle File Upload & Native ID Scanner
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIdFileName(file.name);

    // Read image as base64
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      setIdImageBase64(base64Data);

      // Load image to measure dimensions and run client-side OCR
      const img = new Image();
      img.onload = async () => {
        setScanning(true);
        setError('');

        try {
          // Client-side OCR via Tesseract.js
          const { createWorker } = await import('tesseract.js');
          const worker = await createWorker('eng');
          const ret = await worker.recognize(base64Data);
          await worker.terminate();

          const ocrText = ret?.data?.text || '';
          console.log('[Native Client OCR Extracted Text]:', ocrText);

          const result = scanIdentityDocument({
            fullName: name,
            birthDate,
            gender,
            address,
            idType,
            imageBase64: base64Data,
            imageDimensions: { width: img.width, height: img.height },
            fileName: file.name,
            fileSize: file.size,
            ocrText,
          });

          setScanResult(result);
        } catch (ocrErr: any) {
          console.error('OCR Processing error:', ocrErr);

          // Fallback check
          const result = scanIdentityDocument({
            fullName: name,
            birthDate,
            gender,
            address,
            idType,
            imageBase64: base64Data,
            imageDimensions: { width: img.width, height: img.height },
            fileName: file.name,
            fileSize: file.size,
            ocrText: '',
          });
          setScanResult(result);
        } finally {
          setScanning(false);
        }
      };
      img.src = base64Data;
    };
    reader.readAsDataURL(file);
  };

  // Helper to load an authentic matching ID for instant demonstration/testing
  const handleLoadDemoId = (demoType: 'PHILSYS' | 'STUDENT_ID') => {
    if (typeof window === 'undefined') return;
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background card color
    ctx.fillStyle = demoType === 'PHILSYS' ? '#F0F9FF' : '#FFF1F2';
    ctx.fillRect(0, 0, 600, 380);

    // Outer border
    ctx.strokeStyle = demoType === 'PHILSYS' ? '#0284C7' : '#9C2007';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 580, 360);

    // Header bar
    ctx.fillStyle = demoType === 'PHILSYS' ? '#0369A1' : '#9C2007';
    ctx.fillRect(10, 10, 580, 60);

    // Header text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      demoType === 'PHILSYS'
        ? 'REPUBLIKA NG PILIPINAS • PHILSYS NATIONAL ID'
        : 'PHILIPPINES HIGHER EDUCATION • OFFICIAL STUDENT ID',
      300,
      46
    );

    // Card Photo placeholder
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(35, 95, 110, 145);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CITIZEN PHOTO', 90, 172);

    // Citizen Name
    ctx.fillStyle = '#0F172A';
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(name || 'Juan Martinez Dela Cruz', 165, 135);

    // Details
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Date of Birth: ${birthDate || '2004-09-10'}`, 165, 175);
    ctx.fillText(`Sex / Gender: ${gender || 'Male'}`, 165, 205);
    ctx.fillText(`Residence: ${address || 'Barangay Onse, San Juan City'}`, 165, 235);
    ctx.fillText(
      demoType === 'PHILSYS'
        ? 'PhilSys Card No: 7120-8839-4019-2811'
        : 'Student Identification No: 2024-00412-ON',
      165,
      270
    );

    const base64Data = canvas.toDataURL('image/png');
    setIdImageBase64(base64Data);
    setIdFileName(demoType === 'PHILSYS' ? 'Official_PhilSys_Card.png' : 'Official_Student_ID.png');
    setIdType(demoType);

    setScanning(true);
    setTimeout(() => {
      const ocrText = `${demoType === 'PHILSYS' ? 'republika ng pilipinas philsys national id' : 'philippines student id university school'} ${name || 'Juan Martinez Dela Cruz'} ${birthDate || '2004-09-10'} ${gender || 'Male'} ${address || 'Barangay Onse'}`;
      const result = scanIdentityDocument({
        fullName: name || 'Juan Martinez Dela Cruz',
        birthDate: birthDate || '2004-09-10',
        gender: gender || 'Male',
        address: address || 'Barangay Onse, San Juan City',
        idType: demoType,
        imageBase64: base64Data,
        imageDimensions: { width: 600, height: 380 },
        fileName: demoType === 'PHILSYS' ? 'Official_PhilSys_Card.png' : 'Official_Student_ID.png',
        fileSize: 42000,
        ocrText,
      });
      setScanResult(result);
      setScanning(false);
    }, 800);
  };

  // Final Registration Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms and Data Privacy Act consent.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          gender,
          birthDate,
          address,
          phone,
          email,
          password,
          idType,
          idCardImage: idImageBase64,
          phoneVerified: otpVerified,
          emailVerified: emailOtpVerified,
          scanResult,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.');
        return;
      }

      setSubmissionResult({
        autoApproved: data.autoApproved,
        rbiNumber: data.rbiNumber,
        message: data.message,
      });
    } catch {
      setError('Network error. Failed to complete registration.');
    } finally {
      setSubmitting(false);
    }
  };

  // Submission Result View (Instant RBI Auto-Approval vs Desk Officer Queue)
  if (submissionResult) {
    return (
      <div className="min-h-screen py-16 bg-slate-50 dark:bg-[#070D18] flex items-center justify-center px-4 transition-colors duration-200 font-sans">
        <div className="w-full max-w-lg bg-white dark:bg-[#0E1B33] rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-blue-900/50 shadow-2xl text-center space-y-6">
          {submissionResult.autoApproved ? (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50 dark:ring-emerald-900/20 animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Instant RBI Auto-Approval
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Welcome, Resident of Onse!
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your identity has been matched and verified against the official Barangay Onse Registry of Inhabitants (RBI).
                </p>
              </div>

              {submissionResult.rbiNumber && (
                <div className="p-4 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl text-left space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Official RBI Census Number:
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white font-mono text-xs font-black">
                      {submissionResult.rbiNumber}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 pt-1">
                    Your resident account is instantly activated. You have full access to Barangay Clearance, Indigency, First-Time Jobseekers certification, and health center appointments!
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner ring-8 ring-amber-50 dark:ring-amber-900/20">
                <FileBadge className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-full">
                  Transferee / New Resident Registered
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Registration & ID Received!
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Thank you, <strong className="text-slate-900 dark:text-white">{name}</strong>. Because your address is newly registered or you are a transferee/student, your record and scanned ID have been sent to the Barangay Desk Officer.
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 rounded-2xl text-left space-y-1.5">
                <p className="text-[11px] font-black text-blue-900 dark:text-blue-300 uppercase tracking-wider">Next Step:</p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
                  The Barangay Desk Officer will review your ID and enroll your household into the official DILG Registry of Inhabitants (RBI) Census. Once approved, you will receive full access to online resident services.
                </p>
              </div>
            </>
          )}

          <Link
            href="/login"
            className="inline-block w-full py-3.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#9C2007]/25 transition cursor-pointer"
          >
            Proceed to Citizen Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-[#9C2007]/10 via-slate-50 to-slate-100 dark:from-[#330A04] dark:via-[#070D18] dark:to-[#0B1528] flex items-center justify-center px-4 transition-colors duration-200 font-sans">
      <div className="w-full max-w-xl bg-white dark:bg-[#0E1B33] rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-blue-900/50 shadow-2xl space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#9C2007]/20 flex items-center justify-center mx-auto shadow-md p-1.5">
            <img src="/images/barangay-onse-seal.png" alt="Seal" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
            Resident Registration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Official Barangay Onse Citizen Profile & RBI Census Enrollment
          </p>
        </div>

        {/* SMS Verification Code Notification Banner */}
        {simulatedSmsToast && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl flex items-start gap-3 animate-in slide-in-from-top-3">
            <Smartphone className="w-5 h-5 mt-0.5 shrink-0 animate-bounce" />
            <div className="text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black tracking-wider uppercase text-[10px] bg-black/20 px-2 py-0.5 rounded">
                  Barangay Onse SMS Notification
                </span>
                <span className="text-[10px] opacity-80">Just now</span>
              </div>
              <p className="mt-1 font-semibold">
                Your mobile verification code is: <strong className="text-lg font-black tracking-widest underline">{simulatedSmsToast}</strong>
              </p>
              <button
                type="button"
                onClick={() => setOtpCode(simulatedSmsToast)}
                className="mt-2 text-[11px] font-bold bg-white text-indigo-800 px-3 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer shadow-sm"
              >
                Auto-fill Code
              </button>
            </div>
          </div>
        )}

        {/* Real SMTP Email Dispatch Notice */}
        {emailNotice && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex items-start gap-3 animate-in slide-in-from-top-3">
            <Mail className="w-5 h-5 mt-0.5 shrink-0 animate-bounce" />
            <div className="text-xs flex-1">
              <span className="font-black tracking-wider uppercase text-[10px] bg-black/20 px-2 py-0.5 rounded">
                Barangay Onse SMTP Mailer
              </span>
              <p className="mt-1 font-semibold">
                {emailNotice}
              </p>
              <p className="text-[10px] text-emerald-100 mt-0.5">
                Check your email inbox and spam folder for your 6-digit security code.
              </p>
            </div>
          </div>
        )}

        {/* Simulated / Sandbox Email Code Banner */}
        {emailSimulatedToast && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-xl flex items-start gap-3 animate-in slide-in-from-top-3">
            <Mail className="w-5 h-5 mt-0.5 shrink-0 animate-bounce" />
            <div className="text-xs flex-1">
              <div className="flex items-center justify-between">
                <span className="font-black tracking-wider uppercase text-[10px] bg-black/20 px-2 py-0.5 rounded">
                  Email SMTP Sandbox Code
                </span>
                <span className="text-[10px] opacity-80">Just now</span>
              </div>
              <p className="mt-1 font-semibold">
                Your Barangay Onse email verification code is: <strong className="text-lg font-black tracking-widest underline">{emailSimulatedToast}</strong>
              </p>
              <button
                type="button"
                onClick={() => setEmailOtpCode(emailSimulatedToast)}
                className="mt-2 text-[11px] font-bold bg-white text-teal-800 px-3 py-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                Auto-fill Code
              </button>
            </div>
          </div>
        )}

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-4 gap-2 pt-1 pb-2">
          {[
            { num: 1, label: 'Personal' },
            { num: 2, label: 'Verification' },
            { num: 3, label: 'ID Scanner' },
            { num: 4, label: 'Security' },
          ].map((s) => (
            <div key={s.num} className="text-center space-y-1">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  step >= s.num
                    ? 'bg-[#9C2007] dark:bg-rose-600'
                    : 'bg-slate-200 dark:bg-[#152747]'
                }`}
              />
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                step === s.num
                  ? 'text-[#9C2007] dark:text-rose-400'
                  : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: PERSONAL INFORMATION */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="space-y-4 text-xs animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-blue-900/40">
              <User className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
              <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-sm">
                Step 1: Personal Details
              </h2>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name (First, Middle, Last) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Juan Martinez Dela Cruz"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none"
              />
              <p className="text-[10px] text-slate-400">
                Please enter your name exactly as it appears on your official ID or school card.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Sex / Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Date of Birth *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Current Residence in Barangay Onse *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Unit #, Street, Barangay Onse"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Renters, students, and boarders are welcome! Include your room or unit number.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!name.trim() || !birthDate || !address.trim()) {
                  setError('Please fill out your full name, birth date, and address.');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="w-full mt-4 py-3.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-extrabold uppercase tracking-wider shadow-md shadow-[#9C2007]/25 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: SECURITY VERIFICATION (EMAIL SMTP OR MOBILE SMS) */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="space-y-4 text-xs animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-blue-900/40">
              <ShieldCheck className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
              <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-sm">
                Step 2: Identity Verification
              </h2>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Choose your preferred channel to receive your 6-digit verification code. Verifying your identity protects resident records from fraudulent registration.
            </p>

            {/* Verification Channel Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-[#152747] rounded-xl border border-slate-200 dark:border-blue-900/40">
              <button
                type="button"
                onClick={() => {
                  setVerificationChannel('EMAIL');
                  setError('');
                }}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition cursor-pointer text-xs ${
                  verificationChannel === 'EMAIL'
                    ? 'bg-white dark:bg-[#0E1B33] text-[#9C2007] dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email (SMTP)</span>
                {emailOtpVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerificationChannel('PHONE');
                  setError('');
                }}
                className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition cursor-pointer text-xs ${
                  verificationChannel === 'PHONE'
                    ? 'bg-white dark:bg-[#0E1B33] text-[#9C2007] dark:text-rose-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (SMS)</span>
                {otpVerified && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
              </button>
            </div>

            {/* CHANNEL 1: EMAIL OTP (SMTP) */}
            {verificationChannel === 'EMAIL' && (
              <div className="space-y-3 animate-in fade-in-50 duration-150">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Official Email Address *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        disabled={emailOtpVerified}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="resident@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none disabled:opacity-75"
                      />
                    </div>
                    {!emailOtpVerified && (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        disabled={emailOtpLoading || emailCountdown > 0}
                        className="px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 transition cursor-pointer shrink-0"
                      >
                        {emailOtpLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : emailCountdown > 0 ? (
                          `Resend (${emailCountdown}s)`
                        ) : emailOtpSent ? (
                          'Resend Code'
                        ) : (
                          'Send Email OTP'
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    Dispatched securely using Barangay Onse SMTP mail servers with branded verification code.
                  </p>
                </div>

                {/* Email OTP Input Box */}
                {emailOtpSent && !emailOtpVerified && (
                  <div className="p-4 bg-slate-50 dark:bg-[#152747] rounded-2xl border border-slate-200 dark:border-blue-900/40 space-y-3 animate-in fade-in-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Enter 6-Digit Email Code
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">5-minute expiry</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={emailOtpCode}
                        onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full text-center tracking-[0.4em] font-mono text-lg font-black py-2.5 bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl focus:ring-2 focus:ring-[#9C2007] outline-none text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyEmailOtp}
                        disabled={emailOtpLoading || emailOtpCode.length !== 6}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 transition cursor-pointer shrink-0"
                      >
                        {emailOtpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Email Verified Success Badge */}
                {emailOtpVerified && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 font-bold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Email Address Verified via SMTP ({email})</span>
                  </div>
                )}
              </div>
            )}

            {/* CHANNEL 2: MOBILE PHONE (SMS) */}
            {verificationChannel === 'PHONE' && (
              <div className="space-y-3 animate-in fade-in-50 duration-150">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Philippine Mobile Number *
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        disabled={otpVerified}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0917-123-4567"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none disabled:opacity-75 font-mono"
                      />
                    </div>
                    {!otpVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading || countdown > 0}
                        className="px-4 py-2.5 bg-[#9C2007] hover:bg-[#8B1A05] text-white rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 transition cursor-pointer shrink-0"
                      >
                        {otpLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : countdown > 0 ? (
                          `Resend (${countdown}s)`
                        ) : otpSent ? (
                          'Resend Code'
                        ) : (
                          'Send SMS'
                        )}
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 pt-0.5">
                    A 6-digit security verification code will be generated for your mobile number.
                  </p>
                </div>

                {/* SMS OTP Input Field */}
                {otpSent && !otpVerified && (
                  <div className="p-4 bg-slate-50 dark:bg-[#152747] rounded-2xl border border-slate-200 dark:border-blue-900/40 space-y-3 animate-in fade-in-50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Enter 6-Digit SMS Code
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">5-minute expiry</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full text-center tracking-[0.4em] font-mono text-lg font-black py-2.5 bg-white dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 rounded-xl focus:ring-2 focus:ring-[#9C2007] outline-none text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={otpLoading || otpCode.length !== 6}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold uppercase tracking-wider disabled:opacity-50 transition cursor-pointer shrink-0"
                      >
                        {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Phone Verified Success Badge */}
                {otpVerified && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 font-bold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Mobile Number Verified ({phone})</span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-blue-900/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-[#152747] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!otpVerified && !emailOtpVerified) {
                    setError('Please complete either Email (SMTP) or Mobile Phone (SMS) verification first.');
                    return;
                  }
                  setError('');
                  setStep(3);
                }}
                disabled={!otpVerified && !emailOtpVerified}
                className="flex-1 py-3.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] disabled:opacity-40 text-white font-extrabold uppercase tracking-wider shadow-md shadow-[#9C2007]/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to ID Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: NATIVE ID SCANNER & DOCUMENT PATTERN DETECTION */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-4 text-xs animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <FileBadge className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-sm">
                  Step 3: Identity Document Scanner
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase bg-slate-100 dark:bg-[#152747] text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                Native Engine
              </span>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select ID Type *
              </label>
              <select
                value={idType}
                onChange={(e) => {
                  setIdType(e.target.value);
                  if (idImageBase64) {
                    // Re-run scanner with updated ID type
                    const res = scanIdentityDocument({
                      fullName: name,
                      birthDate,
                      gender,
                      address,
                      idType: e.target.value,
                      imageBase64: idImageBase64,
                      fileName: idFileName,
                    });
                    setScanResult(res);
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none cursor-pointer"
              >
                {Object.entries(SUPPORTED_ID_TYPES).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
              {idType === 'STUDENT_ID' && (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>
                    <strong>R.A. 11261 Compliant:</strong> School, College, and University IDs are accepted for students and first-time jobseekers.
                  </span>
                </div>
              )}
            </div>

            {/* Drag & Drop / Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition relative overflow-hidden ${
                idImageBase64
                  ? 'border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-300 dark:border-blue-900/60 hover:border-[#9C2007] dark:hover:border-rose-500 bg-slate-50/50 dark:bg-[#152747]/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {idImageBase64 ? (
                <div className="space-y-3">
                  <div className="relative inline-block max-h-48 max-w-full rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800">
                    <img
                      src={idImageBase64}
                      alt="Uploaded ID"
                      className="max-h-48 w-auto object-contain mx-auto"
                    />
                    {scanning && (
                      <div className="absolute inset-0 bg-[#9C2007]/20 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-full h-1 bg-red-500 absolute top-0 animate-[pulse_1.5s_infinite]" />
                        <span className="px-3 py-1 bg-black/80 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin" /> Scanning Security Features...
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                    <span>{idFileName}</span>
                    <span>•</span>
                    <span className="text-[#9C2007] dark:text-rose-400 font-bold hover:underline">
                      Click to replace photo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#9C2007] dark:text-rose-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    Click to upload or capture photo of your ID
                  </p>
                  <p className="text-[11px] text-slate-400">
                    JPEG, PNG, or WebP up to 10MB. Center the ID and avoid heavy glares.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Demo Test Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-[11px]">
              <span className="font-bold text-slate-500 dark:text-slate-400">Testing shortcut:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleLoadDemoId('PHILSYS')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer"
                >
                  ⚡ Load Valid PhilSys ID
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadDemoId('STUDENT_ID')}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer"
                >
                  ⚡ Load Valid School ID
                </button>
              </div>
            </div>

            {/* Live Scan Results & Feature Check */}
            {scanResult && !scanning && (
              <div
                className={`p-4 rounded-2xl border space-y-3 animate-in fade-in-50 ${
                  scanResult.isValidId
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {scanResult.isValidId ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )}
                    <span className="font-black uppercase tracking-wider text-[11px] text-slate-900 dark:text-white">
                      {scanResult.isValidId ? 'ID Document Verified' : 'ID Validation Flagged'}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    scanResult.isValidId
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                  }`}>
                    {scanResult.confidenceScore}% Confidence
                  </span>
                </div>

                {/* Validation Checklist */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${scanResult.nameMatchPassed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-400 font-bold'}`}>
                    {scanResult.nameMatchPassed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>Name: <strong>{scanResult.nameMatchScore}% {scanResult.nameMatchPassed ? 'Match' : 'Mismatch'}</strong></span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${scanResult.birthdateMatchPassed ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-400 font-bold'}`}>
                    {scanResult.birthdateMatchPassed ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>Birthdate: <strong>{scanResult.birthdateMatchPassed ? 'Confirmed' : 'Not Found'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Ratio: <strong>{scanResult.aspectRatio || '1.58'}:1</strong></span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${scanResult.isValidId ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-400 font-bold'}`}>
                    {scanResult.isValidId ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    )}
                    <span>ID Authenticity: <strong>{scanResult.isValidId ? 'Verified' : 'Flagged'}</strong></span>
                  </div>
                </div>

                {/* Address Tolerance Note */}
                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-[#0E1B33]/80 border border-slate-200 dark:border-blue-900/40 text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Address Tolerance Policy:</span>
                  </div>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                    {scanResult.addressNote}
                  </p>
                </div>

                {/* Warnings / Errors */}
                {scanResult.reasons.length > 0 && (
                  <div className="text-[11px] text-rose-700 dark:text-rose-400 space-y-0.5">
                    {scanResult.reasons.map((r, i) => (
                      <p key={i}>• {r}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-blue-900/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-[#152747] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!idImageBase64) {
                    setError('Please upload a clear photo of your ID or School Card.');
                    return;
                  }
                  if (scanResult && !scanResult.isValidId) {
                    setError('Uploaded document was rejected. Please upload your own official Government or School ID.');
                    return;
                  }
                  setError('');
                  setStep(4);
                }}
                disabled={!idImageBase64 || scanning || (scanResult !== null && !scanResult.isValidId)}
                className="flex-1 py-3.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] disabled:opacity-40 text-white font-extrabold uppercase tracking-wider shadow-md shadow-[#9C2007]/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Security</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: ACCOUNT SECURITY & PRIVACY ACT CONSENT */}
        {/* ========================================================================= */}
        {step === 4 && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs animate-in fade-in-50 duration-200">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-100 dark:border-blue-900/40">
              <Lock className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
              <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-wider text-sm">
                Step 4: Account Security & Privacy Consent
              </h2>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Email Address (Login Username) *
                </label>
                {emailOtpVerified && (
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Verified via SMTP
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={emailOtpVerified}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none disabled:opacity-80 font-medium"
                />
              </div>
              {emailOtpVerified && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Your email has been cryptographically confirmed and will serve as your primary citizen login credential.
                </p>
              )}
            </div>

            {/* Optional Mobile Phone if not verified in Step 2 */}
            {!otpVerified && (
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Contact Mobile Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0917-123-4567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Used for SMS clearance ready notifications and emergency barangay alerts.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 text-slate-900 dark:text-white rounded-xl focus:ring-1 focus:ring-[#9C2007] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Data Privacy & Consent */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#152747] border border-slate-200 dark:border-blue-900/40 rounded-2xl space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="privacyConsent"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-[#9C2007] focus:ring-[#9C2007] cursor-pointer"
                />
                <label htmlFor="privacyConsent" className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed cursor-pointer">
                  I hereby attest under oath that all details and documents provided are genuine and true. I authorize <strong>Barangay Onse, San Juan City</strong> to process my personal information in compliance with <strong>Republic Act No. 10173 (Data Privacy Act of 2012)</strong> and the <strong>DILG Registry of Barangay Inhabitants (RBI)</strong> guidelines.
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-blue-900/50 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-[#152747] transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] disabled:opacity-50 text-white font-extrabold uppercase tracking-wider shadow-md shadow-[#9C2007]/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Profile</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

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
