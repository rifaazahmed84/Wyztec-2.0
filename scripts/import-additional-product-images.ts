import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { additionalProductSources } from '../server/src/data/additional-products.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const report = [];
for (const product of additionalProductSources) {
  for (const [index, source] of product.sourceImages.entries()) {
    const input = await readFile(path.join(root, 'incoming-assets/product_images', source));
    const meta = await sharp(input).metadata();
    if (!meta.width || !meta.height) throw new Error(`Missing dimensions: ${source}`);
    // At most 2x Lanczos enlargement, no cropping, retouching or label changes.
    const scale = Math.min(2, 1000 / Math.max(meta.width, meta.height));
    const width = Math.round(meta.width * scale);
    const height = Math.round(meta.height * scale);
    const output = `client/public/images/products/${product.slug}/${index + 1}.webp`;
    const destination = path.join(root, output);
    let exists = false;
    try {
      await access(destination);
      exists = true;
    } catch {
      /* New asset. */
    }
    if (exists) throw new Error(`Refusing to overwrite existing asset: ${output}`);
    await mkdir(path.dirname(destination), { recursive: true });
    await sharp(input)
      .rotate()
      .resize(width, height, { fit: 'contain', kernel: 'lanczos3' })
      .flatten({ background: '#ffffff' })
      .extend({
        left: Math.floor((1200 - width) / 2),
        right: Math.ceil((1200 - width) / 2),
        top: Math.floor((1200 - height) / 2),
        bottom: Math.ceil((1200 - height) / 2),
        background: '#ffffff',
      })
      .webp({ quality: 90 })
      .toFile(destination);
    report.push({
      name: product.name,
      source,
      output,
      originalWidth: meta.width,
      originalHeight: meta.height,
      scale,
    });
  }
}
await mkdir(path.join(root, '.qa'), { recursive: true });
await writeFile(
  path.join(root, '.qa/additional-image-import.json'),
  JSON.stringify(report, null, 2),
);
console.table(report);
