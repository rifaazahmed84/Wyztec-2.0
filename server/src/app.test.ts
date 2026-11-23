import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
const sendMail = vi.fn().mockResolvedValue({ messageId: 'test-id' });
vi.mock('nodemailer', () => ({ default: { createTransport: () => ({ sendMail }) } }));
const directory = await mkdtemp(path.join(tmpdir(), 'wyztec-test-'));
process.env.SUBMISSIONS_DIR = directory;
process.env.NODE_ENV = 'test';
delete process.env.SMTP_HOST;
const { app } = await import('./app.js');
const { products } = await import('./data/products.js');
const { productSlugAliases } = await import('./data/product-replacements.js');
const { productIdAliases } = await import('./data/products.js');
const { productContent } = await import('./data/product-content.js');
const { productSpecifications } = await import('./data/product-specifications.js');
const { productRepository } = await import('./repositories/products.js');
const { submit } = await import('./submissions.js');
const contact = {
  name: 'Test Customer',
  phone: '+971 5512 64045',
  email: 'customer@example.com',
  company: 'Test Industry',
  message: 'Please quote a replacement motor.',
  website: '',
};
beforeAll(() => {
  delete process.env.SMTP_HOST;
});
afterAll(async () => {
  await rm(directory, { recursive: true, force: true });
});
describe('Catalog API', () => {
  it('lists each replaced product once and resolves old URLs and saved enquiry IDs', async () => {
    const response = await request(app).get('/api/products').expect(200);
    const listed = response.body.products as typeof products;
    const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
    expect(new Set(listed.map((p) => `${p.category}:${normalize(p.name)}`)).size).toBe(31);
    expect(Object.keys(productSlugAliases)).toHaveLength(16);
    for (const [oldSlug, newSlug] of Object.entries(productSlugAliases)) {
      expect(listed.some((p) => p.slug === oldSlug)).toBe(false);
      expect(listed.filter((p) => p.slug === newSlug)).toHaveLength(1);
      const legacy = await request(app).get(`/api/products/${oldSlug}`).expect(200);
      expect(legacy.body.product.slug).toBe(newSlug);
      expect(legacy.body.product.images[0].src).toBe(`/images/products/${newSlug}/1.webp`);
    }
    expect(Object.keys(productIdAliases)).toHaveLength(16);
    for (const [oldId, newId] of Object.entries(productIdAliases)) {
      expect(productRepository.byId(oldId)?.id).toBe(newId);
    }
    for (const product of listed) {
      for (const slug of product.relatedSlugs ?? []) {
        expect(listed.some((p) => p.slug === slug)).toBe(true);
      }
    }
    const sitemap = (await request(app).get('/sitemap.xml')).text;
    for (const slug of Object.keys(productSlugAliases)) {
      expect(sitemap).not.toContain(`/products/${slug}</loc>`);
    }
  });
  it('serves every complete product with unique IDs and slugs', async () => {
    const response = await request(app).get('/api/products').expect(200);
    expect(response.body.products).toHaveLength(31);
    expect(new Set(products.map((p) => p.slug)).size).toBe(31);
    expect(new Set(products.map((p) => p.id)).size).toBe(31);
    expect(Object.keys(productContent).sort()).toEqual(products.map((p) => p.slug).sort());
    expect(Object.keys(productSpecifications).sort()).toEqual(products.map((p) => p.slug).sort());
    const industries = new Set([
      'Material Handling',
      'Water Treatment',
      'Oil & Gas',
      'Shipbuilding',
      'Food & Beverages',
      'Sugar Industries',
      'Concrete Industries',
      'Packaging Industries',
    ]);
    for (const p of products) {
      expect(p.verified).toBe(false);
      // Editorial copy must reach the API for every product, including replacements.
      expect(response.body.products.find((item: typeof p) => item.id === p.id)).toMatchObject(
        productContent[p.slug],
      );
      expect(p.overview.length).toBeGreaterThan(100);
      expect(p.tagline.trim()).toBeTruthy();
      expect(p.features).toHaveLength(4);
      expect(p.applications).toHaveLength(4);
      expect(p.industries.length).toBeGreaterThanOrEqual(2);
      expect(p.industries.every((industry) => industries.has(industry))).toBe(true);
      for (const text of [...p.features, ...p.applications])
        expect(text.trim().length).toBeGreaterThan(15);
      expect(p.specs.length).toBeGreaterThanOrEqual(5);
      expect(new Set(p.specs.map((spec) => spec.label)).size).toBe(p.specs.length);
      expect(p.specificationNote).toBeTruthy();
      expect(response.body.products.find((item: typeof p) => item.id === p.id)).toMatchObject(
        productSpecifications[p.slug],
      );
      expect(p.images.length).toBeGreaterThanOrEqual(1);
      expect(p.images[0].src).toMatch(new RegExp(`^/images/products/${p.slug}/[1-9]\\d*\\.webp$`));
      expect(p.images[0].alt).toContain(p.name);
      expect(p.selectionGuide).toBeTruthy();
    }
  });
  it('preserves specification units, test conditions and model boundaries', () => {
    const specs = (slug: string) =>
      Object.fromEntries(
        productRepository.bySlug(slug)!.specs.map(({ label, value }) => [label, value]),
      );
    const flow = specs('jumo-flowtrans-mag-h20');
    expect(flow['DN 6 flow range']).toBe('0.005–5 L/min');
    expect(flow['DN 25 flow range']).toBe('0.2–150 L/min');
    expect(flow['Reference-condition accuracy']).toContain('±1.5 mm/s');
    expect(flow['Application-condition accuracy']).toContain('0.8%');
    expect(specs('meknoid-helical-gearbox')['SMH4 torque range']).toBe('9–796 kNm');
    const valve = specs('metal-work-solenoid-valve');
    expect(valve['Flow test conditions']).toBe('6 bar supply; 1 bar pressure drop');
    expect(valve['1/8 in port: nominal flow']).toBe('550 Nl/min');
    expect(valve['1/2 in port: nominal flow']).toBe('4,600 Nl/min');
    expect(specs('jumo-logoscreen-700')['Physical analog inputs']).toBe(
      'Up to 18 universal inputs',
    );
    expect(specs('jumo-logoscreen-700')['Recorded analog signals']).toBe('Up to 60');
    expect(productRepository.bySlug('jumo-thermocouples')!.modelTable!.rows[4][2]).toContain(
      'J/L: up to +800 °C',
    );
    for (const slug of ['jumo-flowmeters', 'jumo-paperless-recorders']) {
      const product = productRepository.bySlug(slug)!;
      expect(product.specificationNote).toContain('Exact model required.');
      // The generic listings must not inherit MAG H20 / LOGOSCREEN 700 ratings.
      expect(product.specs.some(({ value }) => /L\/min|125 ms|1 GB|±0\.5|24 V/.test(value))).toBe(
        false,
      );
    }
  });
  it('combines search, brand, category, industry and sort', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({
        q: 'motor',
        brand: 'Siemens',
        category: 'Siemens Motors',
        industry: 'Oil & Gas',
        sort: 'name-desc',
      })
      .expect(200);
    expect(response.body.products).toHaveLength(1);
    expect(response.body.products[0].name).toBe('Flameproof Motors');
    const empty = await request(app).get('/api/products?q=nonexistent').expect(200);
    expect(empty.body.products).toEqual([]);
  });
  it('resolves all detail pages through the API', async () => {
    for (const p of products) {
      const response = await request(app).get(`/api/products/${p.slug}`).expect(200);
      expect(response.body.product.id).toBe(p.id);
    }
  });
  it('returns categories, brands, health, sitemap and consistent errors', async () => {
    expect((await request(app).get('/api/categories')).body.categories).toHaveLength(6);
    expect((await request(app).get('/api/brands')).body.brands).toHaveLength(7);
    await request(app).get('/api/health').expect(200);
    expect((await request(app).get('/sitemap.xml')).text).toContain(products[26].slug);
    await request(app).get('/api/products/unknown').expect(404);
    expect((await request(app).get('/api/missing')).body.error.code).toBe('NOT_FOUND');
    await request(app).get('/api/products?sort=invalid').expect(400);
  });
  it('allows only configured cross-origin browser access and sets security headers', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'https://untrusted.example')
      .expect(200);
    expect(response.headers['access-control-allow-origin']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    const allowed = await request(app).get('/api/health').set('Origin', 'http://localhost:5173');
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});
describe('Submission lifecycle', () => {
  it('validates, rejects spam silently, persists requests, rejects unknown products and rate limits', async () => {
    const invalid = await request(app)
      .post('/api/contact')
      .send({ ...contact, email: 'invalid' })
      .expect(400);
    expect(invalid.body.error.fields.email).toBeTruthy();
    await request(app)
      .post('/api/contact')
      .send({ ...contact, website: 'spam.example' })
      .expect(200);
    const callback = await request(app).post('/api/contact').send(contact).expect(201);
    expect(callback.body.delivery).toBe('development');
    await request(app)
      .post('/api/enquiries')
      .send({ ...contact, items: [{ productId: 'missing', quantity: 1, notes: '' }] })
      .expect(400);
    const enquiry = await request(app)
      .post('/api/enquiries')
      .send({ ...contact, items: [{ productId: products[0].id, quantity: 3, notes: '400 V, B3' }] })
      .expect(201);
    expect(enquiry.body.id).toBeTruthy();
    const entries = JSON.parse(await readFile(path.join(directory, 'submissions.json'), 'utf8'));
    expect(entries).toHaveLength(2);
    expect(entries[1].payload.items[0].quantity).toBe(3);
    const limited = await request(app).post('/api/contact').send(contact).expect(429);
    expect(limited.body.error.code).toBe('RATE_LIMIT');
  });
  it('serializes simultaneous log writes without dropping enquiries', async () => {
    await Promise.all(Array.from({ length: 5 }, () => submit('contact', contact)));
    const entries = JSON.parse(await readFile(path.join(directory, 'submissions.json'), 'utf8'));
    expect(entries).toHaveLength(7);
  });
  it('delivers a sales email and acknowledgement when SMTP is configured', async () => {
    process.env.SMTP_HOST = 'smtp.test';
    sendMail.mockClear();
    await submit('contact', contact);
    expect(sendMail).toHaveBeenCalledTimes(2);
    expect(sendMail.mock.calls[0][0].replyTo).toBe(contact.email);
    expect(sendMail.mock.calls[1][0].to).toBe(contact.email);
    delete process.env.SMTP_HOST;
  });
  it('preserves failed delivery records without reporting successful delivery', async () => {
    process.env.SMTP_HOST = 'smtp.test';
    sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));
    await expect(submit('contact', contact)).rejects.toThrow('SMTP unavailable');
    const entries = JSON.parse(await readFile(path.join(directory, 'submissions.json'), 'utf8'));
    expect(entries.at(-1).delivery).toBe('failed');
    delete process.env.SMTP_HOST;
  });
});
