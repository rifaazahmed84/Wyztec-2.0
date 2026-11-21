import { mkdir, readdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import ts from 'typescript';
import { products, type Product } from '../server/src/data/products.js';

type ImageOverrides = Record<string, Pick<Product, 'images' | 'lowRes'>>;
const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url));
const WHITE = '#ffffff';

/** Read only literal metadata; never evaluate or rewrite unrelated catalog code. */
function readLiteral(node: ts.Expression): unknown {
  if (ts.isObjectLiteralExpression(node)) {
    return Object.fromEntries(
      node.properties.map((property) => {
        if (!ts.isPropertyAssignment(property) || ts.isComputedPropertyName(property.name)) {
          throw new Error('Image overrides must contain literal properties.');
        }
        return [property.name.text, readLiteral(property.initializer)];
      }),
    );
  }
  if (ts.isArrayLiteralExpression(node))
    return node.elements.map((element) => readLiteral(element));
  if (ts.isStringLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  throw new Error('Image overrides must use strings, booleans, arrays and objects only.');
}

function findOverrides(source: string) {
  const file = ts.createSourceFile('products.ts', source, ts.ScriptTarget.Latest, true);
  let initializer: ts.Expression | undefined;
  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'productImageOverrides'
    )
      initializer = node.initializer;
    ts.forEachChild(node, visit);
  }
  visit(file);
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error('Cannot find the literal productImageOverrides object in products.ts.');
  }
  return {
    start: initializer.getStart(file),
    end: initializer.getEnd(),
    overrides: readLiteral(initializer) as ImageOverrides,
  };
}

export async function processImages({
  projectRoot = PROJECT_ROOT,
  catalog = products,
}: { projectRoot?: string; catalog?: Product[] } = {}) {
  const incoming = path.join(projectRoot, 'client/public/images/incoming');
  const output = path.join(projectRoot, 'client/public/images/products');
  const dataFile = path.join(projectRoot, 'server/src/data/products.ts');
  const source = await readFile(dataFile, 'utf8');
  const metadata = findOverrides(source);
  const overrides: ImageOverrides = { ...metadata.overrides };
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  for (const [slug, override] of Object.entries(overrides)) {
    if (
      !bySlug.has(slug) ||
      override.lowRes !== false ||
      !Array.isArray(override.images) ||
      !override.images.length ||
      override.images.some(
        (image) =>
          typeof image.alt !== 'string' ||
          !new RegExp(`^/images/products/${slug}/[1-9]\\d*\\.webp$`).test(image.src),
      )
    ) {
      throw new Error(`Invalid existing image override for ${slug}; no files were changed.`);
    }
  }
  await mkdir(incoming, { recursive: true });
  const files = (await readdir(incoming, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && /\.(jpe?g|png|webp)$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort();
  const planned = files.map((name) => {
    const match = /^(.*)_([1-9]\d*)\.(jpe?g|png|webp)$/i.exec(name);
    if (!match || !bySlug.has(match[1]) || !Number.isSafeInteger(Number(match[2]))) {
      throw new Error(
        `Invalid incoming filename: ${name}. Use an exact catalog slug followed by _<positive number>.jpg|png|webp. No files were changed.`,
      );
    }
    return { name, slug: match[1], number: Number(match[2]), product: bySlug.get(match[1])! };
  });
  const destinations = new Set<string>();
  for (const input of planned) {
    const destination = `${input.slug}/${input.number}.webp`;
    if (destinations.has(destination))
      throw new Error(`Multiple incoming files target ${destination}; no files were changed.`);
    destinations.add(destination);
  }
  // Decode the complete batch before touching outputs or catalog metadata.
  const converted = [];
  for (const input of planned) {
    const resized = await sharp(await readFile(path.join(incoming, input.name)), {
      failOn: 'error',
    })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
      .flatten({ background: WHITE })
      .toBuffer({ resolveWithObject: true });
    const horizontal = 1200 - resized.info.width;
    const vertical = 1200 - resized.info.height;
    const buffer = await sharp(resized.data)
      .extend({
        left: Math.floor(horizontal / 2),
        right: Math.ceil(horizontal / 2),
        top: Math.floor(vertical / 2),
        bottom: Math.ceil(vertical / 2),
        background: WHITE,
      })
      .webp({ quality: 80 })
      .toBuffer();
    converted.push({ ...input, buffer });
    const src = `/images/products/${input.slug}/${input.number}.webp`;
    const image = {
      src,
      alt: `${input.product.brand} ${input.product.name} — product view ${input.number}`,
    };
    const current = overrides[input.slug]?.images ?? [];
    overrides[input.slug] = {
      images: [...current.filter((entry) => entry.src !== src), image].sort(
        (a, b) => Number(path.basename(a.src, '.webp')) - Number(path.basename(b.src, '.webp')),
      ),
      lowRes: false,
    };
  }
  for (const image of converted) {
    const directory = path.join(output, image.slug);
    await mkdir(directory, { recursive: true });
    const destination = path.join(directory, `${image.number}.webp`);
    await writeFile(`${destination}.tmp`, image.buffer);
    await rename(`${destination}.tmp`, destination);
    console.log(
      `Processed ${image.name} -> ${image.slug}/${image.number}.webp (1200×1200, WebP q80)`,
    );
  }
  if (converted.length) {
    const updated =
      source.slice(0, metadata.start) +
      JSON.stringify(overrides, null, 2) +
      source.slice(metadata.end);
    await writeFile(`${dataFile}.tmp`, updated, 'utf8');
    await rename(`${dataFile}.tmp`, dataFile);
  }
  const remaining = catalog.filter((p) => overrides[p.slug]?.lowRes !== false).map((p) => p.slug);
  console.log(
    `\nOfficial image report: ${catalog.length - remaining.length}/${catalog.length} products ready; ${remaining.length} still need official images.`,
  );
  for (const slug of remaining) console.log(`  - ${slug}`);
  if (!converted.length) console.log('No incoming images found. Catalog unchanged.');
  return { processed: converted.length, remaining };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  processImages().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
