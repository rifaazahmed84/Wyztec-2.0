import fs from 'node:fs/promises';
await fs.mkdir('client/public/fonts', { recursive: true });
const files = [
  [
    'https://wyztec.com/wp-content/uploads/2024/06/Main-slider-2-image.jpg',
    'client/public/images/industrial-hero.jpg',
  ],
  [
    'https://wyztec.com/wp-content/uploads/2024/07/Slide-1.jpg',
    'client/public/images/industrial-engineer.jpg',
  ],
  [
    'https://cdn.jsdelivr.net/fontsource/fonts/inter:vf@latest/latin-wght-normal.woff2',
    'client/public/fonts/inter-latin-variable.woff2',
  ],
];
for (const [url, file] of files) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw Error(`${file}: ${res.status}`);
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
  console.log(`Saved ${file}`);
}
