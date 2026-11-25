import Link from 'next/link';
import { ArrowUpRight, Compass, Headphones, Package, Store } from 'lucide-react';
import { ProgressiveImage } from '../commerce/progressive-image';

const groups = [
  {
    title: 'Shop',
    icon: Compass,
    links: [
      ['Men’s fashion', '/search?category=fashion'],
      ['Electronics', '/search?category=electronics'],
      ['Home & living', '/search?category=home'],
      ['All deals', '/search?sort=discount'],
    ],
  },
  {
    title: 'Your account',
    icon: Package,
    links: [
      ['My account', '/account'],
      ['Orders', '/orders'],
      ['Wishlist', '/wishlist'],
      ['Shopping bag', '/cart'],
    ],
  },
  {
    title: 'Support',
    icon: Headphones,
    links: [
      ['Help centre', '/help'],
      ['Delivery', '/help#delivery'],
      ['Returns', '/help#returns'],
      ['Privacy', '/help#privacy'],
    ],
  },
];
const shortcuts = ['Watches', 'Mobiles', 'Footwear', 'Accessories', 'Sports', 'Grooming'];

export function Footer() {
  return (
    <footer className="site-footer compact-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link href="/" aria-label="LIDRESS home">
            <ProgressiveImage src="/brand/lidress-wordmark.png" alt="lidress" />
          </Link>
          <Link className="footer-help-button" href="/help">
            <Headphones size={17} /> Get help <ArrowUpRight size={15} />
          </Link>
        </div>
        {groups.map(({ title, icon: Icon, links }) => (
          <nav key={title} aria-label={title}>
            <h3>
              <Icon size={17} />
              {title}
            </h3>
            <div className="footer-link-grid">
              {links.map(([label, href]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        ))}
      </div>
      <div className="footer-shortcuts" aria-label="More categories">
        {shortcuts.map((label) => (
          <Link key={label} href={`/search?category=${label.toLowerCase()}`}>
            {label}
            <ArrowUpRight size={12} />
          </Link>
        ))}
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} LIDRESS</span>
        <p>Demo store · Sample prices and ratings · No payments or shipping.</p>
        <Link href="/sell">
          <Store size={15} /> Become a seller
        </Link>
      </div>
    </footer>
  );
}
