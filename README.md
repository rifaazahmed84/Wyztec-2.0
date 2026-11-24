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

| Setting          | Value                                     |
| ---------------- | ----------------------------------------- |
| Root Directory   | Repository root (leave the setting blank) |
| Framework Preset | Vite                                      |
| Install Command  | npm ci --include=dev                      |
| Build Command    | npm run build                             |
| Output Directory | client/dist                               |

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

**Supabase setup required before deployment:** apply the approved migration, import the catalog, and configure the server credentials and shared rate-limit secret. Quote requests and limits now use PostgreSQL, with no local-file persistence. See [SUPABASE-SETUP.txt](SUPABASE-SETUP.txt) for exact migration, account-access and Vercel deployment steps. Production migrations and deployment require owner approval.

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
  src/submissions.ts         Validation, idempotency, shared limits and sales notification
  src/database.ts            Server-only Supabase adapter and product mapping
  src/scripts/               Repeatable catalog import and read-only access checks
  src/app.ts                 API, security, sitemap and production SPA serving
  src/index.ts               Server entry point
supabase/migrations/        Versioned schema, RLS, grants and atomic quote transaction
scripts/                    Asset preparation, optimization and browser / Lighthouse QA
```

## Environment

Copy root `.env.example` to `.env` only if it does not already exist. Supabase and SMTP keys are server-only; never use a `VITE_` prefix for secrets. For the public canonical URL, copy `client/.env.example` to `client/.env.local` and set `VITE_SITE_URL`. Vercel receives all configuration through Project Settings > Environment Variables.

| Variable                                | Purpose                                                                 |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `SUPABASE_URL`                          | Supabase project URL                                                    |
| `SUPABASE_PUBLISHABLE_KEY`              | Published catalog reads and read-only permission checks                 |
| `SUPABASE_SECRET_KEY`                   | Privileged server key; saves quotes and imports products                |
| `QUOTE_RATE_LIMIT_SECRET`               | Random value of at least 32 characters, identical on every API instance |
| `SITE_URL`, `VITE_SITE_URL`             | Matching public website origins for server and client metadata          |
| `CORS_ORIGIN`                           | Comma-separated allowed browser origins                                 |
| `PORT`, `HOST`, `NODE_ENV`              | Standalone Express settings; no Vercel overrides needed                 |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Optional SMTP transport (587/false by default)                          |
| `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`   | Optional SMTP authentication and approved sender                        |
| `SALES_EMAIL`                           | Fixed sales inbox, defaults to sales@wyztec.com                         |

A quote succeeds after the database confirms the save. Missing or failed SMTP never loses an enquiry; staff review `notification_status` in Supabase Dashboard. A database failure preserves the form and offers a retry. With no Supabase configuration, development supports catalog preview only; it cannot accept quote requests. Production requires Supabase.

See [SUPABASE-SETUP.txt](SUPABASE-SETUP.txt) for value sources, local database setup, migration/import commands, staff workflows and deployment approval boundaries.

## Products and technical review

`server/src/data/products.ts` exports the full `Product` type and assembles the active catalog. It combines the original seeds with `additional-products.ts`, resolves the 16 replacements in `product-replacements.ts`, and applies the editorial fields from `product-content.ts` and technical fields from `product-specifications.ts`. There are 31 active products. Existing URLs and enquiry IDs for replaced products resolve to the newer records. These files are the initial import source and offline development preview. Once configured, the live API reads published products from Supabase. Run `npm run db:catalog` to audit without writing, then follow the approved import steps. Repeat imports insert missing IDs and preserve existing staff edits. Manage live content in the Supabase Dashboard; local seed edits do not overwrite existing database rows.

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

Both POST routes require an `Idempotency-Key` UUID header. Contact JSON fields: `name`, `phone`, `email`, `company`, `message`, and the empty `website` honeypot. Enquiries additionally require `items: [{ productId, quantity, notes }]`. Quantity is an integer from 1 to 9999. Products are validated against the server repository; user-supplied product names are not trusted.

Failures use `{ error: { code, message, fields? } }`. Bodies are limited to 32 KB. Successful new saves return HTTP 201 with `{ ok: true, reference }`; identical retries return HTTP 200 with the same reference. Reusing a key with changed data returns 409. Product publication and quantities are validated before acceptance; product snapshots and the request are saved atomically. Both submission routes share a PostgreSQL limit of five new requests per minute per HMACed IP (IPv6 /64); retries do not consume it. Honeypot-filled requests are rejected without inventing a success receipt.

`quote_requests`, `quote_request_items` and rate-limit rows are private, with RLS and no browser grants. There is no public enquiry lookup or product mutation route. Authorized staff manage products and requests in Supabase Dashboard. Email is sent only to the fixed sales inbox after the save; failed or missing email delivery leaves the request available for review. Do not embed customer details in analytics.

## Deployment

Use the existing single Vercel project at the repository root. No persistent disk or Supabase Edge Function is needed: `api/index.mjs` deploys the Express backend alongside the Vite frontend. Its 60-second function budget covers bounded database and SMTP operations.

Follow [SUPABASE-SETUP.txt](SUPABASE-SETUP.txt) for exact local/staging/production migration, catalog import, environment and website deployment commands. Obtain approval before hosted migrations, catalog imports or live deployments (including a Git push that triggers Vercel). The URL/publishable key alone cannot apply migrations or save private requests.

## Verification

The Supabase quote implementation passes 35 automated tests plus desktop/mobile browser checks using the actual migration in isolated PostgreSQL. `npm run test:quotes:browser` (after a build, with Chrome installed) tests product selection, quantity, confirmation visibility and a deliberately lost response followed by a retry, verifying exactly one database record. It never loads the local `.env`, contacts Supabase or sends mail. See [CATALOG-IMPORT-REPORT.json](CATALOG-IMPORT-REPORT.json) for preserved content-review flags.

`npm test` runs client interaction tests, Supertest API tests and image-pipeline tests. These check completeness of all 31 active records, editorial coverage, legacy product URLs, combined filters, every detail endpoint, security headers, validation, spam handling, rate limiting, atomic PostgreSQL saves, duplicate/retry handling, shared rate limits, SQL grants/RLS, SMTP success/failure, form recovery, persisted-basket parsing, and drawer focus restoration.

For browser QA, start `npm run dev`, install Chrome, then run:

```sh
npm run test:browser
```

This checks desktop/mobile overflow, WCAG A/AA rules using axe, carousel, industry selector, filter persistence, load more, gallery, all 27 detail pages, form validation, API-backed enquiry and callback submissions, mobile menu and filters. It writes screenshots and a result file to ignored `.qa/`. The legacy browser harness predates this Supabase workflow; use only a local/staging database and an approved test inbox. Do not point it at a live sales endpoint. The current quote-flow regression checks are in `server/src/quotes.test.ts` and `client/src/components/flows.test.tsx`.

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
| Persistent basket, quantity / notes, email and private Supabase enquiries     | `context/Enquiry.tsx`, server submission service                  |
| About / Industries / Segments / Contact / 404                                 | `pages/ContentPage.tsx`, `NotFound.tsx`                           |
| Address, phone, emails and Google map                                         | `config.ts`, `ContentPage.tsx`                                    |
| Reduced motion, keyboard support, focus trap, labels, announcements           | `styles.css`, carousel, selector, overlay and form components     |
| Lazy images with dimensions, WebP photos, preloaded local font                | Shared image components, `index.html`, `public`                   |
| Canonicals, metadata, Open Graph, Product / Organization schema               | `SEO.tsx`, Home and product pages                                 |
| Sitemap / robots, production static serving and SPA fallback                  | `server/src/app.ts`                                               |
| Analytics integration point with no trackers                                  | `client/src/analytics.ts`                                         |
| Unit / API / browser / accessibility / performance checks                     | Test files and `scripts`                                          |

Before launch, supply **approved photography, official logos, actual datasheets, verified product specifications, SMTP credentials, official social URLs, and a confirmed exact office map location**. Complete a real email-delivery test on the deployed host.
