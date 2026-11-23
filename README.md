# Wyztec Solutions FZ-LLC

A responsive React 18 + TypeScript corporate website and B2B industrial product catalog, backed by a Node.js / Express API. No prices or checkout: customers build a persistent product enquiry and request a technical offer.

## Run locally

Use Node.js **22.12+** (Node 24 LTS recommended) and npm. From the repository root:

```sh
npm install
cp .env.example .env
npm run dev
```

PowerShell alternatives: `Copy-Item .env.example .env`; use `npm.cmd` if execution policy blocks `npm.ps1`.

- Website: http://127.0.0.1:5173
- API: http://localhost:3001/api/health
- Vite proxies `/api` to Express. The production Express server serves the built client and API together.

```sh
npm run typecheck
npm test
npm run lint
npm run build
npm start
```

`npm start` explicitly enables production serving on port 3001. It does not depend on the calling shell's `NODE_ENV` syntax. To stop either server, press Ctrl+C.

## Single-project Vercel deployment

Import the repository root as one Vercel project, not client and server separately.
The root vercel.json builds both workspaces and serves client/dist as the frontend.
The api/index.mjs function exports the compiled Express app without a listener.
There is no Services configuration and no internal binding.

| Setting | Value |
| --- | --- |
| Root Directory | Repository root (leave the setting blank) |
| Framework Preset | Vite |
| Install Command | npm ci --include=dev |
| Build Command | npm run build |
| Output Directory | client/dist |

Remove conflicting dashboard overrides and the old Services configuration.
Import the repository root as a single project if the previous service layout
persists in the existing project.

Use the root lockfile and `npm ci --include=dev`, not `--legacy-peer-deps`.
The client declares TypeScript, Node types, and Testing Library DOM explicitly
so clean builds do not depend on packages installed incidentally by another workspace.

