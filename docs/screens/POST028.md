# POST028 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 2,230,276 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST028.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> التحويل المخزني 
>  نظام نقاط البيع > عمليات النظام > 
>  التحويل المخزني 
>  الاستخدام: 
> تستخدم الشاشة لتحويل الأصناف من مخزن إلى مخزن آخر إما بالإدخال المباشر للتحويل 
> أو بالاعتماد على طلب تحويل من المخزن (جهة الطلب) إذا كان ربط التحويل بطلب 
> التحويل إجبارياً، علماً أن الطلبات المعتمدة هي التي يمكن التعامل معها وإنزالها، 
> وبمجرد حفظ التحويل سيتم نقله إلى نظام الأونكس في حالة وجود اتصال بين النقطة 
> والسيرفر لتتمكن جهة الطلب (المخزن المحول إليه) إنزال هذا التحويل واستلامه في 
> شاشة الاستلام المخزني. 
>  تلميح: 
> تظهر شاشة التحويل المخزني إذا تم تفعيل متغير (استخدام التحويل والاستلام المخزني) 
> في متغيرات نظام نقاط البيع. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر الإضافة كما 
> يلي: 
>  أولاً: البيانات الرئيسية 
>  - 
>  الفرع: 
>  يظهر الفرع آلياً 
> وهو الفرع الذي دخل فيه المستخدم ويمكن تغيير الفرع بموجب الصلاحيات 
> الممنوحة. 
>  - 
>  نوع 
> التحويل: يتم اختيار نوع 
> التحويل من 
> بين الأنواع المعرفة في شاشة 
> (أنواع التحويل)، وقد يعتمد عليه تسلسل التحويل إذا تم تحديد خيار حسب النوع في 
> متغير تسلسل التحويلات المخزنية، مع ملاحظة أنه لا يمكن إدخال بيانات التحويل 
> المخزني إذا كان النوع (مرتبط بطلب) وبالتالي سيكون إجبارياً إدخال طلب تحويل 
> واعتماده ثم إنزاله في شاشة التحويل المخزني. 
>  - 
>  رقم 
> المخزن/ المخزن المحول إليه: يتم تحديد المخزن 
> الذي سيتم التحويل منه، والمخزن الذي سيتم تحويل الكمية إليه وليس بالضرورة أن 
> يكون مرتبط بالفرع ويجب أن يكون للمستخدم صلاحية التحويل. 
>  - 
>  رقم 
> التحويل: يظهر تسلسل آلي 
> للتحويل المخزني. 
>  - 
>  تاريخ 
> التحويل: يستخدم لإدخال 
> تاريخ أمر التحويل المخزني. 
>  - 
>  البيان: 
>  يتم 
> إضافة بيان توضيحي لأمر التحويل المخزني 
>  - 
>  السبب: 
>  في هذا الحقل 
> يدون المستخدم سبب التحويل المخزني. 
>  - 
>  رقم 
> المرجع: إدخال رقم مرجع 
> التحويل المخزني - رقماً أو حرفاً - 
> كأن يكون رقم المستند اليدوي أو رقم ملف وغيرها من البيانات التي يستند لها 
> المستخدم في إصدار العملية أو يستفيد منها في 

