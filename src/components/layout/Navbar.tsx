'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAccessibility, ColorVisionMode, TextSizeMode } from '@/contexts/AccessibilityContext';
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
  Sliders,
  Eye,
  Check,
  RotateCcw,
  Volume2
} from 'lucide-react';

function AccessibilityPanel() {
  const { language, setLanguage, t } = useLanguage();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const {
    colorVision,
    setColorVision,
    textSize,
    setTextSize,
    reducedMotion,
    setReducedMotion,
    screenReaderFriendly,
    setScreenReaderFriendly,
    resetAccessibility,
  } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const colorModes: { id: ColorVisionMode; label: string; preview: string }[] = [
    { id: 'normal', label: 'Default', preview: 'bg-[#9C2007]' },
    { id: 'high-contrast', label: 'High Contrast', preview: 'bg-black border border-yellow-400' },
    { id: 'protanopia', label: 'Protanopia (Red-Blind)', preview: 'bg-[#1D4ED8]' },
    { id: 'deuteranopia', label: 'Deuteranopia (Green-Blind)', preview: 'bg-[#D97706]' },
    { id: 'tritanopia', label: 'Tritanopia (Blue-Blind)', preview: 'bg-[#E11D48]' },
    { id: 'monochrome', label: 'Monochrome', preview: 'bg-slate-700' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all cursor-pointer ${
          isOpen || colorVision !== 'normal' || textSize !== 'normal'
            ? 'bg-white text-[#9C2007] shadow-md ring-2 ring-white/50'
            : 'bg-white/10 hover:bg-white/20 text-white'
        }`}
        title="Accessibility, Vision & Theme Controls"
      >
        <Sliders className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 max-h-[85vh] overflow-y-auto bg-white dark:bg-[#0E1B33] rounded-3xl shadow-2xl border border-slate-200 dark:border-blue-900/60 z-[70] p-4 text-slate-800 dark:text-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-blue-900/40">
              <span className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">
                <Sliders className="w-4 h-4 text-[#9C2007] dark:text-rose-400" />
                Accessibility Controls
              </span>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display Theme */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Display Theme</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`text-xs py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    theme === 'light' 
                      ? 'bg-[#9C2007] text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`text-xs py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    theme === 'dark' 
                      ? 'bg-[#9C2007] text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`text-xs py-1.5 px-2 rounded-xl font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Language / Wika</label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                    language === 'en' 
                      ? 'bg-[#9C2007] text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('fil')}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                    language === 'fil' 
                      ? 'bg-[#9C2007] text-white shadow-xs' 
                      : 'bg-slate-100 dark:bg-[#152747] text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Tagalog
                </button>
              </div>
            </div>

            {/* Font Size for Seniors */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Font Size (Seniors &amp; Low Vision)</label>
              <div className="flex flex-col gap-1">
                {[
                  { id: 'normal' as TextSizeMode, label: 'Normal (100%)' },
                  { id: 'large' as TextSizeMode, label: 'Large (118%)' },
                  { id: 'extra-large' as TextSizeMode, label: 'Extra Large (132%)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTextSize(s.id)}
                    className={`w-full text-left text-xs py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-between ${
                      textSize === s.id
                        ? 'bg-slate-100 dark:bg-[#152747] border-l-4 border-[#9C2007] text-slate-900 dark:text-white shadow-2xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{s.label}</span>
                    {textSize === s.id && <Check className="w-3.5 h-3.5 text-[#9C2007]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Vision Deficiency (CVD) Filters */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#9C2007]" />
                <span>Color Blindness &amp; Vision Filters</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {colorModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setColorVision(mode.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                      colorVision === mode.id
                        ? 'border-[#9C2007] dark:border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-slate-900 dark:text-white font-bold'
                        : 'border-slate-200 dark:border-blue-900/40 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152747]'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${mode.preview}`} />
                    <span className="text-[11px] truncate">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Extra Accessibility Toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-blue-900/40 space-y-1.5 text-xs">
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#152747]/50 cursor-pointer">
                <span className="text-[11px] font-bold">Reduce Animations</span>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="rounded text-[#9C2007] accent-[#9C2007] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#152747]/50 cursor-pointer">
                <span className="text-[11px] font-bold">High-Contrast Focus Rings</span>
                <input
                  type="checkbox"
                  checked={screenReaderFriendly}
                  onChange={(e) => setScreenReaderFriendly(e.target.checked)}
                  className="rounded text-[#9C2007] accent-[#9C2007] cursor-pointer"
                />
              </label>
            </div>

            {/* Reset */}
            <div className="pt-2 border-t border-slate-100 dark:border-blue-900/40 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={resetAccessibility}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-[#9C2007] text-white rounded-lg text-xs font-bold hover:bg-[#8B1A05] cursor-pointer"
              >
                Done
              </button>
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
  const { language, toggleLanguage, setLanguage, t } = useLanguage();
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
    { name: language === 'fil' ? 'Mga Programa ng SK' : 'SK Programs', href: '/sk-programs' },
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
                  {user.role === 'resident' ? 'Resident Services' : 'Admin Portal'}
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

