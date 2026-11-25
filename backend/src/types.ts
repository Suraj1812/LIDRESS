import type { User } from '../../shared/schemas';
export interface Env {
  DB: D1Database;
  ALLOWED_ORIGINS: string;
  ENVIRONMENT: 'development' | 'production';
  AUTH_RATE_LIMITER: { limit(options: { key: string }): Promise<{ success: boolean }> };
}
export type AppEnv = { Bindings: Env; Variables: { user: User | null } };
