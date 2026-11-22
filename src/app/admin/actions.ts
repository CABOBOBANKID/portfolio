'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { back } from '@/lib/admin';
import { createSession, destroySession, requireAdmin } from '@/lib/auth';
import { saveSetting } from '@/lib/data';
import { sql } from '@/lib/db';
import { rateClear, rateHit, rateLimited } from '@/lib/security';
import { removeBlob, storePdf, UploadError } from '@/lib/uploads';
import {
  ENQUIRY_STATUSES, PROJECT_STATUSES, int, isBlobUrl, safeUrl, slugify, str,
} from '@/lib/util';

// Keeps login timing the same when the username does not exist.
const DUMMY_HASH = '$2b$12$K4j2XamKGj6fAX8iAcVvPOmoQb8mXuudi.V86iPQViFjyGG9iHVsW';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ---------- authentication ---------- */

export async function login(form: FormData) {
  const username = str(form, 'username', 60);
  const password = typeof form.get('password') === 'string' ? (form.get('password') as string).slice(0, 200) : '';
  if (await rateLimited('admin_login', 5, 900)) {
    redirect('/admin/login?error=' + encodeURIComponent('Too many attempts. Try again in 15 minutes.'));
  }
  const rows = await sql`SELECT id, password_hash FROM admins WHERE username = ${username} LIMIT 1`;
  const hash = (rows[0]?.password_hash as string | undefined) ?? DUMMY_HASH;
  const ok = await bcrypt.compare(password, hash);
  if (!rows[0] || !ok) {
    await rateHit('admin_login');
    redirect('/admin/login?error=' + encodeURIComponent('Invalid username or password.'));
  }
  await rateClear('admin_login');
  await createSession(rows[0].id as number);
  redirect('/admin/dashboard');
}

export async function logout() {
  await destroySession();
  redirect('/admin/login');
}

/* ---------- enquiries ---------- */

export async function setEnquiryStatus(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const status = str(form, 'status', 20);
  if (!id || !(ENQUIRY_STATUSES as readonly string[]).includes(status)) back('/admin/enquiries', 'Invalid request.', 'error');
  await sql`UPDATE enquiries SET status = ${status} WHERE id = ${id}`;
  back(`/admin/enquiries?id=${id}`, 'Status updated.');
}

export async function deleteEnquiry(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) await sql`DELETE FROM enquiries WHERE id = ${id}`;
  back('/admin/enquiries', 'Enquiry deleted.');
}

/* ---------- projects ---------- */

