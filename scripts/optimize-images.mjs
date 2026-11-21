import sharp from 'sharp';
for (const name of ['industrial-hero', 'industrial-engineer']) {
  await sharp(`client/public/images/${name}.jpg`)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(`client/public/images/${name}.webp`);
  console.log(`Optimized ${name}`);
}
