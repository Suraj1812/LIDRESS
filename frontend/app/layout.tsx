import type { Metadata } from 'next';
import { metadataBase, pageMetadata, siteDescription } from '../lib/metadata';
import { Providers } from '../components/commerce/providers';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { BrandIntro } from '../components/layout/brand-intro';
import './globals.css';
import '../components/commerce/skeletons.css';
export const metadata: Metadata = {
  metadataBase,
  ...pageMetadata({
    title: 'Find your everyday',
    description: siteDescription,
    path: '/',
  }),
  title: { default: 'LIDRESS — Find your everyday', template: '%s | LIDRESS' },
  applicationName: 'LIDRESS',
  icons: {
    icon: [
      { url: '/brand/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/brand/favicon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/brand/lidress-icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <BrandIntro />
          <Header />
          <div className="storefront-content">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
