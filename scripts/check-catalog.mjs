import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const products = JSON.parse(
  await fs.readFile(new URL('../shared/products.json', import.meta.url)),
);
const paths = products.flatMap((product) => product.images);
if (new Set(products.map((product) => product.id)).size !== products.length)
  throw new Error('Product IDs must be unique.');
if (products.length !== 80 || paths.length !== 500 || new Set(paths).size !== 500)
  throw new Error('Expected 80 products and 500 unique gallery paths.');
let minimumEdge = Infinity;
for (const product of products) {
  if (product.images.length < 6 || product.imageLabels.length !== product.images.length)
    throw new Error(`Incomplete gallery for ${product.title}`);
  for (const image of product.images) {
    const file = fileURLToPath(new URL(`../frontend/public${image}`, import.meta.url));
    const metadata = await sharp(file).metadata();
    if (!metadata.width || !metadata.height)
      throw new Error(`Unreadable image: ${image}`);
    minimumEdge = Math.min(minimumEdge, metadata.width, metadata.height);
  }
}
console.log(
  `Verified ${products.length} products, ${paths.length} images. Smallest image edge: ${minimumEdge}px.`,
);
