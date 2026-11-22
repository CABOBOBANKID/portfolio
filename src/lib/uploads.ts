import { del, put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { isBlobUrl } from './util';

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // Vercel functions accept request bodies up to 4.5 MB
export const UPLOAD_KINDS = ['projects', 'testimonials', 'blog', 'profile', 'media'] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

const FORMATS = { jpeg: { ext: 'jpg', mime: 'image/jpeg' }, png: { ext: 'png', mime: 'image/png' }, webp: { ext: 'webp', mime: 'image/webp' } } as const;

export class UploadError extends Error {}

export async function storeImage(file: File, kind: UploadKind): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new UploadError('Image storage is not connected. Create a Blob store in the Vercel project (Storage tab).');
  }
  if (file.size <= 0) throw new UploadError('The file is empty.');
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError('The file is larger than 4 MB. Choose a smaller image.');

  const input = Buffer.from(await file.arrayBuffer());
  let pipeline = sharp(input, { limitInputPixels: 40_000_000, failOn: 'error' });
  let meta;
  try {
    meta = await pipeline.metadata();
  } catch {
    throw new UploadError('The file is not a valid image.');
  }
  const format = meta.format as keyof typeof FORMATS | undefined;
  if (!format || !(format in FORMATS)) throw new UploadError('Only JPG, PNG or WebP images are allowed.');

  pipeline = pipeline.rotate().resize({ width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true });
  const output =
    format === 'jpeg' ? await pipeline.jpeg({ quality: 85 }).toBuffer()
    : format === 'png' ? await pipeline.png({ compressionLevel: 8 }).toBuffer()
    : await pipeline.webp({ quality: 85 }).toBuffer();

  const { ext, mime } = FORMATS[format];
  const blob = await put(`${kind}/${randomUUID()}.${ext}`, output, {
    access: 'public',
    contentType: mime,
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function storePdf(file: File): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new UploadError('File storage is not connected. Create a Blob store in the Vercel project (Storage tab).');
  }
  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) throw new UploadError('The PDF must be under 4 MB.');
  const input = Buffer.from(await file.arrayBuffer());
  if (input.subarray(0, 5).toString('latin1') !== '%PDF-') throw new UploadError('The file is not a valid PDF.');
  const blob = await put(`cv/${randomUUID()}.pdf`, input, { access: 'public', contentType: 'application/pdf', addRandomSuffix: false });
  return blob.url;
}

export async function removeBlob(url?: string | null): Promise<void> {
  if (!isBlobUrl(url) || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(url);
  } catch (error) {
    console.error('Could not delete blob', error);
  }
}
