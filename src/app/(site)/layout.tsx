import type { Metadata } from 'next';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import VisitTracker from '@/components/VisitTracker';
import { getContactLinks, getProfile } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const links = await getContactLinks();
  return { title: links.siteTitle, description: links.siteDescription };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const me = await getProfile();
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader name={me.full_name} />
      <main id="main">{children}</main>
      <SiteFooter />
      <VisitTracker />
    </>
  );
}
