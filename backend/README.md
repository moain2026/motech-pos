# Motech POS — Backend (NestJS)

REST API for Motech POS. **Phase 2** = read-only over the real Oracle YSPOS23
schema, Clean/Hexagonal architecture, proof-tested against real bills.

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

Modules implemented this phase:
- **bills** (the core) — `Bill` aggregate + `BillLine` with the re-implemented
  tax/discount/total logic from `PKG_POS_API_PKG` (see `docs/db/PACKAGES_ANALYSIS.md`).
- **shifts** — open-shift lookup (`GET_WRK_SHFT_OPN_FNC` logic); selling precondition.
- **health** — `/health` + `/ready` (Oracle `SELECT 1 FROM DUAL`).

---

## Prerequisites

- Node.js 22, npm 10.
- Oracle reachable at `ORACLE_CONNECT_STRING` (local docker `oracle12`,
  service `xe`). A least-privilege **read-only** user is used (`MOTECH_RO`,
  `SELECT ANY TABLE` only — INSERT/UPDATE are rejected with ORA-01031).

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
| GET | `/api/v1/shifts/current?cashierNo` | open shift (409 `no-open-shift` if none) |

Errors follow **RFC 9457** (`application/problem+json`) with a `traceId`.

---

## Tests

```bash
npm run test         # unit (domain) only
npm run test:unit    # same
npm run test:golden  # golden: real Oracle bills vs recomputed totals
npm run lint
```

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
