'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import AccountMenu from '@/components/layout/AccountMenu';
import { 
  Bell, 
  Sun, 
  Moon, 
  Sparkles, 
  Calendar, 
  HeartPulse, 
  Trophy, 
  AlertTriangle,
  X,
  ExternalLink,
  Sliders
} from 'lucide-react';

function AccessibilityPanel() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  useEffect(() => {
    const saved = localStorage.getItem('smartonse_font_size') as any;
    if (saved) setFontSize(saved);
  }, []);

  const applyFontSize = (size: 'normal' | 'large' | 'xlarge') => {
    setFontSize(size);
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('font-size-large', 'font-size-xlarge');
    if (size === 'large') root.classList.add('font-size-large');
    if (size === 'xlarge') root.classList.add('font-size-xlarge');
    localStorage.setItem('smartonse_font_size', size);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
        title="Accessibility & Theme Settings"
      >
        <Sliders className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#0E1B33] rounded-2xl shadow-2xl border border-slate-100 dark:border-blue-900/60 overflow-hidden z-[70] p-4 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#9C2007]" />
                {t('a11y.title')}
              </span>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </h3>

            {/* Theme Mode Selection */}
            <div className="mb-4">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Display Theme</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setTheme('light')}
                  className={`text-xs py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                    theme === 'light' 
                      ? 'bg-[#9C2007] text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`text-xs py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                    theme === 'dark' 
                      ? 'bg-[#9C2007] text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`text-xs py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition-all ${
                    theme === 'system' 
                      ? 'bg-[#9C2007] text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div className="mb-4">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t('a11y.lang')}</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-bold transition-all ${language === 'en' ? 'bg-[#9C2007] text-white' : 'bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('fil')}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-bold transition-all ${language === 'fil' ? 'bg-[#9C2007] text-white' : 'bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
                >
                  Tagalog
                </button>
              </div>
            </div>

            {/* Font Size Selection */}
            <div className="mb-2">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{t('a11y.font_size')}</label>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => applyFontSize('normal')}
                  className={`w-full text-left text-xs py-1.5 px-3 rounded-lg font-semibold transition-all ${fontSize === 'normal' ? 'bg-slate-100 dark:bg-[#152747] border-l-4 border-[#9C2007] font-bold text-slate-900 dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  {t('a11y.normal')} (100%)
                </button>
                <button
                  onClick={() => applyFontSize('large')}
                  className={`w-full text-left text-xs py-1.5 px-3 rounded-lg font-semibold transition-all ${fontSize === 'large' ? 'bg-slate-100 dark:bg-[#152747] border-l-4 border-[#9C2007] font-bold text-slate-900 dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  {t('a11y.large')} (115%)
                </button>
                <button
                  onClick={() => applyFontSize('xlarge')}
                  className={`w-full text-left text-xs py-1.5 px-3 rounded-lg font-semibold transition-all ${fontSize === 'xlarge' ? 'bg-slate-100 dark:bg-[#152747] border-l-4 border-[#9C2007] font-bold text-slate-900 dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                  {t('a11y.xlarge')} (130%)
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PublicNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      icon: <Calendar className="w-4 h-4 text-amber-500" />,
      title: 'SOBA General Assembly 2026',
      desc: 'State of the Barangay Address with Captain Roberto Alba on Sept 12, 2:00 PM at Onse Gym.',
      tag: 'ASSEMBLY',
      tagColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      time: 'Just now',
    },
    {
      id: 2,
      icon: <HeartPulse className="w-4 h-4 text-emerald-500" />,
      title: 'Free Medical & Dental Mission',
      desc: 'Free general checkups, ECG, blood sugar testing, and vitamins this Friday, 8:00 AM.',
      tag: 'HEALTH',
      tagColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      time: '2 hours ago',
    },
    {
      id: 3,
      icon: <Trophy className="w-4 h-4 text-purple-500" />,
      title: 'SK Inter-Purok Youth Tournament',
      desc: 'Basketball & Volleyball team rosters are now accepting entries at the SK Office.',
      tag: 'SK YOUTH',
      tagColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      time: 'Yesterday',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
        title="Community Announcements & Notifications"
        aria-label="Community Notifications"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute top-1 right-1 w-4 h-4 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-xs">
          3
        </span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#0E1B33] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/60 overflow-hidden z-[70] p-4 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-blue-900/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-[#9C2007] dark:text-rose-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                  Community Announcements
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                3 Active
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-blue-900/40 my-2 max-h-72 overflow-y-auto custom-scrollbar">
              {notifications.map((item) => (
                <div key={item.id} className="py-3 px-1 hover:bg-slate-50 dark:hover:bg-[#152747]/60 rounded-xl transition space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">{item.time}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    {item.icon}
                    <span>{item.title}</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-blue-900/50 flex gap-2">
              <Link
                href="/events"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 text-center text-xs font-black uppercase tracking-wider bg-[#9C2007] text-white rounded-xl hover:bg-[#8B1A05] transition shadow-xs"
              >
                View Community Calendar &rarr;
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hide the global public navbar when viewing admin portal routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.officials'), href: '/officials' },
    { name: t('nav.services'), href: '/services' },
    { name: t('nav.transparency'), href: '/transparency' },
    { name: t('nav.events'), href: '/events' },
    { name: 'SK Portal', href: '/sk-programs' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  return (
    <nav className="fixed top-0 w-full z-[60] px-6 lg:px-10 py-5 flex justify-between items-center bg-[#800000] border-b border-[#600000] shadow-lg">
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/20 overflow-hidden shrink-0">
          <img src="/images/barangay-onse-seal.png" alt="Barangay Onse Seal" className="w-full h-full object-cover" />
        </div>
        <Link href="/" className="text-2xl font-black uppercase tracking-normal">
          <span className="text-white">SMART</span><span className="text-slate-200">ONSE</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-5 xl:gap-7">
        {navLinks.map((link) => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[11px] font-black uppercase tracking-widest transition-all ${
                isActive ? 'text-[#ffcccc] font-extrabold underline decoration-2 underline-offset-8' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          );
        })}

        <div className="flex gap-2 items-center">
          {/* Quick Direct Light/Dark Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition-all cursor-pointer shadow-xs"
            title={`Current: ${resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} (Click to switch)`}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-slate-100 animate-in spin-in-180 duration-200" />
            )}
          </button>


          {/* Public Notification Bell on Welcome / Public Pages */}
          <PublicNotificationCenter />

          {/* Accessibility & Language Drawer */}
          <AccessibilityPanel />

          {user ? (
            /* Logged in state with rich Account Menu and Portal Access */
            <AccountMenu />
          ) : (
            /* Logged out state */
            <>
              <Link
                href="/login"
                className="bg-white text-[#9C2007] px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:bg-red-50 transition-all cursor-pointer"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="bg-[#9C2007] text-white px-4 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#9C2007]/30 hover:brightness-110 transition-all cursor-pointer border border-white/10"
              >
                {t('nav.register')}
              </Link>
            </>
          )}
        </div>
      </div>


      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden p-3 text-white hover:text-rose-200 transition-colors cursor-pointer"
        aria-label="Open mobile menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[70] bg-[#800000] px-8 py-10 flex flex-col items-center justify-center gap-6 overflow-y-auto">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close mobile menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-black uppercase tracking-tighter text-white hover:text-rose-200 transition-colors"
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 w-full max-w-xs py-3 px-4 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/20 transition cursor-pointer"
          >
            {resolvedTheme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-300" />
                <span>Switch to Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-100" />
                <span>Switch to Dark Mode</span>
              </>
            )}
          </button>

          <div className="flex flex-col gap-3 w-full max-w-xs mt-2">

            {user ? (
              <div className="space-y-2 text-center w-full">
                <div className="p-3 bg-white/10 rounded-2xl text-white">
                  <div className="font-black text-sm">{user.name}</div>
                  <div className="text-xs text-rose-200">{user.roleTitle}</div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full block text-center bg-white/20 hover:bg-white/30 text-white py-3 rounded-full text-xs font-black uppercase tracking-widest border border-white/20"
                >
                  My Account &amp; Settings
                </Link>
                <Link
                  href={user.destination || '/admin'}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full block text-center bg-white text-[#9C2007] py-3.5 rounded-full text-xs font-black uppercase tracking-widest shadow-xl"
                >
                  Launch Portal
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-center bg-rose-950/80 text-white py-3 rounded-full text-xs font-black uppercase tracking-widest border border-white/20"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center bg-white text-[#9C2007] py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-xl"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-center bg-[#9C2007] text-white py-4 rounded-full text-sm font-black uppercase tracking-widest shadow-xl border border-white/20"
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

