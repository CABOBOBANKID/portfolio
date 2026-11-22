import { neon } from '@neondatabase/serverless';

type Row = Record<string, any>;
type Query = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

let client: Query | null = null;

function connect(): Query {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set. Add it in the Vercel project settings.');
    }
    client = neon(url) as unknown as Query;
  }
  return client;
}

/** Tagged template. Every interpolated value is sent as a bound parameter, never concatenated into SQL. */
export const sql: Query = (strings, ...values) => connect()(strings, ...values);
