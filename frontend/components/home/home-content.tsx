import Link from 'next/link';
import { TicketPercent, ChevronRight, Sparkles, Tag } from 'lucide-react';
import { products } from '../../../shared/catalog';
import { HeroCarousel } from './hero-carousel';
import { ProductCard } from '../catalog/product-card';
function ProductShelf({
  title,
  subtitle,
  category,
  ids,
}: {
  title: string;
  subtitle: string;
  category?: string;
  ids?: number[];
}) {
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
          <p>{subtitle}</p>
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
          <strong>Your first good find comes with a little extra.</strong>
          <span>Get 10% off your demo order. Minimum spend ₹999. Up to ₹500 off.</span>
        </div>
        <span className="coupon-code">WELCOME10</span>
        <Link href="/search">
          Find something you love <ChevronRight size={16} />
        </Link>
      </div>
      <ProductShelf
        title="Deals you’ll want to make room for"
        subtitle="Good choices. Better everyday prices."
        ids={[100, 1, 88, 93, 123, 51]}
      />
      <div className="promotion-grid">
        <Link href="/search?category=fashion" className="collection-promo green-promo">
          <div>
            <span className="eyebrow">THE MEN’S EDIT</span>
            <h2>
              Less effort.
              <br />
              More everyday style.
            </h2>
            <strong>Starting at ₹1,290</strong>
            <span>Explore menswear</span>
          </div>
          <img src="/images/denim-jacket.png" alt="Men’s denim jacket" />
        </Link>
        <Link href="/search?category=electronics" className="collection-promo blue-promo">
          <div>
            <span className="eyebrow">WORK. PLAY. REPEAT.</span>
            <h2>
              A smarter
              <br />
              kind of upgrade.
            </h2>
            <strong>Electronics, sorted.</strong>
            <span>Explore the collection</span>
          </div>
          <img src="/products/79.webp" alt="Asus dual screen laptop" />
        </Link>
        <Link href="/search?category=watches" className="collection-promo peach-promo">
          <div>
            <span className="eyebrow">MAKE EVERY MINUTE COUNT</span>
            <h2>
              Time for
              <br />
              something new.
            </h2>
            <strong>Watches you’ll keep.</strong>
            <span>Find your favourite</span>
          </div>
          <img src="/products/93.webp" alt="Leather strap watch" />
        </Link>
      </div>
      <ProductShelf
        title="Everyday style, exclusively for him"
        subtitle="The pieces your wardrobe has been waiting for."
        category="fashion"
      />
      <div className="split-shelves">
        <ProductShelf
          title="Put your best foot forward"
          subtitle="Fresh pairs for every kind of day."
          category="footwear"
        />
        <ProductShelf
          title="A little more home"
          subtitle="Good things for your favourite space."
          category="home"
        />
      </div>
      <ProductShelf
        title="Tech that fits your everyday"
        subtitle="Small essentials. Big upgrades."
        category="electronics"
      />
      <section className="discovery-banner">
        <div>
          <Sparkles size={25} />
          <span>80 products. Over 500 clear product views.</span>
        </div>
        <h2>
          All your everyday.
          <br />
          <em>One good place to find it.</em>
        </h2>
        <Link className="button primary" href="/search">
          Explore all products
        </Link>
      </section>
    </main>
  );
}
