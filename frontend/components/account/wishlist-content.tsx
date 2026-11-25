'use client';
import { WishlistSkeleton } from '../commerce/skeletons';
import { useCatalog } from '../../hooks/use-catalog';
import { useShop } from '../../lib/store';
import { useShoppingReady } from '../../hooks/use-shopping-ready';
import { ProductCard } from '../catalog/product-card';
import { ErrorState, EmptyState } from '../commerce/states';
export function WishlistContent() {
  const ids = useShop((s) => s.wishlist);
  const hydrated = useShoppingReady();
  const catalog = useCatalog(hydrated && ids.length > 0);
  const saved = (catalog.data?.products || []).filter((p) => ids.includes(p.id));
  if (!hydrated || (ids.length > 0 && catalog.isPending)) return <WishlistSkeleton />;
  if (ids.length > 0 && catalog.isError)
    return (
      <main className="page-container">
        <ErrorState message={catalog.error.message} retry={() => catalog.refetch()} />
      </main>
    );
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
