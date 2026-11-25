'use client';
import { ProgressiveImage } from '../commerce/progressive-image';

import { CartSkeleton } from '../commerce/skeletons';
import Link from 'next/link';
import { useState } from 'react';
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  ShieldCheck,
  MapPin,
  TicketPercent,
} from 'lucide-react';
import { toast } from 'sonner';
import { calculateTotals, getProduct, money } from '../../../shared/catalog';
import { useShop } from '../../lib/store';
import { useShoppingReady } from '../../hooks/use-shopping-ready';
import { EmptyState } from '../commerce/states';
export function PriceSummary({
  items,
  coupon = '',
  children,
}: {
  items: import('../../../shared/catalog').CartLine[];
  coupon?: string;
  children?: React.ReactNode;
}) {
  const totals = calculateTotals(items, coupon);
  return (
    <aside className="price-summary">
      <h2>Price details</h2>
      <dl>
        <div>
          <dt>Price ({items.reduce((n, i) => n + i.quantity, 0)} items)</dt>
          <dd>{money(totals.mrp)}</dd>
        </div>
        <div>
          <dt>Product discount</dt>
          <dd className="positive">− {money(totals.savings)}</dd>
        </div>
        {totals.couponDiscount > 0 && (
          <div>
            <dt>Coupon savings</dt>
            <dd className="positive">− {money(totals.couponDiscount)}</dd>
          </div>
        )}
        <div>
          <dt>Delivery</dt>
          <dd>
            {totals.shipping ? (
              money(totals.shipping)
            ) : (
              <span className="positive">FREE</span>
            )}
          </dd>
        </div>
        <div className="total">
          <dt>Total amount</dt>
          <dd>{money(totals.total)}</dd>
        </div>
      </dl>
      <p className="savings-note">
        You save {money(totals.savings + totals.couponDiscount)} on this order
      </p>
      {children}
      <p className="secure-note">
        <ShieldCheck size={18} />
        Secure account. Saved shopping details.
      </p>
    </aside>
  );
}
export function CartContent() {
  const cart = useShop((s) => s.cart);
  const update = useShop((s) => s.updateQuantity);
  const remove = useShop((s) => s.removeItem);
  const toggle = useShop((s) => s.toggleWishlist);
  const hydrated = useShoppingReady();
  const location = useShop((s) => s.location);
  const pincode = useShop((s) => s.pincode);
  const [coupon, setCoupon] = useState('');
  const [draft, setDraft] = useState('');
  if (!hydrated) return <CartSkeleton />;
  if (!cart.length)
    return (
      <main className="page-container">
        <EmptyState
          title="Your bag is empty"
          description="Add products to get started."
        />
      </main>
    );
  return (
    <main className="page-container">
      <div className="page-heading">
        <h1>Your shopping bag</h1>
        <span>{cart.length} selections</span>
      </div>
      <div className="checkout-layout">
        <section>
          <div className="delivery-banner">
            <MapPin size={20} />
            <span>
              Deliver to {location} · {pincode}
            </span>
            <button
              className="text-button"
              onClick={() => useShop.getState().openLocation()}
            >
              Change
            </button>
          </div>
          <div className="cart-items">
            {cart.map((item) => {
              const product = getProduct(item.productId);
              if (!product) return null;
              return (
                <article className="cart-item" key={`${item.productId}-${item.size}`}>
                  <Link href={`/products/${product.id}`}>
                    <ProgressiveImage src={product.images[0]} alt={product.title} />
                  </Link>
                  <div>
                    <span className="card-brand">{product.brand}</span>
                    <Link href={`/products/${product.id}`} className="cart-item-title">
                      {product.title}
                    </Link>
                    <p>
                      Size: {item.size} · {product.color}
                    </p>
                    <div className="card-price">
                      <strong>{money(product.price)}</strong>
                      <del>{money(product.mrp)}</del>
                    </div>
                    <div className="cart-controls">
                      <div className="quantity-control">
                        <button
                          aria-label={`Decrease ${product.title} quantity`}
                          disabled={item.quantity === 1}
                          onClick={() => update(product.id, item.size, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          aria-label={`Increase ${product.title} quantity`}
                          disabled={item.quantity === 10}
                          onClick={() => update(product.id, item.size, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          if (!useShop.getState().wishlist.includes(product.id))
                            toggle(product.id);
                          remove(product.id, item.size);
                          toast.success('Moved to your wishlist');
                        }}
                      >
                        <Heart size={15} />
                        Save for later
                      </button>
                      <button onClick={() => remove(product.id, item.size)}>
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </div>
                  </div>
                  <small>
                    Delivery
                    <br />
                    <span>Schedule pending</span>
                  </small>
                </article>
              );
            })}
          </div>
          <form
            className="coupon-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.toUpperCase() !== 'WELCOME10') {
                toast.error('Try WELCOME10');
                return;
              }
              if (calculateTotals(cart).subtotal < 999) {
                toast.error('Minimum spend is ₹999');
                return;
              }
              setCoupon('WELCOME10');
              toast.success('Welcome offer applied');
            }}
          >
            <TicketPercent size={20} />
            <input
              aria-label="Coupon code"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Enter coupon code"
            />
            <button className="text-button">Apply</button>
            {coupon && (
              <button
                type="button"
                onClick={() => {
                  setCoupon('');
                  setDraft('');
                }}
              >
                Remove
              </button>
            )}
          </form>
        </section>
        <PriceSummary items={cart} coupon={coupon}>
          <Link
            href={`/checkout${coupon ? '?coupon=' + coupon : ''}`}
            className="button primary full"
          >
            Continue to checkout
          </Link>
        </PriceSummary>
      </div>
    </main>
  );
}
