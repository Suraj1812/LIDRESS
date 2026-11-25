import Link from 'next/link';
import { Store } from 'lucide-react';
export const metadata = { title: 'Sell on LIDRESS' };
export default function Page() {
  return (
    <main className="page-container">
      <div className="empty-state">
        <Store size={45} />
        <h1>Your next chapter in commerce.</h1>
        <p>
          Seller onboarding is coming later. This version focuses on the customer shopping
          experience, with demo products and simulated orders.
        </p>
        <Link className="button primary" href="/search">
          Explore the marketplace
        </Link>
      </div>
    </main>
  );
}
