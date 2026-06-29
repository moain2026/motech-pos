# ADR-002 — حزمة التقنيات (Tech Stack)

- **الحالة:** مقبول (Accepted) · 2026-06-29
- **المرجع:** `STANDARDS/02_FRONTEND.md` (§1,§2,§4) · `03_BACKEND.md` (§1,§2) · `04_DATABASE.md` (§1)

## السياق
نحتاج اختيار stack لنظام POS: واجهة كاشير عربية/RTL تعمل offline على أجهزة متواضعة، خادم بمنطق مالي معقّد (راجع `PACKAGES_ANALYSIS.md`)، وقاعدة بيانات يجب أن تتصل **بنفس بيانات Oracle الحالية أولاً** (ADR-003) ثم تنتقل لقاعدة خاصة. توحيد اللغة (TypeScript عبر الطبقات) يقلّل التكلفة ويسمح بمشاركة الأنواع/الـ DTOs.

## القرار

### Frontend — React 19 + Vite + TypeScript
- **Vite SPA + PWA** (لا Next.js): POS تطبيق داخلي خلف تسجيل دخول، لا يحتاج SSR/SEO؛ Vite أخف وأنسب لـ offline-first.
- **حالة الخادم:** TanStack Query v5 (caching/offline persistence/mutations). **حالة العميل:** Zustand (سلة البيع، الجلسة، الوضع). **النماذج:** React Hook Form + Zod.
- **التصميم:** Tailwind CSS + shadcn/ui (RTL عبر Radix `dir`)، logical properties (`ps-*/ms-*/text-start`).
- **i18n:** i18next + react-i18next (عربي أساسي، إنجليزي)، خطوط عربية self-hosted (Cairo / IBM Plex Sans Arabic) للعمل offline.
- **PWA:** vite-plugin-pwa (Workbox) + Dexie.js (IndexedDB) للكتالوج/الطابور (تفاصيل في ADR-004).

### Backend — NestJS (Node 22) + TypeScript
- **REST + OpenAPI** كعقد رسمي (`@nestjs/swagger`، يُصدّر `openapi.yaml`). أخطاء **RFC 9457 Problem Details**.
- DI مدمج يطابق Clean Architecture (Ports بـ tokens، Adapters تُربط في الـ module).
- Validation: `class-validator`/Zod عبر `ValidationPipe` (`whitelist:true`).
- طوابير: **BullMQ (Redis)** للتوابع غير المتزامنة (طباعة، فوترة إلكترونية، مزامنة، تقارير ثقيلة) — يماثل `POS_SQL_QUEUE` في النظام الأصلي.

### Database — Oracle الآن → PostgreSQL 16 لاحقاً
- **المرحلة 1 (MVP):** الاتصال بـ Oracle الحالي عبر `node-oracledb` خلف **repository ports** — لقراءة/كتابة نفس بيانات `YSPOS23` (تفصيل في ADR-003).
- **المرحلة لاحقاً:** PostgreSQL 16 + Prisma (Migrations، UUID v7، `NUMERIC` للمال، FKs مفعّلة). التبديل في طبقة infrastructure فقط.

## البدائل المدروسة
| البعد | البديل | لماذا رُفض |
|------|--------|-----------|
| Frontend | Vue3 / Svelte / Angular | سوق/نظام بيئي أصغر؛ Angular ثقيل. React الأنضج لـ shadcn+RTL+TanStack (State of JS 2024). |
| Frontend | Next.js | SSR/SEO غير مطلوب لتطبيق داخلي؛ يثقل offline-first. |
| Backend | Go / .NET | أداء CPU أعلى لكن POS هو I/O-bound؛ NestJS يوحّد اللغة ويفرض البنية. |
| Backend | GraphQL / tRPC | REST أنضج لعملاء متعددين (web/أجهزة كاشير/تكاملات) وأسهل caching/توثيق. |
| DB | البقاء على Oracle نهائياً | تراخيص مكلفة + نظام بيئي Node أضعف؛ لكن نبقى عليه مؤقتاً للتوافق (ADR-003). |

## العواقب
- ✅ TypeScript end-to-end: مشاركة DTOs/أنواع، فريق واحد، سرعة تطوير.
- ✅ معايير ملزمة (RFC 9457، OpenAPI، PWA، NUMERIC) مدعومة أصلاً في الحزمة.
- ⚠️ `node-oracledb` يتطلب Oracle Instant Client في بيئة التشغيل/الحاوية.
- ⚠️ التزام بطبقة repository مجرّدة منذ اليوم الأول وإلا يصعب تبديل Oracle→Postgres لاحقاً.
