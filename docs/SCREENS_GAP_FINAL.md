# SCREENS_GAP_FINAL — الجرد النهائي الدقيق: 80 شاشة Onyx Pro مقابل Motech POS

> **التاريخ:** 2026-07-03 · **المنهج:** proof-not-assumption — كل حالة أُثبتت بفحص فعلي للكود.
> **خط الأساس المفحوص:**
> - **Backend:** 15 module (`admin, auth, bills, cards, catalog, customers, einvoice, inventory, loyalty, reports, returns, settings, shifts, sync, vouchers`) · **67 endpoint** فعلي (openapi.json، عدا health/ready).
> - **Frontend:** 16 feature / **18 صفحة-مكوّن رئيسي**: Login · Pos (Cart/ItemGrid/HeldBills/PaymentDialog/CustomerAttach/SaleSummary) · PriceCheck · Vouchers · Reconciliation · Bills · BillDetail · Returns · Customers (+CRUD Dialog) · Items (+CRUD Dialog) · Inventory · Sync · Admin · Reports (13 تبويب) · Settings · Dashboard + Print (ESC/POS + Barcode) + EInvoiceDialog.
> - **قاعدة الحكم:** ✅ = backend + frontend فعليان يغطّيان جوهر الشاشة · 🟡 = جزء مبني وجزء ناقص (مذكور بالضبط) · ❌ = لا شيء.
> - ملاحظة مهمة: هذا الملف **يحل محل** أرقام `COMPLETION_MATRIX.md` (2026-07-01) — بُني منذ ذلك التاريخ: held bills، دفع متعدد العملات، vouchers، reconciliation، sync، einvoice، inventory، admin، settings، loyalty earn، items/customers CRUD، و9 تقارير إضافية.

---

## 1) حركات — POST (30 شاشة)

