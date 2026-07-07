# VERIFICATION — 2026-07-08 (تحقّق مستقل قراءة-فقط)

> **المنهج:** proof-not-assumption — كل بند أُثبت بأمر حي أو لقطة شاشة. لم يُعدَّل أي كود.
> **الوقت:** 2026-07-08 01:27–01:40 CEST · **الفرع:** master @ `6b81b84`

## الخلاصة

| # | البند | الحكم | الدليل |
|---|-------|:-----:|--------|
| 1 | البناء (tsc backend + frontend) | ✅ PASS | كلاهما exit=0 بلا أخطاء |
| 2 | الاختبارات الوحدوية | ✅ PASS | **348/348 passed** (52 ملفاً، 8.98s) — مطابق للمتوقع |
| 3 | الحيّ (health/domain/login) | ✅ PASS | health ok + db read/write connected · دومين 200 · login 200 + mp_at/mp_rt |
| 4 | الأمان (Swagger/CSP/HSTS/RBAC) | ✅ PASS | docs=404 · CSP+HSTS موجودان · endpoints محمية بلا توكن = 401 |
| 5 | القائمة المحاسبية (7 مجموعات) | 🟡 **PARTIAL** | المجموعات تعمل **في drawer الجوال فقط** — الشريط الجانبي للديسكتوب/التابلت ما زال مسطّحاً (تفصيل أدناه) |
| 6 | دورة بيع كاملة حية (cashier) | ✅ PASS | فاتورة حقيقية **`260700100000436`** POSTED — 7,800 ر.ي، مؤكّدة من الـAPI بعد البيع |
| 7 | git + migrations | ✅ PASS | شجرة نظيفة، 0 unpushed، V001→V033 (33 ملفاً) بلا تكرار |

---

## 1) البناء — PASS

```
cd backend  && npx tsc -b   → exit 0 (صفر أخطاء)
cd frontend && npx tsc -b   → exit 0 (صفر أخطاء)
```

## 2) الاختبارات — PASS (348)

```
Test Files  52 passed (52)
     Tests  348 passed (348)
  Duration  8.98s
```

## 3) الحيّ — PASS

- `GET /health` →
  `{"status":"ok","db":{"read":"connected","write":"connected"},"schema":{"read":"YSPOS23","write":"MOTECH_POS"}}`
- `https://nuugneol.gensparkclaw.com/` → **200**
- `POST /api/v1/auth/login` (cashier1) → **200** مع
  `Set-Cookie: mp_at=…` + `Set-Cookie: mp_rt=…`

## 4) الأمان — PASS

- Swagger: `GET /api/v1/docs` → **404** ✅
- رؤوس `curl -I` للدومين:
  - `content-security-policy: default-src 'self'; script-src 'self'; …` ✅
  - `strict-transport-security: max-age=15552000; includeSubDomains` ✅
- RBAC بلا توكن: `GET /api/v1/auth/me` → **401** · `GET /api/v1/shifts/current` → **401** ✅
  (ملاحظة: `/api/v1/users` يعيد 404 لأن المسار غير موجود — endpoints الإدارة تحت `/api/v1/admin/*`)

## 5) القائمة المحاسبية — 🟡 PARTIAL (فجوة حقيقية)

**ما يعمل (مُثبت حياً بلقطات):** في **drawer الجوال** (viewport 390px):

- **admin** يرى الـ7 مجموعات كاملة:
  `لوحة التحكم · المبيعات ▾ · الصندوق والوردية ▾ · المخزون ▸ · العملاء والولاء ▸ · التقارير · الإدارة والنظام ▸`
  — 5 منها أزرار قابلة للطي (`aria-expanded`)، ومجموعتا العنصر-الواحد (لوحة التحكم/التقارير) تُعرضان كسطر مباشر (سلوك مقصود في الكود).
  الافتراضي: المبيعات + الصندوق مفتوحتان، الباقي مطوي — مطابق للخطة.
  لقطات: `pos-audit-shots/verify-nav-admin-drawer.png` + `verify-nav-admin-drawer-expanded.png`
