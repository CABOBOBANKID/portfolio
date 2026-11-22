import Link from 'next/link';
import ImageUploader from './ImageUploader';
import { saveProject } from '@/app/admin/actions';
import { PROJECT_STATUSES } from '@/lib/util';

type Props = {
  project: Record<string, any> | null;
  categories: { id: number; name: string }[];
  images: string[];
};

export default function ProjectForm({ project, categories, images }: Props) {
  const p = project ?? { status: 'completed', is_featured: false, is_published: false };
  const date = p.completed_on ? new Date(p.completed_on).toISOString().slice(0, 10) : '';
  return (
    <form action={saveProject} className="card">
      {project && <input type="hidden" name="id" value={project.id} />}
      <div className="form-grid">
        <div className="field"><label htmlFor="title">Title</label>
          <input type="text" id="title" name="title" maxLength={160} required defaultValue={p.title ?? ''} /></div>
        <div className="field"><label htmlFor="category_id">Category</label>
          <select id="category_id" name="category_id" required defaultValue={p.category_id ?? categories[0]?.id}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></div>
        <div className="field"><label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={p.status}>
            {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select></div>
        <div className="field"><label htmlFor="completed_on">Completion date</label>
          <input type="date" id="completed_on" name="completed_on" defaultValue={date} /></div>
        <div className="field"><label htmlFor="live_url">Live URL</label>
          <input type="url" id="live_url" name="live_url" maxLength={300} defaultValue={p.live_url ?? ''} /></div>
        <div className="field"><label htmlFor="github_url">GitHub URL</label>
          <input type="url" id="github_url" name="github_url" maxLength={300} defaultValue={p.github_url ?? ''} /></div>
      </div>
      <div className="field"><label htmlFor="summary">Summary</label>
        <input type="text" id="summary" name="summary" maxLength={300} required defaultValue={p.summary ?? ''} /></div>
      <div className="field"><label htmlFor="description">Description</label>
        <textarea id="description" name="description" maxLength={10000} required defaultValue={p.description ?? ''} /></div>
      <div className="field"><label htmlFor="features">Main features (one per line)</label>
        <textarea id="features" name="features" maxLength={4000} defaultValue={p.features ?? ''} /></div>
      <div className="field"><label htmlFor="technologies">Technologies (comma separated)</label>
        <input type="text" id="technologies" name="technologies" maxLength={400} defaultValue={p.technologies ?? ''} /></div>
      <div className="field"><label>Featured image</label>
        <ImageUploader name="featured_image" kind="projects" initial={p.featured_image ? [p.featured_image] : []} /></div>
      <div className="field"><label>Screenshots (up to 20)</label>
        <ImageUploader name="screenshots" kind="projects" multiple max={20} initial={images} /></div>
      <div className="field check"><input type="checkbox" id="is_featured" name="is_featured" value="1" defaultChecked={p.is_featured} />
        <label htmlFor="is_featured">Show on homepage</label></div>
      <div className="field check"><input type="checkbox" id="is_published" name="is_published" value="1" defaultChecked={p.is_published} />
        <label htmlFor="is_published">Published</label></div>
      <div className="row-actions">
        <button className="btn btn-primary" type="submit">Save project</button>
        <Link className="btn btn-ghost" href="/admin/projects">Back</Link>
      </div>
    </form>
  );
}
