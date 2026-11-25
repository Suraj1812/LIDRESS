import { Suspense } from 'react';
import { CheckoutContent } from '../../components/checkout/checkout-content';
export const metadata = { title: 'Checkout' };
export default function Page() {
  return (
    <Suspense fallback={<div className="page-loading">Preparing checkout…</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
