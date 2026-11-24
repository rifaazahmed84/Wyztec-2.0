import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { productRepository as repo } from './repositories/products.js';
import {
  contactSchema,
  enquirySchema,
  submit,
  idempotencySchema,
  clientRateKey,
  SubmissionError,
} from './submissions.js';
import { database } from './database.js';
export const app = express();
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'data:'],
        'frame-src': ['https://maps.google.com', 'https://www.google.com'],
        'script-src': ["'self'"],
        'upgrade-insecure-requests': config.production ? [] : null,
      },
    },
  }),
);
app.use(cors({ origin: (origin, done) => done(null, !origin || config.origins.includes(origin)) }));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', async (_req, res, next) => {
  try {
    await database.health();
    if (!process.env.QUOTE_RATE_LIMIT_SECRET || process.env.QUOTE_RATE_LIMIT_SECRET.length < 32)
      throw new Error('Quote rate limiting is not configured');
    res.json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
});
const querySchema = z.object({
  q: z.string().max(200).optional(),
  brand: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  sort: z.enum(['featured', 'name-asc', 'name-desc', 'brand']).optional(),
});
app.get('/api/products', async (req, res, next) => {
  try {
    res.json({ products: await repo.list(querySchema.parse(req.query)) });
  } catch (e) {
    next(e);
  }
});
app.get('/api/products/:slug', async (req, res, next) => {
  try {
    const product = await repo.bySlug(req.params.slug);
    if (!product)
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});
app.get('/api/categories', async (_req, res, next) => {
  try {
    res.json({ categories: await repo.categories() });
  } catch (error) {
    next(error);
  }
});
app.get('/api/brands', async (_req, res, next) => {
  try {
    res.json({ brands: await repo.brands() });
  } catch (error) {
    next(error);
  }
});
for (const [route, type, schema] of [
  ['/api/contact', 'contact', contactSchema],
  ['/api/enquiries', 'enquiry', enquirySchema],
] as const)
  app.post(route, async (req, res, next) => {
    try {
      res.set('Cache-Control', 'no-store');
      const key = idempotencySchema.safeParse(req.get('Idempotency-Key'));
      if (!key.success)
        throw new SubmissionError(
          'INVALID_IDEMPOTENCY_KEY',
          400,
          'Reload this page and try again. A valid submission key is required.',
        );
      const body = schema.parse(req.body);
      if (body.website)
        throw new SubmissionError(
          'INVALID_REQUEST',
          400,
          'Unable to accept this request. Please contact sales.',
        );
      const receipt = await submit(type, body, key.data, clientRateKey(req));
      res.status(receipt.created ? 201 : 200).json({ ok: true, reference: receipt.reference });
    } catch (e) {
      next(e);
    }
  });
app.use('/api', (_req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'API route not found' } }),
);
app.get('/robots.txt', (_req, res) =>
  res.type('text').send(`User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml`),
);
app.get('/sitemap.xml', async (_req, res, next) => {
  try {
    const urls = [
      '/',
      '/about',
      '/industries',
      '/market-segments',
      '/products',
      '/contact',
      ...(await repo.list({})).map((p) => `/products/${p.slug}`),
    ];
    const base = config.siteUrl.replace(/\/$/, '').replace(/[<>&"']/g, '');
    res
      .type('xml')
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`,
      );
  } catch (error) {
    next(error);
  }
});
// Vercel serves the built frontend from its CDN, separately from this function.
if (config.production && process.env.VERCEL !== '1') {
  const client = path.resolve(fileURLToPath(new URL('../../client/dist', import.meta.url)));
  app.use(express.static(client));
  app.get('*', (_req, res) => res.sendFile(path.join(client, 'index.html')));
}
const errors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SubmissionError) {
    if (error.retryAfter) res.set('Retry-After', String(error.retryAfter));
    return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  }
  if (error instanceof z.ZodError)
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check the highlighted fields.',
        fields: error.flatten().fieldErrors,
      },
    });
  const status = error.status === 413 ? 413 : error instanceof SyntaxError ? 400 : 503;
  console.error('API request failed', { status });
  res.status(status).json({
    error: {
      code:
        status === 413
          ? 'PAYLOAD_TOO_LARGE'
          : status === 400
            ? 'INVALID_JSON'
            : 'SERVICE_UNAVAILABLE',
      message:
        status === 503
          ? 'We could not complete your request. Please contact sales@wyztec.com or try again.'
          : 'Invalid request body.',
    },
  });
};
app.use(errors);
export default app;
