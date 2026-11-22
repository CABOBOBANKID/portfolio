import Flash, { type FlashParams } from '@/components/admin/Flash';
import PostForm from '@/components/admin/PostForm';
import { sql } from '@/lib/db';

export default async function NewPost({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const sp = await searchParams;
  const categories = (await sql`SELECT id, name FROM blog_categories ORDER BY name`) as { id: number; name: string }[];
  return (<><div className="admin-top"><h1>New article</h1></div><Flash sp={sp} /><PostForm post={null} categories={categories} /></>);
}
