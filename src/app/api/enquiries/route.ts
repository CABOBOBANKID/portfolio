import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSettings } from '@/lib/data';
import { clientHash, clientIp, rateHit, rateLimited, sameOrigin } from '@/lib/security';
import { ENQUIRY_BUDGETS, ENQUIRY_TYPES } from '@/lib/util';

export const runtime = 'nodejs';

const reply = (status: number, message: string) => NextResponse.json({ message }, { status, headers: { 'Cache-Control': 'no-store' } });

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

export async function POST(request: Request) {
  try {
    if (!(await sameOrigin(request))) return reply(403, 'This request was blocked. Please use the form on the website.');
    if (!(request.headers.get('content-type') ?? '').includes('application/json')) return reply(415, 'Unsupported request.');

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return reply(400, 'The request could not be read.');
    }

    if (clean(body.contact_ref, 100) !== '') {
      console.warn('Enquiry rejected by honeypot from', await clientIp());
      return reply(200, 'Thank you. Your enquiry has been received.');
    }
    if (await rateLimited('enquiry', 5, 3600)) {
      return reply(429, 'Too many enquiries from your connection. Please try again later or contact me directly.');
    }

    const name = clean(body.full_name, 120);
    const email = clean(body.email, 190);
    const phone = clean(body.phone, 30);
    const company = clean(body.company, 150);
    const type = clean(body.project_type, 80);
    let budget = clean(body.budget_range, 60);
    const message = clean(body.message, 3000);

    if (name.length < 2) return reply(422, 'Please enter your full name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply(422, 'Please enter a valid email address.');
    if (phone !== '' && !/^[0-9+()\-\s]{6,30}$/.test(phone)) return reply(422, 'Please enter a valid phone number.');
    if (!(ENQUIRY_TYPES as readonly string[]).includes(type)) return reply(422, 'Please choose a project type.');
    if (budget !== '' && !(ENQUIRY_BUDGETS as readonly string[]).includes(budget)) budget = '';
    if (message.length < 20) return reply(422, 'Please describe your project in at least 20 characters.');

    const hash = await clientHash();
    const rows = await sql`
      INSERT INTO enquiries (full_name, email, phone, company, project_type, budget_range, message, ip_hash)
      VALUES (${name}, ${email}, ${phone || null}, ${company || null}, ${type}, ${budget || null}, ${message}, ${hash})
      RETURNING id`;
    await rateHit('enquiry');

    await notify(rows[0]?.id as number, { name, email, phone, company, type, budget, message });
    return reply(200, 'Thank you. Your enquiry has been received. I will follow up using the contact details you provided.');
  } catch (error) {
    console.error('Enquiry API error', error);
    return reply(500, 'Your message could not be saved because of a server problem. Please try again shortly or contact me directly.');
  }
}

async function notify(id: number, d: Record<string, string>) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) return;
  const settings = await getSettings();
  const to = settings.notify_email;
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return;
  const line = (v: string) => v.replace(/[\r\n]+/g, ' ');
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: d.email,
        subject: 'New project enquiry',
        text: `New enquiry (#${id})\n\nName: ${line(d.name)}\nEmail: ${line(d.email)}\nPhone: ${line(d.phone)}\nCompany: ${line(d.company)}\nType: ${line(d.type)}\nBudget: ${line(d.budget)}\n\n${d.message}`,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error('Enquiry email failed with status', res.status);
  } catch (error) {
    console.error('Enquiry email could not be sent. The enquiry is saved in the admin inbox.', error);
  }
}
