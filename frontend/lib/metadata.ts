import type { Metadata } from 'next';

const shareImage = '/brand/lidress-share-v1.jpg';

const origin =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000');
export const metadataBase = new URL(origin);
export const siteDescription =
  'Discover men’s fashion, footwear, watches, electronics and home essentials at LIDRESS. Find your next everyday favourite.';

export function pageMetadata({
  title,
  description,
  path,
  image = shareImage,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const socialTitle = `${title} | LIDRESS`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: 'LIDRESS',
      title: socialTitle,
      description,
      url: path,
      images: [
        {
          url: image,
          alt:
            image === shareImage
              ? 'LIDRESS — Find your everyday. Style, tech and home.'
              : title,
          ...(image === shareImage
            ? { width: 1200, height: 630, type: 'image/jpeg' }
            : {}),
        },
      ],
    },
    twitter: {
      card: image === shareImage ? 'summary_large_image' : 'summary',
      title: socialTitle,
      description,
      images: [image],
    },
    robots: noIndex ? { index: false, follow: true } : { index: true, follow: true },
  };
}
