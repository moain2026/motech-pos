# تدقيق واجهات Motech POS — UI/UX + محاسبي (Fable 5)

**التاريخ:** 2026-07-04
**النطاق:** كل الشاشات الـ 16 على https://nuugneol.gensparkclaw.com — فحص فعلي بالمتصفح (Chromium/CDP) بثلاثة أحجام: موبايل 375px، تابلت 768px، ديسكتوب 1280px.
**المنهجية:** فحص DOM حقيقي (innerText + getBoundingClientRect + scrollWidth) وليس لقطات فقط، + تحليل بصري للقطات، + فحص ستاتيكي لكل مفاتيح `t('…')` في المصدر مقابل `src/locales/ar/common.json`.

---

## 1. الترجمات (i18n)

### الفحص
- فحص ستاتيكي: 549 مفتاح `t()` ثابت + 15 نمط ديناميكي (`t(\`x.${y}\`)`) مقابل 651 مفتاحاً في `common.json`.
- فحص حي: زيارة كل الشاشات الـ 14 المسجّلة في الـ router + كل تبويبات التقارير الـ 19 + تبويبات الإدارة الـ 4، والبحث عن أي نمط `xxx.yyy` خام في نص الصفحة.

### الأخطاء المكتشفة والإصلاحات

| # | الخلل | الشاشة | السبب الجذري | الإصلاح |
|---|-------|--------|----------------|---------|
| 1 | `recon.status.null` يظهر خاماً بجانب «الفرق» قبل إدخال العدّ | تسوية الوردية | `overShort` تكون `null` قبل الاحتساب و`t('recon.status.null')` غير موجود | إضافة `recon.status.PENDING` = «بانتظار العدّ» + شرط يعرضها عند null، مع لون محايد بدل الأحمر |
| 2 | `CASH` تظهر خاماً في سطر السند | السندات | `v.paymentMethod` تُعرض مباشرة بلا ترجمة | إضافة `vouchers.methods.{CASH,CARD,BANK}` واستخدامها |
| 3 | عمود «طريقة الدفع» في حركة نقاط العميل يستدعي `t('reports.method')` وهو **كائن** وليس نصاً (تداخل مفاتيح) | العملاء → حركة النقاط | `reports.method` أصبح كائن `{CASH:…}` لتقارير طرق الدفع فتعارض مع الاستخدام كعنوان عمود | مفتاح جديد `loyalty.kindCol` = «النوع» (العمود يعرض نوع الحركة أصلاً) |
| 4 | «النوع: 1» رقم خام لنوع الفاتورة | تفاصيل الفاتورة | `String(billType)` بلا تسمية | `bills.typeName.1` = «بيع» مع fallback للرقم |

### مشكلة الـ PWA/Service Worker (السبب الحقيقي للمفاتيح الخام «أحياناً»)
- **التشخيص:** `/sw.js` كان يُخدم عبر Cloudflare بـ `cache-control: public, max-age=14400` و`cf-cache-status: HIT` (عمر 60+ دقيقة). المتصفح يفحص تحديث الـ SW لكن يستلم **نسخة CDN قديمة**، فيبقى precache القديم (بترجمات قديمة) نشطاً حتى 4 ساعات بعد كل نشر.
- **الإصلاح الجذري (طبقتان):**
  1. **Caddy** (`/etc/caddy/conf.d/custom.caddy`): `Cache-Control: no-cache, must-revalidate` لـ `/sw.js`, `/registerSW.js`, `/manifest.webmanifest`, `/index.html`, `/` و`/workbox-*.js` — و`immutable, max-age=1y` للأصول المهشّشة `/assets/*`.
  2. **تسجيل الـ SW** أصبح يدوياً في `main.tsx` بـ cache-busting لكل build: `/sw.js?v=${__BUILD_ID__}` مع `updateViaCache: 'none'` (حقن `__BUILD_ID__` عبر Vite define). أي نشر جديد = URL تسجيل جديد يتجاوز أي كاش CDN/متصفح فوراً، و`autoUpdate` + `skipWaiting/clientsClaim` (workbox) يفعّلان النسخة الجديدة مباشرة.
