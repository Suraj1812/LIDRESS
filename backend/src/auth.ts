import type { Context, MiddlewareHandler } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from './types';
import type { User } from '../../shared/schemas';
const COOKIE_NAME = 'lidress_session';
const SESSION_SECONDS = 60 * 60 * 24 * 30;
const hex = (bytes: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(bytes instanceof Uint8Array ? bytes.buffer : bytes), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
export const randomToken = () => hex(crypto.getRandomValues(new Uint8Array(32)));
export async function digest(value: string) {
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}
export async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: 'SHA-256',
      },
      key,
      256,
    ),
  );
}
export function sameHash(first: string, second: string) {
  if (first.length !== second.length) return false;
  let difference = 0;
  for (let index = 0; index < first.length; index++)
    difference |= first.charCodeAt(index) ^ second.charCodeAt(index);
  return difference === 0;
}
export const loadUser: MiddlewareHandler<AppEnv> = async (context, next) => {
  const token = getCookie(context, COOKIE_NAME);
  let user: User | null = null;
  if (token)
    user = await context.env.DB.prepare(
      'SELECT users.id,users.name,users.email FROM sessions JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?',
    )
      .bind(await digest(token), Date.now())
      .first<User>();
  context.set('user', user);
  await next();
};
export const requireUser: MiddlewareHandler<AppEnv> = async (context, next) => {
  if (!context.get('user'))
    throw new HTTPException(401, { message: 'Please sign in to continue.' });
  await next();
};
export async function createSession(context: Context<AppEnv>, userId: string) {
  const token = randomToken();
  await context.env.DB.batch([
    context.env.DB.prepare('DELETE FROM sessions WHERE expires_at<?').bind(Date.now()),
    context.env.DB.prepare(
      'INSERT INTO sessions(token_hash,user_id,expires_at) VALUES(?,?,?)',
    ).bind(await digest(token), userId, Date.now() + SESSION_SECONDS * 1000),
  ]);
  setCookie(context, COOKIE_NAME, token, {
    httpOnly: true,
    secure: context.env.ENVIRONMENT === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: SESSION_SECONDS,
  });
}
export async function clearSession(context: Context<AppEnv>) {
  const token = getCookie(context, COOKIE_NAME);
  if (token)
    await context.env.DB.prepare('DELETE FROM sessions WHERE token_hash=?')
      .bind(await digest(token))
      .run();
  deleteCookie(context, COOKIE_NAME, {
    path: '/',
    secure: context.env.ENVIRONMENT === 'production',
    sameSite: 'Lax',
  });
}
