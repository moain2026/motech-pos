# POST005 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 367,828 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST005.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **حركات/فواتير (Transactions)**. أكثر الجداول استخداماً: `IAS_POS_RT_BILL_MST`, `IAS_RT_BILL_MST`, `IAS_POS_RTBILL_PST_TMP`, `OTHER_CHARGES`, `IAS_RT_BILL_DTL`, `IAS_POST_MST`.

## 2. Data Blocks (9)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| POST_POS | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (48)


**Procedures/Functions (48):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHK_FILL_PRMTRS`, `CREAT_FILL_TMP_TAB_PRC`, `GET_COMM_REP_CODE`, `GET_INFO_TO_ACTVTY_WCODE`, `GET_REP_CODE`, `GET_RT_BILL_NO`, `GET_RT_BILL_SER`, `GET_SR_TYPE_MACHINE`, `INSERT_CUSTOMER_TRANS`, `POST_AUTO_SAVE`, `POST_POS_DETAIL`, `POST_POS_SUM`, `CREATE_SYNONYMS_ONYX_PRC`, `CHECK_INSTALL_POS`, `CHECK_RT_BILL_DATE`, `POST_RT_OTHR_CHARGES_ITEM`, `CLC_ITM_TAX_MVMNT_PRC`, `CHECK_VAT_AMT_PRC`, `TST_INSRT_TAX`, `CHECK_DATE_PRC`, `CALL_SCR_LNK_PRC`

## 7. مكتبات مرفقة (5)

`D2KWUTIL`, `ERP_YSLIB`, `YSERPDBALIB`, `D2KCOMN`, `EDTNLIB`

## 8. Alerts (8)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| NO_POSTED | الترحيل | STOP | معاينة |
| NO_AVL | الترحيل | STOP | معاينة |
| ALT_ZERO_COST | تنبيه | STOP | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_POS_RT_BILL_MST | 19 |
| IAS_RT_BILL_MST | 6 |
| IAS_POS_RTBILL_PST_TMP | 5 |
| OTHER_CHARGES | 5 |
| IAS_RT_BILL_DTL | 4 |
| IAS_POST_MST | 3 |
| IAS_POS_MACHINE | 3 |
| POS_PST_TRNS_PKG | 3 |
| OTHER_CHARGES_ITEMS | 3 |
| GNR_TAX_ITM_MOVMNT | 3 |
| POS_TAX_ITM_MOVMNT | 3 |
| USER_R | 3 |
| IAS_PARA_AR | 2 |
| EX_RATE | 2 |
| S_BRN | 2 |
| S_BRN_USR_PRIV | 2 |
| NOWAIT | 2 |
| SALES_CHARGES | 2 |
| IAS_RET_BILL_MST | 2 |
| S_FLAGS | 1 |
| IAS_PARA_POS | 1 |
| ALL_TABLES | 1 |
| PRIVILEGE_FIXED | 1 |
| SALES_MAN | 1 |
| IAS_POS_RT_BILL_DTL | 1 |
| IAS_CONN_WCODE_BY_ACTIVITY | 1 |
| ALL_USERS | 1 |
| DBA_SYNONYMS | 1 |
| CUSTOMER | 1 |
| S_PRD_BRN_CLS | 1 |


_(+7 جدول/view آخر — انظر `_raw/POST005_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `POS_PST_TRNS_PKG`, `YS_GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `IAS_DBS_SYS_PKG`, `AR_DOC_SQ_PKG`, `IAS_CHECK_SYS_PKG`, `IAS_BRN_PKG`, `IAS_POST_IN_SAV_PKG`, `IAS_TRNS_PKG`, `LOV_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`, `IAS_PRMTR_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select 1 From ias_rt_bill_mst
SELECT FLG_DESC FROM S_FLAGS WHERE FLG_CODE
SELECT PST_CRDT_CRD_TO_AR_TYP FROM IAS_PARA_POS
SELECT CUR_CODE FROM EX_RATE WHERE L_F
SELECT CUR_CODE FROM EX_RATE WHERE STOCK_CUR
SELECT 1 FROM ALL_TABLES WHERE OWNER = UPPER(USER) AND TABLE_NAME = UPPER(''IAS_POS_BILL_MST'') AND ROWNUM <= 1"SELECT ALLOW_ENTER_ZERO_COST FROM PRIVILEGE_FIXED WHERE U_ID
Select Brn_no||'-'||Decode( ,1,Nvl(BRN_LNAME,BRN_FNAME), Nvl(BRN_FNAME,BRN_LNAME))BRN_NAME,To_Char(Brn_no) Brn_no From S_Brn
SELECT MIN(RT_BILL_DATE),MAX(RT_BILL_DATE) FROM IAS_POS_RT_BILL_MST WHERE NVL
SELECT COUNT(RT_BILL_SER) FROM (SELECT RT_BILL_SER FROM IAS_RT_BILL_MST WHERE NVL
SELECT DOC_SER FROM IAS_POST_MST WHERE DOC_TYPE = 5 )"SELECT COUNT(*) FROM IAS_POS_RT_BILL_MST WHERE NVL
SELECT COMM_PER FROM SALES_MAN WHERE REPRS_CODE
SELECT MIN(AD_U_ID),MAX(AD_U_ID) FROM IAS_POS_RT_BILL_MST WHERE NVL
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST005_strings.txt`.
