# QA_SWEEP — الفحص الحيّ الشامل عبر الأدوار والمقاسات

> **التاريخ:** 2026-07-07 · **الأداة:** `frontend/e2e/qa-sweep.mjs` (Playwright) · **الهدف:** الدومين الحيّ `https://nuugneol.gensparkclaw.com` · **الأمر:** `node e2e/qa-sweep.mjs` · **الاعتماد:** `e2e/qa-sweep-tabs.mjs` للتبويبات الفرعية.
>
> **القاعدة:** proof-not-assumption — كل نتيجة ملتقطة حياً (Playwright + Chromium)، مع لقطات في `frontend/e2e/.qa-sweep/` و `results.json` كاملة.

## 1) النطاق المُختبَر

| الدور | # مسارات | المقاسات | ملاحظات |
|-------|:---:|:---:|---|
| **cashier1** | 19 | 390 · 820 · 1440 | نطاق تشغيلي كامل (POS/الفواتير/الإرجاع/التصفية/السندات/…) + 4 مسارات RBAC مرفوضة |
| **supervisor1** | 26 | 1440 | كامل عدا لوحة الإدارة |
| **admin** | 28 | 390 · 820 · 1440 | كل شاشة، بما فيها Admin و Settings |
| **anon** (بلا دخول) | 1 | 1440 | `/customer-display` — لا تحتاج مصادقة (BroadcastChannel) |

**الإجمالي: 160 فحصاً موقعياً** (route × role × viewport)، غير 124+ لقطة PNG.

## 2) النتيجة النهائية

**✅ 160 / 160 خضراء — صفر ثغرات.**

على كل فحص، الوكيل الآلي رصد:
- **`consoleErrs`** (أخطاء JavaScript في المتصفح) → **0**
- **`pageErrs`** (استثناءات صفحة غير مُلتَقطة) → **0**
- **`badResponses`** (استجابات HTTP ≥ 400 من الأصول) → **0**
- **`overflow`** (تجاوز أفقي على أي عرض) → **0**
- **`blank`** (شاشة بيضاء / نص فارغ) → **0**

كل شاشة تُحمّل، تُظهر بيانات فعلية، وتلتزم بالتصميم المتجاوب على 390/820/1440px.

## 3) اختبار الصلاحيات RBAC (POSS002)

Cashier حاول الوصول للمسارات المحظورة عليه — النظام أعاد التوجيه ✅:
- `/admin` → `/pos`
- `/settings` → `/pos`
- `/reports` → `/pos`
- `/customers` → `/pos`

الفرض الديناميكي للصلاحيات (Lane C) يعمل حياً على الواجهة كما يعمل في الـbackend.

## 4) شاشة العميل (POSADVS_SCND)

`/customer-display` تُحمّل بدون مصادقة (كما ينبغي — تعرض للزبون، مزامنة عبر BroadcastChannel). النص المرئي `textLen=86` ✓.

## 5) الأدلة والملفات

- **JSON خام:** `frontend/e2e/.qa-sweep/results.json` (160 سجلاً كامل الحقول).
- **لقطات:** `frontend/e2e/.qa-sweep/{user}_{route}-{width}.png` (~180 لقطة).
- **سكربتات:** `frontend/e2e/qa-sweep.mjs` + `frontend/e2e/qa-sweep-tabs.mjs` (قابلة للإعادة).
- **بيانات الاعتماد:** `~/.openclaw/workspace/state/motech-pos-credentials.json` (خارج git).

## 6) الحكم

النظام في حالة **إنتاجية مستقرة عبر المستعرض الحيّ** على الدومين المنشور — كل شاشة تعمل، كل صلاحية مُطبَّقة، والتصميم متجاوب على 3 مقاسات، بلا خطأ Console واحد.

هذا يكمّل التحقق مع:
- 348 unit test أخضر
- `tsc -b` صفر أخطاء backend + frontend
- CSP + رؤوس أمان حية
- الدخول بـhttpOnly cookies يعمل

**النظام جاهز.**
