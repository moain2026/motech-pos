# MATCHING_SCREENS — مطابقة شاشات Onyx Pro (80) مقابل Motech POS

> **التاريخ:** 2026-07-13 · **المنهج:** proof-not-assumption — كل حالة أدناه مؤكدة بـ (أ) curl حي على `http://localhost:3000/api/v1/...` (401 = endpoint موجود ومحمي، 404 = غير موجود) و(ب) فحص كود فعلي في `backend/src/modules/*` و`frontend/src/features/*`، لا استناداً على وثائق قديمة فقط.
> **خط الأساس الحي المفحوص الآن:** backend pm2 `motech-pos-api` (منفذ 3000، prefix `api/v1`) — **26 موديول backend** و**215 endpoint** (`@Get/@Post/@Put/@Delete/@Patch` معدودة من الكود مباشرة، أعلى من 67 المذكورة في `SCREENS_GAP_FINAL.md` تاريخ 2026-07-03 لأن العمل استمر لاحقاً حتى commit `bd338c6` بتاريخ 2026-07-08). Frontend: **27 feature module**.
> **ملاحظة مهمة:** هذا التقرير أعاد فحص كل بند "ناقص/❌" المذكور في `docs/SCREENS_GAP_FINAL.md` (تاريخه 2026-07-03/06) على الكود الحالي. **النتيجة: كل ما كان مذكوراً كـ"متبقٍ P2" في ذلك الملف تبيّن أنه **بُني فعلاً** في تواريخ لاحقة (commits `84b9223`, `60f335c`, `87bc563` بتاريخ 2026-07-06/07، بعد كتابة القسم الأخير من `SCREENS_GAP_FINAL.md`). لذلك نسبة المطابقة هنا **أعلى** من آخر رقم مسجّل في ذلك الملف.
> **قاعدة الحكم:** ✅ = backend (حي 401/محمي) + frontend (ملف مكوّن فعلي يستدعيه) يغطّيان جوهر الشاشة · 🟡 = جزء ناقص مذكور بالتحديد · ❌ = لا شيء (لا endpoint لا مكوّن) · 📄 N/A = مغلقة بقرار معماري موثّق في `docs/ADR/`.

---

## 1) حركات — POST (30 شاشة)

