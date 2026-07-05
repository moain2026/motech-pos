// Audit 🟡 screens over CDP against the live domain.
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
console.log('logged in →', page.url());

const targets = process.argv.slice(2);
for (const t of targets) {
  const [path, name] = t.split('::');
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false });
  console.log('shot:', name, '→', page.url());
}
await page.close();
process.exit(0);
