# INDEX — مسارات النظام الكاملة (End‑to‑End Flows)

> **الغرض:** توثيق كل عملية رئيسية في Onyx POS من **الواجهة (الشاشة) → المنطق (triggers/packages) → القاعدة (الجداول/الأعمدة)** — لضمان بناء Motech POS الجديد متكامل بلا نقص.
> **المنهج:** proof-not-assumption — كل اسم شاشة/إجراء/جدول/عمود مُستخرَج فعلياً من `docs/screens/` (+`_raw/`) و`db/schema/plsql/` (91 ملف) و`db/schema/tables/` (117 DDL).
> **التاريخ:** 2026-06-29 (المرحلة 0‑ج: توثيق المسارات).

---

## المسارات الموثّقة (9)

| # | المسار | الملف | الشاشة الرئيسية | الإجراء/الحزمة المحورية | الجدول الرئيسي |
|---|--------|-------|------------------|---------------------------|-----------------|
| 1 | تسجيل الدخول | [FLOW_LOGIN.md](FLOW_LOGIN.md) | `POSLGN` | `DECRYPT_PASS`/`VALIDATE_PASS`/`CHECK_HDSERIAL` (p‑code) | `USER_R`, `IAS_USR_LGN_HSTRY` |
| 2 | فتح وردية | [FLOW_OPEN_SHIFT.md](FLOW_OPEN_SHIFT.md) | `POST027` | `POS_WRK_SHFT_PKG.INSRT_WRK_SHFTS` / `GET_WRK_SHFT_OPN_FNC` | `POS_WRK_SHFT_CSHR`, `POS_WRK_SHFT` |
| 3 | **فاتورة بيع** (الأهم) | [FLOW_SALE_BILL.md](FLOW_SALE_BILL.md) | `POST001` | `PKG_POS_API_PKG.EXTRCT_POS_BILL_PRC` (+`GET_BILL_NO_PRC`, `CLC_ITM_TAX`, `CLC_DISC_VAT_AMT_PRC`, `UPDT_BILL_IN_SAV_PRC`) | `IAS_POS_BILL_MST/DTL`, `POS_TAX_ITM_MOVMNT` |
| 4 | الدفع | [FLOW_PAYMENT.md](FLOW_PAYMENT.md) | `POST001`/`POST011`/`POST010` | `EXTRCT_POS_BILL_PRC` (قسم الدفع) | `IAS_POS_PAY_BILLS`, `POS_BILL_CRDT_CRD` |
| 5 | نقاط الولاء | [FLOW_LOYALTY.md](FLOW_LOYALTY.md) | `POST020`/`POST021` | `POS_POINT_PKG.Insrt_Pos_Point_Trns` | `Pos_Point_Calc_trns` |
| 6 | المرتجعات | [FLOW_RETURN.md](FLOW_RETURN.md) | `POST002`/`POST006` | `EXTRCT_POS_RT_BILL_PRC` / `MOV_RTRN_BILLS_PRC` | `IAS_POS_RT_BILL_MST/DTL` |
| 7 | إقفال الوردية | [FLOW_CLOSE_SHIFT.md](FLOW_CLOSE_SHIFT.md) | `POST013`/`POST027`/`POST015` | تصفية + `CLS_FLG=1` | `POS_WRK_SHFT_CSHR`, `IAS_POS_JRNL_DIFF_CSHR_MST/DTL`, `IAS_DEPOSIT_CURRENCY_MST/DTL` |
| 8 | المزامنة + الفوترة الإلكترونية | [FLOW_SYNC.md](FLOW_SYNC.md) | `POST008` | `MOV_BILLS_PRC` (حارس `-20001`) + `SUBMITDOCUMENT` + `POS_SQL_QUEUE` | `IAS_POS_HST_BILL_MST/DTL`, `POS_SQL_QUEUE`, `POS_EXTRNL_DOC_SYNC` |
| 9 | التقارير | [FLOW_REPORTS.md](FLOW_REPORTS.md) | `POSR001..016`, `POST012/013/015/017/021` | `GET_POS_DATA` / `GET_BILL_DATA_XML` / `SMART_RPRT` | `IAS_POS_BILL_MST/DTL`, `POS_WRK_SHFT_CSHR` |

---

## دورة الحياة الكاملة (نظرة عامة)

```
[1] دخول (POSLGN) → [2] فتح وردية (POST027) → [3] فاتورة بيع (POST001)
   → [4] دفع → [5] نقاط ولاء → [6] مرتجع (اختياري، POST002)
   → [8] فوترة إلكترونية (SUBMITDOCUMENT) → حارس -20001 → ترحيل للمركز (MOV_BILLS_PRC)
   → [7] إقفال وردية + مطابقة (POST013) → [9] تقارير (POSR/POST0xx)
```
المخطّط الكامل في `docs/db/SALES_FLOW.md` §3.

---

## كل ملف يحتوي
- مخطّط **Mermaid sequence** للمسار.
- **جدول خطوات** (الواجهة → المنطق/الإجراء الحقيقي → الجدول → الأعمدة الحقيقية).
- **ملاحظات لإعادة البناء** (ماذا يجب أن يفعل Motech POS الجديد).
- **ثغرات** تحتاج المخطط المركزي `IAS202623` (الجاري سحبه) أو screenshots.

## مراجع مرتبطة
- منطق الأعمال التفصيلي: `docs/db/PACKAGES_ANALYSIS.md`
- دورة البيع المختصرة: `docs/db/SALES_FLOW.md`
- المخطط/الجداول: `docs/db/SCHEMA_OVERVIEW.md` + `db/schema/`
- تعيين الـ domain: `docs/DATA_MODEL.md` · المعمارية: `docs/ARCHITECTURE.md`
- قيود البيانات: `docs/db/CATALOG_DATA_NOTE.md` + `AUTH_DATA_NOTE.md`
