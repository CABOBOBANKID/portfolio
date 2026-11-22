import Link from 'next/link';

export default function NotFound() {
  return (
    <section style={{ padding: '96px 0' }}>
      <div className="container">
        <h1>Page not found</h1>
        <p className="muted">The page you are looking for does not exist or is no longer published.</p>
        <p><Link className="btn btn-primary" href="/">Back to home</Link></p>
      </div>
    </section>
  );
}
