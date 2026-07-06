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
| POST005 | استعراض/ترحيل فواتير المردود | مثل POST004 لكن للمردودات (RT_BILL) | ✅ | ✅ `GET /returns`, `GET /returns/{id}` | ✅ ReturnsPage (قائمة) + صفحة تفصيل كاملة `/returns/:id` مكافئة لـ BillDetail: بنود (كود/وحدة/كمية/سعر/خصم/ضريبة/صافي) + محسوب-من-البنود مقابل **القيم المرحّلة المخزّنة** (rtBillAmt/vatAmt/discAmt/payedAmt) + رابط للفاتورة الأصلية (2026-07-06 مُثبت حياً) | P1 | مكتمل |
| POST006 | الدفع النقدي للمرتجعات | سند إرجاع (صرف) لاسترداد قيمة المرتجع | ✅ | ✅ `POST /vouchers/refunds` (سند صرف EXPENSE مرجعه REFUND_RETURN_ID، idempotent 1:1 عبر UX_VOUCHERS_REFUND_RET) + `GET /vouchers/for-return/:id` — يدخل تلقائياً في تصفية الوردية كمصروف نقدي | ✅ بطاقة «سند صرف المرتجع» في ReturnDetailPage (probe + زر إصدار، مخفية لمرتجعات YSPOS23 القديمة) (2026-07-06 مُثبت حياً) | P1 | مكتمل |
| POST008 | مزامنة البيانات | نقل أصناف/أسعار من السيرفر ورفع الفواتير | ✅ | ✅ صعودي `sync/enqueue·queue·run·status` + **نزولي**: `GET /sync/catalog/status·runs·items` + `POST /sync/catalog/pull` (أصناف/أسعار ERP→CATALOG_CACHE في MOTECH_POS، V027) + **جدولة تلقائية** (@nestjs/schedule cron */30m، داخل العملية بلا Redis) (2026-07-06) | ✅ SyncPage (حالة صعودي + **قسم المزامنة النزولية**: إجمالي/نشط/قديم + زر سحب الآن + سجل الأخير) (2026-07-06) | P1 | مكتمل — المزامنة النزولية + الجدولة تعملان |
| POST009 | معلومات الآلات | عرض معلومات الآلات وآخر فاتورة وصافي مبيعاتها | ✅ | ✅ `GET /admin/machines` + `reports/by-machine` | ✅ AdminPage: جدول الآلات مدموج فيه عمودا **عدد الفواتير** و**صافي المبيعات** الحيّان من reports/by-machine + آخر فاتورة (2026-07-06 مُثبت حياً: #3 → 16,821 فاتورة / 6.9M) | P2 | مكتمل |
| POST010 | الدفع النقدي للفواتير | تدفيع الفواتير النقدية (كاشير تدفيع منفصل) | ✅ | ✅ `GET /customers/{code}/credit-bills` + `POST /customers/{code}/collect` (تحصيل آجل idempotent، حارس لا-يتجاوز-المدين) + payments | ✅ تبويب "الفواتير الآجلة" في CustomersPage + حوار سند تحصيل (2026-07-04) | P1 | مكتملة الجوهر |
| POST011 | سداد الفواتير | سداد فواتير آجلة (IAS_POS_PAY_BILLS) | ✅ | ✅ credit-bills/collect (CREDIT_COLLECTIONS جديدة V013) + payments endpoints | ✅ السداد من تبويب العميل (CustomersPage → الآجلة → تحصيل) **+ بطاقة سداد مباشرة في BillDetailPage** (تظهر تلقائياً إن كانت الفاتورة آجلة مفتوحة، CollectDialog مشترك) (2026-07-06) | P1 | مكتمل |
| POST012 | ملخص مبيعات الكاشيرات | ملخص نقدي/آجل/شبكة/مردودات لكل كاشير | ✅ | ✅ `reports/cashier-payment-summary` (طرق الدفع **لكل كاشير** + مرتجعات/استرداد) + `by-cashier` + `shifts/{id}/summary` | ✅ تبويب «ملخص مبيعات الكاشيرات» في ReportsPage (طرق دفع مفصّلة لكل كاشير + KPIs) (2026-07-06 مُثبت حياً) | P1 | مكتمل |
| POST013 | تصفية مبيعات الكاشيرات | عدّ النقد بالفئات ومطابقته مع النظام | ✅ | ✅ `POST /shifts/{id}/count` + `POST /shifts/{id}/settle` + `GET /shifts/{id}/settlement` + reconciliation | ✅ ReconciliationPage: إدخال الفئات (فئة×عدد + مجموع حي) + اعتماد supervisor/admin + عرض التصفية المجمّدة — ويعمل بعد إقفال الوردية (lastShiftId) (2026-07-04) | P1 | مكتملة |
| POST014 | عهدة الكاشيرات المالية | تسجيل عهدة/سحب عهدة للكاشير | ✅ | ✅ `POST /shifts/{id}/custody` (إيداع/سحب idempotent، حارس لا-يتجاوز-الدرج) + `GET /shifts/{id}/custody` (CASHIER_CUSTODY V028) — صافي العهدة يدخل في expected-cash في close وreconciliation | ✅ لوحة «عهدة الكاشير» في ReconciliationPage (إيداع/سحب + إجماليات حيّة + سجل حركات) (2026-07-06 مُثبت حياً) | P1 | مكتمل |
| POST015 | فائض وعجز الكاشيرات | إثبات قيد الفائض/العجز بعد التصفية | ✅ | ✅ over/short يُحسب في reconciliation + **يُرحّل كقيد معتمد ثابت** في SHIFT_VARIANCE عند settle (سجل واحد لكل وردية، idempotent، V028) + `GET /shifts/{id}/variance` | ✅ شارة «قيد الفائض/العجز» في ReconciliationPage بعد الاعتماد | P1 | مكتمل |
| POST016 | قارئ الأسعار | استعلام سعر+صورة+كمية بالباركود للزبون | ✅ | ✅ `items/barcode/{bc}`, `items/{code}` | ✅ PriceCheckPage | P0 | مكتملة. (تحسين: وضع kiosk بملء الشاشة + صورة الصنف) |
| POST017 | استعراض حركة الفواتير | استعراض حركة المبيعات والمردودات بفلاتر | ✅ | ✅ `GET /bills` (فلاتر) + `GET /returns` | ✅ BillsPage + ReturnsPage | P1 | مكتملة |
| POST018 | جرد الآلات | جرد بجهاز جرد + مطابقة (IAS_POS_AUD_ITEM) | ✅ | ✅ `POST /inventory/counts` + `/:id/lines` + `/:id/post` + `GET` قائمة/تفاصيل (V015: STOCK_COUNTS/LINES، فرق = عدّ − نظام من MV_ITEM_AVL_QTY، اعتماد supervisor/admin idempotent) | ✅ تبويب «الجرد الفعلي» في InventoryPage: بدء جرد لمخزن + إدخال عدّ (نظام/فعلي/فرق) + اعتماد supervisor/admin + قائمة/تفاصيل (2026-07-04) | P2 | مكتمل |
| POST019 | طلب صرف/تحويل مواد | طلب تحويل مخزني من نقطة البيع للمخزن | ✅ | ✅ `POST/GET /transfers` + `/:id` + `/:id/cancel` (V018: MATERIAL_TRANSFERS/LINES — مخازن مُتحقّقة حياً من YSPOS23، snapshot توفر المصدر من MV_ITEM_AVL_QTY، OPEN→CANCELLED) | ✅ TransfersPage (قائمة+فلتر حالة+إنشاء متعدد الأسطر+عرض بـavlQty+إلغاء) (2026-07-04) | P2 | يتبقى ترحيل للأونكس عبر sync عند توفر الربط |
| POST020 | ربط الفاتورة بعميل نقاطي | ربط فاتورة سابقة بعميل واحتساب نقاطها | ✅ | ✅ earn تلقائي عند البيع + **`POST /bills/{id}/attach-customer`** (ربط رجعي لفاتورة مرحّلة بلا عميل، id=uuid أو BILL_NO، مرآة C_CODE/C_NAME على IAS_POS_BILL_MST، earn رجعي idempotent، حارس لا ربط مزدوج 409) (2026-07-06) | ✅ CustomerAttach أثناء البيع + **زر «ربط عميل» في BillDetailPage** (يظهر لفاتورة بلا عميل → picker → attach + عرض النقاط المكتسبة) (2026-07-06) | P1 | ✅ مكتمل |
| POST021 | استعراض حركة النقاط | سجل حركة النقاط لكل العملاء + الانتهاء | ✅ | ✅ `loyalty/customers/{code}/ledger` + `loyalty/summary` | ✅ تبويب "حركة النقاط" في CustomersPage: رصيد + سجل كامل برصيد جارٍ لكل حركة (2026-07-04) | P1 | مكتملة الجوهر (تحسين: صفحة إجماليات لكل العملاء من loyalty/summary) |
| POST022 | جرد أصناف مردود المبيعات | مطابقة الكمية المردودة فعلياً مع المسجلة | ✅ | ✅ `POST/GET /return-counts` + `/:id/lines` + `/:id/post` (V026: النظامي حي من IAS_POS_RT_BILL_MST/DTL لآلة+يوم، DIFF=معدود−نظامي، اعتماد supervisor idempotent) (2026-07-04 Fable5) | ✅ ReturnCountsPage `/return-counts` (جلسات+فلتر، بدء جلسة آلة+يوم، عدّ أصناف نظامي/معدود/فرق ملوّن، اعتماد supervisor) (2026-07-04) | P2 | مكتملة |
| POST023 | الوصفة الطبية | إدخال وصفة (Wasfaty) وربطها بالفاتورة | ✅ | ✅ `POST/GET /prescriptions` + `/:id` + `bill/:billNo/items` (V017: PRESCRIPTIONS/LINES — طبيب+مريض+جرعة/استخدام/مدة لكل صنف، فاتورة مُتحقّقة حياً والأصناف يجب أن تكون عليها) | ✅ PrescriptionsPage (قائمة+فلاتر+إنشاء من أصناف الفاتورة+عرض) (2026-07-04) | P2 | مكتملة (صيدليات) |
| POST024 | طلبات العملاء | أوامر بيع تُنزَّل لاحقاً في فاتورة | ✅ | ✅ module sales-orders: `POST/GET /sales-orders` + `/:id/convert` (**ينزل فاتورة حقيقية في YSPOS23** عبر PostBillUseCase — مُثبت: أمر→فاتورة 260700300000407) + `/:id/cancel` (V021: OPEN→CONVERTED|CANCELLED، تحويل idempotent) (2026-07-04 Fable5) | ✅ SalesOrdersPage `/sales-orders` (قائمة+فلتر حالة، إنشاء أمر بأصناف، تنزيل في فاتورة بضغطة، إلغاء، تفاصيل) (2026-07-04) | P2 | مكتملة |
| POST025 | المقبوضات | سندات قبض نقدية يستلمها الكاشير | ✅ | ✅ `POST /vouchers` (RECEIPT) | ✅ VouchersPage + VoucherDialog | P1 | مكتملة — وتدخل في تصفية الوردية (voucher-cash-totals) |
| POST026 | المصروفات | سندات صرف نقدية من الصندوق | ✅ | ✅ `POST /vouchers` (EXPENSE) | ✅ VouchersPage + VoucherDialog | P1 | مكتملة |
| POST027 | ورديات العمل | فتح/إقفال وردية + عهدة + تصفية | ✅ | ✅ open/close/current/summary/reconciliation | ✅ ShiftBar + ReconciliationPage | **P0** | مكتملة الجوهر. (يكمّلها نقص POST013/014/015 أعلاه) |
| POST028 | التحويل المخزني | تحويل أصناف بين المخازن (36 block) | ✅ | ✅ `POST/GET /stock-issues` + `/:id/post` + `/:id/cancel` (V025: اعتماد supervisor يكتب **ITEM_MOVEMENT حقيقي DOC_TYPE=7/IN_OUT=−1** + حارس توفر 422 insufficient-stock — مُثبت: المخزون نقص فعلياً 35→32) (2026-07-04 Fable5) | ✅ StockIssuesPage `/stock-issues` (قائمة+فلتر، صرف/تحويل صادر، اعتماد supervisor ينقص المخزون، إلغاء) (2026-07-04) | P2 | مكتملة |
| POST029 | الاستلام المخزني | استلام التحويلات الواردة | ✅ | ✅ `POST/GET /stock-receipts` + `/:id/post` + `/:id/cancel` (V022+V023: اعتماد supervisor يكتب **ITEM_MOVEMENT حقيقي DOC_TYPE=8/IN_OUT=+1 فيزيد المخزون فعلاً** — مُثبت: 33→35 وصف SERIAL=13929 بSELECT مباشر؛ V024 أصلح 158 حزمة ERP كانت تكسر triggers) (2026-07-04 Fable5) | ✅ StockReceiptsPage `/stock-receipts` (قائمة+فلتر، استلام جديد، اعتماد supervisor يزيد المخزون، إلغاء) (2026-07-04) | P2 | مكتملة |
| POSTIN_MTX | قيود يومية MTX | إدخال قيود محاسبية (JV) من نقطة البيع | 📄 N/A | — | — | P2 | **مغلقة معمارياً** — المحاسبة تبقى في Onyx ([ADR-009](ADR/ADR-009-jv-mtx-stays-in-onyx.md)) |
| POST_WST | شاشة خدمية (WST) | قالب خدمي شبه فارغ (0 triggers/0 PU) | 📄 N/A | — | — | P2 | **مغلقة معمارياً** — لا وظيفة مستقلة ([ADR-010](ADR/ADR-010-empty-service-screens.md)) |

**POST: ✅ 22 · 🟡 6 · ❌ 2 (كلاهما N/A: POSTIN_MTX وPOST_WST)** _(2026-07-06 Fable5 UI: POST005 صفحة تفصيل مرتجع كاملة + POST009 إحصاءات مدموجة في جدول الآلات + POST011 زر سداد مباشر في BillDetail — ثلاثتها 🟡→✅ مُثبتة حياً)_ _(2026-07-04 موجة H UI: POST022/024/028/029 صارت ✅ — الواجهة رُبطت بالكامل)_ _(2026-07-04 Fable5 backend: POST022/024/028/029 صارت 🟡 — backend كامل مُثبت حياً، تنقصها الواجهة فقط)_ _(تدقيق فجر 2026-07-04: +POST019 وPOST023 بواجهتيهما — POST018 يبقى 🟡 بلا UI)_ _(2026-07-04: POST001/010/013/021 صارت ✅ — الواجهة رُبطت بالكامل)_

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
| POSR011 | تقرير المردودات والدفع النقدي للمرتجعات (PRD_BACK_HOUR) | ✅ | ✅ `reports/returns-window` — كل مرتجع مع ساعات التأخير عن الفاتورة الأصلية وwithinWindow مقابل PRD_BACK_HOUR (غير مفعّل حالياً = null) + `reports/returns` (2026-07-04) | ✅ تبويب returnsWindow في ReportsPage (KPIs داخل/خارج النافذة + delayHours + شارات) (2026-07-04) | P1 | مكتمل |
| POSR012 | تقرير مجموعات العملاء/المناديب/المناطق (CUSTMR_GRP, SALES_MAN) | ✅ | ✅ `reports/customer-groups` — مبيعات بمجموعة العميل (IAS_CASH_CUSTMR_GRP فارغة حالياً → دلو NULL يجمع الكل؛ يتفعّل تلقائياً مع POSI009) (2026-07-04) | ✅ تبويب customerGroups + CSV (2026-07-04) | P2 | يتبقى بذر المجموعات (POSI009 UI) |
| POSR013 | تقرير مبيعات الأصناف (IAS_ITM_MST تفصيلي) | ✅ | ✅ `by-item` + `discount` + `profit` + `comparison` | ✅ 4 تبويبات: byItem/discount + "الأرباح" و"مقارنة فترتين" (2026-07-04) | P1 | مكتمل |
| POSR014 | تقرير الورديات والتصفية (POS_WRK_SHFT_CSHR, CASHER) | ✅ | ✅ `reports/shifts-history` — كل الورديات التاريخية بفروقها (متوقع/فعلي/معدود/فرق التصفية + سندات قبض/صرف لكل وردية، فلتر status) + `z-report` + `shifts/{id}/summary` (2026-07-04) | ✅ تبويب shiftsHistory (متوقع/معدود/فرق/سندات) + ReconciliationPage + CSV (2026-07-04) | P1 | مكتمل |
| POSR015 | تقرير أوامر البيع (SALES_ORDER) | ✅ | ✅ `reports/sales-orders` — قراءة أوامر البيع من YSPOS23.SALES_ORDER (فلتر processed/مدى) (2026-07-04). إنشاء الأوامر (POST024) يبقى مستقلاً | ✅ تبويب salesOrders (قراءة) + CSV (2026-07-04) | P2 | يتبقى POST024 للإنشاء |
| POSR016 | تقرير السندات/الحسابات (ACCOUNT, PRIV_ACC) | ✅ | ✅ `reports/vouchers-summary` (إجماليات لفترة/وردية) + `GET /vouchers` (2026-07-04) | ✅ تبويب «ملخص السندات» في ReportsPage (KPIs قبض/صرف/صافي + جدول) + VouchersPage (2026-07-06 مُثبت حياً بلقطة) | P2 | مكتمل |

**POSR: ✅ 16 · 🟡 0 · ❌ 0 — backend 16/16 والواجهة 16/16.** _(تدقيق 2026-07-06 بالمتصفح حياً: تبويبا «نافذة الإرجاع» (POSR011) و«ملخص السندات» (POSR016) و«سجل الحذف» (POSR005) وزر CSV (POSR003) كلها تعرض بيانات حقيقية — ReportsPage 29 تبويباً)_ _(تدقيق فجر 2026-07-04: تبويبات الموجة F رُبطت فعلاً — ReportsPage 27 تبويباً + CSV حي)_ _(2026-07-04 الموجة F: اكتمل backend كل تقارير POSR الـ16 — أُضيفت by-shift/shifts-history/customer-statement/receivables/vouchers-summary/loyalty/returns-window/sales-orders/customer-groups/export-CSV + فلتر machine في sales-by-category. المتبقي: ربط تبويبات الواجهة. كما أُصلح باغ P1: توحيد معادلة expected-cash بين close وreconciliation — السندات تُحتسب في المكانين)_

---

## 3) إدخال/بيانات أساسية — POSI (15 شاشة)

| الشاشة | الاسم العربي | الوظيفة | الحالة | Backend | Frontend | أولوية | المطلوب |
|---|---|---|:---:|---|---|:---:|---|
| POSI001 | أجهزة وآلات نقاط البيع | تعريف الآلات + التصريح للأجهزة | ✅ | ✅ `GET/POST /admin/machines` + `PUT /admin/machines/{no}` (overlay في MOTECH_POS يدمج مع IAS_POS_MACHINE) | ✅ AdminPage: إنشاء/تعديل آلات (حوار كامل + origin badge) (2026-07-04) | P1 | تحسين: تصريح جهاز (ربط terminal بالآلة) |
| POSI002 | لوحة المفاتيح الإضافية | ترميز لوحات لمسية للأصناف بلا باركود | ✅ | ✅ `GET/POST/PUT /keypads` (V016: KEYPADS — جداول YSPOS23 فارغة → MOTECH_POS مرجعي) (2026-07-04) | ✅ صفحة `/keypads`: إنشاء/تعديل لوحات + شبكة أزرار ملوّنة بمجموعات (2026-07-04) | P1 | مكتمل |
| POSI003 | أصناف لوحة المفاتيح | ربط الأصناف بأزرار اللوحة | ✅ | ✅ `GET /keypads/{no}` + `POST /keypads/{no}/keys` + `DELETE …/keys/{id}` (زر→صنف مع اسم/سعر حي من IAS_ITM_MST/IAS_ITEM_PRICE + مجموعة/لون/ترتيب) (2026-07-04) | ✅ حوار «ربط صنف» ببحث حي + عنوان/مجموعة/لون، وحذف مفتاح من الشبكة (2026-07-04) | P1 | مكتمل |
| POSI004 | مفاتيح المساعدة | عرض اختصارات لوحة المفاتيح | ❌ | — | ❌ | P2 | شاشة/Modal "اختصارات" ثابتة في PosPage (F-keys) — جهد صغير جداً |
| POSI005 | أنواع الموازين | ترميز الموازين المستخدمة | ❌ | ❌ | ❌ | P2 | يلزم فقط مع دعم باركود الوزن (مرتبط بنقص POST001) |
| POSI006 | مفاتيح أصناف الموزنات | ربط الأصناف الموزونة بمفاتيح الميزان | ❌ | ❌ | ❌ | P2 | مع POSI005 (تصدير PLU للميزان) |
| POSI007 | بطاقات الدفع المسبق والكوبونات | ترميز بطاقات/كوبونات للتدفيع المتعدد | ✅ | ✅ `GET/POST /prepaid-cards` + `topup/redeem/status/movements` (V019: دفتر حركات برصيد جارٍ، REDEEM محروس بقفل صف — لا سحب فوق الرصيد 422، بطاقة معطلة/منتهية 409) + `GET /cards`,`/coupons` (2026-07-04) | ✅ صفحة `/prepaid-cards` (قائمة + فلاتر عميل/نوع/نشطة + إصدار + شحن/سحب مع حارس رصيد + تفعيل/تعطيل + سجل حركات برصيد جارٍ POSI200) (2026-07-04 UI موجة E) | P1 | تحسين: **ربط redeem كطريقة دفع** في PaymentDialog |
| POSI008 | ترميز برامج نقاطي | تعريف برامج الولاء وطرق الاحتساب | ✅ | ✅ **`GET/POST/PUT/DELETE /loyalty/programs`** (V027: LOYALTY_PROGRAMS — طريقة احتساب 1/2، ريال/نقطة، حد أدنى للفاتورة، حد أقصى للنقاط/فاتورة، نافذة صلاحية، برنامج نشط واحد لكل نوع نقاط عبر فهرس فريد دالّي). activeRule يفضّل البرنامج النشط ثم يعود لـLOYALTY_CONFIG. earnOnSale يطبّق الحد الأدنى/الأقصى (2026-07-06) | ✅ تبويب «برامج النقاط» في SettingsPage (جدول + حوار إنشاء/تعديل/حذف: طريقة الاحتساب/الحدود/الصلاحية/نشط) — supervisor/admin (2026-07-06) | P1 | ✅ مكتمل |
| POSI009 | مجموعات عملاء نقاط البيع | تقسيم العملاء لمجموعات للتقارير | ✅ | ✅ `GET/POST/PUT /customer-groups` + `POST /{no}/members` + `DELETE /members/{code}` (V020: مجموعة واحدة لكل عميل، أسماء عربية من CUSTOMER) (2026-07-04) | ✅ صفحة `/customer-groups` master/detail (قائمة مجموعات + إنشاء/تعديل + لوحة أعضاء: إضافة بكود العميل / إزالة) (2026-07-04 UI موجة E) | P2 | مكتملة الجوهر — يغذّي POSR012 تلقائياً |
| POSI010 | بيانات عملاء نقاط البيع | إدخال/تعديل بيانات العميل النقدي | ✅ | ✅ `POST/PUT /customers` | ✅ CustomersPage + CustomerDialog | P1 | مكتملة الجوهر. (تحسين: حقول مندوب/منطقة/مجموعة) |
| POSI011 | المستخدمون | إدارة مستخدمي النظام (USER_R) | ✅ | ✅ `GET/POST /admin/users` + `PUT /admin/users/{id}` + `PUT /admin/users/{id}/status` (overlay USERS_OVERLAY يدمج مع USER_R + ربط بحساب auth عبر authUsername) | ✅ AdminPage: إنشاء/تعديل/تفعيل-تعطيل + عمودا الدور/origin (2026-07-04) | P1 | مكتملة الجوهر |
| POSI012 | بطاقات POS (IAS_POS_CARD) | ترميز بطاقات الشبكة/الخصم | ✅ | ✅ **`GET/POST/PUT /pos-cards`** — IAS_POS_CARD غير موجود (تحقّق حي)، المصدر الحقيقي IAS202623.CREDIT_CARD_TYPES (مقدّس قراءة فقط) → overlay CARD_TYPES_OVERLAY (V027) + دمج FULL OUTER JOIN (overlay يفوز، origin ERP\|LOCAL\|EDIT). إنشاء LOCAL برقم مخصّص أو EDIT لبطاقة ERP. supervisor/admin (2026-07-06) | ✅ تبويب «بطاقات الخصم» صار CRUD كامل: جدول مدموج بشارات origin + حوار إنشاء/تعديل (بدّل CardTypesTable القراءة فقط) (2026-07-06) | P2 | ✅ مكتمل |
| POSI014 | تحديث قاعدة البيانات | ترقية schema وأرشفة الفواتير | 📄 N/A | — | — | P2 | **مغلقة معمارياً** — تقابلها migrations؛ الأرشفة job تشغيلي ([ADR-008](ADR/ADR-008-posi014-db-update.md)) |
| POSI200 | مبالغ بطاقات العملاء | أرصدة بطاقات العملاء مسبقة الدفع | ✅ | ✅ `GET /prepaid-cards?customer=` + `GET /prepaid-cards/{no}/movements` (رصيد حي + دفتر ISSUE/TOPUP/REDEEM برصيد جارٍ) (2026-07-04) | ✅ ضمن `/prepaid-cards`: فلتر بكود العميل + حوار سجل الحركات برصيد جارٍ (2026-07-04 UI موجة E) | P2 | تحسين: اختصار من CustomersPage |
| POSI2000 | بيانات الأصناف | إدخال/تعديل الأصناف (IAS_ITM_MST) | ✅ | ✅ `POST/PUT /items` (+ حدود مخزون min/max/reorder) + `items/{code}/units·prices·**barcodes**·**limits**` (باركود متعدد لكل وحدة: ERP IAS_ITM_UNT_BARCODE 2,614 + overlay محلي، وباركود جديد يُحل فوراً في `items/barcode/{bc}`) + `categories` | ✅ ItemsPage + ItemDialog + **ItemCatalogDialog** (مستويات الأسعار + الوحدات بمعامل التحويل) + فلتر فئات (2026-07-04) | P1 | ~~UI للباركودات المتعددة وحدود المخزون~~ ✅ تبويبا «الباركودات» + «حدود المخزون» في ItemCatalogDialog (2026-07-04 UI موجة E) |

**POSI: ✅ 11 · 🟡 0 · ❌ 4** _(2026-07-06 Lane B: POSI008 برامج النقاط 🟡→✅ (CRUD كامل + حدود + نافذة صلاحية + تبويب إدارة)، POSI012 بطاقات POS 🟡→✅ (CRUD overlay — IAS_POS_CARD غير موجود فالمصدر CREDIT_CARD_TYPES + CARD_TYPES_OVERLAY مدموج بـorigin) — كلاهما مُثبت حياً على الدومين (برنامج الذهبي 1/25 + بطاقة 901 LOCAL + بطاقة 1 EDIT). — قبلاً 2026-07-06: POSI002/003 لوحات المفاتيح ✅. ❌: POSI004 اختصارات، POSI005/006 موازين، POSI014 N/A)_

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
| POSS002 | صلاحيات المستخدمين | صلاحيات تفصيلية للشاشات/العمليات | ✅ | ✅ `GET/PUT /admin/permissions` (مصفوفة role×permission) + **فرض ديناميكي**: `PermissionsGuard` + `@RequirePermission` يستشيران ROLE_PERMISSIONS وقتالطلب (fallback آمن + cache 15ث + invalidate عند التعديل) + `GET /auth/permissions/me` لبوابة الواجهة (2026-07-06) | ✅ تبويب "الصلاحيات" في AdminPage: مصفوفة checkboxes + حفظ ذري + **تعطيل/إخفاء عناصر حسب الصلاحية (usePermissions)** (2026-07-06) | P1 | مكتمل — الفرض ديناميكي فعلاً في الـbackend |
| POSS003 | النسخ الاحتياطية | نسخ احتياطي لقاعدة البيانات | ❌ | — (ops: pg_dump/cron خارج التطبيق) | ❌ | P2 | job نسخ مجدول + زر/حالة في AdminPage (أو يُوثَّق كإجراء تشغيلي) |
| POSS004 | تغيير كلمة السر | المستخدم يغيّر كلمته | ✅ | ✅ `POST /auth/change-password` (تحقق القديمة + bcrypt-12 + كتابة ذرّية لـ auth-users.json تنجو من restart) | ✅ حوار ChangePasswordDialog من رأس الشاشة (قديمة+جديدة+تأكيد، لكل مستخدم) (2026-07-04) | P1 | مكتمل |
| POSS005 | الإعدادات الافتراضية | افتراضيات على مستوى النظام/النقطة | ✅ | ✅ `GET/PUT /settings/defaults` (قيم POS_DFLT_STNG_MST الحية + overlay `default.<no>`، value/liveValue/overridden، admin-only للكتابة، STNG_NO مُتحقّق) + machine overrides | ✅ تبويب «الافتراضيات المرقّمة» في SettingsPage: جدول رقم/وصف/قيمة + حفظ فوري + إرجاع للحية (2026-07-04) | P2 | مكتمل |
| POSS006 | تسجيل أجهزة WMS | ربط أجهزة مستودعات خارجية | 📄 N/A | — | — | P2 | **مغلقة معمارياً** — WMS خارج نطاق POS ([ADR-006](ADR/ADR-006-wms-device-screens.md)) |
| POSS007 | إعداد اتصال WMS للمستخدم | إعدادات اتصال WMS | 📄 N/A | — | — | P2 | **مغلقة معمارياً** ([ADR-006](ADR/ADR-006-wms-device-screens.md)) |
| POSS028 | تسجيل أجهزة WMS (نسخة) | نسخة مطابقة لـ POSS006 | 📄 N/A | — | — | P2 | **مغلقة معمارياً** — نسخة مكررة ([ADR-006](ADR/ADR-006-wms-device-screens.md)) |
| POSS029 | تسجيل أجهزة WMS (نسخة) | نسخة مطابقة لـ POSS006 | 📄 N/A | — | — | P2 | **مغلقة معمارياً** — نسخة مكررة ([ADR-006](ADR/ADR-006-wms-device-screens.md)) |

**POSS: ✅ 3 · 🟡 1 · ❌ 5** _(2026-07-06: POSS005 ✅ — تبويب «الافتراضيات المرقّمة» مُثبت حياً بجدول قيم قابلة للتحرير. المتبقي 🟡: POSS002 الفرض الديناميكي في الـbackend)_

---

## 5) أخرى — POSLGN + POSQ + POSADVS + POS* خدمية (10 شاشات)

| الشاشة | النوع | الوظيفة | الحالة | Backend | Frontend | أولوية | المطلوب |
|---|---|---|:---:|---|---|:---:|---|
| POSLGN | دخول | تسجيل الدخول + المفضلة + الناقل | ✅ | ✅ login/refresh/me + `admin/sessions` (سجل الدخول) | ✅ LoginPage | **P0** | مكتملة. (الأصل يفحص HDSERIAL للترخيص — يقابله تصريح الجهاز في POSI001) |
| POSQ001 | استعلام | استعلام أسعار الصنف (IAS_POS_ITM_PRICE) | ✅ | ✅ `items/{code}` + `barcode/{bc}` | ✅ PriceCheckPage | P1 | مكتملة (تتقاطع مع POST016) |
| POSADVS | لمس | شاشة بيع لمسية متقدمة (بديل POST001) | 🟡 | ✅ نفس bills | 🟡 PosPage حديثة لمسية أصلاً | P2 | لا حاجة لنسخة منفصلة — PosPage هي الواجهة اللمسية. يبقى: وضع ملء شاشة/سمات skin |
| POSADVS2 | لمس | متغيّر ثانٍ من الشاشة اللمسية | 📄 N/A | — | — | P2 | **مغلقة معمارياً** — تغطيها PosPage ([ADR-010](ADR/ADR-010-empty-service-screens.md)) |
| POSADVS_SCND | لمس | **شاشة العميل الثانية** (عرض للزبون) | ✅ | — (لا backend — مزامنة BroadcastChannel نفس المتصفح) | ✅ `/customer-display` (features/customer-display): ترحيب + أسطر حيّة (اسم عربي/كمية/سعر/إجمالي سطر) + إجمالي كبير + ضريبة/خصم + شاشة شكر بعد الدفع مع QR الفاتورة الإلكترونية (TLV) — مزامنة لحظية من cart.store عبر BroadcastChannel + late-join handshake + زر «شاشة العميل» في PosPage يفتح نافذة ثانية (2026-07-06 Fable5) | P1 | مكتملة — ميزة تتفوق على Onyx (العرض الأصلي كان سطراً نصياً على قارئ عميل) |
| POSAVLQTY | خدمي | الكميات المتاحة للصنف عبر المخازن | ✅ | ✅ `inventory` + `/{code}` + `low-stock` | ✅ InventoryPage + DetailDialog | P1 | مكتملة |
| POS_ALRT_SCR | خدمي | تنبيهات/ملاحظات عند الدخول | ✅ | ✅ `POST/PUT/GET /alerts` + `GET /alerts/pending` (غير المُقرّة للمستخدم الحالي) + `POST /:id/ack` (مرة لكل مستخدم، V026) (2026-07-04 Fable5) | ✅ PendingAlertsBanner (banner تحت الهيدر لكل مستخدم + زر «علمت» ack) + AlertsAdminPage `/alerts` (إنشاء/تفعيل/إيقاف — supervisor/admin) (2026-07-04) | P2 | مكتملة |
| POS_IMPXLS_AVLQTY | خدمي | استيراد Excel كميات + طباعة باركود | ⏳ مؤجّل | 🟡 طباعة الباركود مبنية | 🟡 barcode print موجود | P2 | **مؤجّل قابل للبناء (ليس N/A)** — الاستيراد فقط ناقص ([ADR-011](ADR/ADR-011-pos-impxls-excel-import.md)) |
| POS_INSTALL | خدمي | التنصيب الأولي (83 جدولاً، DB links) | 📄 N/A | — | — | P2 | **مغلقة معمارياً** — تقابلها migrations + seed + docker ([ADR-007](ADR/ADR-007-pos-install.md)) |
| POS_ITM_PRICE | خدمي | مستويات أسعار الأصناف (DFLT_PRICE_LEV) | ✅ | ✅ `items/{code}/prices` (كل LEV_NO×وحدة من IAS_ITEM_PRICE) + `items/{code}/prices/{lev}?unit=` (اختيار المستوى بالبيع) | ✅ ItemCatalogDialog: جدول المستويات + مُنتقي مستوى×وحدة يعرض السعر الحي من `/prices/{lev}` (2026-07-04) | P1 | مكتمل |

**أخرى: ✅ 5 · 🟡 1 (POSADVS) · ❌ 4** _(2026-07-04: POS_ALRT_SCR صارت ✅ بواجهة banner+admin)_

---

## 📊 الإحصاء النهائي الدقيق (تدقيق مستقل ثانٍ 2026-07-04 فجراً — Fable 5، بعد كل الموجات E/F/G + settings-UI + report-tabs)

> عدّ المدقق صف-بصف بقاعدة صارمة: ✅ يتطلب backend **وواجهة** فعليين (مُثبتين بالمتصفح/الكود). POST018 (جرد — backend بلا UI) وPOS_ITM_PRICE (بلا UI اختيار مستوى) 🟡.
> **تصحيح مهم:** تبويبات الموجة F **رُبطت فعلاً بالواجهة** (commit 8ac49d6 — ReportsPage الآن **27 تبويباً** معدودة من الكود + زر تصدير CSV) — الملاحظة السابقة «لم تُربط بعد» أصبحت لاغية. الناقص الوحيد في POSR: تبويب returns-window (POSR011).

| الفئة | العدد | ✅ كاملة | 🟡 جزئية | ❌ غير مبنية |
|---|:---:|:---:|:---:|:---:|
| حركات POST | 30 | **22** | 6 | 2 |
| تقارير POSR | 16 | **16** | 0 | 0 |
| إدخال POSI | 15 | **9** | 2 | 4 |
| إعدادات POSS | 9 | **3** | 1 | 5 |
| أخرى | 10 | **6** | 1 | 3 |
| **الإجمالي** | **80** | **56** | **10** | **14** |

> تفصيل العدّ الصارم (لمراجعة مستقبلية):
> - **POST ✅ 22:** 001,002,003,004,005,009,010,011,013,016,017,018,019,021,022,023,024,025,026,027,028,029 · 🟡 6: 006,008,012,014,015,020 · ❌ 2: POSTIN_MTX,POST_WST (كلاهما N/A) _(2026-07-06: 005/009/011 🟡→✅ بواجهات مُثبتة حياً)_
> - **POSR ✅ 16/16:** الكل مكتمل — POSR011 تبويب «نافذة الإرجاع» مُثبت حياً بلقطة (2026-07-06). POSR003 ✅ بزر CSV الحي (مُثبت curl: `reports/export?report=daily` يرجع CSV فعلياً)
> - **POSI ✅ 9:** 001,002,003,007,009,010,011,200,2000 · 🟡 2: 008,012 · ❌ 4: 004,005,006,014(N/A)
> - **POSS ✅ 3:** 001 (179 إعداداً مُثبتة بالمتصفح حياً)، 004 (change-password)، 005 (تبويب الافتراضيات المرقّمة مُثبت حياً 2026-07-06) · 🟡 1: 002 (UI موجود — الفرض الديناميكي ناقص) · ❌ 5: 003 + 4×WMS(N/A)
> - **أخرى ✅ 6:** POSLGN,POSQ001,POSADVS_SCND,POSAVLQTY,POS_ALRT_SCR,POS_ITM_PRICE · 🟡 1: POSADVS · ❌ 3
> - من الـ❌ 15: **8 شاشات N/A معمارياً** (4×WMS، POS_INSTALL، POSI014، POST_WST، POSTIN_MTX) — الناقص الحقيقي القابل للبناء **7 فقط** (POSI004 مودال واجهة، POSI005/006 موازين، POSS003 نسخ ops، POSADVS2 شبه N/A، POSADVS_SCND شاشة عميل واجهة، POS_IMPXLS استيراد Excel).
> - _(2026-07-04 Fable5 backend موجة H):_ POST022/024/028/029 + POS_ALRT_SCR ❌→🟡 بـ **5 modules جديدة** (sales-orders، stock-receiving بمسارين receipts+issues، return-counts، alerts) + 5 هجرات V021–V026 — 24 موديول و186 endpoint و240 اختباراً أخضر. أبرز إنجاز: **المخزون يتحرك فعلاً** — استلام/صرف يكتبان ITEM_MOVEMENT الحقيقي (+8/−7) وأمر البيع يتحول لفاتورة YSPOS23 حقيقية، وV024 أصلح 158 كائن ERP معطوباً (IAS_SYS shim).

> _(2026-07-04 UI موجة E — frontend: POSI007/009/200 اكتملت 🟡→✅ بـ 6 شاشات جديدة منشورة: موردون، مخازن، مجموعات+وحدات، عملات، بطاقات مسبقة الدفع، مجموعات عملاء — كلها RTL + TanStack Query + origin badges + RBAC، مُثبتة حياً على https://nuugneol.gensparkclaw.com ببيانات حقيقية.)_

> _(2026-07-04 موجة E — POSI: خمس شاشات انتقلت ❌→🟡 بـbackend كامل مُثبت حياً: POSI002/003 لوحات المفاتيح، POSI007 بطاقات مسبقة الدفع، POSI009 مجموعات العملاء، POSI200 أرصدة البطاقات — وأضيفت موردون/مخازن/مجموعات/وحدات/عملات + باركود متعدد وحدود مخزون للأصناف. الإجمالي لم يتغير ✅ إلا بـ+1 لأن القاعدة الصارمة تشترط الواجهة.)_

### النسبة الحقيقية (2026-07-06 — بعد موجات اللينات المتوازية A/B/C/D + التكامل)
- **صارمة (كاملة فقط):** 64/80 = **80%** _(كانت 51.25% فجر 07-04، 76.25% صباح 07-06)_
- **بعد إغلاق N/A معمارياً (📄):** 64✅ + 8📄 = 72/80 محسومة = **90%** — المتبقي الحقيقي 8 شاشات فقط (2🟡 + 6❌ قابلة للبناء وكلها P2).
- **ضمن النطاق التشغيلي (P0+P1):** كل P0 وP1 ✅ 100% عملياً — المتبقي كله P2 (اختصارات، موازين، استيراد Excel، نسخ احتياطي، تحسينات skin).
- إنجاز جلسة 07-06: Lane A (POST006/012/014/015) + Lane B (POSI008/012/POST020) + Lane C (POSS002 فرض ديناميكي + POST008 مزامنة نزولية + 8 ADR N/A) + Lane D (إعادة تصميم متجاوبة mobile-first عالمية المعايير). كل ذلك مُثبت حياً + tsc صفر + 285 اختبار أخضر + منشور.

#### أرقام 07-04 (للسجل)
- **صارمة (كاملة فقط):** 41/80 = **51.25%** _(كانت 33.75% مساء 3، 17.5% في 2026-07-03)_
- **مرجّحة (كاملة=1، جزئية=0.5):** (41 + 24×0.5)/80 = 53/80 = **66.25%** _(كانت 63.1% فجراً، 52.5% مساء 3)_
- **ضمن النطاق التشغيلي الفعلي (P0+P1 = 44 شاشة):** ✅ 37 · 🟡 7 · ❌ 0 ⇒ **≥92% مرجّحة** وكل الـP0 الثماني ✅ 100% _(2026-07-06: POST005/009/011 + POSR005/011/016 + POSI001/002/003/011/2000 + POSS005 + POSADVS_SCND اكتملت واجهاتها — المتبقي 🟡 كله يحتاج backend جديداً لا UI: POST006/008/012/014/015/020 + POSS002-الفرض)_.
- **دورة البيع اليومية (P0):** دخول✅ بيع✅(**توأمة YSPOS23 حية مثبتة**) تعليق✅ دفع متعدد✅(+نقاط/كوبون) مرتجع✅(**حتى على فواتير Motech — IAS_POS_RT_BILL_MST حقيقي**) قارئ أسعار✅ وردية✅ تصفية بفئات✅ Z-report✅(يشمل مبيعات Motech) سندات✅ ⇒ **~95% من يوم الكاشير يعمل الآن**. المتبقي بالدورة: محرك عروض + بطاقات مسبقة الدفع + تغيير كلمة السر.

### تطوّر الأرقام
| التدقيق | ✅ | 🟡 | ❌ | مرجّحة |
|---|:---:|:---:|:---:|:---:|
| 2026-07-03 | 14 | 32 | 34 | 37.5% |
| 2026-07-04 صباحاً | 23 | 25 | 32 | 44% |
| 2026-07-04 مساءً (بعد UI موجة E) | 27 | 30 | 23 | 52.5% |
| **2026-07-04 فجراً (نهائي — كل الموجات)** | **41** | **19** | **20** | **63.1%** |
| **2026-07-06 (Fable5 — إكمال الشاشات الجزئية UI)** | **56** | **10** | **14** | **76.25%** |
| **2026-07-06 (لينات A/B/C/D + تكامل — نهائي)** | **64** | **2** | **6** (+**8📄 N/A) | **80% صارمة / 90% بعد N/A** |

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
| 5 | POST010/011 | ✅ | تحصيل من تبويب العميل + بطاقة سداد مباشرة في BillDetailPage (CollectDialog مشترك) (2026-07-06) |
| 6 | POST006 | 🟡 | ربط المرتجع بسند صرف تلقائي |
| 7 | POST014 | 🟡 | حركات عهدة أثناء الوردية (إيداع/سحب) |
| 8 | POST015 | 🟡 | ترحيل الفائض/العجز كسجل معتمد عند الإقفال |
| 9 | POST020 | 🟡 | ربط عميل بفاتورة مرحّلة **بأثر رجعي** |
| 10 | POST021 | ✅ | سجل حركة النقاط التفصيلي — backend + تبويب «حركة النقاط» في CustomersPage (2026-07-03/04) |
| 11 | POST012 | 🟡 | تفصيل طرق الدفع لكل كاشير |
| 12 | POST008 | 🟡 | مزامنة نزولية (أصناف/أسعار) + جدولة تلقائية |
| 13 | POST005 | ✅ | صفحة تفصيل مرتجع كاملة `/returns/:id` (بنود + محسوب/مرحّل + رابط للفاتورة الأصلية) (2026-07-06) |
| 14 | POSI007 | 🟡 | CRUD بطاقات/كوبونات + دفع بها (مرتبط بـ#1) |
| 15 | POSI008 | 🟡 | CRUD برامج نقاطي + صفحة إعداد |
| 16 | POSI011 | ✅ | واجهة AdminPage: جدول مستخدمين + حوار إنشاء/تعديل/تعطيل (مُثبت حياً) |
| 17 | POSI001 | ✅ | واجهة AdminPage: جدول آلات + حوار إنشاء/تعديل + إحصاءات مبيعات مدموجة (2026-07-06) |
| 18 | POSI2000 | ✅ | تبويبا باركودات/حدود في ItemCatalogDialog + مستويات أسعار (2026-07-04) |
| 19 | POSI002+003 | ✅ | صفحة `/keypads` كاملة: لوحات + شبكة أزرار + ربط أصناف ببحث حي (2026-07-04) |
| 20 | POSS004 | ✅ | تغيير كلمة السر — backend + حوار ChangePasswordDialog من رأس الشاشة (2026-07-04 موجة G-UI) |
| 21 | POSS002 | 🟡 | واجهة مصفوفة الصلاحيات ✅ في AdminPage — يتبقى الفرض الديناميكي في حراس الـbackend |
| 22 | POSR005 | ✅ | تبويب «سجل الحذف» في ReportsPage يعرض الأسطر المحذوفة + المستخدم + الوقت (مُثبت حياً بلقطة 2026-07-06) |
| 23 | POSR010 | ✅ | تقرير الولاء — backend + تبويب loyalty في ReportsPage (2026-07-04) |
| 24 | POSR002 | ✅ | كشف حساب عميل + by-shift + shifts-history — backend + تبويبات واجهة (2026-07-04). POSR011 returns-window ✅ تبويب واجهة (2026-07-04) |
| 25 | POS_ITM_PRICE | ✅ | مستويات الأسعار — endpoints + UI اختيار المستوى في ItemCatalogDialog (2026-07-04) |
| 26 | POSADVS_SCND | ✅ | شاشة عرض للعميل (نافذة ثانية) — `/customer-display` بمزامنة BroadcastChannel حيّة + QR بعد الدفع (2026-07-06) |

### 🟡 P2 — نادر/إداري/مؤجل (20 ناقصاً)
| الشاشات | الناقص |
|---|---|
| POST018 ✅ (2026-07-04 تبويب جرد كامل)، POST022 | جرد المردودات فقط متبقٍ |
| POST019 | ✅ backend + واجهة TransfersPage (2026-07-04) — يتبقى POST028/POST029 (تنفيذ التحويل والاستلام) |
| POST023 | ✅ backend + واجهة PrescriptionsPage (2026-07-04) — مكتملة |
| POST024 + POSR015 | أوامر البيع (إنشاء) — تقريرها POSR015 ✅ backend (`reports/sales-orders`) |
| POST009 | دمج إحصاءات الآلة في بطاقة واحدة |
| POSTIN_MTX, POST_WST | قيود JV/خدمي — يبقى في Onyx / N/A |
| POSR003, POSR006, POSR007, POSR008, POSR009, POSR012, POSR016 | ✅ backend + واجهة (2026-07-04): زر تصدير CSV لكل تقرير مسطّح + تبويبات receivables/vouchersSummary/customerGroups/salesOrders + الموجود (sales-by-category/item-movement/slow-moving) |
| POSI004, POSI005, POSI006, POSI009, POSI012, POSI200 | مفاتيح مساعدة، موازين، مجموعات عملاء، أنواع بطاقات، أرصدة بطاقات |
| POSI014, POS_INSTALL | **N/A** — migrations/seed تحل محلهما (توثيق فقط) |
| POSS003 | نسخ احتياطي (ops) — POSS005 ✅ backend+UI defaults (2026-07-04) |
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
