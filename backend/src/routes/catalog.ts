import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { products, categories, getProduct } from '../../../shared/catalog';
import { reviewSchema } from '../../../shared/schemas';
import { requireUser } from '../auth';
import { readBody } from '../validation';
import type { AppEnv } from '../types';
export const catalogRoutes = new Hono<AppEnv>();
async function currentProducts(database: D1Database) {
  const rows = await database
    .prepare(
      'SELECT inventory.product_id,inventory.stock,COALESCE(AVG(reviews.rating),0) AS rating,COUNT(reviews.id) AS ratingCount FROM inventory LEFT JOIN reviews ON reviews.product_id=inventory.product_id GROUP BY inventory.product_id',
    )
    .all<{ product_id: number; stock: number; rating: number; ratingCount: number }>();
  const inventory = new Map(rows.results.map((row) => [row.product_id, row]));
  return products.map((product) => {
    const current = inventory.get(product.id);
    return {
      ...product,
      stock: current?.stock ?? 0,
      rating: Math.round((current?.rating ?? 0) * 10) / 10,
      ratingCount: current?.ratingCount ?? 0,
    };
  });
}
catalogRoutes.get('/', async (context) => {
  const query = context.req.query();
  const term = (query.q || '').toLowerCase();
  const minimum = Math.max(0, Number(query.minPrice) || 0);
  const maximum = Number(query.maxPrice) || Infinity;
  const brands = query.brand?.split(',') || [];
  let results = (await currentProducts(context.env.DB)).filter(
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
  return context.json({
    products: results.slice((page - 1) * limit, page * limit),
    total,
    page,
    pages: Math.ceil(total / limit),
    categories,
  });
});
catalogRoutes.get('/:id', async (context) => {
  const product = getProduct(Number(context.req.param('id')));
  if (!product) throw new HTTPException(404, { message: 'Product not found.' });
  const current = (await currentProducts(context.env.DB)).find(
    (item) => item.id === product.id,
  )!;
  return context.json({ product: current });
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
