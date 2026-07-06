# 📈 سجل تقدّم Motech POS
> يُحدّث بعد كل خطوة. الأحدث أعلى. (ضد النسيان — يُقرأ كل جلسة)

## 2026-07-06 (Lane B — الولاء والبطاقات والربط الرجعي: 3 شاشات 🟡→✅) — subagent lane-b-loyalty

> **النطاق:** backend modules {loyalty, cards, bills} + frontend features {settings, bills} حصراً — لم تُلمس وحدات/features الوكلاء الآخرين. migration V027 واحدة. proof-not-assumption: DDL حقيقي تُحقّق قبل كل جدول، وكل endpoint مُثبت curl حي + DB SELECT + UI حي عبر المتصفح على الدومين العام.

**1. POSI008 ترميز برامج النقاط 🟡→✅** — module loyalty:
- **جدول جديد MOTECH_POS.LOYALTY_PROGRAMS (V027):** برنامج ولاء مُسمّى = قاعدة كسب مُوسّعة (calcType 1/2، AMT_4POINT، **MIN_BILL_AMT** حد أدنى للفاتورة، **MAX_POINTS_PER_BILL** سقف للنقاط/فاتورة، **نافذة صلاحية** START/END_DATE) + **برنامج نشط واحد لكل نوع نقاط** عبر فهرس فريد دالّي (`CASE WHEN ACTIVE=1 THEN POINT_TYP_NO`).
- `activeRule()` صار يفضّل **البرنامج النشط** (المتحقّق من نافذة الصلاحية اليوم) ثم يعود لـLOYALTY_CONFIG القديم (لا كسر). `earnPoints()` يطبّق الحد الأدنى (الفواتير الأقل تكسب صفراً) والسقف (النقاط لا تتجاوز الحد).
- `GET/POST/PUT/DELETE /loyalty/programs` (القراءة لأي مصادَق، الكتابة supervisor/admin). 409 لبرنامج نشط ثانٍ لنفس النوع، 422 تحقّق، 404 مجهول.
- **proof حي (supervisor على :3000 + الدومين):** إنشاء «برنامج الذهبي» (1نقطة/50ريال، min200، cap100، 2026 كامل) → تعديل amt4Point→25 → قائمة 1 → برنامج نشط ثانٍ **409** → cashier create **403** → calcType 3 **400** → DB SELECT يؤكد الصف. +11 اختبار وحدة.

**2. POSI012 بطاقات POS 🟡→✅** — module cards:
- **اكتشاف proof:** `IAS_POS_CARD` **غير موجود** في القاعدة (ALL_OBJECTS = 0 صف). المصدر الحقيقي للبطاقات هو `IAS202623.CREDIT_CARD_TYPES` (8 صفوف، **مقدّس قراءة فقط**). فبُني **CARD_TYPES_OVERLAY (V027)** + دمج **FULL OUTER JOIN** (overlay يفوز، origin ERP\|LOCAL\|EDIT) — نفس نمط V016.
- `GET/POST/PUT /pos-cards`: الإنشاء بلا رقم يخصّص LOCAL من `SEQ_LOCAL_CARD_NO` (900+)؛ الإنشاء برقم ERP = EDIT override؛ التعديل لا يمس ERP إطلاقاً. supervisor/admin. 409 تكرار overlay، 404 مجهول، 400 تحقّق.
- **proof حي:** list = 8 ERP (origin ERP) → إنشاء LOCAL 901 (comm 2.5) → تعديل بطاقة ERP رقم 1 = EDIT (comm 1.75، **ERP row 1 غير مُتغيّر** بـSELECT: جوالي/comm=null) → cashier 403 → dup 409 → 404 → 400. +6 اختبار وحدة.

**3. POST020 ربط الفاتورة بعميل نقاطي رجعياً 🟡→✅** — module bills:
- `POST /bills/{id}/attach-customer` (id = MOTECH uuid **أو** BILL_NO): يربط عميل ولاء بفاتورة مرحّلة بلا عميل، يُحدّث MOTECH_POS.BILLS **ويُمرّي C_CODE/C_NAME على الأونكس الحقيقي IAS_POS_BILL_MST في معاملة واحدة**، ثم **يحتسب النقاط رجعياً idempotent** (حارس UNIQUE(BILL_ID,TRNS_TYPE) — لا كسب مزدوج).
- حرّاس: 404 فاتورة/عميل، **409 ربط مزدوج** (عميل مختلف)، **no-op replay** لنفس العميل (alreadyAttached=true, 0 نقاط).
- **proof حي:** فاتورة net 38800 بلا عميل → attach عميل 1 → **pointsEarned=100** (البرنامج 1/25 = 1552 raw مقصوص للسقف 100)، الرصيد 214→314 → replay = alreadyAttached 0 نقاط → عميل مختلف **409** → فاتورة مجهولة **404** → عميل مجهول **404**. **مرآة الأونكس مُثبتة:** فاتورة API جديدة 260700100000425 → attach عميل 2 → **YSPOS23.IAS_POS_BILL_MST.C_CODE=2, C_NAME=المهندس انس الدبعي**. +5 اختبار وحدة.

**الواجهة (frontend):**
- **SettingsPage:** تبويب جديد **«برامج النقاط»** (جدول + حوار CRUD كامل: طريقة احتساب/ريال-لكل-نقطة/حد أدنى/سقف/صلاحية/نشط) + تبويب **«بطاقات الخصم»** صار **CRUD كامل لبطاقات POS** (جدول مدموج بشارات origin ERP/LOCAL/EDIT + حوار إنشاء/تعديل) — بدّل CardTypesTable القراءة فقط.
- **BillDetailPage:** بطاقة **«ربط عميل»** تظهر لفاتورة مرحّلة بلا عميل → CustomerPicker → POST020 attach + عرض النقاط المكتسبة. RTL + عرض أخطاء RFC9457.
- i18n عربي (attach/loyaltyPrograms/posCards).

**الحالة:** `npx tsc -b` على src **صفر أخطاء** · **306 اختبار وحدة أخضر** (+22 من هذه الموجة) · golden 10/10 مع TEST_* env · pm2 online /health أخضر · frontend مبني ومنشور على https://nuugneol.gensparkclaw.com (chunks settings/bills 200) · **UI مُثبت حياً بالمتصفح** (لقطات: برنامج الذهبي في تبويب برامج النقاط، جدول بطاقات POS بـ8 ERP + 901 LOCAL + بطاقة 1 EDIT). 4 commits بهوية MoainAlabbasi. **POSI: 🟡2→✅ (11✅) · POST020 🟡→✅.**
> ⚠️ ملاحظة: `tsc -b` الكامل (frontend) محجوب بـ3 أخطاء في ملفات لينات أخرى (AppLayout: X unused · PosPage: useCart unused · shifts.api: ListMeta.totals) — ليست من هذه الموجة؛ النشر تمّ عبر `vite build` (esbuild، لا typecheck) وكل ملفات Lane B نظيفة صفر أخطاء.

## 2026-07-06 (Lane A — المالية: 4 شاشات 🟡→✅ backend+frontend) — subagent lane-a-financial

> **النطاق:** vouchers/shifts/returns/reports فقط (backend) + features vouchers/shifts/returns/reports (frontend). migration **V028** (بعد أن حجزت لِينات موازية V027). كل شاشة مُثبتة حياً عبر curl على :3000 + SELECT مباشر من MOTECH_POS + تحقّق نهائي عبر الدومين العام. 306 اختبار وحدة أخضر (+16 جديدة). `tsc -b` صفر أخطاء في ملفات Lane A (backend وfrontend).

**1. POST006 الدفع النقدي للمرتجعات ✅**
- عمود `VOUCHERS.REFUND_RETURN_ID` + فهرس فريد `UX_VOUCHERS_REFUND_RET` (سند واحد لكل مرتجع — idempotency على مستوى DB). المرتجع = صرف نقدي (EXPENSE، CATEGORY='REFUND') فيدخل تلقائياً في تصفية الوردية كمصروف نقدي.
- `POST /vouchers/refunds` (idempotent بلا مفتاح header — returnId هو المفتاح الطبيعي) + `GET /vouchers/for-return/:id` (probe). يرفض مرتجعات YSPOS23 القديمة (404) والمرتجع بلا مبلغ استرداد موجب (422).
- **UI:** بطاقة «سند صرف المرتجع» في ReturnDetailPage (probe → زر إصدار أو عرض رقم السند؛ مخفية لأرقام RT القديمة).
- **proof حي:** مرتجع 019f34d8… (7800) → EXP260700100000007 (REFUND، 7800) → replay=true نفس السند → probe يرجعه → SELECT في VOUCHERS يؤكد REFUND_RETURN_ID.

**2. POST014 عهدة الكاشيرات ✅** — جدول `CASHIER_CUSTODY` (V028)
- `POST /shifts/{id}/custody` (DEPOSIT/WITHDRAW، Idempotency-Key، وردية OPEN شرط، حارس السحب لا يتجاوز نقد الدرج → 422) + `GET /shifts/{id}/custody` (حركات + إجماليات). صافي العهدة (إيداعات−سحوبات) يُطوى في cashReceipts بنفس معادلة close/reconciliation.
- **UI:** لوحة «عهدة الكاشير» في ReconciliationPage (تبويب إيداع/سحب + مبلغ/سبب + إجماليات حيّة + سجل حركات) + سطرا العهدة في بطاقة النقد.
- **proof حي:** إيداع 2000 + سحب 500 → net 1500 → expectedCash 8800→10300 · replay=true · سحب 999999 → 422 custody-exceeds-drawer · وردية مغلقة → 409 · بلا مفتاح → 422.

**3. POST015 فائض/عجز الكاشيرات ✅** — جدول `SHIFT_VARIANCE` (V028)
- عند settle: يُرحَّل فرق التصفية (over/short) كسجل معتمد ثابت (سجل واحد لكل وردية عبر UX_VARIANCE_SHIFT، idempotent) + `GET /shifts/{id}/variance`.
- **UI:** شارة «قيد الفائض/العجز» في ReconciliationPage بعد الاعتماد (ملوّنة OVER/SHORT/BALANCED).
- **proof حي:** متوقّع 10300 / معدود 10250 → settle → variance #1 SHORT −50 postedBy=2 → SELECT في SHIFT_VARIANCE يؤكده.

**4. POST012 ملخص مبيعات الكاشيرات ✅**
- `GET /reports/cashier-payment-summary?cashier=` — تفصيل طرق الدفع **لكل كاشير** (CASH/CARD/CREDIT/…) + عدد الفواتير + الصافي + مرتجعات/استرداد لكل كاشير (فلتر اختياري بالكاشير).
- **UI:** تبويب «ملخص مبيعات الكاشيرات» في ReportsPage (KPIs + جدول بأعمدة طرق الدفع المفصّلة والاسترداد).
- **proof حي:** كاشير 91 → CASH 15600 (فاتورة واحدة) + refundTotal 7800 · كل الكاشيرات → 22 صفاً.

- **حالة عامة:** migration V028 مُطبّقة (+GRANTs لـMOTECH_RW) · build backend ✅ · pm2 restart ✅ /health online · **frontend build+deploy عبر worktree نظيف** (لأن لِينات موازية تركت AppLayout/PosPage/SettingsPage غير مكتملة في شجرة العمل — بُني ونُشر من commit نظيف) → https://nuugneol.gensparkclaw.com 200 والحزم الجديدة تحوي endpoints الأربعة · التحقّق النهائي للأربعة عبر الدومين العام ✅.
- **ملاحظة تصادم:** ثلاث لِينات أنشأت V027 بنفس الوقت — رُقِّمت هجرتي إلى **V028**. types.ts + common.json الخاصتان بي اكتُسِحتا في commit لِينة المزامنة (82008bf) لكن محتواي موجود في HEAD.
- **commits (هوية MoainAlabbasi):** feat(financial) backend · chore(db) renumber V028 · feat(ui) frontend.

## 2026-07-06 (Lane C — الصلاحيات الديناميكية + المزامنة النزولية + توثيق N/A) — subagent lane-c-rbac-sync-adr

> **النطاق:** backend modules {auth, settings, admin(read-only edit), sync, catalog} + config + app.module + frontend features {auth, sync} + docs/ADR + SCREENS_GAP. لم تُلمس وحدات الوكلاء الآخرين (loyalty/vouchers/reports/shifts/bills/…). **proof-not-assumption: كل بند مُثبت حياً على :3000 ببيانات حقيقية.**

**1. POSS002 — الفرض الديناميكي للصلاحيات (RBAC) ✅**
- كانت المصفوفة `ROLE_PERMISSIONS` + `GET/PUT /admin/permissions` موجودة لكن **بلا فرض ديناميكي** (الحراس كانت RBAC ثابتة). بُني الآن:
  - `permission.ts` (domain): قائمة الأكواد الرسمية (12) + `fallbackAllows` (افتراضات خشنة آمنة تطابق seed V013 — admin=كل شيء، غير‑admin يُمنع SETTINGS/PRICE_OVERRIDE/VOID).
  - `PermissionsService`: يقرأ ROLE_PERMISSIONS (cache 15ث، `invalidate()` عند تعديل المصفوفة) ويجيب `can(role,perm)` — **fallback آمن** عند غياب صف أو تعذّر DB (المصفوفة تُقيّد فقط، لا تمنح فوق الأساس).
  - `@RequirePermission(code)` + `PermissionsGuard` (يفرض وقت الطلب) — طُبّق على كتابات settings (SETTINGS) بديلاً عن `@Roles('admin')` الثابت.
  - `GET /auth/permissions/me` (خريطة صلاحيات المستخدم لبوابة الواجهة) + `AdminWriteService.setPermissions` يستدعي `invalidate()`.
- **proof حي:** cashier PUT /settings → **403** · admin → **200** · admin يمنح cashier SETTINGS عبر PUT /admin/permissions → cashier PUT /settings **فوراً 200** (ديناميكي، بلا restart) · admin يسحب → cashier **403 ثانيةً** · بلا توكن **401** · GET /auth/permissions/me (cashier) يُظهر SETTINGS:false PRICE_OVERRIDE:false.

**2. POST008 — المزامنة النزولية (catalog pull) ✅**
- **هجرة V027** (مُطبّقة حياً + GRANT لـMOTECH_RW): `CATALOG_CACHE` (لقطة صنف: اسم/باركود/وحدة/سعر/مجموعة/كمية/STALE) + `CATALOG_SYNC_RUNS` (تدقيق كل سحبة).
- `OracleCatalogCacheRepository` يقرأ ERP الحي (IAS_ITM_MST + IAS_ITEM_PRICE LEV_NO=1 + MV_ITEM_AVL_QTY — قراءة فقط) ويعمل MERGE للكاش؛ الصفوف الغائبة عن السحبة تُعلَّم STALE (لا تُحذف). `CatalogPullService` بحارس تشغيل واحد (لا سحب متزامن) + تسجيل نجاح/فشل.
- **الجدولة:** `CatalogSyncScheduler` عبر `@nestjs/schedule` cron (CATALOG_SYNC_CRON افتراضي */30د، CATALOG_SYNC_ENABLED) — داخل العملية، **بلا Redis/BullMQ** (غير متوفّر على الـVM). endpoints: `GET /sync/catalog/status·runs·items` + `POST /sync/catalog/pull` (supervisor/admin).
- **إصلاح ORA-08177:** السحب الكتلي (2391 صنف) كان يفشل تحت SERIALIZABLE → أُضيف `OracleWriteService.withWork` (READ COMMITTED للعمل الكتلي أحادي الكاتب).
- **proof حي:** سحب يدوي → **2391 مصدر → 2391 upserted في ~966ms** · الكاش يحمل أسماء عربية حقيقية (`1020060001 → بيض` سعر 50) · سحبة ثانية idempotent (2391، 0 stale) · إدراج صنف وهمي ثم سحب → **staled:1** والصف STALE=1 · cashier POST pull **403** · supervisor **200** · بلا توكن **401** · cashier يقرأ status **200** · السجل يسجّل 4 سحبات · **السكيدولر مُسجّل** بالإقلاع (لوق: `Catalog downward sync scheduled: "0 */30 * * * *"`).

**3. توثيق ADR لشاشات N/A ✅**
- `docs/ADR/` + README فهرس + **6 ADRs (MADR)** مبنية على فحص فعلي للشاشات المفكوكة: ADR-006 (WMS: POSS006/007/028/029 — `WMS_REG_DEVICE`) · ADR-007 (POS_INSTALL → migrations) · ADR-008 (POSI014 → migrations) · ADR-009 (POSTIN_MTX → المحاسبة تبقى في Onyx، `MTX_JV_DTLS`) · ADR-010 (POST_WST+POSADVS2 → لا منطق/تغطيها PosPage) · ADR-011 (POS_IMPXLS → **مؤجّل قابل للبناء، ليس N/A**).
- **SCREENS_GAP_FINAL:** 8 شاشات → 📄 N/A مع رابط ADR؛ POS_IMPXLS → ⏳ مؤجّل؛ POSS002 → ✅ و POST008 → ✅.

**الحصيلة:** `npm run build` (backend) ✅ صفر أخطاء · `pm2 restart` ✅ online (health يفحص القاعدتين) · **306 اختبار وحدة أخضر** (+15 جديدة: permissions 11 + catalog-pull 4، +تحديث admin-write) · frontend يبني في نطاقي بلا أخطاء (النشر الكامل محجوب مؤقّتاً بأخطاء lint في ملفات وكلاء آخرين — AppLayout/PosPage/ReportsPage/shifts، ليست ملفاتي). 6 commits بهوية MoainAlabbasi. **الاختباران golden integration الفاشلان بيئيان** (يحتاجان TEST_*_PASSWORD للدخول الحي — ليسا من هذا العمل).

## 2026-07-04 (الموجة H backend — إغلاق كل شاشات POST القابلة للبناء) — subagent backend-remaining-12 (Fable 5)

> **النطاق:** backend فقط — 5 modules جديدة + 6 هجرات (V021–V026). لم تُلمس وحدات الوكلاء الآخرين (inventory/keypads/items/reports/settings). **24 موديول · 186 endpoint · 240 اختبار أخضر (كان 214) · lint 0**.

**1. أوامر البيع / طلبات العملاء (POST024) — module sales-orders (V021):**
- `POST/GET /sales-orders` + `/:id` + **`/:id/convert`** + `/:id/cancel`. الطلب OPEN→CONVERTED|CANCELLED، أسماء/أسعار عربية تُلتقط للعرض والتحويل **ينزل فاتورة حقيقية في YSPOS23** عبر PostBillUseCase نفسه (تسعير سيرفر، وردية مفتوحة، نقاط) — مفتاح idempotency واحد للتحويل والفاتورة (لا فاتورة مكررة حتى مع crash).
- **proof:** أمر بسطرين (أرز بسمتي 850 + خميرة 300×2) → convert → **BILL 260700300000407 = 1450** في IAS_POS_BILL_MST/DTL بـSELECT مباشر → replay=true نفس الفاتورة → 409 لمفتاح جديد/إلغاء محوّل → 404 صنف مجهول.

**2. الاستلام المخزني (POST029) — module stock-receiving (V022+V023+V024):**
- `POST/GET /stock-receipts` + `/:id/post` (supervisor/admin) + `/:id/cancel`. الاعتماد يكتب **ITEM_MOVEMENT حقيقي (DOC_TYPE=8، IN_OUT=+1)** في نفس معاملة قلب DRAFT→POSTED + تحديث MV — **المخزون يزيد فعلاً**. ترقيم ERP أصلي (IAS_SERIAL_SEQ/IAS_DOC_SEQ/GNR_DOC_PST_SQ + MAX(DOC_NO)+1). snapshot اسم/وحدة مخزون/عبوة/آخر كلفة من IAS_ITM_DTL/ITEM_MOVEMENT الحية.
- **اكتشاف وإصلاح حرج (V024):** الـdump يفتقد مخطط **IAS_SYS** (LANG_DEF/IAS_LABELS/IAS_MSGS) → 556 كائناً معطوباً في IAS202623 ومنها IAS_ITM_PKG التي يستدعيها trigger المخزون → أي INSERT في ITEM_MOVEMENT كان يفشل ORA-20302. بُني shim schema + synonyms + إعادة compile (UTL_RECOMP من sysdba داخل الحاوية) → IAS_ITM_PKG **VALID** (المعطوب 556→398، المتبقي db-links/APEX لا يمس POS).
- **proof:** استلام 2×1050010023 في مخزن 2 → post → صف ITEM_MOVEMENT (DOC_NO=3، SERIAL=13929) بـSELECT مباشر → **التوفر 33→35** → replay لا يكرر → 409/404/403(كاشير لا يعتمد)/401.

**3. التحويل المخزني الصادر (POST028) — stock-issues في نفس الموديول (V025):**
- `POST/GET /stock-issues` + `/:id/post` + `/:id/cancel` — مرآة الاستلام (DOC_TYPE=7، IN_OUT=−1) + **حارس توفر** (CHECK_AVL_QTY_PRC): لا صرف فوق المتاح → 422 insufficient-stock. يكتمل به ثلاثي التحويل: POST019 طلب → POST028 صرف → POST029 استلام.
- **proof:** صرف 3 من مخزن 1 → ITEM_MOVEMENT DOC_TYPE=7 SERIAL=13930 → التوفر 35→32 → طلب 100000 → **422**.

**4. جرد أصناف المردود (POST022) — module return-counts (V026):**
- جلسة لآلة+يوم، النظامي يُلتقط حياً من IAS_POS_RT_BILL_MST/DTL (يشمل مرتجعات Motech لأنها في نفس الجداول الحقيقية)، DIFF=معدود−نظامي، اعتماد مجمّد idempotent.
- **proof:** جلسة آلة 1 يوم 2026-07-03: جبنة سالم نظامي=5 معدود=4 → **diff=−1** · صنفان آخران diff=0 → post → سطر بعد الاعتماد 409.
- **إصلاح مرافق:** باغ timezone — `toISOString()` كان يزحزح DATE منتصف-الليل يوماً للخلف (GMT+2) → TO_CHAR في SQL (أصلح أيضاً expireDate في sales-orders).

**5. تنبيهات الدخول (POS_ALRT_SCR) — module alerts (V026):**
- `POST/PUT/GET /alerts` (إدارة) + `GET /alerts/pending` (غير المُقرّة للمستخدم الحالي — مصدر popup الدخول) + `POST /:id/ack` (مرة لكل مستخدم) + نافذة عرض بتواريخ.
- **proof:** أدمن ينشئ → كاشير pending=1 → ack → 0 (والأدمن ما زال 1 — لكل مستخدم) → كاشير ينشئ 403 → تعطيل يخفي للجميع.

**الحصيلة:** POST القابلة للبناء كلها مبنية backend (❌ في POST = POSTIN_MTX/POST_WST فقط وكلاهما N/A). المرجّحة 63.1%→66.25%. 6 commits بهوية MoainAlabbasi. المتبقي للـfrontend: شاشات أوامر البيع/الاستلام/الصرف/جرد المرتجع + popup التنبيهات.

## 2026-07-04 (POSS001 → ✅ كامل UI — صفحة إعدادات أدمن لكل الـ179) — subagent settings-ui-179

> **النطاق:** frontend فقط — `features/settings/` حصراً. أُعيدت كتابة SettingsPage بالكامل فوق `GET /settings/all` + `PUT /settings/{key}` (backend كان جاهزاً من 2026-07-01).

**المحتوى:**
- **10 تبويبات عربية** (الترقيم 15 · الطباعة 29 · الضريبة 1 · النقاط 13 · بطاقات الخصم 10 · الكوبونات 9 · العملاء 5 · العملات 3 · الرسائل 3 · سلوك النظام 91) = **179 إعداداً كلّها في الـUI** مع عدّاد لكل تبويب + شارة إجمالي في الرأس.
- **تحكّم حسب النوع:** VARCHAR2 → input نص · NUMBER بقيم 0/1 → toggle (135 مفتاح علم) · NUMBER أخرى → input رقمي · DATE → عرض فقط. الوصف العربي تحت المفتاح (70 إعداداً موصوفاً) + placeholder = القيمة الحية.
- **بحث فوري عبر كل المجموعات** (بالاسم أو الوصف العربي) مع عدّاد نتائج وشارة المجموعة على كل نتيجة.
- **حفظ فوري لكل مفتاح** (`PUT /settings/{key}` عند blur/Enter/toggle) + toast نجاح/خطأ (مع rollback للقيمة عند الفشل) · شارة «مُعدّل» + زر «إرجاع للافتراضي» (value:null) + إظهار القيمة الحية لما يخفيها override.
- **RBAC:** المسار admin-only (كما كان) + وضع قراءة-فقط دفاعي مع رسالة لغير الأدمن · RTL كامل + تجاوب (عمود واحد mobile / عمودان lg) · جدول بطاقات الدفع (GET /cards) بقي تحت تبويب البطاقات.

