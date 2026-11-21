import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const base = process.env.QA_URL || 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const failures = [];
const checks = [];
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
const assert = (ok, message) => {
  if (!ok) throw Error(message);
  checks.push(message);
};
await fs.mkdir('.qa', { recursive: true });
try {
  await page.goto(base);
  await page.getByRole('heading', { name: /Your Partner in Reliable/ }).waitFor();
  assert((await page.title()).includes('Wyztec'), 'Home title and hero render');
  await page.screenshot({ path: '.qa/home-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Next slide', exact: true }).click();
  assert(
    (await page.locator('h1').innerText()).includes('Innovating Today'),
    'Carousel controls change slides',
  );
  await page.getByRole('tab', { name: 'Water Treatment', exact: true }).click();
  assert(
    (await page.getByRole('tabpanel').innerText()).includes('filtration'),
    'Industry selector changes content',
  );
  for (const route of [
    '/',
    '/products',
    '/about',
    '/industries',
    '/market-segments',
    '/contact',
    '/products/marathon-ie4-motor',
    '/not-a-page',
  ]) {
    await page.goto(base + route);
    await page.locator('h1').waitFor();
    await page.waitForTimeout(350);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    if (results.violations.length)
      failures.push({
        route,
        violations: results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.map((n) => n.target),
        })),
      });
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `Desktop has no horizontal overflow: ${route}`,
    );
  }
  await page.goto(base + '/products');
  await page.getByRole('article').first().waitFor();
  assert((await page.getByRole('article').count()) === 9, 'Catalog initially shows nine products');
  await page.getByRole('button', { name: 'Load more products' }).click();
  assert((await page.getByRole('article').count()) === 18, 'Catalog loads more products');
  await page.getByLabel('Brand', { exact: true }).selectOption('Siemens');
  await page.waitForURL(/brand=Siemens/);
  await page.getByText('4 products found', { exact: true }).waitFor();
  assert((await page.getByRole('article').count()) === 4, 'Brand filter updates URL and results');
  await page.reload();
  await page.getByText('4 products found', { exact: true }).waitFor();
  assert(
    (await page.getByLabel('Brand', { exact: true }).inputValue()) === 'Siemens',
    'Shared filter survives reload',
  );
  await page.getByRole('button', { name: 'Clear all filters', exact: true }).click();
  await page.getByText('27 products found', { exact: true }).waitFor();
  await page.getByRole('searchbox').fill('no-such-product');
  await page.getByRole('heading', { name: 'No matching products.' }).waitFor();
  assert(true, 'Live search has a useful empty state');
  await page.goto(base + '/products/marathon-ie4-motor');
  await page.getByRole('heading', { name: 'IE4 Motor', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Show IE4 Motor image 1', exact: true }).click();
  assert(
    (await page.locator('.gallery-main img').getAttribute('src')).includes('/products/marathon-ie4-motor/1.webp'),
    'Product gallery shows the catalog photo',
  );
  await page.getByRole('button', { name: 'Add to enquiry', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: /Open enquiry list, 1 products/ }).click();
  await page.getByRole('dialog').waitFor();
  assert(
    (await page.getByRole('dialog').getByText('IE4 Motor', { exact: true }).count()) === 1,
    'Enquiry persists across reload',
  );
  await page.getByLabel('Quantity', { exact: true }).fill('3');
  await page.getByLabel('Notes for IE4 Motor').fill('400 V, B3 mounting');
  await page.getByRole('dialog').getByRole('button', { name: 'Send enquiry', exact: true }).click();
  assert(
    (await page.getByRole('dialog').getByText('This field is required.').count()) > 0,
    'Enquiry form validates missing fields',
  );
  const drawer = page.getByRole('dialog');
  for (const [label, value] of [
    [/Full name/, 'Browser QA'],
    [/Phone number/, '+971551264045'],
    [/Email address/, 'qa@example.com'],
    [/Company name/, 'QA Test Company'],
    [/How can we help/, 'Please quote three motors for testing.'],
  ])
    await drawer.getByLabel(label).fill(value);
  await drawer.getByRole('button', { name: 'Send enquiry', exact: true }).click();
  await drawer.getByRole('heading', { name: 'Request saved locally' }).waitFor();
  assert(true, 'Enquiry sends through API and keeps the success receipt visible');
  await page.keyboard.press('Escape');
  assert((await page.getByRole('dialog').count()) === 0, 'Drawer closes with Escape');
  await page.goto(base + '/contact');
  await page.locator('h1').waitFor();
  const form = page.locator('.contact-form');
  for (const [label, value] of [
    [/Full name/, 'Callback QA'],
    [/Phone number/, '+971551264045'],
    [/Email address/, 'qa@example.com'],
    [/Company name/, 'QA Test Company'],
    [/How can we help/, 'Please call back about our application.'],
  ])
    await form.getByLabel(label).fill(value);
  await form.getByRole('button', { name: 'Call Back', exact: true }).click();
  await page.getByRole('heading', { name: 'Request saved locally' }).waitFor();
  assert(true, 'Contact callback submits through API');
  const data = await (await page.request.get(base + '/api/products')).json();
  for (const p of data.products) {
    await page.goto(base + '/products/' + p.slug);
    await page.getByRole('heading', { name: p.name, exact: true }).first().waitFor();
    assert(
      (await page.getByRole('table').count()) === 1,
      `Detail renders technical table: ${p.slug}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/products', '/products/marathon-ie4-motor', '/contact']) {
    await page.goto(base + route);
    await page.locator('h1').waitFor();
    await page.waitForTimeout(200);
    assert(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `Mobile has no horizontal overflow: ${route}`,
    );
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    if (result.violations.length)
      failures.push({
        route,
        mobile: true,
        violations: result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      });
    if (route === '/') await page.screenshot({ path: '.qa/home-mobile.png', fullPage: true });
    if (route === '/products')
      await page.screenshot({ path: '.qa/catalog-mobile.png', fullPage: true });
  }
  await page.goto(base);
  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Products', exact: true }).click();
  await page.waitForURL('**/products');
  assert((await page.getByRole('dialog').count()) === 0, 'Mobile menu routes and closes correctly');
  await page.getByRole('button', { name: 'Filters', exact: true }).click();
  await page.getByLabel('Brand', { exact: true }).selectOption('JUMO');
  await page.getByText('5 products found', { exact: true }).waitFor();
  assert(true, 'Mobile filters work');
  assert(consoleErrors.length === 0, 'Browser has no uncaught JavaScript errors');
  await fs.writeFile(
    '.qa/browser-results.json',
    JSON.stringify({ checks, accessibility: failures, consoleErrors }, null, 2),
  );
  console.log(
    JSON.stringify(
      { checks: checks.length, accessibilityViolations: failures, consoleErrors },
      null,
      2,
    ),
  );
  if (failures.length) process.exitCode = 1;
} catch (error) {
  await page.screenshot({ path: '.qa/failure.png', fullPage: true });
  await fs.writeFile(
    '.qa/browser-results.json',
    JSON.stringify({ checks, failures, error: error.stack, consoleErrors }, null, 2),
  );
  console.error(error);
  process.exitCode = 1;
} finally {
  await browser.close();
}
