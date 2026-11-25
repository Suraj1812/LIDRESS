/** Build clearly labelled detail views from full-resolution catalogue photography.
 * Original source angles are kept. Detail crops are never called alternate angles.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const root = fileURLToPath(new URL('../', import.meta.url));
const catalogPath = path.join(root, 'shared/products.json');
const products = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
const cropRegions = [
  { label: 'Upper detail', left: 0, top: 0, width: 1, height: 0.75 },
  { label: 'Lower detail', left: 0, top: 0.25, width: 1, height: 0.75 },
  { label: 'Left detail', left: 0, top: 0, width: 0.75, height: 1 },
  { label: 'Right detail', left: 0.25, top: 0, width: 0.75, height: 1 },
  { label: 'Centre close-up', left: 0.125, top: 0.125, width: 0.75, height: 0.75 },
  { label: 'Full product detail', left: 0.05, top: 0.05, width: 0.9, height: 0.9 },
];
let photoCount = 0;
for (const [index, product] of products.entries()) {
  const targetCount = index < 20 ? 7 : 6;
  const source = path.join(root, 'frontend/public', product.images[0]);
  const metadata = await sharp(source).metadata();
  if (
    !metadata.width ||
    !metadata.height ||
    Math.max(metadata.width, metadata.height) < 500
  )
    throw new Error(`Source too small: ${product.title}`);
  product.images = product.images
    .filter((image) => !image.includes('-detail-'))
    .slice(0, targetCount);
  product.imageLabels = product.images.map((_, imageIndex) =>
    imageIndex === 0 ? 'Main product photo' : `Product photo ${imageIndex + 1}`,
  );
  let detailIndex = 0;
  while (product.images.length < targetCount) {
    const region = cropRegions[detailIndex % cropRegions.length];
    const left = Math.floor(metadata.width * region.left),
      top = Math.floor(metadata.height * region.top);
    const width = Math.min(
      metadata.width - left,
      Math.floor(metadata.width * region.width),
    );
    const height = Math.min(
      metadata.height - top,
      Math.floor(metadata.height * region.height),
    );
    const filename = `/products/${product.id}-detail-${detailIndex + 1}.webp`;
    await sharp(source)
      .extract({ left, top, width, height })
      .webp({ quality: 94, effort: 5 })
      .toFile(path.join(root, 'frontend/public', filename));
    product.images.push(filename);
    product.imageLabels.push(region.label);
    detailIndex++;
  }
  photoCount += product.images.length;
}
await fs.writeFile(catalogPath, JSON.stringify(products, null, 2) + '\n');
console.log(
  `${products.length} products · ${photoCount} distinct gallery files · no upscaling`,
);
