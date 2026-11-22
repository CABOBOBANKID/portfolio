import type { Metadata } from 'next';
import EnquiryForm from '@/components/EnquiryForm';
import { getContactLinks } from '@/lib/data';
import { safeUrl } from '@/lib/util';

export const metadata: Metadata = { title: 'Contact | John Nsoh', description: 'Request a website or business software project from John Nsoh.' };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  const links = await getContactLinks();
  const linkedin = safeUrl(links.linkedin);
  const github = safeUrl(links.github);
  return (
    <section>
      <div className="container detail-grid">
        <div>
          <p className="eyebrow">Contact</p>
          <h1>Start a project enquiry</h1>
          <EnquiryForm preset={typeof service === 'string' ? service.slice(0, 80) : ''} />
        </div>
        <aside className="card contact-methods">
          <h3>Reach me directly</h3>
          {links.whatsapp && <a className="btn btn-ghost" href={`https://wa.me/${links.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          {links.phone && <a className="btn btn-ghost" href={`tel:${links.phone.replace(/[^0-9+]/g, '')}`}>Call</a>}
          {links.email && <a className="btn btn-ghost" href={`mailto:${links.email}`}>Email</a>}
          {linkedin && <a className="btn btn-ghost" href={linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
          {github && <a className="btn btn-ghost" href={github} target="_blank" rel="noopener noreferrer">GitHub</a>}
        </aside>
      </div>
    </section>
  );
}
