
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Redirects legacy /wallet URL to the new /dashboard dashboard.
 */
export default function WalletRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
    </div>
  );
}
