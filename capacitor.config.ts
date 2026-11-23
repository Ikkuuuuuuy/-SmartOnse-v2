import type { CapacitorConfig } from '@capacitor/cli';

// For local Android Emulator testing against your PC's Next.js dev server (`npm run dev` on port 3001),
// 10.0.2.2 routes from the Android Studio Emulator directly to your host machine's localhost:3001.
// For production or physical devices, set CAPACITOR_SERVER_URL to your deployed Vercel URL
// (e.g. "https://smartonse-v2.vercel.app") or your PC's LAN IP (e.g. "http://192.168.1.x:3001").
const serverUrl = process.env.CAPACITOR_SERVER_URL || 'https://smartonse-v2.vercel.app';

const config: CapacitorConfig = {
  appId: 'ph.gov.barangayonse.smartonse',
  appName: 'SmartOnse',
  webDir: 'mobile-shell',
  server: {
    url: serverUrl,
    cleartext: true,
    allowNavigation: [
      '10.0.2.2',
      'localhost',
      '*.vercel.app',
      '*.supabase.co',
      'accounts.google.com',
    ],
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
};

export default config;
