'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  User, 
  LogOut, 
  LayoutDashboard, 
  ChevronDown, 
  ShieldCheck, 
  Crown, 
  FileText, 
  Users, 
  Award, 
  UserCheck, 
  ExternalLink,
  Info,
  X,
  Mail,
  Phone,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function AccountMenu() {
  const { user, login, logout } = useAuth();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  if (!user) return null;

  const roleConfigs: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; dest: string }> = {
    admin: { label: 'Barangay Captain / Admin', icon: <Crown className="w-4 h-4 text-[#9C2007]" />, color: 'text-[#9C2007]', bg: 'bg-rose-50', dest: '/admin' },
    captain: { label: 'Barangay Captain / Admin', icon: <Crown className="w-4 h-4 text-[#9C2007]" />, color: 'text-[#9C2007]', bg: 'bg-rose-50', dest: '/admin' },
    super_admin: { label: 'Super Admin / Captain', icon: <Crown className="w-4 h-4 text-[#9C2007]" />, color: 'text-[#9C2007]', bg: 'bg-rose-50', dest: '/admin' },
    barangay_captain: { label: 'Barangay Captain / Admin', icon: <Crown className="w-4 h-4 text-[#9C2007]" />, color: 'text-[#9C2007]', bg: 'bg-rose-50', dest: '/admin' },
    barangay_councilor: { label: 'Barangay Kagawad', icon: <Award className="w-4 h-4 text-blue-600" />, color: 'text-blue-700', bg: 'bg-blue-50', dest: '/admin' },
    sk_chairperson: { label: 'SK Chairperson', icon: <Users className="w-4 h-4 text-purple-600" />, color: 'text-purple-700', bg: 'bg-purple-50', dest: '/admin' },
    sk_councilor: { label: 'SK Kagawad', icon: <Users className="w-4 h-4 text-purple-600" />, color: 'text-purple-700', bg: 'bg-purple-50', dest: '/admin' },
    staff: { label: 'Desk & Document Staff', icon: <FileText className="w-4 h-4 text-amber-600" />, color: 'text-amber-700', bg: 'bg-amber-50', dest: '/admin' },
    kagawad: { label: 'Barangay Kagawad', icon: <Award className="w-4 h-4 text-blue-600" />, color: 'text-blue-700', bg: 'bg-blue-50', dest: '/admin' },
    sk: { label: 'SK Chairman / Youth Leader', icon: <Users className="w-4 h-4 text-purple-600" />, color: 'text-purple-700', bg: 'bg-purple-50', dest: '/admin' },
    resident: { label: 'Verified Resident', icon: <UserCheck className="w-4 h-4 text-emerald-600" />, color: 'text-emerald-700', bg: 'bg-emerald-50', dest: '/portal/request' },
  };

  const currentRole = roleConfigs[user.role] || roleConfigs.admin;

  const switchRole = async (roleKey: string, name: string, email: string, dest: string, title: string) => {
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: roleKey }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        login(data.user);
        setIsDropdownOpen(false);
        router.push(data.user.destination || dest);
        return;
      }
    } catch (e) {
      console.error('Role switch failed:', e);
    }

    login({
      id: roleKey,
      name,
      email,
      role: roleKey,
      roleTitle: title,
      destination: dest,
    });
    setIsDropdownOpen(false);
    router.push(dest);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    router.push('/');
  };

  // Only residents get "Document Tracking". All administrators and officials get "Admin Portal".
  const isResident = user.role === 'resident';
  const portalLabel = isResident ? 'Document Tracking' : 'Admin Portal';
  const portalMobile = isResident ? 'Tracking' : 'Admin Portal';
  const portalHref = isResident ? '/track' : (user.destination || '/admin');

  return (
    <>
      <div className="relative flex items-center gap-2">
        {/* Direct Action Button */}
        <Link
          href={portalHref}
          className="flex items-center gap-2 bg-white text-[#9C2007] hover:bg-rose-50 px-4 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-black/20 transition-all cursor-pointer border border-white/20"
        >
          {isResident ? (
            <FileText className="w-4 h-4 text-[#9C2007]" />
          ) : (
            <LayoutDashboard className="w-4 h-4 text-[#9C2007]" />
          )}
          <span className="hidden sm:inline">{portalLabel}</span>
          <span className="sm:hidden">{portalMobile}</span>
        </Link>

        {/* User Profile Pill & Dropdown Toggle */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white pl-2 pr-3 py-1.5 rounded-full transition-all cursor-pointer shadow-md"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#9C2007] border border-white/30 text-white flex items-center justify-center font-black text-xs shadow-inner">
              {user.name.charAt(0)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#800000] rounded-full" />
          </div>

          <div className="text-left hidden md:block max-w-[130px]">
            <div className="text-xs font-black text-white leading-tight truncate">
              {user.name}
            </div>
            <div className="text-[9px] font-bold text-rose-200 uppercase tracking-wider truncate">
              {user.roleTitle || currentRole.label}
            </div>
          </div>

          <ChevronDown className={`w-3.5 h-3.5 text-rose-200 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            <div className="fixed inset-0 z-[70]" onClick={() => setIsDropdownOpen(false)} />
            
            <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white dark:bg-[#0E1B33] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/60 z-[80] overflow-hidden p-5 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
              {/* Account Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-blue-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#9C2007] to-rose-900 text-white flex items-center justify-center font-black text-lg shadow-md shadow-red-900/20">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm leading-tight flex items-center gap-1.5">
                      {user.name}
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[190px]">
                      {user.email}
                    </p>
                    <span className={`inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentRole.bg} ${currentRole.color} dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800`}>
                      {user.roleTitle || currentRole.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Launch Portal Action */}
              <div className="py-3 space-y-2">
                <Link
                  href={portalHref}
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black text-xs uppercase tracking-wider shadow-md shadow-red-900/20 transition-all group"
                >
                  <span className="flex items-center gap-2">
                    {isResident ? <FileText className="w-4 h-4" /> : <LayoutDashboard className="w-4 h-4" />}
                    <span>{isResident ? 'Track Requested Documents' : 'Launch Admin Portal'}</span>
                  </span>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#152747] hover:bg-slate-100 dark:hover:bg-[#1C335C] text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>My Account, Info &amp; Security</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Quick Switch Demo Account */}
              <div className="pt-2 border-t border-slate-100 dark:border-blue-900/50">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-[#9C2007]" />
                  Switch Role / Persona:
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => switchRole('admin', 'Hon. Roberto Alba (Captain)', 'captain@onse.gov.ph', '/admin', 'Admin / Captain')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-blue-900/60 hover:border-[#9C2007] bg-slate-50 dark:bg-[#152747]/60 hover:bg-rose-50/50 text-left transition text-[11px] font-bold text-slate-700 dark:text-slate-200"
                  >
                    👑 Captain Alba
                  </button>
                  <button
                    onClick={() => switchRole('staff', 'Jonathan D. Sorio', 'records@onse.gov.ph', '/admin/requests', 'Desk Staff')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-blue-900/60 hover:border-[#9C2007] bg-slate-50 dark:bg-[#152747]/60 hover:bg-rose-50/50 text-left transition text-[11px] font-bold text-slate-700 dark:text-slate-200"
                  >
                    📋 Staff Sorio
                  </button>
                  <button
                    onClick={() => switchRole('kagawad', 'Hon. Danilo Florano', 'kagawad@onse.gov.ph', '/admin/services', 'Kagawad')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-blue-900/60 hover:border-[#9C2007] bg-slate-50 dark:bg-[#152747]/60 hover:bg-rose-50/50 text-left transition text-[11px] font-bold text-slate-700 dark:text-slate-200"
                  >
                    🎖️ Kagawad Florano
                  </button>
                  <button
                    onClick={() => switchRole('resident', 'Juan Dela Cruz', 'juan@onse.ph', '/portal/request', 'Resident Citizen')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-blue-900/60 hover:border-[#9C2007] bg-slate-50 dark:bg-[#152747]/60 hover:bg-rose-50/50 text-left transition text-[11px] font-bold text-slate-700 dark:text-slate-200"
                  >
                    👤 Resident Juan
                  </button>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-blue-900/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Account Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E1B33] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-blue-900/60 relative space-y-5 text-slate-800 dark:text-slate-200">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#9C2007] to-rose-900 text-white flex items-center justify-center text-3xl font-black mx-auto shadow-xl shadow-red-900/20">
                {user.name.charAt(0)}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {user.name}
              </h3>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Active Account
                </span>
              </div>
            </div>

            {/* Account Details List */}
            <div className="bg-slate-50 dark:bg-[#152747]/60 rounded-2xl p-4 divide-y divide-slate-200/60 dark:divide-blue-900/40 text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2.5">
                <span className="text-slate-400 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Designation / Role:
                </span>
                <span className="font-black text-slate-900 dark:text-white">{user.roleTitle || currentRole.label}</span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-400 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Official Email:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{user.email}</span>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <span className="text-slate-400 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Barangay Hotline:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">(02) 8123-4567</span>
              </div>

              <div className="flex items-center justify-between pt-2.5">
                <span className="text-slate-400 dark:text-slate-400 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  Official Term:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">2023 &ndash; 2026</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-2">
              <Link
                href="/profile"
                onClick={() => setIsProfileModalOpen(false)}
                className="flex-1 py-3 text-center rounded-xl bg-[#9C2007] hover:bg-[#8B1A05] text-white font-black text-xs uppercase tracking-wider shadow-md transition"
              >
                Manage Profile &amp; Security
              </Link>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-[#152747] hover:bg-slate-200 dark:hover:bg-[#1C335C] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
