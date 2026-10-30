'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fil';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.officials': 'Officials',
    'nav.services': 'Services',
    'nav.transparency': 'Transparency',
    'nav.events': 'Announcements/Events',
    'nav.contact': 'Contact',
    'nav.login': 'Resident Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile Settings',
    'nav.track': 'Track Certificates',
    'nav.notifications': 'Notifications',
    'nav.mark_all_read': 'Mark all read',
    'nav.view_all_notifications': 'View all notifications',
    'nav.no_notifications': 'No notifications yet',
    'nav.install': 'Install App',
    'nav.sk_programs': 'SK Youth Programs',

    // Hero Section
    'hero.badge': 'Republic of the Philippines • City of San Juan',
    'hero.title_part1': 'Smart Governance',
    'hero.title_part2': 'At Your Fingertips',
    'hero.desc': 'Welcome to the official website of Barangay Onse. Request civil clearances online, verify documents with anti-counterfeit QR codes, track public finances, and access 24/7 community services.',
    'hero.cta_request': 'Request Clearance Online',
    'hero.cta_track': 'Track Application',
    'hero.cta_login': 'Resident Login',
    'hero.cta_admin': 'Admin Portal',
    'hero.cta_resident_services': 'Resident Services',
    'hero.search_placeholder': 'Paste Tracking Code (e.g. ONSE-2026-8891)...',
    'hero.search_button': 'Track Status',

    // Services Section
    'services.badge': 'Online Barangay Hall',
    'services.heading': 'Official Barangay Certificates & Documents',
    'services.desc': 'Skip the long lines. Apply for official documents from home with secure digital processing, online payment options, and express pickup windows.',
    'services.view_all': 'View All Document Types',
    'services.request_btn': 'Apply Online',
    'services.fee_free': 'FREE',

    // Specific Services
    'svc.brgy_clearance.title': 'Barangay Clearance',
    'svc.brgy_clearance.desc': 'Official certificate for local employment, postal ID, bank accounts, and legal requirements.',
    'svc.residency.title': 'Certificate of Residency',
    'svc.residency.desc': 'Certified proof of official residency in Barangay Onse for government and commercial uses.',
    'svc.indigency.title': 'Certificate of Indigency',
    'svc.indigency.desc': 'Free official documentation for medical assistance, burial aid, and social welfare subsidies.',
    'svc.jobseeker.title': 'First-Time Jobseeker Certificate',
    'svc.jobseeker.desc': 'Waives government pre-employment document fees under Republic Act No. 11261.',
    'svc.business.title': 'Barangay Business Clearance',
    'svc.business.desc': 'Mandatory commercial permit for new business registration and annual mayor\'s permit renewal.',
    'svc.blotter.title': 'Barangay Incident / Blotter Certification',
    'svc.blotter.desc': 'Official certification of recorded blotter, incident extract, or conciliation settlement before the Lupong Tagapamayapa.',

    // Features Section
    'features.badge': 'Modern Public Administration',
    'features.heading': 'Why Choose SmartOnse Digital Portal?',
    'features.f1.title': 'Anti-Counterfeit QR Verification',
    'features.f1.desc': 'Every issued certificate carries a tamper-proof encrypted QR code verifiable by employers, embassies, and banks.',
    'features.f2.title': 'Fast & Transparent Processing',
    'features.f2.desc': 'Real-time SMS and dashboard updates as your documents are reviewed, printed, and signed by the Barangay Captain.',
    'features.f3.title': 'Philippine Data Privacy Compliance',
    'features.f3.desc': 'Protected under Republic Act No. 10173 and GDPR-grade standards with encrypted civil registry archives.',

    // Transparency
    'transparency.badge': 'Full Fiscal Transparency',
    'transparency.heading': 'Public Governance & Budget Disclosures',
    'transparency.desc': 'Under the DILG Full Disclosure Policy, Barangay Onse publishes quarterly itemized IRA utilization ledgers, BDRRMF allocations, and procurement biddings.',

    // Footer
    'footer.developed': 'Developed for Barangay Onse, San Juan City',
    'footer.copyright': '© 2026 SmartOnse Digital Governance Systems. Republic of the Philippines.',
    'footer.quick_links': 'Quick Links',
    'footer.contact_us': 'Barangay Hall Contact',
    'footer.hall_address': '145 Lt. Artiaga St., Barangay Onse, City of San Juan, Metro Manila',
    'footer.hall_hours': 'Monday – Friday: 8:00 AM – 5:00 PM',
    'footer.emergency': 'Emergency Hotline: (02) 8724-4488 / (02) 8723-8888',

    // Accessibility
    'a11y.title': 'Accessibility & Vision Controls',
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
    // Nav
    'nav.home': 'Tahanan',
    'nav.about': 'Tungkol sa Onse',
    'nav.officials': 'Mga Opisyal',
    'nav.services': 'Mga Serbisyo',
    'nav.transparency': 'Katapatan at Badyet',
    'nav.events': 'Mga Anunsyo at Kaganapan',
    'nav.contact': 'Ugnayan',
    'nav.login': 'Mag-login ang Residente',
    'nav.register': 'Magrehistro',
    'nav.logout': 'Mag-logout',
    'nav.profile': 'Mga Setting ng Profile',
    'nav.track': 'Subaybayan ang Dokumento',
    'nav.notifications': 'Mga Abiso',
    'nav.mark_all_read': 'Basahin lahat',
    'nav.view_all_notifications': 'Tingnan ang lahat ng abiso',
    'nav.no_notifications': 'Wala pang mga abiso',
    'nav.install': 'I-install ang App',
    'nav.sk_programs': 'Mga Programa ng Kabataan (SK)',

    // Hero Section
    'hero.badge': 'Republika ng Pilipinas • Lungsod ng San Juan',
    'hero.title_part1': 'Matalinong Pamamahala',
    'hero.title_part2': 'Abot-Kamay Mo',
    'hero.desc': 'Maligayang pagdating sa opisyal na website ng Barangay Onse. Mag-request ng clearance online, mag-verify gamit ang anti-counterfeit QR code, subaybayan ang badyet, at kumuha ng tulong 24/7.',
    'hero.cta_request': 'Mag-request ng Clearance Online',
    'hero.cta_track': 'Subaybayan ang Aplikasyon',
    'hero.cta_login': 'Login ng Residente',
    'hero.cta_admin': 'Admin Portal',
    'hero.cta_resident_services': 'Mga Serbisyo ng Residente',
    'hero.search_placeholder': 'I-paste ang Tracking Code (hal. ONSE-2026-8891)...',
    'hero.search_button': 'Alamin ang Katayuan',

    // Services Section
    'services.badge': 'Online na Barangay Hall',
    'services.heading': 'Mga Opisyal na Sertipiko at Dokumento',
    'services.desc': 'Iwasan ang mahabang pila. Mag-apply para sa mga opisyal na dokumento mula sa tahanan gamit ang mabilis na online processing at express pick-up.',
    'services.view_all': 'Tingnan ang Lahat ng Uri ng Dokumento',
    'services.request_btn': 'Mag-apply Online',
    'services.fee_free': 'LIBRE',

    // Specific Services
    'svc.brgy_clearance.title': 'Barangay Clearance',
    'svc.brgy_clearance.desc': 'Opisyal na sertipiko para sa lokal na trabaho, Postal ID, bank account, at iba pang legal na pangangailangan.',
    'svc.residency.title': 'Sertipiko ng Paninirahan (Residency)',
    'svc.residency.desc': 'Katunayan ng opisyal na paninirahan sa Barangay Onse para sa mga transaksyong pampubliko at pribado.',
    'svc.indigency.title': 'Sertipiko ng Indigency',
    'svc.indigency.desc': 'Libreng opisyal na dokumento para sa tulong-medikal, ayuda sa libing, at suporta mula sa DSWD/AICS.',
    'svc.jobseeker.title': 'Sertipiko ng First-Time Jobseeker',
    'svc.jobseeker.desc': 'Libreng pre-employment documents alinsunod sa itinatadhana ng Republic Act No. 11261.',
    'svc.business.title': 'Barangay Business Clearance',
    'svc.business.desc': 'Kailangang permit para sa pagpaparehistro ng bagong negosyo at taunang Mayor\'s Permit renewal.',
    'svc.blotter.title': 'Sertipikasyon ng Barangay Blotter / Rekord',
    'svc.blotter.desc': 'Opisyal na katunayan ng naitalang blotter, ulat ng insidente, o kasunduan sa Lupong Tagapamayapa.',

    // Features Section
    'features.badge': 'Makabagong Serbisyong Publiko',
    'features.heading': 'Bakit SmartOnse ang Ginagamit ng Pamayanan?',
    'features.f1.title': 'Anti-Counterfeit QR Verification',
    'features.f1.desc': 'Bawat sertipiko ay may naka-encrypt na QR code na madaling mai-verify ng mga kumpanya, embahada, at bangko.',
    'features.f2.title': 'Mabilis at Transparent na Proseso',
    'features.f2.desc': 'Makatanggap ng real-time SMS at online update habang sinusuri, pinipirmahan, at inihahanda ng Kapitan ang iyong dokumento.',
    'features.f3.title': 'Proteksyon sa ilalim ng Data Privacy Act',
    'features.f3.desc': 'Mahigpit na protektado sa ilalim ng Republic Act No. 10173 gamit ang mga secure at naka-encrypt na database.',

    // Transparency
    'transparency.badge': 'Buong Katapatan sa Pondo',
    'transparency.heading': 'Ulat sa Badyet at Pamamahala',
    'transparency.desc': 'Alinsunod sa DILG Full Disclosure Policy, inilalathala ng Barangay Onse ang kwarterly na ulat sa paggamit ng IRA, pondo sa kalamidad (BDRRMF), at pampublikong bidding.',

    // Footer
    'footer.developed': 'Binuo para sa Barangay Onse, Lungsod ng San Juan',
    'footer.copyright': '© 2026 SmartOnse Digital Governance Systems. Republika ng Pilipinas.',
    'footer.quick_links': 'Mabilisang Links',
    'footer.contact_us': 'Ugnayan sa Barangay Hall',
    'footer.hall_address': '145 Lt. Artiaga St., Barangay Onse, Lungsod ng San Juan, Metro Manila',
    'footer.hall_hours': 'Lunes – Biyernes: 8:00 AM – 5:00 PM',
    'footer.emergency': 'Emergency Hotline: (02) 8724-4488 / (02) 8723-8888',

    // Accessibility
    'a11y.title': 'Mga Kontrol sa Accessibility at Paningin',
    'a11y.font_size': 'Laki ng Letra',
    'a11y.normal': 'Normal',
    'a11y.large': 'Malaki',
    'a11y.xlarge': 'Napakalaki',
    'a11y.contrast': 'Kontras sa Kulay',
    'a11y.default_contrast': 'Karaniwan',
    'a11y.high_contrast': 'Mataas na Kontras',
    'a11y.dark_mode': 'Madilim na Mode',
    'a11y.lang': 'Wika / Language',
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
    return translations[language]?.[key] || translations['en']?.[key] || key;
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