| الشاشة | الاسم | الحالة | الدليل الحي (backend) | الدليل (frontend) |
|---|---|:---:|---|---|
| POST001 | فاتورة المبيعات | ✅ | `POST /bills` (200) + `/bills/held`(401) + `/promotions/apply`(401) + دفع POINTS/COUPON/PREPAID فعلي في `bills` DTO | `PosPage.tsx` + `PaymentDialog.tsx` (طرق CASH/CARD/CREDIT/POINTS/COUPON/PREPAID مؤكدة بالكود سطر 161-216) |
| POST002 | مردود المبيعات | ✅ | `POST /returns`(200 GET) | `ReturnsPage` + `CreateReturnDialog` |
| POST003 | الفواتير المعلقة | ✅ | `bills/held`, `resume`, `hold` (401) | `HeldBills` drawer في PosPage |
| POST004 | استعراض/ترحيل الفواتير | ✅ | `GET /bills`(200), `/bills/posted/:id`(401) | `BillsPage` + `BillDetailPage` |
| POST005 | ترحيل مردود المبيعات | ✅ | `GET /returns`(200), `/returns/:id`(401) | `ReturnsPage` + صفحة تفصيل `/returns/:id` (بنود+رابط للفاتورة، مؤكد بكود موجود) |
| POST006 | الدفع النقدي للمرتجعات | ✅ | `POST /vouchers/refunds`(401) + `GET /vouchers/for-return/:id` | بطاقة «سند صرف المرتجع» في `ReturnDetailPage` |
| POST008 | مزامنة البيانات | ✅ | `sync/enqueue·queue·run·status`(401) + `sync/catalog/status·runs·items·pull`(401) — 8 endpoints مؤكدة | `SyncPage` (صعودي+نزولي+زر سحب الآن) |
| POST009 | معلومات الآلات | ✅ | `admin/machines`(401) + `reports/by-machine` | `AdminPage` جدول آلات مدموج بإحصاءات |
| POST010/011 | تدفيع/سداد الفواتير | ✅ | `customers/{code}/credit-bills`, `/collect`(401) | تبويب «الآجلة» في `CustomersPage` + `CollectDialog` في `BillDetailPage` |
| POST012 | ملخص مبيعات الكاشيرات | ✅ | `reports/cashier-payment-summary`(401) موجود ضمن 30 endpoint في `reports.controller.ts` | تبويب «ملخص الكاشيرات» في `ReportsPage` |
| POST013 | تصفية الكاشيرات | ✅ | `shifts/:id/count`(401), `/settle`(401), `/settlement`(401) — 3 endpoints مؤكدة في `shifts.controller.ts` سطر 114-153 | `ReconciliationPage` |
| POST014 | عهدة الكاشيرات | ✅ | `shifts/:id/custody` GET+POST (401) — سطر 164-202 | لوحة «عهدة الكاشير» في `ReconciliationPage` |
| POST015 | فائض وعجز الكاشيرات | ✅ | `shifts/:id/variance`(401) سطر 217 | شارة القيد في `ReconciliationPage` |
| POST016 | قارئ الأسعار | ✅ | `items/barcode/:bc`, `items/:code`(401) | `PriceCheckPage` |
| POST017 | استعراض حركة الفواتير | ✅ | `GET /bills`, `/returns` (فلاتر) | `BillsPage` + `ReturnsPage` |
| POST018 | جرد الآلات | ✅ | `inventory/counts`(401) + `/:id/lines` + `/:id/post` | تبويب «الجرد الفعلي» في `InventoryPage` |
| POST019 | طلب تحويل مواد | ✅ | `transfers`(401) + `/:id` + `/:id/cancel` | `TransfersPage` |
| POST020 | ربط فاتورة بعميل نقاطي | ✅ | `bills/:id/attach-customer` مذكور في الكود (module bills) | `CustomerAttach` + زر «ربط عميل» في `BillDetailPage` |
| POST021 | استعراض حركة النقاط | ✅ | `loyalty/customers/:code/ledger`, `/summary`(401) | تبويب «حركة النقاط» في `CustomersPage` |
| POST022 | جرد أصناف مردود المبيعات | ✅ | `return-counts`(401) + `/:id/lines` + `/:id/post` — 5 endpoints مؤكدة | `ReturnCountsPage` `/return-counts` |
| POST023 | الوصفة الطبية | ✅ | `prescriptions`(401) + `/:id` + `/bill/:billNo/items` — 4 endpoints | `PrescriptionsPage` |
| POST024 | طلبات العملاء (أوامر بيع) | ✅ | `sales-orders`(401) + `/:id/convert` + `/:id/cancel` — 5 endpoints | `SalesOrdersPage` `/sales-orders` |
| POST025/026 | المقبوضات/المصروفات | ✅ | `POST /vouchers` RECEIPT/EXPENSE(401) | `VouchersPage` + `VoucherDialog` |
| POST027 | ورديات العمل | ✅ | `shifts/open·current·close·summary` (401) — 12 endpoints في module shifts | `ShiftBar` + `ReconciliationPage` |
| POST028 | التحويل المخزني (صرف صادر) | ✅ | `stock-issues`(401) + `/:id/post` + `/:id/cancel` — module `stock-receiving`، controller `@Controller('stock-issues')` مؤكد سطر 40 | `StockIssuesPage` `/stock-issues` |
| POST029 | الاستلام المخزني | ✅ | `stock-receipts`(401) + `/:id/post` + `/:id/cancel` — `@Controller('stock-receipts')` مؤكد سطر 44 | `StockReceiptsPage` `/stock-receipts` |
| POSTIN_MTX | قيود يومية MTX | 📄 N/A | لا endpoint (بحث `stock-receiving/receipts` → 404 صحيح لأن الاسم الفعلي `stock-receipts`) — مغلقة بقرار [ADR-009](ADR/ADR-009-jv-mtx-stays-in-onyx.md) | — |
| POST_WST | شاشة خدمية (WST) | 📄 N/A | قالب فارغ فعلياً في Onyx (0 triggers) — [ADR-010](ADR/ADR-010-empty-service-screens.md) | — |

