'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function VisitTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    fetch('/api/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);
  return null;
}
