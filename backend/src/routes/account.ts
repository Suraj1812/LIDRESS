import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { addressSchema, cartSchema } from '../../../shared/schemas';
import { getProduct, type CartLine } from '../../../shared/catalog';
import { requireUser } from '../auth';
import { readBody } from '../validation';
import type { AppEnv } from '../types';
export const accountRoutes = new Hono<AppEnv>();
accountRoutes.use('*', requireUser);

export function validateItems(items: CartLine[]) {
  const unique = new Set<string>();
  for (const item of items) {
    const product = getProduct(item.productId);
    const key = `${item.productId}:${item.size}`;
    if (!product || !product.sizes.includes(item.size) || unique.has(key))
      throw new HTTPException(400, {
        message: 'Your bag contains an invalid item or size.',
      });
    unique.add(key);
  }
}
accountRoutes.get('/cart', async (context) => {
  const result = await context.env.DB.prepare(
    'SELECT product_id as productId,size,quantity FROM cart_items WHERE user_id=?',
  )
    .bind(context.get('user')!.id)
    .all();
  return context.json({ items: result.results });
});
accountRoutes.put('/cart', async (context) => {
  const { items } = await readBody(context, cartSchema);
  validateItems(items);
  const userId = context.get('user')!.id;
  await context.env.DB.batch([
    context.env.DB.prepare('DELETE FROM cart_items WHERE user_id=?').bind(userId),
    ...items.map((item) =>
      context.env.DB.prepare(
        'INSERT INTO cart_items(user_id,product_id,size,quantity) VALUES(?,?,?,?)',
      ).bind(userId, item.productId, item.size, item.quantity),
    ),
  ]);
  return context.json({ items });
});
accountRoutes.get('/wishlist', async (context) => {
  const result = await context.env.DB.prepare(
    'SELECT product_id FROM wishlist WHERE user_id=?',
  )
    .bind(context.get('user')!.id)
    .all<{ product_id: number }>();
  return context.json({ ids: result.results.map((row) => row.product_id) });
});
accountRoutes.put('/wishlist', async (context) => {
  const { ids } = await readBody(
    context,
    z.object({ ids: z.array(z.number().int()).max(100) }),
  );
  if (ids.some((id) => !getProduct(id)))
    throw new HTTPException(400, { message: 'Invalid saved product.' });
  const userId = context.get('user')!.id;
  await context.env.DB.batch([
    context.env.DB.prepare('DELETE FROM wishlist WHERE user_id=?').bind(userId),
    ...Array.from(new Set(ids)).map((id) =>
      context.env.DB.prepare('INSERT INTO wishlist(user_id,product_id) VALUES(?,?)').bind(
        userId,
        id,
      ),
    ),
  ]);
  return context.json({ ids });
});
accountRoutes.get('/addresses', async (context) => {
  const rows = await context.env.DB.prepare(
    'SELECT id,data FROM addresses WHERE user_id=? ORDER BY created_at DESC',
  )
    .bind(context.get('user')!.id)
    .all<{ id: string; data: string }>();
  return context.json({
    addresses: rows.results.map((row) => ({ id: row.id, ...JSON.parse(row.data) })),
  });
});
accountRoutes.post('/addresses', async (context) => {
  const address = await readBody(context, addressSchema);
  const id = crypto.randomUUID();
  await context.env.DB.prepare('INSERT INTO addresses(id,user_id,data) VALUES(?,?,?)')
    .bind(id, context.get('user')!.id, JSON.stringify(address))
    .run();
  return context.json({ address: { ...address, id } }, 201);
});
accountRoutes.delete('/addresses/:id', async (context) => {
  await context.env.DB.prepare('DELETE FROM addresses WHERE id=? AND user_id=?')
    .bind(context.req.param('id'), context.get('user')!.id)
    .run();
  return context.json({ ok: true });
});
