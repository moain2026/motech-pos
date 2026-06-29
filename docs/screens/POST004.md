# POST004 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 480,840 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST004.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **حركات/فواتير (Transactions)**. أكثر الجداول استخداماً: `IAS_POS_BILL_MST`, `IAS_BILL_MST`, `IAS_POS_BILL_DTL`, `IAS_POS_BILL_PST_TMP`, `POS_ITMS_SRL_NOT_FOUND_TMP`, `IAS_POS_MACHINE`.

## 2. Data Blocks (11)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| POST_POS | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| IAS_BILL_MST_POS_TMP | DB | QIU | AUTOMATIC |  |
| IAS_BILL_DTL_POS_TMP | DB | Q-U | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| MAIN2 | STACKED | 886×462 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (6)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN1 | Item Search | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (58)


**Procedures/Functions (58):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_BEFORE_POSTING`, `CHK_CP_QTY`, `CHK_FILL_PRMTRS`, `CREAT_FILL_TMP_TAB_PRC`, `GET_BILL_NO`, `GET_BILL_SER`, `GET_COMM_REP_CODE`, `GET_INFO_TO_ACTVTY_WCODE`, `GET_REP_CODE`, `GET_SI_TYPE_MACHINE`, `POST_AUTO_SAVE`, `POST_POS_DETAIL`, `POST_POS_SUM`, `CHECK_BILL_DATE`, `CHECK_INSTALL_POS`, `CREATE_SYNONYMS_ONYX_PRC`, `POST_OTHR_CHARGES_ITEM`, `CHK_MCHN_LCNS_CNT_PRC`, `CLC_ITM_TAX_MVMNT_PRC`, `CHECK_VAT_AMT_PRC`, `UPDATE_AR_FLD_PRC`, `TST_INSR_TAX`, `CREATE_POS_TST_DATA_PRC`, `INSRT_OTHR_CHARGE_PRC`, `GET_OUT_BILL_QTY_PRC`, `UPDATE_OUT_BILL_PRC`, `CHECK_DATE_PRC`, `CHECK_VAT_AMT_PRC_OLD`, `CALL_SCR_LNK_PRC`, `CHECK_ITM_PRC`, `CHK_SRL_NOT_FND_PRC`

## 7. مكتبات مرفقة (8)

`ERP_YSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`, `EDTNLIB`, `POSOTHRLIB`, `DFLTLIB`, `POSLIB`

## 8. Alerts (9)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| NO_POSTED | الترحيل | STOP | معاينة |
| NO_AVL | الترحيل | STOP | معاينة |
| ALT_RT_SALE | الترحيل | WARNING | نعم |
| CHK_DATA | الترحيل | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_POS_BILL_MST | 43 |
| IAS_BILL_MST | 19 |
| IAS_POS_BILL_DTL | 11 |
| IAS_POS_BILL_PST_TMP | 8 |
| POS_ITMS_SRL_NOT_FOUND_TMP | 7 |
| IAS_POS_MACHINE | 6 |
| IAS_BILL_DTL | 6 |
| GNR_TAX_ITM_MOVMNT | 5 |
| OTHER_CHARGES | 4 |
| IAS_POST_MST | 3 |
| WAREHOUSE_DETAILS | 3 |
| POS_PST_TRNS_PKG | 3 |
| IAS_POS_MINUS_QTY_TMP | 3 |
| DETAIL_OUT_BILLS | 3 |
| IAS_RT_BILL_MST | 3 |
| IAS_ITM_MST | 3 |
| USER_R | 3 |
| IAS_PARA_AR | 2 |
| EX_RATE | 2 |
| S_BRN | 2 |
| S_BRN_USR_PRIV | 2 |
| SALES_MAN | 2 |
| USER_OBJECTS | 2 |
| COST_CENTERS | 2 |
| SALES_CHARGES | 2 |
| OTHER_CHARGES_ITEMS | 2 |
| NOWAIT | 2 |
| POS_TAX_ITM_MOVMNT | 2 |
| MASTER_OUT_BILLS | 2 |
| GNR_TAX_ITM_MOVMNT_POS_TMP | 2 |


_(+19 جدول/view آخر — انظر `_raw/POST004_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `POS_PST_TRNS_PKG`, `IAS_USR_PKG`, `DATE_CNVRTR_PKG`, `YS_GEN_PKG`, `IAS_CHECK_SYS_PKG`, `IAS_DBS_SYS_PKG`, `IAS_TRNS_PKG`, `IAS_ITM_PKG`, `IAS_CHECK_DBS_PKG`, `AR_DOC_SQ_PKG`, `IAS_POST_IN_SAV_PKG`, `LOV_PKG`, `SETUP_PKG`, `POS_POST_PKG`, `COMM_PKG`, `IAS_PRMTR_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select 1 From ias_bill_mst
SELECT FLG_DESC FROM S_FLAGS WHERE FLG_CODE
SELECT PST_CRDT_CRD_TO_AR_TYP FROM IAS_PARA_POS
SELECT CUR_CODE FROM EX_RATE WHERE L_F
SELECT CUR_CODE FROM EX_RATE WHERE STOCK_CUR
Select Brn_no||'-'||Decode( ,1,Nvl(BRN_LNAME,BRN_FNAME), Nvl(BRN_FNAME,BRN_LNAME))BRN_NAME,To_Char(Brn_no) Brn_no From S_Brn
SELECT COMM_PER FROM SALES_MAN WHERE REPRS_CODE
SELECT DECODE(:b1, NULL ,MIN(BILL_DATE),:b1),DECODE(:b3, NULL ,MAX(BILL_DATE),:b3) FROM IAS_POS_BILL_MST WHERE NVL
SELECT COUNT(BILL_SER) FROM (SELECT BILL_SER FROM IAS_BILL_MST WHERE NVL
SELECT DOC_SER FROM IAS_POST_MST WHERE DOC_TYPE = 4 )"SELECT 1 FROM IAS_POS_BILL_MST WHERE NVL
SELECT COUNT(*) FROM IAS_POS_BILL_MST WHERE NVL
SELECT COUNT(1) FROM USER_OBJECTS WHERE OBJECT_NAME
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST004_strings.txt`.