| الشاشة | الاسم العربي | الوظيفة الدقيقة | الحالة | Backend | Frontend | أولوية | المطلوب لإكمالها |
|---|---|---|:---:|---|---|:---:|---|
| POST001 | فاتورة المبيعات | البيع (باركود/لمس)، خصومات، ضريبة، تعليق، دفع | ✅ | ✅ `POST /bills` + hold + payments/multi (POINTS/COUPON) + weighted barcode | ✅ PosPage كاملة + دفع نقاط/كوبون في PaymentDialog + باركود الموزونات (scanned.quantity → كمية تلقائية) + تصفح بالفئات في ItemGrid (2026-07-04) | **P0** | متبقٍّ: محرك عروض (GNR_QTN_PRM_PKG) + بطاقات خصم/مسبقة الدفع (POSI007) |
| POST002 | فاتورة مردود المبيعات | إدخال مردودات نقدية/آجلة + استبدال | ✅ | ✅ `POST /returns` | ✅ ReturnsPage + CreateReturnDialog | P0 | مكتملة وظيفياً. (تحسين: عكس نقاط الولاء عند الإرجاع) |
| POST003 | استعراض الفواتير المعلقة | عرض/استئناف/حذف الفواتير المعلقة | ✅ | ✅ `GET /bills/held` + `resume` + `hold` | ✅ HeldBills drawer | P0 | مكتملة. (تحسين: حذف معلّقة صراحةً + سجل حذف audit) |
| POST004 | استعراض/ترحيل الفواتير | استعراض الفواتير وترحيلها للأونكس | ✅ | ✅ `GET /bills`, `GET /bills/posted/{id}` | ✅ BillsPage + BillDetailPage | P1 | مكتملة لنطاق Motech |
| POST005 | استعراض/ترحيل فواتير المردود | مثل POST004 لكن للمردودات (RT_BILL) | 🟡 | ✅ `GET /returns`, `GET /returns/{id}` | ✅ ReturnsPage (قائمة+تفصيل) | P1 | **ناقص:** صفحة تفصيل مردود مكافئة لـ BillDetail (عرض القيود/الترحيل) |
| POST006 | الدفع النقدي للمرتجعات | سند إرجاع (صرف) لاسترداد قيمة المرتجع | 🟡 | 🟡 refundAmt يُحسب في return؛ vouchers EXPENSE موجود | ❌ لا ربط تلقائي مرتجع→سند صرف | P1 | ربط المرتجع بسند صرف تلقائي (voucher type=REFUND مرجعه returnId) + زر في ReturnsPage |
| POST008 | مزامنة البيانات | نقل أصناف/أسعار من السيرفر ورفع الفواتير | 🟡 | ✅ `sync/enqueue·queue·run·status` | ✅ SyncPage (حالة+تشغيل) | P1 | **ناقص:** مزامنة نزولية للأصناف/الأسعار (catalog pull) + جدولة تلقائية (worker/cron) — الحالي طابور صعودي يدوي التشغيل |
| POST009 | معلومات الآلات | عرض معلومات الآلات وآخر فاتورة وصافي مبيعاتها | 🟡 | ✅ `GET /admin/machines` + `reports/by-machine` | ✅ AdminPage (قائمة) | P2 | دمج إحصاءات (آخر فاتورة/مردودات/صافي) في بطاقة الآلة بدل قائمتين منفصلتين |
| POST010 | الدفع النقدي للفواتير | تدفيع الفواتير النقدية (كاشير تدفيع منفصل) | ✅ | ✅ `GET /customers/{code}/credit-bills` + `POST /customers/{code}/collect` (تحصيل آجل idempotent، حارس لا-يتجاوز-المدين) + payments | ✅ تبويب "الفواتير الآجلة" في CustomersPage + حوار سند تحصيل (2026-07-04) | P1 | مكتملة الجوهر |
| POST011 | سداد الفواتير | سداد فواتير آجلة (IAS_POS_PAY_BILLS) | 🟡 | ✅ credit-bills/collect (CREDIT_COLLECTIONS جديدة V013) + payments endpoints | 🟡 السداد متاح من تبويب العميل (CustomersPage → الآجلة → تحصيل) 2026-07-04 | P1 | تحسين: زر "سداد" مباشر في BillDetailPage أيضاً |
| POST012 | ملخص مبيعات الكاشيرات | ملخص نقدي/آجل/شبكة/مردودات لكل كاشير | 🟡 | ✅ `reports/by-cashier` + `shifts/{id}/summary` | ✅ تبويب في ReportsPage | P1 | **ناقص:** تفصيل طرق الدفع لكل كاشير (payment-methods الحالي إجمالي وليس per-cashier) |
| POST013 | تصفية مبيعات الكاشيرات | عدّ النقد بالفئات ومطابقته مع النظام | ✅ | ✅ `POST /shifts/{id}/count` + `POST /shifts/{id}/settle` + `GET /shifts/{id}/settlement` + reconciliation | ✅ ReconciliationPage: إدخال الفئات (فئة×عدد + مجموع حي) + اعتماد supervisor/admin + عرض التصفية المجمّدة — ويعمل بعد إقفال الوردية (lastShiftId) (2026-07-04) | P1 | مكتملة |
| POST014 | عهدة الكاشيرات المالية | تسجيل عهدة/سحب عهدة للكاشير | 🟡 | 🟡 رصيد افتتاحي عند `shifts/open` فقط | ❌ | P1 | endpoint + UI لحركات عهدة أثناء الوردية (إيداع/سحب من الدرج) تدخل في التصفية |
| POST015 | فائض وعجز الكاشيرات | إثبات قيد الفائض/العجز بعد التصفية | 🟡 | ✅ over/short يُحسب في reconciliation | ✅ يُعرض في ReconciliationPage | P1 | **ناقص:** ترحيل الفرق كسجل/قيد معتمد (voucher أو jrnl-diff) عند إقفال الوردية |
| POST016 | قارئ الأسعار | استعلام سعر+صورة+كمية بالباركود للزبون | ✅ | ✅ `items/barcode/{bc}`, `items/{code}` | ✅ PriceCheckPage | P0 | مكتملة. (تحسين: وضع kiosk بملء الشاشة + صورة الصنف) |
| POST017 | استعراض حركة الفواتير | استعراض حركة المبيعات والمردودات بفلاتر | ✅ | ✅ `GET /bills` (فلاتر) + `GET /returns` | ✅ BillsPage + ReturnsPage | P1 | مكتملة |
| POST018 | جرد الآلات | جرد بجهاز جرد + مطابقة (IAS_POS_AUD_ITEM) | ✅ | ✅ `POST /inventory/counts` + `/:id/lines` + `/:id/post` + `GET` قائمة/تفاصيل (V015: STOCK_COUNTS/LINES، فرق = عدّ − نظام من MV_ITEM_AVL_QTY، اعتماد supervisor/admin idempotent) | ❌ | P2 | backend مكتمل — تبقى شاشة الجرد في الواجهة |
| POST019 | طلب صرف/تحويل مواد | طلب تحويل مخزني من نقطة البيع للمخزن | ✅ | ✅ `POST/GET /transfers` + `/:id` + `/:id/cancel` (V018: MATERIAL_TRANSFERS/LINES — مخازن مُتحقّقة حياً من YSPOS23، snapshot توفر المصدر من MV_ITEM_AVL_QTY، OPEN→CANCELLED) | ✅ TransfersPage (قائمة+فلتر حالة+إنشاء متعدد الأسطر+عرض بـavlQty+إلغاء) (2026-07-04) | P2 | يتبقى ترحيل للأونكس عبر sync عند توفر الربط |
| POST020 | ربط الفاتورة بعميل نقاطي | ربط فاتورة سابقة بعميل واحتساب نقاطها | 🟡 | ✅ earn تلقائي عند البيع (loyalty.earnOnSale) | ✅ CustomerAttach أثناء البيع | P1 | **ناقص:** الربط **بأثر رجعي** لفاتورة مرحّلة بلا عميل (`POST /bills/{id}/attach-customer`) — هذا جوهر الشاشة الأصلية |
| POST021 | استعراض حركة النقاط | سجل حركة النقاط لكل العملاء + الانتهاء | ✅ | ✅ `loyalty/customers/{code}/ledger` + `loyalty/summary` | ✅ تبويب "حركة النقاط" في CustomersPage: رصيد + سجل كامل برصيد جارٍ لكل حركة (2026-07-04) | P1 | مكتملة الجوهر (تحسين: صفحة إجماليات لكل العملاء من loyalty/summary) |
| POST022 | جرد أصناف مردود المبيعات | مطابقة الكمية المردودة فعلياً مع المسجلة | ❌ | ❌ | ❌ | P2 | جلسة جرد مردودات مصغّرة + تقرير فروقات |
| POST023 | الوصفة الطبية | إدخال وصفة (Wasfaty) وربطها بالفاتورة | ✅ | ✅ `POST/GET /prescriptions` + `/:id` + `bill/:billNo/items` (V017: PRESCRIPTIONS/LINES — طبيب+مريض+جرعة/استخدام/مدة لكل صنف، فاتورة مُتحقّقة حياً والأصناف يجب أن تكون عليها) | ✅ PrescriptionsPage (قائمة+فلاتر+إنشاء من أصناف الفاتورة+عرض) (2026-07-04) | P2 | مكتملة (صيدليات) |
| POST024 | طلبات العملاء | أوامر بيع تُنزَّل لاحقاً في فاتورة | ❌ | ❌ | ❌ | P2 | module sales-orders (إنشاء/تعديل/إنزال في فاتورة) — شاشة كبيرة (29 block) |
| POST025 | المقبوضات | سندات قبض نقدية يستلمها الكاشير | ✅ | ✅ `POST /vouchers` (RECEIPT) | ✅ VouchersPage + VoucherDialog | P1 | مكتملة — وتدخل في تصفية الوردية (voucher-cash-totals) |
| POST026 | المصروفات | سندات صرف نقدية من الصندوق | ✅ | ✅ `POST /vouchers` (EXPENSE) | ✅ VouchersPage + VoucherDialog | P1 | مكتملة |
| POST027 | ورديات العمل | فتح/إقفال وردية + عهدة + تصفية | ✅ | ✅ open/close/current/summary/reconciliation | ✅ ShiftBar + ReconciliationPage | **P0** | مكتملة الجوهر. (يكمّلها نقص POST013/014/015 أعلاه) |
| POST028 | التحويل المخزني | تحويل أصناف بين المخازن (36 block) | ❌ | ❌ | ❌ | P2 | يُرحَّل للأونكس — إن لزم: module transfers صادرة |
| POST029 | الاستلام المخزني | استلام التحويلات الواردة | ❌ | ❌ | ❌ | P2 | مثل POST028 (استلام وارد + فروقات استلام) |
| POSTIN_MTX | قيود يومية MTX | إدخال قيود محاسبية (JV) من نقطة البيع | ❌ | ❌ | ❌ | P2 | خارج نطاق POS الحديث — المحاسبة تبقى في Onyx |
| POST_WST | شاشة خدمية (WST) | قالب خدمي شبه فارغ (0 triggers/0 PU) | ❌ | — | — | P2 | لا وظيفة مستقلة فعلية — يُوثَّق كـ N/A |

