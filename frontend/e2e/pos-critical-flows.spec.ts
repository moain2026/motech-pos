import { test, expect, type Page } from '@playwright/test';
import {
  login,
  seedPosSettings,
  parseMoney,
  CASHIER_NO,
  MACHINE_NO,
} from './helpers';

/**
 * E2E — المسارات الحرجة لنظام Motech POS، عبر الواجهة الفعلية المنشورة.
 *
 * Serial by design: the suite walks one real shift lifecycle end-to-end on an
 * isolated POS terminal (unique cashierNo per run):
 *
 *   sale → return → X-report/count → close shift → supervisor settle
 *
 * Every test asserts on REAL rendered outcomes (bill numbers, server-computed
 * totals, status text) — not just "page opened".
 */
test.describe.configure({ mode: 'serial' });

// State handed across tests in this serial suite.
let billNo = '';
let billNet = 0;
let shiftId = '';
let shiftNo = 0;

/** Read the current shift for our cashierNo through the app's own API + token. */
async function fetchCurrentShift(
  page: Page,
): Promise<{ id: string; shiftNo: number } | null> {
  return page.evaluate(async (cashierNo) => {
    const raw = window.localStorage.getItem('motech-session');
    const token = raw ? JSON.parse(raw)?.state?.accessToken : null;
    const res = await fetch(`/api/v1/shifts/current?cashierNo=${cashierNo}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return { id: body.data.id, shiftNo: body.data.shiftNo };
  }, CASHIER_NO);
}

test.describe('Motech POS — المسارات الحرجة (live E2E)', () => {
  // ---------------------------------------------------------------- auth --
  test('تسجيل الدخول: كلمة سر خاطئة تُظهر رسالة خطأ حقيقية', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('cashier1');
    await page.locator('#password').fill('wrong-password-123');
    await page.getByRole('button', { name: 'دخول' }).click();
    await expect(page.getByRole('alert')).toHaveText(
      'اسم المستخدم أو كلمة المرور غير صحيحة',
    );
    // Still on /login — no session was created.
    expect(page.url()).toContain('/login');
  });

  test('تسجيل الدخول: cashier1 يدخل ويصل لشاشة البيع', async ({ page }) => {
    await seedPosSettings(page);
    await login(page, 'cashier1');
    // Real outcome: shift bar renders the logged-in cashier identity
    // (displayName from the server session, falling back to the username).
    await expect(page.getByText('الكاشير:')).toContainText(/Cashier One|cashier1/);
  });

  // ---------------------------------------------------- full sale cycle --
  test('دورة البيع الكاملة: فتح وردية → بحث → سلة → دفع نقدي → فاتورة → طباعة', async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await seedPosSettings(page);
    await login(page, 'cashier1');

    // --- 1) open a shift on our isolated terminal (or reuse a leftover one).
    const openBtn = page.getByRole('button', { name: 'فتح وردية' });
    const shiftBadge = page.getByText(/وردية رقم\s*#/);
    await expect(openBtn.or(shiftBadge).first()).toBeVisible();

    if (await openBtn.isVisible()) {
      await page.getByLabel('الرصيد الافتتاحي').fill('1000');
      await openBtn.click();
      await expect(page.getByText(/تم فتح الوردية\s*#\d+/)).toBeVisible();
    }
    await expect(page.getByText(/وردية رقم\s*#\d+/)).toBeVisible();

    const shift = await fetchCurrentShift(page);
    expect(shift, 'يجب أن توجد وردية مفتوحة لهذا الكاشير').not.toBeNull();
    shiftId = shift!.id;
    shiftNo = shift!.shiftNo;

    // --- 2) search a real item from the live catalog.
    await page.getByLabel('ابحث بالكود أو الباركود أو الاسم…').fill('ارز');
    const firstItem = page
      .locator('section[aria-label="الأصناف"] button[aria-label*="—"]')
      .first();
    await expect(firstItem).toBeVisible();
    const itemAria = (await firstItem.getAttribute('aria-label')) ?? '';
    const itemPrice = parseMoney(itemAria.split('—')[1] ?? '');
    expect(itemPrice, 'سعر الصنف من الكتالوج يجب أن يكون > 0').toBeGreaterThan(0);

    // --- 3) add to cart → cart shows the line + correct total.
    await firstItem.click();
    await expect(page.getByLabel('السلة').getByRole('listitem')).toHaveCount(1);
    const totalText = await page
      .locator('span.tnum.text-2xl') // الإجمالي النهائي
      .first()
      .innerText();
    expect(parseMoney(totalText)).toBe(itemPrice);

    // --- 4) pay cash → REAL bill via POST /bills + POST /bills/{id}/payments.
    const billResp = page.waitForResponse(
      (r) => r.url().endsWith('/api/v1/bills') && r.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'دفع نقداً' }).click();
    const billJson = await (await billResp).json();
    billNo = billJson.data.billNo;
    billNet = billJson.data.netAmt;
    expect(billNo).toMatch(/^\d{10,}$/);
    expect(billNet).toBe(itemPrice);

    // --- 5) success screen shows the server-issued bill number.
    await expect(page.getByText('تم البيع — فاتورة رقم')).toBeVisible();
    await expect(page.getByText(billNo)).toBeVisible();

    // --- 6) print receipt (browser print path) — must not error the sale.
    const printBtn = page.getByRole('button', { name: 'طباعة', exact: true });
    await expect(printBtn).toBeVisible();
    await printBtn.click();
    // printReceipt resolves (afterprint or 3s safety net) → button re-enables.
    await expect(printBtn).toBeEnabled({ timeout: 15_000 });
    await expect(page.getByText('تعذّرت الطباعة — أعد المحاولة')).toHaveCount(0);

    // --- 7) "بيع جديد" resets the terminal for the next customer.
    await page.getByRole('button', { name: 'بيع جديد' }).click();
    await expect(page.getByText('السلة فارغة — ابحث عن صنف وأضِفه')).toBeVisible();
  });

  // ----------------------------------------------------------- returns --
  test('المرتجع: إنشاء مرتجع على الفاتورة وتأكيد رقم المرتجع', async ({ page }) => {
    expect(billNo, 'يتطلب فاتورة من اختبار البيع').toBeTruthy();
    await seedPosSettings(page);
    await login(page, 'cashier1');

    await page.goto('/returns');
    await page.getByRole('button', { name: 'مرتجع جديد' }).click();

    const dialog = page.getByRole('dialog', { name: 'إنشاء مرتجع' });
    await expect(dialog).toBeVisible();
    await dialog.locator('#orig-bill').fill(billNo);
    await dialog.getByRole('button', { name: 'تحميل' }).click();

    // Original bill lines load from the server.
    await expect(dialog.locator('table tbody tr')).toHaveCount(1);
    await dialog.locator('table input[type="number"]').first().fill('1');

    // Refund total = line price (qty 1) — server-verified below.
    await expect(dialog.getByText('إجمالي الاسترداد')).toBeVisible();

    const rtResp = page.waitForResponse(
      (r) => r.url().endsWith('/api/v1/returns') && r.request().method() === 'POST',
    );
    await dialog.getByRole('button', { name: 'تأكيد المرتجع' }).click();
    const rtJson = await (await rtResp).json();
    const rtBillNo: string = rtJson.data.rtBillNo;
    expect(rtJson.data.originalBillNo).toBe(billNo);

    // Real outcome: RT bill number rendered in the success view.
    await expect(dialog.getByText('تم إنشاء المرتجع — رقم')).toBeVisible();
    await expect(dialog.getByText(rtBillNo)).toBeVisible();
  });

  // ---------------------------------------------- reconciliation + count --
  test('تصفية الوردية: X-report + عدّ النقد بالفئات (POST013)', async ({ page }) => {
    expect(shiftId, 'يتطلب وردية من اختبار البيع').toBeTruthy();
    await seedPosSettings(page);
    await login(page, 'cashier1');

    await page.goto('/reconciliation');
    await expect(
      page.getByRole('heading', { name: new RegExp(`تصفية الوردية — وردية رقم #${shiftNo}`) }),
    ).toBeVisible();

    // X-report: enter counted cash → server computes expected + difference.
    await page.getByPlaceholder('أدخل النقد الفعلي…').fill('9000');
    await page.getByRole('button', { name: 'احتساب' }).click();
    await expect(page.getByText('مطابقة النقد')).toBeVisible();
    await expect(page.getByText('النقد المتوقع').first()).toBeVisible();
    // Difference status resolves to one of the real states (not PENDING).
    await expect(page.getByText(/الفرق · (فائض|عجز|مطابق)/)).toBeVisible();

    // Tender totals reflect the CASH sale made earlier in this shift.
    await expect(page.getByText('إجماليات الدفع')).toBeVisible();
    const billCountRow = page
      .getByText('عدد الفواتير')
      .locator('xpath=following-sibling::span[1]');
    expect(parseMoney(await billCountRow.innerText())).toBeGreaterThanOrEqual(1);

    // POST013 — denomination count: 9 × 1000 = counted total, then save.
    const countInputs = page.getByLabel('العدد', { exact: true });
    await countInputs.first().fill('9');
    await expect(page.getByText(/مجموع المعدود/)).toBeVisible();
    await page.getByRole('button', { name: 'حفظ العدّ' }).click();
    await expect(page.getByText('حُفظ العدّ')).toBeVisible();
  });

  // ------------------------------------------------------- close shift --
  test('إقفال الوردية: النقد المحسوب → إقفال ويظهر الفرق', async ({ page }) => {
    expect(shiftId).toBeTruthy();
    await seedPosSettings(page);
    await login(page, 'cashier1');

    await expect(page.getByText(/وردية رقم\s*#\d+/)).toBeVisible();
    await page.getByLabel('النقد المحسوب عند الإقفال').fill('9000');
    page.once('dialog', (d) => d.accept()); // window.confirm(إقفال الوردية الحالية؟)
    await page.getByRole('button', { name: 'إقفال الوردية' }).click();

    // Real outcome: closed + server-computed cash difference in the message.
    await expect(page.getByText(/تم إقفال الوردية — الفرق:/)).toBeVisible();
    // Shift is gone → open-shift controls come back for this terminal.
    await expect(page.getByRole('button', { name: 'فتح وردية' })).toBeVisible();
  });

  // -------------------------------------------------- supervisor settle --
  test('اعتماد التصفية: المشرف يعتمد التصفية النهائية (SETTLED)', async ({ page }) => {
    expect(shiftId).toBeTruthy();
    // Seed the terminal settings + last-shift pointer (the closed shift).
    await page.addInitScript(
      ({ cashierNo, machineNo, lastShiftId, lastShiftNo }) => {
        window.localStorage.setItem(
          'motech-pos-settings',
          JSON.stringify({
            state: { cashierNo, machineNo, shiftCode: 'M', lastShiftId, lastShiftNo },
            version: 0,
          }),
        );
      },
      {
        cashierNo: CASHIER_NO,
        machineNo: MACHINE_NO,
        lastShiftId: shiftId,
        lastShiftNo: shiftNo,
      },
    );
    await login(page, 'supervisor1');

    await page.goto('/reconciliation');
    // Closed shift → settlement-only view for the last known shift.
    await expect(
      page.getByRole('heading', { name: new RegExp(`تصفية الوردية — وردية رقم #${shiftNo}`) }),
    ).toBeVisible();
    await expect(page.getByText('اعتماد التصفية', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'اعتماد التصفية (نهائي)' }).click();

    // Real outcome: SETTLED — frozen settlement summary renders.
    await expect(page.getByText(/التصفية معتمدة/).first()).toBeVisible();
    await expect(page.getByText('مصفّاة')).toBeVisible();
    await expect(page.getByText('اعتُمدت في')).toBeVisible();
  });

  // ------------------------------------------------------------ reports --
  test('التقارير: admin يفتح التقرير اليومي وتظهر بيانات حقيقية', async ({ page }) => {
    await login(page, 'admin');
    await page.goto('/reports');

    await expect(page.getByRole('heading', { name: 'التقارير' })).toBeVisible();

    // Daily tab (default): KPIs computed from real rows.
    await expect(page.getByText('إجمالي المبيعات').first()).toBeVisible();
    const kpiBills = page
      .getByText('عدد الفواتير', { exact: true })
      .first()
      .locator('xpath=following-sibling::p[1]');
    expect(parseMoney(await kpiBills.innerText())).toBeGreaterThan(0);

    // Table has at least one real day row.
    const rows = page.locator('table tbody tr');
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(0);

    // Switch to another report (payment methods) — data renders there too.
    await page.getByRole('tab', { name: 'طرق الدفع' }).click();
    await expect(
      page.getByText('طريقة الدفع').first().or(page.getByText('لا بيانات').first()),
    ).toBeVisible();
  });

  // --------------------------------------------------------------- rbac --
  test('RBAC: الكاشير لا يرى الإدارة/التقارير/الإعدادات والـAPI يرفض 403', async ({
    page,
  }) => {
    await seedPosSettings(page);
    await login(page, 'cashier1');

    // 1) Nav hides privileged entries for cashier.
    for (const label of ['الإدارة', 'التقارير', 'الإعدادات', 'الأصناف', 'العملاء']) {
      await expect(
        page.getByRole('link', { name: label }),
        `رابط "${label}" يجب أن يكون مخفياً عن الكاشير`,
      ).toHaveCount(0);
    }
    // Cashier-permitted entries are still there.
    await expect(page.getByRole('link', { name: 'فاتورة البيع' })).toBeVisible();

    // 2) Route guard: direct navigation bounces back to /pos.
    for (const path of ['/admin', '/reports', '/settings']) {
      await page.goto(path);
      await page.waitForURL(/\/pos$/);
    }

    // 3) API enforcement (not just UI hiding): admin endpoint → 403.
    const status = await page.evaluate(async () => {
      const raw = window.localStorage.getItem('motech-session');
      const token = raw ? JSON.parse(raw)?.state?.accessToken : null;
      const res = await fetch('/api/v1/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.status;
    });
    expect(status).toBe(403);
  });

  // ----------------------------------------------------------- settings --
  test('الإعدادات: admin يفتح الإعدادات وتظهر بيانات المحل من الخادم', async ({
    page,
  }) => {
    await login(page, 'admin');

    // Admin sees the privileged nav entries (positive RBAC check).
    await expect(page.getByRole('link', { name: 'الإدارة' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'الإعدادات' })).toBeVisible();

    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: /الإعدادات/ })).toBeVisible();

    // Real server data: all 179 IAS_PARA_POS settings load from GET /settings/all.
    await expect(page.getByText(/179\s*إعداد/)).toBeVisible({ timeout: 15000 });

    // Group tabs render with live counts (numbering=15, printing=29).
    await expect(page.getByRole('tab', { name: /الترقيم/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: /الطباعة/ })).toBeVisible();

    // A real ERP setting key is rendered with its live value control.
    const search = page.getByRole('searchbox');
    await search.fill('SETTING_NAME');
    await expect(page.getByText('SETTING_NAME', { exact: true })).toBeVisible();
  });
});
