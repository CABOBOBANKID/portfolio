import { NextResponse } from 'next/server';
import { currentAdminId } from '@/lib/auth';
import { sql } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  if (!(await currentAdminId())) return NextResponse.json({ message: 'Not signed in.' }, { status: 401 });
  const rows = await sql`SELECT COUNT(*)::int AS c FROM enquiries WHERE status = 'new'`;
  return NextResponse.json({ new: rows[0]?.c ?? 0 }, { headers: { 'Cache-Control': 'no-store' } });
}