**Proof (حي على الدومين العام عبر CDP بدخول admin حقيقي):**
- الرأس «الإعدادات — 179 إعداد» · عدّ البطاقات المرسومة في كل تبويب = **179/179** (15+29+1+13+10+9+5+3+3+91).
- بحث «طباعة» → 4 نتائج عبر المجموعات ✅.
- حفظ من الـUI: MAX_LMT_QTY_4ITM 9999→8888 → toast «تم حفظ…» + شارة مُعدّل + سطر القيمة الحية → إرجاع → toast «أُرجع…» + رجعت 9999 وزالت الشارة ✅ (الحالة نظيفة بعد الاختبار: override وحيد = SETTING_NAME السابق).
- API: PUT DAY_NOTIFY_HUNG_BILL=7 (admin) → overridden:true · value:null → رجع · نفس الـPUT بتوكن كاشير → **403** ✅.
- `npm run build` (tsc -b) صفر أخطاء · نُشر لـ/var/www/motech-pos · الدومين 200 · لقطة: `~/.openclaw/workspace/pos-audit-shots/settings-179-numbering.png`.
- SCREENS_GAP: **POSS001 → ✅ مكتمل** (كان 🟡 «مجموعة جزئية»).

## 2026-07-04 (واجهة الموجة E — شاشات POSI master data في الـUI) — subagent frontend-waveE-wire

> **النطاق:** frontend فقط (لا backend، لا features/settings — وكيل آخر). features جديدة: `master-data/`، `prepaid-cards/`، `customer-groups/` + توسيع `items/`. كل الأشكال مُثبتة بـcurl حي على :3000 قبل الكتابة، وكل شاشة مُثبتة بعد النشر عبر CDP على الدومين العام (دخول supervisor1 حقيقي + عدّ صفوف حي).

| الشاشة | المحتوى | proof حي (rows) |
|---|---|---|
| **الموردون** `/suppliers` | بحث debounce + جدول (هاتف/مسؤول تختفي على mobile) + حوار إنشاء/تعديل (10 حقول + فترة ائتمان) | 39 صفاً |
| **المخازن** `/warehouses` | جدول + شارة «البيع موقوف» + حوار (أمين/موقع/مستوى سعر/noSale) | 3 |
| **المجموعات + الوحدات** `/groups-units` | شاشة واحدة بتبويبين: مجموعات (ضريبة%/خصم/ترتيب/عدّاد أصناف) + وحدات (كود مطلوب عند الإنشاء) | 24 |
| **العملات** `/currencies` | سعرا الصرف (محاسبي rate + كاشير ratePos) + خانات عشرية + شارة العملة المحلية | 4 |
| **بطاقات مسبقة الدفع** `/prepaid-cards` (POSI007+200) | فلاتر (عميل/نوع/نشطة) + إصدار + شحن (supervisor/admin) + سحب (كل الأدوار — فعل الدفع) مع حارس رصيد في الـUI + تفعيل/تعطيل + حوار سجل حركات برصيد جارٍ (ISSUE/TOPUP/REDEEM ملوّنة) | 1 (GC-2026-0001، رصيد 45,000 حي) |
| **مجموعات العملاء** `/customer-groups` (POSI009) | master/detail متجاوب (عمودان على desktop، مكدّس على mobile): قائمة + إنشاء/تعديل (sendMsg) + لوحة أعضاء (إضافة بكود C_CODE + إزالة، أسماء محلولة) | 2 مجموعات |
| **باركود متعدد + حدود مخزون** (POSI2000) | ItemCatalogDialog صار بتبويبات: الأسعار/الوحدات (كما كان) + **الباركودات** (إضافة LOCAL إنلاين + تعطيل LOCAL، ERP مصون) + **حدود المخزون** (min/max/reorder عبر PUT /items) | إضافة TEST-UI من الـUI → LOCAL active → تعطيل → inactive + الباركود لم يعد يُحل في scan (مُثبت SELECT) |

**تفاصيل تقنية:** 6 مسارات lazy جديدة في router (كلها supervisor/admin عدا `/prepaid-cards` لكل الأدوار — الكاشير يحتاج السحب وقت الدفع) + 6 إدخالات NAV بأيقونات Truck/Warehouse/FolderTree/Coins/CreditCard/UsersRound · مكوّن مشترك `MdShared` (MdDialog/Field/CheckField/errorText) يوحّد نمط الحوارات · مفاتيح i18n جديدة md/suppliers/warehouses/groupsUnits/currencies/prepaid/custGroups + catalog.tab.* · chunks: master-data 30.7KB، prepaid-cards 14.8KB، customer-groups ≈ 12KB، items 21.7KB.

**Proof:** `npm run build` ✅ (tsc -b صفر أخطاء) · نُشر إلى /var/www/motech-pos · الدومين 200 + chunks الجديدة 200 · دخول حي عبر المتصفح (CDP) → كل الشاشات الست ترسم ببيانات حقيقية (الأرقام أعلاه) وبلا أخطاء · كتابة حقيقية من الـUI (باركود أُضيف ثم عُطّل) · SCREENS_GAP: POSI ✅4→7 (POSI007/009/200 اكتملت)، الإجمالي الصارم 27/80 = 33.75%، مرجّحة 52.5%.

## 2026-07-04 (واجهة الموجة G — ربط ميزات backend الجديدة بالـUI) — subagent frontend-waveG-wire

> **النطاق:** frontend فقط (لا backend، لا features/settings — وكيل آخر). كل الأشكال (types) مُثبتة بـcurl حي على :3000 قبل الكتابة. بناء نظيف (tsc -b + vite، صفر أخطاء) ومنشور على https://nuugneol.gensparkclaw.com (200).

| الشاشة | المحتوى |
|---|---|
| **POSS004 تغيير كلمة السر** | `ChangePasswordDialog` — زر 🔑 في رأس الشاشة بجانب اسم المستخدم (لكل الأدوار): قديمة + جديدة (≥8) + تأكيد + إظهار/إخفاء + أخطاء RFC9457 |
| **POST023 الوصفة الطبية** | feature جديد `prescriptions/`: صفحة `/prescriptions` (قائمة + فلتر فاتورة/مريض) + حوار إنشاء (تحميل أصناف الفاتورة من `bill/{billNo}/items` → تأشير جرعة/استخدام/مدة لكل صنف + طبيب/مريض/ملف) + حوار عرض للتفاصيل |
| **POST019 طلب التحويل** | feature جديد `transfers/`: صفحة `/transfers` (قائمة + فلتر مفتوح/ملغى) + حوار إنشاء (مخزن مصدر/وجهة من GET /warehouses + أسطر متعددة كود+كمية+ملاحظة) + عرض تفصيلي بـavlQty (أحمر لو أقل من المطلوب) + إلغاء OPEN بتأكيد |
| **8 تبويبات تقارير جديدة** | ReportsPage صارت 27 تبويباً: byShift (POSR004) · shiftsHistory (POSR014) · customerStatement (POSR002 — 4 أقسام: فواتير/مرتجعات/نقاط/تحصيلات + KPIs) · receivables (POSR008) · vouchersSummary (POSR009/016) · loyalty (POSR010 — byType+byCustomer) · salesOrders (POSR015) · customerGroups (POSR012) |
| **تصدير CSV (POSR003)** | زر «تصدير CSV» يظهر على كل تبويب مسطّح قابل للتصدير (17 تقريراً — مطابق لقائمة backend) — تنزيل عبر axios الموثّق (Bearer) + blob download |
| **تحصيل الآجل + سجل النقاط** | كانا مربوطين مسبقاً في CustomersPage (تبويبا «حركة النقاط» + «الفواتير الآجلة» مع CollectDialog) — تحقّق فقط، لا تغيير |

**تفاصيل تقنية:** مساران جديدان lazy في router (`/prescriptions`، `/transfers` — متاحة لكل الأدوار مثل returns) + إدخالان في NAV بأيقونات ClipboardList/ArrowLeftRight · ~40 واجهة type جديدة في types.ts (مطابقة حرفياً لأشكال الـports في backend) · كل النصوص عربية في common.json (مفاتيح changePw/rx/transfers/reports2.*) · chunks: prescriptions 14.4KB، transfers 14.5KB، reports 65KB.

**Proof:** `npm run build` ✅ (tsc -b صفر أخطاء) · نُشر إلى /var/www/motech-pos · `curl https://nuugneol.gensparkclaw.com/` → 200 وindex يشير للبناء الجديد · أشكال الاستجابات مُثبتة حياً (by-shift/shifts-history/receivables/vouchers-summary/loyalty/sales-orders/customer-groups/customer-statement/transfers/prescriptions + CSV export).

## 2026-07-04 (الموجة E — شاشات الإدخال POSI كاملة backend) — subagent waveE-posi-settings

> **النطاق:** كل شاشات POSI الناقصة — 6 commits، 3 migrations (V016/V019/V020)، 3 modules جديدة (suppliers/master-data/keypads) + توسيع catalog/cards/customers، 36 endpoint جديداً، 30 اختبار unit جديداً. النمط الموحّد: **overlay في MOTECH_POS — ERP مقدّس لا يُمس أبداً**، والقراءات تدمج ERP+overlay (origin: ERP|LOCAL|EDIT). كل endpoint مُثبت حياً بـcurl + SELECT.

| الشاشة | Endpoints | proof حي |
|---|---|---|
| **POSI001/002 موردون** | `GET/POST/PUT /suppliers` (دمج V_DETAILS 38 مورداً + SUPPLIERS_OVERLAY) | إنشاء «مؤسسة الأمل للتجارة» → 9000 LOCAL · EDIT مورد ERP 2 (هاتف+جهة اتصال) وV_DETAILS لم يتغير · dup 409 · cashier 403 |
| **POSI003 مخازن** | `GET/POST/PUT /warehouses` (WAREHOUSE_DETAILS + overlay) | «مخزن الفرع الجديد» → 900 LOCAL · EDIT مخزن 2 (أمين محمد الحكيمي) |
| **POSI004 مجموعات أصناف** | `GET/POST/PUT /item-groups` (GROUP_DETAILS + overlay + عدّاد أصناف حي) | «العطور والبخور» → 900 LOCAL · EDIT مجموعة 01 (ضريبة→0) مع بقاء itemCount=112 |
| **POSI005 وحدات** | `GET/POST/PUT /units` (MEASUREMENT + overlay) | «طبلية» LOCAL size 30→24 · dup «درزن» (ERP) → 409 |
| **POSI011 عملات** | `GET/POST/PUT /currencies` (EX_RATE + overlay، rate/ratePos) | EUR LOCAL (580/585) · USD ratePos 530→540 EDIT وEX_RATE لم يتغير |
| **POSI006/008/009-item باركود متعدد + حدود** | `GET/POST/DELETE /items/{code}/barcodes` + `GET /items/{code}/limits` + PUT limits (IAS_ITM_UNT_BARCODE 2,614 + ITEM_BARCODES_OVERLAY؛ حدود ITM_MIN/MAX/ROL_LMT_QTY + overlay) | باركود كرتون×12 جديد يُحل فوراً في scan · حذف باركود ERP → 422 · limits ERP reorder=5 → overlay min=10/reorder=20 EDIT |
| **POSI002/003 لوحات مفاتيح** | `GET/POST/PUT /keypads` + `POST/DELETE /keypads/{no}/keys` (KEYPADS/KEYPAD_KEYS V016 — جداول YSPOS23 فارغة) | «لوحة الخضروات والفواكه» → ربط صنف باسمه العربي + سعر 200 حي من IAS_ITEM_PRICE · صنف مجهول 404 |
| **POSI007 بطاقات مسبقة الدفع** | `GET/POST /prepaid-cards` + `topup/redeem/status/movements` (V019، REDEEM بـSELECT…FOR UPDATE — لا سحب فوق الرصيد) | GC-2026-0001 (50,000 لعميل 1) → topup 10k → cashier redeem 15k (ref=فاتورة) → 45,000 · redeem زائد → **422 insufficient-card-balance** · معطلة/منتهية → 409 · دفتر 3 حركات برصيد جارٍ في SELECT |
| **POSI200 أرصدة بطاقات العملاء** | `GET /prepaid-cards?customer=` + `/{no}/movements` | رصيد حي + ledger ISSUE/TOPUP/REDEEM |
| **POSI009 مجموعات عملاء** | `GET/POST/PUT /customer-groups` + `members` (V020، مجموعة واحدة لكل عميل) | «عملاء الجملة» + «عملاء التجزئة» · ضم محمد العباسي + أنس الدبعي (أسماء من CUSTOMER) · إعادة ضم تنقل · مجهول 404 |

**درس Oracle تقني (تكرر 3 مرات):** أي bind بقيمة JS null داخل `COALESCE(:x, NUMBER_col)` يفشل بـORA-00932 (null الافتراضي يُربط كـSTRING) — الحل دائماً `{ val, type: oracledb.NUMBER }`.

**الاختبارات:** 211 unit ✅ (كانت 147 قبل الموجات؛ +30 من هذه الموجة: suppliers 6، master-data 8، item-barcodes 6، keypads 5، prepaid-cards 6 (−مكرر)، customer-groups 5) + 43 golden ✅.
**ملاحظة واجهة:** كل الشاشات أعلاه 🟡 في SCREENS_GAP_FINAL (backend مكتمل مُثبت — UI لم تُبن بعد).

## 2026-07-04 (الموجة F — إكمال تقارير POSR كاملة + إصلاح باغ التصفية P1) — subagent waveF-reports-shiftbug

### 1) 🐛 إصلاح باغ P1: توحيد expected-cash بين close وreconciliation ✅
**الباغ:** `POST /shifts/:id/close` كان يحسب `expected = فتح + مبيعات نقد − cashExpenses(من الطلب)` بينما `GET /shifts/:id/reconciliation` يحسب `expected = فتح + مبيعات نقد + سندات قبض − سندات صرف` — وردية فيها سندات تقفل برقم متوقّع مختلف عما يقرّره تقريرها نفسه.
**الإصلاح:** `ShiftsService.close()` يجلب الآن مجاميع سندات الوردية (VOUCHER_CASH_TOTALS) ويمرّر `cashReceipts`/`cashExpenses` للـrepository — الصيغة موحّدة في المكانين: **expected = فتح + مبيعات نقد + مقبوضات − مصروفات** (override صريح لـcashExpenses ما زال يفوز، نفس أسبقية reconciliation).
**proof حي (curl :3000):** فتح وردية 160 (عهدة 1000) → بيع نقد 300 (فاتورة 260700300000375) → سند قبض 500 (RCP260700300000005) + سند صرف 120 (EXP260700300000006) → reconciliation (OPEN): expected=**1680** (1000+300+500−120) → close: expectedCash=**1680** ✓ تطابق تام → reconciliation (CLOSED): expected=**1680**، BALANCED → SELECT مباشر من MOTECH_POS.SHIFTS: EXPECTED_CASH=1680 ✓. قبل الإصلاح كان close سيعطي 1180.
**test:** `shift-close-reconciliation.spec.ts` (3 اختبارات): تطابق close/recon مع سندات · override صريح يفوز في المسارين · fallback صفري بلا vouchers provider.

### 2) 📊 10 endpoints تقارير جديدة — إكمال كل POSR الناقصة backend (16/16) ✅
كلها JWT + RFC9457 + bind variables + قراءة فقط، بنمط الـports/repos القائم:

| Endpoint | POSR | المحتوى | proof حي |
|---|---|---|---|
| `GET /reports/by-shift` | POSR004 | مبيعات وردية-بوردية (فواتير/إجماليات/نقد-شبكة-آجل/فرق نقدي لكل وردية) + فلتر cashier/shift | وردية 160: billCount=1، cash=300، diff=0 |
| `GET /reports/shifts-history` | POSR014 | قائمة ورديات تاريخية كاملة (21 وردية) بفروق الإقفال والتصفية + سندات كل وردية، فلتر status | SETTLED×2: وردية 129 (16600/16550/−50) |
| `GET /reports/customer-statement?customer=` | POSR002 | كشف عميل كامل: فواتيره/مردوداته/حركة نقاطه/تحصيلاته + إجماليات (مبيعات/ذمة متبقية) | عميل 1 «محمد العباسي»: 3 فواتير 23,510، نقاط +234/−20 |
| `GET /reports/receivables` | POSR008 | ذمم آجلة لكل عميل (آجل/محصّل/متبقٍ/آخر حركة) من PAYMENTS(CREDIT)+CREDIT_COLLECTIONS | C001: آجل 30، محصّل 30، متبقٍ 0 |
| `GET /reports/vouchers-summary` | POSR009+016 | سندات مجمّعة آلة×نوع×طريقة×عملة + إجماليات وصافي أثر نقدي، فلتر وردية/مدى | 4 قبض=1750، 2 صرف=240، صافي 1510؛ بفلتر وردية 160: 500/120/380 |
| `GET /reports/loyalty` | POSR010 | نقاط الفترة byType (كسب/استبدال/انتهاء/تسوية) + byCustomer + إجماليات، فلتر customer/وردية/مدى | earned=617، redeemed=120، net=497؛ عميل 1: 234/20/214 |
| `GET /reports/returns-window` | POSR011 | كل مرتجع مع ساعات التأخير عن فاتورته الأصلية (BILL_DATE+BILL_TIME من YSPOS23) وwithinWindow مقابل PRD_BACK_HOUR | مرتجع فوري delay=0، تاريخي 201.88h؛ PRD_BACK_HOUR=NULL → withinWindow=null (غير مفعّل بصدق) |
| `GET /reports/sales-orders` | POSR015 | أوامر البيع من YSPOS23.SALES_ORDER (قراءة فقط، فلتر processed/مدى) | الأمران الحقيقيان (2026-04-25، 520+10 YER، processed) |
| `GET /reports/customer-groups` | POSR012 | مبيعات بمجموعة العميل (JOIN لـIAS_CASH_CUSTMR_GRP — فارغة حالياً فدلو NULL يجمع الكل؛ يتفعّل مع POSI009) | 2,591 فاتورة = 1.29M في دلو واحد (صادق مع الواقع) |
| `GET /reports/export?report=` | POSR003 | تصدير CSV (RFC4180، UTF-8) لـ17 تقريراً مسطّحاً — البديل المقرّر لقوالب S_RPRT_USR_TMPLT | CSV حي بأسماء عربية («بيض»، «ارز الديوان…»)؛ report مجهول → 400 |

+ تحسين POSR006: `sales-by-category?machine=` (نوع الصنف × الآلة) — proof: آلة 3 = 900 مقابل 376,200 إجمالاً.
**حراس مُثبتة:** بلا توكن → 401 · customer-statement بلا customer → 400 · status مجهول → 400 · تاريخ مشوّه → 400.
**درس SQL:** حساب delay للمرتجعات يحتاج `TRUNC(BILL_DATE)` — BILL_DATE في YSPOS23 يحمل أحياناً مكوّن وقت يتكرر مع BILL_TIME فيضاعف الوقت (ظهر كـdelay سالب).

- **حالة عامة:** build ✅ · **200/200 unit تمر** (+15 جديدة: 3 shift-close-reconciliation + 6 pos-reports موجة F + الموجود) · golden 43/43 (مع TEST_* env) · pm2 online · OpenAPI مُعاد توليده · لم تُلمس وحدات الوكلاء الآخرين (catalog/customers/admin/suppliers).

## 2026-07-04 (الموجة G — POSS مكتملة + حركات POST متقدّمة) — subagent waveG-poss-post
### 4 إنجازات حيّة مُثبتة (كلها curl حي + DB proof + commit منفصل):

**1. تغيير كلمة السر (POSS004) ✅**
- `POST /api/v1/auth/change-password` — تحقّق الكلمة الحالية (bcrypt مقارنة ثابتة الزمن، لا تعداد مستخدمين)، رفض إعادة نفس الكلمة (422 `password-reuse`)، تخزين bcrypt cost 12، كتابة ذرّية (tmp+rename، 0600، writes مُسلسلة) لـ `auth-users.json`.
- **proof حي:** تغيير → دخول بالقديمة **401** + بالجديدة **200** → `pm2 restart` → الجديدة ما زالت تعمل (الديمومة مُثبتة) → أرجعنا الأصلية. حراس: قديمة خاطئة 401 · إعادة استخدام 422 · قصيرة (<8) 400 · بلا توكن 401. hash في الملف `$2b$12$` ✓

**2. الوصفة الطبية (POST023) ✅** — module `prescriptions` + migration **V017** (PRESCRIPTIONS + PRESCRIPTION_LINES، مُطبّق حياً + GRANT لـMOTECH_RW)
- `POST /prescriptions` — طبيب+مريض+تاريخ+ملاحظة عامة + أسطر (جرعة/طريقة استخدام/مدة لكل صنف) مربوطة بفاتورة بيع موجودة: الفاتورة تُتحقّق حياً من YSPOS23 (404 `prescription-bill-not-found`) وكل صنف يجب أن يكون على الفاتورة (422 `prescription-item-not-on-bill`)، الكمية + الاسم العربي snapshot من الفاتورة (لا من العميل). header+lines في معاملة واحدة.
- `GET /prescriptions` (فلاتر billNo/patient) + `GET /prescriptions/:id` + `GET /prescriptions/bill/:billNo/items` (تعبئة مسبقة لشاشة التعليمات).
- **proof حي (فاتورة 26201300078 حقيقية):** items بأسماء عربية → **201** (سطران مُعلّقان، qty snapshot 1و2) → GET يرجع الجرعات → فلاتر تعمل → حراس 404/422/400/401 RFC9457 → الصفوف في MOTECH_POS فقط ✓

**3. طلب التحويل (POST019) ✅** — module `transfers` + migration **V018** (MATERIAL_TRANSFERS + LINES + SEQ_TRANSFER_NO، مُطبّق حياً)
- `POST /transfers` — طلب بضاعة من مخزن مصدر إلى مخزن طالب (محاكاة IAS_OUT_REQUEST_MST/DTL): المخزنان يُتحقّقان حياً من WAREHOUSE_DETAILS (404)، مصدر≠وجهة (422 + CHECK في DB)، snapshot توفر المصدر لكل سطر من MV_ITEM_AVL_QTY + الاسم العربي. REQ_NO تسلسلي. الطلب لا يحجز/يمس المخزون.
- `GET /transfers` (فلاتر status/warehouse) + `GET /transfers/:id` + `POST /transfers/:id/cancel` (OPEN→CANCELLED محروس، تكراره 409).
- **proof حي:** 201 (مخزن 1→2 reqNo 1) + (2→1 reqNo 2 بـavl snapshots 29/−321 من الـMV الحي) → cancel 200 (cancelledBy=cashier1) → تكرار 409 `transfer-invalid-state` → حراس 422/404/400/401 → الصفوف في MOTECH_POS فقط ✓
- **إصلاحان أثناء العمل:** ORA-01745 (`:by` اسم bind محجوز → `:cancelledBy`) · مفتاح meta باسم `status` في DomainError كان يطمس الـHTTP status الرقمي في جسم RFC9457 عبر spread في `problem()` → أُعيد تسميته `currentStatus` (⚠️ درس لكل الوحدات: لا تضع مفتاح `status` في meta لأخطاء الـdomain).

**4. الإعدادات الافتراضية (POSS005) ✅** — توسيع settings الموجود (بلا جدول جديد — overlay `default.<no>` في SETTINGS_OVERLAY من V007)
- `GET /settings/defaults` — قيم POS_DFLT_STNG_MST الحية مدموجة مع الـoverlay، كل صف مع `value`/`liveValue`/`overridden` (لـUI "يرجع إلى X").
- `PUT /settings/defaults` — admin فقط (RBAC)، `value:null` يرجع للقيمة الحية، STNG_NO يُتحقّق من القائمة الحية (404 لرقم مجهول — لا مفاتيح يتيمة).
- **proof حي:** GET → 15 إعداداً حياً → PUT admin {13→9، 2→0} → overrideCount 2 مع liveValue محفوظ → ثابت على إعادة GET → cashier PUT **403** → رقم 999 **404** → revert بـnull → overlay فاضي من مفاتيح default.* → **YSPOS23.POS_DFLT_STNG_MST لم يُمس** (2=1، 13=2 كما كانت) ✓

- build ✅ · pm2 restart ✅ · **200/200 اختبار وحدة** (+19 جديدة: 4 change-password، 5 prescriptions، 6 transfers، 4 settings-defaults) · 4 commits منفصلة · لم تُلمس وحدات الوكلاء الآخرين (reports/shifts/catalog/customers/suppliers/warehouses).
- ⚠️ ملاحظة تشغيلية: مع وكلاء متوازين حدثت سباقات build/restart (dist ناقص لحظياً — Cannot find module) — الحل دوماً: build كامل ثم restart ثم فحص /health قبل أي proof.

