'use client';
import { useQuery } from '@tanstack/react-query';
import type { Product } from '../../shared/catalog';
import { api } from '../lib/api';
export function useCatalog(enabled = true) {
  return useQuery({
    queryKey: ['live-catalog'],
    queryFn: () => api<{ products: Product[] }>('/products?limit=80'),
    staleTime: 30000,
    enabled,
  });
}
