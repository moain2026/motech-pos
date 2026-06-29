# POS_ALRT_SCR — توثيق شاشة Onyx Pro POS

> النوع: **POS*** — خدمي/مكتبة (Utility)  
> الحجم: 72,388 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POS_ALRT_SCR.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **خدمي/مكتبة (Utility)**. أكثر الجداول استخداماً: `IAS_TRACE_LGN_NOTE`, `IAS_PARA_INV`, `FORM_DETAIL`.

## 2. Data Blocks (1)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| S_ALRT_DATA_TMP | DB | Q-U | AUTOMATIC | WHERE:U_ID = :1; ORDER:ALRT_NO |

## 3. Canvases (1) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| MAIN | CONTENT | 517×416 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (1)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN | تنبيهات النظام / System Alerts | DIALOG | true |

## 5. Triggers (3)

**قياسية (Forms events):** `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-WINDOW-CLOSED`

## 6. Program Units (4)


**Procedures/Functions (4):** `CALL_RPRT`, `LOAD_PAREMETER`, `GET_DATE_DIS_NOTE`, `CALL_SCREEN`

## 7. مكتبات مرفقة (5)

`ERP_YSLIB`, `D2KWUTIL`, `YSERPDBALIB`, `D2KCOMN`, `EDTNLIB`

## 8. Alerts (1)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| MSGBOX | النظام المالي | NOTE | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_TRACE_LGN_NOTE | 2 |
| IAS_PARA_INV | 1 |
| FORM_DETAIL | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `YS_GEN_PKG`, `IAS_USR_PKG`, `GEN_PKG`, `YS_ALRT_SYS_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT COSTING_TYPE,WTAVG_TYPE,ROI_TYPE FROM IAS_PARA_INV
SELECT NT_DIS_DATE FROM IAS_TRACE_LGN_NOTE WHERE NT_NO
SELECT F_FILE_NAME FROM FORM_DETAIL WHERE FORM_NO
INSERT INTO IAS_TRACE_LGN_NOTE ( TRMNL_NAME,NT_NO,NT_DIS,NT_DIS_U_ID,NT_DIS_DATE,CMP_NO,BRN_NO,BRN_USR,BRN_YEAR )
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POS_ALRT_SCR_strings.txt`.
