import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAdminId } from '@/lib/auth';
import { login } from '../actions';

export const metadata: Metadata = { title: 'Admin Login', robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentAdminId()) redirect('/admin/dashboard');
  const { error } = await searchParams;
  return (
    <div className="login-wrap">
      <form className="card login-card" action={login} autoComplete="off">
        <h1>Admin login</h1>
        {typeof error === 'string' && error && <div className="notice error" role="alert">{error.slice(0, 160)}</div>}
        <div className="field">
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" maxLength={60} required autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" maxLength={200} required autoComplete="current-password" />
        </div>
        <button className="btn btn-primary" type="submit">Sign in</button>
      </form>
    </div>
  );
}
