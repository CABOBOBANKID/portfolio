'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import EnquiryBadge from './EnquiryBadge';
import { logout } from '@/app/admin/actions';

const items = [
  ['/admin/dashboard', 'Dashboard'],
  ['/admin/projects', 'Projects'],
  ['/admin/services', 'Services'],
  ['/admin/skills', 'Skills'],
  ['/admin/testimonials', 'Testimonials'],
  ['/admin/blog', 'Blog'],
  ['/admin/enquiries', 'Enquiries'],
  ['/admin/media', 'Media'],
  ['/admin/cv', 'CV'],
  ['/admin/profile', 'Profile'],
  ['/admin/analytics', 'Analytics'],
  ['/admin/settings', 'Settings'],
] as const;

export default function AdminNav({ newEnquiries }: { newEnquiries: number }) {
  const pathname = usePathname();
  return (
    <aside className="admin-side">
      <p className="brand">Admin</p>
      <nav aria-label="Admin">
        {items.map(([href, label]) => (
          <Link key={href} href={href} className={pathname === href || pathname.startsWith(href + '/') ? 'active' : ''}>
            {label}
            {href === '/admin/enquiries' && <> <EnquiryBadge initial={newEnquiries} /></>}
          </Link>
        ))}
        <a href="/" target="_blank" rel="noopener noreferrer">View site</a>
        <form action={logout}>
          <button className="linklike" type="submit">Log out</button>
        </form>
      </nav>
    </aside>
  );
}
