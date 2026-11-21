import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import { productRepository as repo } from './repositories/products.js';
import { contactSchema, enquirySchema, submit } from './submissions.js';
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
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
const querySchema = z.object({
  q: z.string().max(200).optional(),
  brand: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  sort: z.enum(['featured', 'name-asc', 'name-desc', 'brand']).optional(),
});
app.get('/api/products', (req, res, next) => {
  try {
    res.json({ products: repo.list(querySchema.parse(req.query)) });
  } catch (e) {
    next(e);
  }
});
app.get('/api/products/:slug', (req, res) => {
  const product = repo.bySlug(req.params.slug);
  if (!product)
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Product not found' } });
  res.json({ product });
});
app.get('/api/categories', (_req, res) => res.json({ categories: repo.categories() }));
app.get('/api/brands', (_req, res) => res.json({ brands: repo.brands() }));
const limit = rateLimit({
  windowMs: 60000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      error: { code: 'RATE_LIMIT', message: 'Too many requests. Please try again in a minute.' },
    }),
});
app.post('/api/contact', limit, async (req, res, next) => {
  try {
    const body = contactSchema.parse(req.body);
    if (body.website) return res.json({ ok: true });
    const receipt = await submit('contact', body);
    res.status(201).json({ ok: true, ...receipt });
  } catch (e) {
    next(e);
  }
});
app.post('/api/enquiries', limit, async (req, res, next) => {
  try {
    const body = enquirySchema.parse(req.body);
    if (body.website) return res.json({ ok: true });
    if (body.items.some((i) => !repo.byId(i.productId)))
      return res.status(400).json({
        error: { code: 'INVALID_PRODUCT', message: 'One or more products are unavailable.' },
      });
    const summary = body.items
      .map(
        (i) =>
          `${repo.byId(i.productId)!.brand} ${repo.byId(i.productId)!.name} (${i.productId}) × ${i.quantity}\n${i.notes}`,
      )
      .join('\n\n');
    const receipt = await submit('enquiry', body, summary);
    res.status(201).json({ ok: true, ...receipt });
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
app.get('/sitemap.xml', (_req, res) => {
  const urls = [
    '/',
    '/about',
    '/industries',
    '/market-segments',
    '/products',
    '/contact',
    ...repo.list({}).map((p) => `/products/${p.slug}`),
  ];
  const base = config.siteUrl.replace(/\/$/, '').replace(/[<>&"']/g, '');
  res
    .type('xml')
    .send(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${base}${u}</loc></url>`).join('')}</urlset>`,
    );
});
// Vercel routes frontend traffic to the independently built client service.
if (config.production && process.env.VERCEL !== '1') {
  const client = path.resolve(fileURLToPath(new URL('../../client/dist', import.meta.url)));
  app.use(express.static(client));
  app.get('*', (_req, res) => res.sendFile(path.join(client, 'index.html')));
}
const errors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof z.ZodError)
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Please check the highlighted fields.',
        fields: error.flatten().fieldErrors,
      },
    });
  const status = error.status === 413 ? 413 : error instanceof SyntaxError ? 400 : 503;
  console.error(error instanceof Error ? error.message : 'Request failed');
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
