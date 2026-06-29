# 🌳 هيكلة المشروع — Motech POS

> Backend: NestJS Modular Monolith (Clean/Hexagonal). Frontend: React feature-based.
> المرجع الحرفي: `STANDARDS/01_ARCHITECTURE.md §5` (backend) و`02_FRONTEND.md §3` (frontend) و`11_DOCUMENTATION.md §2` (docs).
> آخر تحديث: 2026-06-29.

---

## 1) جذر المستودع (monorepo)

```
motech-pos/
├─ README.md
├─ CONTRIBUTING.md
├─ CHANGELOG.md                 # آلي (semantic-release من conventional commits)
├─ .env.example                 # كل متغيرات البيئة موثّقة
├─ CLAUDE.md                    # تعليمات المشروع
├─ docs/                        # التوثيق (Diátaxis + ADR + C4 + API)
│  ├─ adr/                      # ADR-001..005 + README فهرس
│  ├─ api/openapi.yaml          # عقد API (يُصدَّر من الكود)
│  ├─ db/                       # SCHEMA_OVERVIEW, PACKAGES_ANALYSIS, SALES_FLOW
│  ├─ screens/                  # توثيق 80 شاشة Onyx
│  ├─ ARCHITECTURE.md  DATA_MODEL.md  API_DESIGN.md
│  ├─ SCREENS_PRIORITY.md  PROJECT_STRUCTURE.md
│  ├─ PROJECT_PLAN.md  PROGRESS.md
├─ db/                          # مصدر الحقيقة الحالي (Oracle RE)
│  ├─ schema/tables/            # 117 DDL حقيقي
│  ├─ schema/plsql/             # 58 package + functions
│  └─ forms_raw/                # .fmx/.plx الأصلية
├─ backend/                     # NestJS API
├─ frontend/                    # React PWA
└─ scripts/                     # أدوات بناء/ترحيل/seed
```

---

## 2) Backend (NestJS — Modular Monolith + Clean Architecture)

```
backend/
├─ src/
│  ├─ main.ts                       # bootstrap + Swagger + ValidationPipe + graceful shutdown
│  ├─ app.module.ts
│  ├─ config/                       # @nestjs/config + Zod schema (env validation)
│  │  ├─ config.schema.ts
│  │  └─ config.module.ts
│  ├─ shared/                       # kernel — لا يعتمد على أي module
│  │  ├─ domain/                    # Money, Result, Entity/AggregateRoot base, DomainEvent
│  │  ├─ value-objects/             # Money, Sku, Quantity, TaxRate, BillNumber
│  │  ├─ errors/                    # ProblemDetails (RFC 9457) factory, domain errors
│  │  ├─ guards/                    # RolesGuard, BranchGuard
│  │  ├─ interceptors/              # response envelope, idempotency, logging, traceId
│  │  └─ utils/
│  ├─ infrastructure/               # بنية تحتية مشتركة عبر الـ modules
│  │  ├─ oracle/                    # OracleModule: node-oracledb pool + base repo helpers
│  │  ├─ prisma/                    # (لاحقاً) PrismaModule لـ Postgres
│  │  ├─ queue/                     # BullMQ (Redis) — registration
│  │  └─ printing/                  # ESC/POS adapter / print-agent client
│  ├─ modules/
│  │  ├─ auth/
│  │  │  ├─ domain/                 # User, Session, ports: UserRepository
│  │  │  ├─ application/            # LoginUseCase, RefreshUseCase, dtos
│  │  │  ├─ infrastructure/         # OracleUserRepository (USER_R, IAS_USR_LGN_HSTRY)
│  │  │  └─ presentation/           # auth.controller.ts, http dtos
│  │  ├─ shifts/
│  │  │  ├─ domain/                 # WorkShift, CashierShift, ports: ShiftRepository
│  │  │  ├─ application/            # OpenShiftUseCase, CloseShiftUseCase
│  │  │  ├─ infrastructure/         # OracleShiftRepository (POS_WRK_SHFT[_CSHR])
│  │  │  └─ presentation/
│  │  ├─ catalog/                   # Item, ItemPrice, AvailableQty (IAS_ITM_MST/MV_ITEM_AVL_QTY)
│  │  │  ├─ domain/ application/ infrastructure/ presentation/
│  │  ├─ bills/                     # ★ القلب
│  │  │  ├─ domain/                 # Bill (AggregateRoot) + BillLine + invariants
│  │  │  │  ├─ entities/            # bill.entity.ts, bill-line.entity.ts
│  │  │  │  ├─ services/            # DiscountPolicy, TotalsAssembler (UPDT_BILL_IN_SAV منطق)
│  │  │  │  ├─ events/              # BillPosted, BillHeld, BillRefunded
│  │  │  │  └─ ports/               # BillRepository, NumberGeneratorPort
│  │  │  ├─ application/            # PostBillUseCase, CalculateBillUseCase, Hold/Resume/Refund
│  │  │  ├─ infrastructure/         # OracleBillRepository (IAS_POS_BILL_MST/DTL/HUNG)
│  │  │  └─ presentation/           # bills.controller.ts
│  │  ├─ payments/                  # Payment (IAS_POS_PAY_BILLS), receipts/expenses
│  │  ├─ tax/                       # TaxPolicy (CLC_ITM_TAX منطق), TaxMovement
│  │  ├─ loyalty/                   # PointTransaction (POS_POINT_PKG منطق)
│  │  ├─ customers/                 # Customer (IAS_CASH_CUSTMR)
│  │  ├─ reports/                   # CQRS read models (queries فقط) + raw SQL
│  │  ├─ einvoice/                  # EInvoiceGateway port + adapter (GNR_TECH_SOLUTION_PKG)
│  │  ├─ sync/                      # SyncQueue, MoveToMain adapter (POS_MOV_TRNS_PKG), pull/push
│  │  └─ settings/                  # PosMachine, params (IAS_PARA_POS, POS_DFLT_STNG_*)
│  └─ health/                       # /health, /ready (terminus)
├─ test/
│  ├─ unit/                         # domain/application (نقي)
│  ├─ integration/                  # repos مقابل Oracle حاوية اختبار
│  └─ golden/                       # مقارنة ضريبة/خصم/إجماليات مقابل فواتير Onyx حقيقية
├─ prisma/                          # (لاحقاً) schema.prisma + migrations
├─ nest-cli.json  tsconfig.json  package.json  .eslintrc (boundaries rule)
```

