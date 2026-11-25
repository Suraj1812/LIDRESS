import { createDecartClient } from '@decartai/sdk';
import { products } from '../../shared/catalog';

export interface Env {
  DECART_API_KEY?: string;
  ALLOWED_ORIGINS: string;
  ENVIRONMENT: 'development' | 'production';
  TOKEN_RATE_LIMITER: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const MODEL = 'lucy-vton-3.6';

/** Keep CORS explicit: preview deployments must be added individually. */
function allowedOrigins(env: Env): string[] {
  return env.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const origins = allowedOrigins(env);
  const isAllowedOrigin = origin !== null && origins.includes(origin);
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    Vary: 'Origin',
  });

  if (isAllowedOrigin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    headers.set('Access-Control-Max-Age', '86400');
  }
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers });

  if (origin && !isAllowedOrigin) return json({ error: 'Origin is not allowed.' }, 403);
  if (request.method === 'OPTIONS') {
    return isAllowedOrigin
      ? new Response(null, { status: 204, headers })
      : json({ error: 'Origin is required.' }, 403);
  }
  if (url.pathname === '/api/health' && request.method === 'GET') {
    return json({
      status: 'ok',
      service: 'lidress-api',
      aiConfigured: Boolean(env.DECART_API_KEY),
    });
  }
  if (url.pathname === '/api/products' && request.method === 'GET') {
    return json({ products });
  }
  if (url.pathname !== '/api/try-on/token') return json({ error: 'Not found.' }, 404);
  if (request.method !== 'POST')
    return json({ error: 'Use POST for this endpoint.' }, 405);
  if (!isAllowedOrigin) return json({ error: 'Origin is required.' }, 403);

  if (!env.DECART_API_KEY) {
    return json(
      { error: 'AI try-on is not configured yet. Camera preview is still available.' },
      503,
    );
  }
  const ip = request.headers.get('CF-Connecting-IP');
  // Cloudflare supplies this header in production; local development uses one shared bucket.
  if (!ip && env.ENVIRONMENT === 'production')
    return json({ error: 'Unable to identify request.' }, 403);
  const { success } = await env.TOKEN_RATE_LIMITER.limit({
    key: `try-on:${ip || 'local'}`,
  });
  if (!success) {
    headers.set('Retry-After', '60');
    return json(
      { error: 'Please wait a minute before starting another AI session.' },
      429,
    );
  }
  try {
    const client = createDecartClient({ apiKey: env.DECART_API_KEY });
    const token = await client.tokens.create({
      expiresIn: 60,
      allowedModels: [MODEL],
      allowedOrigins: [origin],
      constraints: { realtime: { maxSessionDuration: 120 } },
    });
    return json({
      apiKey: token.apiKey,
      expiresAt: token.expiresAt,
      model: MODEL,
      maxSessionSeconds: 120,
    });
  } catch {
    // Never send upstream credentials or verbose provider errors to the browser/logs.
    return json(
      { error: 'The AI service could not start a session. Please try again.' },
      502,
    );
  }
}

export default { fetch: handleRequest } satisfies ExportedHandler<Env>;