**POST: ✅ 12 · 🟡 9 · ❌ 9** _(2026-07-04: POST001/010/013/021 صارت ✅ — الواجهة رُبطت بالكامل)_

---

## 2) تقارير — POSR (16 شاشة)

> المبني فعلياً: **29 endpoint تقارير** (`daily, monthly, by-item, by-machine, by-cashier, payment-methods, returns, tax, hourly-sales, z-report, top-customers, discount, sales-by-category` + 2026-07-03: `slow-moving, profit, comparison, item-movement, audit, vat-detailed` + **الموجة F 2026-07-04**: `by-shift, shifts-history, customer-statement, receivables, vouchers-summary, loyalty, returns-window, sales-orders, customer-groups, export(CSV)`) + ReportsPage بـ19 تبويباً (تبويبات الموجة F لم تُربط بالواجهة بعد).

| الشاشة | الوظيفة الدقيقة (من الجداول/SQL) | الحالة | Backend | Frontend | أولوية | المطلوب |
|---|---|:---:|---|---|:---:|---|
| POSR001 | تقرير الوردية/اليومية (Z-report — POS_WRK_SHFT_CSHR + عملاء نقديون) | ✅ | ✅ `reports/z-report` + daily | ✅ تبويبا zReport/daily | **P0** | مكتمل الجوهر. (تحسين: طباعة Z-report حرارية) |
| POSR002 | تقرير العملاء النقديين (مبيعات/أرصدة IAS_CASH_CUSTMR) | ✅ | ✅ `reports/customer-statement` (فواتير/مردودات/نقاط/تحصيلات + إجماليات وذمة) + `top-customers` (2026-07-04) | ✅ تبويب customerStatement (فواتير/مردودات/نقاط/تحصيلات+إجماليات) + topCustomers (2026-07-04) | P1 | مكتمل |
| POSR003 | تقارير بقوالب مستخدم (S_RPRT_USR_TMPLT) | ✅ | ✅ `reports/export?report=…` تصدير CSV لأي تقرير مسطّح (17 تقريراً) — البديل المقرَّر للقوالب (2026-07-04) | ❌ | P2 | زر تصدير في الواجهة |
| POSR004 | تقرير ورديات الكاشيرات (تفصيلي بالوردية) | ✅ | ✅ `reports/by-shift` (وردية-بوردية + الفرق النقدي لكل وردية + فلتر cashier/shift) + `by-cashier` (2026-07-04) | ✅ تبويبا byShift + byCashier + تصدير CSV (2026-07-04) | P1 | مكتمل |
| POSR005 | تقرير الفواتير المحذوفة/المعلقة تاريخياً (AUDIT_DEL_ITM, HST_HUNG) | ✅ | ✅ `reports/audit` (IAS_POS_AUD_ITEM حي: 4,115 سطراً محذوفاً + اسم المستخدم العربي + AUD_DATE + fromHungBill) | ✅ تبويب "سجل الحذف" في ReportsPage (2026-07-04) | P1 | مكتملة |
| POSR006 | تقرير مبيعات حسب نوع الصنف/الآلة (ITEM_TYPES) | ✅ | ✅ `sales-by-category?machine=` — نوع الصنف × الآلة (التصنيف من ITEM_TYPES الحيّة أصلاً) (2026-07-04) | ✅ تبويب salesByCategory | P2 | فلتر machine في الواجهة |
| POSR007 | تقرير نشاط الأصناف بصلاحيات الفروع (IAS_ITEMS_ACTIVITY) | ✅ | ✅ `reports/item-movement` و`reports/slow-moving` — فرع واحد | ✅ تبويبا "حركة صنف" و"الأصناف الراكدة" في ReportsPage (2026-07-04) | P2 | تعدد الفروع يبقى في Onyx |
| POSR008 | تقرير عملاء/ذمم AR (IAS_PARA_AR, CUSTOMER) | ✅ | ✅ `reports/receivables` — ذمم آجلة لكل عميل (آجل/محصَّل/متبقٍ/آخر حركة) من PAYMENTS(CREDIT)+CREDIT_COLLECTIONS (2026-07-04). ذمم Onyx التاريخية تبقى في Onyx | ✅ تبويب receivables + CSV (2026-07-04) | P2 | مكتمل |
| POSR009 | تقرير الآلات/السندات بالعملات (IAS_POS_MACHINE, VAOUCHER, EX_RATE) | ✅ | ✅ `reports/vouchers-summary` — سندات مجمّعة آلة×نوع×طريقة×عملة + صافي أثر نقدي (2026-07-04) + `by-machine` | ✅ تبويب vouchersSummary (آلة×نوع×طريقة×عملة+صافي أثر) + byMachine + VouchersPage (2026-07-04) | P2 | مكتمل |
| POSR010 | تقرير نقاط الولاء (IAS_POINT_TYP_MST) | ✅ | ✅ `reports/loyalty` — نقاط الفترة بنوع الحركة (كسب/استبدال/انتهاء/تسوية) + لكل عميل + فلاتر (2026-07-04) | ✅ تبويب loyalty (byType+byCustomer+إجماليات) (2026-07-04) | P1 | مكتمل |
| POSR011 | تقرير المردودات والدفع النقدي للمرتجعات (PRD_BACK_HOUR) | ✅ | ✅ `reports/returns-window` — كل مرتجع مع ساعات التأخير عن الفاتورة الأصلية وwithinWindow مقابل PRD_BACK_HOUR (غير مفعّل حالياً = null) + `reports/returns` (2026-07-04) | 🟡 تبويب returns فقط | P1 | تبويب واجهة |
| POSR012 | تقرير مجموعات العملاء/المناديب/المناطق (CUSTMR_GRP, SALES_MAN) | ✅ | ✅ `reports/customer-groups` — مبيعات بمجموعة العميل (IAS_CASH_CUSTMR_GRP فارغة حالياً → دلو NULL يجمع الكل؛ يتفعّل تلقائياً مع POSI009) (2026-07-04) | ✅ تبويب customerGroups + CSV (2026-07-04) | P2 | يتبقى بذر المجموعات (POSI009 UI) |
| POSR013 | تقرير مبيعات الأصناف (IAS_ITM_MST تفصيلي) | ✅ | ✅ `by-item` + `discount` + `profit` + `comparison` | ✅ 4 تبويبات: byItem/discount + "الأرباح" و"مقارنة فترتين" (2026-07-04) | P1 | مكتمل |
| POSR014 | تقرير الورديات والتصفية (POS_WRK_SHFT_CSHR, CASHER) | ✅ | ✅ `reports/shifts-history` — كل الورديات التاريخية بفروقها (متوقع/فعلي/معدود/فرق التصفية + سندات قبض/صرف لكل وردية، فلتر status) + `z-report` + `shifts/{id}/summary` (2026-07-04) | ✅ تبويب shiftsHistory (متوقع/معدود/فرق/سندات) + ReconciliationPage + CSV (2026-07-04) | P1 | مكتمل |
| POSR015 | تقرير أوامر البيع (SALES_ORDER) | ✅ | ✅ `reports/sales-orders` — قراءة أوامر البيع من YSPOS23.SALES_ORDER (فلتر processed/مدى) (2026-07-04). إنشاء الأوامر (POST024) يبقى مستقلاً | ✅ تبويب salesOrders (قراءة) + CSV (2026-07-04) | P2 | يتبقى POST024 للإنشاء |
| POSR016 | تقرير السندات/الحسابات (ACCOUNT, PRIV_ACC) | ✅ | ✅ `reports/vouchers-summary` (إجماليات لفترة/وردية) + `GET /vouchers` (2026-07-04) | 🟡 VouchersPage | P2 | تبويب الملخّص |