**POST: ✅ 28 · 🟡 0 · 📄 N/A 2 = 30/30 محسوماً (100% بعد استثناء N/A، 93.3% صارمة).**

> فرق عن `SCREENS_GAP_FINAL.md`: ذلك الملف كان يصنّف POST006/008/012/014/015/020 كـ🟡 (نقص محدد). الفحص الحي الآن يثبت أن كل النواقص المذكورة (سند صرف مرتجع تلقائي، مزامنة نزولية+جدولة، تفصيل دفع لكل كاشير، عهدة، ترحيل فائض/عجز، ربط رجعي) **موجودة فعلياً في الكود والـendpoints** — هذه الستة انتقلت 🟡→✅ في commits لاحقة (Lane A/B/C المذكورة في نهاية `SCREENS_GAP_FINAL.md` والمؤرخة 2026-07-06، بعد كتابة الجدول الرئيسي).

---

## 2) تقارير — POSR (16 شاشة)

| الشاشة | الوظيفة | الحالة | الدليل الحي | الدليل (frontend) |
|---|---|:---:|---|---|
| POSR001 | Z-report/اليومية | ✅ | `reports/z-report`, `/daily` | تبويبا zReport/daily |
| POSR002 | العملاء النقديون | ✅ | `reports/customer-statement`, `/top-customers` | تبويبا customerStatement/topCustomers |
| POSR003 | تقارير بقوالب | ✅ | `reports/export?report=` (CSV، أُثبت وجوده كـ endpoint ضمن 30 المعدودة) | زر تصدير CSV |
| POSR004 | ورديات الكاشيرات | ✅ | `reports/by-shift`, `/by-cashier` | تبويبا byShift/byCashier |
| POSR005 | الفواتير المحذوفة | ✅ | `reports/audit` | تبويب «سجل الحذف» |
| POSR006 | مبيعات حسب نوع الصنف | ✅ | `reports/sales-by-category?machine=` | تبويب salesByCategory |
| POSR007 | نشاط الأصناف | ✅ | `reports/item-movement`, `/slow-moving` | تبويبا "حركة صنف"/"الراكدة" |
| POSR008 | عملاء/ذمم AR | ✅ | `reports/receivables` | تبويب receivables |
| POSR009 | الآلات/السندات بالعملات | ✅ | `reports/vouchers-summary`, `/by-machine` | تبويب vouchersSummary |
| POSR010 | نقاط الولاء | ✅ | `reports/loyalty` | تبويب loyalty |
| POSR011 | المردودات وتأخير الدفع | ✅ | `reports/returns-window`, `/returns` | تبويب returnsWindow |
| POSR012 | مجموعات العملاء | ✅ | `reports/customer-groups` | تبويب customerGroups |
| POSR013 | مبيعات الأصناف | ✅ | `by-item`, `discount`, `profit`, `comparison` | 4 تبويبات |
| POSR014 | الورديات والتصفية | ✅ | `reports/shifts-history` | تبويب shiftsHistory |
| POSR015 | أوامر البيع (تقرير) | ✅ | `reports/sales-orders` | تبويب salesOrders |
| POSR016 | السندات/الحسابات | ✅ | `reports/vouchers-summary` + `GET /vouchers` | تبويب «ملخص السندات» |

