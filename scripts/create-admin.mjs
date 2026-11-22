import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { createInterface } from 'node:readline/promises';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Set DATABASE_URL first.');
  process.exit(1);
}
const rl = createInterface({ input: process.stdin, output: process.stdout });
const username = (await rl.question('Admin username: ')).trim();
const email = (await rl.question('Admin email: ')).trim();
const password = await rl.question('Password (12+ characters): ');
rl.close();

if (!/^[A-Za-z0-9._-]{3,60}$/.test(username)) {
  console.error('Username must be 3 to 60 letters, numbers, dot, dash or underscore.');
  process.exit(1);
}
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Enter a valid email address.');
  process.exit(1);
}
if (password.length < 12) {
  console.error('Password must be at least 12 characters.');
  process.exit(1);
}
const hash = await bcrypt.hash(password, 12);
const sql = neon(url);
await sql`
  INSERT INTO admins (username, email, password_hash) VALUES (${username}, ${email}, ${hash})
  ON CONFLICT (username) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash
`;
console.log('Admin account saved. You can now sign in at /admin/login');