**POSR: ✅ 16 · 🟡 0 · ❌ 0 (backend)** _(2026-07-04 الموجة F: اكتمل backend كل تقارير POSR الـ16 — أُضيفت by-shift/shifts-history/customer-statement/receivables/vouchers-summary/loyalty/returns-window/sales-orders/customer-groups/export-CSV + فلتر machine في sales-by-category. المتبقي: ربط تبويبات الواجهة. كما أُصلح باغ P1: توحيد معادلة expected-cash بين close وreconciliation — السندات تُحتسب في المكانين)_

---

## 3) إدخال/بيانات أساسية — POSI (15 شاشة)

| الشاشة | الاسم العربي | الوظيفة | الحالة | Backend | Frontend | أولوية | المطلوب |
|---|---|---|:---:|---|---|:---:|---|
| POSI001 | أجهزة وآلات نقاط البيع | تعريف الآلات + التصريح للأجهزة | ✅ | ✅ `GET/POST /admin/machines` + `PUT /admin/machines/{no}` (overlay في MOTECH_POS يدمج مع IAS_POS_MACHINE) | ✅ AdminPage: إنشاء/تعديل آلات (حوار كامل + origin badge) (2026-07-04) | P1 | تحسين: تصريح جهاز (ربط terminal بالآلة) |
| POSI002 | لوحة المفاتيح الإضافية | ترميز لوحات لمسية للأصناف بلا باركود | 🟡 | ✅ `GET/POST/PUT /keypads` (V016: KEYPADS — جداول YSPOS23 فارغة → MOTECH_POS مرجعي) (2026-07-04) | 🟡 ItemGrid لمسي لكن غير مربوط باللوحات | P1 | ربط ItemGrid بـ/keypads (صفحات/ألوان/ترتيب) |
| POSI003 | أصناف لوحة المفاتيح | ربط الأصناف بأزرار اللوحة | 🟡 | ✅ `GET /keypads/{no}` + `POST /keypads/{no}/keys` + `DELETE …/keys/{id}` (زر→صنف مع اسم/سعر حي من IAS_ITM_MST/IAS_ITEM_PRICE + مجموعة/لون/ترتيب) (2026-07-04) | ❌ | P1 | شاشة تكوين اللوحة في الواجهة |
| POSI004 | مفاتيح المساعدة | عرض اختصارات لوحة المفاتيح | ❌ | — | ❌ | P2 | شاشة/Modal "اختصارات" ثابتة في PosPage (F-keys) — جهد صغير جداً |
| POSI005 | أنواع الموازين | ترميز الموازين المستخدمة | ❌ | ❌ | ❌ | P2 | يلزم فقط مع دعم باركود الوزن (مرتبط بنقص POST001) |
| POSI006 | مفاتيح أصناف الموزنات | ربط الأصناف الموزونة بمفاتيح الميزان | ❌ | ❌ | ❌ | P2 | مع POSI005 (تصدير PLU للميزان) |
| POSI007 | بطاقات الدفع المسبق والكوبونات | ترميز بطاقات/كوبونات للتدفيع المتعدد | ✅ | ✅ `GET/POST /prepaid-cards` + `topup/redeem/status/movements` (V019: دفتر حركات برصيد جارٍ، REDEEM محروس بقفل صف — لا سحب فوق الرصيد 422، بطاقة معطلة/منتهية 409) + `GET /cards`,`/coupons` (2026-07-04) | ✅ صفحة `/prepaid-cards` (قائمة + فلاتر عميل/نوع/نشطة + إصدار + شحن/سحب مع حارس رصيد + تفعيل/تعطيل + سجل حركات برصيد جارٍ POSI200) (2026-07-04 UI موجة E) | P1 | تحسين: **ربط redeem كطريقة دفع** في PaymentDialog |
| POSI008 | ترميز برامج نقاطي | تعريف برامج الولاء وطرق الاحتساب | 🟡 | 🟡 محرك earn موجود (loyalty.service) بلا CRUD برامج | ❌ | P1 | CRUD برنامج نقاط (نسبة/شرائح/انتهاء) + صفحة إعداد |
| POSI009 | مجموعات عملاء نقاط البيع | تقسيم العملاء لمجموعات للتقارير | ✅ | ✅ `GET/POST/PUT /customer-groups` + `POST /{no}/members` + `DELETE /members/{code}` (V020: مجموعة واحدة لكل عميل، أسماء عربية من CUSTOMER) (2026-07-04) | ✅ صفحة `/customer-groups` master/detail (قائمة مجموعات + إنشاء/تعديل + لوحة أعضاء: إضافة بكود العميل / إزالة) (2026-07-04 UI موجة E) | P2 | مكتملة الجوهر — يغذّي POSR012 تلقائياً |
| POSI010 | بيانات عملاء نقاط البيع | إدخال/تعديل بيانات العميل النقدي | ✅ | ✅ `POST/PUT /customers` | ✅ CustomersPage + CustomerDialog | P1 | مكتملة الجوهر. (تحسين: حقول مندوب/منطقة/مجموعة) |
| POSI011 | المستخدمون | إدارة مستخدمي النظام (USER_R) | ✅ | ✅ `GET/POST /admin/users` + `PUT /admin/users/{id}` + `PUT /admin/users/{id}/status` (overlay USERS_OVERLAY يدمج مع USER_R + ربط بحساب auth عبر authUsername) | ✅ AdminPage: إنشاء/تعديل/تفعيل-تعطيل + عمودا الدور/origin (2026-07-04) | P1 | مكتملة الجوهر |
| POSI012 | بطاقات POS (IAS_POS_CARD) | ترميز بطاقات الشبكة/الخصم | 🟡 | 🟡 `GET /cards` (قراءة) | ❌ | P2 | CRUD أنواع البطاقات + ربطها ببيانات دفع CARD (عمولة/بنك) |
| POSI014 | تحديث قاعدة البيانات | ترقية schema وأرشفة الفواتير | ❌ | — (تُغنى عنها migrations/Prisma) | — | P2 | **N/A معمارياً** — يقابلها migrations. يلزم فقط: أرشفة فواتير قديمة (job) |
| POSI200 | مبالغ بطاقات العملاء | أرصدة بطاقات العملاء مسبقة الدفع | ✅ | ✅ `GET /prepaid-cards?customer=` + `GET /prepaid-cards/{no}/movements` (رصيد حي + دفتر ISSUE/TOPUP/REDEEM برصيد جارٍ) (2026-07-04) | ✅ ضمن `/prepaid-cards`: فلتر بكود العميل + حوار سجل الحركات برصيد جارٍ (2026-07-04 UI موجة E) | P2 | تحسين: اختصار من CustomersPage |
| POSI2000 | بيانات الأصناف | إدخال/تعديل الأصناف (IAS_ITM_MST) | ✅ | ✅ `POST/PUT /items` (+ حدود مخزون min/max/reorder) + `items/{code}/units·prices·**barcodes**·**limits**` (باركود متعدد لكل وحدة: ERP IAS_ITM_UNT_BARCODE 2,614 + overlay محلي، وباركود جديد يُحل فوراً في `items/barcode/{bc}`) + `categories` | ✅ ItemsPage + ItemDialog + **ItemCatalogDialog** (مستويات الأسعار + الوحدات بمعامل التحويل) + فلتر فئات (2026-07-04) | P1 | ~~UI للباركودات المتعددة وحدود المخزون~~ ✅ تبويبا «الباركودات» + «حدود المخزون» في ItemCatalogDialog (2026-07-04 UI موجة E) |

