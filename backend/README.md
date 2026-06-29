# Motech POS — Backend (NestJS)

REST API for Motech POS. Clean/Hexagonal architecture, proof-tested against
real databases.

- **Read side** — read-only over the real Oracle **YSPOS23** schema (the live
  Onyx DB) via the least-privilege `MOTECH_RO` user. Catalog, bill reports,
  legacy shift lookup.
- **Write side (Phase 2c)** — the new system writes its OWN bills/payments/
  shifts into a **separate `MOTECH_POS` schema** (same Oracle container, distinct
  user). It READS reference prices/tax from YSPOS23 but NEVER writes there.
  `PostBillUseCase` (idempotent), shifts open/close, payments.

> Stack: NestJS 10 · TypeScript · node-oracledb 6 (thin mode) · Zod config ·
> pino logging · RFC 9457 errors · Vitest. See `docs/ARCHITECTURE.md`,
> `docs/PROJECT_STRUCTURE.md`, `STANDARDS/03..07`.

---

## Architecture (Clean / Hexagonal)

```
presentation (controllers, DTOs)  →  application (services/use-cases)
        →  domain (entities, value objects, ports)  ←  infrastructure (Oracle adapters)
```

- **No SQL in controllers/services** — only in `infrastructure` repositories, with
  bind variables (never string concatenation).
- Ports are interfaces (DI tokens); adapters are bound per module.
- `shared/` (Money, ProblemDetails, errors, exception filter) depends on nothing.

Modules implemented:
- **bills** (the core) — `Bill` aggregate + `BillLine` with the re-implemented
  tax/discount/total logic from `PKG_POS_API_PKG` (see `docs/db/PACKAGES_ANALYSIS.md`).
- **shifts** — open-shift lookup (`GET_WRK_SHFT_OPN_FNC` logic); selling precondition.
- **catalog** — items / last price / available quantity, read from the real
  data that exists (`MV_ITEM_AVL_QTY` + `IAS_POS_BILL_DTL`). See
  `docs/db/CATALOG_DATA_NOTE.md` for why the canonical item master is not used.
- **auth** — JWT (HS256, access + refresh) + RBAC (`cashier`/`supervisor`/`admin`)
  via guards. Local app-owned users store this phase (the Onyx user tables are
  unreadable here) — see `docs/db/AUTH_DATA_NOTE.md`.
- **health** — `/health` + `/ready` (Oracle `SELECT 1 FROM DUAL`).

---

## Prerequisites

- Node.js 22, npm 10.
- Oracle reachable at `ORACLE_CONNECT_STRING` (local docker `oracle12`,
  service `xe`). Two users:
  - **`MOTECH_RO`** — read-only on YSPOS23 (`SELECT ANY TABLE`; INSERT/UPDATE
    rejected). Used by `OracleService` for all reference reads.
  - **`MOTECH_POS`** — owns our write schema (`SHIFTS/BILLS/BILL_LINES/`
    `PAYMENTS`). Has NO privilege on YSPOS23 (ORA-00942 if it tries), enforcing
    "writes only to MOTECH_POS" at the DB level. Used by `OracleWriteService`.

### Create the write schema (one-time)

```bash
# from repo root
sudo docker cp db/migrations/V001__create_motech_pos_schema.sql oracle12:/tmp/V001.sql
sudo docker cp db/migrations/V002__create_tables.sql oracle12:/tmp/V002.sql
sudo docker exec -i oracle12 sqlplus -S "sys/oracle@//localhost:1521/xe as sysdba" @/tmp/V001.sql
sudo docker exec -i oracle12 sqlplus -S "MOTECH_POS/motech_pos_2026@//localhost:1521/xe" @/tmp/V002.sql
```

> node-oracledb 6 runs in **thin mode** (pure JS) — no Oracle Instant Client
> needed. Verified against Oracle Database 12.1.0.2.

---

## Setup

```bash
cd backend
npm install
cp .env.example .env      # adjust ORACLE_* if needed
```

`.env` (validated by Zod at boot; app fails fast on invalid env):

| var | default | notes |
|-----|---------|-------|
| `PORT` | 3000 | HTTP port |
| `API_PREFIX` | api/v1 | URI versioning |
| `ORACLE_USER` | MOTECH_RO | read-only user |
| `ORACLE_PASSWORD` | — | (gitignored .env) |
| `ORACLE_CONNECT_STRING` | 127.0.0.1:1521/xe | easy-connect |
| `ORACLE_SCHEMA` | YSPOS23 | owns the POS tables |
| `JWT_SECRET` | — | HS256 signing secret (>= 16 chars; use 32+ random) |
| `JWT_ACCESS_TTL` | 15m | access token lifetime |
| `JWT_REFRESH_TTL` | 7d | refresh token lifetime |
| `JWT_ISSUER` | motech-pos | token `iss` claim |
| `AUTH_USERS_FILE` | auth-users.json | local (temporary) users seed |

---

## Run

```bash
npm run build         # nest build (tsconfig.build.json → dist/main.js)
npm run start:prod    # node dist/main.js
# or dev:
npm run start:dev
```

- Swagger UI: `http://localhost:<PORT>/api/v1/docs`
- Health: `http://localhost:<PORT>/health`

---

## Endpoints (this phase)

