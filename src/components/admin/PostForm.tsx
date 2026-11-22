import Link from 'next/link';
import ImageUploader from './ImageUploader';
import { savePost } from '@/app/admin/actions';

export default function PostForm({ post, categories }: { post: Record<string, any> | null; categories: { id: number; name: string }[] }) {
  const p = post ?? { is_published: false };
  return (
    <form action={savePost} className="card">
      {post && <input type="hidden" name="id" value={post.id} />}
      <div className="form-grid">
        <div className="field"><label htmlFor="title">Title</label><input type="text" id="title" name="title" maxLength={200} required defaultValue={p.title ?? ''} /></div>
        <div className="field"><label htmlFor="category_id">Category</label>
          <select id="category_id" name="category_id" defaultValue={p.category_id ?? ''}>
            <option value="">None</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
      </div>
      <div className="field"><label htmlFor="excerpt">Excerpt</label><input type="text" id="excerpt" name="excerpt" maxLength={300} required defaultValue={p.excerpt ?? ''} /></div>
      <div className="field"><label htmlFor="seo_description">SEO description</label><input type="text" id="seo_description" name="seo_description" maxLength={300} defaultValue={p.seo_description ?? ''} /></div>
      <div className="field"><label htmlFor="content">Content (separate paragraphs with a blank line)</label>
        <textarea id="content" name="content" className="tall" required defaultValue={p.content ?? ''} /></div>
      <div className="field"><label>Cover image</label><ImageUploader name="cover_image" kind="blog" initial={p.cover_image ? [p.cover_image] : []} /></div>
      <div className="field check"><input type="checkbox" id="is_published" name="is_published" value="1" defaultChecked={p.is_published} /><label htmlFor="is_published">Published</label></div>
      <div className="row-actions">
        <button className="btn btn-primary" type="submit">Save article</button>
        <Link className="btn btn-ghost" href="/admin/blog">Back</Link>
      </div>
    </form>
  );
}
