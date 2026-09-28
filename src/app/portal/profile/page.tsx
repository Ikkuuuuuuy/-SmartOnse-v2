'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PortalProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/profile');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FDF8F6] dark:bg-[#070D18] flex items-center justify-center font-sans">
      <div className="w-10 h-10 border-4 border-[#9C2007] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
