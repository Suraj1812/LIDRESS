/** Prepare tight transparent cutouts. Run after replacing the source garment assets. */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const imageDirectory = fileURLToPath(
  new URL('../frontend/public/images/', import.meta.url),
);
const filenames = [
  'check-shirt.webp',
  'graphic-tee.webp',
  'plaid-shirt.webp',
  'summer-shirt.webp',
  'henley.png',
  'cotton-jacket.png',
  'denim-jacket.png',
];

for (const filename of filenames) {
  const source = path.join(imageDirectory, filename);
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const hasTransparency = data.some((value, index) => index % 4 === 3 && value < 255);
  if (!hasTransparency) {
    // Remove only light background connected to the edges, keeping white fabric intact.
    const visited = new Uint8Array(width * height);
    const queue = [];
    for (let x = 0; x < width; x++) queue.push(x, (height - 1) * width + x);
    for (let y = 0; y < height; y++) queue.push(y * width, y * width + width - 1);
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const pixel = queue[cursor];
      if (visited[pixel]) continue;
      visited[pixel] = 1;
      const offset = pixel * 4;
      const channels = [data[offset], data[offset + 1], data[offset + 2]];
      if (
        Math.min(...channels) < 225 ||
        Math.max(...channels) - Math.min(...channels) > 24
      )
        continue;
      data[offset + 3] = 0;
      const x = pixel % width;
      const y = Math.floor(pixel / width);
      if (x > 0) queue.push(pixel - 1);
      if (x < width - 1) queue.push(pixel + 1);
      if (y > 0) queue.push(pixel - width);
      if (y < height - 1) queue.push(pixel + width);
    }
  }
  let left = width,
    top = height,
    right = 0,
    bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }
  const buffer = await sharp(data, { raw: { width, height, channels: 4 } })
    .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
    .resize({ width: 900, height: 1100, fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();
  const destination = path.join(imageDirectory, `${path.parse(filename).name}.png`);
  await sharp(buffer).toFile(destination);
  console.log(`Prepared ${path.basename(destination)}`);
}
