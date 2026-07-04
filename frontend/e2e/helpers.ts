import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/**
 * Shared E2E helpers — credentials, login, POS terminal settings.
 *
 * Credentials live OUTSIDE the repo (never committed):
 *   /home/work/.openclaw/workspace/state/motech-pos-credentials.json
 * Override with E2E_CREDENTIALS_FILE.
 */
const CRED_FILE =
  process.env.E2E_CREDENTIALS_FILE ??
  '/home/work/.openclaw/workspace/state/motech-pos-credentials.json';

export type Username = 'admin' | 'cashier1' | 'supervisor1';

const creds: Record<Username, { password: string }> = JSON.parse(
  readFileSync(CRED_FILE, 'utf8'),
);

export function passwordFor(user: Username): string {
  const c = creds[user];
  if (!c?.password) throw new Error(`No password for ${user} in ${CRED_FILE}`);
  return c.password;
}

/**
 * Unique POS cashierNo per suite run. The backend keys shifts by cashierNo
 * (a POS terminal concept, distinct from the auth user id), so a fresh number
 * gives us an isolated shift lifecycle without touching other terminals.
 * Range 500..989 to stay clear of the demo terminals (e.g. 12).
 */
export const CASHIER_NO = 500 + (Math.floor(Date.now() / 1000) % 490);
export const MACHINE_NO = 1;

/** UI login via the real login form. Lands on /pos. */
export async function login(page: Page, user: Username): Promise<void> {
  await page.goto('/login');
  await page.locator('#username').fill(user);
  await page.locator('#password').fill(passwordFor(user));
  await page.getByRole('button', { name: 'دخول' }).click();
  // Successful login navigates to /pos and shows the shift bar.
  await page.waitForURL(/\/pos$/);
  await expect(page.getByText('الكاشير:')).toBeVisible();
}

/**
 * Point the POS terminal at our isolated cashierNo (ShiftBar inputs persist
 * to localStorage via zustand). Only editable while no shift is open; when a
 * shift is already open for this cashierNo the inputs are hidden — in that
 * case we seed localStorage directly before the app boots.
 */
export async function seedPosSettings(page: Page): Promise<void> {
  await page.addInitScript(
    ({ cashierNo, machineNo }) => {
      window.localStorage.setItem(
        'motech-pos-settings',
        JSON.stringify({
          state: {
            cashierNo,
            machineNo,
            shiftCode: 'M',
            lastShiftId: null,
            lastShiftNo: null,
          },
          version: 0,
        }),
      );
    },
    { cashierNo: CASHIER_NO, machineNo: MACHINE_NO },
  );
}

/** Arabic-Indic digits → ASCII so we can parse formatted money like "٧٬٨٠٠". */
export function toAsciiDigits(s: string): string {
  return s
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * Parse a formatted YER money string to a number. Handles Arabic-Indic
 * digits, the Arabic group separator '٬' (U+066C), the Arabic decimal
 * separator '٫' (U+066B), and strips the currency mark 'ر.ي.' (whose dots
 * would otherwise corrupt the number).
 */
export function parseMoney(s: string): number {
  const ascii = toAsciiDigits(s)
    .replace(/[٬,\s\u00a0\u202f]/g, '') // group separators / spaces
    .replace(/٫/g, '.'); // Arabic decimal separator
  const m = ascii.match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : NaN;
}
