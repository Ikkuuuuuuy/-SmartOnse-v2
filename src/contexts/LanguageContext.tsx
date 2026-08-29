'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fil';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.officials': 'Officials',
    'nav.services': 'Services',
    'nav.transparency': 'Transparency',
    'nav.events': 'Announcements/Events',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile Settings',
    'nav.track': 'Track Documents',
    'nav.notifications': 'Notifications',
    'nav.mark_all_read': 'Mark all read',
    'nav.view_all_notifications': 'View all notifications',
    'nav.no_notifications': 'No notifications yet',
    'nav.install': 'Install App',
    'footer.developed': 'Developed for Brgy Onse',
    'footer.copyright': '© 2026 SmartOnse E-Governance Systems.',
    'footer.quick_links': 'Quick Links',
    'footer.contact_us': 'Contact Us',
    'a11y.title': 'Accessibility Controls',
    'a11y.font_size': 'Font Size',
    'a11y.normal': 'Normal',
    'a11y.large': 'Large',
    'a11y.xlarge': 'Extra Large',
    'a11y.contrast': 'Visual Contrast',
    'a11y.default_contrast': 'Default',
    'a11y.high_contrast': 'High Contrast',
    'a11y.dark_mode': 'Dark Mode',
    'a11y.lang': 'Language / Wika',
  },
  fil: {
    'nav.home': 'Tahanan',
    'nav.about': 'Tungkol',
    'nav.officials': 'Opisyal',
    'nav.services': 'Serbisyo',
    'nav.transparency': 'Katapatan',
    'nav.events': 'Kaganapan',
    'nav.contact': 'Ugnayan',
    'nav.login': 'Mag-login',
    'nav.register': 'Mag-register',
    'nav.logout': 'Mag-logout',
    'nav.profile': 'Mga Setting ng Profile',
    'nav.track': 'Subaybayan ang Dokumento',
    'nav.notifications': 'Mga Abiso',
    'nav.mark_all_read': 'Basahin lahat',
    'nav.view_all_notifications': 'Tingnan ang lahat ng abiso',
    'nav.no_notifications': 'Wala pang mga abiso',
    'nav.install': 'I-install ang App',
    'footer.developed': 'Gawa para sa Brgy Onse',
    'footer.copyright': '© 2026 SmartOnse E-Governance Systems.',
    'footer.quick_links': 'Mabilisang Links',
    'footer.contact_us': 'Makipag-ugnayan sa Amin',
    'a11y.title': 'Accessibility Controls',
    'a11y.font_size': 'Laki ng Letra',
    'a11y.normal': 'Normal',
    'a11y.large': 'Malaki',
    'a11y.xlarge': 'Napakalaki',
    'a11y.contrast': 'Kontras sa Kulay',
    'a11y.default_contrast': 'Karaniwan',
    'a11y.high_contrast': 'Mataas na Kontras',
    'a11y.dark_mode': 'Madilim na Mode',
    'a11y.lang': 'Language / Wika',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartonse_lang') as Language;
      if (saved === 'fil' || saved === 'en') setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartonse_lang', lang);
    }
  };

  const t = (key: string): string => {
    const langDict = translations[language] as Record<string, string> | undefined;
    return langDict?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
