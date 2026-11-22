import { isBlobUrl } from '@/lib/util';

type T = { client_name: string; business_name: string | null; quote: string; photo: string | null };

export default function TestimonialCard({ t }: { t: T }) {
  return (
    <article className="card testimonial">
      <p>{t.quote}</p>
      <div className="testimonial-by">
        {isBlobUrl(t.photo) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="mini-avatar" src={t.photo} alt={t.client_name} loading="lazy" />
        )}
        <div>
          <strong>{t.client_name}</strong>
          {t.business_name && <span className="muted">{t.business_name}</span>}
        </div>
      </div>
    </article>
  );
}
