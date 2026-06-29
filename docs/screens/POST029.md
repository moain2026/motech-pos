# POST029 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 1,811,904 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST029.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> الاستلام المخزني 
>  نظام نقاط البيع > عمليات النظام > 
>  الاستلام المخزني 
>  الاستخدام: 
> تستخدم الشاشة لاستلام التحويلات المخزنية من المخازن الأخرى، أو بالأخص استلام 
> طلبات التحويلات التي تم طلبها من المخازن الأخرى، وبمجرد حفظ الاستلام المخزني 
> سيتم نقله إلى نظام الأونكس في حالة وجود اتصال بين النقطة والسيرفر، وفي حالة عدم 
> وجود اتصال يتم النقل يدوياً عند توفر اتصال. 
>  تلميح: 
> تظهر شاشة الاستلام المخزني إذا تم تفعيل متغير (استخدام التحويل والاستلام 
> المخزني) في متغيرات نظام نقاط البيع. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر الإضافة كما 
> يلي: 
>  أولاً: البيانات الرئيسية 
>  - 
>  الفرع : يظهر 
>  الفرع يظهر آلياً 
> وهو الفرع الذي دخل فيه المستخدم ويمكن تغيير الفرع بموجب الصلاحيات الممنوحة 
> للمستخدم. 
>  - 
>  نوع 
> الاستلام: اختيار نوع 
> الاستلام من 
> بين الأنواع المعرفة في شاشة 
> (أنواع الاستلام) في تهيئة نظام المخازن. 
>  - 
>  رقم 
> المخزن: يستخدم لاختيار 
> المخزن المحول إليه والمعني باستلام الأصناف في إطار الفرع وللمستخدم صلاحية 
> الإضافة عليه، ويعرض النظام آلياً المخزن المحول منه وقد يكون نفس المخزن في حالة 
> مرتجع التحويل. 
>  - 
>  المخزن 
> المحول إليه: يظهر آلياً بعد 
> اختيار رقم التحويل وإنزاله. 
>  - 
>  رقم 
> الاستلام: يظهر تسلسل آلي 
> للاستلام المخزني. 
>  - 
>  تاريخ 
> الاستلام: يستخدم لإدخال تاريخ 
> الاستلام المخزني . 
>  - 
>  البيان: 
>  يتم إضافة بيان 
> توضيحي للاستلام المخزني، مع ملاحظة أنه يمكن تعديل البيان بعد حفظ العملية 
> باستخدام زر التعديل أمام حقل البيان - بدون النقر على زر التعديل في شريط الأدوات 
> - إذا تم منح المستخدم صلاحية التعديل من صلاحيات المدخلات (شاشة 
> الحقول). 
>  - 
>  رقم 
> المرجع: إدخال رقم مرجع 
> الاستلام المخزني - رقماً أو حرفاً - 
> كأن يكون رقم المستند اليدوي أو رقم ملف وغيرها من البيانات التي يستند لها 
> المستخدم في إصدار العملية أو يستفيد منها في عملية البحث. 
>  - 
>  مركز 
> التكلفة: يتم اختيار مركز 
> التكلفة من القائمة. 
>  - 
>  رقم 
> السائق: يظهر السائق 
> آلياً والذي تم تحديده مس

