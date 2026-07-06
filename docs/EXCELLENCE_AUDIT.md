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
- ~~**S4 (JWT في localStorage → httpOnly cookies)**~~ — **نُفّذ في موجة التصلّب (2026-07-06، أدناه).**
- **O1 (نشر ذري/CI):** بنية تحتية وليست كوداً؛ موثّق كتوصية قائمة.
- ~~**CSP header**~~ — **نُفّذ في موجة التصلّب (2026-07-06، أدناه).**

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

---

# موجة التصلّب الأمني (2026-07-06) — CSP + httpOnly cookies + Permissions-Policy

> **المنهج:** نفس proof-not-assumption — كل بند مُثبت بقياس حي (curl / CDP على النظام المنشور).

## 1) CSP + رؤوس أمان للواجهة الساكنة (كانت بلا أي رؤوس)

- **الفجوة المقاسة قبلاً:** الـAPI (helmet) كان مُحصّناً، لكن استجابات Caddy الساكنة (index.html/assets) لم تحمل أي رأس أمان (قياس `curl -I /` قبل التعديل: لا CSP، لا X-Frame، لا nosniff).
- **التنفيذ (`/etc/caddy/conf.d/custom.caddy` — خارج git، نسخة احتياطية في `/var/backups/custom.caddy.bak-security-wave`):**
  `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; worker-src 'self'; manifest-src 'self'; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; upgrade-insecure-requests`
  + `X-Content-Type-Options: nosniff` · `X-Frame-Options: SAMEORIGIN` · `Referrer-Policy: strict-origin-when-cross-origin` · `HSTS` · `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()` · `X-Robots-Tag: noindex`.
- **لماذا هذه القيم بالذات (جرد فعلي للـdist):** لا سكربتات inline (فحص dist/index.html) → `script-src 'self'` صارم · React style attributes + طباعة الإيصال (iframe srcless يرث الـCSP ويحوي `<style>`) → `style-src 'unsafe-inline'` ضروري · QR/باركود data-URLs → `img-src data: blob:` · لا eval ولا WebSocket ولا مصادر خارجية (فحص binary لكل الـchunks).
- **إثبات حي (CDP على الدومين):** الصفحة تحمّل كاملة تحت الـCSP — stylesheet + خط Cairo محمّلان، **service worker `activated`**، **0 أخطاء console، 0 انتهاكات CSP** · `curl -I` يُظهر كل الرؤوس على `/` و`/assets/*` · الدومين 200.
- ⚖️ ملاحظة تشغيلية: وضع نسخة backup داخل `conf.d/` يكسر caddy reload (`ambiguous site definition` — glob import يلتقطها) — الـbackup انتقل لـ`/var/backups/`، والدومين بقي 200 طوال الوقت (الـreload الفاشل لا يُسقط التشغيل الجاري).

## 2) S4 — JWT من localStorage إلى httpOnly cookies (تراجُعي/داعم للوضعين)

**التصميم (dual-mode — لا كسر لأي عميل قائم):**
- **Backend:** `auth-cookies.ts` جديد — اللوجن/الرفرش يضبطان `mp_at` (access، `Path=/`، Max-Age=TTL) و`mp_rt` (refresh، **`Path=/api/v1/auth` فقط** — لا يسافر للـendpoints العادية) — كلاهما `HttpOnly; Secure; SameSite=Strict`. التوكنات تبقى أيضاً في body الرد (توافق رجعي للسكربتات/curl/Bearer).
- **JwtAuthGuard:** يقبل Bearer (أولوية) ثم cookie `mp_at`. **دفاع CSRF مزدوج لمسار الـcookie:** SameSite=Strict (المتصفح لا يرفقها cross-site أصلاً) + فحص `Sec-Fetch-Site` على POST/PUT/PATCH/DELETE (cross-site → 401).
- **`POST /auth/logout` جديد** يمسح الكوكيز · `POST /auth/refresh` يقبل body أو cookie `mp_rt` · `cookie-parser` أضيف في main.ts.
- **Frontend:** `motech-session` في localStorage صار يحفظ **profile المستخدم فقط** (partialize) — **لا JWT في localStorage إطلاقاً**. التوكنات in-memory فقط (لـBearer التوافقي بعد اللوجن)؛ بعد reload يحمل الكوكي وحده المصادقة، وانتهاء `mp_at` يُصلّح نفسه برفرش صامت عبر cookie `mp_rt` (مُثبت حياً أدناه). الخروج يستدعي `/auth/logout` (fire-and-forget) + مسح محلي. `RequireAuth` صار يُقفل على profile المستخدم (الكوكي غير مقروء لـJS بالتصميم)، وprofile بائت بلا كوكي يُصلّح نفسه: أول API → 401 → رفرش فاشل → clear → /login.

