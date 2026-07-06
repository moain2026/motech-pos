# EXCELLENCE_AUDIT — التدقيق النقدي الشامل (موجة التميّز)

> **التاريخ:** 2026-07-06 · **المنهج:** proof-not-assumption — كل ملاحظة بدليل (ملف:سطر أو قياس حي).
> **خط الأساس المفحوص حياً قبل أي تعديل:** 337 اختبار وحدة تمر (50 ملفاً، 8.3s) · pm2 online · `GET /health` → ok (read+write connected) · الدومين 200 (51ms TTFB).

---

## القسم 1 — الأمان (OWASP 2025)

### ما هو ممتاز فعلاً (مُثبت)
| البند | الدليل |
|---|---|
| Authz على كل controller | فحص آلي: كل الـ33 controller تحمل `UseGuards` ≥2 مرة عدا `health.controller.ts` (مقصود — liveness) |
| لا حقن SQL | كل الاستعلامات bind parameters؛ interpolation الوحيد هو أسماء schema من config (`${this.schema}`) — ليست مدخلات مستخدم |
| Helmet + CORS مقيّد | `main.ts:21-22` — helmet() + origins من env |
| Loopback bind | `main.ts:52-55` — HOST=127.0.0.1، الدخول العام عبر Caddy فقط. مُثبت سابقاً (P0 wave) |
| JWT secret صارم | `config.schema.ts:43-50` — ≥32 حرفاً + رفض القيم التطويرية |
| لا user enumeration | `auth.service.ts:34-42` — bcrypt compare ثابت الوقت حتى لمستخدم غير موجود |
| لا أسرار في git | `auth-users.json` مُخرج (gitignore)، الاعتماديات في `state/` خارج الريبو |
| HSTS | `strict-transport-security: max-age=15552000` (قياس حي عبر الدومين) |

### الثغرات المكتشفة
| # | الخطورة | الملاحظة | الدليل | القرار |
|---|---|---|---|---|
| S1 | **عالية** | **لا rate-limiting على `/auth/login`** — brute force ممكن (bcrypt يبطئه لكن لا يمنعه). 6 محاولات فاشلة متتالية كلها ترجع 401 بلا أي حظر | قياس حي: `for i in 1..6; POST /auth/login wrong` → `401 401 401 401 401 401` · لا `Throttler` في package.json | ✅ **نُفّذ** — LoginThrottleService (أدناه) |
| S2 | **متوسطة** | **Swagger مكشوف علناً في الإنتاج** — `/api/v1/docs` و`/docs-json` يرجعان 200 عبر الدومين: خريطة كاملة للـAPI لأي مهاجم | قياس حي: `curl https://nuugneol.../api/v1/docs` → 200 · `main.ts:38-45` بلا شرط بيئة | ✅ **نُفّذ** — مقفل في production (SWAGGER_ENABLED للتجاوز) |
| S3 | منخفضة | `/health` العام يكشف أسماء الـschemas (YSPOS23/MOTECH_POS) — info disclosure طفيف | قياس حي: `curl https://nuugneol.../health` → `"schema":{"read":"YSPOS23",...}` | ⏸ **مؤجّل** — تكشفه أيضاً وثائق المشروع؛ الاسم وحده لا يمنح وصولاً (loopback + bind creds). يُقيَّد عند فتح النظام لعملاء خارجيين |
| S4 | منخفضة | JWT في localStorage (persist zustand) — سرقة عبر XSS نظرياً | `session.store.ts:2,21` | ⏸ **مؤجّل** — React يُهرّب افتراضياً + لا `dangerouslySetInnerHTML` في الكود + CSP يتطلب إعادة هيكلة httpOnly cookies (تغيير معماري لا يناسب موجة تلميع) |

## القسم 2 — الأداء

