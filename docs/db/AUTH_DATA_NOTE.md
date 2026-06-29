# 🔐 Auth data note (proof-based)

> Why the `auth` module uses a local users store this phase. Verified live
> against `oracle12` / YSPOS23 as `MOTECH_RO`, 2026-06-29.

## The Onyx user/credential tables are NOT readable locally

`USER_R`, `S_BRN_USR_PRIV`, `PRIVILEGE_GC` are **synonyms** → `IAS202623`,
which is absent (`SELECT COUNT(*) FROM all_objects WHERE owner='IAS202623'` = 0):

```sql
SELECT synonym_name, table_owner FROM all_synonyms
WHERE owner='YSPOS23' AND synonym_name IN ('USER_R','S_BRN_USR_PRIV','PRIVILEGE_GC');
-- all → IAS202623
```

The only user-related object present is `IAS_USR_LGN_HSTRY` (login *history*,
columns `U_ID, TRMNL_NM, LGN_TYP, LGN_OUT_DATE, …`) — **no credentials**.
Additionally, Onyx stores passwords encrypted via `DECRYPT_PASS` /
`POS_GNR_PKG`, which are not available here. And YSPOS23 is strictly
**READ-ONLY** for `MOTECH_RO` (writes rejected `ORA-01031`).

## Decision (documented & temporary)

Authenticate against a **LOCAL, app-owned users store** with bcrypt-hashed
passwords, seeded from a JSON file (`AUTH_USERS_FILE`, default
`backend/auth-users.json`). This:
- keeps the READ-ONLY contract on YSPOS23 fully intact,
- gives real JWT + RBAC now (cashier / supervisor / admin),
- is swappable: implementing `OracleUserRepository` behind the same
  `UserRepository` port (once `IAS202623` + `DECRYPT_PASS` are reachable)
  requires **no change** to the application/presentation layers.

## Module shape

- `LocalUserRepository` (infrastructure) loads/validates the seed at boot.
- `AuthService` — bcrypt constant-time compare; identical error for
  unknown-user vs bad-password (no enumeration). Issues access + refresh JWT.
- `TokenService` — HS256, secret + TTLs from validated env (no secrets in code).
- `JwtAuthGuard` (Bearer access token) + `RolesGuard` (`@Roles(...)` RBAC).
- Errors are RFC 9457 (`invalid-credentials` 401, `forbidden` 403).

### Seed users (DEV ONLY — change for any real deployment)
| username | role | password (dev) |
|----------|------|----------------|
| `cashier1` | cashier | `cashier123` |
| `supervisor1` | supervisor | `super123` |
| `admin` | admin | `admin123` |

> Regenerate hashes: `node -e "console.log(require('bcryptjs').hashSync('PW',10))"`.
> `auth-users.json` is gitignored where it contains real hashes; commit only a
> documented dev seed.

### Live proof (2026-06-29)
```
POST /api/v1/auth/login {cashier1/cashier123} → 200 {access, refresh, user{role:cashier}}
POST /api/v1/auth/login {cashier1/wrong}      → 401 invalid-credentials (RFC 9457)
GET  /api/v1/items (no token)                 → 401 unauthorized
GET  /api/v1/items (Bearer access)            → 200 real items
GET  /api/v1/auth/me (Bearer)                 → user + role
POST /api/v1/auth/refresh {refreshToken}      → 200 new tokens
GET  /api/v1/auth/me (refresh token as bearer)→ 401 "Not an access token"
```
