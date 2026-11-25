import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'LIDRESS — Your next look, on you.',
  description:
    'Discover considered essentials and step into your own virtual fitting room.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
