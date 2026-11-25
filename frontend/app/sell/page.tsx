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
          Seller applications are not currently open. You can browse the collection and
          manage your orders from your account.
        </p>
        <Link className="button primary" href="/search">
          Explore the marketplace
        </Link>
      </div>
    </main>
  );
}