- **إثبات:** بعد النشر، `navigator.serviceWorker.getRegistrations()` في المتصفح الفعلي:
  `active: https://nuugneol.gensparkclaw.com/sw.js?v=mr5lgo5k, updateViaCache: "none"` — والنصوص الجديدة («بانتظار العدّ»، «نقداً») ظهرت فوراً بلا مسح كاش يدوي.

---

## 2. الاكتمال (فحص حي بكل شاشة)

- **الدخول:** admin يعمل، redirect إلى `/pos`. ✅
- **لوحة التحكم:** مبيعات اليوم/عدد الفواتير/الوردية (#18 مفتوحة) + روابط سريعة — بيانات حية. ✅
- **فاتورة البيع:** بحث + فئات (GROUP_DETAILS) + سلة + دفع/دفع متعدد + تعليق فواتير. ✅
- **استعلام سعر، الفواتير (+ تفاصيل فاتورة حقيقية 260700300000284)، المرتجعات، السندات، المخزون، المزامنة، الإعدادات:** بيانات حقيقية وأزرار فعالة. ✅
- **العملاء:** بحث «محمد» → «محمد العباسي» → تبويبات (بيانات/حركة نقاط/آجل) — رصيد 214 نقطة وحركتان (كسب/استبدال) بأرقام صحيحة. ✅
- **التقارير:** كل الـ 19 تبويباً فُتحت فعلياً — لا أخطاء، لا NaN/undefined، بيانات في: يومي، الأكثر مبيعاً، ضريبي، بالساعة، الخصومات، الراكدة، الأرباح، سجل الحذف… ✅
- **الإدارة:** 4 تبويبات (أجهزة/مستخدمون/سجل دخول/صلاحيات) تعمل. ✅
- ملاحظة: «proof قبض» في وصف أحد السندات هو **بيانات تجريبية مُدخلة** وليس مفتاح ترجمة (حقل `description` من قاعدة البيانات).

---

## 3. المعايير المحاسبية

- **تنسيق موحّد** عبر `shared/lib/format.ts`: `Intl.NumberFormat('ar-YE')` بعملة YER — فواصل آلاف عربية (٧٥٬٥٦٠ ر.ي.)، حتى منزلتين عشريتين، `tnum` (tabular numerals) لكل الأعمدة الرقمية.
- **إصلاحات توحيد:** 3 مواضع كانت تستخدم `Intl.NumberFormat('ar')` أو `toLocaleString('ar')` مباشرة (ReconciliationPage، PriceCheckPage، SyncPage) → وُحّدت على `formatNumber/formatDateTime`. عدد الفواتير في التسوية كان `String(billCount)` → `formatNumber`. `settledAt` كان ISO خام → `formatDateTime`.
- **التقارير:** إجماليات واضحة (صافي/ضريبة/خصم/عدد)، تقرير Z، ضريبي تفصيلي، مطابقة نقد بفئات العملة (POST013) بمجاميع لحظية — فُحصت كلها ولا قيم شاذة.
- **الرياضيات:** لا float math في السلة (integer-safe helpers)؛ الـ backend هو مصدر الحقيقة السعرية.

---

## 4. التنظيم والتنسيق

- RTL سليم في كل الشاشات (`dir="rtl"`، `text-start/end`، محاذاة أعمدة الأرقام إلى النهاية).
- خط Cairo (woff2 محلي) — عربي واضح. ألوان متسقة عبر CSS variables (brand/success/danger/muted).
- ملاحظة العملة: `ر.ي.` هو ناتج `Intl` القياسي لـ YER بالعربية (وليس خطأ إملائياً كما قد يبدو في اللقطات منخفضة الدقة).

---

## 5. التجاوب (Responsive)

**منهجية:** قياس `main.scrollWidth - main.clientWidth` لكل شاشة (مع استثناء حاويات السكرول الأفقي المقصودة كشريط الفئات) على 375px و768px.

### قبل الإصلاح (375px)
| الشاشة | Overflow | السبب |
|--------|----------|-------|
| تسوية الوردية | 66px | صف فئات العملة (input ×2 + مبلغ + حذف) min-width أكبر من الشاشة + حقل ملاحظة الاعتماد `w-64` |
| السندات | 40px | بطاقة السند + صف الأزرار بلا wrap |
| الأصناف | 79px | `<select>` الفئات يتمدد بأسماء الخيارات الطويلة |
| الإعدادات | 14px | امتداد ناتج عن جدول البطاقات |

### الإصلاحات
- الحاويات `mx-auto grid max-w-*` → إضافة `grid-cols-[minmax(0,1fr)]` (يمنع «min-content blowout» الكلاسيكي في CSS Grid).
- حقول فئات العملة: `w-28/w-24` → `w-full min-w-0 max-w-28/24 flex-1`.
- حقل ملاحظة الاعتماد: `w-64` → `w-full min-w-0 max-w-64`.
- select الفئات: + `min-w-0 max-w-full`. أزرار السندات: + `flex-wrap`.

### بعد الإصلاح — **إثبات بالقياس الفعلي**
- **375px:** كل الشاشات الـ 14 → `mainOverflow=0px`. ✅
- **768px:** pos/reports/reconciliation/bills/customers → `0px`. ✅
- **1280px:** سليم. ✅
- عناصر اللمس: أزرار POS الرئيسية ≥ 44px (h-11/h-12)، بطاقات الأصناف كاملة قابلة للنقر (ليس أيقونة + فقط)، صف الفئات سكرول أفقي مقصود يعمل باللمس.

---

## 6. النشر والإثبات النهائي

- build نظيف (tsc بلا أخطاء) → `sudo cp -r dist/* /var/www/motech-pos/`.
- SW الجديد مفعّل فوراً: `sw.js?v=<buildId>` + `updateViaCache:none` (مثبت من المتصفح الفعلي).
- لقطات proof (workspace `pos-audit-shots/`): `*-final.png` (ديسكتوب 1280)، `*-final-mob.png`/`*-fix-mob.png` (375)، `*-final-tab.png` (768) — تُظهر: «الفرق · بانتظار العدّ»، «نقداً» في السندات، «النوع: بيع»، وصفر overflow في الموبايل.

## الملفات المعدّلة
- `frontend/src/locales/ar/common.json` — مفاتيح: `recon.status.PENDING`, `vouchers.methods.*`, `loyalty.kindCol`, `bills.typeName.1`
- `frontend/src/main.tsx`, `frontend/vite.config.ts`, `frontend/src/vite-env.d.ts` — تسجيل SW يدوي + cache-busting
- `frontend/src/features/shifts/components/ReconciliationPage.tsx` — PENDING + توحيد تنسيق + إصلاح overflow
- `frontend/src/features/vouchers/components/VouchersPage.tsx` — ترجمة طريقة الدفع + flex-wrap
- `frontend/src/features/customers/components/CustomersPage.tsx` — عنوان عمود النوع
- `frontend/src/features/bills/components/BillDetailPage.tsx` — تسمية نوع الفاتورة
- `frontend/src/features/pos-terminal/components/PriceCheckPage.tsx`, `frontend/src/features/sync/components/SyncPage.tsx` — توحيد التنسيق
- `frontend/src/features/items/components/ItemsPage.tsx`, `frontend/src/features/settings/components/SettingsPage.tsx` — إصلاح overflow
- `/etc/caddy/conf.d/custom.caddy` — سياسة كاش PWA (خارج git)
