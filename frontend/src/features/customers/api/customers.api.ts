import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getData, getEnvelope } from '@/shared/lib/api-client';
import type { Customer, CustomerPoints } from '@/shared/lib/types';

const PAGE = 30;

/**
 * Customers API — proof-verified against live backend (:3000, 2026-07-01):
 *   GET /customers?search=&cursor=&limit=  → Customer[] (Arabic-first names)
 *   GET /customers/{code}                  → Customer
 *   GET /customers/{code}/points           → { balance, txns }
 */
export function useCustomerSearch(search: string) {
  return useInfiniteQuery({
    queryKey: ['customers', { search }],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE));
      if (search.trim()) params.set('search', search.trim());
      if (pageParam) params.set('cursor', pageParam);
      return getEnvelope<Customer[]>(`/customers?${params.toString()}`);
    },
    getNextPageParam: (last) => last.meta?.nextCursor ?? undefined,
    staleTime: 60_000,
  });
}

export function useCustomer(code: string | null) {
  return useQuery({
    queryKey: ['customer', code],
    enabled: !!code,
    queryFn: () => getData<Customer>(`/customers/${encodeURIComponent(code!)}`),
  });
}

export function useCustomerPoints(code: string | null) {
  return useQuery({
    queryKey: ['customer', code, 'points'],
    enabled: !!code,
    queryFn: () => getData<CustomerPoints>(`/customers/${encodeURIComponent(code!)}/points`),
  });
}

/** Display helper: Arabic name first, then English, then code. */
export function customerLabel(c: Customer, noName: string): string {
  return c.arName?.trim() || c.enName?.trim() || c.code || noName;
}
