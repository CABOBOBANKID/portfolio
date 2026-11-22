import ConfirmButton from '@/components/admin/ConfirmButton';
import Flash, { type FlashParams } from '@/components/admin/Flash';
import { getSettings } from '@/lib/data';
import { isBlobUrl } from '@/lib/util';
import { deleteCv, saveCv } from '../../actions';

export default async function CvAdmin({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const sp = await searchParams;
  const { cv_url } = await getSettings();
  const has = isBlobUrl(cv_url);
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>CV</h1></div>
      <div className="card">
        <p>{has ? 'A CV is available for download on the site.' : 'No CV uploaded yet.'}</p>
        {has && <p><a href="/download-cv" target="_blank" rel="noopener noreferrer">Preview download</a></p>}
        <form action={saveCv}>
          <div className="field"><label htmlFor="cv">Upload PDF (up to 4 MB)</label>
            <input type="file" id="cv" name="cv" accept="application/pdf" required /></div>
          <button className="btn btn-primary" type="submit">Upload CV</button>
        </form>
        {has && (
          <form action={deleteCv}>
            <ConfirmButton message="Remove the CV?" className="btn btn-danger btn-sm">Remove CV</ConfirmButton>
          </form>
        )}
      </div>
    </>
  );
}
