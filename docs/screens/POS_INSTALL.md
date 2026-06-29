# POS_INSTALL — توثيق شاشة Onyx Pro POS

> النوع: **POS*** — خدمي/مكتبة (Utility)  
> الحجم: 596,112 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POS_INSTALL.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **خدمي/مكتبة (Utility)**. أكثر الجداول استخداماً: `S_MSGS`, `IAS_FORM_NAME`, `FORM_DETAIL`, `IAS_POS_HELP_KEYS`, `IAS_SYS`, `ALL_USERS`.

## 2. Data Blocks (4)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| LOGIN | ctrl | QIU | AUTOMATIC |  |
| MAIN_SERVER | ctrl | QIU | AUTOMATIC |  |
| SUB_SERVER | ctrl | QIU | AUTOMATIC |  |
| SCHDL_TM | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (3) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| LOGON | CONTENT | 305×205 | visible |
| MAIN_SERVER | CONTENT | 380×470 | visible |
| SUB_SERVER | CONTENT | 466×558 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (4)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| INSTALL | Setting Point Of Sales -Onyx | DOCUMENT | false |
| MAIN_SERVER | Setting Point Of Sales -Main Server | DOCUMENT | false |
| SUB_SERVER | Setting Point Of Sales -Sub Server | DOCUMENT | false |
| LOGIN | Login | DIALOG | false |

## 5. Triggers (2)

**قياسية (Forms events):** `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`

## 6. Program Units (32)


**Procedures/Functions (32):** `CREATE_DB_LINK`, `CREATE_GEN_SEC_USR_TAB`, `CREATE_JOB_PROC`, `CREATE_MV_BRN_PRC`, `CREATE_MV_LOG_PRC`, `CREATE_PK_FUN_PRC`, `CREATE_SYNONYMS_4ONYX_PRC`, `CREATE_TS_PRC`, `DBA_POS_SRVR_TABLE_PRC_OLD`, `DBA_POS_BRN_TABLE_PRC_OLD`, `DBA_SYNONYMS`, `DROP_CONSTRAINTS`, `DYNAMIC_LIST`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `GET_CONS_NAME`, `IAS_GET_ALL_FLD_TBL_FNC`, `INSRT_POS_INIT_DATA_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `SYNCHRONIZE_DATA_SALES_PROC`, `SYNCHRONIZE_DATA_TRANSFER_PROC`, `ALTER_PASS`, `CREATE_TBLSPACE_PRC`, `INSRT_FORM_POS_DTL_PRC`, `INSRT_S_MSGS_PRC`, `CREATE_SYNONYMS_4POS_PRC`, `CHECK_UPGRADE_ONYX_PRC`, `GIVE_GRANT_PRC`, `UPDATE_DFLT_PROFILE_PRC`, `INSRT_SFLGS_PRC`, `GET_PSWRD_FNC`

## 7. مكتبات مرفقة (10)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`, `DFLTLIB`, `PLJSON`, `ERPLNGLIB`, `YSERPDBA2LIB`, `POSSTPLIB`, `POSOTHRLIB`

## 8. Alerts (5)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| B4_SAVE | تراجع | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| S_MSGS | 170 |
| IAS_FORM_NAME | 107 |
| FORM_DETAIL | 76 |
| IAS_POS_HELP_KEYS | 43 |
| IAS_SYS | 34 |
| ALL_USERS | 33 |
| ALL_TABLES | 14 |
| DBA_SNAPSHOTS | 12 |
| S_FLAGS | 12 |
| V$TABLESPACE | 9 |
| IAS_POS_MACHINE | 8 |
| PRIVILEGE | 8 |
| DBA_TABLESPACES | 8 |
| IAS_POS_HISTORY_HUNG_BILLS | 8 |
| USER_TAB_COLS | 8 |
| DBA_SYNONYMS | 7 |
| IAS_PARA_POS | 7 |
| IAS_POS_HST_BILL_DTL | 7 |
| DBA_SNAPSHOT_LOGS | 7 |
| IAS_POS_AUD_ITEM | 7 |
| ITEM_DETAILS | 7 |
| LANG_DEF | 6 |
| IAS_POS_RT_BILL_DTL | 6 |
| IAS_POS_HST_RT_BILL_DTL | 6 |
| IAS_POS_HUNG_BILLS | 6 |
| IAS_POS_BILL_DTL | 6 |
| ANY | 4 |
| IAS_POS_PRIV_MACHINE | 4 |
| USER_OBJECTS | 4 |
| IAS_POS_SERVER_DB_LINK | 3 |


_(+53 جدول/view آخر — انظر `_raw/POS_INSTALL_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `IAS_DBS_SYS_PKG`, `SECURITY_PKG`, `IAS_POS_DISTIBUTED_DB_PKG`, `POS_VIEW_PKG`, `POS_MOV_TRNS_PKG`, `POS_MVIEW_PKG`, `POS_FILEDS_PKG`, `POS_TABLE_PKG`, `POS_PACKAGE_PKG`, `POS_PROCDRE_FUNC_PKG`, `POS_POINT_PKG`, `IAS_ENCDEC_PKG`, `POS_TRIGGER_PKG`, `COMM_PKG`, `POS_SYNONYMS_PKG`, `POS_INSRT_DATA_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT SERVER_NO,SERVER_NM,DB_LINK_NM,DB_SERVICE_NM,DB_LINK_DESC FROM IAS_POS_SERVER_DB_LINK WHERE UPPER
SELECT 1 FROM DBA_SNAPSHOTS WHERE TABLE_NAME = ''IAS_ITM_MST'' AND OWNER = USER AND ROWNUM <= 1"SELECT DB_LINK FROM USER_DB_LINKS WHERE DB_LINK
SELECT 1 FROM ALL_TABLES WHERE OWNER = :b1 AND TABLE_NAME = ''IAS_PARA_POS''"SELECT DISTINCT SYNONYM_NAME FROM DBA_SYNONYMS WHERE OWNER
SELECT TBL_NAME FROM (SELECT ''IAS_PARA_POS'' TBL_NAME FROM DUAL UNION SELECT
SELECT ''IAS_POS_MACHINE'' TBL_NAME FROM DUAL UNION SELECT
SELECT ''IAS_POS_BILL_MST'' TBL_NAME FROM DUAL UNION SELECT
SELECT ''IAS_POS_HST_BILL_MST'' TBL_NAME FROM DUAL UNION SELECT
SELECT ''IAS_POS_RT_BILL_MST'' TBL_NAME FROM DUAL UNION SELECT
SELECT ''IAS_POS_HST_RT_BILL_MST'' TBL_NAME FROM DUAL UNION SELECT
SELECT ''IAS_POS_PAY_BILLS'' TBL_NAME FROM DUAL UNION SELECT
SELECT ''IAS_POS_PAY_RT_BILLS'' TBL_NAME FROM DUAL UNION SELECT
SELECT ''IAS_POS_PAY_HST_RT_BILLS'' TBL_NAME FROM DUAL UNION SELECT
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POS_INSTALL_strings.txt`.
