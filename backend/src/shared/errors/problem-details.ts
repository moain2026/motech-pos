/**
 * RFC 9457 Problem Details payload.
 * https://www.rfc-editor.org/rfc/rfc9457
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  traceId?: string;
  [key: string]: unknown;
}

const TYPE_BASE = 'https://api.motech-pos.local/errors/';

export function problem(
  slug: string,
  title: string,
  status: number,
  detail?: string,
  extra?: Record<string, unknown>,
): ProblemDetails {
  return {
    type: `${TYPE_BASE}${slug}`,
    title,
    status,
    ...(detail ? { detail } : {}),
    ...(extra ?? {}),
  };
}
