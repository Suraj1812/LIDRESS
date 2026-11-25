import Link from 'next/link';
export const metadata = { title: 'Help centre' };
export default function Page() {
  return (
    <main className="page-container help-page">
      <span className="eyebrow">HERE TO HELP</span>
      <h1>Help centre</h1>
      <p>
        Find information about your account, order requests, and delivery preferences.
      </p>
      {[
        {
          id: 'delivery',
          title: 'Delivery & payments',
          text: 'Checkout submits an unpaid order request. No money is collected. Delivery availability and timing are confirmed separately; no shipment is booked automatically.',
        },
        {
          id: 'returns',
          title: 'Order cancellations',
          text: 'Open My orders to view your submitted requests and cancel an open request. Cancellation releases the reserved stock. As checkout collects no payment, there is no payment to refund.',
        },
        {
          id: 'privacy',
          title: 'Your account & privacy',
          text: 'Your account keeps your saved addresses, shopping bag, wishlist, reviews and order history together. Passwords are hashed, and sign-in uses an HTTP-only session cookie. Guest shopping preferences are saved on your device.',
        },
        {
          id: 'images',
          title: 'Products & reviews',
          text: 'Product pages show the current catalogue price and available stock. Ratings are calculated from reviews submitted on LIDRESS. Products without submitted reviews are shown as not yet reviewed.',
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
