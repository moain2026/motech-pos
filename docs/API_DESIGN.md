# 🔌 تصميم REST API — Motech POS

> REST + OpenAPI، أخطاء RFC 9457، Idempotency للفواتير، RBAC. المرجع: `STANDARDS/03_BACKEND.md §3` و`07_SECURITY`.
> العقد الرسمي يُولَّد من الكود (`@nestjs/swagger`) → `docs/api/openapi.yaml`. آخر تحديث: 2026-06-29.

---

## 1) المبادئ العامة

- **Base path:** `/api/v1` (URI versioning).
- موارد جمع، أحرف صغيرة؛ أفعال HTTP صحيحة؛ العمليات غير-CRUD كمورد/فعل (`POST /bills/{id}/refund`).
- **التواريخ:** ISO-8601 UTC في الـ API؛ التحويل للعرض في الواجهة.
- **التغليف:** `{ "data": ..., "meta": { ... } }`.
- **الترقيم:** Cursor-based للقوائم الكبيرة (الفواتير/الأصناف): `?cursor=...&limit=50` → `meta.nextCursor`. offset للقوائم الصغيرة.
- **المصادقة:** `Authorization: Bearer <JWT>`. **التفويض:** RBAC حسب الدور/الفرع.
- **Idempotency:** عمليات الإنشاء المالية تقبل `Idempotency-Key: <uuid-v7>` (حرج لـ offline-sync — ADR-004).

---

## 2) نمط الأخطاء — RFC 9457 (Problem Details)

```json
{
  "type": "https://api.motech-pos.local/errors/no-open-shift",
  "title": "No open shift for cashier",
  "status": 409,
  "detail": "Cashier 12 has no open work shift; open a shift before selling",
  "instance": "/api/v1/bills",
  "traceId": "01J8...."
}
```

رموز HTTP: 400 (إدخال) · 401 (مصادقة) · 403 (تفويض) · 404 · 409 (تعارض، مثل لا وردية مفتوحة / تكرار idempotency) · 422 (validation) · 429 (rate) · 500. **لا** تسريب stack/تفاصيل DB.

أمثلة أنواع أخطاء مجال (مشتقّة من حُرّاس النظام الأصلي):
| type | status | يقابل في Onyx |
|------|--------|----------------|
| `/errors/no-open-shift` | 409 | `GET_WRK_SHFT_OPN_FNC` فارغ |
| `/errors/bill-no-required-offline` | 422 | `-20904` BILL_NO IS NULL |
| `/errors/tax-bills-not-synced` | 409 | `-20001` لا ترحيل قبل المزامنة |
| `/errors/insufficient-stock` | 409 | فحص `MV_ITEM_AVL_QTY` |
| `/errors/price-limit-exceeded` | 422 | `Chk_Price_Lmt` |
| `/errors/idempotency-conflict` | 409 | عملية مكرّرة |

---

## 3) الموارد و Endpoints الرئيسية

### 3.1 Auth — `auth` module
| الفعل | المسار | الوصف |
|------|--------|-------|
| POST | `/api/v1/auth/login` | دخول (user/password + terminal) → JWT + refresh. يسجّل `IAS_USR_LGN_HSTRY`. |
| POST | `/api/v1/auth/refresh` | تجديد JWT. |
| POST | `/api/v1/auth/logout` | خروج (يحدّث `USER_R.LOGGED_ON`). |
| GET | `/api/v1/auth/me` | المستخدم الحالي + صلاحياته (RBAC). |

### 3.2 Shifts — `shifts` module
| الفعل | المسار | الوصف |
|------|--------|-------|
| GET | `/api/v1/shifts/current` | وردية الكاشير المفتوحة (`POS_WRK_SHFT_CSHR.CLS_DATE IS NULL`). |
| POST | `/api/v1/shifts/open` | فتح وردية (`INSRT_WRK_SHFTS` منطق) + رصيد افتتاحي. body: `{ shiftCode, cashierNo, openingBalance }`. |
| POST | `/api/v1/shifts/{srl}/close` | إقفال (`CLS_FLG=1`, `CLS_DATE`) + إيداع العملة + فروقات. |
| GET | `/api/v1/shifts/{srl}/summary` | ملخّص الوردية (مبيعات/نقد/فروقات — X-report). |

### 3.3 Items — `catalog` module
| الفعل | المسار | الوصف |
|------|--------|-------|
| GET | `/api/v1/items?search=&barcode=&cursor=&limit=` | بحث أصناف (< 100ms، يدعم باركود). |
| GET | `/api/v1/items/{code}` | تفاصيل صنف + سعر + ضريبة. |
| GET | `/api/v1/items/{code}/available-qty?warehouse=` | الكمية المتاحة (`MV_ITEM_AVL_QTY`). |
| GET | `/api/v1/catalog/sync?since=` | دفعة كتالوج/أسعار للـ PWA (offline pull). |

