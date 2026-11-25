export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** All browser requests stay on this origin; Next proxies them to Cloudflare. */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'same-origin',
    signal: options.signal || AbortSignal.timeout(15000),
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new ApiError('The shop is temporarily unavailable.', response.status);
  }
  if (!response.ok)
    throw new ApiError(result.error || 'Please try again.', response.status);
  return result as T;
}
