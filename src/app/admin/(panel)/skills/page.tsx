import Link from 'next/link';
import ConfirmButton from '@/components/admin/ConfirmButton';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import { sql } from '@/lib/db';
import { deleteSkill, saveSkill } from '../../actions';

export default async function Skills({ searchParams }: { searchParams: Promise<FlashParams & { edit?: string }> }) {
  const sp = await searchParams;
  const rows = await sql`SELECT * FROM skills ORDER BY category, sort_order, id`;
  const editId = /^\d{1,9}$/.test(sp.edit ?? '') ? Number(sp.edit) : 0;
  const edit = rows.find((r) => r.id === editId) ?? { id: 0, category: '', name: '', sort_order: 0 };
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Skills</h1></div>
      <form action={saveSkill} className="card">
        <h2>{edit.id ? 'Edit skill' : 'Add skill'}</h2>
        <input type="hidden" name="id" value={edit.id || ''} />
        <div className="form-grid">
          <div className="field"><label htmlFor="category">Category</label><input type="text" id="category" name="category" maxLength={80} required defaultValue={edit.category} /></div>
          <div className="field"><label htmlFor="name">Skill</label><input type="text" id="name" name="name" maxLength={80} required defaultValue={edit.name} /></div>
          <div className="field"><label htmlFor="sort_order">Order</label><input type="text" id="sort_order" name="sort_order" inputMode="numeric" defaultValue={edit.sort_order} /></div>
        </div>
        <button className="btn btn-primary" type="submit">Save skill</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Category</th><th>Skill</th><th>Order</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.category}</td><td>{r.name}</td><td>{r.sort_order}</td>
                <td><div className="row-actions">
                  <Link className="btn btn-ghost btn-sm" href={`/admin/skills?edit=${r.id}`}>Edit</Link>
                  <form action={deleteSkill}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Delete this skill?" className="btn btn-danger btn-sm">Delete</ConfirmButton></form>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
