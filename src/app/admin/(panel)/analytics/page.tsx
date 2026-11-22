import { sql } from '@/lib/db';

export default async function Analytics() {
  const one = async (q: Promise<Record<string, any>[]>) => (await q)[0]?.c ?? 0;
  const [today, week, month, unique, daily, top] = await Promise.all([
    one(sql`SELECT COUNT(*)::int AS c FROM page_visits WHERE visited_on = CURRENT_DATE`),
    one(sql`SELECT COUNT(*)::int AS c FROM page_visits WHERE visited_on >= CURRENT_DATE - 6`),
    one(sql`SELECT COUNT(*)::int AS c FROM page_visits WHERE visited_on >= CURRENT_DATE - 29`),
    one(sql`SELECT COUNT(DISTINCT ip_hash)::int AS c FROM page_visits WHERE visited_on >= CURRENT_DATE - 29`),
    sql`SELECT visited_on::text AS day, COUNT(*)::int AS views FROM page_visits WHERE visited_on >= CURRENT_DATE - 13 GROUP BY visited_on ORDER BY visited_on`,
    sql`SELECT path, COUNT(*)::int AS views FROM page_visits WHERE visited_on >= CURRENT_DATE - 29 GROUP BY path ORDER BY views DESC LIMIT 10`,
  ]);
  if (Math.random() < 0.02) await sql`DELETE FROM page_visits WHERE visited_on < CURRENT_DATE - 400`;
  const max = Math.max(1, ...daily.map((r) => r.views as number));
  const stats: [string, number][] = [['Views today', today], ['Views, last 7 days', week], ['Views, last 30 days', month], ['Unique visitors, 30 days', unique]];
  return (
    <>
      <div className="admin-top"><h1>Analytics</h1></div>
      <div className="stat-grid">
        {stats.map(([label, value]) => <div className="card stat-card" key={label}><strong>{value}</strong><span className="muted">{label}</span></div>)}
      </div>
      <h2>Last 14 days</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Date</th><th>Views</th><th>Trend</th></tr></thead>
        <tbody>
          {daily.map((r) => <tr key={r.day}><td>{r.day}</td><td>{r.views}</td><td><progress max={max} value={r.views} /></td></tr>)}
          {daily.length === 0 && <tr><td colSpan={3} className="muted">No visits recorded yet.</td></tr>}
        </tbody>
      </table></div>
      <h2>Top pages, last 30 days</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Page</th><th>Views</th></tr></thead>
        <tbody>
          {top.map((r) => <tr key={r.path}><td>{r.path}</td><td>{r.views}</td></tr>)}
          {top.length === 0 && <tr><td colSpan={2} className="muted">No data yet.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}
