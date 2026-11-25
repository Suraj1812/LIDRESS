'use client';
import { useCatalog } from '../../hooks/use-catalog';
import { ShelfSkeleton } from '../commerce/skeletons';
import { ErrorState } from '../commerce/states';
import Link from 'next/link';
import { TicketPercent, ChevronRight } from 'lucide-react';
import { HeroCarousel } from './hero-carousel';
import { ProductCard } from '../catalog/product-card';
function ProductShelf({
  title,
  category,
  ids,
}: {
  title: string;
  category?: string;
  ids?: number[];
}) {
  const query = useCatalog();
  if (query.isPending) return <ShelfSkeleton />;
  if (query.isError)
    return <ErrorState message={query.error.message} retry={() => query.refetch()} />;
  const products = query.data.products;
  const selected = ids
    ? ids.map((id) => products.find((product) => product.id === id)!).filter(Boolean)
    : products
        .filter((product) => !category || product.category === category)
        .slice(0, 6);
  return (
    <section className="shop-panel product-shelf">
      <div className="panel-heading">
        <div>
          <h2>{title}</h2>
        </div>
        <Link
          href={category ? `/search?category=${category}` : '/search'}
          className="view-all"
        >
          View all <ChevronRight size={15} />
        </Link>
      </div>
      <div className="shelf-grid">
        {selected.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </section>
  );
}
export function HomeContent() {
  return (
    <main className="market-home">
      <HeroCarousel />
      <div className="coupon-ribbon">
        <span className="coupon-icon">
          <TicketPercent size={29} />
        </span>
        <div>
          <strong>10% off with WELCOME10</strong>
          <span>Min. ₹999 · Save up to ₹500</span>
        </div>
        <span className="coupon-code">WELCOME10</span>
        <Link href="/search">
          Shop now <ChevronRight size={16} />
        </Link>
      </div>
      <ProductShelf title="Top deals" ids={[100, 1, 88, 93, 123, 51]} />
      <ProductShelf title="Men’s fashion" category="fashion" />
      <div className="home-category-shelves">
        <ProductShelf title="Footwear" category="footwear" />
        <ProductShelf title="Home & living" category="home" />
      </div>
      <ProductShelf title="Electronics" category="electronics" />
    </main>
  );
}