async function uniqueSlug(table: 'projects' | 'blog_posts', title: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  for (let i = 2; i < 200; i++) {
    const rows = table === 'projects'
      ? await sql`SELECT 1 FROM projects WHERE slug = ${slug} LIMIT 1`
      : await sql`SELECT 1 FROM blog_posts WHERE slug = ${slug} LIMIT 1`;
    if (rows.length === 0) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

function blobOrNull(form: FormData, key: string): string | null {
  const value = str(form, key, 600);
  return isBlobUrl(value) ? value : null;
}

function blobList(form: FormData, key: string, max: number): string[] {
  try {
    const parsed = JSON.parse(str(form, key, 20000) || '[]');
    return Array.isArray(parsed) ? [...new Set(parsed.filter((u): u is string => typeof u === 'string' && isBlobUrl(u)))].slice(0, max) : [];
  } catch {
    return [];
  }
}

export async function saveProject(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const here = id ? `/admin/projects/${id}` : '/admin/projects/new';

  const categoryId = int(form, 'category_id');
  const title = str(form, 'title', 160);
  const summary = str(form, 'summary', 300);
  const description = str(form, 'description', 10000);
  const features = str(form, 'features', 4000);
  const technologies = str(form, 'technologies', 400);
  const status = str(form, 'status', 20);
  const completedRaw = str(form, 'completed_on', 10);
  const live = str(form, 'live_url', 300);
  const github = str(form, 'github_url', 300);
  const featured = form.get('is_featured') === '1';
  const published = form.get('is_published') === '1';

  const errors: string[] = [];
  if (!title) errors.push('Title is required.');
  if (!summary) errors.push('Summary is required.');
  if (!description) errors.push('Description is required.');
  if (!categoryId) errors.push('Choose a category.');
  if (!(PROJECT_STATUSES as readonly string[]).includes(status)) errors.push('Choose a status.');
  if (completedRaw && !/^\d{4}-\d{2}-\d{2}$/.test(completedRaw)) errors.push('Completion date is invalid.');
  if (live && !safeUrl(live)) errors.push('Live URL must be a full http or https link.');
  if (github && !safeUrl(github)) errors.push('GitHub URL must be a full http or https link.');
  if (errors.length) back(here, errors[0], 'error');

  const featuredImage = blobOrNull(form, 'featured_image');
  const shots = blobList(form, 'screenshots', 20);
  const completed = completedRaw || null;

  let projectId = id;
  if (id) {
    const old = await sql`SELECT featured_image FROM projects WHERE id = ${id}`;
    if (!old[0]) back('/admin/projects', 'Project not found.', 'error');
    await sql`
      UPDATE projects SET category_id = ${categoryId}, title = ${title}, summary = ${summary}, description = ${description},
        features = ${features || null}, technologies = ${technologies || null}, status = ${status}, completed_on = ${completed},
        live_url = ${live || null}, github_url = ${github || null}, featured_image = ${featuredImage},
        is_featured = ${featured}, is_published = ${published}, updated_at = now()
      WHERE id = ${id}`;
    if (old[0].featured_image && old[0].featured_image !== featuredImage) await removeBlob(old[0].featured_image);
  } else {
    const slug = await uniqueSlug('projects', title);
    const rows = await sql`
      INSERT INTO projects (category_id, title, slug, summary, description, features, technologies, status, completed_on, live_url, github_url, featured_image, is_featured, is_published)
      VALUES (${categoryId}, ${title}, ${slug}, ${summary}, ${description}, ${features || null}, ${technologies || null}, ${status}, ${completed},
              ${live || null}, ${github || null}, ${featuredImage}, ${featured}, ${published})
      RETURNING id`;
    projectId = rows[0].id as number;
  }

  const existing = await sql`SELECT id, file_name FROM project_images WHERE project_id = ${projectId}`;
  for (const row of existing) {
    if (!shots.includes(row.file_name)) {
      await sql`DELETE FROM project_images WHERE id = ${row.id}`;
      await removeBlob(row.file_name);
    }
  }
  const have = new Set(existing.map((r) => r.file_name as string));
  let order = 0;
  for (const url of shots) {
    if (!have.has(url)) await sql`INSERT INTO project_images (project_id, file_name, sort_order) VALUES (${projectId}, ${url}, ${order})`;
    order++;
  }
  back(`/admin/projects/${projectId}`, 'Project saved.');
}

export async function toggleProject(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) await sql`UPDATE projects SET is_published = NOT is_published WHERE id = ${id}`;
  back('/admin/projects', 'Project updated.');
}

export async function deleteProject(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) {
    const images = await sql`SELECT file_name FROM project_images WHERE project_id = ${id}`;
    const main = await sql`SELECT featured_image FROM projects WHERE id = ${id}`;
    await sql`DELETE FROM projects WHERE id = ${id}`;
    for (const img of images) await removeBlob(img.file_name);
    await removeBlob(main[0]?.featured_image);
  }
  back('/admin/projects', 'Project deleted.');
}

/* ---------- services ---------- */

export async function saveService(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const title = str(form, 'title', 120);
  const description = str(form, 'description', 400);
  const order = int(form, 'sort_order') ?? 0;
  const published = form.get('is_published') === '1';
  if (!title || !description) back('/admin/services', 'Title and description are required.', 'error');
  if (id) {
    await sql`UPDATE services SET title = ${title}, description = ${description}, sort_order = ${order}, is_published = ${published} WHERE id = ${id}`;
  } else {
    await sql`INSERT INTO services (title, description, sort_order, is_published) VALUES (${title}, ${description}, ${order}, ${published})`;
  }
  back('/admin/services', 'Service saved.');
}

export async function deleteService(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) await sql`DELETE FROM services WHERE id = ${id}`;
  back('/admin/services', 'Service deleted.');
}

/* ---------- skills ---------- */

export async function saveSkill(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const category = str(form, 'category', 80);
  const name = str(form, 'name', 80);
  const order = int(form, 'sort_order') ?? 0;
  if (!category || !name) back('/admin/skills', 'Category and skill name are required.', 'error');
  if (id) {
    await sql`UPDATE skills SET category = ${category}, name = ${name}, sort_order = ${order} WHERE id = ${id}`;
  } else {
    await sql`INSERT INTO skills (category, name, sort_order) VALUES (${category}, ${name}, ${order})`;
  }
  back('/admin/skills', 'Skill saved.');
}

export async function deleteSkill(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) await sql`DELETE FROM skills WHERE id = ${id}`;
  back('/admin/skills', 'Skill deleted.');
}

/* ---------- testimonials ---------- */

