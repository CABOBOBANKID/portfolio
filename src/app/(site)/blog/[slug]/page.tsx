import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Paragraphs from '@/components/Paragraphs';
import { sql } from '@/lib/db';
import { formatDate, isBlobUrl } from '@/lib/util';

async function load(slug: string) {
  const rows = await sql`
    SELECT b.*, c.name AS category_name FROM blog_posts b LEFT JOIN blog_categories c ON c.id = b.category_id
    WHERE b.slug = ${slug.slice(0, 220)} AND b.is_published AND b.published_at <= now() LIMIT 1`;
  return rows[0] ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await load((await params).slug);
  return post ? { title: `${post.title} | John Nsoh`, description: post.seo_description || post.excerpt } : { title: 'Article not found | John Nsoh' };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await load((await params).slug);
  if (!post) notFound();
  return (
    <section>
      <div className="container prose">
        <p><Link href="/blog">All articles</Link></p>
        {post.category_name && <span className="badge">{post.category_name}</span>}
        <h1>{post.title}</h1>
        <p className="muted">{formatDate(post.published_at)}</p>
        {isBlobUrl(post.cover_image) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="cover" src={post.cover_image} alt="" />
        )}
        <Paragraphs text={post.content} />
      </div>
    </section>
  );
}