| method | path | description |
|--------|------|-------------|
| GET | `/health`, `/ready` | liveness + Oracle ping |
| GET | `/api/v1/bills?from&to&machineNo&cursor&limit` | bill list (cursor paginated, newest first) |
| GET | `/api/v1/bills/:billNo` | bill detail: header + lines + **recomputed** totals vs stored |
| GET | `/api/v1/bills/summary/daily?from&to` | daily sales summary |
| GET | `/api/v1/shifts/current?cashierNo` | open shift in MOTECH_POS (409 `no-open-shift` if none) |
| GET | `/api/v1/shifts/legacy/current?cashierNo` | open shift from YSPOS23 (read-only reference) |
| POST | `/api/v1/shifts/open` | **open a work shift** (selling precondition) → MOTECH_POS.SHIFTS |
| POST | `/api/v1/shifts/:id/close` | **close a shift** (expected cash + difference) |
| GET | `/api/v1/shifts/:id/summary` | shift X/Z summary (sales + cash totals) |
| POST | `/api/v1/bills` | **create a sale bill** (open shift required, `Idempotency-Key` mandatory) |
| POST | `/api/v1/bills/:id/payments` | **add a payment** (cash/card/credit) to a posted bill |
| GET | `/api/v1/bills/posted/:id` | fetch a posted bill from MOTECH_POS (header+lines+payments) |
| POST | `/api/v1/auth/login` | username + password → `{ accessToken, refreshToken, user }` |
| POST | `/api/v1/auth/refresh` | refresh token → new token pair |
| GET | `/api/v1/auth/me` | current user + role (Bearer access token) |
| GET | `/api/v1/items?search&cursor&limit` | item list/search (code asc, cursor paginated) — **auth required** |
| GET | `/api/v1/items/:code` | item + last price + per-warehouse available qty |
| GET | `/api/v1/items/barcode/:bc` | resolve item by barcode |

Errors follow **RFC 9457** (`application/problem+json`) with a `traceId`.

### Auth & RBAC

- `Authorization: Bearer <access JWT>` on protected routes (all `/items/*`).
- `JwtAuthGuard` verifies the token (rejects refresh tokens); `RolesGuard`
  enforces `@Roles(...)`. Secret + TTLs come from validated env
  (`JWT_SECRET`, `JWT_ACCESS_TTL`, `JWT_REFRESH_TTL`, `JWT_ISSUER`).
- Dev seed users live in `auth-users.json` (`AUTH_USERS_FILE`), bcrypt-hashed:
  `cashier1/cashier123`, `supervisor1/super123`, `admin/admin123`
  (**dev only** — replace for any real deployment).

---

## Tests

```bash
npm run test         # unit only
npm run test:unit    # 33 unit tests (Money/BillLine/DiscountPolicy/Bill/uuidv7 + auth)
npm run test:golden  # 17 live-Oracle tests: bills golden + catalog (read) + write-side (read+write)
npm run lint
npm run openapi      # regenerate ../docs/api/openapi.json from the live Swagger doc
```

### Write-side integration (full live sale cycle)

`test/golden/write-side-integration.spec.ts` boots the real app and drives the
entire cycle against the REAL databases — **proof-not-assumption**:

1. selling without an open shift → `409 no-open-shift`;
2. open shift → row in `MOTECH_POS.SHIFTS`; second open for same cashier →
   `409 shift-already-open`;
3. create bill → reads reference price from YSPOS23, computes totals with the
   proven `Bill` aggregate, writes header+lines into `MOTECH_POS` atomically;
4. **idempotency**: same `Idempotency-Key` twice → same bill, exactly one row;
   same key + different body → `409 idempotency-conflict`; missing key → `422`;
5. add cash payment → row in `MOTECH_POS.PAYMENTS`, `PAID_AMT` recomputed;
6. close shift → expected cash + difference; selling blocked again after close.

It uses a unique cashier number per run and cleans up its own rows.

The **catalog integration** spec exercises `OracleItemRepository` against the
real `MV_ITEM_AVL_QTY` + `IAS_POS_BILL_DTL` data (list/pagination, by-code with
stock, by-barcode resolution, search, unknown-code null). It needs the same
`ORACLE_*` env as the golden test (`set -a && . ./.env && set +a`).

### Golden tests (proof-not-assumption)

`test/golden/bills-golden.spec.ts` reads a sample of **real** bills from
`IAS_POS_BILL_MST/_DTL` and asserts that the re-implemented domain math
(`Bill.totals()`) reproduces the stored `BILL_AMT / VAT_AMT / DISC_AMT` within
0.01. Sample size via `GOLDEN_SAMPLE` env (default 50). Requires the same
`ORACLE_*` env as the app:

```bash
set -a && . ./.env && set +a
GOLDEN_SAMPLE=500 npm run test:golden
```

> **Data note:** the current YSPOS23 dataset (20,569 bills / 41,945 lines) has
> **zero VAT and zero discounts** on every bill. So the golden test proves the
> no-tax/no-discount path against real data (`BILL_AMT = Σ qty·price`), while the
> VAT type-1/type-2 and head-discount-allocation logic is proven by **unit
> tests** (synthetic cases derived from `PACKAGES_ANALYSIS §1.3–1.5`). When a
> dataset with tax/discounts is loaded, the same golden test will validate it
> with no code change.

---

## Security / standards notes

- Read-only DB user, least privilege (STANDARDS/07 §3).
- Bind variables everywhere (no SQL injection, §A05).
- `helmet`, CORS allowlist, global `ValidationPipe` (`whitelist`,
  `forbidNonWhitelisted`).
- Money is NUMERIC-safe (integer minor units, no float — STANDARDS/04 §2).
- No secrets in git (`.env` gitignored, `.env.example` documents vars).
