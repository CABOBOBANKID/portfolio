import Link from 'next/link';
import { getContactLinks, getProfile } from '@/lib/data';
import { safeUrl } from '@/lib/util';

export default async function SiteFooter() {
  const [links, me] = await Promise.all([getContactLinks(), getProfile()]);
  const linkedin = safeUrl(links.linkedin);
  const github = safeUrl(links.github);
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="brand">{me.full_name}</p>
          <p className="muted">Building technology that works for businesses.</p>
        </div>
        <div className="footer-links">
          <Link href="/blog">Blog</Link>
          <Link href="/testimonials">Testimonials</Link>
          {links.whatsapp && <a href={`https://wa.me/${links.whatsapp}`} rel="noopener noreferrer" target="_blank">WhatsApp</a>}
          {linkedin && <a href={linkedin} rel="noopener noreferrer" target="_blank">LinkedIn</a>}
          {github && <a href={github} rel="noopener noreferrer" target="_blank">GitHub</a>}
        </div>
      </div>
      <div className="container footer-bottom">
        <p className="muted">&copy; {new Date().getFullYear()} John Nsoh. Developed by John Nsoh.</p>
      </div>
    </footer>
  );
}
