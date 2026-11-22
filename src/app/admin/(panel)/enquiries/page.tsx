import Link from 'next/link';
import ConfirmButton from '@/components/admin/ConfirmButton';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import { sql } from '@/lib/db';
import { ENQUIRY_STATUSES, formatDate } from '@/lib/util';
import { deleteEnquiry, setEnquiryStatus } from '../../actions';

export default async function Enquiries({ searchParams }: { searchParams: Promise<FlashParams & { id?: string; status?: string }> }) {
  const sp = await searchParams;
  const filter = (ENQUIRY_STATUSES as readonly string[]).includes(sp.status ?? '') ? (sp.status as string) : '';
  const selectedId = /^\d{1,9}$/.test(sp.id ?? '') ? Number(sp.id) : null;

  let selected = selectedId ? (await sql`SELECT * FROM enquiries WHERE id = ${selectedId}`)[0] : undefined;
  if (selected && selected.status === 'new') {
    await sql`UPDATE enquiries SET status = 'read' WHERE id = ${selected.id}`;
    selected = { ...selected, status: 'read' };
  }
  const counts = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, 0])) as Record<string, number>;
  for (const row of await sql`SELECT status, COUNT(*)::int AS c FROM enquiries GROUP BY status`) counts[row.status] = row.c;
  const rows = filter
    ? await sql`SELECT id, full_name, email, project_type, status, created_at FROM enquiries WHERE status = ${filter} ORDER BY created_at DESC, id DESC LIMIT 200`
    : await sql`SELECT id, full_name, email, project_type, status, created_at FROM enquiries ORDER BY created_at DESC, id DESC LIMIT 200`;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Enquiries</h1></div>

      {selected && (
        <div className="card">
          <h2>{selected.full_name}</h2>
          <p className="muted">Received {formatDate(selected.created_at, true)}</p>
          <p><a href={`mailto:${selected.email}?subject=${encodeURIComponent('Re: your project enquiry')}`}>{selected.email}</a>
            {selected.phone && <> &middot; {selected.phone}</>}
            {selected.company && <> &middot; {selected.company}</>}</p>
          <p><strong>Type:</strong> {selected.project_type}{selected.budget_range && <> &middot; <strong>Budget:</strong> {selected.budget_range}</>}</p>
          <p style={{ whiteSpace: 'pre-line' }}>{selected.message}</p>
          <form action={setEnquiryStatus} className="row-actions">
            <input type="hidden" name="id" value={selected.id} />
            <label className="hp-field" htmlFor="st">Status</label>
            <select id="st" name="status" defaultValue={selected.status}>
              {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" type="submit">Update status</button>
          </form>
        </div>
      )}

      <nav className="filters" aria-label="Filter enquiries">
        <Link href="/admin/enquiries" className={filter === '' ? 'active' : ''}>All ({total})</Link>
        {ENQUIRY_STATUSES.map((s) => (
          <Link key={s} href={`/admin/enquiries?status=${s}`} className={filter === s ? 'active' : ''}>{s.charAt(0).toUpperCase() + s.slice(1)} ({counts[s]})</Link>
        ))}
      </nav>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Type</th><th>Status</th><th>Received</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/admin/enquiries?id=${r.id}`}>{r.full_name}</Link></td>
                <td>{r.email}</td>
                <td>{r.project_type}</td>
                <td><span className={`status status-${r.status}`}>{r.status}</span></td>
                <td>{formatDate(r.created_at, true)}</td>
                <td>
                  <form action={deleteEnquiry}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Delete this enquiry permanently?" className="btn btn-danger btn-sm">Delete</ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="muted">No enquiries yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
