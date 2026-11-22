'use client';

import Link from 'next/link';
import { useState } from 'react';

const links = [
  ['/about', 'About'],
  ['/services', 'Services'],
  ['/projects', 'Projects'],
  ['/skills', 'Skills'],
  ['/blog', 'Blog'],
  ['/contact', 'Contact'],
] as const;

export default function SiteHeader({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  function toggleTheme() {
    const root = document.documentElement;
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
  }

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" href="/">{name}</Link>
        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="siteNav"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>
        <nav className={`site-nav${open ? ' open' : ''}`} id="siteNav" aria-label="Main" onClick={() => setOpen(false)}>
          {links.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
          <button className="theme-btn" type="button" aria-label="Switch theme" onClick={toggleTheme}>Theme</button>
          <Link className="btn btn-primary btn-sm" href="/contact">Hire Me</Link>
        </nav>
      </div>
    </header>
  );
}
