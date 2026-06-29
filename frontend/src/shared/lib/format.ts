/**
 * Money / number / date formatting. Currency is YER (Yemeni Rial) — the
 * YSPOS23 dataset is Yemen-based. Uses Intl with Arabic locale.
 *
 * Money rule (STANDARDS/04 §2): values from the API are decimal amounts; we
 * never do float arithmetic for line math beyond simple display — cart line
 * math is done in integer-safe helpers in the cart store.
 */
const CURRENCY = 'YER';
const LOCALE = 'ar-YE';

const moneyFmt = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const numFmt = new Intl.NumberFormat(LOCALE, {
  maximumFractionDigits: 2,
});

export function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return moneyFmt.format(0);
  return moneyFmt.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return numFmt.format(0);
  return numFmt.format(value);
}

const dateFmt = new Intl.DateTimeFormat(LOCALE, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const dateTimeFmt = new Intl.DateTimeFormat(LOCALE, {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateFmt.format(d);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateTimeFmt.format(d);
}

/** ISO date (yyyy-mm-dd) for date inputs / API params. */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
