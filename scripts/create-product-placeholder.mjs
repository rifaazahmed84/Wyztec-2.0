import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const directory = fileURLToPath(new URL('../client/public/images/products/', import.meta.url));
await fs.mkdir(directory, { recursive: true });
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="white"/><g fill="#c4cec1" transform="translate(450 410)"><path d="M0 0h72v232C26 232 0 199 0 159zM114 0h72v232h-72zM228 0h72v159c0 40-26 73-72 73z"/></g><text x="600" y="741" text-anchor="middle" fill="#596553" font-family="Arial,sans-serif" font-weight="600" font-size="55" letter-spacing="7">WYZTEC</text><text x="600" y="803" text-anchor="middle" fill="#697363" font-family="Arial,sans-serif" font-size="28">Product image unavailable</text></svg>`;
await fs.writeFile(path.join(directory, '_placeholder.svg'), svg);
try {
  await fs.access(path.join(directory, '_placeholder.webp'));
} catch {
  await sharp(Buffer.from(svg))
    .webp({ quality: 80 })
    .toFile(path.join(directory, '_placeholder.webp'));
}
