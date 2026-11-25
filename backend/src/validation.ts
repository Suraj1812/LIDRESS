import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { z } from 'zod';

export async function readBody<T extends z.ZodType>(
  context: Context,
  schema: T,
): Promise<z.output<T>> {
  let body: unknown;
  try {
    body = await context.req.json();
  } catch {
    throw new HTTPException(400, { message: 'Send valid JSON.' });
  }
  const result = schema.safeParse(body);
  if (!result.success)
    throw new HTTPException(400, {
      message: result.error.issues[0]?.message || 'Check the form fields.',
    });
  return result.data;
}
