# POSQ001 — توثيق شاشة Onyx Pro POS

> النوع: **POSQ** — استعلام/كميات (Query)  
> الحجم: 223,100 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSQ001.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **استعلام/كميات (Query)**. أكثر الجداول استخداماً: `IAS_ITM_MST`, `IAS_POS_MACHINE`, `EX_RATE`, `USER_R`, `PRIVILEGE_GC`, `IAS_PARA_GEN`.

## 2. Data Blocks (6)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_ITM_PRICE | DB | QIU | AUTOMATIC | ORDER:P_SIZE |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (5) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×41 | visible |
| MAIN | CONTENT | 768×525 | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 766×66 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (3)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (30)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-LOGON`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `LOV_TRG`

## 6. Program Units (36)


**Procedures/Functions (36):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_PRIV_GC`, `GET_ICODE_FOR_BARCODE`, `GET_ITEM_INFO`, `GET_PRICE_RATE`, `LIST_LOV`, `CLEAR_PROC`, `GET_SALESDISC_ITEM`, `READ_AUTO_ITEM_PRICE`, `GET_PRM_PRICE_PRC`

## 7. مكتبات مرفقة (5)

`YSPOS_LIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`, `YSERPDBA2LIB`

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
| IAS_ITM_MST | 8 |
| IAS_POS_MACHINE | 6 |
| EX_RATE | 4 |
| USER_R | 4 |
| PRIVILEGE_GC | 4 |
| IAS_PARA_GEN | 1 |
| IAS_PARA_POS | 1 |
| IAS_ITM_WCODE | 1 |
| IAS_PRICING_LEVELS | 1 |
| IAS_QUT_PRM_MST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_USR_PKG`, `IAS_ITM_PKG`, `IAS_GEN_PKG`, `YS_GEN_PKG`, `YS_TAX_PKG`, `SECURITY_PKG`, `SETUP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT CUR_CODE FROM EX_RATE WHERE L_F
SELECT CUR_CODE FROM EX_RATE WHERE STOCK_CUR
SELECT NVL(SALES_DISC_TYPE,0),PRICE_TYPE,POS_PRICING_TYPE,USE_BARCODE_ONLY,USE_F9_KEY_TO_VIEW_ITM,NVL(CONN_ITM_ACT_BY_USR_PRIV,0),USE_VAT,ACTIVE_VAT_DATE,USE_PRICE_INCLUDE_VAT,CURR_DFLT,NVL(SHOW_DISC_PER_ITEMS_AR,0),NVL(SALES_DISC_TYPE,0),ROUND_DISC_PER_ITM_TYP FROM IAS_PARA_GEN,IAS_PARA_AR,IAS_PARA_INV,IAS_PARA_POS
SELECT NVL(CONNECTION_TYPE,1) FROM USER_R WHERE U_ID
SELECT 1 FROM IAS_POS_MACHINE WHERE ROWNUM <= 1"SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT MACHINE_NO FROM USER_R WHERE U_ID
SELECT UPPER(TERMINAL) FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT 1 FROM IAS_POS_MACHINE WHERE UPPER(TERMINAL) = UPPER(:b1) AND ROWNUM <= 1"SELECT MACHINE_NO FROM IAS_POS_MACHINE WHERE UPPER
SELECT DEF_WCODE,DEF_BRN_NO,CURR_DFLT,CLC_TYP_NO_TAX FROM IAS_POS_MACHINE WHERE UPPER
SELECT PRICE_LEVEL FROM IAS_PARA_POS
SELECT PRICE_LEVEL FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT 1 FROM IAS_ITM_MST WHERE I_CODE = :b1 AND ROWNUM <= 1"SELECT G_CODE FROM IAS_ITM_MST WHERE I_CODE
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSQ001_strings.txt`.