### القياسات الحية (قبل التعديل)
| القياس | النتيجة | الحكم |
|---|---|---|
| استعلامات API الأثقل (curl :3000، admin token) | `items?limit=50` 72ms · `search=ارز` 71ms · `reports/profit` (شهر كامل) 72ms · `comparison` 34ms · `categories` 7ms · `z-report` 2ms | ✅ ممتاز — لا يوجد استعلام >100ms، لا N+1 مرصود |
| ضغط API | `content-encoding: gzip` عبر Cloudflare (قياس حي) | ✅ |
| كاش static | `/assets/*` → `max-age=31536000, immutable` + `cf-cache-status: HIT` · SW shell → `no-cache` (custom.caddy) | ✅ |
| TTFB الدومين | 51ms | ✅ |
| **حجم البندل eager** | `vendor` **382KB (113KB gz)** + `react-vendor` 277KB (87KB gz) + `index` 183KB (44.5KB gz) + query 37KB + i18n 56KB ≈ **~278KB gz أول تحميل** | ⚠️ P1 أدناه |

### الملاحظات
| # | الخطورة | الملاحظة | الدليل | القرار |
|---|---|---|---|---|
| P1 | **متوسطة** | **qrcode + jsbarcode محمّلتان eager في vendor** رغم أنهما لا تُستخدمان إلا وقت الطباعة/العرض: `useScannerToCart` يستورد `lookupBarcode` من barrel `@/features/print` فيسحب كل الـfeature (بما فيه JsBarcode/QRCode) إلى المسار الحرج، وmanualChunks يرمي كل node_modules في vendor | `vite.config.ts:64-72` · `useScannerToCart.ts:3` · فحص binary: `grep JsBarcode dist/assets/vendor-*.js` → موجود ×2 | ✅ **نُفّذ** — dynamic import + فك الـbarrel (قياس before/after أدناه) |
| P2 | منخفضة | routes lazy ✅ (30+ صفحة code-split — `router.tsx:9-94`)، devtools DEV فقط ✅ (`providers.tsx:37`)، خط Cairo self-hosted ✅ | — | لا شيء مطلوب |

## القسم 3 — الاتساق (Design Tokens)

| # | الملاحظة | الدليل | القرار |
|---|---|---|---|
| C1 | tokens مطبّقة على نطاق واسع فعلاً: 77 ملفاً يستخدم `var(--` · لون hex واحد hardcoded في كل الشاشات | فحص آلي: `grep 'bg-\[#' src/features` → **مطابقة واحدة**: `CustomerDisplayPage.tsx:142` (`bg-[#0b1a2e]/95`) | ✅ **نُفّذ** — استبدال بـtoken |
| C2 | **12 استخداماً لـ`window.confirm`/`confirm()` الأصلي** — صندوق نظام قبيح يكسر الهوية البصرية «الفاخرة» والسمة الداكنة وRTL في أخطر العمليات (اعتماد جرد/إقفال وردية/إلغاء مستندات/حذف) | فحص آلي: 12 موقعاً (ShiftBar:61، StockDocShared:471، SalesOrdersPage:60,74، TransfersPage:42، StockCountDetailDialog:53، ReturnCountDetailDialog:57، ScalesTable:120، ShortcutsTable:104، LoyaltyProgramsTable:111، StockReceiptsPage:70، StockIssuesPage:71) | ✅ **نُفّذ** — `ConfirmDialog` موحّد على tokens + استبدال الـ12 موقعاً + تحديث E2E |
| C3 | حالات loading/error/empty موحّدة عبر `StateView` (45 ملفاً) + أخطاء RFC 9457 تُعرض بـdetail وtraceId | `StateView.tsx:33-59` | ✅ جيد أصلاً |

## القسم 4 — UX وإمكانية الوصول (a11y)