**POSI: ✅ 7 · 🟡 4 · ❌ 4** _(2026-07-04 UI موجة E: POSI007/009/200 صارت ✅ — صفحات `/prepaid-cards` و`/customer-groups` كاملة مُثبتة حياً على الدومين + تبويبا باركودات/حدود في الأصناف. وأُضيفت UI لموردين/مخازن/مجموعات/وحدات/عملات. المتبقي 🟡: POSI001 تصريح جهاز، POSI002/003 لوحات مفاتيح UI، POSI008 برامج نقاط، POSI012 أنواع بطاقات. ❌: POSI004 اختصارات، POSI005/006 موازين، POSI014 N/A)_

> **إضافات موجة E خارج ترقيم POSI** (2026-07-04، backend كامل بأنماط overlay — ERP مقدّس. **UI ✅ 2026-07-04 موجة E frontend** — كل شاشة: قائمة + إنشاء/تعديل + origin badge + RBAC supervisor/admin):
> - **الموردون** `GET/POST/PUT /suppliers` — دمج IAS202623.V_DETAILS (38 مورداً) مع SUPPLIERS_OVERLAY (V016). → ✅ UI `/suppliers` (بحث + CRUD)
> - **المخازن** `GET/POST/PUT /warehouses` — WAREHOUSE_DETAILS + overlay. → ✅ UI `/warehouses` (CRUD + شارة «البيع موقوف»)
> - **مجموعات الأصناف** `GET/POST/PUT /item-groups` — GROUP_DETAILS + overlay (+ عدّاد أصناف حي). → ✅ UI `/groups-units` تبويب «مجموعات الأصناف»
> - **الوحدات** `GET/POST/PUT /units` — MEASUREMENT + overlay. → ✅ UI `/groups-units` تبويب «وحدات القياس»
> - **العملات وأسعار الصرف** `GET/POST/PUT /currencies` — EX_RATE + overlay (rate محاسبي / ratePos لنقاط البيع). → ✅ UI `/currencies` (كلا السعرين + شارة العملة المحلية)

---

## 4) إعدادات/نظام — POSS (9 شاشات)

