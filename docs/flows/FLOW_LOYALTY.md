# FLOW_LOYALTY — نقاط الولاء (End‑to‑End)

> **proof:** `db/schema/plsql/PKG_POS_POINT_PKG.sql` · `docs/screens/POST020.md` (ربط الفاتورة بعميل نقاطي) + `POST021.md` (استعراض حركة النقاط) · `docs/db/PACKAGES_ANALYSIS.md` §4.
> **الجدول الرئيسي:** `Pos_Point_Calc_trns` (التسلسل `POS_POINT_SEQ` محلي؛ جداول النوع `IAS_POINT_TYP_MST`/`IAS_CASH_CUSTMR` مركزية).

---

## 1. نظرة عامة

بعد حفظ الفاتورة، إن كان العميل نقاطياً (`CUST_CODE`/`MOBILE_NO`/`POINT_TYP_NO` في الرأس)، يُسجّل
`POS_POINT_PKG.Insrt_Pos_Point_Trns` حركة كسب نقاط في `Pos_Point_Calc_trns` (عدد النقاط من
`Get_Point_Cnt(BILL_AMT)`، قيمتها `Point_Amt`، تاريخ انتهاء من `Get_Expire_Date`). الاستبدال
(دفع بالنقاط) يُسجَّل بـ `POINT_RPLC_AMT` في رأس الفاتورة + حركة استبدال.

---

## 2. مخطّط Mermaid (sequence)

```mermaid
sequenceDiagram
    actor U as الكاشير
    participant SCR as POST001 / POST020
    participant PNT as POS_POINT_PKG
    participant TRN as Pos_Point_Calc_trns
    participant CUS as IAS_CASH_CUSTMR (مركزي)

    U->>SCR: ربط الفاتورة بعميل نقاطي (CUST_CODE/MOBILE_NO/POINT_TYP_NO)
    SCR->>PNT: Get_Cust_Point_typ / Check_Point_Type_State
    Note over SCR,PNT: بعد حفظ الفاتورة (BILL_AMT نهائي)
    SCR->>PNT: Insrt_Pos_Point_Trns(BILL_NO, CUST_CODE, BILL_AMT, ...)
    PNT->>PNT: POINT_CNT = Get_Point_Cnt(POINT_TYP_NO, BILL_AMT, G_CODE)
    PNT->>PNT: Point_Amt = Get_Point_Amt ; EXPIRE_DATE = Get_Expire_Date
    PNT->>TRN: INSERT (TRNS_NO=POS_POINT_SEQ, TRNS_DATE, CUST_CODE, MOBILE_NO,<br/>POINT_TYP_NO, Bill_NO, DOC_AMT, POINT_CNT, TRNS_TYPE, Point_Amt, EXPIRE_DATE, EXTERNAL_POST)
    opt استبدال (دفع بالنقاط)
        SCR->>PNT: Get_Point_Rplc_Amt(Amt) / Get_Point_Rplc_Cnt
        PNT->>TRN: حركة استبدال (TRNS_TYPE استبدال) → POINT_RPLC_AMT في رأس الفاتورة
    end
```

---

## 3. جدول الخطوات

| # | الخطوة | الواجهة | المنطق (proc حقيقي) | الجدول → الأعمدة |
|---|--------|---------|----------------------|------------------|
| 1 | ربط عميل نقاطي | POST020 / حقول الرأس في POST001 | `Get_Cust_Point_typ`, `Get_Point_Calc_Typ`, `Check_Point_Type_State` | `IAS_POS_BILL_MST.CUST_CODE, MOBILE_NO, POINT_TYP_NO, POINT_CALC_TYP_NO` |
| 2 | كسب النقاط | (بعد الحفظ) | `Insrt_Pos_Point_Trns` ؛ `POINT_CNT = Get_Point_Cnt(POINT_TYP_NO, BILL_AMT, G_CODE)` | **`Pos_Point_Calc_trns`**: `TRNS_NO, TRNS_DATE, CUST_CODE, MOBILE_NO, POINT_TYP_NO, Bill_NO, DOC_AMT, POINT_CNT, TRNS_TYPE, Point_Amt, EXPIRE_DATE, EXTERNAL_POST` |
| 3 | تاريخ الانتهاء | — | `Get_Expire_Date` | `Pos_Point_Calc_trns.EXPIRE_DATE` |
| 4 | رصيد العميل | POST021 (استعراض) | `Get_Cust_Point_bal` | `Pos_Point_Calc_trns` (تجميع) |
| 5 | الاستبدال | canvas `MAIN_PYMNT_POINT_RPLC` (FLOW_PAYMENT §6) | `Get_Point_Rplc_Amt`, `Get_Point_Rplc_Cnt`, `Get_Point_Typ_Min_Lmt` (حد أدنى) | `IAS_POS_BILL_MST.POINT_RPLC_AMT`؛ حركة استبدال في `Pos_Point_Calc_trns (TRNS_TYPE)` |
| 6 | صلاحية الحركة | — | `Chk_Point_Trns`, `Get_bill_doc_amt_point_fnc`, `Check_Insert_Expired_Point` | — |

> الإدراج عبر DB link مدعوم (`P_Db_Link`) لمزامنة النقاط مع المركز.

---

## 4. ملاحظات لإعادة البناء
1. **حركة نقاط منفصلة** (`PointTransaction`) لكل فاتورة: نوع (كسب/استبدال)، عدد، قيمة، تاريخ انتهاء.
2. **قواعد الكسب** (`Get_Point_Cnt`) معتمدة على نوع النقاط (`IAS_POINT_TYP_MST`) ومبلغ الفاتورة — صمّمها كـ rule/strategy لكل `POINT_TYP_NO`.
3. **الانتهاء** (`EXPIRE_DATE`) إلزامي — احسبه عند الكسب؛ صفّ النقاط المنتهية (`Check_Insert_Expired_Point`).
4. **الاستبدال** يخفّض المستحق ويُسجَّل في `POINT_RPLC_AMT` بالرأس + حركة سالبة — احترم `Get_Point_Typ_Min_Lmt`.
5. الـ domain mapping موجود في `docs/DATA_MODEL.md` (`Pos_Point_Calc_trns → PointTransaction`).

## 5. ثغرات تحتاج IAS202623
- **`IAS_POINT_TYP_MST` و `IAS_CASH_CUSTMR`** في المخطط المركزي (synonyms) → قواعد أنواع النقاط ورصيد العملاء غير مرئية محلياً. تحتاج IAS202623 لتأكيد معادلة `Get_Point_Cnt` ومعاملاتها.
- `Pos_Point_Calc_trns` غير ممتلئ محلياً (الحركة مركزية) → لا golden؛ المنطق من الأعمدة المُصرّحة في `Insrt_Pos_Point_Trns`.
