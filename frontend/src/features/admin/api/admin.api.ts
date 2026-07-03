import { useQuery } from '@tanstack/react-query';
import { getData } from '@/shared/lib/api-client';
import type { AdminMachine, AdminUser, AdminSession } from '@/shared/lib/types';

/**
 * Admin API — proof-verified against live backend (:3000, 2026-07-01):
 *   GET /admin/machines  → AdminMachine[] (IAS_POS_MACHINE)
 *   GET /admin/users     → AdminUser[]    (USER_R, Arabic names)
 *   GET /admin/sessions  → AdminSession[] (IAS_USR_LGN_HSTRY, newest first)
 * All routes are admin-only (RBAC enforced on the route + client).
 */
export function useAdminMachines() {
  return useQuery({
    queryKey: ['admin', 'machines'],
    queryFn: () => getData<AdminMachine[]>('/admin/machines'),
    staleTime: 30_000,
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => getData<AdminUser[]>('/admin/users'),
    staleTime: 30_000,
  });
}

export function useAdminSessions(limit = 100) {
  return useQuery({
    queryKey: ['admin', 'sessions', { limit }],
    queryFn: () => getData<AdminSession[]>(`/admin/sessions?limit=${limit}`),
    staleTime: 15_000,
  });
}