## 2. Data Blocks (35)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| IAS_WHTRNS_MST | DB | QIU | DELAYED | WHERE:tr_inout_type = 2; ORDER:Ias_Whtrns_Mst.Tr_Date Desc , |
| IAS_WHTRNS_DTL | DB | QIU | DELAYED | ORDER:rcrd_no |
| MST_ITEM_SERIALNO | ctrl | QIU | AUTOMATIC |  |
| DUMMY_ITEM_SERIALNO | ctrl | QIU | AUTOMATIC | WHERE:1=2 |
| SLCT_ITEM_SERIALNO | ctrl | QIU | DELAYED |  |
| IAS_ITEM_SERIALNO | ctrl | QIU | DELAYED | WHERE:DOC_TYPE = 8; ORDER:RCRD_NO |
| OTHER_MOVEMNET | ctrl | Q-- | DELAYED | ORDER:serial |
| ITEM_MOVE | DB | Q-- | DELAYED | ORDER:i_date,doc_sequence |
| SEARCH_ITEM_MST | ctrl | QIU | DELAYED |  |
| SEARCH_ITEM_DTL | DB | QIU | DELAYED |  |
| PARAMTRS_ATTACH | ctrl | QIU | AUTOMATIC |  |
| IAS_ITM_ATTACH_MOV_DUMMY | ctrl | QIU | AUTOMATIC |  |
| IAS_ITM_ATTACH_MOVEMENT | DB | QIU | AUTOMATIC | ORDER:RCRD_NO |
| DFLT_OPTIONS | ctrl | QIU | AUTOMATIC |  |
| IAS_CONN_ITM_MSUR_UNT | DB | QIU | AUTOMATIC |  |
| PARAMTRS_SRCH | ctrl | QIU | AUTOMATIC |  |
| SEARCH_ITEM | DB | QIU | DELAYED |  |
| INV_WRHS_TRNSFR_EXPNS | ctrl | QIU | DELAYED | WHERE:DOC_NO=:1 AND DOC_SER=:2; ORDER:RCRD_NO |
| SHW_ITEM_SERIALNO | DB | Q-- | DELAYED |  |
| DMY_SHW_RCRD | ctrl | Q-- | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| CLNDR | ctrl | QIU | DELAYED |  |
| FTR | ctrl | QIU | AUTOMATIC |  |
| SRCH_DTL | ctrl | QIU | AUTOMATIC |  |
| LOV_MST_SLCT | ctrl | QIU | DELAYED |  |
| LOV_DTL_SLCT | DB | QIU | DELAYED |  |
| BLK_SRCH | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (30) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_SRCH_MST_DTL | STACKED | 450×40 | hidden |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| CNV_SHW_RCRD | CONTENT | 300×398 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | STACKED | 2560×220 | visible |
| MAIN2 | STACKED | 343×203 | visible |
| MAIN3 | CONTENT | 533×302 | visible |
| MAIN4 | STACKED | 762×146 | visible |
| MAIN5 | CONTENT | 350×200 | visible |
| MAIN6 | CONTENT | 720×295 | visible |
| MAIN7 | STACKED | 640×324 | visible |
| MAIN9 | STACKED | 341×230 | visible |
| MAIN10 | CONTENT | 230×99 | visible |
| MAIN11 | CONTENT | 574×209 | visible |
| MAIN12 | STACKED | 735×139 | visible |
| MAIN14 | CONTENT | 750×307 | visible |
| MAIN15 | TAB | ?×? | visible |
| MAIN17 | STACKED | 796×266 | visible |
| MAIN18 | CONTENT | 752×196 | visible |
| MAIN19 | CONTENT | 350×200 | visible |
| MAIN20 | CONTENT | 484×295 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_SRCH_DTL | STACKED | 450×40 | hidden |
| CNV_WT | STACKED | 295×120 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| FTR | STACKED | 1022×65 | visible |
| CNV_LOV_SLCT | CONTENT | 2014×354 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (21)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_LOV |  | DIALOG | true |
| WIN_SHW_RCRD |  | DIALOG | false |
| MAIN |  | DOCUMENT | false |
| WIN1 | Item Movement/حركة الصنف | DIALOG | true |
| WIN2 |  | DIALOG | true |
| WIN3 | Item Search | DIALOG | true |
| WIN4 |  | DIALOG | true |
| WIN6 | Item Movement/حركة الصنف | DIALOG | true |
| WIN7 | Expenses | DIALOG | false |
| WIN8 | Item Attach | DIALOG | true |
| WIN9 |  | DIALOG | true |
| WIN10 |  | DIALOG | true |
| WIN_WT | Inv Weight System/نظام الأوزان | DIALOG | true |
| WIN12 | Imp_Excel | DIALOG | true |
| WIN13 | Matching Serial Numbers | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN15 |  | DIALOG | true |
| WIN_LOV_SLCT |  | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-DUP-ITEM`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (103)

**Packages (spec):** `ATTACH_ITEM_PKG`, `FETCH_ITMS_PK`, `IAS_WT_PKG`, `FETCH_ITMS_SRCH_PKG`, `INV_DEV_PKG`, `DEV_PKG`, `POS_TR_REQ_ORDR_PKG`


**Packages (body):** `ATTACH_ITEM_PKG`, `FETCH_ITMS_PK`, `IAS_WT_PKG`, `FETCH_ITMS_SRCH_PKG`, `INV_DEV_PKG`, `DEV_PKG`, `POS_TR_REQ_ORDR_PKG`


**Procedures/Functions (89):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `AUDIT_PROC`, `CALC_WTAVG`, `CHECK_ACODE_STK_ACY`, `CHECK_AC_CC`, `CHECK_DB_BRANCH`, `CHECK_ITEM`, `CHECK_QTY_RECEIVE_FROM_WHTRNS`, `CHECK_QTY_SERIALNO`, `CONTROL_BY_BATCH_COLS`, `DEL_ITM_REC`, `DYNAMIC_RECORD_GROUP`, `FILL_ITEMS`, `GET_REC_BILL_DET`, `GET_SERIAL`, `GET_SRL_DESC_NM`, `ICODE_ENTER_QRY`, `INSTALL_TR`, `INSTALL_TR_FROM_DB_LINK`, `NO_OF_DECIMAL`, `POSITION_SRCH`, `SEARCH_CONDITION`, `SETTIMER`, `UPDATEABLE_REC_WT`, `CALL_ITM_TRNS_SCR`, `FORMS_TO_EXCEL`, `CALL_LOV_ITM`, `DEL_TIMER_PRC`, `CREATE_TIMER_PRC`, `GET_IMAGE_ITEM`, `GET_SLCT_DATA`…

## 7. مكتبات مرفقة (5)

`D2KWUTIL`, `ERP_YSLIB`, `YSERPDBALIB`, `D2KCOMN`, `EDTNLIB`

## 8. Alerts (8)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| AL_ALT_REF | تنبيه | STOP | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| ALT_ZERO_COST | تنبيه | STOP | نعم |
| ALRT_MOV_TR | تنبيه | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_WHTRNS_MST | 39 |
| IAS_ITM_MST | 29 |
| WAREHOUSE_DETAILS | 24 |
| IAS_WHTRNS_DTL | 21 |
| IAS_WHTRNS_MST_MV | 16 |
| PRIV_TRNSFR_TYPE | 12 |
| IAS_ITM_WCODE | 8 |
| PRIVILEGE_WH | 7 |
| PRIVILEGE_GC | 7 |
| PRIV_ACC | 6 |
| S_BRN_USR_PRIV | 6 |
| ITEM_MOVEMENT | 6 |
| IAS_POS_MACHINE | 5 |
| TRANSFER_TYPES | 4 |
| COST_CENTER_TYPES | 4 |
| CUSTOMER | 4 |
| USER_R | 4 |
| IAS_WHTRNS_DTL_MV | 4 |
| IAS_SHW_DOC_PRIV | 3 |
| COST_CENTERS | 3 |
| PRIVILEGE_CC | 3 |
| IAS_PROJECTS | 3 |
| IAS_PRIV_CUSTOMER | 3 |
| S_PRD_MST | 3 |
| ACCOUNT_CURR | 3 |
| IAS_POS_SERVER_DB_LINK | 2 |
| IAS_PRIV_PROJECTS | 2 |
| IAS_ACTVTY | 2 |
| IAS_PRIV_ACTVTY | 2 |
| ACCOUNT | 2 |


_(+38 جدول/view آخر — انظر `_raw/POST029_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_ITM_PKG`, `IAS_WCODE_PKG`, `YS_GEN_PKG`, `ATTACH_ITEM_PKG`, `IAS_CHECK_SYS_PKG`, `YS_AC_DTL_PKG`, `IAS_USR_PKG`, `YS_LOV_SLCT_PKG`, `IAS_PJ_PKG`, `IAS_ACODE_PKG`, `DATE_CNVRTR_PKG`, `IAS_WT_PKG`, `FETCH_ITMS_SRCH_PKG`, `POS_TR_REQ_ORDR_PKG`, `IAS_ACTV_PKG`, `INV_DEV_PKG`, `DEV_PKG`, `LOV_PKG`, `SRCH_DTL_PKG`, `IAS_CSHBNK_PKG`, `IAS_FETCH_DATA_PKG`, `IAS_DOC_SERIAL_PKG`, `IAS_POS_INV_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT DB_LINK_NM FROM IAS_POS_SERVER_DB_LINK WHERE DB_LINK_NM
SELECT TR_TYPE FROM TRANSFER_TYPES WHERE W_CODE_DFLT = :b1 AND TR_REC = 2"SELECT TR_TYPE FROM TRANSFER_TYPES WHERE W_CODE_DFLT
SELECT TR_A_CODE,AC_CODE_DTL,AC_DTL_TYP FROM WAREHOUSE_DETAILS WHERE W_CODE
Select 1 From Ias_Whtrns_Mst
SELECT 1 FROM IAS_WHTRNS_MST WHERE TR_INOUT_TYPE = 2 AND TR_SER = :b1 AND NVL(TR_POST,0) = 1 AND ROWNUM <= 1"SELECT NVL(EXTERNAL_POST,0) FROM IAS_WHTRNS_MST WHERE TR_INOUT_TYPE
SELECT 1 FROM IAS_WHTRNS_MST WHERE TR_INOUT_TYPE = 2 AND TR_SER != :b1 AND F_TR_SER = :b2 AND ROWNUM <= 1"SELECT DB_LINK_NAME FROM WAREHOUSE_DETAILS WHERE W_CODE
UPDATE IAS_WHTRNS_MST SET PROCESSED=0 WHERE TR_INOUT_TYPE = 1 AND IAS_WHTRNS_MST.TR_NO = :b1 AND IAS_WHTRNS_MST.TR_SER = :b2" FILL_ALL_LIST_PRC STANDARD /LERP_YSLIB GEN_PKG FORMS40 FORMS4C YSPOS35 TRANSFER_TYPES IAS202535 T
Select To_Char(Cc_Code)||'- '||Decode( Nvl(Cc_A_Name,Cc_E_Name), Nvl(Cc_E_Name,Cc_A_Name)) CC_name, To_Char(Cc_Code) From cost_centers
Select cc_type From cost_center_types Where affected_by_trans=1) And(( =1) Or Exists(Select Cc_Code from privilege_cc
Select To_Char(Pj_No)||'- '||Decode( Nvl(Pj_A_Name,Pj_E_Name), Nvl(Pj_E_Name,Pj_A_Name)) Pj_Name, To_Char(Pj_No) From Ias_Projects
Select To_Char(Actv_No)||'- '||Decode( Nvl(Actv_A_Name,Actv_E_Name), Nvl(Actv_E_Name,Actv_A_Name)) Actv_Name, To_Char(Actv_No) From Ias_Actvty
Select Actv_No From Ias_Priv_Actvty Where U_Id= And Actv_No=Ias_Actvty.Actv_No And Nvl(Add_Flag,0)=1 And RowNum<=1)) Order By Actv_No Select To_Char(w_code)||'- '||Decode( ,1,Nvl(w_name,w_e_name),Nvl(w_e_name,w_name)), To_Char(w_code) From warehouse_details
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST029_strings.txt`.
