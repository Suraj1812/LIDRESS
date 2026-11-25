'use client';
import { WishlistSkeleton } from '../commerce/skeletons';
import { products } from '../../../shared/catalog';
import { useShop } from '../../lib/store';
import { useShoppingReady } from '../../hooks/use-shopping-ready';
import { ProductCard } from '../catalog/product-card';
import { EmptyState } from '../commerce/states';
export function WishlistContent() {
  const ids = useShop((s) => s.wishlist);
  const hydrated = useShoppingReady();
  const saved = products.filter((p) => ids.includes(p.id));
  if (!hydrated) return <WishlistSkeleton />;
  return (
    <main className="page-container">
      <div className="page-heading">
        <h1>Your wishlist</h1>
        <span>{saved.length} good finds saved</span>
      </div>
      {saved.length ? (
        <div className="wishlist-grid">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Keep the good finds close."
          description="Tap the heart on any product to save it here."
        />
      )}
    </main>
  );
}
