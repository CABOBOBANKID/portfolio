export const ENQUIRY_TYPES = ['Website Development', 'Business Software', 'Desktop Application', 'Mobile Application', 'API Development', 'Website Maintenance', 'Other'] as const;
export const ENQUIRY_BUDGETS = ['Under GHS 2,000', 'GHS 2,000 to 5,000', 'GHS 5,000 to 15,000', 'Above GHS 15,000', 'Not sure yet'] as const;
export const ENQUIRY_STATUSES = ['new', 'read', 'replied', 'archived'] as const;
export const PROJECT_STATUSES = ['completed', 'ongoing', 'maintenance'] as const;

export function slugify(text: string): string {
  const slug = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return slug || 'item';
}

export function safeUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.toString() : null;
  } catch {
    return null;
  }
}

/** Only image or file URLs that live in this project's Vercel Blob store are ever stored or rendered. */
export function isBlobUrl(url?: string | null): url is string {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

export function str(form: FormData, key: string, max: number): string {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function int(form: FormData, key: string): number | null {
  const value = form.get(key);
  if (typeof value !== 'string' || !/^-?\d{1,9}$/.test(value.trim())) return null;
  return Number(value.trim());
}

export function formatDate(value: string | Date | null | undefined, withTime = false): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return withTime
    ? date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function monthYear(value: string | Date | null | undefined): string {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function splitLines(text?: string | null): string[] {
  return (text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

export function splitCsv(text?: string | null): string[] {
  return (text ?? '').split(',').map((l) => l.trim()).filter(Boolean);
}
