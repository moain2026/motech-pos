# POST011 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 314,324 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST011.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **حركات/فواتير (Transactions)**. أكثر الجداول استخداماً: `IAS_POS_PAY_BILLS`, `IAS_POST_MST`, `IAS_POS_PAY_CASH`, `USER_R`, `POS_RCPTS_ADVNC`, `POS_GNR_RCPTS`.

## 2. Data Blocks (9)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| POST_POS | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| CLNDR | ctrl | QIU | DELAYED |  |
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

## 6. Program Units (36)


**Procedures/Functions (36):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CONFIRM_JOURNAL`, `GENERATE_CHANGE_BILL_JOURNALS`, `GENERATE_COUPON_BILL_JOURNALS`, `GENERATE_PAID_CASH_JOURNALS`, `CHECK_BILL_DATE`, `CHECK_INSTALL_POS`, `CREATE_SYNONYMS_ONYX_PRC`, `PST_RCPTS_ADVNC_PRC`, `CALL_SCR_LNK_PRC`

## 7. مكتبات مرفقة (5)

`ERP_YSLIB`, `D2KWUTIL`, `YSERPDBALIB`, `D2KCOMN`, `EDTNLIB`

## 8. Alerts (7)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| NO_POSTED | الترحيل | STOP | معاينة |
| NO_AVL | الترحيل | STOP | معاينة |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_POS_PAY_BILLS | 9 |
| IAS_POST_MST | 8 |
| IAS_POS_PAY_CASH | 6 |
| USER_R | 5 |
| POS_RCPTS_ADVNC | 4 |
| POS_GNR_RCPTS | 4 |
| POS_GNR_EXPNS | 4 |
| IAS_POS_BILL_MST | 3 |
| NOWAIT | 3 |
| IAS_POS_MACHINE | 3 |
| POS_RCPTS_ADVNC_TMP | 3 |
| IAS_POS_JRNL_DIFF_CSHR_MST | 3 |
| IAS_POST_DTL | 3 |
| S_BRN | 2 |
| S_BRN_USR_PRIV | 2 |
| IAS_POS_CHANGE_BILL_TMP | 2 |
| IAS_POS_COUPON_BILL_TMP | 2 |
| IAS_POS_PAID_CASH_TMP | 2 |
| DBA_SYNONYMS | 2 |
| S_FLAGS | 1 |
| S_FLAGS_PRIV | 1 |
| EX_RATE | 1 |
| IAS_PARA_AR | 1 |
| ALL_USERS | 1 |
| MACHINE | 1 |
| USER | 1 |
| BRANCH | 1 |
| USER_OBJECTS | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `POS_PST_TRNS_PKG`, `YS_GEN_PKG`, `IAS_DBS_SYS_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `YS_SRL_SCR_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select Brn_no||'-'||Decode( ,1,Nvl(BRN_LNAME,BRN_FNAME), Nvl(BRN_FNAME,BRN_LNAME))BRN_NAME,To_Char(Brn_no) Brn_no From S_Brn
Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
SELECT CUR_CODE FROM EX_RATE WHERE L_F
SELECT NVL(USE_PAY_CASH_RT_BILLS,0),NVL(USE_OUT_BILLS,0),NVL(USE_PAID,0),NVL(STKCOST_FRACTION,6),NVL(USE_AUDIT_DOC,0),NVL(USE_EXPIRE_DATE,0),NVL(USE_BATCH_NO,0),ITEM_POSTING_FLAG,NVL(USE_BALANCED_BRN,0),USE_ADVNC_PYMNT_TYP,USE_RCPTS_FLG,USE_EXPNS_FLG FROM IAS_PARA_AR,IAS_PARA_POS,IAS_PARA_INV,IAS_PARA_GEN
SELECT COUNT(*) FROM IAS_POS_PAY_BILLS D WHERE NVL
SELECT IAS_POS_BILL_MST.BILL_NO,IAS_POS_PAY_BILLS.RT_BILL_NO,IAS_POS_PAY_BILLS.PAY_CUR,IAS_POS_PAY_BILLS.PAY_RATE,IAS_POS_PAY_BILLS.PAY_AMT,IAS_POS_PAY_BILLS.DOC_BRN_NO FROM IAS_POS_BILL_MST,IAS_POS_PAY_BILLS WHERE IAS_POS_BILL_MST
SELECT 1 FROM IAS_POS_CHANGE_BILL_TMP WHERE IAS_POS_BILL_MST.BILL_NO = IAS_POS_CHANGE_BILL_TMP.BILL_NO ) ORDER BY IAS_POS_BILL_MST.BILL_DATE,IAS_POS_BILL_MST.AD_U_ID FOR UPDATE NOWAIT"SELECT COUNT(*) FROM IAS_POST_MST WHERE DOC_TYPE
SELECT COUNT(*) FROM IAS_POST_MST WHERE DOC_TYPE
SELECT DISTINCT BILL_NO,NVL(PAY_AMT,0) BILL_AMT,CARD_NO FROM IAS_POS_PAY_BILLS WHERE EXISTS
SELECT 1 FROM IAS_POS_COUPON_BILL_TMP WHERE IAS_POS_COUPON_BILL_TMP.BILL_NO = IAS_POS_PAY_BILLS.BILL_NO AND ROWNUM <= 1 ) AND IAS_POS_PAY_BILLS.CARD_NO IS NOT NULL AND BILL_TYPE = 1 AND NVL(DOC_POST,0) = 0 AND NVL(DOC_PST_SQ,0) = 0 ORDER BY BILL_NO"SELECT COUNT(*) FROM IAS_POST_MST WHERE DOC_TYPE
SELECT 1 FROM IAS_POS_PAID_CASH_TMP WHERE IAS_POS_PAID_CASH_TMP.RT_BILL_NO = IAS_POS_PAY_CASH.RT_BILL_NO ) ORDER BY RT_BILL_NO,RET_VOUCHER_DATE FOR UPDATE NOWAIT"SELECT COUNT(*) FROM IAS_POST_MST WHERE DOC_TYPE
SELECT MIN(BILL_DATE) FROM IAS_POS_PAY_BILLS WHERE NVL
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST011_strings.txt`.
