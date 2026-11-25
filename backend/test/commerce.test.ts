import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Miniflare } from 'miniflare';
import { handleRequest } from '../src/index';
import type { Env } from '../src/types';
import { products } from '../../shared/catalog';

const origin = 'http://localhost:3000';
const runtime = new Miniflare({
  modules: true,
  script: 'export default { fetch() { return new Response("test"); } };',
  compatibilityDate: '2026-08-06',
  d1Databases: ['DB'],
});
let env: Env;
let cookie = '';
const address = {
  name: 'Demo Shopper',
  phone: '9999999999',
  line1: '123 Sample Street',
  locality: '',
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110001',
  type: 'Home',
};
async function request(path: string, method = 'GET', body?: unknown, session = cookie) {
  return handleRequest(
    new Request(`http://worker/api${path}`, {
      method,
      headers: { Origin: origin, 'Content-Type': 'application/json', Cookie: session },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    }),
    env,
  );
}
beforeAll(async () => {
  const DB = await runtime.getD1Database('DB');
  // D1 exec accepts one statement per line, including complete trigger bodies.
  for (const file of ['0001_commerce.sql', '0002_inventory.sql']) {
    const sql = readFileSync(resolve('migrations', file), 'utf8');
    const statements = sql.match(/\s*CREATE TRIGGER[\s\S]*?^END;|[^;]+;/gm) || [];
    for (const statement of statements) await DB.prepare(statement.trim()).run();
  }
  env = {
    DB: DB as unknown as D1Database,
    ALLOWED_ORIGINS: origin,
    ENVIRONMENT: 'development',
    AUTH_RATE_LIMITER: { limit: async () => ({ success: true }) },
  };
});
afterAll(() => runtime.dispose());

describe('Shopping with a real D1 database', () => {
  it('serves the catalogue and rejects cross-origin mutations', async () => {
    expect((await request('/health')).status).toBe(200);
    const catalog = (await (await request('/products?limit=80')).json()) as any;
    expect(catalog.total).toBe(80);
    expect(products.reduce((sum, product) => sum + product.images.length, 0)).toBe(500);
    expect(
      (
        await handleRequest(
          new Request('http://worker/api/auth/logout', {
            method: 'POST',
            headers: { Origin: 'https://untrusted.example' },
          }),
          env,
        )
      ).status,
    ).toBe(403);
    expect((await request('/orders')).status).toBe(401);
  });
  it('registers, signs out, and signs in with hashed credentials', async () => {
    const user = {
      name: 'Demo Shopper',
      email: 'shopper@example.test',
      password: 'LocalTestOnly123!',
    };
    const response = await request('/auth/register', 'POST', user);
    expect(response.status).toBe(201);
    cookie = response.headers.get('set-cookie')!.split(';')[0];
    expect((await request('/auth/me')).status).toBe(200);
    const stored = await env.DB.prepare('SELECT password_hash FROM users').first<any>();
    expect(stored.password_hash).not.toBe(user.password);
    expect((await request('/auth/logout', 'POST')).status).toBe(200);
    expect((await request('/orders')).status).toBe(401);
    expect(
      (await request('/auth/login', 'POST', { ...user, password: 'incorrect' })).status,
    ).toBe(401);
    const login = await request('/auth/login', 'POST', user);
    expect(login.status).toBe(200);
    cookie = login.headers.get('set-cookie')!.split(';')[0];
  });
  it('persists the bag, wishlist and saved addresses, with size validation', async () => {
    expect(
      (
        await request('/account/cart', 'PUT', {
          items: [{ productId: 1, size: 'wrong', quantity: 1 }],
        })
      ).status,
    ).toBe(400);
    expect(
      (
        await request('/account/cart', 'PUT', {
          items: [{ productId: 1, size: 'M', quantity: 2 }],
        })
      ).status,
    ).toBe(200);
    expect(
      ((await (await request('/account/cart')).json()) as any).items[0].quantity,
    ).toBe(2);
    expect((await request('/account/wishlist', 'PUT', { ids: [1, 2] })).status).toBe(200);
    expect(((await (await request('/account/wishlist')).json()) as any).ids).toEqual([
      1, 2,
    ]);
    expect((await request('/account/addresses', 'POST', address)).status).toBe(201);
    expect(
      ((await (await request('/account/addresses')).json()) as any).addresses,
    ).toHaveLength(1);
  });
  it('recalculates totals, reserves stock once, and isolates orders by account', async () => {
    const before = await env.DB.prepare(
      'SELECT stock FROM inventory WHERE product_id=1',
    ).first<any>();
    const checkout = {
      items: [{ productId: 1, size: 'M', quantity: 2 }],
      address,
      coupon: 'WELCOME10',
      idempotencyKey: crypto.randomUUID(),
      total: 1,
      clearCart: false,
    };
    const response = await request('/orders', 'POST', checkout);
    expect(response.status).toBe(201);
    const { order } = (await response.json()) as any;
    expect(order.total).toBe(
      products[0].price * 2 - Math.min(500, Math.round(products[0].price * 0.2)),
    );
    expect(
      ((await (await request('/orders', 'POST', checkout)).json()) as any).order.id,
    ).toBe(order.id);
    expect(
      (
        await env.DB.prepare(
          'SELECT stock FROM inventory WHERE product_id=1',
        ).first<any>()
      ).stock,
    ).toBe(before.stock - 2);
    expect(((await (await request('/account/cart')).json()) as any).items).toHaveLength(
      1,
    );
    const second = await request('/auth/register', 'POST', {
      name: 'Other Shopper',
      email: 'other@example.test',
      password: 'LocalTestOnly123!',
    });
    const otherCookie = second.headers.get('set-cookie')!.split(';')[0];
    expect(
      (await request(`/orders/${order.id}`, 'GET', undefined, otherCookie)).status,
    ).toBe(404);
    expect(
      (await request(`/orders/${order.id}/cancel`, 'POST', undefined, otherCookie))
        .status,
    ).toBe(409);
    expect((await request(`/orders/${order.id}/cancel`, 'POST')).status).toBe(200);
    expect((await request(`/orders/${order.id}/cancel`, 'POST')).status).toBe(409);
    expect(
      (
        await env.DB.prepare(
          'SELECT stock FROM inventory WHERE product_id=1',
        ).first<any>()
      ).stock,
    ).toBe(before.stock);
  });
  it('rolls back the entire order when one item is unavailable', async () => {
    await env.DB.prepare('UPDATE inventory SET stock=0 WHERE product_id=2').run();
    const before = await env.DB.prepare(
      'SELECT stock FROM inventory WHERE product_id=1',
    ).first<any>();
    const response = await request('/orders', 'POST', {
      items: [
        { productId: 1, size: 'M', quantity: 1 },
        { productId: 2, size: 'M', quantity: 1 },
      ],
      address,
      idempotencyKey: crypto.randomUUID(),
    });
    expect(response.status).toBe(409);
    expect(
      (
        await env.DB.prepare(
          'SELECT stock FROM inventory WHERE product_id=1',
        ).first<any>()
      ).stock,
    ).toBe(before.stock);
    expect(((await (await request('/orders')).json()) as any).orders).toHaveLength(1);
  });
});
