import Link from 'next/link';
import type { ProjectCardData } from '@/lib/data';
import { isBlobUrl, splitCsv } from '@/lib/util';

export default function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <article className="card project-card">
      <div className="project-thumb">
        {isBlobUrl(project.featured_image) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.featured_image} alt={`${project.title} screenshot`} loading="lazy" />
        ) : (
          <span>{project.title}</span>
        )}
      </div>
      <div className="project-body">
        <span className="badge">{project.category_name}</span>
        <h3><Link href={`/project/${project.slug}`}>{project.title}</Link></h3>
        <p className="muted">{project.summary}</p>
        {project.technologies && (
          <div className="tags">
            {splitCsv(project.technologies).slice(0, 4).map((tech) => <span className="badge" key={tech}>{tech}</span>)}
          </div>
        )}
      </div>
    </article>
  );
}
