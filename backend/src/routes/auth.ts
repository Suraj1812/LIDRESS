import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { registerSchema, loginSchema, type User } from '../../../shared/schemas';
import {
  createSession,
  clearSession,
  passwordHash,
  randomToken,
  sameHash,
} from '../auth';
import { readBody } from '../validation';
import type { AppEnv } from '../types';
export const authRoutes = new Hono<AppEnv>();
authRoutes.get('/me', (context) => context.json({ user: context.get('user') }));
authRoutes.use('/register', async (context, next) => {
  const result = await context.env.AUTH_RATE_LIMITER.limit({
    key: context.req.header('CF-Connecting-IP') || 'local',
  });
  if (!result.success)
    throw new HTTPException(429, {
      message: 'Too many attempts. Try again in a minute.',
    });
  await next();
});
authRoutes.use('/login', async (context, next) => {
  const result = await context.env.AUTH_RATE_LIMITER.limit({
    key: context.req.header('CF-Connecting-IP') || 'local',
  });
  if (!result.success)
    throw new HTTPException(429, {
      message: 'Too many attempts. Try again in a minute.',
    });
  await next();
});
authRoutes.post('/register', async (context) => {
  const values = await readBody(context, registerSchema);
  const existing = await context.env.DB.prepare('SELECT id FROM users WHERE email=?')
    .bind(values.email)
    .first();
  if (existing)
    throw new HTTPException(409, {
      message: 'An account with this email already exists. Sign in instead.',
    });
  const user = { id: crypto.randomUUID(), name: values.name, email: values.email };
  const salt = randomToken();
  try {
    await context.env.DB.prepare(
      'INSERT INTO users(id,name,email,password_hash,salt) VALUES(?,?,?,?,?)',
    )
      .bind(
        user.id,
        user.name,
        user.email,
        await passwordHash(values.password, salt),
        salt,
      )
      .run();
  } catch {
    throw new HTTPException(409, {
      message: 'Unable to create the account. Try signing in.',
    });
  }
  await createSession(context, user.id);
  return context.json({ user }, 201);
});
authRoutes.post('/login', async (context) => {
  const values = await readBody(context, loginSchema);
  const row = await context.env.DB.prepare('SELECT * FROM users WHERE email=?')
    .bind(values.email)
    .first<User & { password_hash: string; salt: string }>();
  const hash = await passwordHash(values.password, row?.salt || 'invalid-account-salt');
  if (!row || !sameHash(hash, row.password_hash))
    throw new HTTPException(401, { message: 'Email or password is incorrect.' });
  await createSession(context, row.id);
  return context.json({ user: { id: row.id, name: row.name, email: row.email } });
});
authRoutes.post('/logout', async (context) => {
  await clearSession(context);
  return context.json({ ok: true });
});
