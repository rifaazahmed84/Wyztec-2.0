import '../config.js';

// Read-only preflight. Never print keys, response bodies or customer data.
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!url || !key)
  throw new Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in the root .env.');
const checks = [
  { table: 'products', expected: 200 },
  { table: 'quote_requests', expected: 401 },
  { table: 'quote_request_items', expected: 401 },
  { table: 'quote_rate_limits', expected: 401 },
];
let passed = true;
for (const { table, expected } of checks) {
  const response = await fetch(new URL(`/rest/v1/${table}?select=*&limit=0`, url), {
    headers: { apikey: key },
  });
  // 401 or 403 both represent a denied anonymous request; 404 means migration missing.
  const ok = expected === 200 ? response.status === 200 : [401, 403].includes(response.status);
  console.info(`${table}: ${ok ? 'PASS' : 'FAIL'} (anonymous HTTP ${response.status})`);
  passed &&= ok;
}
console.info(`Server secret key: ${process.env.SUPABASE_SECRET_KEY ? 'configured' : 'missing'}`);
console.info(
  `Rate-limit secret: ${(process.env.QUOTE_RATE_LIMIT_SECRET?.length ?? 0) >= 32 ? 'configured' : 'missing/too short'}`,
);
if (!passed) process.exitCode = 1;
