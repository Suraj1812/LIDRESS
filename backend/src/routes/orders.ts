import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { checkoutSchema, type Order } from '../../../shared/schemas';
import { calculateTotals, getProduct, type CartLine } from '../../../shared/catalog';
import { requireUser } from '../auth';
import { readBody } from '../validation';
import { validateItems } from './account';
import type { AppEnv } from '../types';
export const orderRoutes = new Hono<AppEnv>();
orderRoutes.use('*', requireUser);
interface OrderRow {
  id: string;
  created_at: string;
  status: 'placed' | 'cancelled';
  address: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: string;
}
async function hydrateOrder(database: D1Database, row: OrderRow): Promise<Order> {
  const items = await database
    .prepare(
      'SELECT product_id as productId,title,image,size,quantity,price FROM order_items WHERE order_id=?',
    )
    .bind(row.id)
    .all<Order['items'][number]>();
  return {
    id: row.id,
    createdAt: row.created_at.replace(' ', 'T') + 'Z',
    status: row.status,
    address: JSON.parse(row.address),
    subtotal: row.subtotal,
    discount: row.discount,
    shipping: row.shipping,
    total: row.total,
    coupon: row.coupon,
    items: items.results,
  };
}
orderRoutes.get('/', async (context) => {
  const rows = await context.env.DB.prepare(
    'SELECT * FROM orders WHERE user_id=? ORDER BY created_at DESC LIMIT 100',
  )
    .bind(context.get('user')!.id)
    .all<OrderRow>();
  return context.json({
    orders: await Promise.all(
      rows.results.map((row) => hydrateOrder(context.env.DB, row)),
    ),
  });
});
orderRoutes.get('/:id', async (context) => {
  const row = await context.env.DB.prepare(
    'SELECT * FROM orders WHERE id=? AND user_id=?',
  )
    .bind(context.req.param('id'), context.get('user')!.id)
    .first<OrderRow>();
  if (!row) throw new HTTPException(404, { message: 'Order not found.' });
  return context.json({ order: await hydrateOrder(context.env.DB, row) });
});
orderRoutes.post('/', async (context) => {
  const data = await readBody(context, checkoutSchema);
  validateItems(data.items);
  const userId = context.get('user')!.id;
  const existing = await context.env.DB.prepare(
    'SELECT * FROM orders WHERE user_id=? AND idempotency_key=?',
  )
    .bind(userId, data.idempotencyKey)
    .first<OrderRow>();
  if (existing)
    return context.json({ order: await hydrateOrder(context.env.DB, existing) });
  // Stock belongs to a product across every size, so validate combined quantities too.
  const grouped = new Map<number, number>();
  for (const item of data.items)
    grouped.set(item.productId, (grouped.get(item.productId) || 0) + item.quantity);
  if (Array.from(grouped.values()).some((quantity) => quantity > 10))
    throw new HTTPException(400, {
      message: 'A maximum of 10 units per product can be ordered.',
    });
  const totals = calculateTotals(data.items, data.coupon);
  if (data.coupon && totals.couponDiscount === 0)
    throw new HTTPException(400, {
      message: 'WELCOME10 requires a minimum subtotal of ₹999.',
    });
  const id = 'LD-' + crypto.randomUUID().slice(0, 8).toUpperCase();
  try {
    // D1 batches are transactional. Stock triggers abort the complete order on shortage.
    await context.env.DB.batch([
      context.env.DB.prepare(
        'INSERT INTO orders(id,user_id,address,subtotal,discount,shipping,total,coupon,idempotency_key) VALUES(?,?,?,?,?,?,?,?,?)',
      ).bind(
        id,
        userId,
        JSON.stringify(data.address),
        totals.subtotal,
        totals.couponDiscount,
        totals.shipping,
        totals.total,
        data.coupon,
        data.idempotencyKey,
      ),
      ...data.items.map((item: CartLine) => {
        const product = getProduct(item.productId)!;
        return context.env.DB.prepare(
          'INSERT INTO order_items(order_id,product_id,title,image,size,quantity,price) VALUES(?,?,?,?,?,?,?)',
        ).bind(
          id,
          product.id,
          product.title,
          product.images[0],
          item.size,
          item.quantity,
          product.price,
        );
      }),
      ...(data.clearCart
        ? [context.env.DB.prepare('DELETE FROM cart_items WHERE user_id=?').bind(userId)]
        : []),
    ]);
  } catch {
    const retry = await context.env.DB.prepare(
      'SELECT * FROM orders WHERE user_id=? AND idempotency_key=?',
    )
      .bind(userId, data.idempotencyKey)
      .first<OrderRow>();
    if (retry) return context.json({ order: await hydrateOrder(context.env.DB, retry) });
    throw new HTTPException(409, {
      message:
        'One of these items is no longer available in that quantity. Please update your bag.',
    });
  }
  const row = await context.env.DB.prepare('SELECT * FROM orders WHERE id=?')
    .bind(id)
    .first<OrderRow>();
  return context.json({ order: await hydrateOrder(context.env.DB, row!) }, 201);
});
orderRoutes.post('/:id/cancel', async (context) => {
  const result = await context.env.DB.prepare(
    "UPDATE orders SET status='cancelled' WHERE id=? AND user_id=? AND status='placed'",
  )
    .bind(context.req.param('id'), context.get('user')!.id)
    .run();
  if (!result.meta.changes)
    throw new HTTPException(409, { message: 'This order cannot be cancelled.' });
  return context.json({ ok: true });
});
