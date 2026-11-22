import Link from 'next/link';
import ConfirmButton from '@/components/admin/ConfirmButton';
import ImageUploader from '@/components/admin/ImageUploader';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import { sql } from '@/lib/db';
import { deleteTestimonial, saveTestimonial, toggleTestimonial } from '../../actions';

export default async function Testimonials({ searchParams }: { searchParams: Promise<FlashParams & { edit?: string }> }) {
  const sp = await searchParams;
  const rows = await sql`SELECT * FROM testimonials ORDER BY created_at DESC`;
  const projects = await sql`SELECT id, title FROM projects ORDER BY title`;
  const editId = /^\d{1,9}$/.test(sp.edit ?? '') ? Number(sp.edit) : 0;
  const edit = rows.find((r) => r.id === editId) ?? { id: 0, client_name: '', business_name: '', quote: '', project_id: null, photo: null, is_published: false };
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Testimonials</h1></div>
      <form action={saveTestimonial} className="card" key={edit.id}>
        <h2>{edit.id ? 'Edit testimonial' : 'Add testimonial'}</h2>
        <input type="hidden" name="id" value={edit.id || ''} />
        <div className="form-grid">
          <div className="field"><label htmlFor="client_name">Client name</label><input type="text" id="client_name" name="client_name" maxLength={120} required defaultValue={edit.client_name} /></div>
          <div className="field"><label htmlFor="business_name">Business name</label><input type="text" id="business_name" name="business_name" maxLength={150} defaultValue={edit.business_name ?? ''} /></div>
          <div className="field"><label htmlFor="project_id">Related project</label>
            <select id="project_id" name="project_id" defaultValue={edit.project_id ?? ''}>
              <option value="">None</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select></div>
        </div>
        <div className="field"><label>Photo or logo</label><ImageUploader name="photo" kind="testimonials" initial={edit.photo ? [edit.photo] : []} /></div>
        <div className="field"><label htmlFor="quote">Testimonial</label><textarea id="quote" name="quote" maxLength={2000} required defaultValue={edit.quote} /></div>
        <div className="field check"><input type="checkbox" id="is_published" name="is_published" value="1" defaultChecked={edit.is_published} /><label htmlFor="is_published">Published</label></div>
        <button className="btn btn-primary" type="submit">Save testimonial</button>
      </form>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Client</th><th>Business</th><th>Published</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.client_name}</td><td>{r.business_name}</td><td>{r.is_published ? 'Yes' : 'Hidden'}</td>
                <td><div className="row-actions">
                  <Link className="btn btn-ghost btn-sm" href={`/admin/testimonials?edit=${r.id}`}>Edit</Link>
                  <form action={toggleTestimonial}><input type="hidden" name="id" value={r.id} />
                    <button className="btn btn-ghost btn-sm" type="submit">{r.is_published ? 'Hide' : 'Publish'}</button></form>
                  <form action={deleteTestimonial}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Delete this testimonial?" className="btn btn-danger btn-sm">Delete</ConfirmButton></form>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
