import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm, access } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import sharp from 'sharp';
import { products } from '../server/src/data/products.js';
import { processImages } from './process-images.js';

const fixtures: string[] = [];
async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), 'wyztec-images-'));
  fixtures.push(root);
  await mkdir(path.join(root, 'server/src/data'), { recursive: true });
  const source =
    "// Preserve specs and copy.\nconst productImageOverrides: Record<string, Pick<Product, 'images' | 'lowRes'>> = {};\nconst unrelated = 'Do not change';\n";
  await writeFile(path.join(root, 'server/src/data/products.ts'), source);
  const incoming = path.join(root, 'client/public/images/incoming');
  await mkdir(incoming, { recursive: true });
  return { root, incoming, source, data: path.join(root, 'server/src/data/products.ts') };
}
async function image(file: string, width = 900, height = 300) {
  await sharp({ create: { width, height, channels: 4, background: '#cc2020' } })
    .png()
    .toFile(file);
}
afterEach(async () => {
  vi.restoreAllMocks();
  for (const directory of fixtures.splice(0)) {
    if (!path.resolve(directory).startsWith(path.resolve(tmpdir()) + path.sep))
      throw new Error('Unexpected test directory');
    await rm(directory, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
});
describe('Official product image pipeline', () => {
  it('reports all temporary products without changing the catalog when incoming is empty', async () => {
    const f = await fixture();
    const report = await processImages({ projectRoot: f.root });
    expect(report.processed).toBe(0);
    expect(report.remaining).toHaveLength(27);
    expect(await readFile(f.data, 'utf8')).toBe(f.source);
  });
  it('creates a white 1200px square without upscaling and updates only matching image metadata', async () => {
    const f = await fixture();
    const p = products[0];
    await image(path.join(f.incoming, `${p.slug}_1.png`));
    const report = await processImages({ projectRoot: f.root });
    expect(report.remaining).toHaveLength(26);
    expect(report.remaining).not.toContain(p.slug);
    const file = path.join(f.root, `client/public/images/products/${p.slug}/1.webp`);
    const buffer = await readFile(file);
    expect(await sharp(buffer).metadata()).toMatchObject({
      width: 1200,
      height: 1200,
      format: 'webp',
    });
    const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
    const pixel = (x: number, y: number) => [
      ...data.subarray(
        (y * info.width + x) * info.channels,
        (y * info.width + x) * info.channels + 3,
      ),
    ];
    expect(pixel(0, 0).every((channel) => channel > 248)).toBe(true);
    expect(pixel(110, 600).every((channel) => channel > 248)).toBe(true); // 150px margin: no enlargement.
    expect(pixel(600, 600)[0]).toBeGreaterThan(180);
    const source = await readFile(f.data, 'utf8');
    expect(source).toContain('"lowRes": false');
    expect(source).toContain(`${p.name} — product view 1`);
    expect(source).toContain("const unrelated = 'Do not change';");
    expect(source).not.toContain(products[1].slug);
    await access(path.join(f.incoming, `${p.slug}_1.png`)); // Originals are retained.
  });
  it('orders multiple views numerically, preserves previous official views, and is idempotent', async () => {
    const f = await fixture();
    const p = products[0];
    for (const n of [10, 2, 1]) await image(path.join(f.incoming, `${p.slug}_${n}.png`));
    await processImages({ projectRoot: f.root });
    const first = await readFile(f.data, 'utf8');
    expect(first.indexOf('/1.webp')).toBeLessThan(first.indexOf('/2.webp'));
    expect(first.indexOf('/2.webp')).toBeLessThan(first.indexOf('/10.webp'));
    await processImages({ projectRoot: f.root });
    expect(await readFile(f.data, 'utf8')).toBe(first);
    await image(path.join(f.incoming, `${products[1].slug}_1.png`));
    const report = await processImages({ projectRoot: f.root });
    expect(report.remaining).toHaveLength(25);
    expect(await readFile(f.data, 'utf8')).toContain(`${p.slug}/10.webp`);
  });
  it('rejects an unknown slug before writing output or metadata', async () => {
    const f = await fixture();
    await image(path.join(f.incoming, 'not-a-catalog-slug_1.png'));
    await expect(processImages({ projectRoot: f.root })).rejects.toThrow(
      'Invalid incoming filename',
    );
    expect(await readFile(f.data, 'utf8')).toBe(f.source);
  });
  it('rejects duplicate output numbers and corrupt inputs without promoting a product', async () => {
    const duplicate = await fixture();
    const p = products[0];
    await image(path.join(duplicate.incoming, `${p.slug}_1.png`));
    await image(path.join(duplicate.incoming, `${p.slug}_1.jpg`));
    await expect(processImages({ projectRoot: duplicate.root })).rejects.toThrow(
      'Multiple incoming files',
    );
    expect(await readFile(duplicate.data, 'utf8')).toBe(duplicate.source);
    const corrupt = await fixture();
    await image(path.join(corrupt.incoming, `${p.slug}_1.png`));
    await writeFile(path.join(corrupt.incoming, `${p.slug}_2.webp`), 'not an image');
    await expect(processImages({ projectRoot: corrupt.root })).rejects.toThrow();
    expect(await readFile(corrupt.data, 'utf8')).toBe(corrupt.source);
    await expect(
      access(path.join(corrupt.root, `client/public/images/products/${p.slug}/1.webp`)),
    ).rejects.toThrow();
  });
});