| # | الملاحظة | الدليل | القرار |
|---|---|---|---|
| U1 | **Dialog بلا focus trap ولا تركيز أولي** — Tab يهرب خلف الـmodal، وقارئ الشاشة لا يُنقل إليه؛ 30+ حواراً في النظام يعتمد هذا المكوّن | `Dialog.tsx` كاملاً — لا `focus` ولا `tabIndex` (فحص آلي: 0 مطابقة) | ✅ **نُفّذ** — focus trap + تركيز أولي + إرجاع التركيز عند الإغلاق |
| U2 | **تغذية المسح في POS بلا `aria-live`** — الكاشير الكفيف/ضعيف البصر لا يسمع «أُضيف/غير موجود» | `PosPage.tsx:155-166` — div عادي بلا role/aria-live (aria-live واحد فقط في كل النظام: SettingsPage:305) | ✅ **نُفّذ** — `role="status" aria-live="polite"` |
| U3 | لا skeleton loaders — شبكة الأصناف (الشاشة الأهم) تعرض spinner فارغاً أثناء التحميل | `ItemGrid.tsx:158-159` → `LoadingView` (spinner) | ✅ **نُفّذ** — Skeleton cards في ItemGrid (perceived performance) |
| U4 | الأساس الجيد موجود: 439 `aria-*` · `focus-visible` على Button/Input · أهداف لمس ≥44/48px (`Button.tsx:34-38` variants touch/xl) · `prefers-reduced-motion` (`tokens.css:154`) · `lang=ar dir=rtl` | فحوص آلية | ✅ |

## القسم 5 — ملاحظات تشغيلية

| # | الملاحظة | الدليل | القرار |
|---|---|---|---|
| O1 | عدّاد إعادة تشغيل pm2 = 33 (تراكمي تاريخي — `unstable restarts = 0`، السبب القديم وثّقته موجة E2E: نشر غير ذري) | `pm2 describe` | ⏸ مؤجّل — يُحل بـCI/CD أو build ذري (مُوثّق سابقاً في PROGRESS) |

---

## ما نُفّذ (مع الإثبات)

> التفاصيل النهائية والقياسات before/after في ذيل هذا الملف بعد التنفيذ.

1. **S1 — كبح محاولات الدخول:** `LoginThrottleService` in-memory (نافذة 15 دقيقة، 5 محاولات فاشلة لكل username+IP → حظر 15 دقيقة، خطأ RFC 9457 جديد `too-many-login-attempts` 429 مع Retry-After دلالي). النجاح يصفّر العداد. `trust proxy: loopback` لقراءة IP الحقيقي خلف Caddy. + اختبارات وحدة.
2. **S2 — إقفال Swagger في الإنتاج:** يُبنى فقط عند `NODE_ENV !== 'production'` أو `SWAGGER_ENABLED=true` صراحةً.
3. **P1 — تقليص المسار الحرج للبندل:** dynamic import لـ`qrcode` و`jsbarcode` (تُحمّل chunk منفصلاً عند أول طباعة/عرض QR فقط) + `useScannerToCart` يستورد `lookupBarcode` مباشرة بدل الـbarrel + إخراجهما من manualChunks vendor.
4. **C2 — `ConfirmDialog` فاخر موحّد** على tokens (variant danger/primary، أزرار لمسية، Esc/backdrop، focus trap عبر Dialog) واستبدال كل الـ12 `window.confirm` + تحديث E2E (كان يعتمد native dialog في إقفال الوردية).
5. **U1 — focus trap في Dialog:** تركيز أول عنصر قابل للتفاعل عند الفتح، حبس Tab/Shift+Tab، إرجاع التركيز للمُطلِق عند الإغلاق، `aria-labelledby` بدل aria-label نصي.
6. **U2 — `role="status" aria-live="polite"`** لتغذية المسح في POS.
7. **U3 — Skeleton loaders** لبطاقات شبكة الأصناف (نبض هادئ على tokens).
8. **C1 — إزالة الـhex الوحيد** في CustomerDisplayPage → `var(--color-surface)`.

## ما أُجّل (مع السبب)