Requests to /api, /api/*, /robots.txt and /sitemap.xml go to Express. Static
assets come from the frontend output; other website routes use index.html for
React Router. Browser API requests remain same-origin. Local npm run dev is unchanged.

For Vercel local checks, run npm.cmd run build first (to compile the API), then
npx.cmd vercel@latest dev --listen 3100. Login and project linking are required.
Check /api/health, /api/products, a product page opened directly, a product image,
/robots.txt, /sitemap.xml, and an unknown API route (JSON 404).

Set SITE_URL, VITE_SITE_URL (build-time), CORS_ORIGIN and SMTP variables in Vercel
settings. Align the canonical URLs and CORS origin with the public domain.
Never expose SMTP credentials using a VITE_ prefix.

**Launch blocker:** enquiry logging still writes local JSON before sending mail.
Migrate to durable database storage before live use on Vercel Functions; /tmp
is not persistent storage. Configure and test SMTP too. The memory rate limiter
is per instance, not a global limit. Catalog browsing requires no writable storage.

Reference: https://vercel.com/docs/frameworks/frontend/vite

## Structure

```text
client/
  public/images/             Local WebP photos and illustrative SVG product views
  public/fonts/              Self-hosted Inter variable font
  src/assets/                Wyztec SVG wordmark and plain-text brand placeholders
  src/components/            Layout, carousel, reusable sections, forms, drawer, SEO
  src/context/Enquiry.tsx    Validated localStorage enquiry state
  src/data/taxonomy.ts       Industry and market segment descriptions
  src/pages/                 Lazy-loaded route components
  src/styles.css            Design tokens and responsive styles
  src/config.ts             Company details, canonical URL and social profiles
server/
  src/data/products.ts       Product type and assembled 31-product catalog
  src/data/additional-products.ts  New product identities, photos and supplied specifications
  src/data/product-content.ts     Descriptions, features, applications and industry tags
  src/data/product-specifications.ts  Buyer-guide specifications and model-scope notes
  src/data/product-replacements.ts Legacy URLs for replaced duplicate products
  src/repositories/          Replaceable data access boundary
  src/submissions.ts         Validation, serialized JSON log, SMTP and acknowledgement
  src/app.ts                 API, security, sitemap and production SPA serving
  src/index.ts               Server entry point
  data/                     Private runtime submissions (gitignored)
scripts/                    Asset preparation, optimization and browser / Lighthouse QA
```

## Environment

Copy the root `.env.example` to `.env`. Keep secrets out of version control.

| Variable                 | Purpose                                                                             |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `PORT`                   | Express port, default `3001`                                                        |
| `HOST`                   | Optional binding; defaults to loopback in dev and `0.0.0.0` in production           |
| `NODE_ENV`               | `development` or `production`; the start script also enables production explicitly  |
| `CORS_ORIGIN`            | Comma-separated exact allowed browser origins; default `http://localhost:5173`      |
| `SITE_URL`               | Public absolute site URL for server sitemap and robots                              |
| `SMTP_HOST`              | SMTP server hostname                                                                |
| `SMTP_PORT`              | SMTP port; default `587`                                                            |
| `SMTP_SECURE`            | `true` for implicit TLS, commonly port `465`; otherwise STARTTLS                    |
| `SMTP_USER`, `SMTP_PASS` | SMTP authentication credentials                                                     |
| `SMTP_FROM`              | Approved sender identity; default `Wyztec <sales@wyztec.com>`                       |
| `SALES_EMAIL`            | Internal destination; default `sales@wyztec.com`                                    |
| `SUBMISSIONS_DIR`        | Optional absolute persistent writable directory; default `server/data`              |
| `VITE_SITE_URL`          | Optional client canonical URL, read at build time; defaults to `https://wyztec.com` |

Add `VITE_SITE_URL` to `client/.env.production` when deploying to a different domain. It is public configuration, not a secret. Keep `SITE_URL` in the root server `.env` aligned with it.

Without SMTP configuration, **development** saves a submission and returns `delivery: "development"`. The UI explicitly says that it was saved locally and email was not sent. In **production**, requests without working SMTP return a service error; the website remains available and the submission record is retained. The basket stays intact when submission fails. Sales delivery and the customer acknowledgement are tested using a mocked SMTP transport; real delivery requires your credentials.

## Products and technical review

`server/src/data/products.ts` exports the full `Product` type and assembles the active catalog. It combines the original seeds with `additional-products.ts`, resolves the 16 replacements in `product-replacements.ts`, and applies the editorial fields from `product-content.ts` and technical fields from `product-specifications.ts`. There are 31 active products. Existing URLs and enquiry IDs for replaced products resolve to the newer records. The repository module provides the API boundary for a future database adapter.

Edit descriptions, card taglines, key features, applications, industry tags and selection guidance in `server/src/data/product-content.ts`, using the active product slug as the key. All 31 entries have four features and four applications; the detail page displays up to four applications. Use the existing industry names from `client/src/data/taxonomy.ts` so filters remain consistent. Manufacturer sources and model-specific limits are documented in [PRODUCT-CONTENT-SOURCES.txt](PRODUCT-CONTENT-SOURCES.txt).

Edit current specifications in `server/src/data/product-specifications.ts`. Each entry replaces the old defaults in full and includes a `specificationNote` explaining its model or family scope. The supplied buyer guide supports 29 entries; generic Flowmeters and Paperless Recorders still require their own model data and show selection requirements instead of guessed numerical ratings. [PRODUCT-SPECIFICATIONS-REVIEW.txt](PRODUCT-SPECIFICATIONS-REVIEW.txt) maps products to guide pages and records qualifications. The source PDF is preserved under `incoming-assets/specifications/` for review, not served as a public download. Keep test conditions, units and variant limits with each value; do not change `verified` merely because a family figure was supplied.

To add a product:

1. Add an entry in `server/src/data/additional-products.ts` with an unused ID, unique stable slug, exact name, brand and category. Add the matching `product-specifications.ts` entry with supplied model data and a scope note; do not infer ratings from a photo or an unrelated family. Keep new products distinct from replacements; map an old slug in `product-replacements.ts` only when deliberately replacing that record.
2. Add a matching entry in `product-content.ts` with a specific overview, short tagline, four features, four applications, relevant industry tags and selection guidance. Record the source and any model limitations in `PRODUCT-CONTENT-SOURCES.txt`. Add photos under `client/public/images/products/<slug>/` or use the official-image workflow below, with descriptive alt text.
3. Add actual document files under `client/public/documents` and their URLs to `documents`. Keep this list empty until those files exist; no download controls are displayed for an empty list.
4. Supply active related slugs as needed. Update the visible catalog totals and QA count expectations when adding or removing records, then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`. With the dev server running, set `QA_URL` to its frontend address and run `node scripts/verify-additional-products.mjs` to review descriptions, images, filters and layouts at phone, tablet and desktop widths.
5. Validate the **exact model** against its manufacturer datasheet before setting `verified: true`. Rebuild and run tests; update catalog counts and the completeness test when the catalog size changes.

Every active record remains `verified: false`. Technical tables now distinguish supplied family/model references, worked rating examples and selection requirements through their scope notes. They do not establish stock availability, guaranteed performance, hazardous-area certification or compatibility. The flameproof entry requires the exact approval documents. The buyer guide identifies the Altra ALM worm family, while the individual unit size and order code still need confirmation.

The original flyer supplied product names; the later 14-page buyer guide supplies the technical references now used. Its ratings and examples are mapped in `PRODUCT-SPECIFICATIONS-REVIEW.txt`. All quoted order codes and options still require manufacturer review for the actual application.

## Assets and company configuration

- `client/src/assets/logo.svg`: recreated three-bar Wyztec wordmark.
- `client/src/assets/brands/*.svg`: **plain text placeholders**, not recreated official logos. Replace them with approved official brand assets.
- `client/public/images/industrial-hero.webp` and `industrial-engineer.webp`: locally stored photos obtained from the existing Wyztec site; replace with approved high-resolution photography before launch. The original JPGs remain available as conversion inputs. `npm run optimize:images` creates optimized WebP files.
- Product photos are temporary brochure crops, stored as 1200×1200 WebP files in `client/public/images/products/<slug>/1.webp`. All 27 products have `lowRes: true`; development builds label them “Temporary image”. Production hides that badge. The original family SVGs are retained but are no longer used by the catalog.
- Font: Inter, locally hosted under the SIL Open Font License; see `client/public/fonts/OFL.txt`.
- Company contact details are in `client/src/config.ts`; no supplier-company contact details are included.
- `socialLinks` is intentionally empty. Supply official LinkedIn, X, Facebook and Instagram URLs to render live links. No dead `#` social buttons are shown.
- Home statistics are those supplied in the brief: 100+ brands, 500+ happy customers, 75 team members and 4 offices. Confirm they remain current before launch.
- The map identifies the Al Hamra Industrial Zone, not an independently verified office pin. Replace the embed / search URL with your exact office location if available.

### Import official product images

Drop official manufacturer images into `client/public/images/incoming/` using the exact product slug and a view number, for example:

```text
siemens-ie4-motor_1.jpg
siemens-ie4-motor_2.png
```

Run from the repository root:

```sh
npm run process:images
```

`scripts/process-images.ts` auto-orients images, scales down to fit within 1200px without enlarging small originals, centers them on an opaque white 1200×1200 canvas, and writes WebP quality 80 files to `client/public/images/products/<slug>/<n>.webp`. It updates only the `productImageOverrides` literal in `server/src/data/products.ts`, adds descriptive alt text, and explicitly sets `lowRes: false` for the imported products. Specifications and `verified` are unchanged. A product's first official import replaces its temporary gallery; later imports merge/replace views by number in numeric order. Remove replaced photos from `incoming/` when preparing a different batch; input originals are never deleted by the script and are gitignored. The dev server reloads catalog changes; rebuild and restart production after an import.

Unknown slugs, invalid filenames, duplicate destination numbers, or unreadable images fail the batch before catalog updates. The report lists every product still awaiting official imagery. Running it on an empty incoming directory only prints the report. `npm run test:images` tests conversion, metadata updates, idempotence and failure handling in isolated temporary directories.

Cards and galleries use the shared `ProductImage` component: explicit 1200×1200 dimensions, white contain-fit tiles, lazy loading except the first detail image, and an error fallback to `/images/products/_placeholder.webp`. The neutral placeholder's SVG source is alongside its WebP export; `node scripts/create-product-placeholder.mjs` recreates a missing WebP without overwriting an existing one.

With the development server running, `npm run verify:images` checks all 27 detail pages on desktop and mobile, deliberately delays photo requests to compare image-box geometry and image-load layout shifts, tests the fallback, and checks console errors. To verify a running production build, set `QA_URL` to its address and `QA_EXPECT_BADGES=false`; the check then verifies that temporary-image badges are absent. Results are saved under `.qa/product-image-results-*.json`. This reports shifts during image loading, rather than claiming to measure every possible navigation or interaction shift.

Image integration verification passed for all 27 products at desktop and mobile widths in both development and production (108 page checks total): 1200×1200 photos loaded, image-load CLS was zero, fallback worked, and no browser console errors were recorded. Temporary badges were present in development and absent in production. All 20 client/API/pipeline tests, strict TypeScript checks, lint and the production build passed.

## API

| Method | Path                          | Behavior                                                              |
| ------ | ----------------------------- | --------------------------------------------------------------------- |
| GET    | `/api/health`                 | Health status                                                         |
| GET    | `/api/products`               | `{ products }`; supports `q`, `brand`, `category`, `industry`, `sort` |
| GET    | `/api/products/:slug`         | `{ product }`, or structured 404                                      |
| GET    | `/api/categories`             | `{ categories }`                                                      |
| GET    | `/api/brands`                 | `{ brands }`                                                          |
| POST   | `/api/contact`                | Validated callback request                                            |
| POST   | `/api/enquiries`              | Validated contact + product quantities / notes                        |
| GET    | `/sitemap.xml`, `/robots.txt` | Generated from the current product repository in Express              |

Sort options are `featured`, `name-asc`, `name-desc`, and `brand`. Exact brand / category / industry filters combine with case-insensitive search. The client synchronizes filters to URL parameters and loads cards incrementally.

Contact JSON fields: `name`, `phone`, `email`, `company`, `message`, and the empty `website` honeypot. Enquiries additionally require `items: [{ productId, quantity, notes }]`. Quantity is an integer from 1 to 9999. Products are validated against the server repository; user-supplied product names are not trusted.

Failures use `{ error: { code, message, fields? } }`. Requests are limited to 32 KB. Both submission routes share a limit of five requests / minute / IP. Honeypot-filled requests are silently discarded. Do not embed personal data in analytics; `client/src/analytics.ts` is an inactive integration point.

The JSON log uses a serialized write queue and atomic file replacement for a **single Node process**. It is private and never exposed by Express. Persist it on a durable disk, restrict filesystem access, set a suitable retention policy, and move it to a transactional database before running multiple server replicas. Failed SMTP sends remain logged with a delivery status; operators can follow up manually. A failed acknowledgement is logged separately after sales delivery, avoiding an incorrect retry of an already delivered sales request.

## Deployment

Use a Node host that supports a persistent disk and SMTP, such as a VM or a Node web service. This Express app is not a static-only deployment or a Cloudflare Worker.

1. Install from the lockfile: `npm ci`.
2. Configure production variables, SMTP, exact `CORS_ORIGIN`, and `SITE_URL`. Configure `client/.env.production` if changing canonical host.
3. Run `npm run build` and launch `npm start` under a process supervisor.
4. Expose `PORT` behind HTTPS. Confirm `/api/health`, a direct product URL, `/sitemap.xml`, and a real test enquiry.
5. Mount `SUBMISSIONS_DIR` on persistent storage. Never publish this folder or `.env`.
6. If behind a reverse proxy, configure Express `trust proxy` **only for the known proxy topology** before relying on per-customer IP rate limits. The default does not trust arbitrary forwarded headers. Multiple replicas also require a shared rate-limit store and transactional submission storage.

Security uses Helmet with a self-only script policy, explicit map iframe origins, strict allowed CORS origins, bounded JSON bodies, Zod validation, honeypot and rate limiting. SMTP is server-only. Real account credentials, deliverability, host/network configuration and domain ownership cannot be verified from this repository.

## Verification

`npm test` runs client interaction tests, Supertest API tests and image-pipeline tests. These check completeness of all 31 active records, editorial coverage, legacy product URLs, combined filters, every detail endpoint, security headers, validation, spam handling, rate limiting, concurrent logging, SMTP success/failure, form recovery, persisted-basket parsing, and drawer focus restoration.

For browser QA, start `npm run dev`, install Chrome, then run:

```sh
npm run test:browser
```

This checks desktop/mobile overflow, WCAG A/AA rules using axe, carousel, industry selector, filter persistence, load more, gallery, all 27 detail pages, form validation, API-backed enquiry and callback submissions, mobile menu and filters. It writes screenshots and a result file to ignored `.qa/`. It creates clearly named QA submissions in the local dev log; do not point it at a live sales endpoint.

For production Lighthouse, build and start the production app, then run:

```sh
npm run test:lighthouse
```

The script audits Home, Products and a representative product detail page with Lighthouse's mobile settings. Override `QA_URL` and `CHROME_PATH` as needed. Reports are written to `.qa/`. Performance scores are measurements of the tested environment, not guarantees for future hosts, content or third-party map availability.

Verification on this workstation: the client/API suites passed 14 tests; browser QA passed 56 functional/layout checks with no reported WCAG A/AA violations or uncaught JavaScript errors. Lighthouse returned 97–100 accessibility, 100 best practices and 100 SEO on the initial production checks. **Performance remains unverified:** both installed Chrome and Edge returned the Lighthouse trace error `NO_NAVSTART`; a null performance score is treated as a failed audit, not as a passing score. Re-run `npm run test:lighthouse` on the deployment host to establish whether the requested 90+ performance target is met.

## Requirement checklist

| Requirement                                                                   | Implementation                                                    |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| React 18, Vite, strict TypeScript, Router, Framer Motion, Lucide, Helmet SEO  | `client/package.json`, `src/main.tsx`; route-level lazy imports   |
| Node, Express, TypeScript, Zod, Helmet, CORS, rate limit, Nodemailer, dotenv  | `server/src`                                                      |
| Root workspaces and concurrent dev, build/start, ESLint, Prettier             | Root `package.json`, lint / formatting config                     |
| Brand green, accessible text shade, light theme, 8px spacing, thin borders    | `client/src/styles.css` tokens; sparse dark hero / proof / footer |
| Local SVG wordmark, mobile drawer, sticky nav, complete footer                | `assets/logo.svg`, `components/Layout.tsx`                        |
| Exact three hero headlines, autoplay/pause/hover/focus, controls, dots, touch | `components/Hero.tsx`                                             |
| Company, mission, vision, values, why choose, count-up proof                  | `components/Sections.tsx`                                         |
| Eight industry selectors with icons, descriptions, filtered links             | `data/taxonomy.ts`, `IndustrySection`                             |
| Seven market segments and relevant catalog links / sourcing enquiry           | `SegmentsSection`                                                 |
| Nine placeholder brand wordmarks, slow pausable marquee                       | `assets/brands`, `BrandsSection`                                  |
| Validated callback form, loading/success/error, honeypot                      | `components/ContactForm.tsx`                                      |
| WhatsApp, back to top, real quote drawer                                      | `Layout.tsx`, `Overlay.tsx`, `EnquiryDrawer.tsx`                  |
| All 27 flyer products, complete details, unverified parameters                | `server/src/data/products.ts`; no supplier contact details        |
| Search, URL filters, sort, skeletons, empty/retry state, load more            | `pages/Products.tsx`                                              |
| Gallery, specs, applications, selection guide, documents when provided        | `pages/ProductDetail.tsx`                                         |
| Product RFQ, related carousel, structured data, per-product SEO               | `ProductDetail.tsx`, `components/SEO.tsx`                         |
| Persistent basket, quantity / notes, email and private JSON log               | `context/Enquiry.tsx`, server submission service                  |
| About / Industries / Segments / Contact / 404                                 | `pages/ContentPage.tsx`, `NotFound.tsx`                           |
| Address, phone, emails and Google map                                         | `config.ts`, `ContentPage.tsx`                                    |
| Reduced motion, keyboard support, focus trap, labels, announcements           | `styles.css`, carousel, selector, overlay and form components     |
| Lazy images with dimensions, WebP photos, preloaded local font                | Shared image components, `index.html`, `public`                   |
| Canonicals, metadata, Open Graph, Product / Organization schema               | `SEO.tsx`, Home and product pages                                 |
| Sitemap / robots, production static serving and SPA fallback                  | `server/src/app.ts`                                               |
| Analytics integration point with no trackers                                  | `client/src/analytics.ts`                                         |
| Unit / API / browser / accessibility / performance checks                     | Test files and `scripts`                                          |

Before launch, supply **approved photography, official logos, actual datasheets, verified product specifications, SMTP credentials, official social URLs, and a confirmed exact office map location**. Complete a real email-delivery test on the deployed host.
