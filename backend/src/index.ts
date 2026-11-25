import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { HTTPException } from 'hono/http-exception';
import { loadUser } from './auth';
import { authRoutes } from './routes/auth';
import { catalogRoutes } from './routes/catalog';
import { accountRoutes } from './routes/account';
import { orderRoutes } from './routes/orders';
import type { AppEnv, Env } from './types';
export type { Env } from './types';
const app = new Hono<AppEnv>();
app.use('*', async (context, next) => {
  context.header('Cache-Control', 'no-store');
  context.header('X-Content-Type-Options', 'nosniff');
  const origin = context.req.header('Origin');
  const allowed = context.env.ALLOWED_ORIGINS.split(',').map((value: string) =>
    value.trim(),
  );
  if (origin && !allowed.includes(origin))
    return context.json({ error: 'Origin is not allowed.' }, 403);
  if (!['GET', 'HEAD', 'OPTIONS'].includes(context.req.method) && !origin)
    return context.json({ error: 'Origin is required.' }, 403);
  await next();
});
app.use(
  '*',
  cors({
    origin: (origin, context) =>
      context.env.ALLOWED_ORIGINS.split(',')
        .map((value: string) => value.trim())
        .includes(origin)
        ? origin
        : '',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  }),
);
app.use(
  '*',
  bodyLimit({
    maxSize: 32 * 1024,
    onError: (context) => context.json({ error: 'Request is too large.' }, 413),
  }),
);
const requiredTables = [
  'users',
  'sessions',
  'cart_items',
  'wishlist',
  'addresses',
  'inventory',
  'orders',
  'order_items',
  'reviews',
];
app.get('/api/health', async (context) => {
  try {
    const schema = await context.env.DB.prepare(
      "SELECT name FROM sqlite_master WHERE type='table'",
    ).all<{ name: string }>();
    const tables = new Set(schema.results.map((table) => table.name));
    if (!requiredTables.every((table) => tables.has(table))) {
      return context.json(
        {
          status: 'initializing',
          service: 'lidress-commerce',
          database: 'schema-incomplete',
        },
        503,
      );
    }
    return context.json({
      status: 'ok',
      service: 'lidress-commerce',
      database: 'connected',
    });
  } catch {
    return context.json(
      { status: 'initializing', service: 'lidress-commerce', database: 'unavailable' },
      503,
    );
  }
});
app.use('/api/*', loadUser);
app.route('/api/auth', authRoutes);
app.route('/api/products', catalogRoutes);
app.route('/api/account', accountRoutes);
app.route('/api/orders', orderRoutes);
app.get('/api/delivery/:pincode', (context) => {
  const pincode = context.req.param('pincode');
  if (!/^[1-9]\d{5}$/.test(pincode))
    return context.json({ error: 'Enter a valid six-digit PIN code.' }, 400);
  const cities: Record<string, string> = {
    '11': 'New Delhi',
    '12': 'Gurugram / Faridabad',
    '20': 'Uttar Pradesh',
    '40': 'Mumbai',
    '41': 'Pune',
    '50': 'Hyderabad',
    '56': 'Bengaluru',
    '60': 'Chennai',
    '70': 'Kolkata',
    '30': 'Rajasthan',
    '38': 'Ahmedabad',
  };
  return context.json({
    pincode,
    city: cities[pincode.slice(0, 2)] || 'Your location',
    deliveryStatus: 'confirmation-required',
  });
});
app.notFound((context) => context.json({ error: 'Not found.' }, 404));
app.onError((error, context) => {
  if (error instanceof HTTPException)
    return context.json({ error: error.message }, error.status);
  console.error('API request failed', {
    method: context.req.method,
    path: context.req.path,
    message: error.message,
  });
  if (/no such (?:table|column)/i.test(error.message)) {
    return context.json(
      {
        error: 'Shop data is being prepared. Please try again shortly.',
        code: 'DATABASE_NOT_READY',
      },
      503,
    );
  }
  return context.json({ error: 'Something went wrong. Please try again.' }, 500);
});
export const handleRequest = (request: Request, env: Env) => app.fetch(request, env);
export default app;
