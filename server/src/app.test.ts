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
  it('serves every complete product with unique IDs and slugs', async () => {
    const response = await request(app).get('/api/products').expect(200);
    expect(response.body.products).toHaveLength(27);
    expect(new Set(products.map((p) => p.slug)).size).toBe(27);
    expect(new Set(products.map((p) => p.id)).size).toBe(27);
    for (const p of products) {
      expect(p.verified).toBe(false);
      expect(p.specs.length).toBeGreaterThanOrEqual(8);
      expect(p.features.length).toBeGreaterThanOrEqual(4);
      expect(p.images.length).toBeGreaterThanOrEqual(1);
      expect(p.images[0].src).toMatch(new RegExp(`^/images/products/${p.slug}/[1-9]\\d*\\.webp$`));
      expect(p.images[0].alt).toContain(p.name);
      expect(p.selectionGuide).toBeTruthy();
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
    expect(response.body.products).toHaveLength(4);
    expect(response.body.products[0].name).toBe('Induction Motor');
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
    expect((await request(app).get('/api/brands')).body.brands).toHaveLength(5);
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