| الشاشة | الاسم العربي | الوظيفة | الحالة | Backend | Frontend | أولوية | المطلوب |
|---|---|---|:---:|---|---|:---:|---|
| POSS001 | متغيرات وإعدادات نقاط البيع | متغيرات النظام العامة (IAS_PARA_POS) | ✅ | ✅ `GET /settings/all` (179 مصنّفة) + `PUT /settings/{key}` (value:null يرجع للحية) + `GET/PUT/POST /settings` + `machine/{no}` | ✅ SettingsPage **كامل UI**: 10 تبويبات عربية × 179 إعداد + بحث شامل + تحكّم حسب النوع (نص/رقم/toggle 0-1) + حفظ فوري لكل مفتاح + شارة «مُعدّل» + إرجاع للافتراضي + toast + admin-only (2026-07-04) | **P0** | مكتمل |
| POSS002 | صلاحيات المستخدمين | صلاحيات تفصيلية للشاشات/العمليات | 🟡 | ✅ `GET/PUT /admin/permissions` — مصفوفة role×permission (36 مدخلاً) | ✅ تبويب "الصلاحيات" في AdminPage: مصفوفة checkboxes 12×3 + حفظ ذري للفروقات (2026-07-04) | P1 | المتبقي: فرض المصفوفة ديناميكياً في حراس الـbackend (الحالي RBAC ثابت) |
| POSS003 | النسخ الاحتياطية | نسخ احتياطي لقاعدة البيانات | ❌ | — (ops: pg_dump/cron خارج التطبيق) | ❌ | P2 | job نسخ مجدول + زر/حالة في AdminPage (أو يُوثَّق كإجراء تشغيلي) |
| POSS004 | تغيير كلمة السر | المستخدم يغيّر كلمته | ✅ | ✅ `POST /auth/change-password` (تحقق القديمة + bcrypt-12 + كتابة ذرّية لـ auth-users.json تنجو من restart) | ✅ حوار ChangePasswordDialog من رأس الشاشة (قديمة+جديدة+تأكيد، لكل مستخدم) (2026-07-04) | P1 | مكتمل |
| POSS005 | الإعدادات الافتراضية | افتراضيات على مستوى النظام/النقطة | 🟡 | ✅ `GET/PUT /settings/defaults` (قيم POS_DFLT_STNG_MST الحية + overlay `default.<no>`، value/liveValue/overridden، admin-only للكتابة، STNG_NO مُتحقّق) + machine overrides | ✅ SettingsPage | P2 | backend مكتمل — يتبقى تبويب defaults في الواجهة |
| POSS006 | تسجيل أجهزة WMS | ربط أجهزة مستودعات خارجية | ❌ | ❌ | ❌ | P2 | خاص بتكامل WMS قديم — غالباً N/A |
| POSS007 | إعداد اتصال WMS للمستخدم | إعدادات اتصال WMS | ❌ | ❌ | ❌ | P2 | N/A مثل POSS006 |
| POSS028 | تسجيل أجهزة WMS (نسخة) | نسخة مطابقة لـ POSS006 | ❌ | ❌ | ❌ | P2 | N/A (نسخة مكررة من POSS006) |
| POSS029 | تسجيل أجهزة WMS (نسخة) | نسخة مطابقة لـ POSS006 | ❌ | ❌ | ❌ | P2 | N/A (نسخة مكررة) |

**POSS: ✅ 0 · 🟡 3 · ❌ 6**

---

## 5) أخرى — POSLGN + POSQ + POSADVS + POS* خدمية (10 شاشات)

| الشاشة | النوع | الوظيفة | الحالة | Backend | Frontend | أولوية | المطلوب |
|---|---|---|:---:|---|---|:---:|---|
| POSLGN | دخول | تسجيل الدخول + المفضلة + الناقل | ✅ | ✅ login/refresh/me + `admin/sessions` (سجل الدخول) | ✅ LoginPage | **P0** | مكتملة. (الأصل يفحص HDSERIAL للترخيص — يقابله تصريح الجهاز في POSI001) |
| POSQ001 | استعلام | استعلام أسعار الصنف (IAS_POS_ITM_PRICE) | ✅ | ✅ `items/{code}` + `barcode/{bc}` | ✅ PriceCheckPage | P1 | مكتملة (تتقاطع مع POST016) |
| POSADVS | لمس | شاشة بيع لمسية متقدمة (بديل POST001) | 🟡 | ✅ نفس bills | 🟡 PosPage حديثة لمسية أصلاً | P2 | لا حاجة لنسخة منفصلة — PosPage هي الواجهة اللمسية. يبقى: وضع ملء شاشة/سمات skin |
| POSADVS2 | لمس | متغيّر ثانٍ من الشاشة اللمسية | ❌ | — | ❌ | P2 | N/A — تغطيها PosPage |
| POSADVS_SCND | لمس | **شاشة العميل الثانية** (عرض للزبون) | ❌ | ❌ | ❌ | P1 | customer-facing display (نافذة ثانية تعرض الأسطر/الإجمالي/QR) — ميزة ملموسة للمتاجر |
| POSAVLQTY | خدمي | الكميات المتاحة للصنف عبر المخازن | ✅ | ✅ `inventory` + `/{code}` + `low-stock` | ✅ InventoryPage + DetailDialog | P1 | مكتملة |
| POS_ALRT_SCR | خدمي | تنبيهات/ملاحظات عند الدخول | ❌ | ❌ | ❌ | P2 | إشعارات بسيطة عند الدخول (جدول notes + عرض مرة واحدة) — جهد صغير |
| POS_IMPXLS_AVLQTY | خدمي | استيراد Excel كميات + طباعة باركود | ❌ | ❌ | 🟡 barcode print موجود (print feature) | P2 | استيراد CSV/XLSX للأصناف/الكميات + ربطه بطباعة الباركود القائمة |
| POS_INSTALL | خدمي | التنصيب الأولي (83 جدولاً، DB links) | ❌ | — (تُغنى عنها migrations/seed/docker) | — | P2 | **N/A معمارياً** — يقابلها `prisma migrate` + seed. يلزم توثيق إجراء تهيئة فرع جديد |
| POS_ITM_PRICE | خدمي | مستويات أسعار الأصناف (DFLT_PRICE_LEV) | ✅ | ✅ `items/{code}/prices` (كل LEV_NO×وحدة من IAS_ITEM_PRICE) + `items/{code}/prices/{lev}?unit=` (اختيار المستوى بالبيع) | ❌ | P1 | backend مكتمل — يتبقى ربط الواجهة (اختيار المستوى بالآلة/العميل) |

**أخرى: ✅ 3 · 🟡 3 · ❌ 4**

---

## 📊 الإحصاء النهائي الدقيق (تدقيق مستقل 2026-07-04 — Fable 5)

> عدّ المدقق صف-بصف بقاعدة صارمة: ✅ يتطلب backend **وواجهة** فعليين. لذلك POST018 (جرد — backend كامل بلا UI) وPOS_ITM_PRICE (backend كامل بلا UI اختيار مستوى) تُحسبان 🟡 رغم اكتمال الـbackend.

