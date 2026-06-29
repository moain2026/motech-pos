# Motech POS — Frontend (React 19 PWA)

Modern web POS replacing YemenSoft Onyx Pro. **Arabic / RTL**, offline-first
PWA, touch-friendly. Connects to the NestJS backend (`/api/v1`).

> Stack: React 19 · Vite 8 · TypeScript · TanStack Query v5 (server state) ·
> Zustand v5 (client state) · Tailwind v4 + shadcn-style owned UI · i18next ·
> React Router v7 · vite-plugin-pwa (Workbox). See `STANDARDS/02_FRONTEND.md`,
> `docs/PROJECT_STRUCTURE.md §3`, `docs/API_DESIGN.md`.

---

## Architecture (feature-based, STANDARDS/02 §3)

```
src/
├─ app/                 # providers (QueryClient, i18n), router (lazy), AppLayout
├─ features/
│  ├─ auth/             # POSLGN — login (RHF+Zod), session store, refresh
│  ├─ shifts/           # GET /shifts/current (cashier header context)
│  ├─ pos-terminal/     # ★ POST001 — sales bill: item grid + cart + summary
│  ├─ bills/            # POST004/017 — bill list + bill detail
│  └─ reports/          # POSR001 — daily sales summary (Z-report basis)
├─ shared/
│  ├─ ui/               # owned components: Button, Input, Card, StateView, OnlineBadge
│  ├─ lib/              # api-client (axios + JWT refresh), types, format (Intl), i18n, cn
│  ├─ offline/          # Dexie IndexedDB (catalog cache + op-queue scaffold)
│  └─ hooks/            # useOnlineStatus
└─ locales/ar/          # Arabic strings (no hardcoded JSX text)
```

**Rules enforced:** server state only in TanStack Query; client state in
Zustand; forms in RHF+Zod; every data view handles loading/error/empty/success;
logical RTL properties (`ps-*/ms-*/text-start/end-*`); a11y + keyboard/scanner.

## State separation

- **Server state** (items, bills, shift, reports) → **TanStack Query** (cache,
  refetch, cursor-infinite). Never duplicated into Zustand.
- **Client state** (the open cart, bill discount, session/tokens) → **Zustand**.
- **Forms** (login) → **React Hook Form + Zod**.

## API layer (`shared/lib/api-client.ts`)

- Axios instance, base URL `VITE_API_BASE_URL` (default `/api/v1`).
- **Request interceptor** injects `Authorization: Bearer <access>`.
- **Response interceptor**: transparent **refresh-and-retry** on 401
  (single-flight) using the stored refresh token; normalizes errors to a typed
  `ApiError` wrapping **RFC 9457** problem+json (`traceId` surfaced in the UI).

## Screens (MVP — `docs/SCREENS_PRIORITY.md` wave 0)

| Screen | Route | Backend endpoint(s) |
|--------|-------|---------------------|
| Login (POSLGN) | `/login` | `POST /auth/login`, `/auth/refresh`, `GET /auth/me` |
| POS sales bill (POST001) | `/pos` | `GET /items` (search/barcode), `GET /shifts/current` |
| Bills list (POST004/017) | `/bills` | `GET /bills?from&to&machineNo&cursor` |
| Bill detail | `/bills/:billNo` | `GET /bills/{billNo}` |
| Daily report (POSR001) | `/reports` | `GET /bills/summary/daily` |

The POS layout (item grid + cart + payment summary, shift/cashier header) is
inspired by the original Onyx **POST001**. Cart totals math mirrors the backend
domain: per line `net = qty·price − discount + vat`; bill total = `gross −
discount + vat`.

## PWA / Offline (STANDARDS/02 §4)

- `vite-plugin-pwa` (Workbox): app shell precached (Cache-First); `/api/v1/items`
  via StaleWhileRevalidate; **sale POSTs are never SW-cached** (reserved for the
  IndexedDB op-queue in `shared/offline/db.ts`).
- Installable manifest (`standalone`, RTL, Arabic, landscape).
- Always-visible online/offline badge.

## Run

```bash
npm install
npm run dev        # http://localhost:5173  (proxies /api → backend :3100)
npm run build      # tsc -b && vite build  → dist/
npm run preview    # serve the production build
npm run lint       # oxlint
```

The dev server proxies `/api` and `/health` to `http://localhost:3100`, so no
CORS setup is needed locally. For a different backend set `VITE_API_BASE_URL`.

### Backend for local dev

```bash
cd ../backend && set -a && . ./.env && set +a && PORT=3100 node dist/main.js
# seed users (dev): cashier1/cashier123 · supervisor1/super123 · admin/admin123
```

## Known constraints (this phase)

- **Read-only backend.** There is **no `POST /bills` / `/bills/calculate`** yet
  (verified against `docs/api/openapi.json`). The POS screen computes the sale
  locally and shows a clear notice on "pay" instead of faking a save. Saving +
  payments land when the backend write path ships.
- **Item names are null** in the current YSPOS23 dataset — the UI falls back to
  **code / barcode** for labels (a known data constraint, not a bug).
- Shifts: the current dataset has no open shift, so `GET /shifts/current`
  returns `409 no-open-shift`; the header shows a "no open shift" state.
- Self-hosted Arabic font is **Cairo** (`public/fonts/cairo.woff2`), with a
  system Arabic fallback chain.
