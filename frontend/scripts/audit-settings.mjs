import { chromium } from 'playwright-core';
const BASE = 'https://nuugneol.gensparkclaw.com';
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
const ctx = browser.contexts()[0];
const page = await ctx.newPage();
page.setDefaultTimeout(20000);
await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
if (page.url().includes('/login')) {
  await page.getByLabel('اسم المستخدم').fill('admin');
  await page.getByLabel('كلمة المرور').fill(process.env.ADMIN_PW);
  await page.getByRole('button', { name: 'دخول' }).click();
  await page.waitForURL((u) => !u.pathname.includes('/login'));
}
await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
await page.getByRole('tab', { name: 'الافتراضيات المرقّمة' }).click();
await page.waitForTimeout(1800);
await page.screenshot({ path: '/home/work/motech-pos/frontend/audit-shots/tab-defaults.png' });
console.log('done');
await page.close();
process.exit(0);
