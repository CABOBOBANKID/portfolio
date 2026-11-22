import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import { isBlobUrl, monthYear, safeUrl, splitCsv, splitLines } from '@/lib/util';

async function load(slug: string) {
  const rows = await sql`
    SELECT p.*, c.name AS category_name FROM projects p JOIN project_categories c ON c.id = p.category_id
    WHERE p.slug = ${slug.slice(0, 180)} AND p.is_published LIMIT 1`;
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const project = await load((await params).slug);
  return project ? { title: `${project.title} | John Nsoh`, description: project.summary } : { title: 'Project not found | John Nsoh' };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const project = await load((await params).slug);
  if (!project) notFound();
  const images = await sql`SELECT file_name, caption FROM project_images WHERE project_id = ${project.id} ORDER BY sort_order, id`;
  const features = splitLines(project.features);
  const techs = splitCsv(project.technologies);
  const live = safeUrl(project.live_url);
  const github = safeUrl(project.github_url);

  return (
    <section>
      <div className="container">
        <p><Link href="/projects">All projects</Link></p>
        <span className="badge">{project.category_name}</span>
        <h1>{project.title}</h1>
        <p className="muted">{project.summary}</p>
        <div className="detail-grid">
          <div>
            {isBlobUrl(project.featured_image) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="gallery-main" src={project.featured_image} alt={`${project.title} main screenshot`} />
            )}
            <h2>Overview</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{project.description}</p>
            {features.length > 0 && (
              <>
                <h2>Main features</h2>
                <ul className="feature-list">{features.map((f) => <li key={f}>{f}</li>)}</ul>
              </>
            )}
            {images.length > 0 && (
              <>
                <h2>Screenshots</h2>
                <div className="gallery">
                  {images.filter((i) => isBlobUrl(i.file_name)).map((img) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={img.file_name} src={img.file_name} alt={img.caption || `${project.title} screenshot`} loading="lazy" />
                  ))}
                </div>
              </>
            )}
          </div>
          <aside className="card">
            <h3>Project details</h3>
            <p><strong>Status:</strong> {String(project.status).charAt(0).toUpperCase() + String(project.status).slice(1)}</p>
            {project.completed_on && <p><strong>Completed:</strong> {monthYear(project.completed_on)}</p>}
            {techs.length > 0 && <div className="tags">{techs.map((t) => <span className="badge" key={t}>{t}</span>)}</div>}
            <div className="hero-actions">
              {live && <a className="btn btn-primary" href={live} target="_blank" rel="noopener noreferrer">Live demo</a>}
              {github && <a className="btn btn-ghost" href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
              <Link className="btn btn-ghost" href={`/contact?service=${encodeURIComponent(project.title)}`}>Request similar</Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
