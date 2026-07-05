// Click specific report tabs and screenshot each.
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const BASE = 'https://nuugneol.gensparkclaw.com';
const SHOTS = '/home/work/motech-pos/frontend/audit-shots';
fs.mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0] ?? (await browser.newContext());
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
if (page.url().includes('/login')) {
  await page.getByLabel('اسم المستخدم').fill('admin');
  await page.getByLabel('كلمة المرور').fill(process.env.ADMIN_PW);
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForURL((u) => !u.pathname.includes('/login'));
}

await page.goto(`${BASE}/reports`, { waitUntil: 'networkidle' });
const tabs = [
  ['سجل الحذف', 'tab-audit'],
  ['ملخص السندات', 'tab-vouchers-summary'],
  ['نافذة الإرجاع', 'tab-returns-window'],
];
for (const [name, file] of tabs) {
  await page.getByRole('tab', { name }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/${file}.png` });
  console.log('shot:', file);
}
// CSV export button presence on daily tab
await page.getByRole('tab', { name: 'يومي' }).click();
await page.waitForTimeout(800);
const csvBtn = await page.getByRole('button', { name: /CSV/ }).count();
console.log('csv-button-count:', csvBtn);
await page.screenshot({ path: `${SHOTS}/tab-daily-csv.png` });
await page.close();
process.exit(0);
