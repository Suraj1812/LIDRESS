import type { CSSProperties, ReactNode } from 'react';
import './skeletons.css';

export function SkeletonBlock({
  width = '100%',
  height = 14,
  className = '',
}: {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  className?: string;
}) {
  return <span className={`skeleton-block ${className}`} style={{ width, height }} />;
}
export function SkeletonLines({ count = 3 }: { count?: number }) {
  return (
    <div className="skeleton-lines">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonBlock key={i} width={i === count - 1 ? '62%' : '100%'} />
      ))}
    </div>
  );
}
function Region({
  children,
  label,
  className = '',
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={`skeleton-region ${className}`}
    >
      <span className="skeleton-sr-only">{label}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}
function Heading() {
  return (
    <div className="page-heading">
      <SkeletonBlock width="min(260px, 65%)" height={30} />
      <SkeletonBlock width={90} />
    </div>
  );
}
function CategorySkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`skeleton-categories ${compact ? 'skeleton-categories-compact' : ''}`}
    >
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="skeleton-category-item">
          {!compact && <SkeletonBlock width={64} height={58} />}
          <SkeletonBlock width={64} height={12} />
        </div>
      ))}
    </div>
  );
}
export function ProductSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <article
      className={`product-card skeleton-card ${compact ? 'compact-card' : ''}`}
      aria-hidden="true"
    >
      <div className="card-image">
        <SkeletonBlock height="100%" />
      </div>
      <div className="card-content">
        <SkeletonBlock width="35%" height={10} />
        <SkeletonBlock width="88%" height={41} />
        <SkeletonBlock width="45%" height={12} />
        <SkeletonBlock width="65%" height={22} />
        <SkeletonBlock width="42%" height={10} />
      </div>
    </article>
  );
}
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <Region label="Loading products">
      <div className="catalog-grid">
        {Array.from({ length: count }, (_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    </Region>
  );
}
export function ShelfSkeleton() {
  return (
    <Region label="Loading collection">
      <section className="shop-panel product-shelf">
        <div className="panel-heading">
          <SkeletonBlock width="45%" height={26} />
        </div>
        <div className="shelf-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <ProductSkeleton compact key={i} />
          ))}
        </div>
      </section>
    </Region>
  );
}
export function HomeSkeleton() {
  return (
    <Region label="Loading home page">
      <CategorySkeleton />
      <main className="market-home">
        <div className="hero-grid">
          <SkeletonBlock className="skeleton-hero" height={328} />
          <SkeletonBlock className="skeleton-side-promo" height={328} />
        </div>
        <div className="skeleton-spaced">
          <SkeletonBlock height={76} />
        </div>
        <ShelfSkeleton />
        <ShelfSkeleton />
        <div className="home-category-shelves">
          <ShelfSkeleton />
          <ShelfSkeleton />
        </div>
        <ShelfSkeleton />
      </main>
    </Region>
  );
}
export function CatalogSkeleton() {
  return (
    <Region label="Loading catalogue">
      <CategorySkeleton compact />
      <main className="catalog-layout">
        <aside className="filters-sidebar">
          <SkeletonBlock width="60%" height={24} />
          {[0, 1, 2, 3].map((i) => (
            <div className="filter-section" key={i}>
              <SkeletonBlock width="60%" height={18} />
              <SkeletonLines count={4} />
            </div>
          ))}
        </aside>
        <section className="catalog-results">
          <SkeletonBlock width="25%" height={10} />
          <Heading />
          <div className="sort-bar">
            <SkeletonBlock width="80%" height={20} />
          </div>
          <ProductGridSkeleton />
        </section>
      </main>
    </Region>
  );
}
export function ReviewsSkeleton() {
  return (
    <Region label="Loading customer reviews">
      <div className="detail-section">
        <SkeletonBlock width="50%" height={24} />
        <div className="skeleton-spaced">
          <SkeletonBlock width="35%" height={45} />
        </div>
        {[0, 1].map((i) => (
          <div className="review" key={i}>
            <SkeletonBlock width={36} height={24} />
            <div className="skeleton-grow">
              <SkeletonLines count={3} />
            </div>
          </div>
        ))}
      </div>
    </Region>
  );
}
export function ProductDetailSkeleton() {
  return (
    <Region label="Loading product details">
      <CategorySkeleton compact />
      <main className="product-page">
        <div className="breadcrumbs">
          <SkeletonBlock width="42%" height={12} />
        </div>
        <div className="product-detail-grid">
          <section className="product-gallery">
            <div className="gallery-thumbnails">
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonBlock key={i} width="100%" height={65} />
              ))}
            </div>
            <div className="gallery-main">
              <SkeletonBlock height="100%" />
            </div>
            <div className="purchase-actions">
              <SkeletonBlock height={48} />
              <SkeletonBlock height={48} />
            </div>
          </section>
          <section className="product-information">
            <SkeletonBlock width="25%" height={12} />
            <div className="skeleton-spaced">
              <SkeletonBlock width="85%" height={36} />
            </div>
            <SkeletonBlock width="55%" height={20} />
            <div className="skeleton-spaced">
              <SkeletonBlock width="45%" height={42} />
            </div>
            <SkeletonLines count={4} />
            <div className="skeleton-size-options">
              {[0, 1, 2, 3, 4].map((i) => (
                <SkeletonBlock key={i} width={44} height={44} />
              ))}
            </div>
            {[0, 1, 2].map((i) => (
              <div className="detail-meta-row" key={i}>
                <SkeletonBlock width={65} />
                <SkeletonLines count={2} />
              </div>
            ))}
            <ReviewsSkeleton />
          </section>
        </div>
        <ShelfSkeleton />
      </main>
    </Region>
  );
}
export function PriceSummarySkeleton() {
  return (
    <aside className="price-summary">
      <SkeletonBlock width="55%" height={24} />
      <div className="skeleton-spaced">
        <SkeletonLines count={4} />
      </div>
      <SkeletonBlock height={48} />
      <div className="skeleton-spaced">
        <SkeletonBlock width="75%" height={12} />
      </div>
    </aside>
  );
}
function CartRow() {
  return (
    <article className="cart-item">
      <SkeletonBlock className="skeleton-cart-photo" width="100%" height={130} />
      <div className="skeleton-grow">
        <SkeletonLines count={3} />
        <div className="skeleton-spaced">
          <SkeletonBlock width="50%" height={28} />
        </div>
        <SkeletonBlock width="80%" height={30} />
      </div>
      <SkeletonBlock height={12} />
    </article>
  );
}
export function CartSkeleton() {
  return (
    <Region label="Loading shopping bag">
      <main className="page-container">
        <Heading />
        <div className="checkout-layout">
          <section>
            <div className="delivery-banner">
              <SkeletonBlock height={24} />
            </div>
            <div className="cart-items">
              <CartRow />
              <CartRow />
            </div>
            <div className="skeleton-spaced">
              <SkeletonBlock height={58} />
            </div>
          </section>
          <PriceSummarySkeleton />
        </div>
      </main>
    </Region>
  );
}
export function CheckoutSkeleton() {
  return (
    <Region label="Loading checkout">
      <main className="page-container">
        <Heading />
        <div className="skeleton-spaced">
          <SkeletonBlock height={48} />
        </div>
        <div className="checkout-layout">
          <section className="shop-panel checkout-steps">
            {[0, 1, 2].map((i) => (
              <div className="checkout-step" key={i}>
                <SkeletonBlock className="skeleton-round" width={28} height={28} />
                <div className="skeleton-grow">
                  <SkeletonBlock width="45%" height={24} />
                  <div className="skeleton-spaced">
                    <SkeletonLines count={i === 1 ? 1 : 2} />
                  </div>
                  {i === 1 && (
                    <div className="address-fields">
                      {Array.from({ length: 7 }, (_, j) => (
                        <div className={j === 3 ? 'wide' : ''} key={j}>
                          <SkeletonBlock width="45%" height={12} />
                          <div className="skeleton-field">
                            <SkeletonBlock height={43} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
          <PriceSummarySkeleton />
        </div>
      </main>
    </Region>
  );
}
export function AddressesSkeleton() {
  return (
    <Region label="Loading saved addresses">
      <div className="address-grid">
        {[0, 1].map((i) => (
          <article key={i}>
            <SkeletonBlock width="30%" height={22} />
            <div className="skeleton-spaced">
              <SkeletonLines count={3} />
            </div>
            <SkeletonBlock width="25%" />
          </article>
        ))}
      </div>
    </Region>
  );
}
export function AccountSkeleton() {
  return (
    <Region label="Loading account">
      <main className="page-container">
        <div className="account-welcome">
          <SkeletonBlock className="skeleton-round" width={65} height={65} />
          <div className="skeleton-grow">
            <SkeletonBlock width="30%" height={30} />
            <div className="skeleton-field">
              <SkeletonBlock width="40%" />
            </div>
          </div>
        </div>
        <div className="account-shortcuts">
          {[0, 1, 2].map((i) => (
            <div className="shop-panel skeleton-shortcut" key={i}>
              <SkeletonBlock width={26} height={26} />
              <SkeletonLines count={2} />
            </div>
          ))}
        </div>
        <section className="shop-panel address-panel">
          <div className="section-heading">
            <SkeletonBlock width="35%" height={24} />
            <SkeletonBlock width={110} height={40} />
          </div>
          <AddressesSkeleton />
        </section>
      </main>
    </Region>
  );
}
export function OrderCardsSkeleton({ detail = false }: { detail?: boolean }) {
  return (
    <Region label={detail ? 'Loading order details' : 'Loading orders'}>
      {Array.from({ length: detail ? 1 : 2 }, (_, i) => (
        <article className="shop-panel order-card" key={i}>
          <header>
            <div className="skeleton-grow">
              <SkeletonBlock width="50%" height={18} />
              <div className="skeleton-field">
                <SkeletonBlock width="65%" height={12} />
              </div>
            </div>
            <SkeletonBlock width={110} height={24} />
          </header>
          <div className="order-products">
            {[0, 1].map((j) => (
              <div className="skeleton-order-item" key={j}>
                <SkeletonBlock width={80} height={90} />
                <div className="skeleton-grow">
                  <SkeletonLines count={3} />
                </div>
              </div>
            ))}
          </div>
          <div className="order-footer">
            <SkeletonBlock width={120} height={22} />
            <SkeletonBlock width={110} height={40} />
          </div>
          {detail && (
            <div className="order-address">
              <SkeletonBlock width={24} height={24} />
              <div className="skeleton-grow">
                <SkeletonLines count={4} />
              </div>
            </div>
          )}
        </article>
      ))}
    </Region>
  );
}
export function OrdersSkeleton({ detail = false }: { detail?: boolean }) {
  return (
    <main className="page-container">
      <Heading />
      <OrderCardsSkeleton detail={detail} />
    </main>
  );
}
export function WishlistSkeleton() {
  return (
    <Region label="Loading wishlist">
      <main className="page-container">
        <Heading />
        <div className="wishlist-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </main>
    </Region>
  );
}
export function HelpSkeleton() {
  return (
    <Region label="Loading help centre">
      <main className="page-container help-page">
        <SkeletonBlock width="20%" height={12} />
        <div className="skeleton-spaced">
          <SkeletonBlock width="80%" height={40} />
        </div>
        <SkeletonLines />
        {[0, 1, 2, 3].map((i) => (
          <section key={i}>
            <SkeletonBlock width="50%" height={24} />
            <div className="skeleton-spaced">
              <SkeletonLines />
            </div>
          </section>
        ))}
      </main>
    </Region>
  );
}
export function SellerSkeleton() {
  return (
    <Region label="Loading seller page">
      <main className="page-container">
        <div className="empty-state">
          <SkeletonBlock width={45} height={45} />
          <SkeletonBlock width="min(500px, 90%)" height={36} />
          <div className="skeleton-seller-copy">
            <SkeletonLines />
          </div>
          <SkeletonBlock width={200} height={46} />
        </div>
      </main>
    </Region>
  );
}
export function ReviewListSkeleton() {
  return (
    <Region label="Loading customer reviews">
      {[0, 1].map((i) => (
        <div className="review" key={i}>
          <SkeletonBlock width={36} height={24} />
          <div className="skeleton-grow">
            <SkeletonLines count={3} />
          </div>
        </div>
      ))}
    </Region>
  );
}
export function DialogSkeleton() {
  return (
    <div className="skeleton-dialog-backdrop">
      <Region label="Loading dialog" className="skeleton-dialog">
        <SkeletonBlock width="65%" height={28} />
        <div className="skeleton-spaced">
          <SkeletonLines count={2} />
        </div>
        <div className="skeleton-spaced">
          <SkeletonBlock height={44} />
        </div>
        <SkeletonBlock height={44} />
      </Region>
    </div>
  );
}