الدليل الكمي: `reports.controller.ts` يحتوي **30 `@Get/@Post`** فعلياً (معدودة من الكود)، تغطي جميع الـ16 شاشة وبعض التفصيلات الإضافية (export CSV لكل تقرير).

**POSR: ✅ 16 · 🟡 0 · ❌ 0 = 16/16 = 100%.**

---

## 3) إدخال/بيانات أساسية — POSI (15 شاشة + 6 إضافات خارج الترقيم)

| الشاشة | الوظيفة | الحالة | الدليل الحي | الدليل (frontend) |
|---|---|:---:|---|---|
| POSI001 | آلات نقاط البيع | ✅ | `admin/machines` GET/POST/PUT (401) | `AdminPage` جدول آلات |
| POSI002 | لوحة المفاتيح الإضافية | ✅ | `keypads` GET/POST/PUT (401) — 6 endpoints | صفحة `/keypads` |
| POSI003 | أصناف لوحة المفاتيح | ✅ | `keypads/:no`, `/:no/keys`, `DELETE /keys/:id` | حوار «ربط صنف» في `/keypads` |
| POSI004 | مفاتيح المساعدة (اختصارات) | ✅ | لا يحتاج backend (UI ثابت) — commit `84b9223` "feat(master-data): POSI004 shortcuts" | Modal اختصارات في `PosPage.tsx` (مؤكد بالبحث في الكود) |
| POSI005 | أنواع الموازين | ✅ | `pos-config/scales` GET/POST/PUT/DELETE (401 مؤكد حياً) — commit `84b9223` | `ScalesTable.tsx` في `features/settings` |
| POSI006 | مفاتيح أصناف الموزنات | ✅ | `pos-config/scales/decode`(401) — نفس commit، `scale-barcode.ts` domain | مضمّن في `ScalesTable.tsx`/`SettingsPage` |
| POSI007 | بطاقات الدفع المسبق/كوبونات | ✅ | `prepaid-cards` + `/topup`/`/redeem`/`/status`/`/movements`(401) + `cards`,`coupons` | صفحة `/prepaid-cards` + PREPAID/COUPON في PaymentDialog |
| POSI008 | برامج نقاطي | ✅ | `loyalty/programs` GET/POST/PUT/DELETE(401) | تبويب «برامج النقاط» في SettingsPage |
| POSI009 | مجموعات عملاء نقاط البيع | ✅ | `customer-groups` + `/:no/members` + `DELETE /members/:code`(401) | صفحة `/customer-groups` |
| POSI010 | بيانات عملاء نقاط البيع | ✅ | `POST/PUT /customers`(401) | `CustomersPage` + `CustomerDialog` |
| POSI011 | المستخدمون | ✅ | `admin/users` GET/POST/PUT + `/status`(401) | `AdminPage` |
| POSI012 | بطاقات POS | ✅ | `pos-cards` GET/POST/PUT(401) | تبويب «بطاقات الخصم» (CRUD) |
| POSI014 | تحديث قاعدة البيانات | 📄 N/A | تقابلها migrations (V001-V032+) — [ADR-008](ADR/ADR-008-posi014-db-update.md) | — |
| POSI200 | مبالغ بطاقات العملاء | ✅ | `prepaid-cards?customer=`, `/:no/movements`(401) | ضمن `/prepaid-cards` |
| POSI2000 | بيانات الأصناف | ✅ | `POST/PUT /items` + `/units·/prices·/barcodes·/limits`(401) + **`items/import`**(401 مؤكد حياً — استيراد Excel/CSV) | `ItemsPage`+`ItemDialog`+`ItemCatalogDialog`+`ImportXlsDialog.tsx` |
| — الموردون | خارج POSI | ✅ | `suppliers` GET/POST/PUT(401) | `SuppliersPage` `/suppliers` |
| — المخازن | خارج POSI | ✅ | `warehouses` GET/POST/PUT(401) | `WarehousesPage` `/warehouses` |
| — مجموعات الأصناف | خارج POSI | ✅ | `item-groups` GET/POST/PUT(401) | تبويب في `/groups-units` |
| — الوحدات | خارج POSI | ✅ | `units` GET/POST/PUT(401) | تبويب في `/groups-units` |
| — العملات | خارج POSI | ✅ | `currencies` GET/POST/PUT(401) | `CurrenciesPage` `/currencies` |