export async function saveTestimonial(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const client = str(form, 'client_name', 120);
  const business = str(form, 'business_name', 150);
  const quote = str(form, 'quote', 2000);
  const projectId = int(form, 'project_id');
  const published = form.get('is_published') === '1';
  const photo = blobOrNull(form, 'photo');
  if (!client || !quote) back('/admin/testimonials', 'Client name and testimonial are required.', 'error');
  if (id) {
    const old = await sql`SELECT photo FROM testimonials WHERE id = ${id}`;
    await sql`
      UPDATE testimonials SET client_name = ${client}, business_name = ${business || null}, quote = ${quote},
        project_id = ${projectId}, photo = ${photo}, is_published = ${published} WHERE id = ${id}`;
    if (old[0]?.photo && old[0].photo !== photo) await removeBlob(old[0].photo);
  } else {
    await sql`
      INSERT INTO testimonials (client_name, business_name, quote, project_id, photo, is_published)
      VALUES (${client}, ${business || null}, ${quote}, ${projectId}, ${photo}, ${published})`;
  }
  back('/admin/testimonials', 'Testimonial saved.');
}

export async function toggleTestimonial(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) await sql`UPDATE testimonials SET is_published = NOT is_published WHERE id = ${id}`;
  back('/admin/testimonials', 'Testimonial updated.');
}

export async function deleteTestimonial(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) {
    const old = await sql`SELECT photo FROM testimonials WHERE id = ${id}`;
    await sql`DELETE FROM testimonials WHERE id = ${id}`;
    await removeBlob(old[0]?.photo);
  }
  back('/admin/testimonials', 'Testimonial deleted.');
}

/* ---------- blog ---------- */

export async function savePost(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  const here = id ? `/admin/blog/${id}` : '/admin/blog/new';
  const categoryId = int(form, 'category_id');
  const title = str(form, 'title', 200);
  const excerpt = str(form, 'excerpt', 300);
  const content = str(form, 'content', 60000);
  const seo = str(form, 'seo_description', 300);
  const published = form.get('is_published') === '1';
  const cover = blobOrNull(form, 'cover_image');
  if (!title) back(here, 'Title is required.', 'error');
  if (!excerpt) back(here, 'Excerpt is required.', 'error');
  if (!content) back(here, 'Content is required.', 'error');

  let postId = id;
  if (id) {
    const old = await sql`SELECT cover_image FROM blog_posts WHERE id = ${id}`;
    if (!old[0]) back('/admin/blog', 'Article not found.', 'error');
    await sql`
      UPDATE blog_posts SET category_id = ${categoryId}, title = ${title}, excerpt = ${excerpt}, content = ${content},
        cover_image = ${cover}, seo_description = ${seo || null}, is_published = ${published},
        published_at = CASE WHEN ${published} AND published_at IS NULL THEN now() ELSE published_at END, updated_at = now()
      WHERE id = ${id}`;
    if (old[0].cover_image && old[0].cover_image !== cover) await removeBlob(old[0].cover_image);
  } else {
    const slug = await uniqueSlug('blog_posts', title);
    const rows = await sql`
      INSERT INTO blog_posts (category_id, title, slug, excerpt, content, cover_image, seo_description, is_published, published_at)
      VALUES (${categoryId}, ${title}, ${slug}, ${excerpt}, ${content}, ${cover}, ${seo || null}, ${published}, ${published ? new Date().toISOString() : null})
      RETURNING id`;
    postId = rows[0].id as number;
  }
  back(`/admin/blog/${postId}`, 'Article saved.');
}

export async function togglePost(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) {
    await sql`
      UPDATE blog_posts SET is_published = NOT is_published,
        published_at = CASE WHEN NOT is_published AND published_at IS NULL THEN now() ELSE published_at END
      WHERE id = ${id}`;
  }
  back('/admin/blog', 'Article updated.');
}

export async function deletePost(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) {
    const old = await sql`SELECT cover_image FROM blog_posts WHERE id = ${id}`;
    await sql`DELETE FROM blog_posts WHERE id = ${id}`;
    await removeBlob(old[0]?.cover_image);
  }
  back('/admin/blog', 'Article deleted.');
}

/* ---------- profile, settings, password ---------- */

export async function saveProfile(form: FormData) {
  await requireAdmin();
  const name = str(form, 'full_name', 120);
  const headline = str(form, 'headline', 200);
  const tagline = str(form, 'tagline', 200);
  const bio = str(form, 'bio', 8000);
  if (!name || !headline || !tagline || !bio) back('/admin/profile', 'Name, title, tagline and introduction are required.', 'error');
  const photo = blobOrNull(form, 'photo');
  const old = await sql`SELECT photo FROM profiles WHERE id = 1`;
  await sql`
    INSERT INTO profiles (id, full_name, headline, tagline, bio, background, philosophy, career_goals, photo)
    VALUES (1, ${name}, ${headline}, ${tagline}, ${bio}, ${str(form, 'background', 8000) || null}, ${str(form, 'philosophy', 8000) || null}, ${str(form, 'career_goals', 8000) || null}, ${photo})
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, headline = EXCLUDED.headline, tagline = EXCLUDED.tagline,
      bio = EXCLUDED.bio, background = EXCLUDED.background, philosophy = EXCLUDED.philosophy, career_goals = EXCLUDED.career_goals,
      photo = EXCLUDED.photo, updated_at = now()`;
  if (old[0]?.photo && old[0].photo !== photo) await removeBlob(old[0].photo);
  back('/admin/profile', 'Profile saved.');
}