## 2026-07-03
### 6 تقارير تاريخية/متقدمة جديدة (reports 13→19 endpoint) — حيّة ومُختبَرة (subagent waveC-reports)
كلها READ-ONLY على YSPOS23/IAS202623 (bind variables، schema-qualified، JWT، RFC9457، envelope `{data,meta}`) — نفس نمط الـ13 الموجودة:
1. **`GET /reports/slow-moving?from=&to=&limit=&maxQty=`** — الأصناف الأبطأ حركة: LEFT JOIN من IAS_ITM_MST على مبيعات الفترة فتظهر الأصناف **عديمة البيع تماماً** (totalQty=0, lastSoldDay=null) + قليلة الحركة (SUM(qty)≤maxQty، افتراضي 5). **proof حي:** «ارز التيسير (5 كجم) 8قطم» وغيرها totalQty=0 ✓
2. **`GET /reports/profit?from=&to=&limit=`** — أرباح الأصناف: revenue − cost حيث cost = `IAS202623.IAS_ITM_MST.PRIMARY_COST` (متاح لكنه 0 لكل الأصناف تقريباً في بيئتنا — 7 أصناف فقط لها تكلفة>0)، لذا كل صف يحمل **`costAvailable`** ليميّز «لا ربح» عن «لا بيانات تكلفة». **proof حي:** «جبنة سالم مثلث» revenue 262,350، costAvailable=false ✓
3. **`GET /reports/comparison?fromA=&toA=&fromB=&toB=`** — مقارنة فترتين (كل الباراميترات إلزامية): billCount/totalAmt/vat/disc/avgBill لكل فترة + **deltaAmt/deltaAmtPct/deltaBills/deltaBillsPct**. **proof حي:** يونيو (10,514 فاتورة / 4.21م) vs مايو (10,055 / 4.28م) → deltaAmt −74,155 (−1.73%)، فواتير +459 (+4.56%) ✓
4. **`GET /reports/item-movement?item=&from=&to=&limit=`** — حركة صنف تفصيلية: UNION ALL مبيعات (BILL_DTL/MST) + مرتجعات (RT_BILL_DTL/MST بكمية سالبة) مرتّبة زمنياً تنازلياً + ملخص totalSold/totalReturned/netQty/netAmt + الاسم العربي. **proof حي:** «ارز الديوان (10 كجم) 4قطم» — بيعات 2026-07-03 (فاتورة 260700100000347 ×2 ×7800) ✓
5. **`GET /reports/audit?from=&to=&limit=`** — سجل الأسطر المحذوفة (نطاق POSR005): `YSPOS23.IAS_POS_AUD_ITEM` (4,115 صف حي) — كل سطر حُذف من فاتورة مع **اسم المستخدم العربي** (JOIN USER_R) ووقت الحذف AUD_DATE وعلم fromHungBill. الفلتر على AUD_DATE. **proof حي:** «فانيليا بودر فلورا» حذفها «طارق العباسي» 2026-06-25 18:02:25 ✓ (جداول HST_BILL_MST/HISTORY_HUNG فاضية في بيئتنا — AUD_ITEM هو مصدر الرقابة الفعلي)
6. **`GET /reports/vat-detailed?from=&to=`** — ضريبي تفصيلي: تجميع حسب **النسبة الفعلية** `NVL(DTL.VAT_PER, NVL(ITM_MST.VAT_PER, 0))` × فئة الصنف (ITEM_TYPES بالاسم العربي) مع gross/vatAmt/qty/lineCount. **proof حي:** شريحة 15% (16 سطراً، vat 216) + شريحة 0% «الاصناف الغير موزونه» (40,934 سطراً / 8.43م) ✓
- تحقّق أمني حي: بلا توكن → 401 RFC9457 ✓ · `fromA=bad` → 400 برسائل تحقق واضحة ✓
- build ✅ · pm2 restart ✅ · **175/175 اختبار وحدة** (+6 جديدة في reports-extended: slow-moving/profit/comparison/item-movement/audit/vat-detailed) · OpenAPI مُعاد توليده (reports: 19 مساراً) · لم تُلمس بقية الوحدات.

### الولاء الكامل (POST021) + تحصيل الفواتير الآجلة (POST010/011) — حيّ ومُختبَر (subagent waveB-loyalty-credit)
**1. سجل حركة النقاط التفصيلي (POST021) ✅**
- `GET /api/v1/loyalty/customers/{code}/ledger` — كل حركات POINTS_LEDGER (كسب/استبدال/انتهاء/تسوية) الأحدث أولاً، كل صف مع `kind` (EARN/REDEEM/EXPIRE/ADJUST) + **رصيد جارٍ `balanceAfter`** محسوب نزولاً من الإجمالي (دقيق حتى مع limit — الصفوف الأقدم غير المجلوبة مدموجة في الرصيد الكلي). مع التاريخ والفاتورة (billNo/billId) والوردية والكاشير.
- `GET /api/v1/loyalty/summary` — إجماليات السلسلة: ممنوح/مستبدَل/صافٍ + قيمها النقدية + عدد الحركات والعملاء (تجميع SQL واحد).
- **proof حي:** عميل 1 → ledger صفّان: REDEEM −20 (balanceAfter=214) ثم EARN +234 (balanceAfter=234)، الرصيد 214 ✓ · summary: ممنوح 614 / مستبدَل 20 / صافٍ 594، عميلان ✓ · بلا توكن → 401.

**2. تحصيل الفواتير الآجلة (POST010/011) ✅**
- **جدول جديد `MOTECH_POS.CREDIT_COLLECTIONS`** (migration `V014`، مُطبّق حياً + GRANT لـMOTECH_RW): سند تحصيل لكل دفعة (CASH/CARD، عملة+rate، IDEMPOTENCY_KEY UNIQUE). الدين = مجموع تندرات CREDIT من PAYMENTS، والمتبقي مُشتق دوماً (لا رصيد مُكرّر ينحرف).
- `GET /api/v1/customers/{code}/credit-bills[?status=all]` — فواتير العميل الآجلة (افتراضياً غير المسدّدة فقط) مع creditAmt/collectedAmt/outstanding/status لكل فاتورة + `totalOutstanding` (الرصيد المدين). تجميع بـjoin واحد (لا N+1).
- `POST /api/v1/customers/{code}/collect` (Idempotency-Key إلزامي) — تسجيل دفعة تحصيل على فاتورة آجلة: حارس **لا تتجاوز المدين** (422 `collection-exceeds-debt` مع تفاصيل RFC9457)، 404 `credit-bill-not-found` لفاتورة بلا دين لهذا العميل، دعم عملات (amountInBill=amount×rate)، replay بنفس المفتاح يرجع السند الأصلي. الحالة تنقلب SETTLED عند اكتمال السداد وتختفي من قائمة open.
- **proof حي (فاتورة 260700100000014، عميل C001، دين 30):** credit-bills → outstanding 30 · collect 10 → outstanding 20 · replay نفس المفتاح → replayed:true نفس السند · collect 25 → **422 collection-exceeds-debt** · collect 20 → SETTLED، collected 30، outstanding 0 · قائمة open فاضية و`?status=all` تُظهرها SETTLED · السندان في CREDIT_COLLECTIONS بـSELECT ✓
- build ✅ · pm2 restart ✅ · **138/138 اختبار وحدة** (+12 جديدة: ledger رصيد جارٍ/limit/فاضي، summary، تحصيل: جزئي/سداد/تجاوز/عملات/idempotency/404/422) · OpenAPI مُعاد توليده · lint: خطآن مسبقان في einvoice فقط (ليسا من هذا العمل).

### طرق دفع جديدة: نقاط الولاء (POINTS) + كوبون (COUPON) — حيّ ومُختبَر (subagent payments-points-coupon)
تكامل كامل مع `AddPaymentUseCase` الموجود (لم يُعَد بناؤه) — تندران جديدان يعملان منفردَين أو ضمن multi مع نقد/بطاقة/آجل:

1. **الدفع بالنقاط (POINTS) ✅** — `amount` = عدد النقاط؛ تُحوَّل لقيمة نقدية بمعدل `POINT_VALUE` من `LOYALTY_CONFIG` (الآن 1 نقطة = 1 ريال). فحص كفاية الرصيد قبل أي كتابة (422 `insufficient-points`)، ثم **خصم بحركة REDEEM (TRNS_TYPE=2، POINT_CNT سالب) في POINTS_LEDGER** قبل سطر الدفع — idempotent لكل فاتورة (UQ_POINTS_BILL_TYP). `LoyaltyService.redeemForPayment` جديدة (فشلها يفشل الدفع — ليست best-effort مثل الكسب). يتطلب عميل ولاء (من التندر أو الفاتورة، وإلا 422).
2. **الدفع بالكوبون (COUPON) ✅** — تحقّق من `IAS202623.IAS_CPN_MST` عبر `CardsService.findCoupon` (رقم الكوبون داخل نطاق F_CPN_NO..T_CPN_NO أو مطابقة تامة، read-only عبر MOTECH_RO). القيمة من `amount` أو `BOOK_I_PRICE`. الجدول فاضي في بيئتنا → 422 `coupon-not-found` سليم (RFC9457). `COUPON_NO` يُخزَّن مع سطر الدفع.
3. **migration `V011`** (مُطبَّق حياً): `PAYMENTS.METHOD` CHECK صار يشمل POINTS/COUPON + عمود `COUPON_NO`.
4. **proof حي (curl):** فاتورة 50 ريال لعميل 1 (رصيده 234 نقطة) → دفع 20 نقطة → paidAmt=20، outstanding=30، **الرصيد 234→214** وحركة (TRNS_TYPE=2, −20, 'redeem as payment') في اللدجر · طلب 9999 نقطة → 422 insufficient-points ("has 214") · كوبون CPN-123 → 422 coupon-not-found · تسوية الباقي نقد 30 → fullyPaid=true و`YSPOS23.IAS_POS_BILL_MST.PAYED_AMT=50` (المرآة تعمل) ✅
- build ✅ · pm2 restart ✅ · **105/105 اختبار وحدة** (+6 جديدة: POINTS خصم/كفاية/بلا عميل، COUPON قيمة/غير موجود، mix POINTS+COUPON+CASH) · (golden الحية: نفس 12 فشلاً بيئياً مسبقاً قبل التغيير وبعده — حالة وردية/بيانات، ليست من هذا العمل).

### توأمة Onyx مكتملة: المخزون ينقص عند البيع + المرتجعات تُكتب في YSPOS23 (subagent reroute-inventory-returns)
**الدورة الكاملة بيع←مخزون←مرتجع←مخزون تعمل على جداول Onyx الحقيقية. proof حي موثّق أدناه.**

1. **المخزون ينقص عند البيع ✅** — اكتشاف مفصلي: `MV_ITEM_AVL_QTY` محسوبة من (ITEM_MOVEMENT − فواتير غير مُرحّلة POSTED=0 + مرتجعات غير مُرحّلة) — لا تُحدّث مباشرة (ORA-01732)، بل بـ `DBMS_MVIEW.REFRESH` (نفس منطق Onyx `MVIEW_REFRESH`). التنفيذ:
   - proc جديد `YSPOS23.MOTECH_REFRESH_AVL_QTY` (definer-rights) + `GRANT EXECUTE` لـ MOTECH_RW فقط (لا صلاحية DBMS_MVIEW مباشرة).
   - `OracleWriteService.refreshOnyxAvailability()` تُستدعى **بعد commit** الفاتورة/المرتجع (best-effort — فشل الـrefresh لا يلغي بيعاً مُرتكباً). زمن الـrefresh ~0.16s.
   - **إصلاح حرج:** الـMV container فيه EXPIRE_DATE/BATCH_NO NOT NULL — فواتير Motech كانت تكتب NULL فتكسر الـrefresh (ORA-01400). الآن كل الأسطر تكتب العُرف القديم `BATCH_NO='0'` + `EXPIRE_DATE=1900-01-01` (+backfill للقديم).
   - **إصلاح ثانٍ:** retry الـORA-08177 كان يفوّت الحالة المغلفة بـORA-00604 (delayed block cleanout بعد الـrefresh) — صار يفحص نص الرسالة أيضاً.
2. **المرتجعات تُكتب في Onyx الحقيقي ✅** — `oracle-return-write.repository` صار يكتب (بنفس نمط الفواتير، معاملة واحدة):
   - `YSPOS23.IAS_POS_RT_BILL_MST` (الرأس: RT_BILL_TYPE=1, RETURN_TYPE, BILL_NO=الفاتورة الأصلية, POSTED=0, CLC_VAT_AMT_TYP) + `IAS_POS_RT_BILL_DTL` (الأسطر: DOC_D_SEQ من `POS_RT_BILL_DTL_SEQ` الموجود، RT_RPLC_AMT، batch/expire بالعُرف القديم) + tracking في MOTECH_POS.RETURNS.
   - ترقيم RT رقمي خالص `YYMM+machine(3)+seq(8)` من sequence جديد `YSPOS23.POS_RT_BILLS_SEQ` (العمود NUMBER — أسقطنا بادئة 'R' القديمة)، بلا تصادم مع أرقام legacy (13 خانة مقابل 15).
   - المرتجع على فواتير Motech الجديدة يعمل تلقائياً (قارئ الفاتورة الأصلية يقرأ من YSPOS23 وفواتيرنا صارت هناك) + حارس over-return ما زال يعمل.
   - ملف هجرة `V010__onyx_returns_and_stock.sql` (proc + sequence + grants + backfill) — مُطبّق حياً.
3. **proof حي (curl + SELECT قبل/بعد):**
   - صنف 1020010006: المخزون 156 ← بيع 3 (BILL_NO=260700100000286) ← **153** ← مرتجع 2 (RT_BILL_NO=260700100000001، موجود فعلاً في IAS_POS_RT_BILL_MST/DTL بـSELECT) ← **155** ✅
   - صنف 1020010009: −2044 ← بيع 5 (260700100000287) ← **−2049** ← مرتجع 5 (260700100000002، refund 250) ← **−2044** ✅
   - over-return: محاولة إرجاع 2 إضافية ← 422 return-qty-exceeded ("sold 3, already returned 2, remaining 1") ✅ · GET /returns/260700100000001 يقرأه من YSPOS23 ✅
   - build ✅ · **99/99 اختبار** ✅ · pm2 restart ✅ (lint: 3 أخطاء مسبقة في einvoice ليست من هذا التغيير)

## 2026-07-01
### الموجة 4 (backend): module المخزون + إدارة الأجهزة/المستخدمين — حيّ ومُختبَر (subagent wave4-inventory-admin)
موديولان جديدان بنمط catalog/reports (Clean/Hexagonal: port/service/repo/controller)، قراءة فقط على Onyx عبر MOTECH_RO (يملك SELECT ANY TABLE — لا حاجة GRANT إضافي، مثبت)، JWT، RFC9457، bind variables، schema-qualified. لم يُمس أي module قائم — إضافة موديولين + سطرين في app.module فقط. **proof-not-assumption: كل endpoint curl حيّ ببيانات حقيقية.**

1. **module `inventory` (المخزون — POSAVLQTY) ✅** — aggregations حقيقية على `YSPOS23.MV_ITEM_AVL_QTY` (2004 صف، 1280 صنف) + أسماء عربية من `IAS202623.IAS_ITM_MST`:
   - `GET /api/v1/inventory?search=&cursor=&limit=` — قائمة الأصناف بكمياتها المجمّعة (`SUM(AVL_QTY)`) بأسمائها العربية + عدد المخازن، cursor pagination بـ I_CODE. بحث بالكود أو الاسم العربي.
   - `GET /api/v1/inventory/:code` — كمية الصنف مفصّلة **بكل مخزن/دفعة** (W_CODE, BATCH_NO, EXPIRE_DATE, AVL_QTY) + الإجمالي. 404 RFC9457 للمجهول.
   - `GET /api/v1/inventory/low-stock?threshold=&limit=` — أصناف منخفضة (`SUM(AVL_QTY) <= threshold` تصاعدياً).
   - **proof حي:** list → "ارز الديوان (10 كجم) 4قطم" qty 0، "ارز الفخامه" qty 5 · detail 1010010004 → مخزن W_CODE=2 batch=0 · low-stock(thr=1) → "جبنه مالح البقرات" -24100، "خبز" -7961 (قيم سالبة حقيقية من MV) · 404 للكود المجهول (RFC9457 item-not-found) · limit=999 → 400 · بلا توكن → 401 ✅.

2. **module `admin` (الأجهزة + المستخدمين + الجلسات — admin فقط عبر RBAC) ✅** — قراءة من Onyx مباشرةً:
   - `GET /api/v1/admin/machines` — أجهزة الكاشير من `YSPOS23.IAS_POS_MACHINE` (3 أجهزة: SERVER3/POS1/POS2) بحالتها (inactive/useVat/defWarehouse/defBranch/lastBillDate/ip/priceLevel).
   - `GET /api/v1/admin/users` — المستخدمون من `IAS202623.USER_R` (4) بأسمائهم العربية (U_A_NAME) + isAdmin/loggedOn/locked/inactive/userType. (MOTECH_RO يقرأ USER_R عبر SELECT ANY TABLE — لا GRANT لزم.)
   - `GET /api/v1/admin/sessions?userId=&limit=` — سجل الدخول/الخروج من `YSPOS23.IAS_USR_LGN_HSTRY` (608 صف) الأحدث أولاً.
   - **proof حي:** machines → 3 أجهزة (SERVER3 lastBill 2026-05-17) · users → "مدير النظام" (isAdmin=true, loggedOn=true)، "محمد المجهلي"، "طارق العباسي"، "صدام العتواني" (أسماء عربية حقيقية) · sessions → دخول U_ID=1 على SERVER3 2026-06-28 · **RBAC: cashier → admin/users = 403** · بلا توكن → 401 ✅.

- **الأمان/الجودة:** JWT مؤكّد (401) · RBAC admin-only على /admin (403 للكاشير) · validation (400) · 404 RFC9457 · bind variables فقط · **لا كتابة على YSPOS23/IAS202623** (قراءة فقط).
- **حالة عامة:** `npm run build` ✅ · `pm2 restart motech-pos-api` ✅ (online) · **87 اختبار وحدة تمر جميعها** (+7 جديدة: inventory 4، admin 3) · OpenApi مُعاد توليده (الـ6 مسارات الجديدة موجودة: inventory×3، admin×3). commits منفصلة بهوية MoainAlabbasi <Moain.learn@gmail.com>.

### الموجة القادمة (P0) — إكمال دورة البيع الحرجة (backend) — حيّ ومُختبَر (subagent wave1-p0-backend)
أُكملت **3 ثغرات P0** من COMPLETION_MATRIX (الرابعة كانت جاهزة)، كلها backend بنمط bills نفسه (Clean/Hexagonal، MOTECH_POS للكتابة فقط، RFC9457، Idempotency، bind variables). proof-not-assumption: كل واحدة curl حيّ + اختبارات.

1. **الفواتير المعلّقة (Hold/Resume) — POST003 / IAS_POS_HUNG_BILLS** ✅
   - **جدول جديد `MOTECH_POS.HELD_BILLS`** (migration `V004`، طُبِّق فعلاً): UUID v7 PK، `LINES_JSON CLOB (IS JSON)` لقطة أمينة للسلة، `HOLD_NO` من `SEQ_HOLD_NO`، `IDEMPOTENCY_KEY UNIQUE`، FK→SHIFTS، CHECK للحالة (HELD/RESUMED/CANCELLED) والمبالغ.
   - `POST /api/v1/bills/hold` (Idempotency-Key إلزامي، وردية مفتوحة إلزامية، يقدّر الصافي بمنطق الدومين) · `GET /api/v1/bills/held?cashierNo=` (قائمة المعلّقة) · `POST /api/v1/bills/held/:id/resume` (يعيد بناء السلة → يمرّرها لـ PostBillUseCase → فاتورة POSTED حقيقية، يعلّم المعلّقة RESUMED ويربط BILLS.ID).
   - **proof حي:** hold (label "Table 5"، سطرين) → estNet 203.5 · replay نفس المفتاح → replayed:true نفس id · list → 1 · resume → billNo حقيقي gross 200/vat 13.5/net 203.5 held.status=RESUMED · re-resume → نفس الفاتورة (لا ازدواج) · hold بلا وردية → 409 no-open-shift · بلا Idempotency-Key → 422.
2. **الدفع المتعدد/الجزئي + العملات — POST001/POST006** ✅
   - وسّعت `AddPaymentUseCase`: يقبل عدة طرق (نقد+بطاقة+آجل) في فاتورة واحدة، **مبالغ جزئية تتراكم** حتى إجمالي الفاتورة، **عملات متعددة** (`amountInBill = amount*rate`، دلالة IAS_DEPOSIT_CURRENCY_MST)، **يمنع تجاوز غير-النقد للرصيد المتبقّي (422 payment-exceeds-balance)**، **النقد يسمح بالفكّة (change)**. آجل يتطلب customerCode. يرجّع settlement (outstanding/change/fullyPaid) مع الفاتورة كاملة (متوافق للخلف).
   - `POST /api/v1/bills/:id/payments` (تندر واحد، محسّن) · `POST /api/v1/bills/:id/payments/multi` (عدة تندرات في نداء واحد).
   - **proof حي:** جزئي نقد 100 على فاتورة 203.5 → outstanding 103.5 fullyPaid=false · بطاقة 200>الرصيد → 422 · multi (بطاقة50+آجل30+نقد40) → fullyPaid=true change 16.5 (4 دفعات) · آجل بلا عميل → 422 · **متعدد العملات: 1 USD@250 → 250 YER in-bill fully paid**.
3. **مطابقة/تصفية إقفال الوردية (Z-report) — POST013/POST015 + POST027 + POSR001** ✅
   - وسّعت `shifts/close` + خدمة `reconciliation`: **expected cash = فتح + مبيعات نقد − مصروفات نقد**، **actual cash** المُدخل، **الفرق over/short**، **تفصيل حسب طريقة الدفع × العملة** (Z-report data). `close` يقبل `cashExpenses` ويرجّع الوردية (متوافق للخلف) + التصفية في `meta`.
   - `GET /api/v1/shifts/:id/reconciliation?actualCash=&cashExpenses=` (X-report للمفتوحة / Z-report للمغلقة).
   - **proof حي:** X-report (مفتوحة): expected 1000+390 = 1390 · actual 1200 → −190 SHORT · breakdown (CASH 390 منها USD 250+YER 140، CARD 50، CREDIT 30) · close بمصروفات 50: expected 1340 → −140 SHORT.
4. **قارئ الأسعار — POST016** ✅ (كان جاهزاً): `GET /api/v1/items/:code` يرجّع الكود+الاسم العربي+السعر+الكمية المتاحة (كل مخزن)+الباركود+الوحدة. تحقّق حي: `1020060001 → بيض، سعر 50، كمية −1088`.

- **صلابة إضافية:** أضفت **retry مقيّد على ORA-08177 (فشل تسلسل SERIALIZABLE عابر)** في `OracleWriteService.withTransaction` — يفيد كل جانب الكتابة (shifts/bills/returns/held) لا الجديد فقط.
- **الاختبارات (proof):** **42 unit** (+9 add-payment جديدة: جزئي/متعدد/فكّة/عملة/تجاوز/آجل/immutable) كلها تمرّ · **31 golden/integration حيّة** (+11 جديدة `p0-features-integration`: دورة hold→list→resume + دفع جزئي/multi/عملة + X/Z reconciliation على القاعدتين الحقيقيتين) — **صفر كسر للقديم** (write-side/catalog/bills-golden تمرّ). **build + lint نظيفان.**
- توثيق: `docs/api/openapi.json` مُعاد توليده (**32 مسار**، +hold/held/resume/payments-multi/reconciliation) + هذا السجل + `docs/COMPLETION_MATRIX.md` (خارطة الثغرات المرجعية).
- `pm2 restart motech-pos-api` ✅ (online، health يفحص القاعدتين). commits منفصلة بهوية MoainAlabbasi.
- **التالي (P1):** المقبوضات/المصروفات (سندات) لتغذية cashExpenses فعلياً · نقاط الولاء · CRUD الأصناف/العملاء · ربط أزرار الدفع المتعدد/hold-resume في الواجهة.

## 2026-06-29
### 18:40 — ✅ المرحلة 2‑ج — جانب الكتابة (قاعدة MOTECH_POS منفصلة + PostBill + payments + shifts) (subagent phase2c-write-side)
- **قاعدة كتابة خاصة منفصلة `MOTECH_POS`** (مستخدم/سكيمة جديدة في نفس حاوية oracle12، **منفصلة تماماً عن YSPOS23 المقدّسة**). YSPOS23 = قراءة فقط عبر `MOTECH_RO`؛ الكتابة فقط في `MOTECH_POS`. **proof العزل:** `MOTECH_POS` لا يملك أي صلاحية على YSPOS23 → `SELECT … FROM YSPOS23.*` يرجع **ORA-00942** (عزل على مستوى الصلاحيات لا الكود).
  - **migrations** في `db/migrations/`: `V001` (إنشاء المستخدم/الصلاحيات الدنيا) + `V002` (الجداول). جداول التصميم النظيف من DATA_MODEL: `SHIFTS, BILLS, BILL_LINES, PAYMENTS`. **NUMBER(18,4) للمال** (NUMERIC لا float)، **UUID v7 PK** (VARCHAR2(36)، مولّد محلياً time-ordered)، `CREATED_AT TIMESTAMP`، `IDEMPOTENCY_KEY UNIQUE`، فهرس فريد جزئي `UX_SHIFTS_ONE_OPEN` (وردية مفتوحة واحدة لكل كاشير)، FK + CHECK على المبالغ/الحالات.
