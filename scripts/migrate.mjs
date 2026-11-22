import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Set DATABASE_URL first (PowerShell: $env:DATABASE_URL="postgres://..."; macOS/Linux: export DATABASE_URL=...).');
  process.exit(1);
}
const sql = neon(url);

function statements(file) {
  return readFileSync(new URL(file, import.meta.url), 'utf8')
    .split(/;\s*(?:\r?\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

for (const file of ['../db/schema.sql', '../db/seed.sql']) {
  for (const statement of statements(file)) {
    await sql.query(statement);
  }
  console.log('Applied', file.replace('../', ''));
}
console.log('Database ready.');
