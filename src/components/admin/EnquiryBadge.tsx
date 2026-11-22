'use client';

import { useEffect, useState } from 'react';

export default function EnquiryBadge({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  useEffect(() => {
    const poll = () => {
      if (document.hidden) return;
      fetch('/api/admin/enquiry-count', { cache: 'no-store', credentials: 'same-origin' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.new === 'number') setCount(data.new);
        })
        .catch(() => {});
    };
    const timer = setInterval(poll, 45000);
    document.addEventListener('visibilitychange', poll);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', poll);
    };
  }, []);
  return <span className="count-badge" hidden={count === 0}>{count}</span>;
}
