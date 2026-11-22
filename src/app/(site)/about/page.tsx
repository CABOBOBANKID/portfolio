import type { Metadata } from 'next';
import Link from 'next/link';
import Paragraphs from '@/components/Paragraphs';
import { getProfile } from '@/lib/data';
import { isBlobUrl } from '@/lib/util';

export async function generateMetadata(): Promise<Metadata> {
  const me = await getProfile();
  return { title: `About | ${me.full_name}`, description: me.bio.slice(0, 160) };
}

export default async function AboutPage() {
  const me = await getProfile();
  const blocks: [string, string | null][] = [
    ['Professional background', me.background],
    ['Development philosophy', me.philosophy],
    ['Career objectives', me.career_goals],
  ];
  return (
    <section>
      <div className="container detail-grid">
        <div>
          <p className="eyebrow">About</p>
          <h1>{me.full_name}</h1>
          <p className="hero-role">{me.headline}</p>
          <h2>Introduction</h2>
          <Paragraphs text={me.bio} />
          {blocks.filter(([, text]) => (text ?? '').trim() !== '').map(([title, text]) => (
            <div key={title}><h2>{title}</h2><Paragraphs text={text} /></div>
          ))}
        </div>
        <aside className="card">
          {isBlobUrl(me.photo) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="avatar-img" src={me.photo} alt={me.full_name} />
          )}
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/contact">Hire Me</Link>
            <a className="btn btn-ghost" href="/download-cv">Download CV</a>
          </div>
        </aside>
      </div>
    </section>
  );
}
