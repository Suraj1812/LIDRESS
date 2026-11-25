import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleRequest, type Env } from '../src/index';

const createToken = vi.hoisted(() => vi.fn());
vi.mock('@decartai/sdk', () => ({
  createDecartClient: () => ({ tokens: { create: createToken } }),
}));
const origin = 'https://lidress.vercel.app';
function environment(overrides: Partial<Env> = {}): Env {
  return {
    DECART_API_KEY: 'server-only-test-key',
    ALLOWED_ORIGINS: origin,
    ENVIRONMENT: 'production',
    TOKEN_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: true }) },
    ...overrides,
  };
}
function tokenRequest(requestOrigin = origin) {
  return new Request('https://api.example.com/api/try-on/token', {
    method: 'POST',
    headers: { Origin: requestOrigin, 'CF-Connecting-IP': '192.0.2.1' },
  });
}

beforeEach(() => vi.clearAllMocks());
describe('Cloudflare token boundary', () => {
  it('rejects an unknown origin before calling Decart', async () => {
    const response = await handleRequest(
      tokenRequest('https://untrusted.example'),
      environment(),
    );
    expect(response.status).toBe(403);
    expect(createToken).not.toHaveBeenCalled();
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
  });
  it('rejects requests without an origin', async () => {
    const request = new Request('https://api.example.com/api/try-on/token', {
      method: 'POST',
    });
    expect((await handleRequest(request, environment())).status).toBe(403);
  });
  it('answers preflight only for the configured frontend', async () => {
    const request = new Request('https://api.example.com/api/try-on/token', {
      method: 'OPTIONS',
      headers: { Origin: origin },
    });
    const response = await handleRequest(request, environment());
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(origin);
  });
  it('returns a clear setup state without the permanent key', async () => {
    const env = environment({ DECART_API_KEY: undefined });
    const health = await handleRequest(
      new Request('https://api.example.com/api/health'),
      env,
    );
    expect(await health.json()).toMatchObject({ status: 'ok', aiConfigured: false });
    expect((await handleRequest(tokenRequest(), env)).status).toBe(503);
    expect(createToken).not.toHaveBeenCalled();
  });
  it('rate limits token creation before calling Decart', async () => {
    const env = environment({
      TOKEN_RATE_LIMITER: { limit: vi.fn().mockResolvedValue({ success: false }) },
    });
    const response = await handleRequest(tokenRequest(), env);
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('60');
    expect(createToken).not.toHaveBeenCalled();
  });
  it('mints a short, origin-restricted and model-restricted session', async () => {
    createToken.mockResolvedValue({
      apiKey: 'ephemeral-key',
      expiresAt: '2026-11-25T06:00:00Z',
    });
    const response = await handleRequest(tokenRequest(), environment());
    expect(response.status).toBe(200);
    expect(createToken).toHaveBeenCalledWith({
      expiresIn: 60,
      allowedModels: ['lucy-vton-3.6'],
      allowedOrigins: [origin],
      constraints: { realtime: { maxSessionDuration: 120 } },
    });
    const body = await response.text();
    expect(body).toContain('ephemeral-key');
    expect(body).not.toContain('server-only-test-key');
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
  it('hides upstream errors that could contain secrets', async () => {
    createToken.mockRejectedValue(new Error('server-only-test-key'));
    const response = await handleRequest(tokenRequest(), environment());
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('server-only-test-key');
  });
  it('serves the shared catalogue', async () => {
    const response = await handleRequest(
      new Request('https://api.example.com/api/products'),
      environment(),
    );
    const body = (await response.json()) as { products: unknown[] };
    expect(body.products).toHaveLength(7);
  });
});