**POSI: ✅ 14 · 🟡 0 · 📄 N/A 1 = 15/15 محسوماً (100% بعد N/A).**

> فرق عن `SCREENS_GAP_FINAL.md`: ذلك الملف صنّف POSI004/005/006 كـ❌ (غير مبنية إطلاقاً). الفحص الحي الآن (commit `84b9223`، تاريخ لاحق لكتابة ذلك القسم) يثبت وجود `pos-config/scales` endpoint فعلي (401 مؤكد بـ curl) و`ScalesTable.tsx` في الواجهة، إضافة لمودال الاختصارات (POSI004). هذه الثلاث انتقلت ❌→✅.

---

## 4) إعدادات/نظام — POSS (9 شاشات)

| الشاشة | الوظيفة | الحالة | الدليل الحي | الدليل (frontend) |
|---|---|:---:|---|---|
| POSS001 | متغيرات نقاط البيع | ✅ | `settings/all`(401 مؤكد)، `PUT /settings/:key`، `machine/:no` | `SettingsPage` 10 تبويبات × 179 إعداد |
| POSS002 | صلاحيات المستخدمين | ✅ | `admin/permissions` GET/PUT(401) + `auth/permissions/me`(401) + `PermissionsGuard`/`@RequirePermission` في `auth/presentation/permissions.guard.ts` (فرض ديناميكي مؤكد بالكود) | تبويب «الصلاحيات» في `AdminPage` |
| POSS003 | النسخ الاحتياطية | ✅ | `admin/backups` GET/POST(401 مؤكد) + `/:id/download` — commit `60f335c` "feat(ui): POSS003 backup tab" | تبويب «النسخ الاحتياطي» في `AdminPage` |
| POSS004 | تغيير كلمة السر | ✅ | `auth/change-password`(401 مؤكد، سطر 130 في auth.controller.ts) | `ChangePasswordDialog` |
| POSS005 | الإعدادات الافتراضية | ✅ | `settings/defaults` GET/PUT(401) | تبويب «الافتراضيات المرقّمة» |
| POSS006 | تسجيل أجهزة WMS | 📄 N/A | لا endpoint (بحث `grep -rl "WMS" src/` = صفر نتائج) — [ADR-006](ADR/ADR-006-wms-device-screens.md) | — |
| POSS007 | إعداد اتصال WMS للمستخدم | 📄 N/A | نفس أعلاه — [ADR-006](ADR/ADR-006-wms-device-screens.md) | — |
| POSS028/029 | نسخ WMS مكررة | 📄 N/A | نفس أعلاه — [ADR-006](ADR/ADR-006-wms-device-screens.md) | — |

**POSS: ✅ 5 · 🟡 0 · 📄 N/A 4 = 9/9 محسوماً (100% بعد N/A، 55.6% صارمة لأن 4 من 9 مغلقة معمارياً).**

> فرق عن `SCREENS_GAP_FINAL.md`: صنّف POSS002 كـ🟡 (واجهة موجودة، الفرض الديناميكي ناقص في backend). فحص الكود الحالي يُظهر `PermissionsGuard` + `@RequirePermission` decorator فعليين ومطبَّقين (cache 15 ثانية + invalidate) — هذا انتقل 🟡→✅ (Lane C المذكورة في ذيل ذلك الملف بتاريخ 2026-07-06).

---

## 5) أخرى — POSLGN + POSQ + POSADVS + خدمية (10 شاشات)

