import Link from 'next/link';
export const metadata = { title: 'Help centre' };
export default function Page() {
  return (
    <main className="page-container help-page">
      <span className="eyebrow">HERE TO HELP</span>
      <h1>A little clarity goes a long way.</h1>
      <p>
        LIDRESS is a working demonstration marketplace. You can browse, create an account,
        save favourites, and place simulated orders.
      </p>
      {[
        {
          id: 'delivery',
          title: 'Delivery & payments',
          text: 'No real payments are collected and no items are dispatched. Delivery estimates and stock are demonstration data. Use sample address details when trying checkout.',
        },
        {
          id: 'returns',
          title: 'Returns & cancellations',
          text: 'You can cancel a placed demo order from My orders. Inventory is restored automatically. There are no real returns or refunds because no money changes hands.',
        },
        {
          id: 'privacy',
          title: 'Your account & privacy',
          text: 'Passwords are salted and hashed. Session cookies are HTTP-only. Your account, saved addresses, cart, wishlist, reviews and demo orders are stored in Cloudflare D1. Guest shopping is stored on your device. Never use a password you use elsewhere for a demo account.',
        },
        {
          id: 'images',
          title: 'Product photography & catalogue',
          text: 'The catalogue uses demo imagery and illustrative INR prices. Galleries include original product photos and clearly labelled detail crops. LIDRESS is not affiliated with the brands shown.',
        },
      ].map((section) => (
        <section key={section.id} id={section.id}>
          <h2>{section.title}</h2>
          <p>{section.text}</p>
        </section>
      ))}
      <Link href="/search" className="button primary">
        Back to shopping
      </Link>
    </main>
  );
}