| الفئة | العدد | ✅ كاملة | 🟡 جزئية | ❌ غير مبنية |
|---|:---:|:---:|:---:|:---:|
| حركات POST | 30 | **12** | 10 | 8 |
| تقارير POSR | 16 | **5** | 11 | 0 |
| إدخال POSI | 15 | **7** | 4 | 4 |
| إعدادات POSS | 9 | **0** | 3 | 6 |
| أخرى | 10 | **3** | 2 | 5 |
| **الإجمالي** | **80** | **27** | **30** | **23** |

> _(2026-07-04 UI موجة E — frontend: POSI007/009/200 اكتملت 🟡→✅ بـ 6 شاشات جديدة منشورة: موردون، مخازن، مجموعات+وحدات، عملات، بطاقات مسبقة الدفع، مجموعات عملاء — كلها RTL + TanStack Query + origin badges + RBAC، مُثبتة حياً على https://nuugneol.gensparkclaw.com ببيانات حقيقية.)_

> _(2026-07-04 موجة E — POSI: خمس شاشات انتقلت ❌→🟡 بـbackend كامل مُثبت حياً: POSI002/003 لوحات المفاتيح، POSI007 بطاقات مسبقة الدفع، POSI009 مجموعات العملاء، POSI200 أرصدة البطاقات — وأضيفت موردون/مخازن/مجموعات/وحدات/عملات + باركود متعدد وحدود مخزون للأصناف. الإجمالي لم يتغير ✅ إلا بـ+1 لأن القاعدة الصارمة تشترط الواجهة.)_

### النسبة الحقيقية (2026-07-04 بعد UI موجة E)
- **صارمة (كاملة فقط):** 27/80 = **33.75%** _(كانت 28.75% صباحاً، 17.5% في 2026-07-03)_
- **مرجّحة (كاملة=1، جزئية=0.5):** (27 + 30×0.5)/80 = 42/80 = **52.5%** _(كانت 44%)_
- **ضمن النطاق التشغيلي الفعلي (P0+P1 ≈ 44 شاشة):** ≈ **64%** مرجّحة _(كانت 54.5%)_.
- **دورة البيع اليومية (P0):** دخول✅ بيع✅(**توأمة YSPOS23 حية مثبتة**) تعليق✅ دفع متعدد✅(+نقاط/كوبون) مرتجع✅(**حتى على فواتير Motech — IAS_POS_RT_BILL_MST حقيقي**) قارئ أسعار✅ وردية✅ تصفية بفئات✅ Z-report✅(يشمل مبيعات Motech) سندات✅ ⇒ **~95% من يوم الكاشير يعمل الآن**. المتبقي بالدورة: محرك عروض + بطاقات مسبقة الدفع + تغيير كلمة السر.

### تطوّر الأرقام
| التدقيق | ✅ | 🟡 | ❌ | مرجّحة |
|---|:---:|:---:|:---:|:---:|
| 2026-07-03 | 14 | 32 | 34 | 37.5% |
| **2026-07-04** | **23** | **25** | **32** | **44%** |

---

## 📋 قائمة النواقص الكاملة (46 شاشة ناقصة) مرتبة بالأولوية

### 🔴 P0 — يمنع/يشوّه العمل اليومي (4 نواقص)
| # | الشاشة | الناقص بالضبط |
|---|---|---|
| 1 | POST001 🟡 | طرق دفع الكوبون/البطاقة المسبقة/استبدال النقاط + محرك العروض + باركود الموزونات |
| 2 | POST013 ✅* | (اكتمل backend: count بالفئات + settle معتمد + settlement — يتبقى UI إدخال الفئات فقط) |
| 3 | ~~POSS001~~ ✅ | ~~تغطية كل متغيرات IAS_PARA_POS~~ اكتملت: 179/179 في UI بتبويبات + بحث + حفظ/إرجاع لكل مفتاح (2026-07-04) |
| 4 | POSR001 ✅* | (اكتمل — يتبقى تحسين طباعة Z حرارية فقط) |

### 🟠 P1 — مهم (22 ناقصاً)
| # | الشاشة | الحالة | الناقص بالضبط |
|---|---|:---:|---|
| 5 | POST010/011 | 🟡 | شاشة تحصيل/سداد فواتير مستقلة (backend **كامل**: credit-bills + collect حي) |
| 6 | POST006 | 🟡 | ربط المرتجع بسند صرف تلقائي |
| 7 | POST014 | 🟡 | حركات عهدة أثناء الوردية (إيداع/سحب) |
| 8 | POST015 | 🟡 | ترحيل الفائض/العجز كسجل معتمد عند الإقفال |
| 9 | POST020 | 🟡 | ربط عميل بفاتورة مرحّلة **بأثر رجعي** |
| 10 | POST021 | ✅ | سجل حركة النقاط التفصيلي — backend + تبويب «حركة النقاط» في CustomersPage (2026-07-03/04) |
| 11 | POST012 | 🟡 | تفصيل طرق الدفع لكل كاشير |
| 12 | POST008 | 🟡 | مزامنة نزولية (أصناف/أسعار) + جدولة تلقائية |
| 13 | POST005 | 🟡 | صفحة تفصيل مردود مكافئة لـ BillDetail |
| 14 | POSI007 | 🟡 | CRUD بطاقات/كوبونات + دفع بها (مرتبط بـ#1) |
| 15 | POSI008 | 🟡 | CRUD برامج نقاطي + صفحة إعداد |
| 16 | POSI011 | 🟡 | ✅ backend CRUD جاهز (POST/PUT users + status) — يتبقى واجهة AdminPage |
| 17 | POSI001 | 🟡 | ✅ backend CRUD جاهز (POST/PUT machines) — يتبقى واجهة + تصريح أجهزة |
| 18 | POSI2000 | 🟡 | ~~وحدات/باركودات متعددة + مستويات أسعار~~ ✅ backend (units/prices/categories) — يتبقى UI |
| 19 | POSI002+003 | ❌ | تكوين لوحات المفاتيح اللمسية وربط ItemGrid بها |
| 20 | POSS004 | ✅ | تغيير كلمة السر — backend + حوار ChangePasswordDialog من رأس الشاشة (2026-07-04 موجة G-UI) |
| 21 | POSS002 | 🟡 | ✅ backend مصفوفة صلاحيات جاهزة (GET/PUT /admin/permissions) — يتبقى واجهة + فرض ديناميكي |
| 22 | POSR005 | 🟡 | ✅ backend `reports/audit` جاهز (أسطر محذوفة + مستخدم + وقت) — يتبقى تبويب واجهة |
| 23 | POSR010 | ✅ | تقرير الولاء — backend + تبويب loyalty في ReportsPage (2026-07-04) |
| 24 | POSR002 | ✅ | كشف حساب عميل + by-shift + shifts-history — backend + تبويبات واجهة (2026-07-04). POSR011 returns-window: backend فقط (بلا تبويب بعد) |
| 25 | POS_ITM_PRICE | ✅ | مستويات الأسعار — endpoints جاهزة (يتبقى UI اختيار المستوى) |
| 26 | POSADVS_SCND | ❌ | شاشة عرض للعميل (نافذة ثانية) |

### 🟡 P2 — نادر/إداري/مؤجل (20 ناقصاً)
| الشاشات | الناقص |
|---|---|
| POST018, POST022 | جرد الآلات وجرد المردودات |
| POST019 | ✅ backend + واجهة TransfersPage (2026-07-04) — يتبقى POST028/POST029 (تنفيذ التحويل والاستلام) |
| POST023 | ✅ backend + واجهة PrescriptionsPage (2026-07-04) — مكتملة |
| POST024 + POSR015 | أوامر البيع (إنشاء) — تقريرها POSR015 ✅ backend (`reports/sales-orders`) |
| POST009 | دمج إحصاءات الآلة في بطاقة واحدة |
| POSTIN_MTX, POST_WST | قيود JV/خدمي — يبقى في Onyx / N/A |
| POSR003, POSR006, POSR007, POSR008, POSR009, POSR012, POSR016 | ✅ backend + واجهة (2026-07-04): زر تصدير CSV لكل تقرير مسطّح + تبويبات receivables/vouchersSummary/customerGroups/salesOrders + الموجود (sales-by-category/item-movement/slow-moving) |
| POSI004, POSI005, POSI006, POSI009, POSI012, POSI200 | مفاتيح مساعدة، موازين، مجموعات عملاء، أنواع بطاقات، أرصدة بطاقات |
| POSI014, POS_INSTALL | **N/A** — migrations/seed تحل محلهما (توثيق فقط) |
| POSS003 | نسخ احتياطي (ops) — POSS005 ✅ backend defaults جاهز |
| POSS006/007/028/029 | **N/A** — تكامل WMS قديم (4 شاشات) |
| POSADVS, POSADVS2 | تغطيها PosPage (skin/ملء شاشة فقط) |
| POS_ALRT_SCR, POS_IMPXLS_AVLQTY | تنبيهات دخول + استيراد Excel |

---

## 🌊 خطة الموجات حتى صفر نقص

### الموجة A — «يوم كاشير مثالي 100%» (P0 المتبقي) — الأثر الأعلى
1. **الدفع الكامل في POST001:** إضافة COUPON/GIFT_CARD/POINTS كطرق دفع (backend enum + PaymentDialog) مع خصم الرصيد من cards/loyalty.
2. ~~**تصفية معتمدة (POST013/015):** إدخال فئات العملة + حفظ سجل over/short~~ ✅ أُنجزت (`/count` + `/settle` + `/settlement`، جدول SHIFT_DENOMINATIONS، حالة SETTLED نهائية).
3. ~~**استكمال متغيرات POSS001**~~ ✅ أُنجزت (كل الـ179 في UI بتبويبات مجموعات + بحث + حفظ فوري + إرجاع للحية).
4. **POSS004 تغيير كلمة السر** (صغيرة — تُنجز هنا).
> معيار القبول: وردية كاملة (فتح→بيع بكل طرق الدفع→تعليق/استئناف→مرتجع→سندات→تصفية بفئات→Z-report مطبوع) بلا رجوع لـ Onyx.

### الموجة B — الإدارة والولاء (P1 الجوهري)
5. CRUD كامل: مستخدمين (POSI011)، آلات+تصريح (POSI001)، بطاقات/كوبونات (POSI007+POSI012)، برامج نقاطي (POSI008).
6. الولاء الكامل: سجل حركة نقاط (POST021) + ربط رجعي (POST020) + تقرير ولاء (POSR010).
7. تحصيل/سداد الفواتير (POST010/011) + سند صرف مرتجع تلقائي (POST006) + عهدة (POST014).
8. صلاحيات تفصيلية (POSS002).

### الموجة C — الكتالوج المتقدم والتقارير التاريخية (P1 المتبقي)
9. الصنف المتقدم (POSI2000 + POS_ITM_PRICE): وحدات/باركودات متعددة + مستويات أسعار + باركود الموزونات.
10. لوحات المفاتيح اللمسية (POSI002/003) مربوطة بـ ItemGrid.
11. تقارير: audit المحذوفات (POSR005 ✅)، كشف عميل (POSR002 ✅ backend موجة F)، ورديات تاريخية (POSR004/014 ✅ backend موجة F)، per-cashier payment-methods (POST012).
12. مزامنة نزولية مجدولة (POST008) + تفصيل مردود (POST005) + شاشة العميل الثانية (POSADVS_SCND).

### الموجة D — الإقفال النهائي (P2: كل ما تبقى — لا يبقى ولا شاشة)
13. الجرد (POST018/022) والتحويلات المخزنية (POST019/028/029).
14. أوامر البيع (POST024 + POSR015) والوصفة الطبية (POST023 — إن لزم النشاط).
15. بقية التقارير (POSR003/006/007/008/009/012/016 — ✅ backend موجة F 2026-07-04، يتبقى واجهة) + مدخلات ثانوية (POSI004/005/006/009/200) + تنبيهات واستيراد Excel + نسخ احتياطي.
16. **توثيق N/A رسمي** للشاشات المستبدلة معمارياً (POSI014, POS_INSTALL, POSS006/007/028/029, POSADVS2, POST_WST, POSTIN_MTX) في ADR حتى تُحسب "مغلقة" لا "منسية".

> بعد الموجة D: 80/80 شاشة إما ✅ مبنية أو 📄 مغلقة بقرار معماري موثّق — **صفر نقص**.