- **shifts write:** `POST /api/v1/shifts/open` (يكتب MOTECH_POS.SHIFTS، يرفض وردية ثانية → 409 shift-already-open) + `POST /:id/close` (يحسب expected cash + الفرق) + `GET /:id/summary` (X/Z) + `GET /current` (شرط البيع، 409 no-open-shift). محميّة بـ JWT/RBAC.
- **PostBillUseCase** (`POST /api/v1/bills`، نظير `EXTRCT_POS_BILL_PRC`): (1) **Idempotency-Key إلزامي** (uuid v7، إعادة المفتاح = نفس الفاتورة بلا ازدواج؛ مفتاح+جسم مختلف = 409؛ بلا مفتاح = 422)؛ (2) **شرط وردية مفتوحة**؛ (3) **يقرأ الأسعار/الضريبة من YSPOS23** (read-only)؛ (4) يحسب الإجماليات بمنطق golden المُثبت (`Bill` aggregate: gross/discount/vat/net + توزيع خصم الرأس تناسبياً)؛ (5) **يكتب الرأس+الأسطر ذرّياً في MOTECH_POS** ضمن معاملة SERIALIZABLE، ترقيم آمن من SEQ + UNIQUE idempotency backstop، **فاتورة immutable بعد الحفظ**. RFC9457.
- **payments:** `POST /api/v1/bills/:id/payments` (CASH/CARD/CREDIT) → MOTECH_POS.PAYMENTS، يعيد حساب PAID_AMT من سطور الدفع؛ آجل يتطلب customerCode.
- **بنية:** `OracleWriteService` (pool منفصل + `withTransaction` SERIALIZABLE) منفصل عن `OracleService` (read-only). ports جديدة: `ShiftWriteRepository`, `BillWriteRepository`, `ItemReferenceReader`. أخطاء مجال جديدة (shift-already-open/closed، idempotency-conflict/required، bill-immutable). `/health` و`/ready` يفحصان القاعدتين.
- **اختبارات (proof-not-assumption):** **33 unit** (+uuidv7) كلها تمر + **17 golden حيّة** (كلها تمر، صفر كسر للقديم). الجديد `write-side-integration.spec.ts` = **دورة بيع كاملة حيّة على القاعدتين الحقيقيتين**: بلا وردية→409 → فتح وردية → إنشاء فاتورة (قراءة سعر YSPOS23 + كتابة MOTECH_POS) → **Idempotency** (نفس المفتاح=صف واحد، مفتاح مختلف=409، بلا مفتاح=422) → دفع نقدي → إقفال (expected/diff) → البيع محجوب بعد الإقفال. **lint + build نظيفان.**
- توثيق: `backend/README` محدّث (write side + migrations + tests) + `docs/api/openapi.json` مُعاد توليده (18 مسار، إضافة bills POST/payments + shifts open/close/summary) + سكربت `npm run openapi`.
- قيود: الداتاسيت الحالي ضريبته/خصومه=صفر فالـ golden للقراءة يثبت مسار بلا‑ضريبة؛ منطق الضريبة نوع1/2+توزيع الخصم مُثبت unit. سعر الصنف يُعاد بناؤه من آخر بيع (IAS_POS_BILL_DTL) لغياب IAS202623. الترحيل للمركز (MOV_BILLS_PRC) + الفوترة الإلكترونية = مرحلة لاحقة.
- commits بهوية MoainAlabbasi.

### 18:20 — ✅ المرحلة 0‑ج — توثيق المسارات الكاملة end‑to‑end (9 مسارات) في docs/flows/ (subagent flows-analysis)
- **أُنشئ `docs/flows/`** بـ **9 ملفات مسار** + `INDEX.md`، كلٌّ يوثّق المسار الكامل **الواجهة (الشاشة) → المنطق (triggers/packages) → القاعدة (الجداول/الأعمدة الحقيقية)** بمنهج proof-not-assumption (أسماء مُستخرجة فعلياً من `docs/screens/`+`_raw/` و`db/schema/plsql/` 91 ملف و`db/schema/tables/` 117 DDL). كل ملف فيه: **مخطّط Mermaid sequence** + **جدول خطوات** + **ملاحظات لإعادة البناء** + **ثغرات**.
  1. **FLOW_LOGIN** (POSLGN → DECRYPT_PASS/VALIDATE_PASS/CHECK_HDSERIAL p‑code → USER_R/IAS_USR_LGN_HSTRY/الصلاحيات؛ تأكيد: auth في Forms client وليس DB pkg).
  2. **FLOW_OPEN_SHIFT** (POST027 → INSRT_WRK_SHFTS → POS_WRK_SHFT_CSHR؛ شرط البيع GET_WRK_SHFT_OPN_FNC).
  3. **FLOW_SALE_BILL** (الأهم — POST001 → EXTRCT_POS_BILL_PRC: SAVE_TYP 0/1/2/3، GET_BILL_NO_PRC بصيغة الترقيم الحرفية، CLC_DISC_VAT_AMT_PRC، CLC_ITM_TAX نوع1/2، INSRT MST/DTL، UPDT_BILL_IN_SAV_PRC، CLC_ITM_TAX_AFTR_SAVE→POS_TAX_ITM_MOVMNT DOC_TYPE=4، Trigger فرض الضريبة) — أعمدة MST/DTL الحقيقية كاملة من DDL.
  4. **FLOW_PAYMENT** (canvases الدفع في POST001 + POST011 → IAS_POS_PAY_BILLS بأعمدته الحقيقية؛ نقد/شبكة/آجل/كوبون/استبدال/عملات متعددة).
  5. **FLOW_LOYALTY** (POS_POINT_PKG.Insrt_Pos_Point_Trns → Pos_Point_Calc_trns).
  6. **FLOW_RETURN** (POST002 → EXTRCT_POS_RT_BILL_PRC → IAS_POS_RT_BILL_MST/DTL؛ DOC_TYPE=5).
  7. **FLOW_CLOSE_SHIFT** (POST013 تصفية → IAS_POS_JRNL_DIFF_CSHR_MST/DTL + IAS_DEPOSIT_CURRENCY + CLS_FLG=1).
  8. **FLOW_SYNC** (MOV_BILLS_PRC + الحارس `-20001` الحرفي + SUBMITDOCUMENT DOC_TYPE=4 + WEB_SRVC_TRNSFR_DATA_FLG/ETS_CONN_DATE + POS_SQL_QUEUE).
  9. **FLOW_REPORTS** (POSR001..016 + POST012/013/015/017/021 → GET_POS_DATA 1/2/3، GET_BILL_DATA_XML).
- **proof مُستشهَد حرفياً:** صيغة GET_BILL_NO_PRC (سنة+سيرفر+جهاز+[مستخدم]+تسلسل)، تعليق SAVE_TYP، معادلات الضريبة نوع1/2 وإعادة التجميع، حارس `RAISE_APPLICATION_ERROR(-20001,'There are tax bills not Sync...')`.
- **أهم ثغرة (proof):** أسماء الأصناف/أسعارها + USER_R + IAS_POINT_TYP_MST + IAS_CASH_CUSTMR كلها synonyms → **IAS202623 غائب** (الجاري سحبه)؛ والداتاسيت الحالي **ضريبته/خصومه = صفر**. أجسام DECRYPT_PASS/VALIDATE_PASS = p‑code (غير قابلة للاسترجاع، لا حاجة لها). تخطيط الشاشات + قوالب Reports تحتاج screenshots.
- commits بهوية MoainAlabbasi.
- **التالي:** ربط المخطط المركزي IAS202623 عند توفّره (أسماء الأصناف/الأسعار/المستخدمين/أنواع النقاط) + جانب الكتابة (PostBill/payments/shifts) مع فرض ثوابت المسارات الموثّقة.

### 17:55 — ✅ المرحلة 3 (Frontend) — واجهة POS حديثة React 19 PWA حيّة ومتصلة بالـ backend (subagent phase3-frontend)
- **هُيّئ مشروع `frontend/`**: **React 19 + Vite 8 + TypeScript 6** + **Tailwind v4** (@tailwindcss/vite) + مكوّنات shadcn-style مملوكة (Button/Input/Card/StateView/OnlineBadge عبر CVA+Radix Slot) + **RTL عربي** (`<html dir=rtl lang=ar>`، logical properties `ps-*/ms-*/text-start`) + **i18next** (عربي افتراضي، صفر نص hardcoded) + **PWA** (vite-plugin-pwa/Workbox: app-shell precache، items=StaleWhileRevalidate، الـ sale POSTs لا تُخزَّن في SW؛ manifest standalone RTL). خط Cairo عربي self-hosted (`public/fonts/cairo.woff2`).
- **طبقة API** (`shared/lib/api-client.ts`): axios + **interceptor للـ JWT** (حقن Bearer) + **refresh تلقائي single-flight** عند 401 ثم إعادة المحاولة + تطبيع أخطاء **RFC 9457** لـ `ApiError` (يعرض traceId). **TanStack Query v5** لحالة الخادم (cursor-infinite) + **Zustand v5** لحالة العميل (الجلسة/التوكنات persisted + سلة البيع) + **RHF+Zod** لنموذج الدخول. هيكلة **feature-based** (auth/shifts/pos-terminal/bills/reports + shared) حسب STANDARDS/02 §3.
- **الشاشات (MVP wave 0):** (1) **تسجيل الدخول** (POSLGN) `/login`. (2) **شاشة فاتورة البيع** (POST001) `/pos` — الأهم: بحث صنف/باركود فوري (debounce) + Enter/scanner يضيف المطابقة، شبكة أصناف touch-first، سلة بكميات +/-، ملخّص فاتورة (إجمالي/خصم/ضريبة/صافي بمنطق يطابق الـ backend `net=Σqty·price − disc + vat`)، header وردية/كاشير، أزرار دفع. (3) **قائمة الفواتير** `/bills` (تصفية from/to/machine + cursor) + **تفاصيل فاتورة** `/bills/:billNo` (بنود + إجماليات مُعاد حسابها مقابل المخزّن). (4) **تقرير يومي** `/reports` (KPIs + جدول). كل عرض يعالج loading/error/empty/success + a11y/keyboard.
- **proof حي (ليس افتراضاً):** الـ frontend dev server (5173) يُمرّر `/api`→backend(3100). تم فعلياً عبر البروكسي: **login** cashier1 → JWT حقيقي (طول 253) + role؛ **items?search=10100** → أصناف حقيقية (`1010010013` باركود 6287002861172 سعر 850، nextCursor)؛ **bills** → فواتير حقيقية (26303416579=300/سطر، 26303416578=500/4 أسطر)؛ **summary/daily** → تجميعات حقيقية (2026-06-24: 464 فاتورة، 169,377). index.html يُقدَّم `dir=rtl lang=ar`. manifest PWA + sw.js مُولَّدان.
- **build نظيف** (`tsc -b && vite build` ✅): مقسَّم chunks (entry **8.19KB gzip**، react-vendor/query/i18n/vendor منفصلة، bills/reports lazy) — لا تحذير 500KB. **lint نظيف** (oxlint: 0 errors؛ 5 تحذيرات only-export-components حميدة فقط في barrels/stores).
- **القيود (proof-based):** (أ) **الـ backend للقراءة فقط هذه المرحلة** — لا يوجد `POST /bills`/`/bills/calculate` بعد (تأكيد من openapi.json) → شاشة POS تحسب البيع محلياً وتُظهر تنبيهاً واضحاً عند "دفع" بدل تزييف حفظ. (ب) **أسماء الأصناف null** (المخطط IAS202623 الغائب) → الواجهة تعرض الكود/الباركود. (ج) لا وردية مفتوحة في البيانات → header يُظهر حالة "لا وردية". الخط Cairo مع سلسلة fallback عربية للنظام.
- توثيق: `frontend/README.md` (المعمارية + طبقة API + الشاشات + PWA + القيود) + `.env.example`. commits منطقية بهوية MoainAlabbasi.
- **التالي:** عند شحن جانب الكتابة (PostBillUseCase + payments + shifts open/close) → ربط أزرار الدفع فعلياً + idempotency (uuid v7) + طابور IndexedDB للـ offline-sync (الـ scaffold جاهز في `shared/offline/db.ts`) + طباعة ESC/POS.

### 17:40 — ✅ المرحلة 2-ب (Backend) — catalog + auth (JWT/RBAC) حيّان ومختبران (subagent phase2b-catalog-auth)
- **catalog module** (`src/modules/catalog/`, Clean/Hexagonal 4 طبقات): `GET /api/v1/items` (بحث+ترقيم cursor)، `GET /api/v1/items/:code` (صنف+سعر+كمية لكل مخزن)، `GET /api/v1/items/barcode/:bc`. محمية بـ JWT+RBAC.
- **اكتشاف حرج (proof, ليس افتراضاً):** جداول الأصناف/الأسعار المذكورة (`IAS_ITM_MST`, `IAS_ITM_DTL`, `IAS_ITEM_PRICE`) هي **synonyms** تشير للمخطط `IAS202623` الغائب في هذه الحاوية (0 objects) → كل الـ views (`IAS_V_ITM_UNT`…) **INVALID** (ORA-04063). البيانات الحقيقية المتاحة فقط: `MV_ITEM_AVL_QTY` (1,280 صنف + الكمية) + `IAS_POS_BILL_DTL` (آخر سعر/باركود/وحدة من 41,945 سطر بيع حقيقي). الـ repository يعيد بناء الصنف من تقاطعهما. موثّق في `docs/db/CATALOG_DATA_NOTE.md` (الاسم=null لأنه في المخطط الغائب؛ الحقل متروك للتوافق المستقبلي).
- **auth module** (`src/modules/auth/`): `POST /auth/login` (+`/refresh`, `/me`). **JWT HS256** (access+refresh) + **RBAC** (`cashier`/`supervisor`/`admin`) عبر `JwtAuthGuard`+`RolesGuard`+`@Roles()`. أسرار JWT من .env (Zod fail-fast). bcrypt constant-time compare (لا enumeration). RFC 9457 للأخطاء.
- **الأمن (proof):** `USER_R`/`S_BRN_USR_PRIV`/`PRIVILEGE_GC` أيضاً synonyms → IAS202623 غائب؛ وكلمات السر في Onyx مشفّرة (DECRYPT_PASS/POS_GNR_PKG غير متاح). لذا auth بـ **مخزن مستخدمين محلي مؤقّت** (bcrypt، seed JSON) — يحافظ على READ-ONLY على YSPOS23، وقابل للتبديل بـ `OracleUserRepository` خلف نفس الـ port لاحقاً. موثّق في `docs/db/AUTH_DATA_NOTE.md`.
- **إثبات حي (proof):** login cashier1 → 200 (access+refresh+role)؛ كلمة خاطئة → 401 `invalid-credentials`؛ items بلا token → 401؛ مع token → أصناف حقيقية (`1010010013` وحدة كيس، باركود 6287002861172، سعر 850، مخزن 2)؛ barcode→code؛ /me؛ refresh؛ رفض refresh-كـ-access؛ 404 `item-not-found` بـ RFC 9457.
- **اختبارات (36/36 تمرّ فعلاً):** 29 unit (منها 12 auth جديدة: TokenService round-trip/tamper، AuthService login/refresh/no-enumeration، RolesGuard) + 7 golden/integration (2 bills golden الأصلية تظل تمرّ = صفر regression + 5 catalog integration حية ضد Oracle). **lint نظيف، build نظيف.**
- **READ-ONLY ملتزَم:** صفر كتابة على YSPOS23 (الأصناف قراءة، المستخدمون في مخزن محلي منفصل).
- توثيق: `backend/README.md` محدّث (endpoints+auth+env+tests) + `docs/db/CATALOG_DATA_NOTE.md` + `docs/db/AUTH_DATA_NOTE.md` + `docs/api/openapi.json` (OpenAPI/Swagger محدّث — 11 مسار). commits بهوية MoainAlabbasi.
- **التالي:** جانب الكتابة للفاتورة (PostBillUseCase خلف Idempotency-Key) + ربط المخطط الحقيقي IAS202623 (أسماء الأصناف/الأسعار + جداول المستخدمين) عند توفّره.

### 17:22 — ✅ المرحلة 2 (Backend) — الإقلاع: NestJS يعمل + Oracle حي + bills/shifts + golden tests (subagent phase2-backend)
- **مشروع NestJS فعلي** في `backend/` (Clean/Hexagonal، 4 طبقات/module حسب PROJECT_STRUCTURE). يبني ويعمل: `npm run build` نظيف، `npm run start:prod` يقلع، **lint نظيف صفر تحذيرات**.
- **config بـ Zod** (`config.schema.ts` + `TypedConfigService`) — تحقّق البيئة عند الإقلاع (fail-fast). `helmet` + CORS allowlist + `ValidationPipe(whitelist, forbidNonWhitelisted)` + pino logging + graceful shutdown.
- **OracleModule فعلي** (`node-oracledb 6 thin mode` — بلا Instant Client، مُثبَت على Oracle 12.1) + connection pool. **مستخدم قراءة-فقط `MOTECH_RO`** (`SELECT ANY TABLE` فقط؛ الكتابة تُرفض ORA-01031 — least privilege). كل SQL schema-qualified + bind variables (لا concatenation).
- **إثبات حي (proof):**
  - `GET /health` → `{status:ok, db:connected, schema:YSPOS23}` (يستعلم DUAL فعلياً).
  - `GET /api/v1/bills?limit=3` → فواتير حقيقية من IAS_POS_BILL_MST.
  - `GET /api/v1/bills/26303416578` → الرأس + 4 أسطر حقيقية + **الإجماليات المُعاد حسابها (gross 500) = المخزّن (BILL_AMT 500)**.
  - `GET /api/v1/bills/summary/daily` → 47 يوم ملخّص.
  - `GET /api/v1/shifts/current?cashierNo=1` → 409 `no-open-shift` (RFC 9457). 404 للفاتورة غير الموجودة (RFC 9457 + traceId).
- **domain نقي مُعاد كتابته من PACKAGES_ANALYSIS:** `Money` (NUMERIC-safe، minor units، لا float) · `BillLine` (ضريبة نوع 1 على السعر / نوع 2 بعد الخصم — CLC_ITM_TAX §1.3) · `DiscountPolicy` (توزيع خصم الرأس تناسبياً — CLC_DISC_VAT_AMT_PRC §1.4) · `Bill` (إعادة تجميع الإجماليات — UPDT_BILL_IN_SAV_PRC §1.5). repository port + `OracleBillRepository` + `OracleShiftRepository`.
- **اختبارات (19/19 تمرّ فعلياً):** 17 unit (Money/BillLine/DiscountPolicy/Bill) + 2 golden. **Golden: قرأ 500 فاتورة حقيقية وطابق BILL_AMT/VAT_AMT/DISC_AMT بنسبة 100% (صفر اختلاف، tol 0.01).**
- **قيد بيانات موثّق (proof-based):** الداتاسيت الحالي (20,569 فاتورة / 41,945 سطر) **ضريبته وخصومه = صفر تماماً** على كل الفواتير. لذا golden يُثبت مسار بلا-ضريبة/بلا-خصم على بيانات حقيقية (BILL_AMT = Σ qty·price)، ومنطق الضريبة نوع1/نوع2 وتوزيع الخصم مُثبَت بـ unit tests (حالات مشتقّة من PACKAGES_ANALYSIS §1.3–1.5). نفس اختبار golden سيتحقّق تلقائياً عند تحميل داتاسيت بضرائب/خصومات بلا تغيير كود.
- **READ-ONLY ملتزَم:** لا INSERT/UPDATE على YSPOS23 (مفروض على مستوى DB). open/close الوردية (كتابة INSRT_WRK_SHFTS) مؤجّل لمرحلة الكتابة — نُفّذ جانب القراءة (الوردية المفتوحة) فقط.
- توثيق: `backend/README.md` (تشغيل + اختبارات + قيود). commits بهوية MoainAlabbasi.
- **التالي:** catalog (أصناف/أسعار/كمية متاحة) + auth (JWT/RBAC) + جانب الكتابة للفاتورة (PostBillUseCase) خلف Idempotency-Key.

