import type { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '');
  if (!base) return [];
  const pages = ['', '/about', '/services', '/projects', '/skills', '/blog', '/testimonials', '/contact'].map((p) => ({ url: `${base}${p}` }));
  try {
    const projects = await sql`SELECT slug, updated_at FROM projects WHERE is_published`;
    const posts = await sql`SELECT slug, updated_at FROM blog_posts WHERE is_published AND published_at <= now()`;
    return [
      ...pages,
      ...projects.map((r) => ({ url: `${base}/project/${r.slug}`, lastModified: new Date(r.updated_at) })),
      ...posts.map((r) => ({ url: `${base}/blog/${r.slug}`, lastModified: new Date(r.updated_at) })),
    ];
  } catch {
    return pages;
  }
}
