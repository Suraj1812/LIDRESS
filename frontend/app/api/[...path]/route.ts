import type { NextRequest } from 'next/server';

/** Same-origin gateway keeps session cookies first-party on the Vercel storefront. */
async function proxy(request: NextRequest) {
  const upstream =
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:8787' : '');
  if (!upstream)
    return Response.json({ error: 'The shop API is not configured.' }, { status: 503 });
  const origin = new URL(request.url).origin;
  const incomingOrigin = request.headers.get('origin');
  if (incomingOrigin && incomingOrigin !== origin)
    return Response.json({ error: 'Origin is not allowed.' }, { status: 403 });
  const headers = new Headers({ Origin: origin });
  for (const name of ['content-type', 'cookie']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  try {
    const target = new URL(request.nextUrl.pathname + request.nextUrl.search, upstream);
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method)
        ? undefined
        : await request.arrayBuffer(),
      redirect: 'manual',
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const outputHeaders = new Headers({
      'content-type': response.headers.get('content-type') || 'application/json',
      'cache-control': 'no-store',
    });
    for (const cookie of response.headers.getSetCookie())
      outputHeaders.append('set-cookie', cookie);
    return new Response(response.body, {
      status: response.status,
      headers: outputHeaders,
    });
  } catch {
    return Response.json(
      { error: 'The shop is temporarily unavailable. Please try again.' },
      { status: 502 },
    );
  }
}
export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
