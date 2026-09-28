'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { canAccessModule, isAdminUser, normalizeRole, ROLES } from '@/lib/rbac';
import { 
  ShieldAlert, 
  User, 
  LogOut, 
  FileText, 
  ChevronRight,
  Clock, 
  Calendar, 
  Layers, 
  BarChart3, 
  Users, 
  Building2, 
  Receipt, 
  DollarSign, 
  UserCheck, 
  ClipboardList,
  Menu, 
  X, 
  ExternalLink,
  ChevronUp,
  Sun,
  Moon,
  Shield
} from 'lucide-react';
import NotificationBellDropdown from '@/components/notifications/NotificationBellDropdown';

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
  const [pendingCount, setPendingCount] = useState<number | null>(null);

  // Dynamic Breadcrumb based on active pathname
  const currentBreadcrumb = useMemo(() => {
    const routeMap: Record<string, { group: string; label: string }> = {
      '/admin': { group: 'Main & Analytics', label: 'Dashboard' },
      '/admin/requests': { group: 'Main & Analytics', label: 'Document Requests' },
      '/admin/residents': { group: 'Main & Analytics', label: 'Resident Directory' },
      '/admin/verifications': { group: 'Main & Analytics', label: 'Pending Verifications' },
      '/admin/services': { group: 'Operations & Services', label: 'Services & Rates' },
      '/admin/events': { group: 'Operations & Services', label: 'Events & Calendar' },
      '/admin/officials': { group: 'Operations & Services', label: 'Barangay Officials' },
      '/admin/transparency': { group: 'Transparency & Finance', label: 'Transparency & Disclosure' },
      '/admin/users': { group: 'Security & System', label: 'User Accounts & Roles' },
      '/admin/audit-logs': { group: 'Security & System', label: 'System Audit Logs' },
    };

    return routeMap[pathname] || { group: 'Main & Analytics', label: 'Dashboard' };
  }, [pathname]);

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
    const fetchPending = async () => {
      try {
        const res = await fetch('/api/admin/residents?type=pending');
        const data = await res.json();
        if (data.success) setPendingCount(data.users.length);
      } catch {
        // silently ignore
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      if (typeof window !== 'undefined') {
        window.location.replace('/login');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  // 1. Loading or Unauthenticated: Immediately redirect to login
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070D18] flex flex-col items-center justify-center p-4 space-y-4 font-sans text-center">
        <div className="w-12 h-12 border-4 border-[#9C2007] border-t-transparent rounded-full animate-spin" />
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Redirecting to Login...
          </p>
          <p className="text-[11px] text-slate-500">
            Please wait while we secure your session.
          </p>
        </div>
        <a
          href="/login"
          className="text-xs font-bold text-[#9C2007] hover:underline pt-2 inline-block"
        >
          Click here if you are not redirected &rarr;
        </a>
      </div>
    );
  }

  // 2. Resident Guard
  if (!isAdminUser(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1F1010] to-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="max-w-lg w-full bg-white dark:bg-[#0B1528] rounded-3xl sm:rounded-[2.5rem] p-8 sm:p-10 border border-slate-200 dark:border-blue-900/50 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-18 h-18 rounded-3xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-200 dark:border-amber-800/40">
              403 &bull; Insufficient Privileges
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Restricted Admin Area
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You are signed in as <strong className="text-slate-900 dark:text-white">{user.name}</strong> (<span className="text-[#9C2007] dark:text-rose-400 font-bold">{user.roleTitle || 'Resident Citizen'}</span>). 
              The Admin Portal is restricted to Barangay Officials and Desk Staff.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Link
              href="/portal/request"
              className="flex-1 py-3 rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Citizen Services</span>
            </Link>

            <Link
              href="/profile"
              className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-[#0E1B33] hover:bg-slate-200 dark:hover:bg-[#152747] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 border border-transparent dark:border-blue-900/40"
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </Link>

            <button
              onClick={() => logout()}
              className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-rose-200 dark:border-rose-900/40"
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
        { label: 'Dashboard', href: '/admin', moduleKey: 'dashboard', icon: <BarChart3 className="w-4 h-4" />, badge: null },
        { label: 'Document Requests', href: '/admin/requests', moduleKey: 'requests', icon: <Receipt className="w-4 h-4" />, badge: null },
        { label: 'Resident Directory', href: '/admin/residents', moduleKey: 'residents', icon: <Users className="w-4 h-4" />, badge: null },
        { label: 'Pending Verifications', href: '/admin/verifications', moduleKey: 'verifications', icon: <UserCheck className="w-4 h-4" />, badge: pendingCount !== null && pendingCount > 0 ? String(pendingCount) : null },
      ],
    },
    {
      group: 'OPERATIONS & SERVICES',
      items: [
        { label: 'Services & Rates', href: '/admin/services', moduleKey: 'services', icon: <Layers className="w-4 h-4" />, badge: null },
        { label: 'Events & Calendar', href: '/admin/events', moduleKey: 'events', icon: <Calendar className="w-4 h-4" />, badge: null },
        { label: 'Barangay Officials', href: '/admin/officials', moduleKey: 'officials', icon: <Building2 className="w-4 h-4" />, badge: null },
      ],
    },
    {
      group: 'TRANSPARENCY & FINANCE',
      items: [
        { label: 'Transparency & Disclosure', href: '/admin/transparency', moduleKey: 'transparency', icon: <DollarSign className="w-4 h-4" />, badge: null },
        { label: 'SK Youth Programs', href: '/sk-programs', moduleKey: 'dashboard', icon: <ChevronRight className="w-4 h-4" />, badge: null },
      ],
    },
    {
      group: 'SYSTEM & SECURITY',
      items: [
        { label: 'System Accounts', href: '/admin/users', moduleKey: 'user-management', icon: <Shield className="w-4 h-4" />, badge: null },
        { label: 'Audit Logs', href: '/admin/audit-logs', moduleKey: 'audit-logs', icon: <ClipboardList className="w-4 h-4" />, badge: null },
      ],
    },
  ];

  const handleRoleSwitch = async (newRole: string) => {
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: newRole }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.user);
        if (data.user.destination && data.user.destination !== pathname) {
          router.push(data.user.destination);
        }
        return;
      }
    } catch (e) {
      console.error('Admin role switch failed:', e);
    }

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
                Admin Portal
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

        {/* Role Selector */}
        <div className="px-4 pt-4">
          <div className="bg-[#070E1C] border border-blue-900/50 rounded-2xl p-3 space-y-1.5 shadow-inner">
            <label className="text-[9px] font-black uppercase tracking-wider text-blue-300/80">
              Active Role
            </label>
            <select
              value={normalizeRole(user.role)}
              onChange={(e) => handleRoleSwitch(e.target.value)}
              className="w-full text-xs font-bold text-white bg-[#0D1B33] border border-blue-700/50 rounded-xl p-2 focus:ring-1 focus:ring-[#9C2007] outline-none cursor-pointer"
            >
              <option value="super_admin">Super Admin / Captain</option>
              <option value="barangay_captain">Barangay Captain</option>
              <option value="barangay_councilor">Barangay Kagawad</option>
              <option value="sk_chairperson">SK Chairperson</option>
              <option value="staff">Desk Staff</option>
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
                  <span>Public Website</span>
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
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h2 className="text-xs font-black tracking-wider uppercase flex items-center gap-1.5">
                  <span className="text-slate-400 dark:text-slate-400 font-bold">{currentBreadcrumb.group}</span>
                  <span className="text-slate-300 dark:text-slate-600 font-bold">&gt;</span>
                  <span className="text-slate-900 dark:text-white font-black">{currentBreadcrumb.label}</span>
                </h2>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold tracking-wider uppercase mt-0.5 ml-4">
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

            {/* Real Dynamic Working Notification Bell */}
            <NotificationBellDropdown variant="admin" />

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
