import { createHmac, randomInt } from 'node:crypto';
import { headers } from 'next/headers';
import { sql } from './db';

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error('SESSION_SECRET must be set to a random string of at least 32 characters.');
  }
  return value;
}

export { secret };

export async function clientIp(): Promise<string> {
  const h = await headers();
  const real = h.get('x-real-ip');
  if (real) return real.trim();
  return (h.get('x-forwarded-for') ?? '').split(',')[0].trim() || '0.0.0.0';
}

export async function clientHash(): Promise<string> {
  return createHmac('sha256', secret()).update(await clientIp()).digest('hex');
}

export async function rateLimited(bucket: string, max: number, windowSeconds: number): Promise<boolean> {
  const hash = await clientHash();
  const rows = await sql`
    SELECT COUNT(*)::int AS c FROM rate_limits
    WHERE bucket = ${bucket} AND ip_hash = ${hash} AND created_at > now() - make_interval(secs => ${windowSeconds})
  `;
  return (rows[0]?.c ?? 0) >= max;
}

export async function rateHit(bucket: string): Promise<void> {
  const hash = await clientHash();
  await sql`INSERT INTO rate_limits (bucket, ip_hash) VALUES (${bucket}, ${hash})`;
  if (randomInt(0, 50) === 0) {
    await sql`DELETE FROM rate_limits WHERE created_at < now() - interval '1 day'`;
  }
}

export async function rateClear(bucket: string): Promise<void> {
  const hash = await clientHash();
  await sql`DELETE FROM rate_limits WHERE bucket = ${bucket} AND ip_hash = ${hash}`;
}

/** Browsers always send Origin on cross-origin and same-origin POSTs. Reject anything that does not match this host. */
export async function sameOrigin(request: Request): Promise<boolean> {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
