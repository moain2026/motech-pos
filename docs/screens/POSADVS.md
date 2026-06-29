# POSADVS — توثيق شاشة Onyx Pro POS

> النوع: **POSADVS** — شاشات لمس/متقدمة (Advanced/Touch)  
> الحجم: 147,752 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSADVS.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **شاشات لمس/متقدمة (Advanced/Touch)**. أكثر الجداول استخداماً: `S_BRN`, `IAS_SYS`, `IAS_POS_HUNG_BILLS`, `IAS_PARA_GEN`, `IAS_POS_MACHINE`, `V$SESSION`.

## 2. Data Blocks (4)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| SKN_BLK | ctrl | QIU | AUTOMATIC |  |
| PARAMTR | ctrl | QIU | AUTOMATIC |  |
| POS_BILL_DTL_INFO | DB | QIU | AUTOMATIC | ORDER:RCRD_NO |
| LOGIN | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (2) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| MAIN | CONTENT | 612×453 | visible |
| MAIN2 | STACKED | 612×453 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (1)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DIALOG | false |

## 5. Triggers (6)

**قياسية (Forms events):** `KEY-EXIT`, `ON-ERROR`, `ON-MESSAGE`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TIMER-EXPIRED`

## 6. Program Units (9)

**Packages (spec):** `ACTIVESKIN4_ISKIN`, `ACTIVESKIN4_SKIN_EVENTS`, `ACTIVESKINLIB_CONSTANTS`


**Packages (body):** `ACTIVESKIN4_ISKIN`, `ACTIVESKIN4_SKIN_EVENTS`


**Procedures/Functions (4):** `LOAD_PARAMETERS`, `SET_OPEN_SCRN_SESSION`, `CHK_SKN_RGSTR`, `CHANGE_SKIN`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`

## 8. Alerts (5)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| S_BRN | 2 |
| IAS_SYS | 1 |
| IAS_POS_HUNG_BILLS | 1 |
| IAS_PARA_GEN | 1 |
| IAS_POS_MACHINE | 1 |
| V$SESSION | 1 |
| CMD | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_USR_PKG`, `IAS_ITM_PKG`, `SETUP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT YS_CMP_LOGO_PATH FROM IAS_SYS
SELECT ''- '' || DECODE(:b1,1,NVL(CMP_LNAME,CMP_FNAME),NVL(CMP_FNAME,CMP_LNAME)) ,DECODE(:b1,1,NVL(BRN_LNAME,BRN_FNAME),NVL(BRN_FNAME,BRN_LNAME)) || '' - '' || :b3 ,CMP_IMG FROM S_BRN WHERE BRN_NO
SELECT MAX(BILL_SEQ) FROM IAS_POS_HUNG_BILLS WHERE MACHINE_NO
SELECT USE_VAT,USE_PRICE_INCLUDE_VAT,NO_OF_DECIMAL_AR FROM IAS_PARA_GEN,IAS_PARA_AR
SELECT SHOW_ADVR_CUST_SCRN,ADVR_CUST_SCRN_XPOS,ADVR_CUST_TXT1,ADVR_CUST_TXT2,ADVR_CUST_TXT3 FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT COUNT(*) FROM V$SESSION WHERE UPPER
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSADVS_strings.txt`.
