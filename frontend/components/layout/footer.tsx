import Link from 'next/link';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Store } from 'lucide-react';
export function Footer() {
  return (
    <>
      <section className="trust-strip">
        <div>
          <Truck />
          <span>
            <strong>Delivery made simple</strong>Clear estimates. No surprises.
          </span>
        </div>
        <div>
          <RotateCcw />
          <span>
            <strong>Shop with confidence</strong>Helpful product information.
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            <strong>Your account, protected</strong>Secure sign-in and saved details.
          </span>
        </div>
        <div>
          <ShoppingBag />
          <span>
            <strong>More ways to discover</strong>80 products. 500 clear images.
          </span>
        </div>
      </section>
      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/brand/lidress-wordmark.png" alt="lidress" />
            <p>
              Good finds for your everyday.
              <br />A little more choice. A little more you.
            </p>
            <span className="footer-demo">A working demo marketplace</span>
          </div>
          <div>
            <h3>Discover</h3>
            <Link href="/search?category=fashion">Men’s fashion</Link>
            <Link href="/search?category=electronics">Electronics</Link>
            <Link href="/search?category=home">Home & living</Link>
            <Link href="/search?sort=discount">Offers & deals</Link>
          </div>
          <div>
            <h3>Your LIDRESS</h3>
            <Link href="/account">My account</Link>
            <Link href="/orders">My orders</Link>
            <Link href="/wishlist">Wishlist</Link>
            <Link href="/cart">Shopping bag</Link>
          </div>
          <div>
            <h3>Here to help</h3>
            <Link href="/help">Help centre</Link>
            <Link href="/help#delivery">Delivery information</Link>
            <Link href="/help#returns">Returns & cancellations</Link>
            <Link href="/help#privacy">Privacy & account data</Link>
            <Link href="/sell">Become a seller</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} LIDRESS</span>
          <p>
            Demo catalogue, prices and ratings. No affiliation with the brands shown.
            Orders are simulations.
          </p>
          <Link href="/sell">
            <Store size={15} />
            Sell on LIDRESS
          </Link>
        </div>
      </footer>
    </>
  );
}
