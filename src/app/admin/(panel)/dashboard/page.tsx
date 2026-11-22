import Link from 'next/link';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import { sql } from '@/lib/db';
import { formatDate } from '@/lib/util';

export default async function Dashboard({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const sp = await searchParams;
  const one = async (q: Promise<Record<string, any>[]>) => (await q)[0]?.c ?? 0;
  const [projects, newEnq, totalEnq, views, recent] = await Promise.all([
    one(sql`SELECT COUNT(*)::int AS c FROM projects`),
    one(sql`SELECT COUNT(*)::int AS c FROM enquiries WHERE status = 'new'`),
    one(sql`SELECT COUNT(*)::int AS c FROM enquiries`),
    one(sql`SELECT COUNT(*)::int AS c FROM page_visits WHERE visited_on >= CURRENT_DATE - 6`),
    sql`SELECT id, full_name, email, project_type, status, created_at FROM enquiries ORDER BY created_at DESC, id DESC LIMIT 8`,
  ]);
  const stats: [string, number, string][] = [
    ['Projects', projects, '/admin/projects'],
    ['New enquiries', newEnq, '/admin/enquiries?status=new'],
    ['Total enquiries', totalEnq, '/admin/enquiries'],
    ['Views, last 7 days', views, '/admin/analytics'],
  ];
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Dashboard</h1></div>
      <div className="stat-grid">
        {stats.map(([label, value, href]) => (
          <Link className="card stat-card" href={href} key={label}><strong>{value}</strong><span className="muted">{label}</span></Link>
        ))}
      </div>
      <div className="admin-top"><h2>Recent enquiries</h2><Link className="btn btn-ghost btn-sm" href="/admin/enquiries">View all</Link></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Received</th></tr></thead>
          <tbody>
            {recent.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/admin/enquiries?id=${r.id}`}>{r.full_name}</Link></td>
                <td>{r.email}</td>
                <td>{r.project_type}</td>
                <td><span className={`status status-${r.status}`}>{r.status}</span></td>
                <td>{formatDate(r.created_at, true)}</td>
              </tr>
            ))}
            {recent.length === 0 && <tr><td colSpan={5} className="muted">No enquiries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
