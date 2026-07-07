import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const CREDS = JSON.parse(readFileSync('/home/work/.openclaw/workspace/state/motech-pos-credentials.json','utf8'));
const BASE='https://nuugneol.gensparkclaw.com';
const b = await chromium.launch({channel:'chrome',headless:true});
const c = await b.newContext({baseURL:BASE,locale:'ar',ignoreHTTPSErrors:true,serviceWorkers:'block',viewport:{width:1440,height:900}});
const p = await c.newPage();
p.on('console',m=>m.type()==='error'&&console.log('CONSOLE-ERR:',m.text().slice(0,200)));
await p.goto(BASE+'/login',{waitUntil:'networkidle'});
await p.locator('#username').fill('cashier1');
await p.locator('#password').fill(CREDS.cashier1.password);
await p.getByRole('button',{name:'دخول'}).click();
await p.waitForURL(/\/pos$/);
await p.waitForTimeout(1000);

// search null-price item
const search = p.locator('input[type="search"], input[placeholder*="بحث"]').first();
await search.fill('رز محمود');
await p.waitForTimeout(1500);
const card = p.locator('button', { hasText: 'رز محمود' }).first();
if (!(await card.count())) { console.log('item card not found'); await b.close(); process.exit(0); }
console.log('card text:', (await card.innerText()).replace(/\n/g,' | '));
await card.click();
await p.waitForTimeout(600);
// cart line?
const body = await p.evaluate(()=>document.body.innerText);
console.log('cart has item:', body.includes('رز محمود') ? 'yes' : 'no');
// screenshot cart area
await p.screenshot({path:'e2e/.qa-sweep/nullprice-cart.png'});
// try pay cash
const pay = p.getByRole('button',{name:/دفع نقد/}).first();
if (await pay.count()) {
  await pay.click();
  await p.waitForTimeout(2500);
  await p.screenshot({path:'e2e/.qa-sweep/nullprice-pay.png'});
  const after = await p.evaluate(()=>document.body.innerText);
  const m = after.match(/[^\n]*(?:خطأ|فشل|سعر|price|PRICE)[^\n]*/g);
  console.log('after pay text hits:', m?.slice(0,6));
} else console.log('no pay button (maybe no open shift for this terminal)');
await b.close();
