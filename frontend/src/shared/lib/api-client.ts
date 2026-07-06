import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ProblemDetails, RefreshResponse, ApiEnvelope } from './types';
import { sessionStore } from '@/features/auth/store/session.store';

/**
 * Axios API client.
 * - Base URL from VITE_API_BASE_URL (default '/api/v1' → Vite dev proxy → :3100).
 * - Auth rides httpOnly SameSite=Strict cookies (mp_at/mp_rt) set by the
 *   backend — the browser attaches them automatically (same-origin). The
 *   request interceptor ALSO injects a Bearer header while a token is in
 *   memory (fresh login) for backward compatibility; after a reload the
 *   cookie alone authenticates — no JWT ever touches localStorage (XSS
 *   hardening, 2026-07-06).
 * - Response interceptor:
 *    * unwraps RFC 9457 problem+json into a typed ApiError,
 *    * transparently refreshes the access token on 401 (single-flight,
 *      cookie-based when no refresh token is in memory), then retries the
 *      original request once.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export class ApiError extends Error {
  problem: ProblemDetails;
  status: number;
  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title || 'API error');
    this.name = 'ApiError';
    this.problem = problem;
    this.status = problem.status;
  }
}

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ---- request: attach token (compat — cookie auth works without it) ----
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStore.getState().accessToken;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

// ---- single-flight refresh ----
let refreshing: Promise<string | null> | null = null;

/**
 * Refresh the session. Uses the in-memory refresh token when present (fresh
 * login), otherwise relies on the mp_rt httpOnly cookie the browser sends
 * with the request (post-reload). Returns the new access token, or null and
 * clears the session when refresh is impossible.
 */
async function doRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, clear } = sessionStore.getState();
  try {
    // Bare axios (no interceptor) to avoid recursion.
    const res = await axios.post<ApiEnvelope<RefreshResponse>>(
      `${BASE_URL}/auth/refresh`,
      refreshToken ? { refreshToken } : {},
      { headers: { 'Content-Type': 'application/json' } },
    );
    const data = res.data.data;
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.accessToken;
  } catch {
    clear();
    return null;
  }
}

// ---- response: error normalization + refresh-retry ----
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;

    // Try one transparent refresh on 401 (not for the login/refresh calls).
    const isAuthCall =
      original?.url?.includes('/auth/login') || original?.url?.includes('/auth/refresh');

    if (status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      refreshing = refreshing ?? doRefresh();
      const newToken = await refreshing;
      refreshing = null;
      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return api.request(original);
      }
    }

    // Normalize to ApiError (RFC 9457 when available).
    const body = error.response?.data as ProblemDetails | undefined;
    if (body && typeof body === 'object' && 'status' in body && 'title' in body) {
      return Promise.reject(new ApiError(body));
    }
    return Promise.reject(
      new ApiError({
        type: 'about:blank',
        title: error.message || 'Network error',
        status: status ?? 0,
        detail: error.message,
      }),
    );
  },
);

/** Helper that unwraps the { data } envelope. */
export async function getData<T>(url: string, config?: Parameters<AxiosInstance['get']>[1]): Promise<T> {
  const res = await api.get<ApiEnvelope<T>>(url, config);
  return res.data.data;
}

export async function getEnvelope<T>(
  url: string,
  config?: Parameters<AxiosInstance['get']>[1],
): Promise<ApiEnvelope<T>> {
  const res = await api.get<ApiEnvelope<T>>(url, config);
  return res.data;
}
