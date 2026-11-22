import Link from 'next/link';
import Paragraphs from '@/components/Paragraphs';
import ProjectCard from '@/components/ProjectCard';
import TestimonialCard from '@/components/TestimonialCard';
import {
  countPublishedProjects, getContactLinks, getFeaturedProjects, getLatestPosts, getProfile,
  getServices, getSkillGroups, getTestimonials,
} from '@/lib/data';
import { formatDate, isBlobUrl } from '@/lib/util';

const steps: [string, string][] = [
  ['Requirement gathering', 'Understanding the business problem, users and goals.'],
  ['Planning and architecture', 'Defining modules, data structures and security.'],
  ['UI/UX design', 'Designing clear, responsive interfaces.'],
  ['Development and testing', 'Building, reviewing and testing every feature.'],
  ['Deployment and maintenance', 'Launching securely and supporting after go-live.'],
];

export default async function HomePage() {
  const [me, featured, services, skills, projectCount, testimonials, posts, links] = await Promise.all([
    getProfile(), getFeaturedProjects(), getServices(), getSkillGroups(), countPublishedProjects(),
    getTestimonials(3), getLatestPosts(3), getContactLinks(),
  ]);
  const initials = me.full_name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase() ?? '').join('').slice(0, 2);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Available for new projects</p>
            <h1 className="hero-title">{me.full_name}</h1>
            <p className="hero-role">{me.headline}</p>
            <p className="hero-tag">{me.tagline}</p>
            <div className="hero-actions">
              <Link className="btn btn-primary" href="/projects">Explore My Work</Link>
              <Link className="btn btn-ghost" href="/contact">Hire Me</Link>
              <a className="btn btn-ghost" href="/download-cv">Download CV</a>
            </div>
          </div>
          <div className="hero-card">
            {isBlobUrl(me.photo) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="avatar-img" src={me.photo} alt={me.full_name} />
            ) : (
              <div className="avatar" role="img" aria-label="Profile photo placeholder">{initials}</div>
            )}
            <div className="stat-row">
              <div><strong>{projectCount}</strong><span className="muted">Projects</span></div>
              <div><strong>{services.length}</strong><span className="muted">Services</span></div>
              <div><strong>24h</strong><span className="muted">Response</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="about">
        <div className="container grid grid-2">
          <div>
            <p className="eyebrow">About</p>
            <h2>Software built around how your business works</h2>
            <Link href="/about">Read more</Link>
          </div>
          <div className="muted"><Paragraphs text={me.bio} /></div>
        </div>
      </section>

      <section id="services">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Services</p><h2>What I build</h2></div>
          <div className="grid grid-3">
            {services.map((s) => (
              <article className="card" key={s.title}>
                <h3>{s.title}</h3>
                <p className="muted">{s.description}</p>
                <Link href={`/contact?service=${encodeURIComponent(s.title)}`}>Enquire</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Portfolio</p><h2>Featured projects</h2></div>
          <div className="grid grid-3">
            {featured.map((p) => <ProjectCard key={p.id} project={p} />)}
          </div>
          <p><Link className="btn btn-ghost" href="/projects">View all projects</Link></p>
        </div>
      </section>

      <section id="skills">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Technology</p><h2>Skills and tools</h2></div>
          <div className="skill-groups">
            {Object.entries(skills).map(([category, names]) => (
              <div className="card" key={category}>
                <h3>{category}</h3>
                <div className="skill-list">{names.map((n) => <span className="badge" key={n}>{n}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="process">
        <div className="container">
          <div className="section-head"><p className="eyebrow">Process</p><h2>How projects are delivered</h2></div>
          <ol className="steps">
            {steps.map(([title, text]) => <li key={title}><h3>{title}</h3><p className="muted">{text}</p></li>)}
          </ol>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section id="testimonials">
          <div className="container">
            <div className="section-head"><p className="eyebrow">Testimonials</p><h2>What clients say</h2></div>
            <div className="grid grid-3">{testimonials.map((t, i) => <TestimonialCard key={i} t={t} />)}</div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section id="blog">
          <div className="container">
            <div className="section-head"><p className="eyebrow">Blog</p><h2>Latest articles</h2></div>
            <div className="grid grid-3">
              {posts.map((post) => (
                <article className="card" key={post.slug}>
                  <p className="muted">{formatDate(post.published_at)}</p>
                  <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                  <p className="muted">{post.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="container card">
          <h2>Have a project in mind?</h2>
          <p className="muted">Tell me what you need and I will respond with a clear plan.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/contact">Start an enquiry</Link>
            {links.whatsapp && <a className="btn btn-ghost" href={`https://wa.me/${links.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </div>
        </div>
      </section>
    </>
  );
}
