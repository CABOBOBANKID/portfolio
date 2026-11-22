import type { Metadata } from 'next';
import TestimonialCard from '@/components/TestimonialCard';
import { getTestimonials } from '@/lib/data';

export const metadata: Metadata = { title: 'Testimonials | John Nsoh', description: 'Feedback from clients and organisations.' };

export default async function TestimonialsPage() {
  const rows = await getTestimonials();
  return (
    <section>
      <div className="container">
        <div className="section-head"><p className="eyebrow">Testimonials</p><h1>What clients say</h1></div>
        {rows.length === 0 ? (
          <p className="muted">Client feedback will appear here.</p>
        ) : (
          <div className="grid grid-3">{rows.map((t, i) => <TestimonialCard key={i} t={t} />)}</div>
        )}
      </div>
    </section>
  );
}
