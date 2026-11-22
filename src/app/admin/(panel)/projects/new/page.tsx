import Flash, { type FlashParams } from '@/components/admin/Flash';
import ProjectForm from '@/components/admin/ProjectForm';
import { sql } from '@/lib/db';

export default async function NewProject({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const sp = await searchParams;
  const categories = (await sql`SELECT id, name FROM project_categories ORDER BY sort_order`) as { id: number; name: string }[];
  return (
    <>
      <div className="admin-top"><h1>Add project</h1></div>
      <Flash sp={sp} />
      <ProjectForm project={null} categories={categories} images={[]} />
    </>
  );
}
