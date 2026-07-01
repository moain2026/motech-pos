# 📈 سجل تقدّم Motech POS
> يُحدّث بعد كل خطوة. الأحدث أعلى. (ضد النسيان — يُقرأ كل جلسة)

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