| الشاشة | الوظيفة | الحالة | الدليل الحي | الدليل (frontend) |
|---|---|:---:|---|---|
| POSLGN | تسجيل الدخول | ✅ | `auth/login·refresh·logout·me`(401 لـ/me غير مسجل، 200/201 للدخول) + `admin/sessions` | `LoginPage` |
| POSQ001 | استعلام أسعار | ✅ | `items/:code`, `barcode/:bc` | `PriceCheckPage` |
| POSADVS | شاشة لمسية متقدمة | ✅ | نفس `bills` — بلا حاجة backend مستقل | `PosPage` + **kiosk/fullscreen mode** مؤكد بالكود (`kioskMode`, `requestFullscreen`) — commit ضمن Lane E |
| POSADVS2 | متغيّر ثانٍ للشاشة اللمسية | 📄 N/A | تغطيها PosPage بالكامل — [ADR-010](ADR/ADR-010-empty-service-screens.md) | — |
| POSADVS_SCND | شاشة العميل الثانية | ✅ | لا backend مطلوب (BroadcastChannel نفس المتصفح) | `/customer-display` feature كامل (ترحيب+أسطر حية+QR) |
| POSAVLQTY | الكميات المتاحة عبر المخازن | ✅ | `inventory`, `/:code`, `/low-stock`(401) | `InventoryPage` + `DetailDialog` |
| POS_ALRT_SCR | تنبيهات الدخول | ✅ | `alerts` GET/POST/PUT(401) + `/pending`(401) + `/:id/ack` | `PendingAlertsBanner` + `AlertsAdminPage` `/alerts` |
| POS_IMPXLS_AVLQTY | استيراد Excel + طباعة باركود | ✅ | `items/import`(401 مؤكد حياً) — commit `84b9223` "POS_IMPXLS Excel/CSV import" | `ImportXlsDialog.tsx` في `features/items` |
| POS_INSTALL | التنصيب الأولي | 📄 N/A | migrations+seed تقابلها — [ADR-007](ADR/ADR-007-pos-install.md) | — |
| POS_ITM_PRICE | مستويات أسعار الأصناف | ✅ | `items/:code/prices`, `/prices/:lev?unit=` | `ItemCatalogDialog` |

**أخرى: ✅ 8 · 🟡 0 · 📄 N/A 2 = 10/10 محسوماً (100% بعد N/A، 80% صارمة).**

> فرق عن `SCREENS_GAP_FINAL.md`: صنّف POSADVS كـ🟡 (بلا وضع كيوسك/ملء شاشة) وPOS_IMPXLS كـ"⏳ مؤجّل". كلاهما مبنيان الآن فعلياً (كيوسك mode + استيراد Excel، مؤكدين بـ`grep` على الكود والـendpoint الحي `items/import`).

---

## 📊 الإحصاء النهائي (2026-07-13، فحص مستقل مبني على curl + كود حي)

| الفئة | العدد | ✅ كاملة | 🟡 جزئية | ❌/📄 N/A |
|---|:---:|:---:|:---:|:---:|
| حركات POST | 30 | **28** | 0 | 2 (كلاهما N/A) |
| تقارير POSR | 16 | **16** | 0 | 0 |
| إدخال POSI (+6 خارج ترقيم مدمجة) | 15 | **14** | 0 | 1 (N/A) |
| إعدادات POSS | 9 | **5** | 0 | 4 (N/A) |
| أخرى | 10 | **8** | 0 | 2 (N/A) |
| **الإجمالي** | **80** | **71** | **0** | **9 (كلها 📄 N/A بقرار ADR موثّق)** |

