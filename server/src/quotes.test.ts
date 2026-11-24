import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { Request } from 'express';
import {
  database,
  productRow,
  productFromRow,
  type ProductRow,
  type SaveResult,
} from './database.js';
import { products, productIdAliases } from './data/products.js';
import { clientRateKey } from './submissions.js';
import { app } from './app.js';

const sendMail = vi.fn().mockResolvedValue({ messageId: 'test' });
vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail }) } }));
const db = new PGlite();
const customer = {
  name: 'QA Customer',
  email: 'qa@example.invalid',
  phone: '+971123456789',
  company: 'QA Industry',
  message: 'Please quote a replacement motor.',
  website: '',
};
const quote = { ...customer, items: [{ productId: products[0].id, quantity: 3, notes: '400 V' }] };
const post = (payload: unknown = quote, key = randomUUID(), target = app) =>
  request(target).post('/api/enquiries').set('Idempotency-Key', key).send(payload);

beforeAll(async () => {
  // Reproduce Supabase roles and permissive legacy default grants, then apply the actual migration.
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    grant usage on schema public to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on sequences to anon, authenticated;`);
  await db.exec(
    await readFile(
      new URL('../../supabase/migrations/20261124000100_catalog_and_quotes.sql', import.meta.url),
      'utf8',
    ),
  );
  for (const [index, p] of products.entries()) {
    const row = productRow(p, index);
    const keys = Object.keys(row).join(',');
    await db.query(
      `insert into public.products (${keys}) select ${keys} from jsonb_populate_record(null::public.products, $1::jsonb)`,
      [JSON.stringify(row)],
    );
  }
  vi.spyOn(database, 'listProducts').mockImplementation(async () => {
    const { rows } = await db.query<ProductRow>(
      'select * from public.products where published order by sort_order, id',
    );
    return rows.map(productFromRow);
  });
  vi.spyOn(database, 'saveQuote').mockImplementation(async (args) => {
    const { rows } = await db.query<{ result: SaveResult }>(
      'select public.save_quote_request($1::uuid,$2,$3,$4,$5::jsonb,$6::jsonb) as result',
      [
        args.p_key,
        args.p_hash,
        args.p_client_key,
        args.p_kind,
        JSON.stringify(args.p_customer),
        JSON.stringify(args.p_items),
      ],
    );
    return rows[0].result;
  });
  vi.spyOn(database, 'setNotification').mockImplementation(async (id, status) => {
    await db.query('update public.quote_requests set notification_status = $1 where id = $2', [
      status,
      id,
    ]);
  });
  vi.spyOn(database, 'health').mockImplementation(async () => {
    await db.query('select id from public.products limit 1');
  });
}, 30000);
beforeEach(async () => {
  vi.stubEnv('SUPABASE_URL', 'https://test.invalid');
  vi.stubEnv('SUPABASE_SECRET_KEY', 'test-only-secret');
  vi.stubEnv('QUOTE_RATE_LIMIT_SECRET', 'test-only-rate-limit-secret-at-least-32-characters');
  vi.stubEnv('SMTP_HOST', '');
  vi.stubEnv('VERCEL', '');
  sendMail.mockReset().mockResolvedValue({ messageId: 'test' });
  await db.exec(
    'reset role; truncate public.quote_requests, public.quote_request_items, public.quote_rate_limits restart identity; update public.products set published = true;',
  );
});
afterAll(async () => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await db.close();
});

describe('Database-backed quote workflow', () => {
  it('preserves all imported product fields and filters unpublished data from catalog, details and sitemap', async () => {
    const { body } = await request(app).get('/api/products').expect(200);
    expect(body.products).toHaveLength(31);
    for (const p of products)
      expect(body.products.find((r: { id: string }) => r.id === p.id)).toMatchObject(
        JSON.parse(JSON.stringify(p)),
      );
    await db.query('update public.products set published = false where id = $1', [products[0].id]);
    expect((await request(app).get('/api/products')).body.products).toHaveLength(30);
    await request(app).get(`/api/products/${products[0].slug}`).expect(404);
    expect((await request(app).get('/sitemap.xml')).text).not.toContain(
      `/products/${products[0].slug}</loc>`,
    );
  });
  it('saves a private request and its product snapshot before returning a confirmation reference', async () => {
    const { body } = await post().expect(201);
    expect(body.reference).toMatch(/^WYZ-[A-F0-9]{32}$/);
    expect(body.id).toBeUndefined();
    const { rows } = await db.query(
      'select q.*, i.quantity, i.product_name, i.product_id from public.quote_requests q join public.quote_request_items i on q.id = i.quote_request_id',
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      public_reference: body.reference,
      name: customer.name,
      status: 'new',
      quantity: 3,
      product_id: products[0].id,
      product_name: products[0].name,
      notification_status: 'not_configured',
    });
    expect(rows[0].submitted_at).toBeTruthy();
  });
  it('rejects invalid email, lengths, quantities, keys, empty baskets and duplicate product lines', async () => {
    for (const bad of [
      { ...quote, email: 'invalid' },
      { ...quote, name: 'x'.repeat(101) },
      { ...quote, company: '' },
      { ...quote, message: 'x'.repeat(5001) },
      { ...quote, items: [] },
      ...[0, -1, 1.5, 10000, '2'].map((quantity) => ({
        ...quote,
        items: [{ ...quote.items[0], quantity }],
      })),
      { ...quote, items: [quote.items[0], quote.items[0]] },
      { ...quote, website: 'bot.invalid' },
    ])
      await post(bad).expect(400);
    await request(app).post('/api/enquiries').send(quote).expect(400);
    expect((await db.query('select * from public.quote_requests')).rows).toHaveLength(0);
  });
  it('rejects unknown and unpublished products and resolves existing legacy IDs', async () => {
    await post({ ...quote, items: [{ productId: 'nonexistent', quantity: 1 }] }).expect(400);
    await db.query('update public.products set published = false where id = $1', [products[0].id]);
    await post().expect(400);
    const [oldId, newId] = Object.entries(productIdAliases)[0];
    await db.query('update public.products set published = true where id = $1', [newId]);
    await post({ ...quote, items: [{ productId: oldId, quantity: 2 }] }).expect(201);
    expect(
      (await db.query('select product_id from public.quote_request_items')).rows[0].product_id,
    ).toBe(newId);
  });
  it('deduplicates simultaneous clicks and a lost-response retry, returning the same saved reference', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.test.invalid');
    const key = randomUUID();
    const responses = await Promise.all([post(quote, key), post(quote, key), post(quote, key)]);
    expect(responses.map((r) => r.status).sort()).toEqual([200, 200, 201]);
    expect(new Set(responses.map((r) => r.body.reference)).size).toBe(1);
    expect((await db.query('select * from public.quote_requests')).rows).toHaveLength(1);
    expect((await db.query('select * from public.quote_request_items')).rows).toHaveLength(1);
    expect(sendMail).toHaveBeenCalledOnce();
    expect((await post(quote, key).expect(200)).body.reference).toBe(responses[0].body.reference);
    await post({ ...quote, message: 'Different request details' }, key).expect(409);
  });
  it('uses shared database rate limits across server instances, without counting successful retries', async () => {
    // A separately imported Express app simulates another serverless instance sharing the database.
    vi.resetModules();
    vi.doMock('./database.js', () => ({ database, databaseConfigured: () => true }));
    const { app: second } = await import('./app.js');
    const key = randomUUID();
    await post(quote, key).expect(201);
    for (let i = 0; i < 4; i++) await post(quote, randomUUID(), i % 2 ? app : second).expect(201);
    const limited = await post(quote, randomUUID(), second).expect(429);
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
    await post(quote, key, second).expect(200);
    expect((await db.query('select * from public.quote_requests')).rows).toHaveLength(5);
    await db.exec(
      "update public.quote_rate_limits set window_start = now() - interval '61 seconds'",
    );
    await post(quote, randomUUID(), second).expect(201);
    vi.doUnmock('./database.js');
  });
  it('preserves the enquiry and confirms success even when the fixed sales notification fails', async () => {
    vi.stubEnv('SMTP_HOST', 'smtp.test.invalid');
    vi.stubEnv('SALES_EMAIL', 'sales-test@example.invalid');
    sendMail.mockRejectedValueOnce(new Error('test SMTP failure'));
    const key = randomUUID();
    const { body } = await post(quote, key).expect(201);
    expect(sendMail.mock.calls[0][0].to).toBe('sales-test@example.invalid');
    expect(sendMail.mock.calls[0][0].replyTo).toBe(customer.email);
    expect(
      (await db.query('select public_reference, notification_status from public.quote_requests'))
        .rows[0],
    ).toEqual({ public_reference: body.reference, notification_status: 'failed' });
    await post(quote, key).expect(200);
    expect(sendMail).toHaveBeenCalledOnce();
  });
  it('keeps the saved receipt when recording SMTP status fails and exposes no customer record routes', async () => {
    vi.mocked(database.setNotification).mockRejectedValueOnce(
      new Error('status update unavailable'),
    );
    await post().expect(201);
    expect(
      (await db.query('select notification_status from public.quote_requests')).rows[0]
        .notification_status,
    ).toBe('pending');
    for (const url of ['/api/quote_requests', '/api/enquiries', '/api/contact'])
      await request(app).get(url).expect(404);
    await request(app)
      .patch(`/api/products/${products[0].slug}`)
      .send({ published: false })
      .expect(404);
  });
  it('returns no success or reference when saving fails; retry can succeed with the same key', async () => {
    const key = randomUUID();
    vi.mocked(database.saveQuote).mockRejectedValueOnce(new Error('database unavailable'));
    const failed = await post(quote, key).expect(503);
    expect(failed.body.reference).toBeUndefined();
    expect((await db.query('select * from public.quote_requests')).rows).toHaveLength(0);
    await post(quote, key).expect(201);
  });
  it('saves general contact requests durably using the same confirmation and retry rules', async () => {
    const key = randomUUID();
    const first = await request(app)
      .post('/api/contact')
      .set('Idempotency-Key', key)
      .send(customer)
      .expect(201);
    const retry = await request(app)
      .post('/api/contact')
      .set('Idempotency-Key', key)
      .send(customer)
      .expect(200);
    expect(retry.body.reference).toBe(first.body.reference);
    expect((await db.query('select kind from public.quote_requests')).rows[0].kind).toBe('contact');
    expect((await db.query('select * from public.quote_request_items')).rows).toHaveLength(0);
  });
  it('hashes trusted IPs consistently, ignores spoofed proxy headers locally and groups IPv6 /64 addresses', () => {
    const req = (socket: string, header: string) =>
      ({ socket: { remoteAddress: socket }, get: () => header }) as unknown as Request;
    expect(clientRateKey(req('127.0.0.1', '1.2.3.4'))).toBe(
      clientRateKey(req('127.0.0.1', '5.6.7.8')),
    );
    vi.stubEnv('VERCEL', '1');
    expect(clientRateKey(req('127.0.0.1', '2001:db8::1'))).toBe(
      clientRateKey(req('127.0.0.1', '2001:db8:0:0::2')),
    );
    expect(clientRateKey(req('127.0.0.1', '1.2.3.4'))).not.toBe(
      clientRateKey(req('127.0.0.1', '5.6.7.8')),
    );
  });
});

describe('SQL grants and row-level security', () => {
  for (const role of ['anon', 'authenticated'])
    it(`${role} sees only published products and cannot read enquiries, edit products or invoke private RPC`, async () => {
      await post().expect(201);
      await db.query('update public.products set published = false where id = $1', [
        products[0].id,
      ]);
      await db.exec(`set role ${role}`);
      try {
        expect((await db.query('select * from public.products')).rows).toHaveLength(30);
        for (const table of ['quote_requests', 'quote_request_items', 'quote_rate_limits'])
          await expect(db.query(`select * from public.${table}`)).rejects.toThrow(
            /permission denied/,
          );
        await expect(db.query("update public.products set name = 'tampered'")).rejects.toThrow(
          /permission denied/,
        );
        await expect(db.query('delete from public.products')).rejects.toThrow(/permission denied/);
        await expect(
          db.query(
            "insert into public.products(id,slug,name,brand,category,images) values ('bad','bad','bad','bad','bad','[]')",
          ),
        ).rejects.toThrow(/permission denied/);
        await expect(
          db.query("insert into public.quote_requests(name) values ('bad')"),
        ).rejects.toThrow(/permission denied/);
        await expect(
          db.query(
            "select public.save_quote_request(gen_random_uuid(), repeat('a',64),repeat('b',64),'contact','{}','[]')",
          ),
        ).rejects.toThrow(/permission denied/);
      } finally {
        await db.exec('reset role');
      }
    });
  it('keeps RLS enabled even if someone accidentally adds a SELECT grant on private tables', async () => {
    await post().expect(201);
    await db.exec(
      'grant select on public.quote_requests, public.quote_request_items to anon; set role anon;',
    );
    try {
      expect((await db.query('select * from public.quote_requests')).rows).toHaveLength(0);
      expect((await db.query('select * from public.quote_request_items')).rows).toHaveLength(0);
    } finally {
      await db.exec(
        'reset role; revoke select on public.quote_requests, public.quote_request_items from anon;',
      );
    }
  });
  it('allows server-only product changes and rolls back an invalid quote with its items', async () => {
    await db.exec('set role service_role');
    try {
      await db.query('update public.products set published = false where id = $1', [
        products[0].id,
      ]);
      await expect(
        db.query(
          "select public.save_quote_request($1,repeat('a',64),repeat('b',64),'enquiry',$2,$3)",
          [
            randomUUID(),
            JSON.stringify(customer),
            JSON.stringify([{ productId: products[1].id, quantity: 0 }]),
          ],
        ),
      ).rejects.toThrow();
    } finally {
      await db.exec('reset role');
    }
    expect((await db.query('select * from public.quote_requests')).rows).toHaveLength(0);
    expect((await db.query('select * from public.quote_request_items')).rows).toHaveLength(0);
  });
});
