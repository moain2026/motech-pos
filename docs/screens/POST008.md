# POST008 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 671,240 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST008.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> مزامنة البيانات 
>  نظام نقاط البيع > عمليات النظام > 
>  مزامنة البيانات 
>  الاستخدام: 
>  تستخدم 
> الشاشة لنقل البيانات من السيرفر إلى نقطة المبيعات كنقل الأصناف الجديدة وتسعيرة 
> الأصناف والعملاء والعروض الترويجية وغيرها من البيانات، كما تستخدم لمزامنة 
> العمليات التي تمت في نقطة المبيعات ونقلها إلى السيرفر تمهيداً لترحيلها إلى نظام 
> الأونكس. 
>  ملاحظة: 
> تظهر هذه الشاشة في حالة استخدام نقاط البيع المنفصل، أما في حالة نقاط البيع 
> المتصل فلا تظهر وتتم عملية المزامنة من وإلى السيرفر بشكل 
> آلي. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة لمزامنة البيانات في نقاط البيع المنفصل كما 
> يلي: 
>  أولاً: 
>  نقل 
> البيانات من السيرفر الرئيسي إلى السيرفر الفرعي 
>  الخيارات 
> على يمين الشاشة هي خيارات تخص البيانات التي يتم نقلها من السيرفر 
> الرئيسي إلى السيرفر الفرعي فبعد أن يتم تحديد أحد هذه الخيارات أو تحديد الكل يتم 
> النقر على زر تحديث البيانات ليتم نقل البيانات من السيرفر الرئيسي إلى السيرفر 
> الفرعي. 
>  ثانياً: 
>  نقل 
> البيانات من السيرفر الفرعي إلى السيرفر الرئيسي 
>  بقية 
> الأزرار الموجودة في الشاشة هي خاصة بنقل الفواتير والمردودات والطلبات وغيرها من 
> السيرفر الفرعي إلى السيرفر الرئيسي كما يمكن نقلها بشكل آلي عند عمل الإعدادات 
> الخاصة. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (14)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| POS_SYNC_MNGMNT | DB | QIU | DELAYED | WHERE:MV_FLG = 1 |
| MOVE_DATA | ctrl | QIU | AUTOMATIC |  |
| MOVE_DATA_AUTO | ctrl | QIU | AUTOMATIC |  |
| LOV_MST_SLCT | ctrl | QIU | DELAYED |  |
| LOV_DTL_SLCT | DB | QIU | DELAYED |  |
| SCHDL_TM | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (9) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | TAB | ?×? | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOV_SLCT | CONTENT | 2014×354 | visible |
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
| WIN_LOV_SLCT |  | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (52)

**Packages (spec):** `GET_MV_CRT_RFRSH_DATE_PKG`


**Packages (body):** `GET_MV_CRT_RFRSH_DATE_PKG`


**Procedures/Functions (50):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_ATTCH_AVLQTY`, `CHECK_DB_BRANCH`, `CHECK_TRANSFER_SERIAL`, `CREATE_DB_LINK`, `CREATE_JOB_PROC`, `CREATE_MV_ITEM_MOVMNT`, `CREATE_VW_ITEM_MOVMNT`, `POST_TRANSFER_AUTO`, `UPDAT_CARD_PRC`, `UPD_AVL_QTY`, `UP_WTAVG`, `CREATE_MV_BRN_PRC`, `DROP_CONSTRAINTS`, `GET_PSWRD_FNC`, `SHW_ERR_MSG`, `CHECK_BILL_IN_SRVR_PRC`, `CALL_SCR_LNK_PRC`, `DYNAMIC_LIST`, `SYNCHRONIZE_DATA_SALES_PRC`, `SET_PRGRS_BAR_PRC`, `CHK_CNCT_SRVR_FNC`, `GET_SLCT_DATA`, `CHECK_DB_SRVR_TYP`

## 7. مكتبات مرفقة (10)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`, `POSSTPLIB`, `DFLTLIB`, `PLJSON`, `POSOTHRLIB`, `YSERPDBA2LIB`, `ERPLNGLIB`

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
| IAS_POS_BILL_MST | 12 |
| IAS_POS_RT_BILL_MST | 8 |
| IAS_POS_BILL_TEMP | 8 |
| DBA_SNAPSHOTS | 7 |
| SYS | 7 |
| IAS_WT_ITMS_TMP | 6 |
| IAS_WHTRNS_MST | 5 |
| IAS_POS_RT_BILL_TEMP | 5 |
| IAS_PARA_POS | 5 |
| POS_SYNC_MNGMNT | 4 |
| TEMPORARY | 4 |
| V_CNT | 4 |
| SUB | 4 |
| POS_BILL_DPLCT_VW | 4 |
| SALES_ORDER | 4 |
| IAS_PARA_INV | 3 |
| IAS_POS_MACHINE | 3 |
| S_PRD_MST | 3 |
| IAS_POS_PAY_CASH | 3 |
| IAS_POS_BILL_DTL | 3 |
| IAS_TRANSFER_OUT_SUB_TMP | 3 |
| IAS_TRANSFER_IN_SUB_TMP | 3 |
| IAS_TRANSFER_OUT_SUB_MAIN_TMP | 3 |
| IAS_TRANSFER_IN_SUB_MAIN_TMP | 3 |
| MACHINES | 3 |
| SALES_ORDER_TMP | 3 |
| POS_ITMS_NOT_FOUND_VW | 3 |
| TRANSFER_TYPES | 2 |
| WAREHOUSE_DETAILS | 2 |
| DBA_SNAPSHOT_LOGS | 2 |


