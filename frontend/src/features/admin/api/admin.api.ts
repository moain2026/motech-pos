import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, getData } from '@/shared/lib/api-client';
import type {
  AdminMachine,
  AdminUser,
  AdminSession,
  ApiEnvelope,
  CreateAdminMachineDto,
  CreateAdminUserDto,
  RolePermission,
  UpdateAdminMachineDto,
  UpdateAdminUserDto,
} from '@/shared/lib/types';

/**
 * Admin API — proof-verified against live backend (:3000):
 *   GET /admin/machines  → AdminMachine[] (IAS_POS_MACHINE + MACHINES_OVERLAY)
 *   GET /admin/users     → AdminUser[]    (USER_R + USERS_OVERLAY, merged)
 *   GET /admin/sessions  → AdminSession[] (IAS_USR_LGN_HSTRY, newest first)
 * Write side (2026-07-03) — all mutations land in MOTECH_POS overlays only:
 *   POST/PUT /admin/users, PUT /admin/users/{id}/status,
 *   POST/PUT /admin/machines, GET/PUT /admin/permissions.
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

// ---------------------------------------------------------------------------
// Users CRUD (POSI011)
// ---------------------------------------------------------------------------

/** POST /admin/users — create a LOCAL user (auto id ≥ 9000 unless given). */
export function useCreateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAdminUserDto): Promise<AdminUser> => {
      const res = await api.post<ApiEnvelope<AdminUser>>('/admin/users', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

/** PUT /admin/users/{id} — edit; an ERP user gets an EDIT overlay. */
export function useUpdateAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; dto: UpdateAdminUserDto }): Promise<AdminUser> => {
      const res = await api.put<ApiEnvelope<AdminUser>>(`/admin/users/${vars.id}`, vars.dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

/** PUT /admin/users/{id}/status — enable/disable a user. */
export function useSetAdminUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; active: boolean }): Promise<AdminUser> => {
      const res = await api.put<ApiEnvelope<AdminUser>>(`/admin/users/${vars.id}/status`, {
        active: vars.active,
      });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

// ---------------------------------------------------------------------------
// Machines CRUD (POSI001)
// ---------------------------------------------------------------------------

/** POST /admin/machines — create a LOCAL machine (409 when no exists). */
export function useCreateAdminMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateAdminMachineDto): Promise<AdminMachine> => {
      const res = await api.post<ApiEnvelope<AdminMachine>>('/admin/machines', dto);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'machines'] }),
  });
}

/** PUT /admin/machines/{no} — edit; an ERP machine gets an EDIT overlay. */
export function useUpdateAdminMachine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      no: number;
      dto: UpdateAdminMachineDto;
    }): Promise<AdminMachine> => {
      const res = await api.put<ApiEnvelope<AdminMachine>>(
        `/admin/machines/${vars.no}`,
        vars.dto,
      );
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'machines'] }),
  });
}

// ---------------------------------------------------------------------------
// Role → permission matrix (POSS002)
// ---------------------------------------------------------------------------

/** GET /admin/permissions — the full role × permission matrix (36 entries). */
export function useAdminPermissions() {
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: () => getData<RolePermission[]>('/admin/permissions'),
    staleTime: 30_000,
  });
}

/** PUT /admin/permissions — atomic upsert of matrix entries. */
export function useUpdateAdminPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entries: RolePermission[]): Promise<RolePermission[]> => {
      const res = await api.put<ApiEnvelope<RolePermission[]>>('/admin/permissions', {
        entries,
      });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'permissions'] }),
  });
}
