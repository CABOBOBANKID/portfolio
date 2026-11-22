import Link from 'next/link';
import ConfirmButton from '@/components/admin/ConfirmButton';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import { sql } from '@/lib/db';
import { deleteService, saveService } from '../../actions';

export default async function Services({ searchParams }: { searchParams: Promise<FlashParams & { edit?: string }> }) {
  const sp = await searchParams;
  const rows = await sql`SELECT * FROM services ORDER BY sort_order, id`;
  const editId = /^\d{1,9}$/.test(sp.edit ?? '') ? Number(sp.edit) : 0;
  const edit = rows.find((r) => r.id === editId) ?? { id: 0, title: '', description: '', sort_order: rows.length + 1, is_published: true };
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Services</h1></div>
      <form action={saveService} className="card">
        <h2>{edit.id ? 'Edit service' : 'Add service'}</h2>
        <input type="hidden" name="id" value={edit.id || ''} />
        <div className="field"><label htmlFor="title">Title</label><input type="text" id="title" name="title" maxLength={120} required defaultValue={edit.title} /></div>
        <div className="field"><label htmlFor="description">Description</label><textarea id="description" name="description" maxLength={400} required defaultValue={edit.description} /></div>
        <div className="field"><label htmlFor="sort_order">Order</label><input type="text" id="sort_order" name="sort_order" inputMode="numeric" defaultValue={edit.sort_order} /></div>
        <div className="field check"><input type="checkbox" id="is_published" name="is_published" value="1" defaultChecked={edit.is_published} /><label htmlFor="is_published">Published</label></div>
        <button className="btn btn-primary" type="submit">Save service</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Order</th><th>Title</th><th>Published</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.sort_order}</td><td>{r.title}</td><td>{r.is_published ? 'Yes' : 'Hidden'}</td>
                <td><div className="row-actions">
                  <Link className="btn btn-ghost btn-sm" href={`/admin/services?edit=${r.id}`}>Edit</Link>
                  <form action={deleteService}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Delete this service?" className="btn btn-danger btn-sm">Delete</ConfirmButton></form>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
