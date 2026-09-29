import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BarangayAiAssistant from '@/components/chatbot/BarangayAiAssistant';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import PrivacyConsentModal from '@/components/modals/PrivacyConsentModal';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SmartOnse - Barangay Onse Digital E-Governance Website',
  description: 'Official website for Barangay Onse, San Juan City. Request clearances, track documents, book health appointments, and view public transparency records.',
  keywords: ['Barangay Onse', 'San Juan City', 'Barangay Clearance', 'Smart Governance', 'SK Onse', 'Transparency'],
  icons: {
    icon: [
      { url: '/images/barangay-onse-seal.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/barangay-onse-seal.png',
    apple: '/images/barangay-onse-seal.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/barangay-onse-seal.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/barangay-onse-seal.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('smartonse_theme');
                  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (saved === 'system' && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else if (saved === 'light') {
                    document.documentElement.classList.remove('dark');
                  } else if (!saved && prefersDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 dark:bg-[#070D18] text-slate-900 dark:text-slate-100 transition-colors duration-200`}>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <NotificationProvider>
                <Navbar />
                <main className="flex-1">
                  {children}
                </main>
                <Footer />
                <BarangayAiAssistant />
                <PrivacyConsentModal />
              </NotificationProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



