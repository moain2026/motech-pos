/**
 * QA sweep — visits every app route as every allowed role, at 3 viewports,
 * capturing console errors, page errors, failed HTTP responses (>=400),
 * blank-screen detection and horizontal overflow. Writes JSON results +
 * screenshots under e2e/.qa-sweep/.
 *
 * Run: node e2e/qa-sweep.mjs
 */
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.E2E_BASE_URL ?? 'https://nuugneol.gensparkclaw.com';
const CREDS = JSON.parse(
  readFileSync(
    process.env.E2E_CREDENTIALS_FILE ??
      '/home/work/.openclaw/workspace/state/motech-pos-credentials.json',
    'utf8',
  ),
);
const OUT = new URL('./.qa-sweep/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

/** route → allowed roles ('all' = cashier+supervisor+admin) */
const ROUTES = [
  ['/', 'all'],
  ['/pos', 'all'],
  ['/price-check', 'all'],
  ['/vouchers', 'all'],
  ['/reconciliation', 'all'],
  ['/bills', 'all'],
  ['/returns', 'all'],
  ['/prescriptions', 'all'],
  ['/transfers', 'all'],
  ['/sales-orders', 'all'],
  ['/stock-receipts', 'all'],
  ['/stock-issues', 'all'],
  ['/return-counts', 'all'],
  ['/prepaid-cards', 'all'],
  ['/keypads', 'all'],
  ['/alerts', 'priv'],
  ['/customers', 'priv'],
  ['/items', 'priv'],
  ['/inventory', 'priv'],
  ['/suppliers', 'priv'],
  ['/warehouses', 'priv'],
  ['/groups-units', 'priv'],
  ['/currencies', 'priv'],
  ['/customer-groups', 'priv'],
  ['/sync', 'priv'],
  ['/reports', 'priv'],
  ['/admin', 'admin'],
  ['/settings', 'admin'],
];
const ROLE_ROUTES = {
  cashier1: ROUTES.filter(([, g]) => g === 'all').map(([r]) => r),
  supervisor1: ROUTES.filter(([, g]) => g !== 'admin').map(([r]) => r),
  admin: ROUTES.map(([r]) => r),
};

// Known-benign patterns to ignore in console (none expected, keep tight).
const IGNORE = [
  /Download the React DevTools/i,
  /web-vitals/i,
];

const results = [];

async function loginRole(context, user) {
  const page = await context.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#username').fill(user);
  await page.locator('#password').fill(CREDS[user].password);
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForURL(/\/pos$/, { timeout: 20_000 });
  await page.close();
}

async function sweepPage(context, user, route, vp, takeShot) {
  const page = await context.newPage();
  await page.setViewportSize(vp);
  const consoleErrs = [];
  const pageErrs = [];
  const badResponses = [];
  page.on('console', (m) => {
    if (m.type() === 'error' && !IGNORE.some((re) => re.test(m.text())))
      consoleErrs.push(m.text().slice(0, 500));
  });
  page.on('pageerror', (e) => pageErrs.push(String(e).slice(0, 500)));
  page.on('response', (r) => {
    const s = r.status();
    if (s >= 400 && !r.url().includes('/favicon'))
      badResponses.push(`${s} ${r.request().method()} ${r.url().replace(BASE, '')}`);
  });
  let finalUrl = '';
  let textLen = 0;
  let overflow = false;
  let error = null;
  try {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30_000 });
    await page.waitForTimeout(1200); // lazy chunks + queries settle
    finalUrl = new URL(page.url()).pathname;
    textLen = await page.evaluate(() => document.body.innerText.trim().length);
    overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    );
    if (takeShot) {
      const name = `${user}${route.replaceAll('/', '_') || '_root'}-${vp.width}.png`;
      await page.screenshot({ path: OUT + name, fullPage: false });
    }
  } catch (e) {
    error = String(e).slice(0, 300);
  }
  await page.close();
  return {
    user, route, width: vp.width, finalUrl, textLen, overflow,
    consoleErrs, pageErrs, badResponses, error,
  };
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const user of ['cashier1', 'supervisor1', 'admin']) {
  const context = await browser.newContext({
    baseURL: BASE, locale: 'ar', timezoneId: 'Asia/Aden',
    ignoreHTTPSErrors: true, serviceWorkers: 'block',
    viewport: { width: 1440, height: 900 },
  });
  await loginRole(context, user);
  for (const route of ROLE_ROUTES[user]) {
    // Full check at 1440 for every allowed role; responsive 390/820 as admin
    // (max coverage) + cashier on shared screens.
    const vps = [{ width: 1440, height: 900 }];
    if (user === 'admin' || user === 'cashier1')
      vps.push({ width: 820, height: 1180 }, { width: 390, height: 844 });
    for (const vp of vps) {
      const r = await sweepPage(context, user, route, vp, vp.width === 1440 || vp.width === 390);
      results.push(r);
      const flag =
        r.error || r.pageErrs.length || r.consoleErrs.length ||
        r.badResponses.length || r.textLen < 40 || r.overflow;
      console.log(
        `${flag ? '❌' : '✅'} ${user} ${route} @${vp.width}` +
        (flag ? ` | err=${r.error ?? ''} console=${r.consoleErrs.length} page=${r.pageErrs.length} http=${JSON.stringify(r.badResponses)} text=${r.textLen} overflow=${r.overflow}` : ''),
      );
    }
  }
  await context.close();
}

// RBAC negative checks: cashier must be bounced from privileged routes.
{
  const context = await browser.newContext({
    baseURL: BASE, locale: 'ar', ignoreHTTPSErrors: true, serviceWorkers: 'block',
    viewport: { width: 1440, height: 900 },
  });
  await loginRole(context, 'cashier1');
  for (const route of ['/admin', '/settings', '/reports', '/customers']) {
    const page = await context.newPage();
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const final = new URL(page.url()).pathname;
    const ok = final === '/pos';
    results.push({ user: 'cashier1', route: `RBAC ${route}`, width: 1440, finalUrl: final, rbacOk: ok });
    console.log(`${ok ? '✅' : '❌'} RBAC cashier ${route} → ${final}`);
    await page.close();
  }
  await context.close();
}

// Customer display (auth-free)
{
  const context = await browser.newContext({
    baseURL: BASE, locale: 'ar', ignoreHTTPSErrors: true, serviceWorkers: 'block',
    viewport: { width: 1440, height: 900 },
  });
  const r = await sweepPage(context, 'anon', '/customer-display', { width: 1440, height: 900 }, true);
  results.push(r);
  console.log(`${r.consoleErrs.length || r.pageErrs.length || r.error ? '❌' : '✅'} anon /customer-display textLen=${r.textLen}`);
  await context.close();
}

await browser.close();
writeFileSync(OUT + 'results.json', JSON.stringify(results, null, 2));
console.log(`\nDone. ${results.length} checks → ${OUT}results.json`);
