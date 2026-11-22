import Flash, { type FlashParams } from '@/components/admin/Flash';
import ImageUploader from '@/components/admin/ImageUploader';
import { getProfile } from '@/lib/data';
import { saveProfile } from '../../actions';

export default async function ProfileAdmin({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const sp = await searchParams;
  const me = await getProfile();
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Profile</h1></div>
      <form action={saveProfile} className="card">
        <div className="form-grid">
          <div className="field"><label htmlFor="full_name">Full name</label><input type="text" id="full_name" name="full_name" maxLength={120} required defaultValue={me.full_name} /></div>
          <div className="field"><label htmlFor="headline">Professional title</label><input type="text" id="headline" name="headline" maxLength={200} required defaultValue={me.headline} /></div>
        </div>
        <div className="field"><label htmlFor="tagline">Tagline</label><input type="text" id="tagline" name="tagline" maxLength={200} required defaultValue={me.tagline} /></div>
        <div className="field"><label htmlFor="bio">Introduction</label><textarea id="bio" name="bio" required defaultValue={me.bio} /></div>
        <div className="field"><label htmlFor="background">Professional background</label><textarea id="background" name="background" defaultValue={me.background ?? ''} /></div>
        <div className="field"><label htmlFor="philosophy">Development philosophy</label><textarea id="philosophy" name="philosophy" defaultValue={me.philosophy ?? ''} /></div>
        <div className="field"><label htmlFor="career_goals">Career objectives</label><textarea id="career_goals" name="career_goals" defaultValue={me.career_goals ?? ''} /></div>
        <div className="field"><label>Profile photo</label><ImageUploader name="photo" kind="profile" initial={me.photo ? [me.photo] : []} /></div>
        <button className="btn btn-primary" type="submit">Save profile</button>
      </form>
    </>
  );
}
