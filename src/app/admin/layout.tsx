'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { canAccessModule, isAdminUser, normalizeRole, ROLES } from '@/lib/rbac';
import { 
  ShieldAlert, 
  Lock, 
  ArrowRight, 
  User, 
  LogOut, 
  Home, 
  FileText, 
  Shield, 
  ShieldCheck, 
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Bell, 
  Clock, 
  Calendar, 
  Layers, 
  BarChart3, 
  Users, 
  Building2, 
  Receipt, 
  HeartPulse, 
  Scale, 
  DollarSign, 
  PieChart, 
  UserCheck, 
  FolderLock, 
  Menu, 
  X, 
  Search, 
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout, login } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);


  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isLoading && !user) {
      timeout = setTimeout(() => {
        router.replace('/login');
      }, 4000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [user, isLoading, router]);

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans text-white">
        <div className="w-16 h-16 rounded-3xl bg-[#9C2007] text-white flex items-center justify-center font-black text-2xl animate-pulse shadow-2xl shadow-red-900/50">
          O
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-black uppercase text-white tracking-wider">Securing Command Center</h2>
          <p className="text-xs text-slate-400">Verifying security credentials &amp; session...</p>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State (Interactive 1-Click Access)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#070D18] via-[#0B1528] to-[#150502] flex items-center justify-center p-6 font-sans text-white">
        <div className="max-w-md w-full bg-[#0B1528] rounded-3xl p-8 border border-blue-900/50 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-[#9C2007] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-xl shadow-red-950/60">
            O
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-950/80 text-amber-300 border border-amber-800/50 text-[10px] font-black uppercase tracking-widest rounded-full">
              Session Required
            </span>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Administrative Command Center
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Please sign in with your official Barangay Onse credentials or select a quick demo session below.
            </p>
          </div>

          <div className="p-4 bg-[#080E1A] border border-blue-900/40 rounded-2xl text-left space-y-2.5 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              1-Click Instant Admin Access:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  login({
                    id: 'admin',
                    name: 'Hon. Roberto Alba (Captain)',
                    email: 'captain@onse.gov.ph',
                    role: 'admin',
                    roleTitle: 'Admin / Captain',
                    destination: pathname || '/admin',
                  });
                }}
                className="p-3 rounded-xl border border-blue-800/60 hover:border-[#9C2007] bg-[#0E1B33] hover:bg-[#1A2E56] text-left font-bold text-slate-100 transition cursor-pointer text-xs space-y-0.5 shadow-sm"
              >
                <div className="text-amber-400 font-black flex items-center gap-1">👑 Captain Alba</div>
                <div className="text-[10px] text-slate-400">Full Super Admin Access</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  login({
                    id: 'staff',
                    name: 'Jonathan D. Sorio',
                    email: 'records@onse.gov.ph',
                    role: 'staff',
                    roleTitle: 'Desk Staff',
                    destination: pathname || '/admin/requests',
                  });
                }}
                className="p-3 rounded-xl border border-blue-800/60 hover:border-[#9C2007] bg-[#0E1B33] hover:bg-[#1A2E56] text-left font-bold text-slate-100 transition cursor-pointer text-xs space-y-0.5 shadow-sm"
              >
                <div className="text-blue-400 font-black flex items-center gap-1">📋 Desk Staff Sorio</div>
                <div className="text-[10px] text-slate-400">Clearances &amp; Census</div>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="flex-1 py-3 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Go to Login Screen</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-3 rounded-xl bg-[#0E1B33] hover:bg-[#152747] text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-blue-900/40"
            >
              Public Portal
            </button>
          </div>
        </div>
      </div>
    );
  }


  // 3. Resident Guard
  if (!isAdminUser(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1F1010] to-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-white rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-18 h-18 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-widest rounded-full">
              403 &bull; Insufficient Privileges
            </span>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Restricted Area
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are signed in as <strong className="text-slate-900">{user.name}</strong> (<span className="text-[#9C2007] font-bold">{user.roleTitle || 'Resident Citizen'}</span>). 
              The Administrative Command Center is restricted to Barangay Officials and Desk Staff.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#9C2007]" />
              Need to test Admin features? Switch role:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  login({
                    id: 'admin',
                    name: 'Hon. Roberto Alba (Captain)',
                    email: 'captain@onse.gov.ph',
                    role: 'admin',
                    roleTitle: 'Admin / Captain',
                    destination: '/admin',
                  });
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-[#9C2007] hover:bg-rose-50 text-left font-bold text-slate-800 transition text-[11px]"
              >
                👑 Captain Alba (Admin)
              </button>
              <button
                onClick={() => {
                  login({
                    id: 'staff',
                    name: 'Jonathan D. Sorio',
                    email: 'records@onse.gov.ph',
                    role: 'staff',
                    roleTitle: 'Desk Staff',
                    destination: '/admin/requests',
                  });
                }}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-[#9C2007] hover:bg-rose-50 text-left font-bold text-slate-800 transition text-[11px]"
              >
                📋 Desk Staff Sorio
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href="/portal/request"
              className="flex-1 py-3 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Citizen Portal</span>
            </Link>

            <Link
              href="/profile"
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5"
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </Link>

            <button
              onClick={() => logout()}
              className="px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Categorized Groups (Matching Enterprise UI Inspo)
  const navSections = [
    {
      group: 'MAIN & ANALYTICS',
      items: [
        { label: 'Dashboard Analytics', href: '/admin', moduleKey: 'dashboard', icon: <BarChart3 className="w-4 h-4" />, badge: null },
        { label: 'Document Requests', href: '/admin/requests', moduleKey: 'requests', icon: <Receipt className="w-4 h-4" />, badge: '14' },
        { label: 'Resident Directory', href: '/admin/residents', moduleKey: 'residents', icon: <Users className="w-4 h-4" />, badge: null },
      ],
    },
    {
      group: 'OPERATIONS & SERVICES',
      items: [
        { label: 'Document Rates & Services', href: '/admin/services', moduleKey: 'services', icon: <Layers className="w-4 h-4" />, badge: null },
        { label: 'Events & Calendar', href: '/admin/events', moduleKey: 'events', icon: <Calendar className="w-4 h-4" />, badge: null },
        { label: 'Council Officials & Staff', href: '/admin/officials', moduleKey: 'officials', icon: <Building2 className="w-4 h-4" />, badge: null },
      ],
    },
    {
      group: 'FINANCIALS & DISCLOSURE',
      items: [
        { label: 'Full Disclosure & Budgets', href: '/admin/transparency', moduleKey: 'transparency', icon: <DollarSign className="w-4 h-4" />, badge: 'DILG' },
        { label: 'SK Youth Programs', href: '/sk-programs', moduleKey: 'dashboard', icon: <Sparkles className="w-4 h-4" />, badge: '10%' },
      ],
    },
    {
      group: 'SECURITY & GOVERNANCE',
      items: [
        { label: 'User & RBAC Accounts', href: '/admin/users', moduleKey: 'user-management', icon: <UserCheck className="w-4 h-4" />, badge: null },
        { label: 'Cryptographic Audit Logs', href: '/admin/audit-logs', moduleKey: 'audit-logs', icon: <FolderLock className="w-4 h-4" />, badge: 'SHA' },
      ],
    },
  ];

  const handleRoleSwitch = (newRole: string) => {
    let name = user.name;
    let title = 'Barangay Official';
    let dest = '/admin';

    if (newRole === 'super_admin' || newRole === 'admin') {
      name = 'Hon. Roberto Alba (Captain)';
      title = 'Admin / Captain';
      dest = '/admin';
    } else if (newRole === 'staff') {
      name = 'Jonathan D. Sorio';
      title = 'Desk Staff';
      dest = '/admin/requests';
    } else if (newRole === 'barangay_councilor' || newRole === 'kagawad') {
      name = 'Hon. Danilo Florano';
      title = 'Barangay Kagawad';
      dest = '/admin/services';
    } else if (newRole === 'sk_chairperson' || newRole === 'sk') {
      name = 'Hon. John Michael Permato';
      title = 'SK Chairman';
      dest = '/sk-programs';
    }

    login({
      ...user,
      name,
      role: newRole,
      roleTitle: title,
      destination: dest,
    });
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#070D18] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* SIDEBAR (Red Header on Top + Deep Navy Blue Body with Interactive Profile Dropdown) */}
      <aside
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0B1528] border-r border-slate-800 flex flex-col transition-transform duration-300 shadow-2xl text-slate-300`}
      >
        {/* Sidebar Header (Signature SmartOnse Crimson Red) */}
        <div className="h-20 min-h-[5rem] px-5 border-b border-[#5A0F02] bg-gradient-to-r from-[#9C2007] via-[#851805] to-[#6A1203] flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 shadow-md shrink-0 flex items-center justify-center">
              <img src="/images/barangay-onse-seal.png" alt="Seal" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-black text-white uppercase tracking-tight leading-none">
                SMART<span className="text-amber-300">ONSE</span>
              </h1>
              <p className="text-[9px] text-rose-200/90 font-bold uppercase tracking-widest mt-1">
                Command Center
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-rose-200 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live RBAC Role Selector Banner */}
        <div className="px-4 pt-4">
          <div className="bg-[#070E1C] border border-blue-900/50 rounded-2xl p-3 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="text-[9px] font-black uppercase tracking-wider text-blue-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Active RBAC Role:
              </label>
              <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 rounded-full uppercase">
                Active
              </span>
            </div>
            <select
              value={normalizeRole(user.role)}
              onChange={(e) => handleRoleSwitch(e.target.value)}
              className="w-full text-xs font-bold text-white bg-[#0D1B33] border border-blue-700/50 rounded-xl p-2 focus:ring-1 focus:ring-[#9C2007] outline-none cursor-pointer"
            >
              <option value="super_admin">👑 Super Admin / Captain</option>
              <option value="barangay_captain">🏛️ Barangay Captain</option>
              <option value="barangay_councilor">📜 Barangay Kagawad</option>
              <option value="sk_chairperson">🎓 SK Chairperson</option>
              <option value="staff">💼 Desk Staff</option>
            </select>
          </div>
        </div>

        {/* Categorized Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5 custom-scrollbar">
          {navSections.map((sec) => {
            const visibleItems = sec.items.filter((item) => canAccessModule(user.role, item.moduleKey));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sec.group} className="space-y-1.5">
                <div className="px-3 text-[9px] font-black uppercase tracking-widest text-blue-300/70">
                  {sec.group}
                </div>

                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#9C2007] to-[#7B1905] text-white shadow-lg shadow-red-950/60 font-black'
                            : 'text-slate-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={isActive ? 'text-white' : 'text-blue-400'}>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                            isActive ? 'bg-white text-[#9C2007]' : 'bg-blue-950 text-blue-300 border border-blue-800/50'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Interactive User Profile Bottom with Dropdown Popover */}
        <div className="p-3 border-t border-slate-800 bg-[#070E1C] relative shrink-0">
          
          {/* Dropdown Menu Popup (Matching Inspo) */}
          {userMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
              <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#0E1B33] border border-blue-800/60 rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <Link
                  href="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Account Overview</span>
                </Link>

                <Link
                  href="/"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span>Public Portal</span>
                </Link>

                <div className="h-px bg-blue-900/60 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}

          {/* Interactive User Pill Trigger */}
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-2xl bg-[#0F1B33] hover:bg-[#152747] border border-blue-900/50 transition-all text-left group cursor-pointer shadow-sm"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                {user.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-amber-300 transition-colors">
                  {user.name}
                </p>
                <p className="text-[9px] font-black text-amber-400/90 uppercase tracking-wider truncate mt-0.5">
                  {user.roleTitle || user.role.toUpperCase()}
                </p>
              </div>
            </div>
            <ChevronUp
              className={`w-4 h-4 text-amber-400 transition-transform duration-200 shrink-0 ${
                userMenuOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP BAR GLOBAL HEADER (With Red Bottom Border Line) */}
        <header className="h-20 min-h-[5rem] bg-white dark:bg-[#0B1528] border-b-2 border-[#9C2007]/20 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between gap-4 shrink-0 shadow-xs z-30 transition-colors duration-200">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:block">
              <h2 className="text-xs font-black tracking-widest uppercase text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Barangay Onse Administrative Command Center
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold tracking-wider uppercase">
                Digital E-Governance &bull; Financial &amp; Services System
              </p>
            </div>
          </div>

          {/* Right Header System Badges & Clock */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Live Clock Widget */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-[#0E1B33] border border-slate-200 dark:border-blue-900/60 px-3.5 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-200 font-mono font-bold shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400" />
              <span>{currentDate || 'Aug 28, 2026'}</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <Clock className="w-3.5 h-3.5 text-[#9C2007] dark:text-rose-400" />
              <span>{currentTime || '04:36 PM'}</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/60 text-slate-600 dark:text-slate-200 transition cursor-pointer"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/60 text-slate-600 dark:text-slate-200 transition cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#9C2007] rounded-full ring-2 ring-white dark:ring-[#0E1B33]" />
              </button>

              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#0E1B33] rounded-2xl shadow-2xl border border-slate-200 dark:border-blue-900/60 p-4 z-50 space-y-3 text-xs animate-in fade-in zoom-in-95 text-slate-800 dark:text-slate-200">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/50">
                      <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">System Notifications</span>
                      <span className="text-[10px] bg-rose-50 dark:bg-rose-950 text-[#9C2007] dark:text-rose-400 font-bold px-2 py-0.5 rounded-full">3 New</span>
                    </div>

                    <div className="space-y-2 text-slate-600 dark:text-slate-300">
                      <div className="p-2.5 bg-slate-50 dark:bg-[#152747]/60 rounded-xl space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white text-[11px]">New Clearance Application</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Juan Dela Cruz filed Barangay Clearance #ONSE-2026-8891.</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-[#152747]/60 rounded-xl space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white text-[11px]">DILG Full Disclosure Due</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Q3 Financial report upload scheduled for submission.</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-[#152747]/60 rounded-xl space-y-0.5">
                        <div className="font-bold text-slate-900 dark:text-white text-[11px]">Health Center Schedule</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">28 citizen medical consultations booked for this week.</div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Profile Badge */}
            <Link
              href="/profile"
              className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full bg-slate-50 dark:bg-[#0E1B33] hover:bg-slate-100 dark:hover:bg-[#152747] border border-slate-200 dark:border-blue-900/60 transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#9C2007] text-white flex items-center justify-center font-black text-xs shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[110px]">
                  {user.name.split(' ')[0]}
                </div>
                <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {user.roleTitle || user.role}
                </div>
              </div>
            </Link>

          </div>
        </header>

        {/* Dynamic Admin Subpage Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F8FAFC] dark:bg-[#070D18] transition-colors duration-200">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
