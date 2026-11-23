import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
import assert from 'node:assert/strict';

const base = process.env.QA_URL || 'http://127.0.0.1:5175';
await fs.mkdir('.qa', { recursive: true });
const originalSource = execFileSync(
  'git',
  [
    '-c',
    `safe.directory=${process.cwd().replaceAll('\\', '/')}`,
    'show',
    '3fe9b78:server/src/data/products.ts',
  ],
  { encoding: 'utf8' },
);
await fs.writeFile(
  '.qa/original-products.mjs',
  ts.transpileModule(originalSource, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText,
);
const { products: original } = await import('../.qa/original-products.mjs');
const { products } = await (await fetch(`${base}/api/products`)).json();
const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '');
const retired = original.filter((p) => !products.some((q) => q.slug === p.slug));
assert.equal(retired.length, 16);
const replacements = new Map(
  retired.map((p) => [
    p.slug,
    products.find((q) => q.category === p.category && normalize(q.name) === normalize(p.name))
      ?.slug,
  ]),
);
for (const p of original.filter((p) => !replacements.has(p.slug))) {
  const current = products.find((q) => q.id === p.id);
  // Descriptions and specifications were refreshed; identity and images stay intact.
  for (const key of [
    'id',
    'slug',
    'name',
    'brand',
    'category',
    'images',
    'lowRes',
    'verified',
    'documents',
  ]) {
    assert.deepEqual(current[key], p[key], `Changed ${key}: ${p.slug}`);
  }
  assert.deepEqual(
    current.relatedSlugs,
    p.relatedSlugs.map((slug) => replacements.get(slug) ?? slug),
  );
}
for (const [oldSlug, newSlug] of replacements) {
  assert(newSlug);
  const response = await fetch(`${base}/api/products/${oldSlug}`);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).product.slug, newSlug);
}
const additions = products.filter((p) => Number(p.id.slice(4)) > 27);
assert.equal(additions.length, 20);
assert.equal(new Set(products.map((p) => p.id)).size, 31);
assert.equal(new Set(products.map((p) => p.slug)).size, 31);
for (const p of additions) {
  assert(!JSON.stringify(p).includes('\u2014'), `Unexpected em dash in ${p.name}`);
  assert(p.images.every((img) => img.alt === p.name));
  assert(p.specs.length >= 5 && p.specificationNote, `Missing technical content: ${p.slug}`);
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ reducedMotion: 'reduce' });
const errors = [],
  checks = [];
