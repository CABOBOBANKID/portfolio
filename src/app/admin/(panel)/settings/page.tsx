import Flash, { type FlashParams } from '@/components/admin/Flash';
import { getSettings } from '@/lib/data';
import { changePassword, saveSettings } from '../../actions';

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<FlashParams> }) {
  const sp = await searchParams;
  const s = await getSettings();
  const v = (k: string) => s[k] ?? '';
  return (
    <>
      <Flash sp={sp} />
      <div className="admin-top"><h1>Settings</h1></div>
      <form action={saveSettings} className="card">
        <div className="field"><label htmlFor="site_title">Site title</label><input type="text" id="site_title" name="site_title" maxLength={120} required defaultValue={v('site_title')} /></div>
        <div className="field"><label htmlFor="site_description">Meta description</label><textarea id="site_description" name="site_description" maxLength={300} required defaultValue={v('site_description')} /></div>
        <div className="form-grid">
          <div className="field"><label htmlFor="whatsapp">WhatsApp number (digits with country code)</label><input type="text" id="whatsapp" name="whatsapp" inputMode="numeric" maxLength={20} defaultValue={v('whatsapp')} /></div>
          <div className="field"><label htmlFor="phone">Phone</label><input type="tel" id="phone" name="phone" maxLength={30} defaultValue={v('phone')} /></div>
          <div className="field"><label htmlFor="email">Public contact email</label><input type="email" id="email" name="email" maxLength={190} defaultValue={v('email')} /></div>
          <div className="field"><label htmlFor="notify_email">Enquiry notification email</label><input type="email" id="notify_email" name="notify_email" maxLength={190} defaultValue={v('notify_email')} /></div>
          <div className="field"><label htmlFor="linkedin">LinkedIn URL</label><input type="url" id="linkedin" name="linkedin" maxLength={300} defaultValue={v('linkedin')} /></div>
          <div className="field"><label htmlFor="github">GitHub URL</label><input type="url" id="github" name="github" maxLength={300} defaultValue={v('github')} /></div>
        </div>
        <button className="btn btn-primary" type="submit">Save settings</button>
      </form>
      <h2>Change password</h2>
      <form action={changePassword} className="card" autoComplete="off">
        <div className="field"><label htmlFor="current_password">Current password</label><input type="password" id="current_password" name="current_password" maxLength={200} required autoComplete="current-password" /></div>
        <div className="field"><label htmlFor="new_password">New password (12+ characters)</label><input type="password" id="new_password" name="new_password" maxLength={200} required minLength={12} autoComplete="new-password" /></div>
        <div className="field"><label htmlFor="confirm_password">Confirm new password</label><input type="password" id="confirm_password" name="confirm_password" maxLength={200} required minLength={12} autoComplete="new-password" /></div>
        <button className="btn btn-primary" type="submit">Change password</button>
      </form>
    </>
  );
}
