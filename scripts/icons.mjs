/**
 * Renders the favicons, app icons and the public copy of the logo from the
 * brand assets in src/assets/brand/. Run after `node scripts/brand.mjs …`:
 *
 *   npm run icons
 */
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const emblem = await readFile(resolve(root, 'src/assets/brand/emblem.png'));
const logo = await readFile(resolve(root, 'src/assets/brand/logo.png'));
const iconsDir = resolve(root, 'public/icons');
const brandDir = resolve(root, 'public/brand');
await mkdir(iconsDir, { recursive: true });
await mkdir(brandDir, { recursive: true });

const paper = '#FAF6EE';

/** The emblem scaled to `inner` px, centred on a `size` px canvas. */
async function badge(size, inner, background) {
  const disc = await sharp(emblem).resize(inner, inner, { fit: 'contain' }).png().toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: disc, gravity: 'centre' }])
    .png()
    .toBuffer();
}

const out = async (name, buffer) => {
  await writeFile(resolve(iconsDir, name), buffer);
  console.log(`wrote public/icons/${name}`);
};

// Transparent discs for tabs and the manifest's "any" icons.
for (const size of [32, 48, 96, 192, 512]) {
  await out(size <= 96 ? `favicon-${size}.png` : `icon-${size}.png`, await badge(size, size));
}
// Apple ignores transparency, and maskable icons need a safe zone: paper background.
await out('apple-touch-icon.png', await badge(180, 150, paper));
await out('icon-512-maskable.png', await badge(512, 400, paper));

// favicon.ico holding the 32 and 48 px PNGs (PNG-in-ICO is supported everywhere).
const icoImages = await Promise.all([32, 48].map((s) => badge(s, s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoImages.length, 4);
const entries = [];
let offset = 6 + 16 * icoImages.length;
icoImages.forEach((png, i) => {
  const size = [32, 48][i];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(offset, 12);
  entries.push(entry);
  offset += png.length;
});
await writeFile(
  resolve(root, 'public/favicon.ico'),
  Buffer.concat([header, ...entries, ...icoImages]),
);
console.log('wrote public/favicon.ico');

// The full logo for structured data and for anyone who needs it (press, partners).
await sharp(logo)
  .resize({ width: 1024 })
  .png({ compressionLevel: 9 })
  .toFile(resolve(brandDir, 'logo.png'));
await sharp(emblem)
  .resize(512, 512)
  .png({ compressionLevel: 9 })
  .toFile(resolve(brandDir, 'emblem.png'));
console.log('wrote public/brand/logo.png and public/brand/emblem.png');
