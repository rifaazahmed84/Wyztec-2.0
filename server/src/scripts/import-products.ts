import { access, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { products } from '../data/products.js';
import { getDatabaseClient, productRow } from '../database.js';

// Default: audit only. Repeatable apply inserts missing IDs and preserves staff edits.
const apply = process.argv.includes('--apply');
const report = { products: products.length, missing: [] as string[], review: [] as string[] };
for (const p of products) {
  for (const field of ['name', 'brand', 'category', 'tagline', 'overview'] as const)
    if (!p[field]?.trim()) report.missing.push(`${p.slug}: ${field}`);
  for (const field of ['specs', 'features', 'applications', 'industries', 'images'] as const)
    if (!p[field]?.length) report.missing.push(`${p.slug}: ${field}`);
  for (const image of p.images) {
    if (!image.alt.trim()) report.missing.push(`${p.slug}: image alt text`);
    if (image.src.startsWith('/images/')) {
      try {
        await access(fileURLToPath(new URL(`../../../client/public${image.src}`, import.meta.url)));
      } catch {
        report.missing.push(`${p.slug}: missing image ${image.src}`);
      }
    }
  }
  if (!p.verified)
    report.review.push(`${p.slug}: specifications require manufacturer/model verification`);
  if (p.lowRes) report.review.push(`${p.slug}: temporary image flag retained`);
  if (!p.documents?.length) report.review.push(`${p.slug}: no downloadable manufacturer datasheet`);
}
const content = JSON.stringify(report, null, 2) + '\n';
await writeFile(
  fileURLToPath(new URL('../../../CATALOG-IMPORT-REPORT.json', import.meta.url)),
  content,
);
console.info(content);
if (report.missing.length) throw new Error('Catalog audit failed; no products imported.');
if (apply) {
  const url = new URL(process.env.SUPABASE_URL || 'http://missing');
  const local = ['127.0.0.1', 'localhost'].includes(url.hostname);
  const index = process.argv.indexOf('--confirm-project-ref');
  if (!local && (index < 0 || process.argv[index + 1] !== url.hostname.split('.')[0]))
    throw new Error(
      'Hosted import requires --confirm-project-ref matching SUPABASE_URL. Obtain deployment approval first.',
    );
  const { error } = await getDatabaseClient()
    .from('products')
    .upsert(products.map(productRow), { onConflict: 'id', ignoreDuplicates: true });
  if (error)
    throw new Error(`Catalog import failed (${error.code}); existing records are preserved.`);
  console.info(
    `Imported missing products. Existing IDs, staff edits and publication settings preserved. Target: ${url.hostname}`,
  );
} else console.info('Audit only. Use --apply to import after applying the SQL migration.');
