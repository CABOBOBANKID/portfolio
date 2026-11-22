# John Nsoh Portfolio (Next.js for Vercel)

Same design and features as the PHP version, rebuilt to run on Vercel:
public site, contact form, admin dashboard (enquiries, projects, services, skills, testimonials, blog, media, CV, profile, analytics, settings).

Stack: Next.js 15, Neon Postgres, Vercel Blob (images and CV), signed cookie sessions, bcrypt passwords.

## 1. Create the services (all have free plans, no card)
1. GitHub: create a repository and upload this folder (the contents of this folder at the repository root).
2. Vercel: sign in with GitHub, choose Add New > Project, import the repository. Do not deploy yet.
3. Database: in the Vercel project open Storage > Create > Neon (Postgres). Connect it to the project. This adds `DATABASE_URL`.
4. Images: Storage > Create > Blob. Connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`.
5. Settings > Environment Variables, add:
   - `SESSION_SECRET` a random string of 32+ characters (generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`)
   - `NEXT_PUBLIC_SITE_URL` your site address, for example `https://johnnsoh.vercel.app` (no trailing slash)
6. Deploy.

## 2. Set up the database and admin account (one time, from your computer)
1. Install Node 20+ and run `npm install` in this folder.
2. In the Vercel project open Storage > your Neon database, and copy the connection string (the `DATABASE_URL` value).
3. Windows PowerShell:
   ```
   $env:DATABASE_URL="paste-the-connection-string"
   npm run db:migrate
   npm run admin:create
   ```
   macOS or Linux: `export DATABASE_URL="..."` then the same two commands.
4. Open `https://your-site/admin/login` and sign in. Then fill in Profile, Settings (WhatsApp, email, links), upload your CV, replace the sample projects.

## Optional: email notifications for new enquiries
Enquiries always appear in the dashboard. To also get an email, create a free Resend account, add `RESEND_API_KEY` and `MAIL_FROM` (a sender address on a domain you verified in Resend) as environment variables, then set the notification email in Admin > Settings.

## Security notes
- All database values are sent as bound parameters (no string-built SQL).
- Admin routes are checked in middleware and again inside every action. Server actions are protected against cross-site requests by Next.js; API routes check the request Origin.
- Passwords are bcrypt hashed; login is rate limited (5 attempts per 15 minutes) with constant-time checks.
- The enquiry form is rate limited (5 per hour per visitor), has a honeypot field, and validates every field on the server.
- Uploads are admin only, rate limited, re-encoded and resized with sharp, restricted to JPG, PNG, WebP (CV: PDF), 4 MB maximum per file. Photos are shrunk in the browser first, so phone photos work.
- Only addresses in your own Vercel Blob store are ever saved or displayed as images.
- Secrets live only in Vercel environment variables and are never sent to the browser.
- Security headers and a Content Security Policy are set in `next.config.mjs`.

## Local development
Copy `.env.example` to `.env.local`, fill it in, run `npm run dev`.