export async function saveSettings(form: FormData) {
  await requireAdmin();
  const whatsapp = str(form, 'whatsapp', 30).replace(/\D/g, '');
  const phone = str(form, 'phone', 30);
  const email = str(form, 'email', 190);
  const notify = str(form, 'notify_email', 190);
  const linkedin = str(form, 'linkedin', 300);
  const github = str(form, 'github', 300);
  const title = str(form, 'site_title', 120);
  const desc = str(form, 'site_description', 300);

  const errors: string[] = [];
  if (whatsapp.length > 15) errors.push('WhatsApp number is too long.');
  if (phone && !/^[0-9+()\-\s]{6,30}$/.test(phone)) errors.push('Invalid phone number.');
  if (email && !EMAIL.test(email)) errors.push('Invalid contact email.');
  if (notify && !EMAIL.test(notify)) errors.push('Invalid notification email.');
  if (linkedin && !safeUrl(linkedin)) errors.push('LinkedIn must be a full http or https link.');
  if (github && !safeUrl(github)) errors.push('GitHub must be a full http or https link.');
  if (!title || !desc) errors.push('Site title and description are required.');
  if (errors.length) back('/admin/settings', errors[0], 'error');

  const values: Record<string, string> = { whatsapp, phone, email, notify_email: notify, linkedin, github, site_title: title, site_description: desc };
  for (const [key, value] of Object.entries(values)) await saveSetting(key, value);
  back('/admin/settings', 'Settings saved.');
}

export async function changePassword(form: FormData) {
  const adminId = await requireAdmin();
  const current = String(form.get('current_password') ?? '').slice(0, 200);
  const next = String(form.get('new_password') ?? '').slice(0, 200);
  const confirm = String(form.get('confirm_password') ?? '').slice(0, 200);
  if (await rateLimited('admin_password', 5, 900)) back('/admin/settings', 'Too many attempts. Try again later.', 'error');
  const rows = await sql`SELECT password_hash FROM admins WHERE id = ${adminId}`;
  if (!rows[0] || !(await bcrypt.compare(current, rows[0].password_hash))) {
    await rateHit('admin_password');
    back('/admin/settings', 'Current password is incorrect.', 'error');
  }
  if (next.length < 12) back('/admin/settings', 'New password must be at least 12 characters.', 'error');
  if (next !== confirm) back('/admin/settings', 'New passwords do not match.', 'error');
  await sql`UPDATE admins SET password_hash = ${await bcrypt.hash(next, 12)} WHERE id = ${adminId}`;
  back('/admin/settings', 'Password changed.');
}

/* ---------- media library and CV ---------- */

export async function addMedia(form: FormData) {
  await requireAdmin();
  const urls = blobList(form, 'files', 10);
  for (const url of urls) {
    const exists = await sql`SELECT 1 FROM media WHERE file_name = ${url} LIMIT 1`;
    if (exists.length === 0) await sql`INSERT INTO media (file_name, original_name) VALUES (${url}, ${url.split('/').pop() ?? 'image'})`;
  }
  back('/admin/media', `${urls.length} image(s) in the library.`);
}

export async function deleteMedia(form: FormData) {
  await requireAdmin();
  const id = int(form, 'id');
  if (id) {
    const rows = await sql`SELECT file_name FROM media WHERE id = ${id}`;
    await sql`DELETE FROM media WHERE id = ${id}`;
    await removeBlob(rows[0]?.file_name);
  }
  back('/admin/media', 'Image deleted.');
}

export async function saveCv(form: FormData) {
  await requireAdmin();
  const file = form.get('cv');
  if (!(file instanceof File) || file.size === 0) back('/admin/cv', 'Choose a PDF file.', 'error');
  try {
    const url = await storePdf(file as File);
    const old = (await sql`SELECT setting_value FROM site_settings WHERE setting_key = 'cv_url'`)[0]?.setting_value;
    await saveSetting('cv_url', url);
    await removeBlob(old);
  } catch (error) {
    if (error instanceof UploadError) back('/admin/cv', error.message, 'error');
    throw error;
  }
  back('/admin/cv', 'CV uploaded.');
}

export async function deleteCv() {
  await requireAdmin();
  const old = (await sql`SELECT setting_value FROM site_settings WHERE setting_key = 'cv_url'`)[0]?.setting_value;
  await saveSetting('cv_url', '');
  await removeBlob(old);
  back('/admin/cv', 'CV removed.');
}
