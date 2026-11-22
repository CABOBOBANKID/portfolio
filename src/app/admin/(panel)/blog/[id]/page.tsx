import { notFound } from 'next/navigation';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import PostForm from '@/components/admin/PostForm';
import { sql } from '@/lib/db';

export default async function EditPost({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<FlashParams> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^\d{1,9}$/.test(id)) notFound();
  const post = (await sql`SELECT * FROM blog_posts WHERE id = ${Number(id)}`)[0];
  if (!post) notFound();
  const categories = (await sql`SELECT id, name FROM blog_categories ORDER BY name`) as { id: number; name: string }[];
  return (<><div className="admin-top"><h1>Edit article</h1></div><Flash sp={sp} /><PostForm post={post} categories={categories} /></>);
}
