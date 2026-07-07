/**
 * QA deep sweep — clicks through every in-page tab of the tab-heavy screens
 * (reports, settings, admin, inventory, items dialogs) as admin, capturing
 * console/page errors and unexpected HTTP >=400 per tab.
 *
 * Run: node e2e/qa-sweep-tabs.mjs
 */
import { chromium } from '@playwright/test';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.E2E_BASE_URL ?? 'https://nuugneol.gensparkclaw.com';
const CREDS = JSON.parse(
  readFileSync('/home/work/.openclaw/workspace/state/motech-pos-credentials.json', 'utf8'),
);
const OUT = new URL('./.qa-sweep/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const results = [];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  baseURL: BASE, locale: 'ar', timezoneId: 'Asia/Aden',
  ignoreHTTPSErrors: true, serviceWorkers: 'block',
  viewport: { width: 1440, height: 900 },
});

// login as admin
{
  const p = await context.newPage();
  await p.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await p.locator('#username').fill('admin');
  await p.locator('#password').fill(CREDS.admin.password);
  await p.getByRole('button', { name: 'دخول' }).click();
  await p.waitForURL(/\/pos$/, { timeout: 20_000 });
  await p.close();
}

async function sweepTabs(route, label) {
  const page = await context.newPage();
  const errs = [];
  const bad = [];
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 300)));
  page.on('pageerror', (e) => errs.push('PAGEERR ' + String(e).slice(0, 300)));
  page.on('response', (r) => {
    if (r.status() >= 400 && !r.url().includes('favicon'))
      bad.push(`${r.status()} ${r.request().method()} ${r.url().replace(BASE, '')}`);
  });
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.waitForTimeout(800);

  // All tab-like buttons rendered on the page (role=tab or aria-selected attr).
  const tabs = page.locator('[role="tab"], button[aria-selected]');
  const n = await tabs.count();
  console.log(`\n=== ${label} (${route}) — ${n} tabs`);
  for (let i = 0; i < n; i++) {
    const t = tabs.nth(i);
    let name = (await t.innerText().catch(() => '?')).replace(/\s+/g, ' ').trim().slice(0, 40);
    const before = errs.length + bad.length;
    try {
      await t.click({ timeout: 5_000 });
      await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
      await page.waitForTimeout(600);
    } catch (e) {
      errs.push(`CLICKFAIL ${name}: ${String(e).slice(0, 120)}`);
    }
    const textLen = await page.evaluate(() => document.body.innerText.trim().length);
    const delta = errs.slice(before).concat(bad.slice(before));
    const newErrs = errs.length + bad.length - before;
    results.push({ route, tab: name, newErrs, textLen, delta: delta.slice(0, 4) });
    console.log(`${newErrs ? '❌' : '✅'} tab "${name}" text=${textLen}${newErrs ? ' ' + JSON.stringify(delta) : ''}`);
  }
  await page.screenshot({ path: OUT + `tabs${route.replaceAll('/', '_')}.png` });
  await page.close();
  return { errs, bad };
}

await sweepTabs('/reports', 'Reports');
await sweepTabs('/settings', 'Settings');
await sweepTabs('/admin', 'Admin');
await sweepTabs('/inventory', 'Inventory');
await sweepTabs('/items', 'Items');
await sweepTabs('/sync', 'Sync');

// Items: open import dialog + item dialog "new"
{
  const page = await context.newPage();
  const errs = [];
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 300)));
  page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
  await page.goto(`${BASE}/items`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const importBtn = page.getByRole('button', { name: /استيراد/ }).first();
  if (await importBtn.count()) {
    await importBtn.click();
    await page.waitForTimeout(800);
    const dlgText = await page.evaluate(() => document.body.innerText.length);
    await page.screenshot({ path: OUT + 'items-import-dialog.png' });
    console.log(`\n${errs.length ? '❌' : '✅'} items import dialog opened (text=${dlgText}) errs=${errs.length}`);
    results.push({ route: '/items', tab: 'import-dialog', newErrs: errs.length, delta: errs.slice(0, 3) });
    await page.keyboard.press('Escape');
  } else {
    console.log('\n⚠️ no import button found on /items');
    results.push({ route: '/items', tab: 'import-dialog', newErrs: 1, delta: ['button not found'] });
  }
  await page.close();
}

await browser.close();
writeFileSync(OUT + 'results-tabs.json', JSON.stringify(results, null, 2));
const flagged = results.filter((r) => r.newErrs);
console.log(`\nDone. ${results.length} tab checks, flagged=${flagged.length}`);
for (const f of flagged) console.log('FLAG', JSON.stringify(f).slice(0, 300));