### 17:06 — ✅ المرحلة 1 مكتملة: التصميم المعماري الكامل (subagent phase1-design)
- **5 ADRs** (`docs/adr/`): ADR-001 Modular Monolith + Clean/Hexagonal · ADR-002 الحزمة (React19+Vite / NestJS / Oracle→Postgres) · ADR-003 إستراتيجية البيانات (Oracle أولاً خلف ports + إعادة كتابة المنطق، مع adapters anti-corruption مؤقتة) · ADR-004 offline-first/PWA · ADR-005 Strangler-Fig. كل ADR بقالب MADR (سياق/قرار/بدائل/عواقب).
- **`docs/ARCHITECTURE.md`**: الطبقات (domain/application/infrastructure/presentation) + 12 module (auth, shifts, catalog, bills, payments, tax, loyalty, customers, reports, einvoice, sync, settings) كلٌّ مربوط بجداوله الحقيقية وحِزَمه الأصلية + تدفّق دورة البيع (sequence) + C4 (Context+Container) Mermaid + اتصال Oracle + إستراتيجية الأمان. الثوابت الحرجة مفروضة في domain (وردية مفتوحة، إعادة تجميع الإجماليات، نوعا الضريبة/الخصم، حارس -20001، immutable).
- **`docs/DATA_MODEL.md`**: تعيين كل جدول core بأعمدته الحقيقية (IAS_POS_BILL_MST→Bill، IAS_POS_BILL_DTL→BillLine، POS_WRK_SHFT[_CSHR]→Shift، IAS_POS_PAY_BILLS→Payment، POS_TAX_ITM_MOVMNT→TaxMovement، Pos_Point_Calc_trns→PointTransaction، IAS_POS_MACHINE→PosMachine) + جدول «نُبقي في Oracle مقابل نهاجر» + ERD جديد Mermaid. صفر اختراع — الأعمدة من db/schema/tables/*.sql.
- **`docs/API_DESIGN.md`**: REST `/api/v1` (auth, shifts open/close, bills CRUD+post+calculate+hold+refund, items, customers, payments, reports daily/closing/tax, sync push/pull) + RFC 9457 (مع أنواع أخطاء مشتقّة من حُرّاس Onyx) + cursor pagination + Idempotency-Key للفواتير + RBAC.
- **`docs/SCREENS_PRIORITY.md`**: ترتيب الـ80 شاشة بـ4 موجات. MVP = 6 شاشات (POSLGN→POST027 فتح→POST001 بيع→دفع→POST027 إقفال→POSR001 تقرير) + ميزات POS الحرجة. جدول: شاشة→وظيفة→أولوية→جداول/API→تعقيد.
- **`docs/PROJECT_STRUCTURE.md`**: شجرة backend (NestJS modules بـ4 طبقات لكلٍّ) + frontend (React feature-based + shared/offline/locales) حسب الكتيّب حرفياً، مع قواعد الحدود (ESLint boundaries).
- **6 commits** بهوية MoainAlabbasi (conventional). كل ملف commit مستقل.
- **التالي: المرحلة 2 (Backend)** — تهيئة NestJS + OracleModule (pool) + config(Zod) + الأمان، ثم bills module (PostBillUseCase + Bill aggregate + Oracle repo) كأول قطعة MVP مع اختبارات golden مقابل فواتير Onyx الحقيقية.

### 16:45 — ✅ المرحلة 0-أ مكتملة: فك وتوثيق كل شاشات POS (subagent phase0a-screens)
- **سُحبت 86 ملف** من جهاز POS (SERVER3, `D:\YS_ERP\Forms`) عبر scp إلى `db/forms_raw/`:
  80 شاشة `POS*.fmx` + 3 مكتبات (POSLIB/POSOTHRLIB/POSSTPLIB.plx) + قائمة POSMNU.mmx + ملفّا مساعدة poshelp.chm/poshelp_E.chm. (استُبعدت نسخ backup/test ذات اللواحق والمسافات).
- **80/80 شاشة فُكّت بنجاح كامل** بأداة witchi المُصلَّحة (صفر استثناءات). كل شاشة → `docs/screens/_raw/<NAME>_structure.txt`.
- **إصلاحان جديدان على الأداة** (تجاوز قيود v0.1 التي أوقفت الشاشات الكبيرة سابقاً):
  1. `LockingMode.lookup` → degrade لـ UNKNOWN بدل رمي استثناء (أصلح POST013/POST021).
  2. `FormCanvasFactory` → التفاف try/catch حول قراءة graphic-tree (تجاهل آمن لـ `ElementType 0x70207` غير المعروف) → **أصلح POST001 (فاتورة البيع، 4.8MB) + POSS004/POST024/POS_ALRT_SCR/POS_ITM_PRICE**. البنية البنيوية تُقرأ كاملة قبل الـ graphic-tree فلا تتأثّر.
- **strings (ASCII+UTF16LE)** على كل .fmx → `_raw/<NAME>_strings.txt` (SQL + literals). مثال: POST001 = 180+ جدول، 481 جملة SQL.
- **استُخرج poshelp.chm** (extract_chmLib) → 52 ملف مساعدة عربي لكل شاشة (POST001.htm = شرح فاتورة المبيعات…) → `_help/txt_ar` + 32 إنجليزي `_help/txt_en`.
- **وُثِّقت 80 شاشة**: `docs/screens/<NAME>.md` (الوظيفة من CHM + data blocks + canvases بإحداثياتها + windows + triggers + program units/packages + libraries + alerts + جداول DB من SQL + عيّنة SQL + قيود). الأسماء العربية المُشوّهة (CP1256-as-Latin1) أُصلِحت برمجياً.
- `docs/screens/INDEX.md` (جدول الـ80 شاشة) + `docs/screens/_DB_TABLES_DISCOVERED.md` (أكثر 37 جدول + العمود الفقري للبيع + حِزَم المنطق).
- **عيّنة proof (POST001 فاتورة المبيعات):** 59 data block · 53 canvas · 31 window · 63 trigger · 152 program unit (22 package) · 180+ جدول. العمود الفقري: `IAS_POS_BILL_MST`↔`IAS_POS_BILL_DTL`، الأصناف `IAS_ITM_MST`/`IAS_ITEM_PRICE`، المعلّق `IAS_POS_HUNG_BILLS`، الدفع `IAS_POS_PAY_BILLS_*`، العروض `IAS_QUT_PRM_*`.
- **القيود (proof-based):** (أ) منطق PL/SQL الإجرائي = p-code، يُستخرَج لاحقاً من DB `ALL_SOURCE`. (ب) الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي → تُستكمل بـ Visual RE. (ج) .plx لا تُفكّ بالأداة (حاوية ROS) → strings + DB.
- **التالي: المرحلة 0-ب** — سحب أجساد حِزَم POS من DB (ALL_SOURCE) + Visual RE للـ layout/الحقول العربية لشاشات البيع الأساسية.

### 16:12 — تأسيس المشروع
- أُنشئ مجلد المشروع /home/work/motech-pos/ + git + هيكل (backend/frontend/db/docs/scripts).
- كُتبت الخطة الشاملة: docs/PROJECT_PLAN.md (6 مراحل، Stack معتمد).
- المصادر جاهزة في /home/work/oracle/pos-alabasi/ (STANDARDS 15 ملف، SYSTEM_MAP، أبحاث الفك، Opus mastery، fmx output: 4 شاشات مفكوكة كإثبات).
- **التالي: المرحلة 0 — إكمال الفك الكامل (~100 شاشة + packages + توثيق).**

## الحالة العامة
- المرحلة الحالية: **3 (Frontend React 19 PWA) — MVP حي:** واجهة RTL عربية (login + POS + bills + bill-detail + reports) تتصل فعلياً بالـ backend وتعرض بيانات حقيقية (build+lint نظيفان). Backend (المرحلة 2): NestJS + Oracle حي + bills/shifts/catalog/auth/health + 36 اختبار. التالي: جانب الكتابة (PostBill + payments + offline-sync).
- المعمارية معتمدة: Modular Monolith + Clean/Hexagonal + Tactical DDD (ADR-001..005 في docs/adr/). التصاميم الكاملة في docs/ARCHITECTURE.md + DATA_MODEL.md + API_DESIGN.md + SCREENS_PRIORITY.md + PROJECT_STRUCTURE.md.
- القاعدة: حاوية oracle12 (YSPOS23، 118 جدول) شغّالة محلياً.
- ✅ **فُكّت ووُثِّقت 80 شاشة POS كاملة** (المرحلة 0-أ). راجع `docs/screens/INDEX.md`.
- الباقي للمرحلة 0: أجساد حِزَم DB (POSLIB/IAS_*_PKG via ALL_SOURCE) + Visual RE للحقول/التسميات + شاشات غير-POS عند الحاجة.

### 2026-06-29 18:38 — ✅ ترحيل IAS202623 (النظام المركزي ERP) → اكتمل النظام
- **سُحب وأُستورد schema IAS202623 كاملاً** من القاعدة الحيّة (SERVER3, Oracle 12.1) إلى حاوية oracle12 بجانب YSPOS23 (export = قراءة فقط، صفر تعديل على الجهاز).
- **proof:** 2595/2595 جدول · IAS_ITM_MST = 2391/2391 صف · **41945/41945 سطر فاتورة POS يربط باسم الصنف (تغطية 100%)**.
- العمود الحامل لاسم الصنف العربي: `IAS202623.IAS_ITM_MST.I_NAME` — مفتاح الربط `I_CODE`. عيّنة محقّقة: `1020060001 → بيض`, `1050040063 → شراب كنده دراي 500مل احمر`.
- **YSPOS23 INVALID objects: 135 → 48** بعد recompile (الـviews/synonyms التي كانت تشير لـ IAS202623 صارت VALID؛ المتبقي بسبب FGAC/db-links/PL-JSON غير المتوفرة في XE — مقبول).
- معالجات رئيسية موثّقة: charset BYTE→CHAR (924 ORA-12899)، GTT في tablespace دائم (127 ORA-02195)، تعطيل/تفعيل FK+Triggers للـreload.
- التوثيق الكامل: `/home/work/oracle/pos-alabasi/IAS202623_MIGRATION.md`.
- **الأثر:** أسماء الأصناف والعملاء والمستخدمين صارت متاحة محلياً → نظام Onyx مكتمل البيانات (لم تعد فواتير POS مجرد أكواد).

### 2026-07-01 — ✅ Reports module (تحليلات المبيعات) — حي بأربع نقاط نهاية
- أُضيف `backend/src/modules/reports/` بنفس نمط bills (Clean/Hexagonal: port + Oracle repo + service + controller + module)، مسجّل في `app.module`.
- **النقاط (كلها محمية JWT، غلاف `{data,meta}`، أخطاء RFC 9457):**
  - `GET /api/v1/reports/daily?from&to` — تجميع يومي `GROUP BY TRUNC(BILL_DATE)` (COUNT, SUM BILL_AMT/VAT_AMT/DISC_AMT).
  - `GET /api/v1/reports/monthly?from&to` — تجميع شهري `GROUP BY TRUNC(BILL_DATE,'MM')`.
  - `GET /api/v1/reports/by-item?limit` — الأصناف الأكثر مبيعاً، JOIN مع `IAS202623.IAS_ITM_MST` لاسم الصنف العربي، `SUM(I_QTY)` تنازلياً.
  - `GET /api/v1/reports/by-machine` — مبيعات كل جهاز كاشير (`MACHINE_NO`).
- يستخدم الـ Oracle read pool (MOTECH_RO، thin mode) عبر `OracleService`، bind variables فقط، `HUNG = 0` مثل bills.
- **proof (بيانات حيّة):** daily = 47 يوم (أعلى: 2026-06-24 → 464 فاتورة، 169377) · by-item: `خبز` 7429 · `روتي` 4433 · `مياه وادي العين 1.2لتر*12حبه` 1502 · by-machine: جهاز 3 = 16816 فاتورة / 6.96M، جهاز 2 = 3753 / 1.53M · monthly: 2026-06 (10514) + 2026-05 (10055) · بدون توكن → 401 RFC9457.
- `npm run build` ✅ · `pm2 restart motech-pos-api` ✅ (online).

### 2026-07-01 — ✅ Customers module (بيانات العملاء + نقاط الولاء) — حي بثلاث نقاط نهاية
- أُضيف `backend/src/modules/customers/` بنفس نمط reports/bills (Clean/Hexagonal: port + Oracle repo + service + controller + module)، مسجّل في `app.module`.
- يقرأ الجداول المركزية `IAS202623` عبر الـ Oracle read pool (MOTECH_RO، thin mode)، bind variables فقط.
- **النقاط (كلها محمية JWT، غلاف `{data,meta}`، أخطاء RFC 9457):**
  - `GET /api/v1/customers?search&limit` — بحث في `CUSTOMER` بالاسم العربي/الإنجليزي/الكود/الموبايل (`C_A_NAME/C_E_NAME/C_CODE/C_MOBILE LIKE`)، يرجّع الكود + الاسم العربي + الموبايل/واتساب/الهاتف + حالة النشاط.
  - `GET /api/v1/customers/:code` — عميل واحد بـ `C_CODE` (404 RFC9457 إن لم يوجد).
  - `GET /api/v1/customers/:code/points` — رصيد + حركة نقاط الولاء من `IAS_POINT_CALC_TRNS` (`SUM(POINT_CNT)` + آخر الحركات؛ يتحقق من وجود العميل أولاً).
- **proof (بيانات حيّة):** بحث بلا فلتر → عميلان: `محمد العباسي` (code 1) و `المهندس انس الدبعي` (code 2) · بحث `محمد` (عربي) → صف واحد صحيح · `/customers/1` → الاسم العربي · `/customers/1/points` → `{balance:{totalPoints:0,txnCount:0},txns:[]}` (فاضي = مقبول، الجدول فارغ) · `/customers/NOPE` → 404 RFC9457 · بدون توكن → 401.
- `npm run build` ✅ · `pm2 restart motech-pos-api` ✅ (online).

### 2026-07-01 — ✅ Returns module (مردود المبيعات) — write+read حي، مرتبط بالفاتورة الأصلية
- أُضيف `backend/src/modules/returns/` بنفس نمط bills بالكامل (Clean/Hexagonal: entities + ports + Oracle repos (read RT + write MOTECH_POS + original-bill reader) + service + use-case + controller + module)، مسجّل في `app.module`.
- **جداول جديدة في MOTECH_POS** (`db/migrations/V003__create_returns_tables.sql`، طُبّقت فعلاً): `RETURNS` (UUID v7 PK، `IDEMPOTENCY_KEY UNIQUE`، مال `NUMBER(18,4)`، `ORIGINAL_BILL_NO` ربط بالفاتورة الأصلية، `REFUND_AMT`، `created_at`، CHECK constraints) + `RETURN_LINES` (child، `RT_RPLC_AMT`→`REPLACE_AMOUNT` للاستبدال، CHECK qty>0) + `SEQ_RETURN_NO`. لا FK عبر المخططات (YSPOS23 للقراءة فقط).
- **النقاط (كلها محمية JWT، غلاف `{data,meta}`، أخطاء RFC 9457، bind variables فقط):**
  - `GET /api/v1/returns?from&to&machineNo&originalBillNo&cursor&limit` — قائمة المرتجعات من `YSPOS23.IAS_POS_RT_BILL_MST` (cursor pagination تنازلي، `HUNG=0`).
  - `GET /api/v1/returns/:id` — UUID → مرتجع MOTECH_POS، رقم RT → مرتجع legacy من YSPOS23 (رأس + أسطر + إجماليات مُعاد حسابها بمنطق الدومين).
  - `POST /api/v1/returns` — إنشاء مرتجع في MOTECH_POS: **Idempotency-Key إلزامي (uuid)**، **وردية مفتوحة إلزامية**، **يتحقق وجود الفاتورة الأصلية** (`OriginalBillReader`→`IAS_POS_BILL_MST/DTL`)، **الصنف يجب أن يكون مُباعاً**، **منع تجاوز الكمية المباعة تراكمياً** عبر كل المرتجعات السابقة (`returnedQtyForOriginal`)، ويحسب VAT/الخصم العكسي + `REFUND_AMT = net − replacement`. ترقيم RT آمن من `SEQ_RETURN_NO` (`R+YYMM+machine+seq`).
- **proof حي (curl، بيانات حقيقية):** login cashier1 → JWT(253) · `GET /returns` → مرتجعات YSPOS23 حقيقية (RT 2602303400183 = 200/جهاز 3) · `GET /returns/2602303400183` → أسطر + إجماليات مُعاد حسابها تطابق المخزّن · فتح وردية → `POST /returns` (فاتورة 26201300078، صنف 1030020018 كمية1) → **201** `RT_BILL_NO=R260700100000001` refundAmt=100 · إعادة نفس المفتاح+نفس الجسم → **replayed:true** نفس الـ id · نفس المفتاح+جسم مختلف → **409 idempotency-conflict** · إرجاع نفس الصنف ثانيةً (sold1 returned1) → **422 return-qty-exceeded** · إرجاع جزئي تراكمي (صنف 1050020195 مُباع 2: إرجاع 1 ثم 1 نجحا، الثالث → 422 sold2 returned2) · صنف غير مُباع → **422 item-not-on-original-bill** · فاتورة غير موجودة → **404 original-bill-not-found** · بلا Idempotency-Key → **422** · بلا توكن → **401** · `GET /returns/:uuid` → المرتجع من MOTECH_POS.
- ملاحظة داتاسيت: بعض مرتجعات YSPOS23 القديمة لها `BILL_NO=NULL` (مرتجعات غير مربوطة) — نموذج القراءة يتسامح معها، بينما مسار الكتابة يُلزم `ORIGINAL_BILL_NO` (تحقّق use-case + NOT NULL في العمود).
- `npm run build` ✅ · `npm run lint` ✅ (نظيف) · migration على MOTECH_POS ✅ · `pm2 restart motech-pos-api` ✅ (online).

### 2026-07-01 — ✅ Frontend اكتمل (Reports + Customers + Returns + POS محسّن + تنقّل RBAC) — منشور حيّ
- أُكملت واجهة `frontend/` (React 19 · Vite 8 · TanStack Query v5 · Zustand · Tailwind v4 · i18next RTL عربي) بنمط feature-based، وربطت بكل نقاط الـ backend الحقيقية (تُحقّقت curl حيّة على :3000 قبل الكتابة — proof-not-assumption).
- **الشاشات المُضافة/المُفعّلة:**
  1. **التقارير** (`features/reports`) — 4 تبويبات (يومي/شهري/الأكثر مبيعاً بالأسماء العربية/حسب الجهاز) مع KPIs + جداول. API: `useDailyReport/useMonthlyReport/useByItemReport/useByMachineReport` → `/reports/{daily,monthly,by-item,by-machine}`.
  2. **العملاء** (`features/customers`) — بحث + قائمة (`CustomerPicker` قابل لإعادة الاستخدام) + تفاصيل عميل + نقاط الولاء (رصيد + حركات). API: `useCustomerSearch/useCustomer/useCustomerPoints`.
  3. **المرتجعات** (`features/returns`) — قائمة + درج تفاصيل + حوار إنشاء مرتجع (إدخال رقم الفاتورة الأصلية → تحميل أسطرها عبر `useBillDetail` → اختيار كمية الإرجاع لكل سطر ≤ المباع → POST بـ `Idempotency-Key=uuid`). API: `useReturns/useReturnDetail/useCreateReturn`.
  4. **POS محسّن** — الأصناف تعرض الاسم العربي (البيانات صارت تحمل `name`)، إضافة عميل للفاتورة (`CustomerAttach` + حالة `customer` في `cart.store`) يُمرَّر كـ `customerCode/customerName` في POST /bills، مسار بيع فعلي كامل (bill → payment) كان موجوداً وبقي يعمل.
  5. **تنقّل/RBAC** — `AppLayout` قائمة جانبية حسب الدور (cashier: بيع/فواتير/مرتجعات · supervisor+admin: + عملاء + تقارير)، و`router` يحرس `/customers` و`/reports` بـ `RequireRole` (يعيد توجيه cashier إلى /pos).
- كل عرض بيانات يعالج loading/error(RFC9457 + traceId)/empty/success؛ RTL منطقي (`ps/pe/text-start/end`)؛ uuid موحّد في `shared/lib/idempotency.ts`.
- **proof:**
  - `npm run build` ✅ (311 modules، dist ~640KB precache، صفر أخطاء TS).
  - نُشر: `sudo cp -r dist/* /var/www/motech-pos/` (Caddy يخدمه على `nuugneol.gensparkclaw.com`، الـAPI عبر `/api` → :3000).
  - الرابط العام يفتح: `GET /` → 200 · chunk المرتجعات → 200 · `POST /api/v1/auth/login` عبر العام → 200.
  - **e2e عبر الرابط العام** (curl API + تصفّح فعلي عبر CDP بحساب admin): login → 4 تقارير 200 · بحث عملاء (محمد العباسي) · نقاط عميل · قائمة مرتجعات · بيع فعلي مع عميل مربوط → `billNo 260700100000013 net 60 cust محمد العباسي` · إنشاء مرتجع فعلي → `R260700100000005 net 50 orig 26303416578 status POSTED` · حارس تجاوز الكمية يعمل (422 return-qty-exceeded).
  - **لقطات شاشة حيّة** لكل الشاشات (pos/reports/customers/returns/bills) — RTL سليم، أسماء عربية، KPIs (إجمالي 8.49M / 20,569 فاتورة)، قائمة جانبية بكل الأيقونات.
- **قيود معروفة:** (1) المرتجعات تُنشأ ضد الفواتير القديمة (YSPOS23 `IAS_POS_BILL_MST`) لا فواتير MOTECH_POS الجديدة — هذا سلوك الـ backend الحالي (`OracleOriginalBillRepository`). (2) نقاط الولاء فارغة في الداتاسيت الحالي (`IAS_POINT_CALC_TRNS` فارغ) — الواجهة تعرض 0/لا حركات بشكل سليم. (3) تحذير بناء غير مؤثّر: `features/customers` يُستورد ثابتاً من POS فيبقى في الحزمة الرئيسية بدل التقسيم — مقبول.
- الهوية: MoainAlabbasi <Moain.learn@gmail.com>.

### 2026-07-01 — ✅ Settings module (إعدادات النظام POSS001) — قراءة حيّة من YSPOS23 + overlay للكتابة في MOTECH_POS
- أُضيف `backend/src/modules/settings/` (module جديد مستقل، بنمط reports/bills: domain port + Oracle repo (قراءة YSPOS23 عبر `OracleService` + قراءة/كتابة overlay عبر `OracleWriteService`) + service (منطق الدمج) + DTO/controller + module)، مسجّل في `app.module` (سطر واحد أُضيف بحذر، لم تُمس تسجيلات أخرى).
- **أعمدة حقيقية مُتحقَّقة** عبر `all_tab_columns` على MOTECH_RO قبل الكتابة (proof-not-assumption): `IAS_PARA_POS` (صف واحد: SETTING_NAME=YEMENSOFT، CURR_DFLT، PRICE_LEVEL، MACHINE/USER/SERIAL_DIGIT، PRINT_BILL/PRINT_BILL_B4SAV/OPEN_DRAWER، USE_HUNG_BILLS/MAXHUNGS، ROUND_AMT_FRCTION/RETURN_PERIOD/CHANGE_PERIOD، USE_POS_POINT_SYS/POINT_CALC_TYP، USE_SALE_ORDER/USE_DISC_CARD/ALLOW_CHANGE_BILL_CURR…) · `POS_DFLT_STNG_MST` (STNG_NO/STNG_VAL/COMNT، فلترة INACTIVE) · `IAS_POS_MACHINE` (TERMINAL/DEF_BRN_NO/USE_VAT/CURR_DFLT/ADDRESS/TEL_NO/BILL_FTR_REP…).
- **جدول جديد في MOTECH_POS** (`db/migrations/V007__create_settings_overlay.sql`، طُبّق فعلاً): `SETTINGS_OVERLAY` (SETTING_KEY PK، SETTING_VALUE VARCHAR2(4000)، UPDATED_BY، UPDATED_AT). لا FK عبر المخططات. القراءة تدمج الأصلي (YSPOS23) + overlay (overlay يفوز).
- **النقاط (كلها محمية JWT، غلاف `{data,meta}`، أخطاء RFC 9457، bind variables فقط):**
  - `GET /api/v1/settings` — إعدادات POS الفعّالة (IAS_PARA_POS مُسقَطة في شكل مُنمَّط + POS_DFLT_STNG_MST) مدموجة مع overlay محلي. متاح لأي مستخدم مُصادَق (الكاشير يحتاج العملة/الترقيم/الطباعة).
  - `GET /api/v1/settings/machine/:no` — إعدادات جهاز كاشير محدّد (IAS_POS_MACHINE) بـ 404 عند عدم الوجود.
  - `PUT|POST /api/v1/settings` — upsert (MERGE) لتعديلات الإعدادات في overlay (MOTECH_POS)، **admin فقط عبر RBAC** (`@Roles('admin')`)، whitelist للمفاتيح (مفتاح غير معروف → 400)، `value:null` يمسح الـ override ويعيد القيمة الحيّة. يُرجع الإعدادات المدموجة الجديدة.
- **proof حي (curl، بيانات حقيقية):** login admin → JWT · `GET /settings` → `shopName=YEMENSOFT` قيم حقيقية (numbering 2/3/5، defaults 15 صف بعد فلترة INACTIVE) · `GET /settings/machine/2` → `terminal=POS1 currency=YER branchNo=1` · `PUT /settings` (currency=USD, printing.printBill=1, default.13=9) → `applied:3 hasOverrides:true` والقيم مدموجة · `GET /settings` ثانيةً يؤكد الثبات + الدمج · **RBAC:** cashier1 `PUT` → **403 Forbidden** · مفتاح خبيث `evil.hack` → **400** · جهاز 999 → **404** · بلا توكن → **401** · **DB proof:** صفوف overlay في MOTECH_POS فقط (UPDATED_BY=3=admin من JWT sub) · مسح بـ `value:null` أعاد القيم الحيّة و`hasOverrides:false` · **YSPOS23 لم تُمس** (IAS_PARA_POS ما زال صفاً واحداً SETTING_NAME=YEMENSOFT).
- `npm run build` ✅ · migration على MOTECH_POS ✅ · `pm2 restart motech-pos-api` ✅ (online).
- الهوية: MoainAlabbasi <Moain.learn@gmail.com>.

### 2026-07-01 — ✅ ميزات أجهزة POS (طباعة حرارية ESC/POS + باركود + QR فاتورة إلكترونية + مزامنة offline) — واجهة
- أُضيفت وحدة مستقلة `frontend/src/features/print/` + دعوم في `frontend/src/shared/` (ملفات جديدة، لا تُمَس أي feature أخرى إلا استيراداً في POS). اتّباع STANDARDS/13 §3–§5 و§1–§2.
- **1) الطباعة الحرارية:**
  - `receipt-model.ts` — نموذج إيصال موحّد يُبنى من الفاتورة المُرحّلة (حقيقة الخادم للمبالغ/الرقم) + أسطر السلة (مصدر الأسماء العربية، لأن استجابة الفاتورة تُرجِع `itemName=null`).
  - `receipt-print.ts` — مسار المتصفّح الافتراضي الموثوق: قالب HTML **80mm RTL** يُحقن في `iframe` مخفي → `window.print()`، مع QR كصورة data-URL و`@page{size:80mm auto}`. فشل الطباعة **لا يُفشل البيع** (§3).
  - `escpos-encoder.ts` — تصدير **ESC/POS bytes** (init، CP1256 للعربية، محاذاة/عريض/حجم مضاعف، QR أمر model-2، فتح درج النقد `ESC p`، قص جزئي `GS V`) — للطابعات الحرارية عبر WebUSB/agent مستقبلاً.
  - `webusb-printer.ts` — إرسال البايتات مباشرة عبر **WebUSB** (feature-detected؛ يبقى `window.print` الافتراضي).
  - زر **«طباعة»** (`PrintReceiptButton`) يظهر في شاشة نجاح البيع (`SaleSummary`) + خيار «طباعة USB» عند توفّر WebUSB.
- **2) الباركود:**
  - `useBarcodeScanner.ts` (shared/hooks) — التقاط ماسح **HID keyboard-wedge** عالمياً بتمييز الإدخال السريع (فاصل < 40ms) المنتهي بـ Enter عن كتابة الإنسان.
  - `useScannerToCart.ts` — جسر المسح→السلة: مسح → `GET /items/barcode/:bc` (endpoint موجود، proof-verified) → إضافة للسلة + toast تغذية راجعة (§4، §10 هدف < 100ms).
  - `barcode-lookup.api.ts` — بحث بالباركود مع **fallback لكاش Dexie** عند عدم الاتصال (offline-first).
  - `barcode.ts` + `BarcodeDisplay.tsx` — توليد/عرض باركود عبر **JsBarcode** (auto EAN-13 لـ13 رقم، وإلا Code-128).
- **3) QR الفاتورة الإلكترونية:** `shared/einvoice/zatca-tlv.ts` — ترميز **TLV نمط ZATCA** (Tag-Length-Value ثم Base64): البائع، الرقم الضريبي، الطابع الزمني، الإجمالي، الضريبة (§5، adapter قابل لكل دولة عبر `store-config`).
- **4) إعداد المتجر:** `shared/config/store-config.store.ts` — هوية البائع/الرقم الضريبي/العملة/الدولة (Zustand persist) لرأس الإيصال وQR (الخادم الحالي لا يوفّرها).
- **5) مزامنة offline:** `shared/offline/sync-queue.ts` — طابور Dexie append-only لفواتير الـoffline بـ`clientOperationId` (= مفتاح idempotency للرأس والـheader معاً → لا ازدواج)، flusher خلفي عند `online` + دوري، dead-letter بعد 6 محاولات (§1، §2). يُشغَّل في `providers.tsx`.
- **proof:**
  - `tsc --noEmit --skipLibCheck` على كل ملفاتي = **0 أخطاء** · `oxlint` على 14 ملفاً = **0 تحذير/خطأ** · `tsc -b` أخطاؤه الوحيدة من ملفات workstream مُوازٍ (HeldBills/VouchersPage — غير ملفاتي، كانت حمراء قبل عملي).
  - **QR TLV:** ترميز→Base64→فكّ يؤكد البنية (tag1..5، اسم عربي UTF-8، مبالغ) — `hex` + `Base64` مطبوعان.
  - **الإيصال الحراري 80mm RTL:** لقطة شاشة حيّة (CDP) — رأس المحل + الرقم الضريبي + الأصناف بأسماء عربية + qty×price=net + الإجمالي/الضريبة/الصافي + الدفع/المدفوع/الباقي + QR + التذييل. ✅
  - **الباركود:** لقطة حيّة — EAN-13 (`6287002861172`) + Code-128 (`1010010013`). ✅
  - **ESC/POS:** تدفّق بايتات مُتحقَّق (init 1b40، CP1256 1b7420، QR model-2، درج، قص GS V). ✅
- **قيود معروفة:** (1) العربية على ESC/POS النصّي تعتمد codepage الطابعة (CP1256)؛ الطابعات الرخيصة بلا دعم عربي تحتاج **rasterization** (GS v 0 bitmap) — غير مُنفَّذ هذه المرحلة (مسار المتصفّح يغطّي العربية بالكامل). (2) **وكيل الطباعة المحلي** (المفضّل للإنتاج §3) غير مُنفَّذ — WebUSB مسار مباشر بديل. (3) طابور offline يستخدم مسار `/bills` الحالي؛ لا يوجد بعد ترقيم رسمي offline→online مؤقّت (§5) لأن الخادم يولّد الرقم عند الإنشاء. (4) لا اختبار وحدة رسمي (Vitest غير مُهيّأ في الواجهة) — أُثبِت عبر تنفيذ فعلي + لقطات.
- الهوية: MoainAlabbasi <Moain.learn@gmail.com>.

### 2026-07-01 — ✅ الموجة 2 (P1 backend): سندات + نقاط ولاء + CRUD overlay + تقارير إضافية
كل الميزات في MOTECH_POS (الكتابة)، YSPOS23/IAS202623 قراءة فقط. RFC9457 + Idempotency + NestJS hexagonal (قلّدت نمط bills/returns). لم تُكسر أي وحدة قائمة (إضافة endpoints/modules جديدة فقط + دمج اختياري عبر ports).

- **1) المقبوضات والمصروفات (POST025/POST026)** — module `vouchers` جديد:
  - جدول `MOTECH_POS.VOUCHERS` (V005): نوع RECEIPT/EXPENSE، مبلغ+عملة+سعر صرف، طريقة دفع، وصف/مستفيد/تصنيف، وردية، `IDEMPOTENCY_KEY UNIQUE`، ترقيم خادمي `SEQ_VOUCHER_NO` (RCP/EXP+YYMM+machine+seq).
  - `POST /api/v1/vouchers` (قبض/صرف، Idempotency-Key إلزامي، وردية مفتوحة شرط)، `GET /api/v1/vouchers?shift=&type=&cashierNo=&from=&to=`، `GET /api/v1/vouchers/:id`.
  - **يدخل في مطابقة إقفال الوردية:** `ShiftsService.reconciliation` صار يطوي المقبوضات/المصروفات النقدية → `expectedCash = opening + cashSales + cashReceipts - cashExpenses` عبر port اختياري `VOUCHER_CASH_TOTALS` (لا اقتران صلب/دائري).
  - **proof حي:** فتح وردية (opening=1000) → سند قبض 500 (+ replay بنفس المفتاح = نفس السند، لا ازدواج) → سند صرف 120 → `reconciliation` = **expectedCash 1380** (1000+500-120) ✅. 9 اختبارات وحدة.

- **2) نقاط الولاء الفعلية (POST020/POST021)** — module `loyalty` جديد:
  - جدولا `MOTECH_POS.LOYALTY_CONFIG` (قاعدة الكسب overlay؛ `IAS_POINT_TYP_MST` **فارغ 0 صف** في هذه البيئة) + `POINTS_LEDGER` (سجل حركة) (V006).
  - `PointsPolicy` مستخرج حرفياً من `PKG_POS_POINT_PKG.Get_Point_Cnt` (calc-type 1: `TRUNC(bill/AMT_4POINT)`، type 2: `*POINT_CNT`) — proof-referenced.
  - `LoyaltyService.earnOnSale` مربوط في `PostBillUseCase` بعد الحفظ (best-effort، لا يُفشل البيع)، **idempotent لكل فاتورة** عبر `UQ_POINTS_BILL_TYP (BILL_ID)`.
  - `GET /api/v1/loyalty/customers/:code/points` (الرصيد المكتسب + سجل من MOTECH_POS)؛ و`customers/:code/points` صار يُرجع `earned` أيضاً.
  - **proof حي:** فاتورة صافي 23400 لعميل "1" → **234 نقطة** (23400/100) · فاتورة 38000 لعميل "2" → **380** + إعادة الفاتورة (replay) **لا تضاعف** النقاط (صف واحد) ✅. 12 اختبار وحدة.

- **3) CRUD أصناف/عملاء (POSI010/POSI2000)** — overlay في MOTECH_POS:
  - جدولا `CUSTOMERS_OVERLAY` + `ITEMS_OVERLAY` (V007): `ORIGIN LOCAL|EDIT`، `CODE UNIQUE`.
  - `POST|PUT /api/v1/customers` (إنشاء عميل محلي / تعديل حقول عميل ERP محلياً)، `POST|PUT /api/v1/items` (سعر/اسم محلي). كتابة للـoverlay فقط، **YSPOS23 لم تُمس**.
  - **القراءة تدمج الأصلي + overlay** (overlay يفوز): `GET /customers/:code`, `GET /items/:code`, والبحث/القوائم تُظهر السطور المحلية وكل سطر يحمل `origin`. writes محميّة supervisor/admin. 409 للتكرار، 404 للمجهول.
  - **proof حي:** عميل محلي `LOC-C-1` + تعديل عميل ERP "1" (EDIT) · صنف محلي `LOC-I-1` + تعديل سعر صنف ERP `1010010004` (7800→**9999** في القراءة المدموجة) · تكرار `1010010004` → **409** ✅ (نُظّفت صفوف الاختبار). 9 اختبارات وحدة.

- **4) تقارير إضافية (MOTECH_POS)** — أُضيفت إلى module `reports`:
  - `GET /api/v1/reports/by-cashier?shift=&from=&to=` (مبيعات كل كاشير من BILLS + join PAYMENTS: نقد/بطاقة/آجل) — POST012.
  - `GET /api/v1/reports/payment-methods` (توزيع طرق الدفع per method×currency).
  - `GET /api/v1/reports/returns` (المرتجعات باليوم: عدد/إجمالي/ضريبة/صافي/مبلغ الاسترجاع).
  - **proof حي:** by-cashier (كاشير 12: net 48100, cash **47960**) · payment-methods (CASH YER 48160، CARD YER 160، CASH USD 250، CREDIT YER 30) · returns (2026-07-01: 5 مرتجعات، refund 610) ✅. 3 اختبارات وحدة.

- **حالة عامة:** `npm run build` ✅ · 4 migrations على MOTECH_POS ✅ · `pm2 restart motech-pos-api` ✅ (online) · **71 اختبار وحدة تمر جميعها** · OpenApi مُعاد توليده (كل الـendpoints الجديدة موجودة). commits منفصلة بهوية MoainAlabbasi <Moain.learn@gmail.com>.

### 2026-07-01 — ✅ الموجة 2 (Frontend): ربط ميزات الموجة 2 بواجهة Motech POS
ربط الواجهة (React 19 · TanStack Query v5 · shadcn-style · RTL عربي · RFC9457 · RBAC) بمسارات backend الموجودة والمُثبتة حيّاً على :3000. لم يُمس أي backend. `npm run build` نظيف (صفر أخطاء TS) و`lint` صفر أخطاء. نُشر على `/var/www/motech-pos/` وتحقّق حيّاً عبر الدومين.

- **1) لوحة رئيسية (Dashboard):** `features/dashboard` — صفحة الدخول الافتراضية (`/`). KPIs اليوم (مبيعات/عدد فواتير عبر `GET /reports/daily?from=today&to=today`) + حالة الوردية (`GET /shifts/current`) + روابط سريعة حسب الدور.
- **2) نقاط الولاء عند البيع:** شريحة رصيد النقاط تحت العميل المرفق في شاشة POS (`useCustomerPoints`) — إضافةً للعرض الموجود في شاشة العملاء.
- **3) إدارة الأصناف (CRUD):** `features/items` — بحث + شاشة إضافة/تعديل (`POST/PUT /items`). سعر/اسم/وحدة/باركود محلي + شارة المصدر (ERP/LOCAL/EDIT). supervisor/admin فقط. **proof:** POST → origin LOCAL، PUT على صنف ERP → origin EDIT (السعر يُعاد بعد الاختبار) ✅.
- **4) إدارة العملاء (CRUD):** `CustomerDialog` (`POST/PUT /customers`) موصولة بشاشة العملاء (أزرار إضافة/تعديل) + شارة المصدر. **proof:** POST → LOCAL، PUT يحدّث ✅.
- **5) شاشة الإعدادات:** `features/settings` — عرض `GET /settings` كامل (ترقيم/طباعة/ضريبة/نقاط/خيارات) + تعديل admin فقط عبر overrides (`PUT /settings`: shopName, billFooter, currency, points.usePosPointSys). **proof:** round-trip لـ shopName يُطبَّق ثم يُستعاد ✅.
- **6) التقارير الإضافية:** ثلاث تبويبات جديدة في شاشة التقارير: حسب الكاشير (`/reports/by-cashier`) · طرق الدفع (`/reports/payment-methods`) · المرتجعات (`/reports/returns`). **proof حي عبر الدومين:** الثلاثة 200 ✅.
- **6-bis) السندات (قبض/صرف):** كانت الشاشة والـAPI موجودة لكن مفاتيح الترجمة (`vouchers.*` + `nav.vouchers/priceCheck/reconciliation`) كانت مفقودة من `common.json` — أُضيفت كلها.
- **مشترك:** `OriginBadge` جديد (ERP/LOCAL/EDIT) يُعاد استخدامه في الأصناف والعملاء. router + AppLayout: مسارات `/` (dashboard) و`/items` (PRIVILEGED) و`/settings` (ADMIN_ONLY) مع RBAC. أنواع جديدة في `types.ts` (Settings, ByCashierRow, PaymentMethodRow, ReturnsReportRow, Create/Update DTOs, ItemOrigin).
- **proof build/نشر:** `npm run build` → صفر أخطاء TS، 28 precache entries · `sudo cp -r dist/* /var/www/motech-pos/` · الدومين `https://nuugneol.gensparkclaw.com/` يعطي `<title>Motech POS</title>` وحزمة index الجديدة 200؛ chunks (dashboard/items/settings) 200 حيّاً ✅.
- **قيود:** الإعدادات القابلة للتعديل من الواجهة محصورة بالمفاتيح التي يقبلها backend فعلاً (اسم المحل/التذييل/العملة/تفعيل النقاط)؛ البقية للعرض فقط تجنّباً لاختراع مفاتيح. لا يوجد DELETE للأصناف/العملاء في backend → التعطيل عبر `inactive`. لوحة KPIs تعتمد `/reports/daily` (نطاق اليوم) لأنه لا يوجد endpoint لحظي مخصص.

### 2026-07-01 — ✅ الموجة 3 (تقارير POSR إضافية + module cards/coupons)
توسعة module `reports` بستة تقارير YSPOS23 حقيقية + module `cards` جديد للبطاقات والكوبونات. كله قراءة فقط عبر MOTECH_RO (YSPOS23 + IAS202623)، JWT، RFC9457، bind variables، نمط hexagonal (port/service/controller). لم يُمس أي module آخر.

- **1) تقارير POSR إضافية** (أُضيفت إلى `reports`، aggregations SQL حقيقية من YSPOS23):
  - `GET /api/v1/reports/tax?from=&to=` — تقرير ضريبي باليوم: `totalVat` + `netBeforeVat` (=BILL_AMT−VAT) + خصم/إجمالي.
  - `GET /api/v1/reports/hourly-sales?from=&to=` — المبيعات بالساعة (00..23) بتحليل `SUBSTR(BILL_TIME,1,2)` (BILL_DATE بلا وقت؛ الوقت في BILL_TIME).
  - `GET /api/v1/reports/top-customers?limit=&from=&to=` — أعلى العملاء حسب المبيعات (C_CODE/CUST_CODE من رأس الفاتورة؛ walk-in تتجمّع تحت NULL).
  - `GET /api/v1/reports/discount?from=&to=` — تقرير الخصومات باليوم (DISC_AMT مقابل الإجمالي + نسبة الخصم %).
  - `GET /api/v1/reports/sales-by-category?from=&to=` — المبيعات حسب فئة الصنف (IAS_ITM_MST.ITEM_TYPE → IAS202623.ITEM_TYPES.IT_A_NAME).
  - `GET /api/v1/reports/z-report?from=&to=&machine=` — إقفال وردية/يوم كامل (كائن واحد): عدد فواتير/إجمالي/ضريبة/خصم/صافي/مرتجع + أول/آخر وقت فاتورة + تقسيم دفع نقد/بطاقة (بطاقة=CR_CARD_AMT، نقد=الباقي).
  - **proof حي (June 2026):** tax يوم 2026-06-25: 292 فاتورة، net 110143.3 · hourly: ساعة 00 → 354 فاتورة · top-customers: عميل "2" 7 فواتير 34010 · sales-by-category: "الاصناف الغير موزونه" 4,061,460 + "الاصناف الموزونه" 147,067.52 · z-report 2026-06-25: 292 فاتورة، gross 110143.3، CASH 109203.3 / CARD 940، أول 00:00:48 آخر 18:07:16 ✅.

- **2) module `cards` جديد** (POSI007/POSI012 — البطاقات/الكوبونات، قراءة IAS202623):
  - `GET /api/v1/cards` — أنواع بطاقات الدفع من `CREDIT_CARD_TYPES` (رقم/اسم عربي/إنجليزي/عمولة%/نوع/بنك).
  - `GET /api/v1/coupons?limit=` — رؤوس مستندات الكوبونات من `IAS_CPN_MST` (فارغ 0 صف في هذه البيئة → يُرجع `[]` بشكل سليم).
  - **proof حي:** cards → 8 بطاقات (جوالي، حاسب، جيب، …) · coupons → `{"data":[],"meta":{"count":0}}` ✅.
  - `CardsModule` مُسجّل في `app.module.ts`؛ OracleModule عام (@Global) فيُحقن OracleService مباشرة.

- **الأمان/الجودة:** JWT مؤكّد (بدون توكن → 401 RFC9457 `unauthorized`) · validation (limit>500 → 400 RFC9457 `bad-request`) · bind variables فقط · لا كتابة على أي schema.
- **حالة عامة:** `npm run build` ✅ · `pm2 restart motech-pos-api` ✅ (online) · **111 اختبار وحدة تمر جميعها** (+9 جديدة: reports-extended 6، cards 3) · OpenApi مُعاد توليده (الـ8 مسارات الجديدة موجودة). commits منفصلة بهوية MoainAlabbasi <Moain.learn@gmail.com>.

### 2026-07-01 — ✅ الموجة 4 (Backend): module الفوترة الإلكترونية + المزامنة (einvoice + sync)
بناء module جديدين في `backend/src/modules/einvoice/` و`sync/` (NestJS، hexagonal، JWT، RFC9457، Idempotency، الكتابة على MOTECH_POS فقط — لا مساس بـ Onyx الحي). محاكاة آمنة للمزامنة و`SUBMITDOCUMENT` (لا اتصال خارجي). لم يُمس أي module آخر؛ أُضيف سطرا التسجيل في `app.module.ts` بحذر بلا حذف. migration واحد `V009__create_sync_einvoice.sql` (EINVOICES + SYNC_QUEUE على MOTECH_POS).

- **1) einvoice module (الفوترة الإلكترونية):** توليد المستند الضريبي نمط ZATCA (مطابق `PKG_GNR_E_INVC_OP` + `PKG_GNR_QR_CODE_API_PKG`):
  - `domain/einvoice-policy.ts`: بنّاء نقي حتمي — TLV (5 وسوم إلزامية: البائع/الرقم الضريبي/التاريخ/الإجمالي شامل الضريبة/الضريبة) → Base64 (رمز QR)، + مستند JSON مُهيكل + تجزئة SHA-256.
  - `POST /api/v1/einvoice/generate/:billId` — يولّد المستند + QR + hash + FDA_CODE (حتمي من التجزئة) ويحاكي SUBMITDOCUMENT (يعلّم `submitted`). **idempotent** لكل فاتورة (UNIQUE BILL_ID) → إعادة الطلب تُرجع الأصل (`replayed=true`).
  - `GET /api/v1/einvoice/:billId` — استرجاع المستند المخزّن.
  - **الإجمالي = NET_AMT** (شامل الضريبة: net = gross − disc + vat)، غير الشامل = NET_AMT − VAT_AMT.
- **2) sync module (المزامنة نحو "المركز"):** إدارة طابور ترحيل الفواتير (محاكاة — لا كتابة على Onyx)، مطابق `PKG_POS_MOV_TRNS_PKG.MOV_BILLS_PRC` + `POS_SQL_QUEUE`:
  - `domain/sync-guard.ts`: **الحارس الحرج -20001** كـ predicate نقي: الفاتورة الضريبية (vat>0) لا تُزامَن قبل إصدار فاتورتها الإلكترونية؛ الرسالة حرفياً `There are tax bills not Sync. to tax authority bills count=N`.
  - `GET /api/v1/sync/status` (عدّادات pending/synced/failed) · `GET /api/v1/sync/queue` (بحسب الحالة) · `POST /api/v1/sync/enqueue` (idempotent لكل فاتورة) · `POST /api/v1/sync/run` (يعالج الطابور: يفرض الحارس، يحاكي الترحيل، يعلّم synced/failed؛ supervisor/admin فقط).
  - `SyncModule` يستهلك `EInvoiceService` (module عام) لتقييم الحارس بلا استيراد دائري.
- **proof حي (curl على :3000):** فاتورة ضريبية (net 230، vat 30) → enqueue → **run قبل الفوترة الإلكترونية = blocked** برسالة -20001 حرفياً ✅ → generate e-invoice (total **230** شامل الضريبة، QR TLV يُفكّ لـ5 وسوم صحيحة، fdaCode، submitted) ✅ → فاتورة B2 (total **57.5**) → generate ثم enqueue ثم **run = synced** ✅ · idempotency: إعادة generate/enqueue → `replayed=true` بنفس التجزئة ✅ · بلا توكن → 401 RFC9457 ✅ · صفوف EINVOICES/SYNC_QUEUE مؤكّدة في DB.
- **حالة عامة:** `npm run build` ✅ · migration V009 على MOTECH_POS ✅ · `pm2 restart motech-pos-api` ✅ (online) · **99 اختبار وحدة تمر** (+12 جديدة: einvoice 4، sync 8) · OpenApi مُعاد توليده (الـ6 مسارات الجديدة موجودة). commits منفصلة بهوية MoainAlabbasi <Moain.learn@gmail.com>.

### 2026-07-01 — ✅ الموجة 5 (Frontend): ربط كل الـ modules المتبقّية بالواجهة (inventory + admin + einvoice + sync + reports الجديدة + cards)
ربط الـ backend modules المتبقّية بواجهة Motech POS (React 19 · TanStack Query v5 · shadcn-style RTL · RFC9457 · RBAC)، بتقليد features الموجودة (items/reports/settings). العمل في `frontend/` فقط. **صفر أخطاء TS** في `npm run build`، `oxlint` 0 errors.

- **1) المخزون (`features/inventory/`):** شاشة `/inventory` (supervisor/admin) — تبويب "كل الأصناف" (بحث + cursor pagination عبر `GET /inventory`) + تبويب "منخفض المخزون" (`GET /inventory/low-stock`، عدّاد + threshold) + حوار تفاصيل الصنف بكل مخزن/دفعة (`GET /inventory/{code}`). الكميات السالبة بلون التحذير. **proof:** الشاشة تعرض الأصناف بأسمائها العربية وكمياتها ✅.
- **2) الإدارة (`features/admin/`):** شاشة `/admin` (**admin فقط**) — 3 تبويبات: الأجهزة (`GET /admin/machines`، SERVER3/POS1/POS2)، المستخدمون (`GET /admin/users`، أسماء عربية + أعلام مدير/متصل/مقفل)، سجل الدخول (`GET /admin/sessions`، دخول/خروج مع الوقت). **proof حي على الدومين** ✅.
- **3) الفوترة الإلكترونية (`features/einvoice/`):** حوار `EInvoiceDialog` — زر "فاتورة إلكترونية" في **شاشة نجاح البيع** بـ POS (حيث يتوفّر UUID الفاتورة على MOTECH_POS؛ فواتير Onyx القديمة بلا UUID فلا تُصدَر لها). يجلب المستند (`GET /einvoice/{billId}`)، وإن غير موجود (404) يعرض زر الإصدار (`POST /einvoice/generate/{billId}`) ثم يرسم QR (TLV Base64 → `renderQrDataUrl`) + حالة "أُرسل للهيئة" + البصمة.
- **4) المزامنة (`features/sync/`):** شاشة `/sync` (admin/supervisor) — عدّادات (pending/synced/failed/total من `GET /sync/status`)، طابور قابل للتصفية بالحالة (`GET /sync/queue`) مع رسائل الأخطاء (رسالة الحارس -20001 ظاهرة)، وزر "تشغيل المزامنة" (`POST /sync/run`). **proof حي** يعرض الفاتورتين (synced/failed) ✅.
- **5) التقارير الجديدة (`features/reports/`):** أُضيفت التبويبات الستة إلى `ReportsPage` (الآن 13 تبويباً): ضريبي (`/reports/tax`)، بالساعة (`/reports/hourly-sales` مع أشرطة نِسَب)، تقرير Z (`/reports/z-report`، ملخّص + تفصيل الدفع)، أعلى العملاء (`/reports/top-customers`)، الخصومات (`/reports/discount`)، حسب الفئة (`/reports/sales-by-category`). **proof حي:** تبويب تقرير Z يعرض 20,569 فاتورة + gross + تفصيل نقداً/بطاقة ✅.
- **6) البطاقات:** قسم "بطاقات الدفع" (`GET /cards`) في شاشة الإعدادات (اسم/نوع/عمولة/بنك). **proof حي** ✅.
- **7) تحسين شامل:** قائمة التنقّل (`AppLayout`) محدّثة بالشاشات الجديدة حسب الدور (المخزون/التقارير privileged، المزامنة privileged، الإدارة admin)؛ حالات loading/error/empty في كل شاشة عبر `StateView`؛ RTL منطقي (ps/pe/text-start-end)؛ RBAC على مستوى المسار (`RequireRole`) + التنقّل.
- **أنواع جديدة** في `shared/lib/types.ts`: InventoryItem/Detail/StockLine، AdminMachine/User/Session، EInvoice، SyncStatus/QueueEntry/RunResult، PaymentCard، TaxReportRow/HourlySalesRow/ZReport/TopCustomerRow/DiscountReportRow/SalesByCategoryRow.
- **النشر:** `npm run build` (صفر أخطاء TS) ✅ → `sudo cp -r dist/* /var/www/motech-pos/` ✅ → **تحقّق حي على `https://nuugneol.gensparkclaw.com`** (لقطات: inventory/admin/sync/reports-Z/settings-cards) ✅. commit بهوية MoainAlabbasi <Moain.learn@gmail.com>.
- **قيد معروف:** service worker (PWA) يخزّن قشرة التطبيق القديمة؛ بعد نشر جديد يحتاج المستخدم إعادة تحميل صلبة/إلغاء تسجيل الـSW لرؤية الشاشات الجديدة (تحقّقنا بمسح الـSW). الفوترة الإلكترونية متاحة لفواتير POS الجديدة فقط (تملك UUID) لا فواتير Onyx القديمة.

### 2026-07-03 — ✅ توجيه كتابة الفواتير إلى جداول Onyx الحقيقية (YSPOS23.IAS_POS_BILL_MST/DTL)
تحويل `OracleBillWriteRepository` من الكتابة في MOTECH_POS فقط إلى الكتابة **في جداول Onyx الحقيقية** + صف تتبّع في MOTECH_POS — كل ذلك في معاملة واحدة (SERIALIZABLE). backup مأخوذ مسبقاً (`YSPOS23_before_rewrite.dmp`).

- **مستخدم كتابة جديد:** `MOTECH_RW` (least-privilege): INSERT/UPDATE على `YSPOS23.IAS_POS_BILL_MST/DTL` + SELECT على `POS_BILLS_SEQ`/`POS_BILL_DTL_SEQ` + DML على جداول MOTECH_POS (مُنح 65 grant). `.env`: `ORACLE_WRITE_USER=MOTECH_RW`، `ORACLE_ONYX_SCHEMA=YSPOS23` (config جديد + `OracleWriteService.onyxSchema()`). ملاحظة: كلمة السر تحوي `#` فلزم اقتباسها في `.env` (dotenv يعتبرها تعليقاً — سبّبت ORA-28000 قفل حساب حتى أُصلحت).
- **insertBill (معاملة واحدة):** (1) صف تتبّع `MOTECH_POS.BILLS` — UNIQUE `IDEMPOTENCY_KEY` يربط المفتاح بـ BILL_NO ويُفشل التكرار مبكراً ويُرجِع كل شيء؛ (2) الرأس الحقيقي `IAS_POS_BILL_MST` — كل NOT NULL معبّأ (BILL_NO/BILL_SRL رقمي من `POS_BILLS_SEQ` بصيغة YYMM+machine(3)+seq(8) — لا يصطدم بأرقام Onyx القديمة، BILL_DATE/TIME، BILL_AMT=net، VAT_AMT/DISC_AMT، MACHINE_NO/CASH_NO/W_CODE=2/HUNG=0/POSTED=0، AD_U_ID/AD_DATE/AD_TRMNL_NM='MOTECH-POS'، CMP_NO=1/BRN_NO=1/BRN_YEAR/BRN_USR، DOC_MCHN_SQ=seq الخام، BILL_NOTE يحمل idempotency_key)؛ (3) الأسطر الحقيقية `IAS_POS_BILL_DTL` (I_CODE/I_QTY/I_PRICE/ITM_UNT/P_SIZE=1/P_QTY/W_CODE/RCRD_NO/BRN_*/DOC_D_SEQ من `POS_BILL_DTL_SEQ`)؛ (4) أسطر القراءة `MOTECH_POS.BILL_LINES`. **درس ORA-08177:** NEXTVAL داخل معاملة SERIALIZABLE يفجّر recursive SQL على SEQ$ — تُسحب قيم السلاسل خارج المعاملة ثم تُمرَّر bind.
- **addPayment:** يحدّث `PAID_AMT` في MOTECH_POS **ويعكس** `PAYED_AMT` على رأس Onyx الحقيقي.
- **proof حي (curl :3000):** login admin → فتح وردية (shiftNo 85) → `POST /bills` (صنف 1060080003 ×2 ×300) → **BILL_NO 260700300000284** → `SELECT` مباشر من `YSPOS23.IAS_POS_BILL_MST` أظهر الصف (BILL_AMT=600، MACHINE_NO=3، AD_TRMNL_NM=MOTECH-POS) + سطر DTL (DOC_D_SEQ=465) ✅ → دفع نقدي 600 → `PAYED_AMT=600` في YSPOS23 ✅ → `GET /reports/daily` أظهر 2026-07-03: billCount=1, totalAmt=600 ✅ → إعادة نفس `POST` بنفس Idempotency-Key أرجعت **نفس BILL_NO ونفس id بلا صف جديد** ✅.
- **حالة عامة:** `npm run build` ✅ · **99 اختبار وحدة تمر** ✅ · `pm2 restart motech-pos-api` (online) ✅.

