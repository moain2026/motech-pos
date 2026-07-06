import { useQuery } from '@tanstack/react-query';
import { getData } from '@/shared/lib/api-client';
import type { MyPermissions } from '@/shared/lib/types';
import { useSession } from '../store/session.store';

/**
 * usePermissions (POSS002) — the current user's effective fine-grained
 * permission map, resolved server-side from MOTECH_POS.ROLE_PERMISSIONS
 * (GET /auth/permissions/me). Used to gate/disable UI controls so the client
 * matches the backend PermissionsGuard. The backend remains the authority —
 * this only hides/greys controls the user cannot use.
 */
export function usePermissions() {
  const authed = useSession((s) => !!s.accessToken);
  return useQuery({
    queryKey: ['auth', 'permissions', 'me'],
    queryFn: () => getData<MyPermissions>('/auth/permissions/me'),
    enabled: authed,
    staleTime: 60_000,
  });
}

/** Convenience: does the current user hold `permission`? (default false while loading). */
export function useCan(permission: string): boolean {
  const { data } = usePermissions();
  return data?.permissions?.[permission] ?? false;
}
