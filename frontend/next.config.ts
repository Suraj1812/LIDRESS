import type { NextConfig } from 'next';
import path from 'node:path';

const config: NextConfig = {
  // Vercel runs the Next.js app; the token API is deployed separately to Cloudflare.
  turbopack: { root: path.resolve(__dirname, '..') },
  images: { unoptimized: true },
};
export default config;
