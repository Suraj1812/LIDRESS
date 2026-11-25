'use client';
import { ProgressiveImage } from '../commerce/progressive-image';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  Star,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Tag,
  ChevronRight,
  Expand,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { money, discountPercent, type Product } from '../../../shared/catalog';
import { ProductCard } from './product-card';
import { CategoryNav } from '../layout/category-nav';
import dynamic from 'next/dynamic';
import { DeferredContent } from '../commerce/deferred-content';
import { ReviewsSkeleton, DialogSkeleton } from '../commerce/skeletons';
import { useShop } from '../../lib/store';
import { api } from '../../lib/api';
import { useCatalog } from '../../hooks/use-catalog';
import { useHydrated } from '../../hooks/use-hydrated';

const ProductReviews = dynamic(
  () => import('./product-reviews').then((module) => module.ProductReviews),
  { loading: () => <ReviewsSkeleton /> },
);
const Dialog = dynamic(
  () => import('../commerce/dialog').then((module) => module.Dialog),
  { loading: () => <DialogSkeleton /> },
);

export function ProductDetail({ initialProduct }: { initialProduct: Product }) {
  const { data } = useQuery({
    queryKey: ['product', initialProduct.id],
    queryFn: () => api<{ product: Product }>(`/products/${initialProduct.id}`),
    initialData: { product: initialProduct },
    staleTime: 30000,
    initialDataUpdatedAt: 0,
  });
  const product = data.product;
  const [image, setImage] = useState(0);
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : '');
  const [sizeError, setSizeError] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const router = useRouter();
  const hydrated = useHydrated();
  const wishlist = useShop((state) => state.wishlist);
  const toggleWishlist = useShop((state) => state.toggleWishlist);
  const pincode = useShop((state) => state.pincode);
  const location = useShop((state) => state.location);
  const openLocation = useShop((state) => state.openLocation);
  const saved = hydrated && wishlist.includes(product.id);
  const relatedCatalog = useCatalog();
  const related = (relatedCatalog.data?.products || [])
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 6);
  function purchase(buyNow = false) {
    if (!size) {
      setSizeError(true);
      return;
    }
    if (product.stock < 1) {
      toast.error('This product is currently out of stock');
      return;
    }
    if (buyNow) {
      router.push(`/checkout?buyNow=${product.id}&size=${encodeURIComponent(size)}`);
    } else {
      useShop.getState().addItem({ productId: product.id, size, quantity: 1 });
      toast.success('Added to your bag', {
        action: { label: 'View bag', onClick: () => router.push('/cart') },
      });
    }
  }
  return (
    <>
      <CategoryNav compact />
      <main className="product-page">
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <ChevronRight size={12} />
          <Link href={`/search?category=${product.category}`}>{product.category}</Link>
          <ChevronRight size={12} />
          <span>{product.title}</span>
        </div>
        <div className="product-detail-grid">
          <section className="product-gallery">
            <div className="gallery-thumbnails">
              {product.images.map((src, index) => (
                <button
                  key={src}
                  className={image === index ? 'selected' : ''}
                  aria-label={`View ${product.imageLabels?.[index] || `product photo ${index + 1}`}`}
                  aria-pressed={image === index}
                  onClick={() => setImage(index)}
                >
                  <ProgressiveImage
                    src={src}
                    alt={product.imageLabels?.[index] || `Product view ${index + 1}`}
                  />
                </button>
              ))}
            </div>
            <div className="gallery-main">
              <ProgressiveImage
                src={product.images[image]}
                alt={`${product.title} — ${product.imageLabels?.[image] || 'product photo'}`}
                fetchPriority="high"
                loading="eager"
              />
              <button
                className={`wishlist-toggle ${saved ? 'saved' : ''}`}
                aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
                onClick={() => toggleWishlist(product.id)}
              >
                <Heart size={21} fill={saved ? 'currentColor' : 'none'} />
              </button>
              <button
                className="gallery-zoom"
                aria-label="Expand product photo"
                onClick={() => setZoom(true)}
              >
                <Expand size={19} />
              </button>
              <span className="image-caption">
                {product.imageLabels?.[image] || 'Product photo'} · {image + 1} /{' '}
                {product.images.length}
              </span>
            </div>
            <div className="purchase-actions">
              <button
                className="button outline"
                disabled={product.stock < 1}
                onClick={() => purchase()}
              >
                <ShoppingCart size={20} />
                Add to bag
              </button>
              <button
                className="button primary"
                disabled={product.stock < 1}
                onClick={() => purchase(true)}
              >
                Buy now
              </button>
            </div>
          </section>
          <section className="product-information">
            <Link
              href={`/search?brand=${encodeURIComponent(product.brand)}`}
              className="product-brand"
            >
              {product.brand}
            </Link>
            <h1>{product.title}</h1>
            {product.ratingCount > 0 && (
              <div className="detail-rating">
                <span className="rating-pill">
                  {product.rating.toFixed(1)}
                  <Star size={12} fill="currentColor" />
                </span>
                <span>
                  {product.ratingCount.toLocaleString('en-IN')} customer reviews
                </span>
              </div>
            )}
            <span className="special-price">Special price</span>
            <div className="detail-price">
              <strong>{money(product.price)}</strong>
              <del>{money(product.mrp)}</del>
              <span>{discountPercent(product)}% off</span>
            </div>
            <p className="tax-note">Inclusive of all taxes</p>
            <p className="product-coupon">
              <Tag size={16} /> 10% off with WELCOME10 · Min. ₹999 · Up to ₹500
            </p>
            {product.sizes.length > 1 && (
              <div className="size-selection">
                <div>
                  <strong>Select size</strong>
                  <button className="text-button" onClick={() => setSizeGuide(true)}>
                    Size guide
                  </button>
                </div>
                <div className="size-buttons">
                  {product.sizes.map((option) => (
                    <button
                      key={option}
                      className={option === size ? 'selected' : ''}
                      aria-pressed={option === size}
                      onClick={() => {
                        setSize(option);
                        setSizeError(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="field-error" role="alert">
                    Choose a size before continuing.
                  </p>
                )}
              </div>
            )}
            <div className="detail-meta-row">
              <span>Colour</span>
              <strong>{product.color}</strong>
            </div>
            <div className="detail-meta-row">
              <span>Delivery</span>
              <div>
                <button className="delivery-check" onClick={() => openLocation()}>
                  <MapPin size={16} />
                  {hydrated ? pincode : 'Choose PIN code'}
                  <span>Change</span>
                </button>
                <p>
                  Delivery to {hydrated ? location : 'your location'} is confirmed after
                  ordering.
                </p>
                <small>No payment is taken when submitting an order request.</small>
              </div>
            </div>
            <div className="detail-meta-row">
              <span>Seller</span>
              <div>
                <strong>LIDRESS</strong>
                <p>
                  {product.stock > 0
                    ? `${product.stock} units available.`
                    : 'Currently out of stock.'}
                </p>
              </div>
            </div>
            <div className="detail-meta-row">
              <span>Highlights</span>
              <ul>
                {product.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
            <section className="detail-section">
              <h2>Product details</h2>
              <p>{product.description}</p>
              <dl className="specifications">
                {Object.entries(product.specifications).map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <DeferredContent fallback={<ReviewsSkeleton />}>
              <ProductReviews product={product} />
            </DeferredContent>
          </section>
        </div>
        {related.length > 0 && (
          <section className="shop-panel product-shelf">
            <div className="panel-heading">
              <div>
                <h2>Similar products</h2>
              </div>
            </div>
            <div className="shelf-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} compact />
              ))}
            </div>
          </section>
        )}
      </main>
      {zoom && (
        <Dialog
          open={zoom}
          onOpenChange={setZoom}
          title={product.title}
          description={product.imageLabels?.[image] || 'Product photo'}
          className="image-dialog"
        >
          <ProgressiveImage
            src={product.images[image]}
            alt={product.title}
            loading="eager"
          />
          <div className="zoom-navigation">
            {product.images.map((_, index) => (
              <button
                key={index}
                className={image === index ? 'selected' : ''}
                aria-label={`Photo ${index + 1}`}
                onClick={() => setImage(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </Dialog>
      )}
      {sizeGuide && (
        <Dialog
          open={sizeGuide}
          onOpenChange={setSizeGuide}
          title="Find your size"
          description="Indicative measurements. Check the product details for its fit."
        >
          <table className="size-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>
                  {product.category === 'footwear'
                    ? 'Foot length (cm)'
                    : 'Chest (inches)'}
                </th>
              </tr>
            </thead>
            <tbody>
              {(product.category === 'footwear'
                ? [
                    ['6', '24.5'],
                    ['7', '25.5'],
                    ['8', '26.5'],
                    ['9', '27.5'],
                    ['10', '28.5'],
                    ['11', '29.5'],
                  ]
                : [
                    ['S', '36–38'],
                    ['M', '38–40'],
                    ['L', '40–42'],
                    ['XL', '42–44'],
                    ['XXL', '44–46'],
                  ]
              ).map(([label, value]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="fine-print">
            Measurements vary by product. Check the fit and specifications before choosing
            your size.
          </p>
        </Dialog>
      )}
    </>
  );
}