**إثباتات حيّة (curl محلي + CDP عبر الدومين بعد النشر):**
| المسار | النتيجة |
|---|---|
| login → Set-Cookie | `mp_at` (Path=/، 900s) + `mp_rt` (Path=/api/v1/auth، 7d) — HttpOnly/Secure/Strict ✅ |
| محمي بالكوكي فقط (بلا Authorization) | `/auth/me` 200 · `/items` 200 ✅ |
| refresh بالكوكي فقط (body فارغ) | 200 + كوكيز جديدة ✅ |
| logout | الكوكيز تُمسح (Expires=1970) و`/auth/me` بعدها 401 ✅ |
| Bearer القديم | ما زال 200 (توافق رجعي) ✅ |
| CSRF | POST بكوكي + `Sec-Fetch-Site: cross-site` → **401**؛ same-origin → يمر ✅ |
| **المتصفح الحي (CDP، بعد تحديث SW):** | login admin عبر الفورم → /pos ✅ · `localStorage['motech-session']` = **profile فقط، صفر JWT** (فحص regex على كل المفاتيح) ✅ · `document.cookie` لا يرى `mp_at` (httpOnly) ✅ · fetch محمي بلا header → 200 ✅ · **reload → الجلسة حيّة والـUI authed** ✅ · حذف `mp_at` وإبقاء `mp_rt` ثم reload → **رفرش صامت واستعادة الجلسة** ✅ · خروج → الكوكيز اختفت و`/auth/me` 401 ✅ |

**ملاحظة توافق:** جلسات localStorage القديمة (قبل النشر) تحمل profile + توكنات قديمة — الـpartialize يمسح التوكنات عند أول كتابة، ومستخدم بلا كوكي يُعاد لـ/login طبيعياً عبر مسار 401→clear (دخول إضافي لمرة واحدة).

## 3) تحسينات مرافقة
- **E2E حُدّثت:** استدعاءات fetch داخل الاختبارات كانت تقرأ التوكن من localStorage — صارت تعتمد كوكي المتصفح (وهو بحد ذاته إثبات أن مسار الكوكي يعمل في متصفح حقيقي).
- Pino كان أصلاً يُخفي `req.headers.cookie` من اللوغات (redact قائم) — لا تسريب للتوكنات في السجلات.

## الحالة النهائية لموجة التصلّب
- `npx tsc -b` صفر أخطاء (backend + frontend) · oxlint 0 errors ✅
- اختبارات الوحدة: **348 تمر** (340 + 8 جديدة: auth-cookies + JwtAuthGuard cookie/CSRF) ✅
- **E2E على النظام الحي بعد النشر: 10/10** (19.7s) ✅
- الدومين 200 + كل الأصول/الخط/manifest/SW تحمّل تحت الـCSP · pm2 online · /health ok ✅

## ما يبقى مؤجّلاً بعد هذه الموجة (مع السبب)
- **S3 (schemas في /health)** — كما سبق (قيمة هامشية حالياً).
- **O1 (نشر ذري/CI)** — بنية تحتية.
- **إزالة التوكنات من body الرد نهائياً (cookie-only):** مؤجّل عمداً — الإبقاء المؤقت يحفظ توافق السكربتات/curl/أي عميل API مباشر؛ يُزال بعد دورة تشغيل كاملة بلا مشاكل (الواجهة لم تعد تخزّنها — الخطر المتبقي أن XSS نظري قد يقرأ رد لوجن طازج فقط، ولا XSS vectors مرصودة + CSP الآن فوق ذلك).
- **CSP nonce لـstyle-src:** يتطلب SSR أو build-time injection — غير متاح لـSPA ساكنة بلا تكلفة معمارية؛ `'unsafe-inline'` للأنماط فقط (لا للسكربتات) وخطره منخفض.