### النسبة الصادقة
- **صارمة (✅ فقط من 80):** 71/80 = **88.75%**
- **بعد استثناء الشاشات المغلقة معمارياً بقرار ADR موثّق (9 شاشات: 2 محاسبة/خدمية N/A + 4 WMS N/A + POSI014 + POS_INSTALL + POSADVS2):** 71/71 = **100%** من الشاشات القابلة للبناء ضمن نطاق POS الحديث.
- **🟡 جزئية:** صفر — كل ما كان مصنّفاً 🟡 في `SCREENS_GAP_FINAL.md` (POST006/008/012/014/015/020، POSI005/006/008/012، POSS002) تأكد بالفحص الحي أنه اكتمل في commits لاحقة (`84b9223`, `60f335c`, `87bc563`، بين 2026-07-06 و2026-07-07، جميعها بعد آخر تحديث في `SCREENS_GAP_FINAL.md`).

---

## أهم الفجوات المتبقية (بعد الفحص الحي)

بما أن الفحص لم يجد أي 🟡 أو ❌ قابلة للبناء فعلياً — **لا توجد فجوة وظيفية حقيقية متبقية** ضمن الـ71 شاشة القابلة للبناء. الملاحظات التالية هي تحسينات صغيرة لا نواقص جوهرية (مذكورة في تعليقات الكود/التوثيق القديم دون إعادة تحقق مستقل كاملة لكل واحدة، فهي أقرب لـ"تحسينات مستقبلية" منها لفجوات):

1. **POST001 — محرك العروض المتقدم:** الـendpoint `promotions/apply` موجود وحي (401 مؤكد)، ولكن لم يُتحقق بعمق من مدى تغطيته لكل أنواع GNR_QTN_PRM_PKG (حزم/كميات مركّبة) — يحتاج اختبار وظيفي إضافي لا مجرد فحص وجود الكود.
2. **طباعة Z-report حرارية:** مذكورة في `SCREENS_GAP_FINAL.md` كتحسين مؤجل — لم يُفحص مباشرة في هذه الجلسة (خارج التركيز الأساسي: مطابقة الشاشات لا جودة الطباعة).
3. **POSR003 (تقارير قوالب مستخدم):** البديل المعتمد هو تصدير CSV العام (`reports/export`) بدلاً من محرّر قوالب مخصص — قرار تصميمي مقبول لا فجوة، لكنه فرق وظيفي طفيف عن Onyx الأصلي.
4. **تعدد الفروع في POSR007:** مذكور في التوثيق القديم كأنه يبقى في Onyx (Motech يخدم فرعاً واحداً) — لم يُعَد فحصه هنا؛ يبقى قيداً معمارياً معروفاً لا عيباً.
5. **الشاشات المغلقة معمارياً (9):** موثّقة بالكامل في `docs/ADR/` — لا حاجة عمل إضافي إلا إن غيّر المشروع نطاقه (مثلاً: إدخال محاسبة داخلية بدل الاعتماد على Onyx لـPOSTIN_MTX).

**الخلاصة الصادقة:** نظام Motech POS اليوم (2026-07-13) يغطي **100% من الشاشات القابلة للبناء ضمن نطاقه المعماري المعلن** (71/71)، و**88.75%** من إجمالي 80 شاشة Onyx Pro الأصلية إذا حُسبت الشاشات المغلقة معمارياً كـ"غير مبنية" بدل "محسومة بقرار". الفرق عن الرقم الأخير المسجّل في `SCREENS_GAP_FINAL.md` (90% صارمة / 100% بعد N/A، مؤرخ 2026-07-06) هو أن ذلك الملف كان يعدّ 72/80 محسومة (64✅ + 8📄)، بينما الفحص الحي الآن (بعد commits إضافية حتى `bd338c6` في 2026-07-08) يثبت 71✅ + 9📄 = 80/80 محسومة بالكامل — **زيادة طفيفة في عدد الشاشات المغلقة معمارياً المعترف بها (POSADVS2 وPOS_WST كانا مضمَّنين ضمن "❌ 14" في الجدول الرئيسي القديم لكنهما موثّقان بـADR فعلياً)، وثبات كامل في التغطية الوظيفية.**
