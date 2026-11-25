import catalog from './products.json';

export interface Product {
  id: number;
  slug: string;
  title: string;
  brand: string;
  category: string;
  type: string;
  price: number;
  mrp: number;
  images: string[];
  imageLabels: string[];
  color: string;
  rating: number;
  ratingCount: number;
  stock: number;
  sizes: string[];
  description: string;
  highlights: string[];
  specifications: Record<string, string>;
  badge: string;
  featured: boolean;
}

export const products: Product[] = catalog.map((product) => ({
  ...product,
  rating: 0,
  ratingCount: 0,
  specifications: Object.fromEntries(
    Object.entries(product.specifications).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string',
    ),
  ),
}));
export const categories = [
  { id: 'all', name: 'For you', image: '/products/100.webp', caption: 'Discover more' },
  {
    id: 'fashion',
    name: 'Men’s fashion',
    image: '/images/check-shirt.png',
    caption: 'Everyday style',
  },
  {
    id: 'footwear',
    name: 'Footwear',
    image: '/products/88.webp',
    caption: 'Find your stride',
  },
  {
    id: 'watches',
    name: 'Watches',
    image: '/products/93.webp',
    caption: 'Make time for style',
  },
  {
    id: 'mobiles',
    name: 'Mobiles',
    image: '/products/123.webp',
    caption: 'Stay connected',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    image: '/products/100.webp',
    caption: 'Upgrade your everyday',
  },
  {
    id: 'home',
    name: 'Home & living',
    image: '/products/12.webp',
    caption: 'Make room for good things',
  },
  {
    id: 'accessories',
    name: 'Accessories',
    image: '/products/154.webp',
    caption: 'The finishing touch',
  },
  { id: 'sports', name: 'Sports', image: '/products/137.webp', caption: 'Keep moving' },
  {
    id: 'grooming',
    name: 'Grooming',
    image: '/products/6.webp',
    caption: 'Your daily essentials',
  },
];
export const money = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
export const discountPercent = (product: Pick<Product, 'price' | 'mrp'>) =>
  Math.round((1 - product.price / product.mrp) * 100);
export const getProduct = (id: number) => products.find((product) => product.id === id);
export const FREE_DELIVERY_MINIMUM = 999;
export const DELIVERY_FEE = 49;

export interface CartLine {
  productId: number;
  size: string;
  quantity: number;
}
export function calculateTotals(items: CartLine[], coupon = '') {
  const subtotal = items.reduce(
    (sum, item) => sum + (getProduct(item.productId)?.price || 0) * item.quantity,
    0,
  );
  const mrp = items.reduce(
    (sum, item) => sum + (getProduct(item.productId)?.mrp || 0) * item.quantity,
    0,
  );
  const couponDiscount =
    coupon === 'WELCOME10' && subtotal >= 999
      ? Math.min(500, Math.round(subtotal * 0.1))
      : 0;
  const shipping = subtotal === 0 || subtotal >= FREE_DELIVERY_MINIMUM ? 0 : DELIVERY_FEE;
  return {
    subtotal,
    mrp,
    savings: mrp - subtotal,
    couponDiscount,
    shipping,
    total: subtotal - couponDiscount + shipping,
  };
}
