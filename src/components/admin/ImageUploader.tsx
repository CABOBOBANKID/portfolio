'use client';

import { useRef, useState } from 'react';

const MAX_EDGE = 2200;

async function shrink(file: File): Promise<File> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 1_500_000) {
      bitmap.close();
      return file;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp';
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, type, 0.85));
    if (!blob || blob.size >= file.size) return file;
    const ext = type === 'image/jpeg' ? 'jpg' : 'webp';
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.' + ext, { type });
  } catch {
    return file;
  }
}

type Props = { name: string; kind: string; multiple?: boolean; initial?: string[]; max?: number };

export default function ImageUploader({ name, kind, multiple = false, initial = [], max = 10 }: Props) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (files.length === 0) return;
    setBusy(true);
    let next = multiple ? [...urls] : [];
    const problems: string[] = [];
    for (const original of files.slice(0, multiple ? max : 1)) {
      if (multiple && next.length >= max) break;
      setStatus(`Uploading ${original.name}...`);
      try {
        const file = await shrink(original);
        const body = new FormData();
        body.append('file', file);
        body.append('kind', kind);
        const res = await fetch('/api/admin/upload', { method: 'POST', body, credentials: 'same-origin' });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.url) {
          next = multiple ? [...next, data.url] : [data.url];
        } else {
          problems.push(`${original.name}: ${data.message ?? `upload failed (HTTP ${res.status})`}`);
        }
      } catch {
        problems.push(`${original.name}: could not reach the server`);
      }
    }
    if (!multiple && next.length === 0) next = urls;
    setUrls(next);
    setStatus(problems.length ? problems.join(' | ') : 'Upload complete. Save the form to keep the changes.');
    setBusy(false);
  }

  return (
    <div>
      <input type="hidden" name={name} value={multiple ? JSON.stringify(urls) : (urls[0] ?? '')} />
      {urls.length > 0 && (
        <div className="thumb-grid">
          {urls.map((url) => (
            <div className="card" key={url}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Uploaded" loading="lazy" />
              <button className="btn btn-danger btn-sm" type="button" onClick={() => setUrls(urls.filter((u) => u !== url))}>Remove</button>
            </div>
          ))}
        </div>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} onChange={onPick} disabled={busy} />
      <p className="muted" role="status" aria-live="polite">{busy ? status : status || 'JPG, PNG or WebP. Large photos are reduced automatically.'}</p>
    </div>
  );
}
