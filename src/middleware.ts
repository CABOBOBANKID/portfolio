import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE = process.env.NODE_ENV === 'production' ? '__Host-jn_admin' : 'jn_admin';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get(COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  let valid = false;
  if (token && secret && secret.length >= 32) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ['HS256'] });
      valid = true;
    } catch {
      valid = false;
    }
  }
  if (!valid) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