- **cashier1** يرى المسموح فقط (RBAC محفوظ): `لوحة التحكم · المبيعات ▾ · الصندوق والوردية ▾ · المخزون ▸ (عناصره المسموحة) · بطاقات مسبقة الدفع` — **لا** تقارير ولا إدارة ولا عملاء ✅
  لقطات: `verify-nav-cashier-drawer.png` + `verify-nav-cashier-drawer-expanded.png`

**الفجوة:** على **الديسكتوب (≥1024px) والتابلت** الشريط الجانبي ما زال **قائمة مسطّحة 28 عنصراً** بلا أي مجموعات.
- **دليل حي:** فتح الدومين بعرض 1440px بدور admin (بعد إلغاء SW ومسح الكاش) → صفر أزرار `aria-expanded` في `<aside>`، والقائمة نصّها المسطّح الكامل. لقطة: `verify-nav-admin-fresh.png`
- **سبب جذري (بالكود):** `AppLayout.tsx` سطر ~352: `<aside …><SidebarInner full={false} /></aside>` — وعرض المجموعات داخل `SidebarInner` مشروط بـ`full === true`، وهو لا يتحقق إلا في drawer الجوال (سطر ~366).
- **التعارض مع الخطة:** `docs/NAV_HIERARCHY_PLAN.md` §3-ب ينصّ صراحة: «القائمة الجانبية (**Desktop + Tablet**): كل مجموعة تظهر كسطر رأس … Chevron للطي/الفتح». رسالة الـcommit `6b81b84` تدّعي «7 collapsible sidebar sections» دون تقييدها بالجوال.
- **الأثر:** الهدف الأساسي (تقليل الضجيج البصري للقائمة الطويلة) غير محقق على الشاشة الأكثر استخداماً (ديسكتوب الكاشير).
- **الإصلاح المقترح (غير مُنفَّذ — مهمة قراءة فقط):** تمرير `full` حقيقي للـaside على lg (مثلاً `<SidebarInner full={isDesktop} />` أو فحص breakpoint داخلياً)، مع إبقاء rail التابلت مسطّحاً كما وثّق تعليق الكود.

## 6) دورة بيع حية — PASS

بدور cashier1 عبر CDP على الدومين الحقيقي:
1. login → `/pos` (وردية #18 مفتوحة، كاشير 12، آلة 1)
2. إضافة صنف: **ارز الديوان (10 كجم) 4قطم** `1010010004` — 7,800 ر.ي
3. «دفع نقداً» → `POST /api/v1/bills` → **201**
4. **الفاتورة: `260700100000436`** — status **POSTED**، netAmt **7800 YER**، line 1 × 7800، `issuedAt 2026-07-07T21:34:52Z`
5. تأكيد مستقل بعد البيع: `GET /api/v1/bills?machineNo=1&limit=5` → الفاتورة أول النتائج (7800، 2026-07-07T21:34:52) ✅

لقطات: `verify-sale-1-pos.png` → `verify-sale-4-after-pay.png`
(ملاحظة: زر «دفع نقداً» ينفّذ الدفع مباشرة بلا dialog تأكيد — الفاتورة صدرت من النقرة الأولى.)

## 7) git + migrations — PASS

- `git status --porcelain` → 0 أسطر (نظيفة، قبل كتابة هذا الملف)
- `git rev-list origin/master..master --count` → **0** unpushed
- آخر commit: `6b81b84 feat(nav): accounting-hierarchy grouping …`
- `db/migrations`: **33 ملفاً** V001→V033 متسلسلة، `uniq -d` على الأرقام = **0 تكرار**

---

## اللقطات المرجعية (كلها في `pos-audit-shots/`)

`verify-nav-admin-fresh.png` (ديسكتوب مسطّح — الفجوة) · `verify-nav-admin-drawer.png` / `-expanded.png` · `verify-nav-cashier-drawer.png` / `-expanded.png` · `verify-sale-1-pos.png` … `verify-sale-4-after-pay.png`
