'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  Star,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Tag,
  ChevronRight,
  Expand,
  Check,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { products, money, discountPercent, type Product } from '../../../shared/catalog';
import { ProductCard } from './product-card';
import { CategoryNav } from '../layout/category-nav';
import { Dialog } from '../commerce/dialog';
import { useShop } from '../../lib/store';
import { api } from '../../lib/api';
import { useSession } from '../../hooks/use-session';
import { useHydrated } from '../../hooks/use-hydrated';

type Review = {
  id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  createdAt: string;
};
function ProductReviews({ product }: { product: Product }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [writing, setWriting] = useState(false);
  const [rating, setRating] = useState(5);
  const { data } = useQuery({
    queryKey: ['reviews', product.id],
    queryFn: () => api<{ reviews: Review[] }>(`/products/${product.id}/reviews`),
  });
  const mutation = useMutation({
    mutationFn: (values: { rating: number; title: string; comment: string }) =>
      api(`/products/${product.id}/reviews`, {
        method: 'POST',
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', product.id] });
      setWriting(false);
      toast.success('Your review has been saved');
    },
  });
  return (
    <section className="detail-section">
      <div className="section-heading">
        <h2>Ratings & reviews</h2>
        <button
          className="button outline"
          onClick={() => {
            if (!session?.user) useShop.getState().openAuth();
            else setWriting(!writing);
          }}
        >
          Write a review
        </button>
      </div>
      <div className="review-overview">
        <strong>
          {product.rating.toFixed(1)} <Star fill="currentColor" size={22} />
        </strong>
        <span>
          Sample catalogue rating
          <br />
          <small>Customer reviews below are submitted on LIDRESS.</small>
        </span>
      </div>
      {writing && (
        <form
          className="form-stack review-form"
          onSubmit={(event) => {
            event.preventDefault();
            const values = new FormData(event.currentTarget);
            mutation.mutate({
              rating,
              title: String(values.get('title')),
              comment: String(values.get('comment')),
            });
          }}
        >
          <label>
            Your rating
            <select
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} stars
                </option>
              ))}
            </select>
          </label>
          <label>
            Review title
            <input
              name="title"
              minLength={3}
              maxLength={100}
              required
              placeholder="What stood out?"
            />
          </label>
          <label>
            Your experience
            <textarea
              name="comment"
              minLength={10}
              maxLength={1000}
              required
              rows={3}
              placeholder="Tell other shoppers what you think."
            />
          </label>
          {mutation.error && <p className="form-error">{mutation.error.message}</p>}
          <button className="button primary" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Submit review'}
          </button>
        </form>
      )}
      {data?.reviews.length ? (
        data.reviews.map((review) => (
          <article className="review" key={review.id}>
            <span className="rating-pill">
              {review.rating}
              <Star size={10} fill="currentColor" />
            </span>
            <div>
              <strong>{review.title}</strong>
              <p>{review.comment}</p>
              <small>
                {review.name} ·{' '}
                {new Date(review.createdAt.replace(' ', 'T') + 'Z').toLocaleDateString(
                  'en-IN',
                )}
              </small>
            </div>
          </article>
        ))
      ) : (
        <p className="muted">Be the first to share your experience with this product.</p>
      )}
    </section>
  );
}
export function ProductDetail({ initialProduct }: { initialProduct: Product }) {
  const { data } = useQuery({
    queryKey: ['product', initialProduct.id],
    queryFn: () => api<{ product: Product }>(`/products/${initialProduct.id}`),
    initialData: { product: initialProduct },
    staleTime: 10000,
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
  const related = products
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
                  <img
                    src={src}
                    alt={product.imageLabels?.[index] || `Product view ${index + 1}`}
                  />
                </button>
              ))}
            </div>
            <div className="gallery-main">
              <img
                src={product.images[image]}
                alt={`${product.title} — ${product.imageLabels?.[image] || 'product photo'}`}
                fetchPriority="high"
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
            <div className="detail-rating">
              <span className="rating-pill">
                {product.rating.toFixed(1)}
                <Star size={12} fill="currentColor" />
              </span>
              <span>{product.ratingCount.toLocaleString('en-IN')} sample ratings</span>
              <span className="select-badge">
                <ShieldCheck size={13} />
                LIDRESS SELECT
              </span>
            </div>
            <span className="special-price">Special price</span>
            <div className="detail-price">
              <strong>{money(product.price)}</strong>
              <del>{money(product.mrp)}</del>
              <span>{discountPercent(product)}% off</span>
            </div>
            <p className="tax-note">Inclusive of all taxes · Demo catalogue price</p>
            <div className="offer-list">
              <h3>Good things included</h3>
              <p>
                <Tag size={17} />
                <span>
                  <strong>Welcome offer</strong> Get 10% off with WELCOME10. Min. ₹999,
                  max. ₹500 off.
                </span>
              </p>
              <p>
                <Truck size={17} />
                <span>
                  <strong>
                    {product.price >= 999 ? 'Free delivery' : 'Delivery for ₹49'}
                  </strong>{' '}
                  Free shipping on bags of ₹999 or more.
                </span>
              </p>
              <p>
                <ShieldCheck size={17} />
                <span>
                  <strong>Secure account</strong> Save your favourites and keep your
                  orders together.
                </span>
              </p>
            </div>
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
                  Estimated 3–5 business days to {hydrated ? location : 'your location'}.
                </p>
                <small>
                  Illustrative estimate. This store does not dispatch real orders.
                </small>
              </div>
            </div>
            <div className="detail-meta-row">
              <span>Seller</span>
              <div>
                <strong>LIDRESS Demo Store</strong>
                <p>
                  Demo marketplace inventory.{' '}
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
            <ProductReviews product={product} />
          </section>
        </div>
        {related.length > 0 && (
          <section className="shop-panel product-shelf">
            <div className="panel-heading">
              <div>
                <h2>A few more good finds</h2>
                <p>Because the right one could be right here.</p>
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
      <Dialog
        open={zoom}
        onOpenChange={setZoom}
        title={product.title}
        description={product.imageLabels?.[image] || 'Product photo'}
        className="image-dialog"
      >
        <img src={product.images[image]} alt={product.title} />
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
                {product.category === 'footwear' ? 'Foot length (cm)' : 'Chest (inches)'}
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
          This is an illustrative size guide for the demo catalogue, not a manufacturer
          fit guarantee.
        </p>
      </Dialog>
    </>
  );
}
