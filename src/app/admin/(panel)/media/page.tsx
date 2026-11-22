import ConfirmButton from '@/components/admin/ConfirmButton';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import ImageUploader from '@/components/admin/ImageUploader';
import { sql } from '@/lib/db';
import { isBlobUrl } from '@/lib/util';
import { addMedia, deleteMedia } from '../../actions';

export default async function Media({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const sp = await searchParams;
  const rows = await sql`SELECT id, file_name FROM media ORDER BY created_at DESC LIMIT 200`;
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Media library</h1></div>
      <form action={addMedia} className="card">
        <div className="field"><label>Upload images (up to 10, JPG, PNG or WebP)</label>
          <ImageUploader name="files" kind="media" multiple max={10} /></div>
        <button className="btn btn-primary" type="submit">Add to library</button>
      </form>
      <div className="thumb-grid">
        {rows.filter((r) => isBlobUrl(r.file_name)).map((r) => (
          <div className="card" key={r.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.file_name} alt="Library item" loading="lazy" />
            <input type="text" readOnly value={r.file_name} aria-label="Image address" />
            <form action={deleteMedia}><input type="hidden" name="id" value={r.id} />
              <ConfirmButton message="Delete this image?" className="btn btn-danger btn-sm">Delete</ConfirmButton></form>
          </div>
        ))}
      </div>
    </>
  );
}
