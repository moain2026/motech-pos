# POS_ITM_PRICE — توثيق شاشة Onyx Pro POS

> النوع: **POS*** — خدمي/مكتبة (Utility)  
> الحجم: 540,732 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POS_ITM_PRICE.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **خدمي/مكتبة (Utility)**. أكثر الجداول استخداماً: `DFLT_PRICE_LEV`, `IAS_ITEM_PRICE`, `IAS_ITM_MST`, `DBA_USERS`, `IAS_ITM_DTL`.

## 2. Data Blocks (4)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| LOG | ctrl | QIU | AUTOMATIC |  |
| BRCD | ctrl | QIU | AUTOMATIC |  |
| ITEM_DETAILS | DB | Q-- | AUTOMATIC | WHERE:I_Code=:1 |
| ITEM_DETAILS1 | DB | Q-- | AUTOMATIC |  |

## 3. Canvases (2) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CANVAS2 | CONTENT | 784×504 | visible |
| LOG | CONTENT | 259×168 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (2)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WINDOW1 | سعر الصنف | DOCUMENT | false |
| LOG |  | DIALOG | true |

## 5. Triggers (8)

**قياسية (Forms events):** `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOGON`, `ON-MESSAGE`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-CLOSED`

## 6. Program Units (6)


**Procedures/Functions (6):** `GET_PRICE`, `GET_PRICE2`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `GET_ITM_NAME`

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| DFLT_PRICE_LEV | 4 |
| IAS_ITEM_PRICE | 2 |
| IAS_ITM_MST | 2 |
| DBA_USERS | 2 |
| IAS_ITM_DTL | 2 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `IAS_ITM_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT LPAD(TO_CHAR(TO_NUMBER(:b1),''FMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX''),12,''0'') FROM DUAL
SELECT I_PRICE FROM IAS_ITEM_PRICE WHERE I_CODE = :b1 AND LEV_NO = :b2 AND ROWNUM <= 1" GET_PRICE2 STANDARD IAS_ITM_MST YSPOS1 IAS_ITM_MST IAS20191 IAS_ITM_MST YSPOS1 IAS_ITEM_PRICE IAS20191 IAS_ITEM_PRICE "PKG INIT"GET_PRICE2"VCODE"NN"<cursor ptr>"<SQL statement. Line 4>"" GET_PRICE2 SELECT I_PRICE FROM IAS_ITEM_PRICE WHERE I_CODE
SELECT I_NAME FROM IAS_ITM_MST WHERE I_CODE = :b1" #POPUPHINT# LOV11 SELECT ALL I_CODE,I_NAME,Null Unit FROM Ias_Itm_Mst
SELECT USERNAME FROM DBA_USERS WHERE UPPER
SELECT I_CODE,ITM_UNT FROM IAS_ITM_DTL WHERE I_CODE
DELETE FROM DFLT_PRICE_LEV
INSERT INTO DFLT_PRICE_LEV ( LEV_NO )
UPDATE DFLT_PRICE_LEV SET LEV_NO=:b1" P1_31_DEC_201301_03_02 STANDARD YSPOS1 DFLT_PRICE_LEV "PKG INIT"<anonymous>"<cursor ptr>"<SQL statement. Line 4>"" SELECT NVL(LEV_NO,1) FROM DFLT_PRICE_LEV WHERE ROWNUM <= 1" P0_07_APR_
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POS_ITM_PRICE_strings.txt`.
