import { useMutation } from '@tanstack/react-query';
import { api } from '@/shared/lib/api-client';
import type { ApiEnvelope, AuthUser, LoginResponse } from '@/shared/lib/types';
import { useSession } from '../store/session.store';

interface LoginInput {
  username: string;
  password: string;
}

/** POST /auth/login → stores session on success. */
export function useLogin() {
  const setSession = useSession((s) => s.setSession);
  return useMutation({
    mutationFn: async (input: LoginInput): Promise<LoginResponse> => {
      const res = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', input);
      return res.data.data;
    },
    onSuccess: (data) => {
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
    },
  });
}

/**
 * POST /auth/change-password (POSS004) — verifies the current password and
 * stores the new one (bcrypt-12 server-side). Available to every logged-in
 * user; proof-verified against live :3000 (2026-07-04).
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (input: { oldPassword: string; newPassword: string }): Promise<void> => {
      await api.post<ApiEnvelope<{ changed: boolean }>>('/auth/change-password', input);
    },
  });
}

/** GET /auth/me (used to validate a restored session on boot). */
export async function fetchMe(): Promise<AuthUser> {
  const res = await api.get<ApiEnvelope<AuthUser>>('/auth/me');
  return res.data.data;
}
