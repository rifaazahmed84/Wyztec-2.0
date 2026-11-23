import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const base = process.env.QA_URL || 'http://localhost:5173';
const expectBadges = process.env.QA_EXPECT_BADGES !== 'false';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
const errors = [];
const results = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
const assert = (value, message) => {
  if (!value) throw new Error(message);
};
await page.addInitScript(() => {
  window.__imageCLS = 0;
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      if (!entry.hadRecentInput) window.__imageCLS += entry.value;
  }).observe({ type: 'layout-shift', buffered: true });
});
await fs.mkdir('.qa', { recursive: true });
try {
  const response = await page.request.get(`${base}/api/products`);
  assert(response.ok(), 'Catalog API failed');
  const { products } = await response.json();
  assert(products.length === 31, 'Expected all 31 catalog products');
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const p of products) {
      const expected = `/images/products/${p.slug}/1.webp`;
      assert(
        p.images[0].src === expected && p.lowRes === true,
        `Unexpected image metadata: ${p.slug}`,
      );
      let release;
      const gate = new Promise((resolve) => {
        release = resolve;
      });
      await page.route(`**${expected}`, async (route) => {
        await gate;
        await route.continue();
      });
      await page.goto(`${base}/products/${p.slug}`, { waitUntil: 'domcontentloaded' });
      const img = page.locator('.gallery-main img');
      await img.waitFor();
      await page.evaluate(() => document.fonts.ready);
      const before = await img.boundingBox();
      assert(before && before.width > 0 && before.height > 0, `Unreserved image area: ${p.slug}`);
      await page.evaluate(() => {
        window.__imageCLS = 0;
      });
      release();
      await page.waitForFunction(() => {
        const image = document.querySelector('.gallery-main img');
        return image?.complete && image.naturalWidth > 0;
      });
      await img.evaluate(async (image) => {
        await image.decode();
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const after = await img.boundingBox();
      const details = await img.evaluate((image) => ({
        src: new URL(image.currentSrc).pathname,
        width: image.naturalWidth,
        height: image.naturalHeight,
        loading: image.loading,
        attrWidth: image.getAttribute('width'),
        attrHeight: image.getAttribute('height'),
        fit: getComputedStyle(image).objectFit,
        background: getComputedStyle(image).backgroundColor,
        cls: window.__imageCLS,
      }));
      assert(
        details.src === expected && details.width === 1200 && details.height === 1200,
        `Photo did not load correctly: ${p.slug}`,
      );
      assert(
        details.loading === 'eager' &&
          details.attrWidth === '1200' &&
          details.attrHeight === '1200',
        `Incorrect detail image attributes: ${p.slug}`,
      );
      assert(
        details.fit === 'contain' && details.background === 'rgb(255, 255, 255)',
        `Incorrect image tile style: ${p.slug}`,
      );
      assert(
        ['x', 'y', 'width', 'height'].every((key) => Math.abs(before[key] - after[key]) < 0.1),
        `Image load moved layout: ${p.slug}`,
      );
      assert(details.cls === 0, `Layout shift while loading ${p.slug}: ${details.cls}`);
      assert(
        (await page.locator('.gallery-main .temporary-image-badge').count()) ===
          Number(expectBadges),
        `Wrong temporary badge visibility: ${p.slug}`,
      );
      await page.unroute(`**${expected}`);
      results.push({
        slug: p.slug,
        viewport: viewport.width,
        dimensions: `${details.width}x${details.height}`,
        imageLoadCLS: details.cls,
      });
    }
  }
  await page.goto(`${base}/products`);
  await page.locator('.product-image img').first().waitFor();
  const cards = await page
    .locator('.product-image img')
    .evaluateAll((images) =>
      images.map((image) => ({
        width: image.getAttribute('width'),
        height: image.getAttribute('height'),
        loading: image.loading,
        fit: getComputedStyle(image).objectFit,
      })),
    );
  assert(
    cards.length &&
      cards.every(
        (image) =>
          image.width === '1200' &&
          image.height === '1200' &&
          image.loading === 'lazy' &&
          image.fit === 'contain',
      ),
    'Incorrect card image geometry / loading',
  );
  assert(
    (await page.locator('.product-image .temporary-image-badge').count()) ===
      (expectBadges ? cards.length : 0),
    'Wrong card temporary badges',
  );
  const first = products[0];
  const expected = `/images/products/${first.slug}/1.webp`;
  await page.route(`**${expected}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/webp',
      body: 'invalid image for fallback verification',
    }),
  );
  await page.goto(`${base}/products/${first.slug}`);
  await page.waitForFunction(() => {
    const image = document.querySelector('.gallery-main img');
    return (
      image?.complete &&
      image.naturalWidth === 1200 &&
      new URL(image.currentSrc).pathname === '/images/products/_placeholder.webp'
    );
  });
  assert(true, 'Fallback loaded');
  await page.unroute(`**${expected}`);
  await page.goto(`${base}/products/marathon-ie4-motor`);
  await page.locator('.gallery-main img').waitFor();
  await page.screenshot({
    path: `.qa/product-images-${expectBadges ? 'development' : 'production'}.png`,
    fullPage: true,
  });
  assert(errors.length === 0, `Browser console errors: ${errors.join('\n')}`);
  await fs.writeFile(
    `.qa/product-image-results-${expectBadges ? 'development' : 'production'}.json`,
    JSON.stringify(
      {
        pages: results.length,
        results,
        fallback: true,
        cardLoading: 'lazy',
        temporaryBadges: expectBadges,
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        pages: results.length,
        imageLoadCLS: 0,
        fallback: true,
        temporaryBadges: expectBadges,
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
