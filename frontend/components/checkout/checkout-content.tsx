'use client';
import { CheckoutSkeleton } from '../commerce/skeletons';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, MapPin, ShieldCheck } from 'lucide-react';
import { addressSchema, type AddressInput, type Order } from '../../../shared/schemas';
import { getProduct, type CartLine } from '../../../shared/catalog';
import { useShop } from '../../lib/store';
import { useSession } from '../../hooks/use-session';
import { useShoppingReady } from '../../hooks/use-shopping-ready';
import { api } from '../../lib/api';
import { AddressFields } from './address-fields';
import { PriceSummary } from './cart-content';
import { EmptyState } from '../commerce/states';
export function CheckoutContent() {
  const params = useSearchParams();
  const router = useRouter();
  const client = useQueryClient();
  const { data: session, isPending } = useSession();
  const hydrated = useShoppingReady();
  const cart = useShop((s) => s.cart);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const form = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { type: 'Home', locality: '' },
  });
  const buyProduct = getProduct(Number(params.get('buyNow')));
  const size = params.get('size') || '';
  const items: CartLine[] =
    buyProduct && buyProduct.sizes.includes(size)
      ? [{ productId: buyProduct.id, size, quantity: 1 }]
      : cart;
  const coupon = params.get('coupon') === 'WELCOME10' ? 'WELCOME10' : '';
  const mutation = useMutation({
    mutationFn: async (address: AddressInput) => {
      const result = await api<{ order: Order }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items,
          address,
          coupon,
          idempotencyKey,
          clearCart: !buyProduct,
        }),
      });
      return result.order;
    },
    onSuccess: (order) => {
      if (!buyProduct) useShop.getState().clearCart();
      client.invalidateQueries({ queryKey: ['orders'] });
      router.replace(`/orders/${order.id}?placed=1`);
    },
  });
  if (!hydrated || isPending) return <CheckoutSkeleton />;
  if (!items.length)
    return (
      <EmptyState
        title="Your bag is empty"
        description="Add a good find before checking out."
      />
    );
  return (
    <main className="page-container">
      <div className="page-heading">
        <h1>Checkout</h1>
        <span>
          <ShieldCheck size={16} />
          Secure demo checkout
        </span>
      </div>
      <div className="demo-notice">
        This is a simulated purchase. No payment is collected and no item will be shipped.
      </div>
      <div className="checkout-layout">
        <section className="shop-panel checkout-steps">
          <div className="checkout-step">
            <span className="step-number">1</span>
            <div>
              <h2>Your account</h2>
              {session?.user ? (
                <p>
                  <Check size={15} />
                  {session.user.name} · {session.user.email}
                </p>
              ) : (
                <>
                  <p>Sign in to save and view your order.</p>
                  <button
                    className="button primary"
                    onClick={() => useShop.getState().openAuth()}
                  >
                    Sign in to continue
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="checkout-step">
            <span className="step-number">2</span>
            <div>
              <h2>Delivery address</h2>
              <p>Use sample details when testing this demo.</p>
              <form
                className="form-stack"
                id="checkout-form"
                onSubmit={form.handleSubmit((address) => mutation.mutate(address))}
              >
                <AddressFields form={form} />
                <label>
                  Address type
                  <select {...form.register('type')}>
                    <option>Home</option>
                    <option>Work</option>
                  </select>
                </label>
                <label className="checkbox-label">
                  <input type="checkbox" required />I understand this is a demo order with
                  no payment or delivery.
                </label>
                {mutation.error && (
                  <p role="alert" className="form-error">
                    {mutation.error.message}
                  </p>
                )}
              </form>
            </div>
          </div>
          <div className="checkout-step">
            <span className="step-number">3</span>
            <div>
              <h2>Payment</h2>
              <p>Demo mode — no payment details needed.</p>
            </div>
          </div>
        </section>
        <PriceSummary items={items} coupon={coupon}>
          <button
            form="checkout-form"
            type="submit"
            className="button primary full"
            disabled={!session?.user || mutation.isPending}
          >
            {mutation.isPending ? 'Placing demo order…' : 'Place demo order'}
          </button>
        </PriceSummary>
      </div>
    </main>
  );
}