**قواعد إلزامية (مفروضة بـ ESLint module-boundaries):**
- module لا يستورد من `modules/<آخر>/{domain,infrastructure}` — فقط من `index.ts` العام أو event.
- `shared` لا يعتمد على أي module.
- `presentation → application → domain`؛ `infrastructure` تُحقن عبر DI (tokens للـ ports).
- لا SQL في controllers/use-cases؛ فقط في infrastructure (repositories) بـ bind variables.

---

## 3) Frontend (React 19 + Vite — Feature-Based PWA)

```
frontend/
├─ index.html
├─ vite.config.ts                   # + vite-plugin-pwa (Workbox)
├─ public/                          # manifest, أيقونات, خطوط عربية (self-hosted)
├─ src/
│  ├─ main.tsx
│  ├─ app/                          # bootstrap
│  │  ├─ router.tsx                 # routes (lazy per feature)
│  │  ├─ providers.tsx              # QueryClient, i18n, theme(RTL), AuthProvider
│  │  └─ App.tsx
│  ├─ features/
│  │  ├─ auth/                      # login (POSLGN)
│  │  │  ├─ components/ hooks/ api/ store/ index.ts
│  │  ├─ shifts/                    # فتح/إقفال وردية (POST027)
│  │  ├─ pos-terminal/              # ★ شاشة فاتورة البيع (POST001)
│  │  │  ├─ components/             # ItemGrid, Cart, PaymentPanel, ReceiptPreview
│  │  │  ├─ hooks/                  # useScanner, useCartTotals, useHotkeys
│  │  │  ├─ api/                    # useCreateBill, useCalculateBill, useItemSearch
│  │  │  ├─ store/                  # cart.store.ts (Zustand)
│  │  │  └─ index.ts
│  │  ├─ bills/                     # استعراض/معلّقة/مرتجع (POST002/003/004)
│  │  ├─ customers/                 # عملاء + نقاط (POST020/021)
│  │  ├─ payments/                  # سندات (POST025/026)
│  │  ├─ reports/                   # تقارير (POSR*) — lazy
│  │  └─ settings/                  # إعدادات/أجهزة (POSS*/POSI*)
│  ├─ shared/
│  │  ├─ ui/                        # shadcn components (مملوكة)
│  │  ├─ lib/                       # apiClient, queryClient, i18n config, money/Intl format
│  │  ├─ offline/                   # Dexie db, syncQueue, useOnlineStatus
│  │  └─ hooks/
│  ├─ locales/                      # ar/, en/ (namespaces per feature)
│  └─ assets/
├─ tests/                           # vitest + testing-library + playwright (e2e)
├─ tsconfig.json  package.json  tailwind.config.ts  .eslintrc
```

**قواعد إلزامية:**
- feature لا تستورد من داخليات feature أخرى — فقط من `index.ts` أو `shared`.
- لا نصوص hardcoded في JSX (كلها `t('key')`)؛ logical properties (`ps-*/ms-*`) للـ RTL.
- حالة الخادم في TanStack Query فقط؛ حالة العميل في Zustand؛ النماذج RHF+Zod.
- كل عرض بيانات يعالج loading/error/empty/success؛ a11y + keyboard كامل (الكاشير).

---

## 4) ملاحظات
- monorepo بسيط (مجلدان) الآن؛ يمكن لاحقاً pnpm workspaces لمشاركة الأنواع (`packages/shared-types`).
- الترحيلات (Postgres لاحقاً) في `backend/prisma/migrations` (forward-only، Git).
- التوثيق Docs-as-Code: كل تغيير API/قرار → نفس الـ PR (`STANDARDS/11`).
