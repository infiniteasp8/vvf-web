/**
 * Prepares the brand assets from the Foundation's logo file.
 *
 *   node scripts/brand.mjs <logo.jpg|png> [--circle cx,cy,r]
 *
 * Writes src/assets/brand/logo.png   – the whole logo with the white background removed
 *        src/assets/brand/emblem.png – the round emblem alone (for favicons and app icons)
 * Then run `npm run icons` to re-render the favicons, app icons and public/brand/.
 *
 * --circle gives the centre and radius of the emblem in pixels of the source
 * file. Leave it out to keep the current emblem.png.
 */
import sharp from 'sharp';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const src = args.find((a) => !a.startsWith('--'));
if (!src) {
  console.error('usage: node scripts/brand.mjs <logo file> [--circle cx,cy,r]');
  process.exit(1);
}
const circleArg = args.includes('--circle') ? args[args.indexOf('--circle') + 1] : '';
const outDir = resolve(root, 'src/assets/brand');

const { data, info } = await sharp(src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const minc = (i) => Math.min(data[i * 3], data[i * 3 + 1], data[i * 3 + 2]);

// 1. Ignore dark borders some exports carry on one edge.
const rowMean = (y) => {
  let s = 0;
  for (let x = 0; x < W; x++) s += minc(y * W + x);
  return s / W;
};
const colMean = (x) => {
  let s = 0;
  for (let y = 0; y < H; y++) s += minc(y * W + x);
  return s / H;
};
let top = 0;
let bottom = H - 1;
let left = 0;
let right = W - 1;
while (top < H && rowMean(top) < 120) top++;
while (bottom > 0 && rowMean(bottom) < 120) bottom--;
while (left < W && colMean(left) < 120) left++;
while (right > 0 && colMean(right) < 120) right--;

// 2. Flood-fill the exterior from the edges. A loose threshold also catches the
//    anti-aliased fringe, which is then made semi-transparent and de-haloed.
//    Anything lighter than WHITE counts as background (JPEG whites sit at 248–254).
const T = 190;
const WHITE = 243;
const exterior = new Uint8Array(W * H);
const queue = new Int32Array(W * H);
let head = 0;
let tail = 0;
const push = (x, y) => {
  const i = y * W + x;
  if (!exterior[i] && minc(i) >= T) {
    exterior[i] = 1;
    queue[tail++] = i;
  }
};
for (let x = left; x <= right; x++) {
  push(x, top);
  push(x, bottom);
}
for (let y = top; y <= bottom; y++) {
  push(left, y);
  push(right, y);
}
while (head < tail) {
  const i = queue[head++];
  const x = i % W;
  const y = (i / W) | 0;
  if (x > left) push(x - 1, y);
  if (x < right) push(x + 1, y);
  if (y > top) push(x, y - 1);
  if (y < bottom) push(x, y + 1);
}

const rgba = Buffer.alloc(W * H * 4);
let minX = W;
let minY = H;
let maxX = 0;
let maxY = 0;
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
for (let y = top; y <= bottom; y++) {
  for (let x = left; x <= right; x++) {
    const i = y * W + x;
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    let a = 255;
    if (exterior[i]) {
      const w = Math.min(r, g, b);
      a = clamp(255 * Math.min(1, Math.max(0, (WHITE - w) / (WHITE - T))));
    }
    const o = i * 4;
    if (a > 0 && a < 255) {
      const k = a / 255;
      rgba[o] = clamp((r - WHITE * (1 - k)) / k);
      rgba[o + 1] = clamp((g - WHITE * (1 - k)) / k);
      rgba[o + 2] = clamp((b - WHITE * (1 - k)) / k);
    } else {
      rgba[o] = r;
      rgba[o + 1] = g;
      rgba[o + 2] = b;
    }
    rgba[o + 3] = a;
    if (a > 12) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

const pad = 4;
const region = {
  left: Math.max(left, minX - pad),
  top: Math.max(top, minY - pad),
  width: Math.min(right, maxX + pad) - Math.max(left, minX - pad) + 1,
  height: Math.min(bottom, maxY + pad) - Math.max(top, minY - pad) + 1,
};
const base = sharp(rgba, { raw: { width: W, height: H, channels: 4 } });
await base.clone().extract(region).png({ compressionLevel: 9 }).toFile(resolve(outDir, 'logo.png'));
console.log(`wrote src/assets/brand/logo.png (${region.width}×${region.height})`);

// 3. The round emblem: a circular cut-out around the given centre.
if (circleArg) {
  const [cx, cy, r] = circleArg.split(',').map(Number);
  const size = 2 * r;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r}" fill="#fff"/></svg>`,
  );
  await base
    .clone()
    .extract({ left: cx - r, top: cy - r, width: size, height: size })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png({ compressionLevel: 9 })
    .toFile(resolve(outDir, 'emblem.png'));
  console.log(`wrote src/assets/brand/emblem.png (${size}×${size})`);
}
