import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { products, categories, getProduct } from '../../../shared/catalog';
import { reviewSchema } from '../../../shared/schemas';
import { requireUser } from '../auth';
import { readBody } from '../validation';
import type { AppEnv } from '../types';
export const catalogRoutes = new Hono<AppEnv>();
catalogRoutes.get('/', async (context) => {
  const query = context.req.query();
  const term = (query.q || '').toLowerCase();
  const minimum = Math.max(0, Number(query.minPrice) || 0);
  const maximum = Number(query.maxPrice) || Infinity;
  const brands = query.brand?.split(',') || [];
  let results = products.filter(
    (product) =>
      (!query.category ||
        query.category === 'all' ||
        product.category === query.category) &&
      (!term ||
        `${product.title} ${product.brand} ${product.type}`
          .toLowerCase()
          .includes(term)) &&
      product.price >= minimum &&
      product.price <= maximum &&
      product.rating >= (Number(query.rating) || 0) &&
      (!brands.length || brands.includes(product.brand)),
  );
  if (query.sort === 'price-asc') results.sort((a, b) => a.price - b.price);
  if (query.sort === 'price-desc') results.sort((a, b) => b.price - a.price);
  if (query.sort === 'rating') results.sort((a, b) => b.rating - a.rating);
  if (query.sort === 'discount')
    results.sort((a, b) => 1 - b.price / b.mrp - (1 - a.price / a.mrp));
  const total = results.length;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(80, Math.max(1, Number(query.limit) || 24));
  const stock = await context.env.DB.prepare(
    'SELECT product_id,stock FROM inventory',
  ).all<{ product_id: number; stock: number }>();
  const inventory = new Map(stock.results.map((row) => [row.product_id, row.stock]));
  return context.json({
    products: results.slice((page - 1) * limit, page * limit).map((product) => ({
      ...product,
      stock: inventory.get(product.id) ?? product.stock,
    })),
    total,
    page,
    pages: Math.ceil(total / limit),
    categories,
  });
});
catalogRoutes.get('/:id', async (context) => {
  const product = getProduct(Number(context.req.param('id')));
  if (!product) throw new HTTPException(404, { message: 'Product not found.' });
  const inventory = await context.env.DB.prepare(
    'SELECT stock FROM inventory WHERE product_id=?',
  )
    .bind(product.id)
    .first<{ stock: number }>();
  return context.json({ product: { ...product, stock: inventory?.stock ?? 0 } });
});
catalogRoutes.get('/:id/reviews', async (context) => {
  const productId = Number(context.req.param('id'));
  if (!getProduct(productId))
    throw new HTTPException(404, { message: 'Product not found.' });
  const rows = await context.env.DB.prepare(
    'SELECT reviews.id,users.name,reviews.rating,reviews.title,reviews.comment,reviews.created_at as createdAt FROM reviews JOIN users ON users.id=reviews.user_id WHERE product_id=? ORDER BY reviews.created_at DESC LIMIT 50',
  )
    .bind(productId)
    .all();
  return context.json({ reviews: rows.results });
});
catalogRoutes.post('/:id/reviews', requireUser, async (context) => {
  const productId = Number(context.req.param('id'));
  if (!getProduct(productId))
    throw new HTTPException(404, { message: 'Product not found.' });
  const review = await readBody(context, reviewSchema);
  const user = context.get('user')!;
  await context.env.DB.prepare(
    'INSERT INTO reviews(id,user_id,product_id,rating,title,comment) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id,product_id) DO UPDATE SET rating=excluded.rating,title=excluded.title,comment=excluded.comment,created_at=CURRENT_TIMESTAMP',
  )
    .bind(
      crypto.randomUUID(),
      user.id,
      productId,
      review.rating,
      review.title,
      review.comment,
    )
    .run();
  return context.json({ ok: true }, 201);
});
