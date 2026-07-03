import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { api, getData, getEnvelope } from '@/shared/lib/api-client';
import { newIdempotencyKey } from '@/shared/lib/idempotency';
import type {
  ApiEnvelope,
  CollectDto,
  CollectResult,
  CreateCustomerDto,
  CreditBillsView,
  Customer,
  CustomerLedgerView,
  CustomerPoints,
  LoyaltySummary,
  UpdateCustomerDto,
} from '@/shared/lib/types';

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

/** POST /customers — create a LOCAL customer (supervisor/admin). */
export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateCustomerDto): Promise<Customer> => {
      const res = await api.post<ApiEnvelope<Customer>>('/customers', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

/** PUT /customers/{code} — update a customer (code immutable). */
export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      code,
      dto,
    }: {
      code: string;
      dto: UpdateCustomerDto;
    }): Promise<Customer> => {
      const res = await api.put<ApiEnvelope<Customer>>(
        `/customers/${encodeURIComponent(code)}`,
        dto,
      );
      return res.data.data;
    },
    onSuccess: (c) => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customer', c.code] });
    },
  });
}

/** Display helper: Arabic name first, then English, then code. */
export function customerLabel(c: Customer, noName: string): string {
  return c.arName?.trim() || c.enName?.trim() || c.code || noName;
}

// ===========================================================================
// Loyalty ledger (POST021) + credit collections (POST010/011)
// Endpoints proof-verified against live :3000 (2026-07-03).
// ===========================================================================

/**
 * GET /loyalty/customers/{code}/ledger — full points movement history with a
 * running balance per row (newest first) + the earned balance.
 */
export function useCustomerLedger(code: string | null, limit = 100) {
  return useQuery({
    queryKey: ['loyalty', 'ledger', code, { limit }],
    enabled: !!code,
    queryFn: () =>
      getData<CustomerLedgerView>(
        `/loyalty/customers/${encodeURIComponent(code!)}/ledger?limit=${limit}`,
      ),
  });
}

/** GET /loyalty/summary — chain-wide granted vs redeemed points totals. */
export function useLoyaltySummary() {
  return useQuery({
    queryKey: ['loyalty', 'summary'],
    queryFn: () => getData<LoyaltySummary>('/loyalty/summary'),
    staleTime: 30_000,
  });
}

/**
 * GET /customers/{code}/credit-bills — the customer's credit (آجل) bills with
 * per-bill collected/outstanding amounts + total outstanding debt.
 * `status: 'all'` includes settled bills; default is open-only.
 */
export function useCreditBills(code: string | null, status: 'open' | 'all' = 'open') {
  return useQuery({
    queryKey: ['customer', code, 'credit-bills', status],
    enabled: !!code,
    queryFn: () =>
      getData<CreditBillsView>(
        `/customers/${encodeURIComponent(code!)}/credit-bills${status === 'all' ? '?status=all' : ''}`,
      ),
  });
}

/**
 * POST /customers/{code}/collect — record a collection receipt against one
 * credit bill (Idempotency-Key mandatory; server guards over-collection).
 */
export function useCollectCredit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { code: string; dto: CollectDto }): Promise<CollectResult> => {
      const res = await api.post<ApiEnvelope<CollectResult>>(
        `/customers/${encodeURIComponent(vars.code)}/collect`,
        vars.dto,
        { headers: { 'Idempotency-Key': newIdempotencyKey() } },
      );
      return res.data.data;
    },
    onSuccess: (_r, vars) => {
      qc.invalidateQueries({ queryKey: ['customer', vars.code, 'credit-bills'] });
    },
  });
}