### 2026-07-03 — ✅ فكّ باركود الموزونات (weighted barcode) في endpoint المسح
دعم باركود الميزان بنمط Onyx (قيم IAS_PARA_POS الحيّة: WEIGHTED_PERFIX='02'، WEIGHTED_LENGTH=12، WEIGHTED_ITEM_LENGTH=5، WEIGHTED_BASIC=1000). الكاشير يمسح باركود موزون → يُفكّ تلقائياً → الصنف يُرجَع مع الكمية الصحيحة (كجم).

- **`domain/weighted-barcode.ts` (catalog):** دالة نقية `parseWeightedBarcode` — لو الباركود 12 خانة أرقام ويبدأ بـ'02' → استخراج كود الصنف (5 خانات بعد البادئة، مع إزالة الأصفار البادئة) + الذيل ÷1000 = الوزن كجم. غير ذلك → null (سلوك عادي). config قابل للحقن دفاعياً.
- **`GET /items/barcode/:bc` محسّن:** باركود موزون → فكّ → بحث الصنف بالكود المضمّن (ERP + overlay) → إرجاع التفاصيل + حقل `scanned: {isWeighted, barcode, itemCode, quantity}`. باركود عادي → السلوك السابق + `scanned: {isWeighted:false, quantity:1}` (الواجهة تعبّئ كمية السطر مباشرة من `scanned.quantity`).
- **proof حي (curl :3000):** `029000101250` → صنف **90001 "رز الواحه سكبه40كيلو"** (سعر 780، مخزون 31.422) + `scanned.quantity=1.25` كجم ✅ · `029001200750` → **90012 "طحينه الخروف الاصلي14كيلو"** + quantity=0.75 ✅ · الباركود العادي `2790001005064` → نفس الصنف بـ`isWeighted:false, quantity:1` ✅ · موزون لصنف غير موجود `029999901000` → 404 RFC9457 برسالة تشمل الكود المستخرج ✅.
- **حالة عامة:** `npm run build` ✅ · **109 اختبار وحدة تمر** (+4 جديدة weighted-barcode) ✅ · `pm2 restart motech-pos-api` (online) ✅ · OpenAPI مُعاد توليده.

