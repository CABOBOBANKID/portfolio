import Link from 'next/link';
import ConfirmButton from '@/components/admin/ConfirmButton';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import { sql } from '@/lib/db';
import { deleteProject, toggleProject } from '../../actions';

export default async function Projects({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const sp = await searchParams;
  const rows = await sql`
    SELECT p.id, p.title, p.status, p.is_published, c.name AS category_name
    FROM projects p JOIN project_categories c ON c.id = p.category_id ORDER BY p.created_at DESC`;
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Projects</h1><Link className="btn btn-primary" href="/admin/projects/new">Add project</Link></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Published</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td><td>{p.category_name}</td><td>{p.status}</td><td>{p.is_published ? 'Yes' : 'Draft'}</td>
                <td>
                  <div className="row-actions">
                    <Link className="btn btn-ghost btn-sm" href={`/admin/projects/${p.id}`}>Edit</Link>
                    <form action={toggleProject}><input type="hidden" name="id" value={p.id} />
                      <button className="btn btn-ghost btn-sm" type="submit">{p.is_published ? 'Unpublish' : 'Publish'}</button></form>
                    <form action={deleteProject}><input type="hidden" name="id" value={p.id} />
                      <ConfirmButton message="Delete this project permanently?" className="btn btn-danger btn-sm">Delete</ConfirmButton></form>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="muted">No projects yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
