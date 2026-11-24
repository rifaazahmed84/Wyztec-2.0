// End-to-end verification of the built site against isolated PostgreSQL.
// Never loads .env, contacts Supabase or sends mail. Requires npm run build and Chrome.
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
const { PGlite } = createRequire(new URL('../server/package.json', import.meta.url))(
  '@electric-sql/pglite',
);
Object.assign(process.env, {
  NODE_ENV: 'test',
  VERCEL: '',
  SUPABASE_URL: 'https://test.invalid',
  SUPABASE_SECRET_KEY: 'test-only',
  SUPABASE_PUBLISHABLE_KEY: 'test-only',
  QUOTE_RATE_LIMIT_SECRET: 'test-only-browser-secret-at-least-32-characters',
  SMTP_HOST: '',
});
process.argv.push('--production');
const { database, productRow, productFromRow } = await import('../server/dist/database.js');
const { products } = await import('../server/dist/data/products.js');
const db = new PGlite();
let browser;
let server;
const checks = [];
try {
  await db.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  await db.exec(
    await readFile(
      new URL('../supabase/migrations/20261124000100_catalog_and_quotes.sql', import.meta.url),
      'utf8',
    ),
  );
  for (const [index, product] of products.entries()) {
    const row = productRow(product, index);
    const keys = Object.keys(row).join(',');
    await db.query(
      `insert into public.products (${keys}) select ${keys} from jsonb_populate_record(null::public.products, $1::jsonb)`,
      [JSON.stringify(row)],
    );
  }
  database.listProducts = async () =>
    (
      await db.query('select * from public.products where published order by sort_order, id')
    ).rows.map(productFromRow);
  database.saveQuote = async (args) =>
    (
      await db.query(
        'select public.save_quote_request($1::uuid,$2,$3,$4,$5::jsonb,$6::jsonb) as result',
        [
          args.p_key,
          args.p_hash,
          args.p_client_key,
          args.p_kind,
          JSON.stringify(args.p_customer),
          JSON.stringify(args.p_items),
        ],
      )
    ).rows[0].result;
  database.setNotification = async (id, status) => {
    await db.query('update public.quote_requests set notification_status=$1 where id=$2', [
      status,
      id,
    ]);
  };
  database.health = async () => {
    await db.query('select 1');
  };
  const { app } = await import('../server/dist/app.js');
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: 'reduce',
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + '/products');
    await expect(page.locator('.product-card')).toHaveCount(9);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page
      .locator('.product-card')
      .first()
      .getByRole('link', { name: 'Request a quote', exact: true })
      .click();
    await expect(page.getByLabel('Selected product')).toHaveValue(
      `${products[0].brand} ${products[0].name}`,
    );
    await expect(page.getByLabel('Quantity', { exact: false })).toBeInViewport();
    const image = page.locator('.gallery-main img');
    await expect(image).toHaveJSProperty('naturalWidth', 1200);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    checks.push(`Card-to-product quote form, image, anchor and layout at ${width}px`);
  }
  await page.getByLabel(/Full name/).fill('QA Browser Customer');
  await page.getByLabel(/Phone number/).fill('+971123456789');
  await page.getByLabel(/Email address/).fill('qa@example.invalid');
  await page.getByLabel(/Company name/).fill('QA Industry');
  await page.getByLabel(/Quantity/).fill('5');
  await page.getByLabel(/Your requirements/).fill('Browser regression test: 400 V replacement.');
  let loseResponse = true;
  await page.route('**/api/enquiries', async (route) => {
    if (loseResponse) {
      loseResponse = false;
      const response = await route.fetch();
      expect(response.status()).toBe(201);
      await route.abort('failed');
    } else await route.continue();
  });
  await page
    .locator('#request-quote')
    .getByRole('button', { name: 'Request a quote', exact: true })
    .click();
  await expect(page.locator('#request-quote [role=alert]')).toBeVisible();
  await expect(page.getByLabel(/Company name/)).toHaveValue('QA Industry');
  await expect(page.getByLabel(/Quantity/)).toHaveValue('5');
  await expect(page.locator('.form-success')).toHaveCount(0);
  await page.getByRole('button', { name: 'Retry request', exact: true }).click();
  await expect(page.getByText('Thank you. Your request is received.')).toBeVisible();
  await expect(page.getByText('Thank you. Your request is received.')).toBeInViewport();
  const { rows } = await db.query('select public_reference from public.quote_requests');
  expect(rows).toHaveLength(1);
  await expect(page.locator('.reference')).toContainText(rows[0].public_reference);
  expect(
    (await db.query('select quantity, product_id from public.quote_request_items')).rows,
  ).toEqual([{ quantity: 5, product_id: products[0].id }]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  checks.push(
    'Lost response preserves fields; retry produces one database request and matching reference',
    'Quantity and selected product saved correctly',
    'No uncaught browser errors or mobile receipt overflow',
  );
  await mkdir('.qa', { recursive: true });
  await page.screenshot({ path: '.qa/quote-confirmation-mobile.png', fullPage: false });
  await writeFile(
    '.qa/quote-workflow.json',
    JSON.stringify({ checks, database: 'isolated PostgreSQL', productionTouched: false }, null, 2),
  );
  console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
} finally {
  await browser?.close();
  if (server) await new Promise((resolve) => server.close(resolve));
  await db.close();
}
