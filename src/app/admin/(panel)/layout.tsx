import type { Metadata } from 'next';
import AdminNav from '@/components/admin/AdminNav';
import { requireAdmin } from '@/lib/auth';
import { sql } from '@/lib/db';

export const metadata: Metadata = { title: 'Admin | John Nsoh', robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  let count = 0;
  try {
    count = (await sql`SELECT COUNT(*)::int AS c FROM enquiries WHERE status = 'new'`)[0]?.c ?? 0;
  } catch (error) {
    console.error('Could not count new enquiries', error);
  }
  return (
    <div className="admin-shell">
      <AdminNav newEnquiries={count} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