page.on('pageerror', (err) => errors.push(err.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});
page.on('response', (response) => {
  if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
});
try {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const p of products) {
      await page.goto(`${base}/products/${p.slug}`);
      await page.getByRole('heading', { name: p.name, exact: true, level: 1 }).waitFor();
      assert.equal((await page.locator('.product-overview').textContent()).trim(), p.overview);
      assert.deepEqual(await page.locator('.feature-list li span').allTextContents(), p.features);
      assert.deepEqual(
        await page.locator('.application-list li').allTextContents(),
        p.applications,
      );
      assert.deepEqual(await page.locator('.industry-tags a').allTextContents(), p.industries);
      assert.equal(
        await page.locator('.selection-guide p').first().textContent(),
        p.selectionGuide,
      );
      assert.equal(p.features.length, 4);
      const specificationRows = await page
        .locator('#specifications > .spec-table tbody tr')
        .evaluateAll((rows) =>
          rows.map((row) => ({
            label: row.querySelector('th').textContent,
            value: row.querySelector('td').textContent,
          })),
        );
      assert.deepEqual(
        specificationRows,
        p.specs.map(({ label, value }) => ({ label, value })),
      );
      assert(
        (await page.locator('#specifications .spec-notice').textContent()).includes(
          p.specificationNote,
        ),
      );
      assert.equal(p.applications.length, 4);
      assert(p.industries.length >= 2, `Missing industries: ${p.slug}`);
      for (let i = 0; i < p.images.length; i++) {
        await page
          .getByRole('button', { name: `Show ${p.name} image ${i + 1}`, exact: true })
          .click();
        const img = page.locator('.gallery-main img');
        await img.evaluate(async (el) => {
          await el.decode();
        });
        const state = await img.evaluate((el) => ({
          path: new URL(el.currentSrc).pathname,
          width: el.naturalWidth,
          height: el.naturalHeight,
          fit: getComputedStyle(el).objectFit,
          loading: el.loading,
          attrWidth: el.getAttribute('width'),
          attrHeight: el.getAttribute('height'),
          alt: el.alt,
        }));
        assert.equal(state.path, p.images[i].src);
        assert.equal(state.width, 1200);
        assert.equal(state.height, 1200);
        assert.equal(state.attrWidth, '1200');
        assert.equal(state.attrHeight, '1200');
        assert.equal(state.fit, 'contain');
        assert.equal(state.alt, p.images[i].alt);
        assert.equal(state.loading, i ? 'lazy' : 'eager');
      }
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Horizontal overflow: ${width} ${p.slug}`,
      );
      if (p.modelTable) {
        assert.equal(await page.locator('.product-model-table tbody tr').count(), 5);
        assert.deepEqual(
          await page
            .locator('.product-model-table tbody tr')
            .evaluateAll((rows) =>
              rows.map((row) =>
                [...row.querySelectorAll('th, td')].map((cell) => cell.textContent),
              ),
            ),
          p.modelTable.rows,
        );
        const scroll = await page.locator('.product-model-table').evaluate((el) => ({
          width: el.clientWidth,
          scroll: el.scrollWidth,
          overflow: getComputedStyle(el).overflowX,
        }));
        assert.equal(scroll.overflow, 'auto');
        if (width === 375)
          assert(scroll.scroll > scroll.width, 'Model table should scroll inside its wrapper');
        await page.locator('.product-model-table').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `.qa/new-thermocouples-${width}.png` });
      }
      if (p.slug === 'meknoid-helical-gearbox' || p.slug === 'jumo-flowtrans-mag-h20') {
        await page.locator('#specifications').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `.qa/specifications-${p.slug}-${width}.png` });
      }
      if (p.slug === 'jumo-flowtrans-mag-h20' || p.slug === 'meknoid-marathon-ie3-motor') {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `.qa/${p.slug}-${width}.png` });
      }
      checks.push({ width, slug: p.slug, images: p.images.length });
    }
    // Search all exact names, check reused cards and enquiry action.
    for (const p of products) {
      await page.goto(`${base}/products?q=${encodeURIComponent(p.name)}`);
      const card = page
        .locator('.product-card')
        .filter({ has: page.getByRole('heading', { name: p.name, exact: true }) });
      await card.waitFor();
      const img = card.locator('img');
      await img.scrollIntoViewIfNeeded();
      await img.evaluate(async (el) => {
        await el.decode();
      });
      assert.equal(await img.getAttribute('src'), p.images[0].src);
      assert.equal(await img.getAttribute('loading'), 'lazy');
      assert(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Catalog overflow: ${p.slug} ${width}`,
      );
    }
  }
  for (const industry of new Set(products.flatMap((p) => p.industries))) {
    await page.goto(`${base}/products?industry=${encodeURIComponent(industry)}`);
    const expected = products
      .filter((p) => p.industries.includes(industry))
      .map((p) => p.name)
      .sort();
    await page.locator('.product-card').first().waitFor();
    while (await page.getByRole('button', { name: 'Load more products' }).isVisible()) {
      await page.getByRole('button', { name: 'Load more products' }).click();
    }
    assert.deepEqual(
      (await page.locator('.product-card h3').allTextContents()).sort(),
      expected,
      `Industry filter: ${industry}`,
    );
  }
  await page.goto(`${base}/products?q=BEVEL%20HELICAL%20GEARBOX`);
  const card = page
    .locator('.product-card')
    .filter({ has: page.getByRole('heading', { name: 'BEVEL HELICAL GEARBOX', exact: true }) });
  await card.getByRole('button', { name: /Add to enquiry:/ }).click();
  assert(
    (await page.evaluate(() => JSON.stringify(localStorage))).includes('WYZ-047'),
    'New product not added to enquiry',
  );
  assert.deepEqual(errors, []);
  await fs.writeFile(
    '.qa/additional-products-results.json',
    JSON.stringify(
      {
        retainedOriginals: 11,
        replacements: 16,
        detailChecks: checks.length,
        catalogChecks: 93,
        industryFilters: 8,
        checks,
        errors,
      },
      null,
      2,
    ),
  );
  console.log(
    'PASS: 31 complete products; 16 legacy URLs; 93 detail checks; 93 card checks; 8 industry filters; enquiry action; no console/network errors.',
  );
} finally {
  await browser.close();
}
