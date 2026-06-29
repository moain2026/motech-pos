# POSI014 — توثيق شاشة Onyx Pro POS

> النوع: **POSI** — إدخال/بيانات أساسية (Input/Master)  
> الحجم: 298,192 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSI014.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> تحديث قاعدة البيانات 
>  نظام نقاط البيع > مدخلات النظام > 
>  تحديث قاعدة البيانات 
>  الاستخدام: 
>  تظهر 
> الشاشة ضمن مدخلات النظام ليتم تحديث قاعدة البيانات، وبعد عملية التحديث ستختفي 
> الشاشة من مدخلات النظام لتظهر ضمن شاشات تهيئة النظام، وتستخدم لتحديث قاعدة 
> البيانات عندما تستدعي الحاجة ذلك، فمن خلالها يتم تحديث الجداول والحقول والشاشات 
> بالإضافة إلى تحديث الإجراءات والدوال، كما يتم في شاشة التحديث نقل وأرشفة 
> الفواتير والمردودات إلى التاريخ الذي يتم تحديد في حقل (حتى 
> تاريخ). 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (9)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| BLK_UPGRADE | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| CLNDR | ctrl | QIU | DELAYED |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (33)


**Procedures/Functions (33):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_DB_SRVR_TYP_OLD`, `DYNAMIC_LIST`, `SYNCHRONIZE_DATA_SALES_PROC`, `CALL_SCR_LNK_PRC`, `GRNT_USR_PRVLG_FRM_SYSTEM_PRC`, `SET_PRGRS_BAR_PRC`

## 7. مكتبات مرفقة (10)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`, `POSSTPLIB`, `DFLTLIB`, `PLJSON`, `POSOTHRLIB`, `YSERPDBA2LIB`, `ERPLNGLIB`

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
| BILL_SRL | 4 |
| USER_OBJECTS | 4 |
| DBA_SNAPSHOTS | 3 |
| IAS_POS_BILL_MST | 3 |
| IAS_POS_BILL_TEMP | 3 |
| IAS_POS_RT_BILL_TEMP | 3 |
| IAS_POS_BILL_DTL | 2 |
| IAS_POS_RT_BILL_MST | 2 |
| DATA | 2 |
| ALL_USERS | 2 |
| POS_TAX_ITM_MOVMNT | 2 |
| IAS_POS_HST_BILL_MST | 2 |
| IAS_POS_HST_RT_BILL_MST | 2 |
| WSFTY_DRUG_LIST | 2 |
| USER_R | 2 |
| IAS_PARA_INV | 1 |
| DBA_SNAPSHOT_LOGS | 1 |
| L_EXST | 1 |
| DBA_NETWORK_ACLS | 1 |
| IAS_POS_RT_BILL_DTL | 1 |
| DBA_SYNONYMS | 1 |
| DBA_USERS | 1 |
| USER_TAB_COLS | 1 |
| MACHINE | 1 |
| SYSTEM | 1 |
| DRUG | 1 |
| DBA_OBJECTS | 1 |
| POS_BILL_MST_ALL_VW | 1 |
| POS_RT_BILL_MST_ALL_VW | 1 |
| BRN_NO | 1 |


_(+1 جدول/view آخر — انظر `_raw/POSI014_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `DATE_CNVRTR_PKG`, `POS_MOV_TRNS_PKG`, `GNR_WASFATY_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `POS_SNPSHT_PKG`, `IAS_DBS_SYS_PKG`, `IAS_POS_DISTIBUTED_DB_PKG`, `IAS_USR_PKG`, `SETUP_PKG`, `POS_PROCDRE_FUNC_PKG`, `POS_TABLE_PKG`, `POS_FILEDS_PKG`, `POS_MVIEW_PKG`, `IAS_ITM_PKG`, `YS_TAX_PKG`, `SECURITY_PKG`, `COMM_PKG`, `PLJSON_UTIL_PKG`, `POS_INSRT_FORM_DTL_PKG`, `POS_SYNONYMS_PKG`, `POS_INSRT_DATA_PKG`, `POS_PACKAGE_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT 1 FROM DBA_SNAPSHOTS WHERE TABLE_NAME = ''IAS_ITM_MST'' AND OWNER = USER AND ROWNUM <= 1"SELECT 1 FROM DBA_SNAPSHOT_LOGS WHERE MASTER
SELECT 1 INTO L_EXST FROM DBA_NETWORK_ACLS
SELECT COUNT(*) FROM USER_OBJECTS WHERE OBJECT_TYPE NOT IN
SELECT COUNT(1) FROM IAS_POS_BILL_MST WHERE BILL_SRL IS NULL AND BRN_YEAR
UPDATE IAS_POS_BILL_MST SET BILL_SRL=BILL_NO WHERE BILL_SRL IS NULL AND BRN_YEAR = :b1"UPDATE IAS_POS_BILL_DTL SET BILL_SRL=BILL_NO WHERE BILL_SRL IS NULL AND BRN_YEAR = :b1"UPDATE IAS_POS_RT_BILL_MST SET RT_BILL_SRL=RT_BILL_N
UPDATE IAS_POS_RT_BILL_DTL SET RT_BILL_SRL=RT_BILL_NO WHERE RT_BILL_SRL IS NULL AND BRN_YEAR = :b1" Add new fields for materialize view P35_02_JUN_201913_25_21 STANDARD FORMS4G FORMS40 /LPOSSTPLIB CHECK_DB_SRVR_TYP SQLFORMS FORM
SELECT MOD (:b1,1) FROM DUAL
SELECT TABLE_OWNER FROM DBA_SYNONYMS WHERE SYNONYM_NAME
SELECT COUNT(1) FROM ALL_USERS WHERE USERNAME
SELECT 1 FROM DBA_USERS WHERE USERNAME = ''ONYXPROXY''"SELECT DATA_TYPE FROM USER_TAB_COLS WHERE TABLE_NAME
SELECT 1 FROM USER_OBJECTS WHERE UPPER(STATUS) = ''VALID'' AND UPPER(OBJECT_TYPE) = ''PACKAGE'' AND UPPER(OBJECT_NAME) = ''IAS_GEN_PKG'' AND ROWNUM <= 1"SELECT COUNT(DISTINCT TABLE_NAME) FROM DBA_SNAPSHOTS WHERE OWNER
SELECT COUNT(DISTINCT TABLE_NAME) FROM DBA_SNAPSHOTS WHERE OWNER
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSI014_strings.txt`.
