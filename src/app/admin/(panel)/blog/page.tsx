import Link from 'next/link';
import ConfirmButton from '@/components/admin/ConfirmButton';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import { sql } from '@/lib/db';
import { formatDate } from '@/lib/util';
import { deletePost, togglePost } from '../../actions';

export default async function BlogAdmin({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const sp = await searchParams;
  const rows = await sql`
    SELECT b.id, b.title, b.is_published, b.published_at, c.name AS category_name
    FROM blog_posts b LEFT JOIN blog_categories c ON c.id = b.category_id ORDER BY b.created_at DESC`;
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Blog</h1><Link className="btn btn-primary" href="/admin/blog/new">New article</Link></div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Published</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td><td>{r.category_name}</td><td>{r.is_published ? 'Published' : 'Draft'}</td><td>{formatDate(r.published_at)}</td>
                <td><div className="row-actions">
                  <Link className="btn btn-ghost btn-sm" href={`/admin/blog/${r.id}`}>Edit</Link>
                  <form action={togglePost}><input type="hidden" name="id" value={r.id} />
                    <button className="btn btn-ghost btn-sm" type="submit">{r.is_published ? 'Unpublish' : 'Publish'}</button></form>
                  <form action={deletePost}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Delete this article permanently?" className="btn btn-danger btn-sm">Delete</ConfirmButton></form>
                </div></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="muted">No articles yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