## 2. Data Blocks (36)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| IAS_WHTRNS_MST | DB | QIU | DELAYED | WHERE:tr_Inout_Type = 1 And Exists (Select 1 F; ORDER:Ias_Wh |
| IAS_WHTRNS_DTL | DB | QIU | DELAYED | ORDER:rcrd_no |
| MST_ITEM_SERIALNO | ctrl | QIU | AUTOMATIC |  |
| SLCT_ITEM_SERIALNO | DB | QIU | DELAYED | ORDER:SERIALNO |
| IAS_ITEM_SERIALNO | ctrl | QIU | DELAYED | WHERE:DOC_TYPE = 7; ORDER:RCRD_NO |
| OTHER_MOVEMNET | ctrl | Q-- | DELAYED | ORDER:serial |
| ITEM_MOVE | DB | Q-- | DELAYED | ORDER:i_date,doc_sequence |
| SEARCH_ITEM_MST | ctrl | QIU | DELAYED |  |
| SEARCH_ITEM_DTL | DB | QIU | DELAYED |  |
| PARAMTRS_ATTACH | ctrl | QIU | AUTOMATIC |  |
| IAS_ITM_ATTACH_MOV_DUMMY | ctrl | QIU | AUTOMATIC |  |
| DUMMY_ITEM_SERIALNO | ctrl | QIU | AUTOMATIC | WHERE:1=2; ORDER:SERIALNO |
| IAS_ITM_ATTACH_MOVEMENT | ctrl | QIU | AUTOMATIC | ORDER:RCRD_NO |
| IAS_CONN_ITM_MSUR_UNT | ctrl | QIU | AUTOMATIC |  |
| KIT_ITEM | ctrl | QIU | DELAYED |  |
| KIT_ITEMS_DETAIL | ctrl | QIU | DELAYED |  |
| DFLT_OPTIONS | ctrl | QIU | AUTOMATIC |  |
| ADV_OPTIONS | ctrl | QIU | AUTOMATIC |  |
| DMY_SHW_RCRD | ctrl | Q-- | AUTOMATIC |  |
| LOV_MST_SLCT | ctrl | QIU | DELAYED |  |
| LOV_DTL_SLCT | DB | QIU | DELAYED |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| PARAMTRS_SRCH | ctrl | QIU | AUTOMATIC |  |
| SEARCH_ITEM | DB | QIU | DELAYED |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| FTR | ctrl | QIU | AUTOMATIC |  |
| BLK_SND | ctrl | QIU | AUTOMATIC |  |
| SRCH_DTL | ctrl | QIU | AUTOMATIC |  |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (33) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_SRCH_MST_DTL | STACKED | 450×40 | hidden |
| CNV_SND_MAIN | CONTENT | 352×237 | visible |
| CNV_SND | TAB | ?×? | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOV_SLCT | CONTENT | 2014×354 | visible |
| CNV_SHW_RCRD | CONTENT | 300×398 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | STACKED | 2600×208 | visible |
| MAIN2 | STACKED | 343×203 | visible |
| MAIN3 | CONTENT | 633×338 | visible |
| MAIN4 | STACKED | 949×150 | visible |
| MAIN5 | CONTENT | 350×200 | visible |
| MAIN6 | CONTENT | 720×295 | visible |
| MAIN7 | STACKED | 540×324 | visible |
| MAIN9 | STACKED | 341×230 | visible |
| MAIN10 | CONTENT | 574×209 | visible |
| MAIN11 | STACKED | 735×139 | visible |
| MAIN14 | CONTENT | 453×169 | visible |
| MAIN15 | TAB | ?×? | visible |
| MAIN16 | STACKED | 409×320 | visible |
| MAIN19 | CONTENT | 350×200 | visible |
| MAIN18 | CONTENT | 748×307 | visible |
| MAIN17 | STACKED | 999×265 | visible |
| CNV_WT | STACKED | 295×120 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_SRCH_DTL | STACKED | 450×40 | hidden |
| CNV_PRNT | CONTENT | 302×122 | visible |
| FTR | STACKED | 1022×65 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| CNV_KIT_ITM | CONTENT | 633×338 | visible |
| CNV_ITM_CMPNT | STACKED | 715×182 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (21)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_SND | Send Options | DIALOG | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_LOV_SLCT |  | DIALOG | true |
| WIN_SHW_RCRD |  | DIALOG | false |
| WIN_LOV |  | DIALOG | true |
| WIN_ITM_CMPNNT | Item Component | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN1 | Item Movement/حركة الصنف | DIALOG | true |
| WIN2 |  | DIALOG | true |
| WIN3 | Item Search | DIALOG | true |
| WIN4 |  | DIALOG | true |
| WIN6 | Item Movement/حركة الصنف | DIALOG | true |
| WIN7 | Attach Items | DIALOG | true |
| WIN10 | Weight | DIALOG | true |
| WIN11 | Advance Option/خيارات متقدمة | DIALOG | true |
| WIN12 | Imp_Excel | DIALOG | true |
| WIN15 |  | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_WT | Inv Weight System/نظام الأوزان | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (161)

