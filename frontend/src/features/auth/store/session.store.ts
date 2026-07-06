import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/shared/lib/types';

/**
 * Session/auth client state (Zustand).
 *
 * XSS hardening (2026-07-06): tokens are NO LONGER persisted to localStorage.
 * The browser keeps them in httpOnly SameSite=Strict cookies set by the
 * backend (`mp_at` access / `mp_rt` refresh) — unreachable from JavaScript.
 * In-memory copies remain for the axios Bearer header (backward compatible);
 * only the `user` profile is persisted so the UI can restore instantly after
 * a reload, while real authentication always rides the httpOnly cookie.
 *
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
    {
      name: 'motech-session',
      // Persist ONLY the user profile — never the JWTs (httpOnly cookies own
      // persistence now). Tokens restored from older storage still load into
      // memory once (graceful migration) and are scrubbed on the next write.
      partialize: (s) => ({ user: s.user }) as SessionState,
    },
  ),
);

/** Non-react access for interceptors. */
export const sessionStore = useSession;
