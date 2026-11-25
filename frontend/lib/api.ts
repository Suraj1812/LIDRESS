/** The URL is public; the permanent Decart key belongs exclusively to the Worker. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:8787' : '');

interface TryOnCredential {
  apiKey: string;
  expiresAt: string;
  model: 'lucy-vton-3.6';
  maxSessionSeconds: number;
}

export async function requestTryOnCredential(): Promise<TryOnCredential> {
  if (!API_URL) throw new Error('The optional AI backend is not configured.');
  const response = await fetch(`${API_URL}/api/try-on/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15_000),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || 'Unable to connect to the fitting room.');
  return result;
}

export async function getBackendStatus(): Promise<boolean> {
  if (!API_URL) return false;
  const response = await fetch(`${API_URL}/api/health`, {
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error('The fitting-room backend is unavailable.');
  const result = await response.json();
  return result.aiConfigured === true;
}