**Packages (spec):** `ATTACH_ITEM_PKG`, `FETCH_ITMS_PK`, `IAS_WT_PKG`, `INV_DEV_PKG`, `FETCH_ITMS_SRCH_PKG`, `DEV_PKG`, `POS_TR_REQ_ORDR_PKG`


**Packages (body):** `ATTACH_ITEM_PKG`, `FETCH_ITMS_PK`, `IAS_WT_PKG`, `INV_DEV_PKG`, `FETCH_ITMS_SRCH_PKG`, `DEV_PKG`, `POS_TR_REQ_ORDR_PKG`


**Procedures/Functions (147):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `AUDIT_PROC`, `CHECK_ACODE_STK_ACY`, `CHECK_AC_CC`, `CHECK_DB_BRANCH`, `CHECK_DUPLICATE_ITEM_B_SAVE`, `CHECK_ITEM_MOVE_ADD`, `CHECK_I_PRICE`, `CHECK_QTY_SERIALNO`, `CHECK_RESERVE_QTY`, `CHECK_RESERVE_QTY_ATTCH`, `CHECK_VALIDATE_QTY`, `CHK_MAX_QTY_LMT`, `CONTROL_BY_BATCH_COLS`, `CONTROL_POSITION`, `DEL_ITM_REC`, `FILL_ITEMS`, `GET_AC_TRANSFER_INTERFACE`, `GET_REC_BILL_DET`, `GET_SERIAL`, `GET_SERIAL_REC`, `GET_SRL_DESC_NM`, `ICODE_ENTER_QRY`, `INSTALL_SALES_ORDER_PRC`, `MAKEARDUP`, `NO_OF_DECIMAL`, `OLD_QTY`, `POSITION_SRCH`, `SETTIMER`, `UPDATEABLE_REC_WT`, `WITHPQTY`…

## 7. مكتبات مرفقة (6)

`D2KWUTIL`, `ERP_YSLIB`, `YSERPDBALIB`, `D2KCOMN`, `EDTNLIB`, `YSERPDBA2LIB`

## 8. Alerts (10)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| AL_P_LIMIT | تنبيه | STOP | نعم |
| AL_LOW_PR | تنبيه | STOP | نعم |
| AL_ALT_REF | تنبيه | STOP | نعم |
| AL_HIGH_PR | تنبيه | STOP | نعم |
| ALRT_MOV_TR | تنبيه | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_ITM_MST | 29 |
| IAS_WHTRNS_MST | 24 |
| PRIVILEGE_WH | 23 |
| IAS_WHTRNS_DTL | 22 |
| WAREHOUSE_DETAILS | 21 |
| S_BRN_USR_PRIV | 18 |
| IAS_BATCH_NO_CONTENTS | 18 |
| TRANSFER_TYPES | 16 |
| IAS_OUT_REQUEST_MST | 16 |
| PRIVILEGE_GC | 14 |
| ITEM_MOVEMENT | 9 |
| REQUEST_TYPES | 8 |
| PRIV_TRNSFR_TYPE | 7 |
| PRIV_ACC | 7 |
| IAS_ITM_WCODE | 7 |
| IAS_SHW_DOC_PRIV | 6 |
| IAS_V_ITM_AVL_QTY | 6 |
| IAS_PRICING_LEVELS | 5 |
| IAS_BILL_DTL | 5 |
| IAS_POS_MACHINE | 5 |
| IAS_ITEM_SERIALNO | 5 |
| S_FLAGS_PRIV | 4 |
| COST_CENTER_TYPES | 4 |
| USER_R | 4 |
| ACCOUNT | 4 |
| S_FLAGS | 4 |
| IAS_BILL_MST | 4 |
| PRIV_REQ_TYPE | 4 |
| GR_NOTE | 4 |
| COST_CENTERS | 3 |


