import Link from 'next/link';
import { ProgressiveImage } from '../commerce/progressive-image';

const sections = [
  {
    title: 'Shop',
    links: [
      ['Men’s fashion', '/search?category=fashion'],
      ['Electronics', '/search?category=electronics'],
      ['Home & living', '/search?category=home'],
      ['All products', '/search'],
    ],
  },
  {
    title: 'Your account',
    links: [
      ['Account', '/account'],
      ['Orders', '/orders'],
      ['Wishlist', '/wishlist'],
      ['Shopping bag', '/cart'],
    ],
  },
  {
    title: 'Help',
    links: [
      ['Help centre', '/help'],
      ['Delivery', '/help#delivery'],
      ['Cancellations', '/help#returns'],
      ['Privacy', '/help#privacy'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer marketplace-footer">
      <div className="marketplace-footer-inner">
        <Link href="/" className="marketplace-footer-logo" aria-label="LIDRESS home">
          <ProgressiveImage
            src="/brand/lidress-wordmark.png"
            alt="lidress"
            width={140}
            height={45}
          />
        </Link>
        {sections.map(({ title, links }) => (
          <nav key={title} aria-label={`Footer ${title}`}>
            <h2>{title}</h2>
            {links.map(([label, href]) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="marketplace-footer-base">
        <span>© {new Date().getFullYear()} LIDRESS</span>
        <Link href="/help#privacy">Privacy</Link>
        <Link href="/help">Help centre</Link>
      </div>
    </footer>
  );
}
