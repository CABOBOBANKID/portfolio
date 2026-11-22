import { NextResponse } from 'next/server';
import { currentAdminId } from '@/lib/auth';
import { rateHit, rateLimited, sameOrigin } from '@/lib/security';
import { UPLOAD_KINDS, UploadError, storeImage, type UploadKind } from '@/lib/uploads';

export const runtime = 'nodejs';
export const maxDuration = 30;

const reply = (status: number, body: Record<string, string>) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(request: Request) {
  try {
    if (!(await sameOrigin(request))) return reply(403, { message: 'Request blocked.' });
    if (!(await currentAdminId())) return reply(401, { message: 'Your session expired. Sign in again.' });
    if (await rateLimited('upload', 120, 3600)) return reply(429, { message: 'Too many uploads. Try again later.' });

    const form = await request.formData();
    const file = form.get('file');
    const kind = form.get('kind');
    if (!(file instanceof File)) return reply(400, { message: 'No file was received.' });
    if (typeof kind !== 'string' || !(UPLOAD_KINDS as readonly string[]).includes(kind)) return reply(400, { message: 'Invalid upload location.' });

    const url = await storeImage(file, kind as UploadKind);
    await rateHit('upload');
    return reply(200, { url });
  } catch (error) {
    if (error instanceof UploadError) return reply(422, { message: error.message });
    console.error('Upload failed', error);
    return reply(500, { message: 'The image could not be processed on the server.' });
  }
}
