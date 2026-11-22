import { notFound } from 'next/navigation';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import ProjectForm from '@/components/admin/ProjectForm';
import { sql } from '@/lib/db';

export default async function EditProject({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<FlashParams> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^\d{1,9}$/.test(id)) notFound();
  const project = (await sql`SELECT * FROM projects WHERE id = ${Number(id)}`)[0];
  if (!project) notFound();
  const categories = (await sql`SELECT id, name FROM project_categories ORDER BY sort_order`) as { id: number; name: string }[];
  const images = (await sql`SELECT file_name FROM project_images WHERE project_id = ${project.id} ORDER BY sort_order, id`).map((r) => r.file_name as string);
  return (
    <>
      <div className="admin-top"><h1>Edit project</h1></div>
      <Flash sp={sp} />
      <ProjectForm project={project} categories={categories} images={images} />
    </>
  );
}
