# POS_IMPXLS_AVLQTY — توثيق شاشة Onyx Pro POS

> النوع: **POS*** — خدمي/مكتبة (Utility)  
> الحجم: 300,340 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POS_IMPXLS_AVLQTY.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **خدمي/مكتبة (Utility)**. أكثر الجداول استخداماً: `IAS_PRINT_BARCODE_TMP`, `IAS_ITM_MST`, `IAS_PRICING_LEVELS`, `WAREHOUSE_DETAILS`, `SECOND`, `USER_R`.

## 2. Data Blocks (10)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| CLNDR | ctrl | QIU | DELAYED |  |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| MAIN | ctrl | QIU | AUTOMATIC |  |
| ITEMS | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | false |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-DUPREC`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (35)

**Packages (spec):** `OLEPACK`


**Packages (body):** `OLEPACK`


**Procedures/Functions (33):** `WHEN_TAB_PAGE_CHANGED_PRC`, `KEY_LISTVAL_PRC`, `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `EXP_TO_EXCEL`, `IMP_F_EXCEL`, `POS_NEW`, `SHOW_CLMN`, `GET_SALES_DISC_PRC`, `CALL_SCR_LNK_PRC`

## 7. مكتبات مرفقة (5)

`POSLIB`, `ERP_YSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`

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
| IAS_PRINT_BARCODE_TMP | 6 |
| IAS_ITM_MST | 4 |
| IAS_PRICING_LEVELS | 3 |
| WAREHOUSE_DETAILS | 3 |
| SECOND | 2 |
| USER_R | 2 |
| IAS_PARA_GEN | 1 |
| PRIVILEGE_FIXED | 1 |
| IAS_ITM_DTL | 1 |
| IAS_ITM_UNT_BARCODE | 1 |
| IAS_VNDR_ITM | 1 |
| S_CLNDR_LIST | 1 |
| EXCEL | 1 |
| IAS_ITEM_PRICE | 1 |
| USER | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_ITM_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `LOV_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`, `IAS_PRMTR_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(USE_EXPIRE_DATE,0),NVL(USE_BATCH_NO,0),COSTING_TYPE,WTAVG_TYPE,NVL(CONN_ITM_WITH_MORE_VNDR,0),NVL(SALES_DISC_TYPE,0),NVL(SALES_DISC_WCODE,0),NVL(USE_ONE_BARCODE_FOR_ITM,0) FROM IAS_PARA_GEN,IAS_PARA_INV,IAS_PARA_AP,IAS_PARA_AR
SELECT NVL(HIDE_COST,0),NVL(ALLOW_EXP_XLS,0) FROM PRIVILEGE_FIXED WHERE U_ID
SELECT LEV_NO,A_CY FROM IAS_PRICING_LEVELS WHERE NVL
Delete From Ias_Print_Barcode_Tmp Where Ad_U_Id = Commit IAS_GEN_PKGYSPOS1GET_CURDATE IAS_GEN_PKG DD/MM/YYYY IAS_GEN_PKGYSPOS1GET_CUR_RATEIAS IAS_GEN_PKG Delete From Ias_Print_Barcode_Tmp Wh
SELECT LEV_NO FROM IAS_PRICING_LEVELS WHERE NVL(LEV_DEFLT,0) = 1"SELECT A_CY FROM IAS_PRICING_LEVELS WHERE NVL
SELECT BARCODE FROM IAS_ITM_DTL WHERE I_CODE = :b1 AND ROWNUM <= 1"SELECT BARCODE FROM IAS_ITM_UNT_BARCODE WHERE I_CODE
INSERT INTO IAS_PRINT_BARCODE_TMP ( I_CODE,I_NAME,ITM_UNT,I_DESC,ITM_SIZE,ITEM_TYPE,BARCODE,EXPIRE_DATE,BATCH_NO,I_PRICE,I_QTY,AD_U_ID,TRMNL_NAME,ITM_DISC_AMT )
SELECT 1 FROM IAS_PRINT_BARCODE_TMP WHERE I_CODE IS NOT NULL AND ROWNUM <= 1"SELECT I_CODE,I_NAME,ITM_UNT,I_DESC,ITM_SIZE,ITEM_TYPE,BARCODE,EXPIRE_DATE,BATCH_NO,I_PRICE,I_QTY,ITM_DISC_AMT,RCRD_NO FROM IAS_PRINT_BARCODE_TMP WHERE AD_U_ID
SELECT TO_CHAR(INCOME_DATE,''DD/MM/YYYY'') FROM IAS_ITM_MST WHERE I_CODE
SELECT TO_CHAR(W_CODE) WCODE,DECODE(:b1,1,NVL(W_NAME,W_E_NAME),NVL(W_E_NAME,W_NAME)) WH_NM FROM WAREHOUSE_DETAILS ORDER BY W_CODE
Select Excel.xlsx File Select Excel(.Xls) OR (.Xlsx) File Enter Excel Path Error excel path......... excel system [Open( EXCEL Items.Batch_No Items.Expire_Date Items.Rcrd_No VA_ERR Items.I_Code Items.I_Name Items.Itm_Unt IAS_GEN_PKGYSPOS1GET_PROMPTI IAS_GEN_PKG Bar.Save_Btn SELECT DECODE(:b1,1,NVL(I_NAME,I_E_NAME),NVL(I_E_NAME,I_NAME)) FROM IAS_ITM_MST WHERE I_CODE
Select To_Char(Clndr_Code)||'-'||Cid_Addr_Op_Pkg.Get_Trns_Lbl (P_Cntry_2_Ltr =>'', P_Lang_Code =>'', P_Lang_Id => P_Cid_Name_Lbl =>Clndr_Nm_Lbl) Clndr_Nm_Lbl ,TO_CHAR(Clndr_Code) From S_Clndr_List WHERE CLNDR_CODE
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POS_IMPXLS_AVLQTY_strings.txt`.