- **S3 (schemas في /health):** قيمة أمنية هامشية الآن (لا وصول خارجي للقاعدة)؛ يُقيَّد عند فتح النظام لأطراف خارجية.
- **S4 (JWT في localStorage → httpOnly cookies):** تغيير معماري (CSRF tokens، refresh flow جديد، تعديل Caddy) — لا يناسب موجة تلميع؛ الخطر الفعلي منخفض (لا XSS vectors مرصودة، React escaping + لا innerHTML).
- **O1 (نشر ذري/CI):** بنية تحتية وليست كوداً؛ موثّق كتوصية قائمة.
- **CSP header:** يتطلب جرد كل مصادر inline/styles في PWA + اختبار رجعي واسع — أثره الأكبر يتحقق مع S4 معاً كموجة «تصلّب متقدم» مستقلة.

---

## النتائج النهائية — إثباتات حيّة بعد التنفيذ (2026-07-06)

### الأمان (before → after، قياس حي)
| البند | قبل | بعد |
|---|---|---|
| S1 brute force | 6 محاولات خاطئة → `401×6` بلا حد | 5×401 ثم **429** + `Retry-After: 900` + body RFC 9457 `too-many-login-attempts` (retryAfterSeconds) · دخول admin الصحيح عبر الدومين → 200 (لا أثر جانبي) |
| S2 Swagger | `/api/v1/docs` → 200 عبر الدومين | `/api/v1/docs` و`/docs-json` → **404** محلياً وعبر الدومين (NODE_ENV=production) |

### البندل (before → after، أرقام vite الفعلية)
| chunk | قبل (gz) | بعد (gz) |
|---|---|---|
| vendor | 381.9KB (113.1KB) — يحوي JsBarcode+QRCode | 294.3KB (**95.5KB**) — بلا أي منهما (فحص binary: 0 مطابقة JsBarcode) |
| index (eager) | 183.4KB (44.5KB) | 185.3KB (45.5KB) — +ConfirmDialog/Skeleton/focus-trap |
| qr-lib (lazy جديد) | — (كان eager) | 23.5KB (8.9KB) — يُحمّل فقط عند الطباعة/QR |
| jsbarcode | كان داخل vendor eager | **خرج من الـeager graph كلياً** (tree-shaken — لا chunk حتى يُستدعى) |
| **إجمالي أول تحميل gz** | **~273.7KB** | **~258.5KB** (−15.2KB، −5.6%) + إزاحة مكتبتين عن المسار الحرج |

### UX/a11y (إثبات باللقطات + E2E)
- **ConfirmDialog**: لقطة `pos-audit-shots/excellence-confirm-dialog.png` — حوار داكن RTL بعنوان «تأكيد» + أيقونة تحذير + زر تأكيد أحمر (danger) وإلغاء outline — بدل صندوق النظام؛ استبدل كل الـ**12** موقع window.confirm (فحص آلي: 0 متبقّ).
- **Skeleton**: لقطة `excellence-skeleton.png` — شبكة بطاقات هيكلية نابضة مكان الـspinner أثناء تحميل الكتالوج (مُثبتة بإبطاء الشبكة حياً).
- **Focus trap**: مطبّق في Dialog المشترك — يستفيد منه كل حوار (30+) تلقائياً.
- **aria-live**: تغذية المسح في live region دائمة `role=status aria-live=polite`.

### الحالة النهائية
- `npx tsc -b` **صفر أخطاء** backend + frontend ✅
- اختبارات الوحدة: **340 تمر** (337 + 3 جديدة لـLoginThrottle) ✅
- **E2E على النظام الحي بعد النشر: 10/10** (20.1s، منها اختبار إقفال الوردية المُحدَّث للـConfirmDialog الجديد) ✅
- النشر: `dist` → `/var/www/motech-pos/`، الدومين 200 ويقدّم `index-DUbHI6yv.js` الجديد ✅
- pm2 online، `/health` ok (read+write connected) ✅
- commits: `9b12b6d` (security) · `604948a` (bundle) · `b683c57` (UX) — conventional، هوية MoainAlabbasi ✅