### 2026-07-03 — ✅ تصفية الوردية بفئات العملة + تصفية معتمدة (POST013)
استكمال «تصفية مبيعات الكاشيرات»: إدخال العدّ الفعلي بفئات العملة وحفظ تصفية معتمدة نهائية لا يمكن تكرارها.

- **DB (V012):** جدول `MOTECH_POS.SHIFT_DENOMINATIONS` (SHIFT_ID, CURRENCY, DENOMINATION_VALUE, DENOM_COUNT, AMOUNT — UNIQUE على shift×currency×value) + توسيع `SHIFTS`: حالة **SETTLED** (OPEN→CLOSED→SETTLED) وأعمدة COUNTED_CASH/SETTLE_DIFFERENCE/SETTLED_AT/SETTLED_BY/SETTLE_NOTE. grants لـ MOTECH_RW (DML) وMOTECH_RO (SELECT).
- **endpoints جديدة:**
  - `POST /shifts/{id}/count` — حفظ العدّ بالفئات (مثلاً 1000×5، 500×10…)؛ المجموع = actual cash. يستبدل عدّاً سابقاً لنفس العملة، ويُرفض بعد الاعتماد (409 shift-already-settled).
  - `POST /shifts/{id}/settle` (supervisor/admin فقط) — يحسب المتوقّع (نفس رياضيات reconciliation شاملة السندات) vs المعدود من الفئات → الفرق over/short → يحفظ الحالة **SETTLED** نهائياً. guards: 409 shift-not-closed لو الوردية ما زالت مفتوحة، 409 shift-count-required لو لا عدّ محفوظ، 409 shift-already-settled عند التكرار (UPDATE مشروط `STATUS='CLOSED'` كـbackstop ذرّي في القاعدة).
  - `GET /shifts/{id}/settlement` — العرض النهائي: المتوقّع/المعدود بالفئات/الفرق/الحالة (أرقام مجمّدة بعد الاعتماد، حيّة قبله).
- **proof حي (curl :3000):** فتح وردية (عهدة 1000) → بيع نقدي 15600 → إقفال (expected=16600) → settle قبل العدّ ⇒ 409 shift-count-required ✅ → عدّ بالفئات 1000×16+500×1+50×1=16550 → settle ⇒ **SETTLED، فرق -50 SHORT** ✅ → settle ثانية ⇒ 409 shift-already-settled ✅ → إعادة عدّ بعد الاعتماد ⇒ 409 ✅ → SELECT مباشر أظهر SHIFTS (SETTLED/16600/16550/-50/12) + 3 صفوف SHIFT_DENOMINATIONS ✅ (نُظّفت بيانات الاختبار بعدها).
- **حالة عامة:** `npm run build` ✅ · **112 اختبار وحدة تمر** (+3 جديدة shift-settlement: مجموع الفئات، over/short + جمود SETTLED، guards) ✅ · `pm2 restart motech-pos-api` (online) ✅.

### 2026-07-03 — ✅ إدارة كاملة: CRUD المستخدمين + الأجهزة + مصفوفة الصلاحيات (admin فقط)
توسيع module `admin` من قراءة فقط إلى إدارة كاملة بنمط الـoverlay (كل الكتابة في MOTECH_POS — YSPOS23/IAS202623 تبقى مقدّسة قراءة فقط).

- **DB (V013):** ثلاثة جداول في MOTECH_POS: `USERS_OVERLAY` (U_ID مفتاح عمل، أسماء عربية/إنجليزية، دور cashier/supervisor/admin، ربط بحساب auth عبر AUTH_USERNAME، INACTIVE، ORIGIN LOCAL/EDIT) · `MACHINES_OVERLAY` (MACHINE_NO، terminal/فرع/مخزن/IP/مستوى سعر/VAT/عملة، ORIGIN) · `ROLE_PERMISSIONS` (role×permission → allowed، PK مركّب، **مبذور بـ36 مدخلاً** يطابق سلوك RBAC الحالي: كاشير بلا VOID/SETTINGS/PRICE_OVERRIDE). grants DML لـ MOTECH_RW ضمن الـmigration.
- **CRUD المستخدمين (POSI011):** `POST /admin/users` (إنشاء LOCAL بمعرّف تلقائي ≥9000 أو صريح — 409 لو موجود في ERP/overlay) · `PUT /admin/users/{id}` (تعديل ERP → overlay بـ ORIGIN=EDIT يفوز للحقل المعدّل ويحافظ على بقية حقول ERP) · `PUT /admin/users/{id}/status` (`{active:bool}` تفعيل/تعطيل) · `GET /admin/users` الآن يدمج USER_R + overlay (كل صف يحمل origin ERP/LOCAL/EDIT + role + authUsername).
- **CRUD الأجهزة (POSI001):** `POST /admin/machines` (409 لو MACHINE_NO موجود) · `PUT /admin/machines/{no}` · `GET /admin/machines` مدموج (IAS_POS_MACHINE + overlay). MERGE upsert بـ COALESCE (تعديل جزئي لا يمسح الحقول الأخرى).
- **الصلاحيات (POSS002):** `GET /admin/permissions` (المصفوفة كاملة) · `PUT /admin/permissions` (entries[] upsert ذرّي داخل معاملة، UPDATED_BY من JWT sub) · whitelist 12 كود عملية (SALE/RETURN/DISCOUNT/VOID/HOLD/REPORTS/SETTINGS/SHIFT_OPEN/SHIFT_CLOSE/PRICE_OVERRIDE/VOUCHERS/EINVOICE) — كود مجهول → 400.
- **دروس Oracle:** `:uid`/`:role` أسماء bind محجوزة عبر thin driver (ORA-01745) → `b_uid`/`b_role` · bind قيمته null يفترض STRING فيكسر `COALESCE(:x, NUMBER_col)` بـ ORA-00932 → bind صريح `{val, type: oracledb.NUMBER}`.
- **proof حي (curl :3000):** admin ينشئ مستخدماً ("كاشير تجريبي" role=cashier → userId 9000 LOCAL) → ترقيته supervisor → تعطيله (`inactive:true`) → تفعيله ✅ · إنشاء آلة 10 (POS10, YER) → تعديلها (POS10-RENAMED + IP) → تعديل آلة ERP رقم 1 (IP جديد → ORIGIN=EDIT وحقول ERP كـ lastBillDate محفوظة) ✅ · `GET /admin/permissions` → 36 · `PUT` (حرمان كاشير من DISCOUNT) → applied:2 والمصفوفة محدّثة ✅ · كود مجهول HACK_STUFF → 400 ✅ · **RBAC:** cashier على POST users / PUT permissions / POST machines → **403×3**، بلا توكن → 401 ✅ · SELECT مباشر من MOTECH_POS أكّد الصفوف (USERS_OVERLAY 9000 supervisor، MACHINES_OVERLAY 10 LOCAL + 1 EDIT، ROLE_PERMISSIONS=36).
- **حالة عامة:** `npm run build` ✅ · **169 اختباراً تمر** (130 unit منها 15 جديدة admin-write + 39 golden) ✅ · `pm2 restart motech-pos-api` (online) ✅.

### 2026-07-03 — ✅ كتالوج متقدّم: مستويات أسعار + وحدات متعددة + شجرة فئات + بحث مُفلتر
اكتشاف مهم: schema **IAS202623 أصبح موجوداً محلياً** (IAS_ITM_MST 2,391 صنفاً، IAS_ITEM_PRICE 2,523 سطر أسعار، IAS_ITM_DTL 4,648 سطر وحدات، GROUP_DETAILS 23 مجموعة + IAS_MAINSUB_GRP_DTL 115 مجموعة فرعية، ITEM_TYPES نوعان موزون/غير موزون) — فتحنا قراءة الكتالوج الحقيقي كاملاً (قراءة فقط كالعادة).

- **مستويات الأسعار (POS_ITM_PRICE):** `GET /items/{code}/prices` — كل صفوف IAS_ITEM_PRICE للصنف (LEV_NO × وحدة × سعر + min/max) · `GET /items/{code}/prices/{lev}?unit=` — اختيار المستوى وقت البيع (الافتراضي: الوحدة الأساس = أصغر P_SIZE؛ 404 RFC9457 لمستوى غير موجود). **سعر الصنف في القائمة/التفاصيل يقرأ الآن من قائمة الأسعار الحيّة (LEV 1) مع fallback لآخر سعر بيع.**
- **الوحدات المتعددة (POSI2000):** `GET /items/{code}/units` — كل وحدات IAS_ITM_DTL مع معامل التحويل P_SIZE، باركود كل وحدة، أعلام main/sale/purchase/stock/noSale/inactive، وسعر الوحدة من قائمة الأسعار. مثال حي: 1010010013 = كيس (أساس، 850، باركود) + قطمه (=20 كيس، 17000).
- **الفئات:** `GET /categories` — شجرة كاملة: 23 مجموعة رئيسية (GROUP_DETAILS) × مجموعات فرعية (IAS_MAINSUB_GRP_DTL) بأسماء عربية وعدّاد أصناف لكل عقدة (مجموعها 2,391) · `GET /categories/item-types` — نوعا ITEM_TYPES.
- **بحث متقدم:** `GET /items` الآن يقبل `category` (G_CODE) · `subCategory` (MNG_CODE) · `weighted=true/false` · `active=true/false` · `minPrice/maxPrice` (على السعر الفعّال) — تتركّب مع search/cursor/limit.
- **proof حي (curl :3000):** `items/1010010013/prices` → سطران (كيس 850 / قطمه 17000) ✅ · `prices/1` → كيس 850 ✅ · `units` → وحدتان بمعامل تحويل 20 وباركود الوحدة الأساس ✅ · `categories` → 23 مجموعة/2391 صنفاً بشجرة عربية («التموينات الاساسية» → الارز/السكر/الدقيق…) ✅ · `items?category=01` → أصناف الأرز فقط ✅ · `weighted=true` → 5 أصناف موزونة ✅ · `minPrice=500&maxPrice=1000&active=true` → كل الأسعار داخل النطاق ✅.
- **حالة عامة:** `npm run build` ✅ · **186 اختباراً تمر** (144 unit + 42 golden، منها 11 golden جديدة للكتالوج المتقدّم) ✅ · `pm2 restart motech-pos-api` (online) ✅.

### 2026-07-04 — 🔒 إغلاق ثغرات الأمان P0 الأربع (من FINAL_AUDIT_FABLE5)
أربعة إصلاحات أمنية مثبتة بالدليل، كل واحدة commit منفصل:

1. **ثغرة السعر الحر (الأخطر — بيع بـ0.01):** السعر لم يعد يُقبل من العميل أبداً. `PostBillUseCase` يجلب السعر المرجعي server-side لكل سطر (ترتيب الحجية: ITEMS_OVERLAY ← IAS202623.IAS_ITEM_PRICE LEV 1 ← آخر سطر بيع YSPOS23). قيمة `unitPrice`/`vatPercent` مرسلة من العميل تُقبل فقط إن **طابقت** المرجع (echo من الواجهة) أو كان دور صاحب الـJWT يحمل صلاحية **PRICE_OVERRIDE** من مصفوفة ROLE_PERMISSIONS (supervisor/admin) — وإلا **403 price-override-forbidden**. خدمة جديدة `PricePolicyService` (cache 60s + fail-safe). الدور يُقرأ من الـJWT الموثّق حصراً (ليس من body). **proof:** كاشير `unitPrice:0.01` → 403 (المرجع 7800) ✅ · كاشير `vatPercent` مزيّف → 403 ✅ · بيع بلا سعر → net 7800 من القاعدة ✅ · supervisor override 5000 → 201 ✅ · اختبار regression جديد في p0 suite.
2. **كلمات السر الافتراضية المنشورة:** توليد كلمات سر عشوائية قوية للمستخدمين الثلاثة (bcrypt cost 12)، `auth-users.json` أُخرج من git (gitignore + example file)، ومسح كل ذكر لـcashier123/super123/admin123 من README×2 وAUTH_DATA_NOTE وSwagger example وopenapi.json وشاشة الدخول العربية. الاختبارات تقرأ الاعتماديات من env. **proof:** دخول admin123 → 401 ✅ · الكلمة الجديدة → 200 ✅.
3. **JWT secret إنتاجي:** تدوير JWT_SECRET إلى 64 حرفاً عشوائياً (openssl rand -base64 48) — كل التوكنات القديمة أُبطلت. Zod schema يرفض الآن الإقلاع بأي secret أقصر من 32 حرفاً أو بقيمة تطويرية معروفة (dev-local-secret/change-me/…). **proof:** توكن قديم → 401 ✅ · دخول جديد → توكن صالح ✅.
4. **الوصول المباشر وCORS:** الـAPI كان يستمع على 0.0.0.0:3000 والمنفذ مفتوح في جدار الحماية → كامل الـAPI مكشوف بلا TLS. الآن env جديد `HOST` (افتراضي 127.0.0.1) والربط loopback فقط — الدخول العام حصراً عبر Caddy (TLS + دومين). CORS_ORIGINS=https://nuugneol.gensparkclaw.com وNODE_ENV=production. **proof:** `http://<public-ip>:3000/health` → refused ✅ · عبر الدومين → 200 ✅ · preflight من origin غريب لا يحصل على allow-origin ✅.

- **حالة عامة:** build ✅ · 144 unit ✅ · golden: write-side 10/10 + p0 12/12 (منها اختبار الثغرة الجديد) ✅ · pm2 online (loopback) ✅.

### 2026-07-04 — ✅ ربط الواجهة الشامل (Fable 5): 8 حزم ميزات backend صارت UI حيّاً
كان الـbackend سابقاً للواجهة بفارق كبير (settlement/loyalty/collections/admin-CRUD/كتالوج متقدم/6 تقارير) — رُبط كل شيء بواجهة React (RTL عربي، TanStack Query، RFC 9457، RBAC).

- **1) تصفية الوردية بالفئات (POST013) — `ReconciliationPage`:** قسم جديد "عدّ النقد بفئات العملة": صفوف فئة×عدد (افتراضي 1000/500/250/100/50 + إضافة حرّة) بمجموع حيّ → `POST /shifts/{id}/count` · قسم "اعتماد التصفية" (supervisor/admin فقط عبر الدور من الجلسة) → `POST /shifts/{id}/settle` (نهائي) · عرض التصفية المعتمدة المجمّدة (متوقع/معدود/فرق over-short + جدول الفئات + من اعتمد ومتى) من `GET /shifts/{id}/settlement`. **الوردية المقفلة تبقى قابلة للتصفية:** `pos-settings.store` يحفظ `lastShiftId/No` عند الفتح والإقفال، والصفحة تعرض مسار التصفية وحده بعد الإقفال (سدّت فجوة "current shift فقط").
- **2) الدفع بالنقاط/الكوبون — `PaymentDialog`:** طريقتا دفع جديدتان POINTS (تتطلب عميلاً مربوطاً — `customerCode` يُمرَّر من السلة، والخيار معطّل بدونه، amount = عدد النقاط) وCOUPON (حقل رقم الكوبون؛ amount اختياري = القيمة الكاملة server-side، وزر التأكيد يسمح بكوبون مفتوح القيمة). `PaymentMethod` type وسّع + أيقونات Star/Ticket + الترجمات.
- **3) باركود الموزونات — `useScannerToCart` + `cart.store`:** `addItem(item, qty)` يقبل كمية (تقريب 3 منازل للجرامات)؛ مسح باركود موزون → `detail.scanned.quantity` (كجم) تُعبّأ تلقائياً في سطر السلة، وتغذية المسح تعرض "الاسم × الوزن". النوع `ScannedBarcode` أُضيف على `ItemDetail`.
- **4) الكتالوج المتقدّم:** **POS `ItemGrid`:** شريط فئات أفقي (chips) من `GET /categories` (23 مجموعة بعدّادات) + صف فئات فرعية عند الاختيار → `useItemSearch` يمرّر `category/subCategory` للـAPI · **`ItemsPage`:** فلتر فئات (select) + زر "التفاصيل" لكل صنف يفتح `ItemCatalogDialog` الجديد: جدول مستويات الأسعار (LEV×وحدة×سعر+min/max من `/items/{code}/prices`) + جدول الوحدات (معامل تحويل، باركود الوحدة، سعرها، أعلام أساسية/بيع/لا تُباع من `/items/{code}/units`).
- **5) سجل النقاط + التحصيل — `CustomersPage`:** تفاصيل العميل صارت 3 تبويبات: **البيانات** (السابق) · **حركة النقاط (POST021)** من `GET /loyalty/customers/{code}/ledger` — KPIs (رصيد/عدد حركات) + جدول (تاريخ، نوع كسب/استبدال/انتهاء/تسوية بشارات ملوّنة، فاتورة، قيمة، نقاط ±، **رصيد جارٍ بعد كل حركة**) · **الفواتير الآجلة (POST010/011)** من `GET /customers/{code}/credit-bills` — KPI إجمالي المديونية + مفتاح "عرض المسدَّدة" + جدول (آجل/محصَّل/متبقٍ/حالة) وزر **تحصيل** لكل فاتورة مفتوحة يفتح حوار سند تحصيل (مبلغ≤المتبقي، نقدي/شبكة، ملاحظة) → `POST /customers/{code}/collect` بـIdempotency-Key.
- **6) admin CRUD — `AdminPage`:** تبويب رابع **الصلاحيات (POSS002)**: مصفوفة 12 عملية × 3 أدوار (checkboxes، حفظ ذري للفروقات فقط عبر `PUT /admin/permissions`) · **المستخدمون:** زر إنشاء + تعديل لكل صف (حوار: أسماء/كود/دور/حساب دخول/بريد) → `POST/PUT /admin/users`، وزر تفعيل/تعطيل → `PUT /admin/users/{id}/status`، مع عمودي origin (ERP/LOCAL/EDIT) وrole · **الأجهزة:** إنشاء/تعديل (terminal/فرع/مخزن/IP/مستوى سعر/VAT/عملة) → `POST/PUT /admin/machines` + عمود origin.
- **7) التقارير الست الجديدة — `ReportsPage` (19 تبويباً):** الراكدة (آخر بيع/لم يُبَع بالأحمر) · الأرباح (إيراد/تكلفة/ربح/هامش% + شارة "بلا تكلفة" حيث PRIMARY_COST غائب) · مقارنة فترتين (4 تواريخ إلزامية → KPIs دلتا + جدول مؤشرات A/B) · حركة صنف (كود إلزامي + مدى → KPIs مباع/مرتجع/صافي + جدول حركات ملوّن) · سجل الحذف POSR005 (من حذف/متى/من معلّقة) · الضريبة التفصيلية (نسبة×فئة + KPIs) — كلها بفلاتر مدى تاريخ (`RangeBar` مشترك).
- **8) الفواتير المعلّقة + الدفع المتعدد:** كانت مربوطة سابقاً (HeldBills drawer + PaymentDialog) — تحقّقنا وبقيت كما هي، مع توسعة الدفع المتعدد بالنقاط/الكوبون أعلاه.
- **أنواع جديدة (`shared/lib/types.ts` +377 سطراً):** ShiftCountDto/SettleShiftDto/ShiftSettlement/DenominationLine · PointsLedgerRow/LedgerEntryWithBalance/CustomerLedgerView/LoyaltySummary · CreditBillRow/CreditBillsView/CollectDto/CollectResult · CreateAdmin{User,Machine}Dto/RolePermission · ItemPricesView/ItemUnitsView/CategoryNode/ScannedBarcode · SlowMovingRow/ProfitReportRow/ComparisonReport/ItemMovementReport/AuditReportRow/VatDetailedRow · `ShiftStatus` += SETTLED · `PaymentMethod` += POINTS/COUPON.
- **i18n:** ~120 مفتاحاً عربياً جديداً (recon.count/settle، loyalty، credit، adminw، catalog، reports2، payMulti.points/coupon) — وسدّت فجوة قديمة: أقسام `held/payMulti/recon/priceCheck` كانت مستعملة في الكود وغير موجودة في `common.json` أصلاً (كانت تعرض المفاتيح الخام!).
- **النشر:** `npm run build` (tsc -b صفر أخطاء) ✅ → `sudo cp -r dist/* /var/www/motech-pos/` ✅ → الدومين 200 والباندل الجديد `index-BNaiUYo9.js` يحمل النصوص الجديدة ✅ · endpoints الجديدة كلها ترد 401 RFC9457 عبر الدومين بلا توكن (محميّة وموجّهة) ✅.
- **قيد معروف:** proof تفاعلي كامل بالمتصفح يتطلب اعتماديات الدخول المدوّرة (P0 أخرجها من الوثائق عمداً) — البناء والربط أُثبتا بالكود والباندل والـ401 الصحيح.

