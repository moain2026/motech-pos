import { defineConfig } from '@playwright/test';

/**
 * E2E suite — runs against the LIVE deployment (Caddy + backend :3000).
 * Override with E2E_BASE_URL (e.g. http://localhost:5173 for a dev server).
 *
 * Serial (workers: 1): shift/bill state is server-side and the sale flow is
 * stateful (open shift → sell → return → count → close → settle). Each run
 * uses a unique POS cashierNo so parallel agents/humans don't collide.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  retries: 0,
  reporter: [['list']],
  outputDir: './e2e/.artifacts',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://nuugneol.gensparkclaw.com',
    channel: 'chrome', // system Google Chrome — no browser download needed
    headless: true,
    locale: 'ar',
    timezoneId: 'Asia/Aden',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
    // PWA service worker must not intercept test traffic (stale caches).
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
