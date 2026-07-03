# 📈 سجل تقدّم Motech POS
> يُحدّث بعد كل خطوة. الأحدث أعلى. (ضد النسيان — يُقرأ كل جلسة)

## 2026-07-03
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