_(+55 جدول/view آخر — انظر `_raw/POST008_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `POS_SNPSHT_PKG`, `GEN_PKG`, `POS_MOV_TRNS_PKG`, `YS_LOV_SLCT_PKG`, `GET_MV_CRT_RFRSH_DATE_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `GNR_TECH_SOLUTION_PKG`, `IAS_DBS_SYS_PKG`, `IAS_TRANSFER_PKG`, `IAS_POS_DISTIBUTED_DB_PKG`, `IAS_WCODE_PKG`, `IAS_POS_INV_PKG`, `POS_SYNC_JOB_AUTO_PKG`, `YS_SCR_PKG`, `IAS_POS_REQUEST_PKG`, `LOV_PKG`, `SETUP_PKG`, `POS_SYNC_PKG`, `POS_PROCDRE_FUNC_PKG`, `SRCH_DTL_PKG`, `IAS_FETCH_DATA_PKG`, `CID_ADDR_OP_PKG`, `IAS_PRMTR_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
select To_Char(Tr_Type)||'-'||Decode( ,1,Nvl(Tr_Name,Tr_E_Name),Nvl(Tr_E_Name,Tr_Name)),To_Char(Tr_Type) From transfer_types
Select 1 From priv_trnsfr_type
Select To_Char(w_code)||'- '||Decode( ,1,Nvl(w_name,w_e_name),Nvl(w_e_name,w_name)), To_Char(w_code) From warehouse_details
Select privilege_wh.w_code From privilege_wh
SELECT DISTINCT TO_CHAR(OWNR_TYP)||'-'||DECODE(OWNR_TYP,1,'YSPOS',2,'ONYX',3,'IAS_SYS',4,'IAS_DFLT_DATA') ,TO_CHAR(OWNR_TYP) FROM POS_SYNC_MNGMNT
SELECT COSTING_TYPE,WTAVG_TYPE,NVL(USE_EXPIRE_DATE,0),NVL(USE_BATCH_NO,0),NVL(USE_PAID,0),USE_POS_POINT_SYS,USE_E_INVOICE FROM IAS_PARA_INV,IAS_PARA_POS,IAS_PARA_GEN
SELECT DEF_WCODE,MOVE_DATA_TO_DB_LINK,DEF_BRN_NO FROM IAS_POS_MACHINE WHERE UPPER
SELECT 1 FROM DBA_VIEWS WHERE OWNER = USER AND VIEW_NAME = ''IAS_V_ITM_AVL_QTY'' AND ROWNUM <= 1"SELECT COUNT(TABLE_NAME) FROM ALL_TABLES WHERE UPPER
SELECT 1 FROM DBA_SNAPSHOTS WHERE TABLE_NAME = ''IAS_ITM_MST'' AND OWNER = USER AND ROWNUM <= 1"SELECT 1 FROM DBA_SNAPSHOT_LOGS WHERE MASTER
SELECT F_YR_NO,F_YR_NO FROM S_PRD_MST
SELECT COUNT(*) FROM IAS_POS_BILL_MST WHERE NVL
SELECT COUNT(*) FROM IAS_POS_RT_BILL_MST WHERE NVL
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST008_strings.txt`.
