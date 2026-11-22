import type { Metadata } from 'next';
import Link from 'next/link';
import { getServices } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Services | John Nsoh',
  description: 'Website development, business software, desktop and mobile applications, APIs and maintenance.',
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <section>
      <div className="container">
        <div className="section-head"><p className="eyebrow">Services</p><h1>What I can build for you</h1></div>
        <div className="grid grid-3">
          {services.map((s) => (
            <article className="card" key={s.title}>
              <h3>{s.title}</h3>
              <p className="muted">{s.description}</p>
              <Link className="btn btn-ghost btn-sm" href={`/contact?service=${encodeURIComponent(s.title)}`}>Enquire</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
