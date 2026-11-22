import type { Metadata } from 'next';
import Link from 'next/link';
import { sql } from '@/lib/db';
import { formatDate, isBlobUrl } from '@/lib/util';

export const metadata: Metadata = { title: 'Blog | John Nsoh', description: 'Articles on web development, business software and databases.' };

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const active = typeof category === 'string' ? category.slice(0, 120) : '';
  const categories = await sql`SELECT name, slug FROM blog_categories ORDER BY name`;
  const posts = active
    ? await sql`
        SELECT b.title, b.slug, b.excerpt, b.cover_image, b.published_at, c.name AS category_name
        FROM blog_posts b LEFT JOIN blog_categories c ON c.id = b.category_id
        WHERE b.is_published AND b.published_at <= now() AND c.slug = ${active} ORDER BY b.published_at DESC LIMIT 60`
    : await sql`
        SELECT b.title, b.slug, b.excerpt, b.cover_image, b.published_at, c.name AS category_name
        FROM blog_posts b LEFT JOIN blog_categories c ON c.id = b.category_id
        WHERE b.is_published AND b.published_at <= now() ORDER BY b.published_at DESC LIMIT 60`;
  return (
    <section>
      <div className="container">
        <div className="section-head"><p className="eyebrow">Blog</p><h1>Articles and tutorials</h1></div>
        <nav className="filters" aria-label="Blog categories">
          <Link href="/blog" className={active === '' ? 'active' : ''}>All</Link>
          {categories.map((c) => <Link key={c.slug} href={`/blog?category=${c.slug}`} className={active === c.slug ? 'active' : ''}>{c.name}</Link>)}
        </nav>
        {posts.length === 0 ? (
          <p className="muted">No articles published yet.</p>
        ) : (
          <div className="grid grid-3">
            {posts.map((post) => (
              <article className="card project-card" key={post.slug}>
                {isBlobUrl(post.cover_image) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <div className="project-thumb"><img src={post.cover_image} alt="" loading="lazy" /></div>
                )}
                <div className="project-body">
                  {post.category_name && <span className="badge">{post.category_name}</span>}
                  <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                  <p className="muted">{post.excerpt}</p>
                  <p className="muted">{formatDate(post.published_at)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
