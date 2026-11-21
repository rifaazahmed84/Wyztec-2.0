// One-time brochure crop import. Does not mark these images as official.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const [photoDirectory, fullFlyer] = process.argv.slice(2);
if (!photoDirectory || !fullFlyer)
  throw new Error(
    'Usage: node scripts/seed-temporary-images.mjs <photo-directory> <full-flyer.jpeg>',
  );
const output = fileURLToPath(new URL('../client/public/images/products/', import.meta.url));
const photo = (time, suffix = '') =>
  path.join(photoDirectory, `WhatsApp Image 2026-11-20 at ${time} AM${suffix}.jpeg`);
const crops = [
  ['marathon-ie2-motor', fullFlyer, 46, 155, 132, 90],
  ['marathon-ie3-motor', fullFlyer, 199, 155, 120, 87],
  ['marathon-ie4-motor', fullFlyer, 338, 159, 125, 89],
  ['marathon-crane-duty-motor', fullFlyer, 482, 156, 124, 91],
  ['marathon-tefc-motor', photo('11.58.59', ' (2)'), 132, 685, 244, 160],
  ['marathon-slip-ring-motor', photo('11.58.59', ' (2)'), 402, 680, 240, 169],
  ['marathon-axial-flow-fan', fullFlyer, 107, 318, 161, 105],
  ['marathon-exhaust-fan', photo('11.58.59'), 243, 33, 290, 184],
  ['marathon-centrifugal-fan', photo('11.58.58', ' (2)'), 384, 98, 305, 188],
  ['siemens-induction-motor', photo('11.58.59', ' (1)'), 174, 277, 310, 180],
  ['siemens-ie4-motor', photo('11.58.59', ' (1)'), 682, 300, 185, 133],
  ['siemens-flange-mounting-motor', photo('11.58.58', ' (2)'), 108, 432, 248, 136],
  ['siemens-flameproof-motors', photo('11.58.58', ' (2)'), 512, 419, 222, 145],
  ['premium-transmission-helical-gearbox', photo('11.58.59', ' (1)'), 173, 686, 327, 176],
  ['premium-transmission-crane-duty-gearbox', photo('11.58.59'), 68, 685, 269, 162],
  ['premium-transmission-altra-gearbox', photo('11.58.58', ' (2)'), 79, 767, 310, 165],
  ['premium-transmission-bevel-helical-gearbox', photo('11.58.58', ' (2)'), 483, 756, 290, 171],
  ['metal-work-pneumatic-cylinder', photo('11.58.59', ' (1)'), 165, 993, 270, 153],
  ['metal-work-frl-unit', photo('11.58.59', ' (1)'), 568, 986, 224, 157],
  ['metal-work-pneumatic-fittings', photo('11.58.58'), 255, 636, 223, 139],
  ['metal-work-valve-island', photo('11.58.58', ' (2)'), 240, 1048, 247, 130],
  ['metal-work-solenoid-valve', photo('11.58.58', ' (2)'), 579, 1043, 237, 144],
  ['jumo-ph-sensor', photo('11.58.58', ' (1)'), 264, 820, 42, 120],
  ['jumo-jumo-aquis-touch', photo('11.58.58', ' (1)'), 488, 819, 150, 119],
  ['jumo-jumo-cti-750', photo('11.58.58', ' (1)'), 784, 819, 145, 115],
  ['jumo-flowmeters', photo('11.58.57'), 183, 926, 204, 126],
  ['jumo-paperless-recorders', photo('11.58.57'), 517, 915, 165, 132],
];
// Remove only the bright, low-chroma paper area connected to the crop perimeter.
// Preserve disconnected product highlights rather than applying a global white threshold.
function removePaper(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  const queue = [];
  const add = (index) => {
    if (visited[index]) return;
    visited[index] = 1;
    const offset = index * channels;
    const r = data[offset],
      g = data[offset + 1],
      b = data[offset + 2];
    if (Math.min(r, g, b) > 130 && Math.max(r, g, b) - Math.min(r, g, b) < 70) queue.push(index);
  };
  for (let x = 0; x < width; x++) {
    add(x);
    add((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    add(y * width);
    add(y * width + width - 1);
  }
  for (let i = 0; i < queue.length; i++) {
    const index = queue[i],
      offset = index * channels;
    data[offset] = data[offset + 1] = data[offset + 2] = 255;
    const x = index % width,
      y = Math.floor(index / width);
    if (x > 0) add(index - 1);
    if (x < width - 1) add(index + 1);
    if (y > 0) add(index - width);
    if (y < height - 1) add(index + width);
  }
  return data;
}
const thumbs = [];
for (const [slug, source, left, top, width, height] of crops) {
  const destination = path.join(output, slug, '1.webp');
  const exists = await fs.access(destination).then(
    () => true,
    () => false,
  );
  if (!exists || process.argv.includes('--overwrite')) {
    const raw = await sharp(source)
      .extract({ left, top, width, height })
      .removeAlpha()
      .toColourspace('srgb')
      .raw()
      .toBuffer({ resolveWithObject: true });
    const clean = removePaper(raw.data, width, height, raw.info.channels);
    const image = await sharp(clean, { raw: { width, height, channels: raw.info.channels } })
      .resize({ width: 960, height: 960, fit: 'inside' })
      .png()
      .toBuffer({ resolveWithObject: true });
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await sharp(image.data)
      .extend({
        left: Math.floor((1200 - image.info.width) / 2),
        right: Math.ceil((1200 - image.info.width) / 2),
        top: Math.floor((1200 - image.info.height) / 2),
        bottom: Math.ceil((1200 - image.info.height) / 2),
        background: '#fff',
      })
      .webp({ quality: 80 })
      .toFile(destination);
  }
  const label = Buffer.from(
    `<svg width="240" height="46"><rect width="240" height="46" fill="white"/><text x="8" y="24" font-size="10" font-family="Arial">${slug}</text></svg>`,
  );
  thumbs.push({
    input: await sharp(destination)
      .resize(240, 240)
      .extend({ top: 0, left: 0, right: 0, bottom: 46, background: '#fff' })
      .composite([{ input: label, top: 240, left: 0 }])
      .png()
      .toBuffer(),
    left: (thumbs.length % 5) * 240,
    top: Math.floor(thumbs.length / 5) * 286,
  });
  console.log(`Temporary: ${slug}/1.webp`);
}
await fs.mkdir('.qa', { recursive: true });
await sharp({
  create: {
    width: 1200,
    height: Math.ceil(thumbs.length / 5) * 286,
    channels: 3,
    background: '#fff',
  },
})
  .composite(thumbs)
  .png()
  .toFile('.qa/product-contact-sheet.png');
