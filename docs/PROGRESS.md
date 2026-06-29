# 📈 سجل تقدّم Motech POS
> يُحدّث بعد كل خطوة. الأحدث أعلى. (ضد النسيان — يُقرأ كل جلسة)

## 2026-06-29
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
- المرحلة الحالية: **2 (Backend NestJS) — قيد التنفيذ:** الإقلاع مكتمل (NestJS + Oracle حي + bills/shifts + health + golden 100%). التالي catalog/auth/جانب الكتابة.
- المعمارية معتمدة: Modular Monolith + Clean/Hexagonal + Tactical DDD (ADR-001..005 في docs/adr/). التصاميم الكاملة في docs/ARCHITECTURE.md + DATA_MODEL.md + API_DESIGN.md + SCREENS_PRIORITY.md + PROJECT_STRUCTURE.md.
- القاعدة: حاوية oracle12 (YSPOS23، 118 جدول) شغّالة محلياً.
- ✅ **فُكّت ووُثِّقت 80 شاشة POS كاملة** (المرحلة 0-أ). راجع `docs/screens/INDEX.md`.
- الباقي للمرحلة 0: أجساد حِزَم DB (POSLIB/IAS_*_PKG via ALL_SOURCE) + Visual RE للحقول/التسميات + شاشات غير-POS عند الحاجة.
