import { sql } from './db';

export const SITE_NAME = 'John Nsoh';
export const SITE_TITLE = 'John Nsoh | Web & Software Developer';
export const SITE_DESCRIPTION =
  'John Nsoh is a web and software developer specialising in modern websites, business management systems, custom applications and digital solutions.';

export async function getSettings(): Promise<Record<string, string>> {
  try {
    const rows = await sql`SELECT setting_key, setting_value FROM site_settings`;
    return Object.fromEntries(rows.map((r) => [r.setting_key as string, r.setting_value as string]));
  } catch (error) {
    console.error('Could not load settings', error);
    return {};
  }
}

export async function saveSetting(key: string, value: string): Promise<void> {
  await sql`
    INSERT INTO site_settings (setting_key, setting_value) VALUES (${key}, ${value})
    ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value
  `;
}

export async function getContactLinks() {
  const s = await getSettings();
  return {
    whatsapp: (s.whatsapp ?? '').replace(/\D/g, ''),
    phone: s.phone ?? '',
    email: s.email ?? '',
    linkedin: s.linkedin ?? '',
    github: s.github ?? '',
    siteTitle: s.site_title || SITE_TITLE,
    siteDescription: s.site_description || SITE_DESCRIPTION,
  };
}

export type Profile = {
  full_name: string; headline: string; tagline: string; bio: string;
  background: string | null; philosophy: string | null; career_goals: string | null; photo: string | null;
};

export async function getProfile(): Promise<Profile> {
  try {
    const rows = await sql`SELECT * FROM profiles WHERE id = 1`;
    if (rows[0]) return rows[0] as Profile;
  } catch (error) {
    console.error('Could not load profile', error);
  }
  return { full_name: SITE_NAME, headline: '', tagline: '', bio: '', background: null, philosophy: null, career_goals: null, photo: null };
}

export type ProjectCardData = {
  id: number; title: string; slug: string; summary: string; technologies: string | null;
  featured_image: string | null; category_name: string;
};

export const getFeaturedProjects = async (): Promise<ProjectCardData[]> =>
  (await sql`
    SELECT p.id, p.title, p.slug, p.summary, p.technologies, p.featured_image, c.name AS category_name
    FROM projects p JOIN project_categories c ON c.id = p.category_id
    WHERE p.is_published ORDER BY p.is_featured DESC, p.created_at DESC LIMIT 6
  `) as ProjectCardData[];

export async function getProjects(categorySlug: string): Promise<ProjectCardData[]> {
  const rows = categorySlug
    ? await sql`
        SELECT p.id, p.title, p.slug, p.summary, p.technologies, p.featured_image, c.name AS category_name
        FROM projects p JOIN project_categories c ON c.id = p.category_id
        WHERE p.is_published AND c.slug = ${categorySlug} ORDER BY p.created_at DESC`
    : await sql`
        SELECT p.id, p.title, p.slug, p.summary, p.technologies, p.featured_image, c.name AS category_name
        FROM projects p JOIN project_categories c ON c.id = p.category_id
        WHERE p.is_published ORDER BY p.created_at DESC`;
  return rows as ProjectCardData[];
}

export const getProjectCategories = async () =>
  (await sql`SELECT id, name, slug FROM project_categories ORDER BY sort_order`) as { id: number; name: string; slug: string }[];

export const getServices = async () =>
  (await sql`SELECT title, description FROM services WHERE is_published ORDER BY sort_order, id`) as { title: string; description: string }[];

export async function getSkillGroups(): Promise<Record<string, string[]>> {
  const rows = await sql`SELECT category, name FROM skills ORDER BY category, sort_order, id`;
  const groups: Record<string, string[]> = {};
  for (const row of rows) (groups[row.category] ??= []).push(row.name);
  return groups;
}

export const getTestimonials = async (limit = 100) =>
  (await sql`
    SELECT client_name, business_name, quote, photo FROM testimonials
    WHERE is_published ORDER BY created_at DESC LIMIT ${limit}
  `) as { client_name: string; business_name: string | null; quote: string; photo: string | null }[];

export const getLatestPosts = async (limit = 3) =>
  (await sql`
    SELECT title, slug, excerpt, published_at FROM blog_posts
    WHERE is_published AND published_at <= now() ORDER BY published_at DESC LIMIT ${limit}
  `) as { title: string; slug: string; excerpt: string; published_at: string }[];

export async function countPublishedProjects(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS c FROM projects WHERE is_published`;
  return rows[0]?.c ?? 0;
}
