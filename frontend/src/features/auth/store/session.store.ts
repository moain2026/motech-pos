import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/shared/lib/types';

/**
 * Session/auth client state (Zustand, persisted to localStorage).
 * Tokens are kept here so the axios interceptor can read/refresh them.
 * NOTE: server state (items/bills) lives in TanStack Query, not here
 * (STANDARDS/02 §2).
 */
interface SessionState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setSession: (s: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  setTokens: (t: { accessToken: string; refreshToken: string }) => void;
  clear: () => void;
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),
      setTokens: ({ accessToken, refreshToken }) => set({ accessToken, refreshToken }),
      clear: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'motech-session' },
  ),
);

/** Non-react access for interceptors. */
export const sessionStore = useSession;
