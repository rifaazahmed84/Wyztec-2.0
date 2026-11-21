import fs from 'node:fs/promises';
const dir = 'client/public/images';
await fs.mkdir(dir, { recursive: true });
const bodies = {
  motor: `<ellipse cx="369" cy="244" rx="82" ry="105" fill="#364b45"/><path d="M191 151h177v188H191z" fill="#536e63"/><ellipse cx="193" cy="245" rx="73" ry="94" fill="#779084"/><ellipse cx="182" cy="245" rx="43" ry="57" fill="#b4c6bb"/><ellipse cx="182" cy="245" rx="25" ry="34" fill="#536e63"/><path d="M112 234h72v24h-72z" fill="#c7d0c9"/><path d="M220 140v-31h94v41M223 340v25h-33v-26m137 0v26h40v-26" fill="#40594e"/>${Array.from({ length: 11 }, (_, i) => `<path d="M${220 + i * 13} 161v162" stroke="#263f35" stroke-width="5"/>`).join('')}<rect x="237" y="196" width="74" height="36" rx="2" fill="#c4cebe"/>`,
  fan: `<circle cx="295" cy="243" r="128" fill="#435c50"/><circle cx="295" cy="243" r="112" fill="#d4dfd4"/>${Array.from({ length: 7 }, (_, i) => `<path d="M295 243C230 225 209 159 270 148c49-9 36 64 25 95" fill="#718a79" transform="rotate(${i * 51.43} 295 243)"/>`).join('')}<circle cx="295" cy="243" r="30" fill="#314c3d"/><circle cx="295" cy="243" r="14" fill="#bbc9bb"/><path d="M191 340v31h34v-18m135-14v32h35v-28" fill="#435c50"/>`,
  gearbox: `<path d="M176 157l165-31 86 64v133l-171 40-80-62z" fill="#456453"/><path d="M176 157l80 64 171-31-86-64z" fill="#8aa28c"/><path d="M256 221v142l171-40V190z" fill="#5f8069"/><ellipse cx="338" cy="273" rx="44" ry="48" fill="#304c3a"/><ellipse cx="338" cy="273" rx="29" ry="32" fill="#b9c5b8"/><path d="M340 259h103v27H340z" fill="#8a9d8e"/><path d="M197 175v117m24-99v117m50-145l72-14" stroke="#2d4b37" stroke-width="5"/>`,
  pneumatic: `<path d="M151 192l180-34 61 52-177 35z" fill="#bac8bd"/><path d="M151 192v118l64 45V245z" fill="#506757"/><path d="M215 245l177-35v114l-177 31z" fill="#8ca18f"/><path d="M392 247h91v25h-91z" fill="#b7c7ba"/><path d="M242 249v93m29-99v93m29-99v93m29-99v93m29-99v93" stroke="#657f6b" stroke-width="3"/><path d="M158 211l49 34v87l-49-34z" fill="#263f30"/><circle cx="183" cy="270" r="15" fill="#a6bbaa"/>`,
  instrument: `<path d="M201 138l156-21 56 42-154 26z" fill="#9eafa1"/><path d="M201 138v175l58 45V185z" fill="#35523f"/><path d="M259 185l154-26v177l-154 22z" fill="#567961"/><path d="M278 203l112-18v89l-112 18z" fill="#182f24"/><text x="293" y="243" fill="#a2dd83" font-family="monospace" font-size="29">7.02</text><path d="M288 316l86-14m-83 21l86-14" stroke="#bccab9" stroke-width="5"/><path d="M301 348v40h53v-48" fill="#9aafa1"/>`,
};
for (const [family, body] of Object.entries(bodies))
  for (const view of ['overview', 'technical'])
    await fs.writeFile(
      `${dir}/${family}-${view}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 460"><rect width="600" height="460" fill="${view === 'overview' ? '#f1f4ef' : '#e8eee7'}"/><path d="M50 370h500M100 60v350m100-350v350m100-350v350m100-350v350m100-350v350" stroke="#dbe4d9" stroke-width="1"/><g transform="${view === 'technical' ? 'translate(550 0) scale(-.9 1)' : 'translate(0 0)'}">${body}</g><text x="28" y="430" fill="#617261" font-family="Arial,sans-serif" font-size="13" letter-spacing="2">ILLUSTRATIVE PRODUCT VIEW</text></svg>`,
    );
await fs.mkdir('client/src/assets/brands', { recursive: true });
for (const name of [
  'Delta',
  'Klinger',
  'JUMO',
  'John Crane',
  'Grundfos',
  'Lovejoy',
  'Marathon',
  'Siemens',
  'Metal Work',
])
  await fs.writeFile(
    `client/src/assets/brands/${name.toLowerCase().replaceAll(' ', '-')}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 70"><text x="110" y="44" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" font-weight="600" fill="#36483d">${name}</text></svg>`,
  );
