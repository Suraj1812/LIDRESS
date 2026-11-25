'use client';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { money, discountPercent, type Product } from '../../../shared/catalog';
import { useShop } from '../../lib/store';
import { useHydrated } from '../../hooks/use-hydrated';
export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const wishlist = useShop((state) => state.wishlist);
  const toggle = useShop((state) => state.toggleWishlist);
  const hydrated = useHydrated();
  const saved = hydrated && wishlist.includes(product.id);
  return (
    <article className={`product-card ${compact ? 'compact-card' : ''}`}>
      <div className="card-image">
        <Link href={`/products/${product.id}`} aria-label={`View ${product.title}`}>
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            width="320"
            height="320"
          />
        </Link>
        <button
          className={`wishlist-toggle ${saved ? 'saved' : ''}`}
          aria-label={`${saved ? 'Remove' : 'Save'} ${product.title}${saved ? ' from wishlist' : ' to wishlist'}`}
          aria-pressed={saved}
          onClick={() => {
            toggle(product.id);
            toast.success(
              saved ? 'Removed from your wishlist' : 'Saved to your wishlist',
            );
          }}
        >
          <Heart size={19} fill={saved ? 'currentColor' : 'none'} />
        </button>
        {product.badge && <span className="card-badge">{product.badge}</span>}
      </div>
      <div className="card-content">
        <span className="card-brand">{product.brand}</span>
        <Link className="card-title" href={`/products/${product.id}`}>
          {product.title}
        </Link>
        <div className="rating-row">
          <span className="rating-pill">
            {product.rating.toFixed(1)}
            <Star size={10} fill="currentColor" />
          </span>
          <span>({product.ratingCount.toLocaleString('en-IN')})</span>
        </div>
        <div className="card-price">
          <strong>{money(product.price)}</strong>
          <del>{money(product.mrp)}</del>
          <span>{discountPercent(product)}% off</span>
        </div>
        <p className="card-delivery">
          {product.price >= 999 ? 'Free delivery' : 'Delivery from ₹49'}
        </p>
      </div>
    </article>
  );
}
