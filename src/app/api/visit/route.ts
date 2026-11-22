import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { sql } from '@/lib/db';
import { clientHash, rateHit, rateLimited, sameOrigin } from '@/lib/security';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const done = () => new NextResponse(null, { status: 204 });
  try {
    if (!(await sameOrigin(request))) return done();
    const agent = ((await headers()).get('user-agent') ?? '').toLowerCase();
    if (agent === '' || /bot|crawl|spider|slurp|curl|wget|headless/.test(agent)) return done();
    const body = await request.json().catch(() => null);
    const path = typeof body?.path === 'string' ? body.path.slice(0, 200) : '';
    if (!/^\/[A-Za-z0-9/_\-.]*$/.test(path) || path.startsWith('/admin') || path.startsWith('/api')) return done();
    if (await rateLimited('visit', 200, 3600)) return done();
    await sql`INSERT INTO page_visits (path, ip_hash) VALUES (${path}, ${await clientHash()})`;
    await rateHit('visit');
  } catch (error) {
    console.error('Visit tracking failed', error);
  }
  return done();
}
