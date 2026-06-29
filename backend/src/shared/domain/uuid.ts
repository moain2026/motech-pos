import { randomBytes } from 'node:crypto';

/**
 * uuidv7 — time-ordered UUID (RFC 9562 draft v7).
 *
 * Layout: 48-bit Unix epoch millis | version (7) | 12-bit rand_a |
 *         variant (10) | 62-bit rand_b.
 *
 * Time-ordered PKs are valuable for POS: offline-generatable on the client,
 * monotonic-ish so DB index inserts stay roughly sequential, and globally
 * unique so offline carts merge without collision (DATA_MODEL.md §1).
 */
export function uuidv7(now: number = Date.now()): string {
  const bytes = randomBytes(16);

  // 48-bit timestamp (big-endian) in the first 6 bytes.
  const ts = BigInt(now);
  bytes[0] = Number((ts >> 40n) & 0xffn);
  bytes[1] = Number((ts >> 32n) & 0xffn);
  bytes[2] = Number((ts >> 24n) & 0xffn);
  bytes[3] = Number((ts >> 16n) & 0xffn);
  bytes[4] = Number((ts >> 8n) & 0xffn);
  bytes[5] = Number(ts & 0xffn);

  // version 7 in the high nibble of byte 6.
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // variant (10xx) in the high bits of byte 8.
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = bytes.toString('hex');
  return (
    `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-` +
    `${hex.slice(16, 20)}-${hex.slice(20)}`
  );
}

/** Validate a canonical UUID string (any version). */
export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