_(+64 جدول/view آخر — انظر `_raw/POST028_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_ITM_PKG`, `YS_GEN_PKG`, `IAS_USR_PKG`, `IAS_WCODE_PKG`, `ATTACH_ITEM_PKG`, `IAS_CHECK_SYS_PKG`, `INV_ITM_QR_PKG`, `YS_LOV_SLCT_PKG`, `DEV_PKG`, `IAS_SMS_MAIL_PKG`, `YS_AC_DTL_PKG`, `DATE_CNVRTR_PKG`, `IAS_WT_PKG`, `POS_TR_REQ_ORDR_PKG`, `FETCH_ITMS_SRCH_PKG`, `IAS_ACODE_PKG`, `SRCH_DTL_PKG`, `IAS_CSHBNK_PKG`, `YS_ITM_LOV_PKG`, `LOV_PKG`, `IAS_DOC_SERIAL_PKG`, `INV_DEV_PKG`, `IAS_FETCH_DATA_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT DB_LINK_NM FROM IAS_POS_SERVER_DB_LINK WHERE DB_LINK_NM
SELECT FLG_VALUE FROM S_FLAGS_PRIV WHERE FLG_CODE
SELECT TR_TYPE FROM TRANSFER_TYPES WHERE W_CODE_DFLT = :b1 AND TR_REC = 1"SELECT TR_TYPE FROM TRANSFER_TYPES WHERE W_CODE_DFLT
SELECT NVL(CONN_REQ_WHTRNS_FLG,0) FROM TRANSFER_TYPES WHERE TR_TYPE
SELECT BRN_NO,TR_INOUT_TYPE,TR_TYPE,W_CODE,T_W_CODE,F_W_CODE,CC_CODE,PJ_NO,ACTV_NO,TR_DESC,TR_RES,T_TR_TYPE,C_CODE,FIELD1,FIELD2,FIELD3,DRIVER_NO FROM IAS_WHTRNS_MST WHERE TR_SER
SELECT 1 FROM WAREHOUSE_DETAILS WHERE EXISTS (SELECT 1 FROM PRIVILEGE_WH WHERE PRIVILEGE_WH
SELECT I_CODE,ITM_UNT,NVL(I_QTY,0) I_QTY,NVL(P_QTY,0) P_QTY,NVL(P_SIZE,0) P_SIZE,EXPIRE_DATE,BATCH_NO,I_PRICE,W_CODE,T_W_CODE,F_W_CODE,I_LENGTH,I_WIDTH,I_HEIGHT,I_NUMBER,WT_UNT,ARGMNT_NO,WT_QTY,ITEM_DESC,CC_CODE,PJ_NO,ACTV_NO,BARCODE FROM IAS_WHTRNS_DTL WHERE TR_SER
Select 1 From Ias_Whtrns_Mst
SELECT TR_A_CODE,AC_CODE_DTL,AC_DTL_TYP FROM WAREHOUSE_DETAILS WHERE W_CODE
SELECT 1 FROM IAS_WHTRNS_MST WHERE TR_TYPE = :b1 AND TR_NO = :b2 AND NVL(TR_SER,0) = NVL(:b3,0) AND NVL(TR_POST,0) = 1 AND ROWNUM <= 1"SELECT NVL(EXTERNAL_POST,0) FROM IAS_WHTRNS_MST WHERE TR_INOUT_TYPE
SELECT 1 FROM IAS_WHTRNS_DTL WHERE TR_INOUT_TYPE = 1 AND TR_SER != :b1 AND DOC_SER_REF = :b2 AND ROWNUM <= 1"UPDATE IAS_OUT_REQUEST_MST SET PROCESSED=0 WHERE EXISTS (SELECT 1 FROM IAS_WHTRNS_DTL WHERE TR_SER
Select To_Char(Cc_Code)||'- '||Decode( Nvl(Cc_A_Name,Cc_E_Name), Nvl(Cc_E_Name,Cc_A_Name)) CC_name, To_Char(Cc_Code) From cost_centers
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST028_strings.txt`.
