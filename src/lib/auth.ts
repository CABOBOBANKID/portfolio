import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { secret } from './security';

export const SESSION_COOKIE = process.env.NODE_ENV === 'production' ? '__Host-jn_admin' : 'jn_admin';
const MAX_AGE = 60 * 60 * 8;

const key = () => new TextEncoder().encode(secret());

async function uaHash(): Promise<string> {
  const h = await headers();
  return createHash('sha256').update(h.get('user-agent') ?? '').digest('hex');
}

export async function createSession(adminId: number): Promise<void> {
  const token = await new SignJWT({ ua: await uaHash() })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function currentAdminId(): Promise<number | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
    if (payload.ua !== (await uaHash())) return null;
    const id = Number(payload.sub);
    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<number> {
  const id = await currentAdminId();
  if (!id) redirect('/admin/login');
  return id;
}
