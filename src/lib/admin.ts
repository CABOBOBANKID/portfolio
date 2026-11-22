import { redirect } from 'next/navigation';

export function back(path: string, message: string, type: 'success' | 'error' = 'success'): never {
  const sep = path.includes('?') ? '&' : '?';
  redirect(`${path}${sep}msg=${encodeURIComponent(message.slice(0, 200))}${type === 'error' ? '&t=error' : ''}`);
}