### 3.4 Bills — `bills` module (القلب)
| الفعل | المسار | الوصف |
|------|--------|-------|
| POST | `/api/v1/bills` | **إنشاء/ترحيل فاتورة بيع** (Idempotency-Key). body فيه `clientOperationId (uuid v7)`, `lines[]`, `payments[]`, `customerRef?`, `saveType`. يطبّق منطق `EXTRCT_POS_BILL_PRC` (خصم→ضريبة→إدراج→تجميع). يُرجع 201 + الفاتورة المُسعّرة. |
| GET | `/api/v1/bills?from=&to=&cashier=&cursor=` | قائمة الفواتير (تقرير/استعراض — POST004/017). |
| GET | `/api/v1/bills/{billNo}` | تفاصيل فاتورة (MST+DTL+payments). |
| POST | `/api/v1/bills/calculate` | **حساب بلا حفظ** (`saveType=2`): يرجّع الإجماليات/الضريبة/الخصم للمعاينة الفورية. |
| POST | `/api/v1/bills/{id}/refund` | مرتجع (فاتورة عكسية immutable — POST002/POST006). |
| POST | `/api/v1/bills/{id}/hold` | تعليق الفاتورة (`HUNG=1` → `IAS_POS_HUNG_BILLS`). |
| GET | `/api/v1/bills/held` | الفواتير المعلّقة (POST003). |
| POST | `/api/v1/bills/held/{id}/resume` | استرجاع معلّقة. |

### 3.5 Payments — `payments` module
| الفعل | المسار | الوصف |
|------|--------|-------|
| GET | `/api/v1/payments/methods` | طرق الدفع/العملات/البطاقات المتاحة. |
| POST | `/api/v1/receipts` | سند قبض (`POS_GNR_RCPTS` — POST025). |
| POST | `/api/v1/expenses` | سند صرف (`POS_GNR_EXPNS` — POST026). |

> الدفع الأساسي جزء من body الفاتورة (`payments[]` → `IAS_POS_PAY_BILLS`) لأن دورة البيع ذرّية.

### 3.6 Customers — `customers` module
| الفعل | المسار | الوصف |
|------|--------|-------|
| GET | `/api/v1/customers?search=&mobile=` | بحث عملاء. |
| POST | `/api/v1/customers` | إنشاء عميل نقدي (`IAS_CASH_CUSTMR`). |
| GET | `/api/v1/customers/{code}/points` | رصيد النقاط (loyalty). |

### 3.7 Reports — `reports` module (CQRS قراءة)
| الفعل | المسار | الوصف |
|------|--------|-------|
| GET | `/api/v1/reports/daily?date=&branch=` | تقرير المبيعات اليومي (Z-report — POSR001). |
| GET | `/api/v1/reports/shift-closing?shiftSrl=` | تقرير إقفال الوردية + فروقات النقد. |
| GET | `/api/v1/reports/cashiers?from=&to=` | ملخّص مبيعات الكاشيرات (POST012/013). |
| GET | `/api/v1/reports/tax?period=` | تقرير الضريبة (`POS_TAX_ITM_MOVMNT`). |

### 3.8 Sync — `sync` module
| الفعل | المسار | الوصف |
|------|--------|-------|
| POST | `/api/v1/sync/push` | دفع طابور العمليات المحلية (offline → server)، كل عملية بـ `clientOperationId`؛ idempotent. |
| GET | `/api/v1/sync/pull?since=` | سحب تحديثات الكتالوج/الأسعار/الإعدادات. |
| GET | `/api/v1/sync/status` | حالة المزامنة + الطابور غير المُرحّل + آخر نجاح. |
| POST | `/api/v1/sync/post-to-main` | تشغيل الترحيل (`MOV_BILLS_PRC` adapter) — محمي بحارس `tax-bills-not-synced`. |

---

## 4) Idempotency للفواتير (التفصيل)

1. الواجهة تولّد `clientOperationId = uuid v7` لكل عملية بيع (حتى offline) وتمرّره في الـ body + `Idempotency-Key` header.
2. الخادم يخزّن `(idempotencyKey → نتيجة)` في جدول/Redis قبل المعالجة.
3. عند تكرار الطلب بنفس المفتاح: يُرجَع نفس الرد (201 + نفس الفاتورة) دون إعادة إنشاء — **لا ازدواج** عند إعادة محاولة المزامنة.
4. تعارض (نفس المفتاح، body مختلف) → 409 `idempotency-conflict`.

---

## 5) التفويض (RBAC)

- أدوار: `cashier`, `supervisor`, `branch_manager`, `admin` (مشتقّة من `S_BRN_USR_PRIV`/`PRIVILEGE_GC`).
- Guards على مستوى المسار (`@Roles('cashier')`) + فحص الفرع (`BRN_NO`) لمنع IDOR.
- عمليات حسّاسة تتطلب **موافقة مشرف** (PIN/MFA): `POST /bills/{id}/refund`, إلغاء، خصم كبير، فتح الدرج.
- كل عملية مالية تُسجَّل في سجل تدقيق غير قابل للتعديل.

---

## 6) ملاحظات تنفيذية
- كل DTO له request/response منفصلان (لا تسريب entity).
- `ValidationPipe` عام (`whitelist:true, forbidNonWhitelisted:true`).
- التوابع (طباعة/فوترة إلكترونية/ترحيل) عبر BullMQ events بعد نجاح المعاملة — لا تعطّل استجابة البيع.
- `/health` + `/ready` (terminus). Rate limiting عبر throttler.
