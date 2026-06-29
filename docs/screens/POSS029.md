# POSS029 — توثيق شاشة Onyx Pro POS

> النوع: **POSS** — إعدادات/نظام (Settings/System)  
> الحجم: 406,216 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSS029.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **إعدادات/نظام (Settings/System)**. أكثر الجداول استخداماً: `WMS_REG_DEVICE`, `USER_R`, `USER`.

## 2. Data Blocks (11)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |
| LOV_MST_SLCT | ctrl | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| LOV_MST | ctrl | QIU | IMMEDIATE |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOV_DTL_SLCT | DB | QIU | DELAYED |  |
| WMS_REG_DEVICE | DB | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×41 | visible |
| MAIN | TAB | ?×? | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| CNV_LOV | STACKED | 2000×336 | visible |
| CNV_LOV_SLCT | CONTENT | 2014×354 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 766×66 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_LOV_SLCT |  | DIALOG | true |
| WIN_LOV |  | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (29)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `LOV_TRG`

## 6. Program Units (32)


**Procedures/Functions (32):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `GET_SLCT_DATA`, `CALL_HOSTS`, `YS_DECODE`, `YS_UNICODE`, `CREATE_XMLS`

## 7. مكتبات مرفقة (4)

`D2KWUTIL`, `YSERPDBALIB`, `D2KCOMN`, `YSPOS_LIB`

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
| WMS_REG_DEVICE | 4 |
| USER_R | 2 |
| USER | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `WMS_POS_PKG`, `YS_LOV_SLCT_PKG`, `YS_GEN_PKG`, `IAS_USR_PKG`, `LOV_PKG`, `IAS_GEN_PKG`, `YS_SRL_SCR_PKG`, `IAS_FETCH_DATA_PKG`, `SETUP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT MAX(NVL(DEVICE_NO,0)) FROM WMS_REG_DEVICE
SELECT DEVICE_NO,USER_NAME FROM WMS_REG_DEVICE
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
SELECT PASSWORD FROM USER_R WHERE U_ID
SELECT CLIENT_ID,CLIENT_SECRIT,URL,IP,PORT,USER_NAME,PASSWORD,TOKEN_APP FROM WMS_REG_DEVICE WHERE ROWNUM
SELECT TRANSID,POSVERSION,POSTYPE,URL_REG_REQ,URL_REG_COM,URL_BILL_REQ,URL_BILL_CHK,IP,PORT FROM WMS_REG_DEVICE WHERE ROWNUM
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSS029_strings.txt`.
