import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/data';
import { isBlobUrl } from '@/lib/util';

export async function GET(request: Request) {
  const { cv_url } = await getSettings();
  if (!isBlobUrl(cv_url)) return new NextResponse('CV not available yet.', { status: 404 });
  return NextResponse.redirect(cv_url, 302);
}