### 2026-07-04 — 📋 الجرد الفعلي (POST018): جلسات جرد + فروقات + اعتماد
module الجرد اكتمل backend (شاشة POST018 «جرد الآلات» — مطابقة العدّ الفعلي مع النظام):

- **V015 — `MOTECH_POS.STOCK_COUNTS` + `STOCK_COUNT_LINES`:** رأس الجلسة (مخزن، DRAFT/POSTED، منشئ/معتمِد، `POST_IDEMPOTENCY_KEY` UNIQUE) + سطور (صنف، اسم عربي snapshot، كمية النظام من `MV_ITEM_AVL_QTY` لحظة الإدخال، العدّ الفعلي، `DIFF_QTY = العدّ − النظام`، UQ صنف×جلسة). CHECK يضمن أن POSTED يحمل معتمِداً وتاريخاً ومفتاحاً. الجرد **سجل تدقيق** — لا يلمس مخزون Onyx (كما IAS_POS_AUD_ITEM).
- **Endpoints (JWT):** `POST /inventory/counts` (بدء جلسة لمخزن) · `POST /inventory/counts/{id}/lines` (إدخال/إعادة إدخال عدّ صنف — MERGE upsert، الفرق يُحسب server-side) · `GET /inventory/counts` (فلتر status) + `/{id}` (سطور بأسماء عربية + عدّاد فروقات) · `POST /inventory/counts/{id}/post` (**supervisor/admin فقط** + Idempotency-Key إلزامي — يجمّد الجلسة نهائياً؛ replay يعيد نفس الجلسة، مفتاح جديد على POSTED → 409، جلسة فارغة → 422). أخطاء RFC 9457 جديدة: stock-count-not-found/posted/empty. ⚠️ StockCountController مسجّل قبل InventoryController كي لا يبتلع `/inventory/:code` مسار counts.
- **proof حي (curl :3000):** بدء جرد مخزن 2 → DRAFT ✅ · عدّ 1100040005 (نظام 12، عدّ 10 → فرق −2) باسم عربي «مزيل الشعر الفيحا…» ✅ · إعادة العدّ 11 → فرق −1 بلا سطر مكرر ✅ · صنف مطابق → فرق 0 ✅ · اعتماد supervisor → POSTED (3 سطور، فرقان) ✅ · replay نفس المفتاح → replayed:true ✅ · مفتاح جديد → 409 ✅ · إدخال سطر بعد الاعتماد → 409 ✅ · كاشير يعتمد → 403 ✅ · SELECT من STOCK_COUNTS/LINES يؤكد الصفوف والفروقات ✅.
- **حالة عامة:** build ✅ · **147 unit تمر** (منها 3 جديدة للجرد: variance+upsert، idempotent post+تجميد، جلسة فارغة/404) ✅ · pm2 online ✅.

### 2026-07-04 — 🧪 suite E2E شامل (Playwright) — المسارات الحرجة عبر الواجهة الحيّة
- **`frontend/e2e/` + `playwright.config.ts` + `npm run test:e2e`** (@playwright/test 1.61، system Chrome، serial، SW محجوب حتى لا يقدّم كاشاً قديماً). يعمل ضد النظام المنشور `https://nuugneol.gensparkclaw.com` (قابل للتبديل بـ`E2E_BASE_URL`). الاعتماديات تُقرأ من خارج الريبو (`state/motech-pos-credentials.json` — لا أسرار في git، وartifacts في gitignore).
- **10 اختبارات — 10/10 تمر على النظام الحي** (~22 ثانية)، كل واحد يتحقق من نتيجة فعلية مرسومة/محسوبة server-side:
  1. دخول بكلمة سر خاطئة → رسالة «اسم المستخدم أو كلمة المرور غير صحيحة» ويبقى على /login.
  2. دخول cashier1 → /pos وشريط الوردية يعرض هوية الكاشير.
  3. **دورة البيع الكاملة:** فتح وردية (cashierNo معزول لكل تشغيل 500–989) → بحث «ارز» في الكتالوج الحي → إضافة للسلة (الإجمالي = سعر الكتالوج) → دفع نقدي → اعتراض `POST /bills` والتحقق أن `billNo` حقيقي و`netAmt` يطابق → شاشة النجاح تعرض رقم الفاتورة → **طباعة** (مسار window.print يكتمل بلا خطأ) → «بيع جديد» يفرّغ السلة.
  4. **المرتجع:** فتح فاتورة البيع أعلاه بالرقم → تحميل بنودها من الخادم → كمية 1 → تأكيد → `rtBillNo` من `POST /returns` يظهر في الواجهة و`originalBillNo` يطابق.
  5. **التصفية (X-report + POST013):** إدخال النقد المعدود → «احتساب» → «الفرق · فائض/عجز/مطابق» يظهر + عدد فواتير ≥1 → عدّ بالفئات (9×1000) → «حفظ العدّ» → «حُفظ العدّ».
  6. **إقفال الوردية:** نقد محسوب → confirm → «تم إقفال الوردية — الفرق: …» وعودة زر «فتح وردية».
  7. **اعتماد التصفية:** supervisor1 على الوردية المقفلة (lastShiftId) → «اعتماد التصفية (نهائي)» → SETTLED («التصفية معتمدة» + «مصفّاة» + «اعتُمدت في»).
  8. **التقارير:** admin → التقرير اليومي KPIs بأرقام حقيقية >0 + صفوف جدول + تبويب طرق الدفع يعمل.
  9. **RBAC ثلاثي:** إخفاء روابط nav المميزة عن الكاشير + قفز /admin و/reports و/settings إلى /pos + **403 فعلي من API** على /admin/users بتوكن الكاشير.
  10. **الإعدادات:** admin يرى روابط الإدارة/الإعدادات → GET /settings يعبّئ «اسم المحل» بقيمة ERP حقيقية + كل الأقسام + زر الحفظ.
- **ملاحظة تشغيلية مكتشفة أثناء العمل (ليست باغ كود):** backend في pm2 كان بعدّاد 83 إعادة تشغيل — انهيارات قديمة سببها `Cannot find module './config/config.module'` بعد rebuild ناقص لـ`dist/` (سباق نشر). أثناء إحدى دورات إعادة التشغيل رجع الدومين 502 مؤقتاً وفشل الاختبار الأول. الآن online والاختبارات كلها خضراء — يُوصى بمراقبة العدّاد وإضافة `pm2 save` + build ذري (build إلى مجلد مؤقت ثم swap).
- **باغات وظيفية في src:** لم يُكتشف أي باغ وظيفي في المسارات العشرة — كل التدفقات سلكت كما هو مصمم على النظام الحي.

### 2026-07-04 — ⚙️ GET /settings/all — كل الـ179 إعداد مصنّفة (backend)
- **`SETTINGS_CATALOG`** (domain/settings-catalog.ts): كل الـ179 عمود من `YSPOS23.IAS_PARA_POS` كثوابت في الكود (column/type/group من docs/SETTINGS_CLASSIFIED.txt) + **70 وصفاً عربياً** لأهم الإعدادات (الترقيم/الباركود، الطباعة، الضريبة، النقاط، البطاقات، الكوبونات، الورديات…).
- **repository:** `readLiveSettings` صار يقرأ **كل الأعمدة** (`SELECT *` من الصف الوحيد) بدل قائمة الـ24 اليدوية — الشكل المصنّف يعرضها كلها والـprojection المكتوب يلتقط ما يحتاجه.
- **`GET /api/v1/settings/all`** (JWT): يرجّع الـ179 مصنّفة في 10 مجموعات `{key, value, liveValue, type, group, overridden, description?}` — overlay يفوز (بمفتاح العمود الخام أو المفتاح الكانوني camelCase) + meta فيها total/groupCounts/overrideCount. مجموعات: behavior 91 · numbering 15 · printing 29 · points 13 · cards 10 · coupons 9 · customers 5 · currency 3 · messages 3 · tax 1.
- **`PUT /api/v1/settings/:key`** (admin فقط): يقبل أي مفتاح من الـ179 (أو الكانوني — يُخزَّن تحت اسم العمود) · `value:null` يرجع للقيمة الحية · مفتاح مجهول → 400/404. `PUT /settings` الدفعي يقبل الآن أعمدة الكتالوج أيضاً.
- **proof حي:** GET /all → total:179 وgroupCounts صحيحة ✅ · PUT DAY_NOTIFY_HUNG_BILL=5 (admin) → overridden:true وGET /all يعكسها ✅ · نفس الـPUT بتوكن كاشير → **403** ✅ · value:null → رجعت للقيمة الحية ✅ · مفتاح مزيف → 400 ✅.
- **اختبارات:** +3 unit (تصنيف 179/10 مجموعات + أوصاف عربية · saveOne خام/كانوني · مفتاح مجهول 404) — settings suite 7/7 ✅ · build ✅ · pm2 online ✅. (فشل golden ×2 موجود مسبقاً — 401 login في بيئة التكامل، غير مرتبط.)

### 2026-07-04 — 🎛️ موجة UI (Fable 5): جرد + لوحات مفاتيح + مستويات أسعار + returns-window + defaults
أربع حزم backend جاهزة رُبطت بالواجهة (RTL عربي، TanStack Query، RFC 9457، RBAC، تجاوب):

- **1) الجرد الفعلي POST018 — تبويب «الجرد الفعلي» في `InventoryPage`:** قائمة جلسات الجرد (فلتر مسودة/معتمد، عدّادات أصناف/فروقات ملوّنة) → حوار «بدء جرد جديد» (اختيار مخزن من `GET /warehouses` + ملاحظة) → `POST /inventory/counts` يفتح تفاصيل الجلسة مباشرة. حوار التفاصيل: صف إدخال (كود صنف + عدّ فعلي، Enter يسجّل) → `POST …/lines` (الفرق server-side؛ إعادة إدخال نفس الصنف upsert) + جدول السطور (اسم عربي، كمية النظام، العدّ، **الفرق ± ملوّن**، وقت العدّ) + زر «اعتماد الجرد (نهائي)» يظهر لـsupervisor/admin فقط مع confirm → `POST …/post` بـIdempotency-Key (uuid). POSTED يعرض شارة «معتمد» + من/متى ويخفي الإدخال. ملفات: `stock-counts.api.ts` + `StockCountsTab.tsx` + `StockCountDetailDialog.tsx`.
- **2) لوحات المفاتيح POSI002/003 — صفحة `/keypads` جديدة (nav لكل الأدوار، الكتابة supervisor/admin):** تبويبات اللوحات مع عدّاد مفاتيح + إنشاء/تعديل (اسم عربي/إنجليزي/تعطيل) → `POST/PUT /keypads`. تفاصيل اللوحة = **شبكة أزرار لمسية** (2→6 أعمدة حسب الشاشة، لون المفتاح خلفية، الاسم/العنوان + السعر الحي المحلول من ERP) مجمّعة بـgrpNo/grpName. «ربط صنف»: بحث حي في الكتالوج (useItemSearch) → اختيار صنف + عنوان اختياري + اسم مجموعة + 6 ألوان preset → `POST /keypads/{no}/keys`؛ حذف مفتاح من الزر نفسه → `DELETE …/keys/{id}`. ملفات: `features/keypads/` (api + KeypadsPage).
- **3) مستويات الأسعار POS_ITM_PRICE — `ItemCatalogDialog`:** فوق جدول المستويات أُضيف **مُنتقي «اختيار مستوى السعر»** (مستوى × وحدة) يستدعي `GET /items/{code}/prices/{levNo}?unit=` ويعرض السعر المحلول حياً (hook جديد `usePriceAtLevel` في item-extras.api).
- **4) تقرير نافذة الإرجاع POSR011 — تبويب `returnsWindow` في `ReportsPage` (28 تبويباً):** KPIs (عدد المرتجعات/خارج النافذة/إجمالي المسترد) + جدول (فاتورة الإرجاع، الأصلية، العميل، الكاشير، ساعات التأخير، شارة داخل/خارج/غير معروف) + تنبيه «غير مفعّلة» عند PRD_BACK_HOUR=null + فلتر مدى تاريخ.
- **5) الافتراضيات المرقّمة POSS005 — تبويب «الافتراضيات المرقّمة» في `SettingsPage`:** جدول (رقم STNG_NO، الوصف، القيمة قابلة للتحرير inline بحفظ فوري on-blur → `PUT /settings/defaults`، شارة «معدّل» + زر إرجاع للقيمة الحية `value:null`) — admin فقط للكتابة.
- **أنواع جديدة:** StockCountHeader/Detail/Line/Status · KeypadRow/KeypadKeyRow/KeypadDetail/Upsert+AddKey DTOs · ReturnWindowRow/ReturnsWindowReport · DefaultSetting · PriceAtLevel.
- **i18n:** أقسام عربية جديدة `stockCount` (28 مفتاحاً) و`keypads` (27) + `reports2.returnsWindow` (13) + `settings.defaults` + `catalog.pickLevel` + `nav.keypads` + `inventory.tab.counts`.
- **proof حي (curl :3000):** بدء جرد مخزن 2 → عدّ 1100040005 (نظام 12/عدّ 9 → فرق −3 باسم عربي) → اعتماد POSTED ✅ · إنشاء لوحة 2 + ربط صنف (اسم/سعر 250 محلولان) + حذف المفتاح + تعطيل اللوحة ✅ · `prices/1` → 250/حبه ✅ · returns-window يرجع صفوف مرتجعات حقيقية بـdelayHours ✅ · defaults: PUT no1=2 → overridden:true ثم value:null → رجعت للحية ✅.
- **النشر:** `npm run build` (tsc -b صفر أخطاء) → `sudo cp -r dist/* /var/www/motech-pos/` → الدومين 200 والباندل `index-DVqCP9a-.js` يحمل النصوص الأربعة الجديدة ✅ · endpoints الأربعة ترد 401 RFC9457 عبر الدومين بلا توكن ✅ · **E2E: 10/10 تمر على النشر الجديد** (19 ثانية، لا انحدار) ✅.

### 2026-07-04 — 🖥️ موجة H UI (Fable 5): ربط الـ5 modules الجديدة بالواجهة — أوامر البيع + استلام/صرف مخزني + جرد المردود + تنبيهات الدخول
خمس شاشات جديدة (RTL عربي، TanStack Query، RBAC، loading/error/empty، تجاوب mobile/tablet/desktop) تربط backend الموجة H المُثبت:

- **1) أوامر البيع POST024 — `/sales-orders` (كل الأدوار):** قائمة بفلتر حالة (مفتوح/محوّل/ملغى) + إنشاء أمر (عميل اختياري + مرجع + انتهاء + أسطر أصناف بكمية) → `POST /sales-orders` (الخادم يلقط الاسم العربي والسعر) + **«تنزيل في فاتورة»** بضغطة (confirm → `POST /:id/convert` بـIdempotency-Key uuid وcashierNo/machineNo من إعدادات الطرفية — يتطلب وردية مفتوحة، شريط نجاح يعرض رقم الفاتورة الحقيقي) + إلغاء OPEN + حوار تفاصيل (أسطر بسعر استرشادي + مرجع الفاتورة/الإلغاء). ملفات: `features/sales-orders/` (api + 3 مكوّنات).
- **2+3) الاستلام المخزني POST029 `/stock-receipts` + التحويل الصادر POST028 `/stock-issues`:** بنية مشتركة `features/stock-docs/` — `StockDocShared.tsx` (قائمة/إنشاء/تفاصيل معمّمة بـkind) + صفحتا wrapper. قائمة بفلتر (مسودة/معتمد/ملغى) بأسماء مخازن عربية محلولة من `GET /warehouses`، إنشاء مستند (مخزن مستلِم/مصدر + مخزن آخر اختياري + أسطر) → DRAFT مع تلميح «يعتمده المشرف»، حوار تفاصيل (أصناف بأسماء عربية + وحدة) وزر **اعتماد** يظهر لـsupervisor/admin فقط (confirm يوضح الأثر الفعلي على المخزون → `POST /:id/post` بـIdempotency-Key؛ حارس التوفر 422 يظهر كرسالة RFC 9457 عربية) + إلغاء DRAFT.
- **4) جرد المردود POST022 — `/return-counts` (كل الأدوار، الاعتماد supervisor/admin):** جلسات بفلتر حالة + «جلسة جرد جديدة» (آلة — افتراضياً من إعدادات الطرفية — + يوم المردودات + مرجع/ملاحظة) → حوار الجرد: صف إدخال (كود صنف + معدود فعلياً، Enter يسجّل) → `POST /:id/lines` (النظامي يُسحب حياً من فواتير المردود الحقيقية) + جدول نظامي/معدود/**فرق ± ملوّن** + اعتماد يجمّد الفروقات. ملفات: `features/return-counts/`.
- **5) تنبيهات الدخول POS_ALRT_SCR — قناتان:** **`PendingAlertsBanner`** في `AppLayout` تحت الهيدر — يعرض لكل مستخدم مسجَّل التنبيهات غير المُقرّة (`GET /alerts/pending`) كـbanner أصفر بعنوان+نص وزر **«علمت»** → `POST /:id/ack` (idempotent لكل مستخدم؛ يختفي فوراً). + **`AlertsAdminPage`** `/alerts` (supervisor/admin في NAV والراوتر): قائمة كل التنبيهات (فترة العرض، نشط/موقوف) + إنشاء تنبيه (عنوان/نص/من–حتى) + تفعيل/إيقاف بضغطة (`PUT /:id`).
- **الربط:** 5 مسارات جديدة في `router.tsx` (alerts خلف RequireRole PRIVILEGED) + 5 مداخل NAV بأيقونات (ClipboardList/PackagePlus/PackageMinus/PackageSearch/Megaphone) حسب الدور + أنواع جديدة في types.ts (SalesOrder*/StockReceipt*/StockIssue*/StockDocLine/ReturnCount*/PosAlert + DTOs) + i18n عربي: أقسام `salesOrders` (44 مفتاحاً)، `stockDocs` (مشترك + receipts/issues)، `returnCounts` (38)، `alerts` (23) + 5 مفاتيح nav.
- **proof حي (curl عبر الدومين + متصفح CDP):** أمر بيع «عميل واجهة» → convert → **فاتورة حقيقية 260700300000412** ✅ · استلام GRN-UI-01 → post → POSTED docNo=4 ✅ · صرف ISS-UI-01 → POSTED docNo=4 · صرف 999999 → **422 حارس التوفر** ✅ · جرد مردود آلة1 يوم 2026-07-03: صنف 1020010009 نظامي 5/معدود 4 → **فرق −1** → POSTED ✅ · تنبيه «تنبيه واجهة الموجة H» → pending لدى cashier1 → ack → القائمة فارغة ✅ · **RBAC:** cashier ينشئ تنبيهاً → 403 · cashier يعتمد استلاماً → 403 ✅ · لقطات المتصفح: الشاشات الخمس ترسم RTL بشارات حالة ملوّنة وأسماء مخازن عربية وbanner التنبيه ظاهر، بلا مفاتيح i18n خام (audit بالصور).
- **النشر:** `npm run build` (tsc -b **صفر أخطاء TS**، oxlint 0 errors) → `sudo cp -r dist/* /var/www/motech-pos/` → الدومين 200 ✅ · **E2E: 10/10 تمر على النشر الجديد** (19.5 ثانية — لا انحدار) ✅. ملاحظة: PWA service worker القديم قد يقدّم bundle قديم حتى أول تحديث — الاختبار حجب SW، والمستخدمون يلتقطون التحديث تلقائياً عند إعادة الزيارة (generateSW).

### 2026-07-06 — 🖥️✨ شاشة العميل الثانية POSADVS_SCND (Fable 5) — Customer-Facing Display حيّة
ميزة حديثة تتفوّق على Onyx (الأصل كان سطراً نصياً على قارئ عميل — عندنا شاشة كاملة حيّة):

- **feature جديد `features/customer-display/`** + مسار `/customer-display` (خارج AppLayout — بلا هيدر/قائمة، ملء الشاشة الثانية، chrome-less، lazy chunk).
- **المزامنة الحيّة (بلا backend):** `channel.ts` بروتوكول BroadcastChannel نفس المتصفح (`motech-pos-customer-display`) برسائل مُنمّطة: `cart` (snapshot أسطر+إجماليات) · `sale-done` (رقم فاتورة+مدفوع+باقي+QR TLV) · `new-sale` · `hello` (late-join: العرض المفتوح متأخراً يطلب الحالة فيرد الكاشير فوراً). الكاشير ينشر عبر `useCustomerDisplaySync` — اشتراك مباشر في zustand `useCart.subscribe` فيلتقط **كل** مسارات التعديل (سكانر/شبكة أصناف/كميات/استئناف معلّقة/تفريغ) بلا لمس أي call-site.
- **الشاشة (RTL، خط كبير، متدرّج داكن أنيق):** 3 حالات — **ترحيب** (شعار متجر من store-config + ساعة حيّة + «أهلاً وسهلاً») → **فاتورة جارية** (جدول أصناف: اسم عربي+وحدة/كمية موزونة 3 عشرية/سعر/إجمالي سطر، آخر سطر مُبرز، auto-scroll، شريط سفلي: عدد أصناف+خصم+ضريبة + **الإجمالي المطلوب بخط 6xl/7xl**) → **شكر بعد الدفع** (شكراً لزيارتكم + رقم الفاتورة + الإجمالي/المدفوع/الباقي + **QR الفاتورة الإلكترونية** ZATCA-TLV مُصيّر بـqrcode). حماية: أثناء شاشة الشكر تتجاهل echo تفريغ السلة؛ «بيع جديد» يعيدها للترحيب.
- **زر «شاشة العميل»** في هيدر سلة PosPage (MonitorSmartphone) يفتح النافذة الثانية (window.open named — لا تتكرر). SaleSummary ينشر `sale-done` في المسارين: البيع المباشر (من ReceiptModel — نفس qrPayload المطبوع) والدفع متعدد الطرق (onSettled يبني TLV مباشرة).
- **proof حي بالمتصفح (CDP، عبر الدومين):** login cashier1 → زر «شاشة العميل» فتح `/customer-display` فعلياً → العرض «أهلاً وسهلاً» → إضافة صنفين في POS (ارز الديوان 7,800 + ارز الفخامه 3,800) → **ظهرا فوراً في العرض** (جدول صفّان، الإجمالي ١١,٦٠٠) → كبس الصنف الأول ثانيةً → **الكمية قفزت لـ2 والإجمالي ١٩,٤٠٠ لحظياً** → «دفع نقداً» → فاتورة حقيقية **260700100000422** → العرض انقلب لشاشة الشكر برقم الفاتورة + المدفوع ١٩,٤٠٠ + **QR ظاهر** ✅ (لقطات: pos-audit-shots/proof-pos.png، proof-display.png، proof-display-done.png).
- **i18n:** `pos.customerDisplay` («شاشة العميل»). **build:** tsc -b صفر أخطاء ✅ → نشر `/var/www/motech-pos/` → الدومين 200 و`/customer-display` 200 ✅. تحديث SCREENS_GAP_FINAL: POSADVS_SCND → ✅.
