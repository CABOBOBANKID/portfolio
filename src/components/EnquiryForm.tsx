'use client';

import { useRef, useState } from 'react';
import { ENQUIRY_BUDGETS, ENQUIRY_TYPES } from '@/lib/util';

export default function EnquiryForm({ preset }: { preset: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  function validate(f: HTMLFormElement): string {
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement).value.trim();
    if (get('full_name').length < 2) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get('email'))) return 'Please enter a valid email address.';
    if (get('message').length < 20) return 'Please describe your project in at least 20 characters.';
    return '';
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const problem = validate(form);
    if (problem) {
      setNotice({ ok: false, text: problem });
      return;
    }
    setBusy(true);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      const body = Object.fromEntries(new FormData(form).entries());
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      let data: { message?: string } | null = null;
      try {
        data = await res.json();
      } catch {}
      if (data?.message) {
        setNotice({ ok: res.ok, text: data.message });
      } else {
        setNotice({ ok: false, text: `The server returned an unexpected response (HTTP ${res.status}). Please try again or contact me directly.` });
      }
      if (res.ok) form.reset();
    } catch (error) {
      setNotice({
        ok: false,
        text: error instanceof DOMException && error.name === 'AbortError'
          ? 'The request timed out. Please check your connection and try again.'
          : 'Could not reach the server. Please check your connection and try again.',
      });
    } finally {
      clearTimeout(timer);
      setBusy(false);
    }
  }

  return (
    <>
      {notice && <div className={`notice ${notice.ok ? 'success' : 'error'}`} role="status" aria-live="polite">{notice.text}</div>}
      <form ref={formRef} onSubmit={onSubmit} noValidate>
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="contact_ref">Leave this field empty</label>
          <input type="text" id="contact_ref" name="contact_ref" tabIndex={-1} autoComplete="off" data-lpignore="true" data-1p-ignore="true" />
        </div>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="full_name">Full name</label>
            <input type="text" id="full_name" name="full_name" maxLength={120} required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" maxLength={190} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone (optional)</label>
            <input type="tel" id="phone" name="phone" maxLength={30} autoComplete="tel" />
          </div>
          <div className="field">
            <label htmlFor="company">Company (optional)</label>
            <input type="text" id="company" name="company" maxLength={150} autoComplete="organization" />
          </div>
          <div className="field">
            <label htmlFor="project_type">Project type</label>
            <select id="project_type" name="project_type" required defaultValue={ENQUIRY_TYPES.includes(preset as never) ? preset : ENQUIRY_TYPES[0]}>
              {ENQUIRY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="budget_range">Budget range (optional)</label>
            <select id="budget_range" name="budget_range" defaultValue="">
              <option value="">Select</option>
              {ENQUIRY_BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="message">Project description</label>
          <textarea id="message" name="message" maxLength={3000} minLength={20} rows={6} required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Sending...' : 'Send enquiry'}</button>
      </form>
    </>
  );
}
