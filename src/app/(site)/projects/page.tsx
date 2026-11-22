import type { Metadata } from 'next';
import Link from 'next/link';
import ProjectCard from '@/components/ProjectCard';
import { getProjectCategories, getProjects } from '@/lib/data';

export const metadata: Metadata = { title: 'Projects | John Nsoh', description: 'Websites, business management systems and software built by John Nsoh.' };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = typeof category === 'string' ? category.slice(0, 120) : '';
  const [categories, projects] = await Promise.all([getProjectCategories(), getProjects(active)]);
  return (
    <section>
      <div className="container">
        <div className="section-head"><p className="eyebrow">Portfolio</p><h1>Projects</h1></div>
        <nav className="filters" aria-label="Project categories">
          <Link href="/projects" className={active === '' ? 'active' : ''}>All</Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/projects?category=${c.slug}`} className={active === c.slug ? 'active' : ''}>{c.name}</Link>
          ))}
        </nav>
        {projects.length === 0 ? (
          <p className="muted">No projects found in this category.</p>
        ) : (
          <div className="grid grid-3">{projects.map((p) => <ProjectCard key={p.id} project={p} />)}</div>
        )}
      </div>
    </section>
  );
}
