'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { User } from '../../shared/schemas';
export const sessionKey = ['session'] as const;
export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: () => api<{ user: User | null }>('/auth/me'),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
