# POST018 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 739,992 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST018.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> جرد الآلات 
>  نظام نقاط البيع > عمليات النظام > 
>  جرد الآلات 
>  الاستخدام: 
>  تنفذ 
> المنشأة عملية الجرد أحياناً باستخدام آلة من الآلات المتخصصة في عملية الجرد مثل 
> (البوكيت بي سي، بعض أجهزة الهاتف المحمول) وغيرها من الأجهزة، وتعمل شاشة جرد 
> الآلات على تلك الأجهزة لتنفيذ عملية الجرد ويتم نقل بيانات الجرد باستخدام خاصية 
> المزامنة بين نظام الأونكس والجهاز الذي تم بواسطته تنفيذ عملية الجرد. 
>  طريقة استخدام الشاشة 
>  تنتقل البيانات إلى هذه الشاشة آلياً عبر الاتصال المباشر بين الجهاز الذي 
> تنفذ من خلاله عمليات الجرد وبين نظام الأونكس، أو عبر أنظمة الجرد الذي نفذت من 
> خلاله عملية الجرد وبين نظام الأونكس بعد الانتهاء من عملية الجرد عن طريق استخدام 
> خاصية المزامنة. 
>  ملاحظة: 
> يوفر النظام إمكانية قراءة الصنف عبر QR_CODE في 
> شاشة جرد الآلات وشاشة الجرد اليدوي. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (16)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_INV_MACHINE_MST | DB | QIU | DELAYED | ORDER:Ias_Inv_Machine_Mst.Inv_Date D |
| IAS_INV_MACHINE_DTL | DB | QIU | DELAYED | ORDER:RCRD_NO |
| SEARCH_ITEM_MST | ctrl | QIU | DELAYED |  |
| SEARCH_ITEM_DTL | DB | QIU | DELAYED |  |
| DFLT_OPTIONS | ctrl | QIU | AUTOMATIC |  |
| IAS_CONN_ITM_MSUR_UNT | DB | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |
| DMY_SHW_RCRD | ctrl | Q-- | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| SRCH_DTL | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (17) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_SRCH_MST_DTL | STACKED | 450×40 | hidden |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | STACKED | 1499×267 | visible |
| MAIN2 | CONTENT | 533×302 | visible |
| MAIN3 | STACKED | 762×146 | visible |
| MAIN6 | CONTENT | 453×169 | visible |
| MAIN9 | STACKED | 409×272 | visible |
| MAIN10 | TAB | ?×? | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_SHW_RCRD | CONTENT | 300×398 | visible |
| CNV_SRCH_DTL | STACKED | 450×40 | hidden |
| CNV_WT | STACKED | 295×120 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (10)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN1 | Item Search | DIALOG | true |
| WIN4 | Weight | DIALOG | true |
| WIN7 | Advance Option | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_SHW_RCRD |  | DIALOG | false |
| WIN_WT | Inv Weight System | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (51)

**Packages (spec):** `FETCH_ITMS_PK`, `IAS_WT_PKG`


**Packages (body):** `FETCH_ITMS_PK`, `IAS_WT_PKG`


**Procedures/Functions (47):** `WHEN_TAB_PAGE_CHANGED_PRC`, `KEY_LISTVAL_PRC`, `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `AUTO_COMMIT`, `CHECK_DB_BRANCH`, `CONTROL_BY_BATCH_COLS`, `FILL_ITEMS`, `GET_REC_BILL_DET`, `GET_SERIAL`, `ICODE_ENTER_QRY`, `IMP_FROM_TEXT`, `IMP_F_EXCEL`, `LIST_LOV`, `POSITION_SRCH`, `REFRESH_AVL_QTY`, `SEARCH_CONDITION`, `FORMS_TO_EXCEL`, `GET_ITEM_INFO`, `CALL_SCR_LNK_PRC`, `GET_QR_INFO`

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
| IAS_ITM_MST | 15 |
| PRIVILEGE_GC | 8 |
| IAS_INV_MACHINE_MST | 7 |
| USER_R | 5 |
| STORAGE | 5 |
| WAREHOUSE_DETAILS | 4 |
| IAS_PRIV_INV_TYPE | 3 |
| PRIVILEGE_WH | 3 |
| IAS_SHW_DOC_PRIV | 3 |
| IAS_INV_MACHINE_DTL | 3 |
| IAS_ITM_UNT_BARCODE | 3 |
| IAS_INV_TYPES | 2 |
| S_BRN_USR_PRIV | 2 |
| IAS_POS_MACHINE | 2 |
| IAS_ALTERNATIVE_GROUP | 2 |
| IAS_V_ITM_AVL_QTY | 2 |
| ITEM | 2 |
| IAS_ATTACH_MST | 1 |
| IAS_PARA_GEN | 1 |
| PRIVILEGE_FIXED | 1 |
| IAS_PARA_INV | 1 |
| S_BRN | 1 |
| DBA_SNAPSHOTS | 1 |
| ITEM_TYPES | 1 |
| ITEM_MOVEMENT | 1 |
| HEAD | 1 |
| IAS_ITEM_PRICE | 1 |
| VI_DETAILS | 1 |
| IAS_ITEMS_ACTIVITY_PRIV | 1 |
| EX_RATE | 1 |


_(+14 جدول/view آخر — انظر `_raw/POST018_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_ITM_PKG`, `IAS_CHECK_SYS_PKG`, `IAS_WT_PKG`, `IAS_USR_PKG`, `DATE_CNVRTR_PKG`, `SRCH_DTL_PKG`, `IAS_DOC_SERIAL_PKG`, `IAS_DBS_SYS_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_WCODE_PKG`, `IAS_BRN_PKG`, `GNR_GET_ITM_QR_CODE_PKG`, `IAS_PRMTR_PKG`, `IAS_AUD_SYS_PKG`, `COMM_PKG`, `SETUP_PKG`, `IAS_FETCH_DATA_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT EXCEL_PATH FROM USER_R WHERE U_ID
SELECT MIN(INV_TYPE) FROM IAS_INV_TYPES WHERE EXISTS
SELECT 1 FROM IAS_INV_MACHINE_MST WHERE NVL(INV_SER,0) = NVL(:b1,0) AND NVL(INV_NO,0) = NVL(:b2,0) AND NVL(EXTERNAL_POST,0) != 0 AND ROWNUM <= 1"SELECT 1 FROM IAS_INV_MACHINE_MST WHERE NVL
Select Inv_type||'-'||Decode( ,1,Nvl(Inv_Name,Inv_E_Name), Nvl(Inv_E_Name,Inv_Name))Inv_Name,To_Char(Inv_Type) Inv_Type From Ias_Inv_Types
Select W_Code||'-'||Decode( ,1,Nvl(W_Name,W_E_Name), Nvl(W_E_Name,W_Name))W_Name,To_Char(W_Code) W_Code From Warehouse_Details
SELECT 1 FROM IAS_SHW_DOC_PRIV
SELECT USER_VIEW_DOC_ENTR,SHOW_AVL_QTY_IN_MAN_INV FROM PRIVILEGE_FIXED WHERE U_ID
SELECT CONNECTION_TYPE FROM USER_R WHERE U_ID
SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT MACHINE_NO FROM IAS_POS_MACHINE WHERE UPPER
SELECT MACHINE_NO FROM USER_R WHERE U_ID
SELECT COUNT(1) FROM S_BRN
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST018_strings.txt`.
