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

import NotificationBellDropdown from '@/components/notifications/NotificationBellDropdown';

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
    <nav className="fixed top-0 w-full z-[60] px-4 sm:px-6 lg:px-8 xl:px-10 py-4 flex justify-between items-center bg-[#800000] border-b border-[#600000] shadow-lg">
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <div className="w-12 h-12 sm:w-13 sm:h-13 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/20 overflow-hidden shrink-0">
          <img src="/images/barangay-onse-seal.png" alt="Barangay Onse Seal" className="w-full h-full object-cover" />
        </div>
        <Link href="/" className="text-xl sm:text-2xl font-black uppercase tracking-normal select-none shrink-0">
          <span className="text-white">SMART</span><span className="text-slate-200">ONSE</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-3.5 xl:gap-6 ml-4 xl:ml-8 shrink-0">
        {navLinks.map((link) => {
          const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`text-[10.5px] xl:text-[11px] font-black uppercase tracking-wider xl:tracking-widest whitespace-nowrap transition-all ${
                isActive ? 'text-[#ffcccc] font-extrabold underline decoration-2 underline-offset-8' : 'text-white/80 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          );
        })}

        <div className="flex gap-2 items-center shrink-0 ml-2">
          {/* Quick Direct Light/Dark Mode Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-full transition-all cursor-pointer shadow-xs"
            title={`Current: ${resolvedTheme === 'dark' ? 'Dark Mode' : 'Light Mode'} (Click to switch)`}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-slate-100 animate-in spin-in-180 duration-200" />
            )}
          </button>

          {/* Notification Bell (Only for Logged In Citizens / Staff) */}
          {user && <NotificationBellDropdown variant="navbar" />}

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
                className="bg-white text-[#9C2007] px-3.5 xl:px-4 py-2 rounded-full text-[10.5px] xl:text-[11px] font-black uppercase tracking-wider xl:tracking-widest shadow-xl shadow-black/20 hover:bg-red-50 transition-all cursor-pointer whitespace-nowrap"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/register"
                className="bg-[#9C2007] text-white px-3.5 xl:px-4 py-2 rounded-full text-[10.5px] xl:text-[11px] font-black uppercase tracking-wider xl:tracking-widest shadow-xl shadow-[#9C2007]/30 hover:brightness-110 transition-all cursor-pointer border border-white/10 whitespace-nowrap"
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

