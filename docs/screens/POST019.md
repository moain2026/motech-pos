# POST019 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 820,556 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST019.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> طلب صرف/ تحويل مواد 
>  نظام نقاط البيع > عمليات النظام > 
>  طلب صرف/ تحويل مواد 
>  الاستخدام: 
> تستخدم الشاشة لعمل طلب تحويل مخزني بالبضاعة المطلوبة من نقطة المبيعات، يتم في 
> الطلب تحديد المخزن المطلوب منه كي تظهر له هذه الطلبات، يتم ترحيل طلبات التحويل 
> إلى نظام الأونكس ليتم اعتمادها من قبل الموظف المختص بالاعتماد، بعد اعتماد الطلب 
> يتم إنزاله في شاشة التحويل المخزني في نظام نقاط البيع من قبل المستخدم في المخزن 
> المطلوب منه، يمكن عمل تحويل مباشرة بدون طلب تحويل إذا لم يتم تفعيل متغير (ربط 
> التحويل بطلب التحويل) في شاشة متغيرات نظام العملاء. 
>  تلميح: 
> تظهر شاشة طلب صرف/ تحويل مواد إذا تم تفعيل متغير (استخدام التحويل والاستلام 
> المخزني) في متغيرات نظام نقاط البيع. 
>  طريقة 
> استخدام الشاشة 
>  تستخدم الشاشة 
> بعد النقر على زر الإضافة كما يلي: 
>  أولاً: 
> البيانات الرئيسية 
>  - 
>  الفرع: 
>  يظهر 
>  الفرع الذي دخل 
> فيه المستخدم مع إمكانية تعديل الفرع وفقاً للصلاحيات الممنوحة لمستخدم 
> النظام. 
>  - 
>  نوع 
> الطلب: اختيار نوع الطلب 
> من الأنواع التي تم إدخالها من شاشة أنواع الطلبات في تهيئة نظام 
> المخازن. 
>  - 
>  رقم 
> الطلب: يظهر تسلسل 
> آلي لطلب التحويل. 
>  - 
>  جهة 
> الطلب: في 
>  هذا الحقل يتم 
> إدخال الجهة التي قامت بطلب التحويل. 
>  - 
>  الغرض 
> من الطلب: في هذا الحقل 
> يوضح المستخدم الغرض من عملية طلب تحويل المواد. 
>  - 
>  رقم 
> المرجع: إدخال رقم مرجع 
> طلب التحويل - رقماً أو حرفاً - 
> كأن يكون رقم المستند اليدوي أو رقم ملف وغيرها من البيانات التي يستند لها 
> المستخدم في إصدار العملية أو يستفيد منها في عملية البحث . 
>  - 
>  رقم 
> المخزن/ المخزن المطلوب منه: يتم تحديد المخزن 
> الذي سيتم طلب التحويل منه والمخزن الذي سيتم طلب تحويل الأصناف إليه. 
>  - 
>  الإدارة: 
>  يستخدم هذا الحقل 
> لاختيار الإدارة التي تقدمت بالطلب من القائمة. 
>  - 
>  مركز 
> التكلفة: يتم تحديد مركز 
> التكلفة من القائمة. 
>  - 
>  رقم 
> الحجز: يعرض النظام 
> آلياً رقم الحجز بمجرد حفظ بيانات طلب التحويل، ويظهر هذا الرقم محجوزاً في شاشة 
> حجز كميات الأصناف. 
>  - 
>  ح

## 2. Data Blocks (17)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_OUT_REQUEST_MST | DB | QIU | DELAYED | ORDER:Ias_Out_Request_Mst.Out_Req_Da |
| IAS_OUT_REQUEST_DTL | DB | QIU | DELAYED | ORDER:rcrd_no |
| IAS_CONN_ITM_MSUR_UNT | DB | QIU | AUTOMATIC |  |
| SEARCH_ITEM_MST | ctrl | QIU | DELAYED |  |
| SEARCH_ITEM_DTL | DB | QIU | DELAYED |  |
| DFLT_OPTIONS | ctrl | QIU | AUTOMATIC |  |
| ADV_OPTIONS | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| DMY_SHW_RCRD | ctrl | Q-- | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| SRCH_DTL | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (20) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_SRCH_MST_DTL | STACKED | 450×40 | hidden |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | CONTENT | 533×302 | visible |
| MAIN2 | STACKED | 762×146 | visible |
| CNV_WT | STACKED | 295×120 | visible |
| MAIN4 | CONTENT | 574×209 | visible |
| MAIN5 | STACKED | 735×139 | visible |
| MAIN6 | STACKED | 1374×252 | visible |
| MAIN7 | CONTENT | 350×200 | visible |
| MAIN10 | CONTENT | 350×200 | visible |
| MAIN11 | STACKED | 409×320 | visible |
| MAIN12 | TAB | ?×? | visible |
| FTR | STACKED | 1022×65 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_SRCH_DTL | STACKED | 450×40 | hidden |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_SHW_RCRD | CONTENT | 300×398 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (11)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN1 | Item Search | DIALOG | true |
| WIN_WT | Inv Weight System | DIALOG | true |
| WIN3 | Item Search | DIALOG | true |
| WIN4 | Imp_Excel | DIALOG | true |
| WIN7 | Advance Option | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_SHW_RCRD |  | DIALOG | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (60)

**Packages (spec):** `FETCH_ITMS_PK`, `IAS_WT_PKG`


**Packages (body):** `FETCH_ITMS_PK`, `IAS_WT_PKG`


**Procedures/Functions (56):** `KEY_LISTVAL_PRC`, `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `AUDIT_OTHR_PRC`, `CHECK_OUTGOING_TRANSFER_TRANS`, `DELETE_RESERVE`, `DETERMINE_OUTGOING_OR_TRANSFER`, `DUPLICATE_ITM`, `DYNAMIC_RECORD_GROUP`, `FILL_ITEMS`, `GET_REC_BILL_DET`, `GET_SERIAL`, `ICODE_ENTER_QRY`, `IMP_F_EXCEL`, `INSRT_RESERVE`, `LIST_LOV`, `POSITION_SRCH`, `SEARCH_CONDITION`, `SHOW_AVL_QTY`, `CHK_WCODE_SAME_FWCODE`, `CALL_ITM_TRNS_SCR`, `FORMS_TO_EXCEL`, `CHECK_QTY`, `GET_QTY_PUR_ORDER`, `CALL_LOV_ITM`, `CHECK_DUPLICATE_ITM`, `CALL_SCR_LNK_PRC`, `MOV_RQST_TO_SRVR_PRC`, `CALL_SHOW_AVLQTY`, `GET_QR_INFO`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KWUTIL`, `D2KCOMN`

## 8. Alerts (6)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| ALRT_MOV_TR | تنبيه | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_ITM_MST | 18 |
| IAS_OUT_REQUEST_MST | 12 |
| PRIVILEGE_GC | 10 |
| IAS_OUT_REQUEST_DTL | 9 |
| WAREHOUSE_DETAILS | 7 |
| REQUEST_TYPES | 6 |
| PRIVILEGE_WH | 5 |
| IAS_POS_MACHINE | 5 |
| IAS_ITM_WCODE | 5 |
| USER_R | 4 |
| COST_CENTERS | 3 |
| COST_CENTER_TYPES | 3 |
| IAS_POS_SERVER_DB_LINK | 2 |
| S_APPRVD_MOV | 2 |
| IAS_PROJECTS | 2 |
| IAS_ACTVTY | 2 |
| IAS_SHW_DOC_PRIV | 2 |
| ITEM_TYPES | 2 |
| IAS_ITEMS_ACTIVITY_PRIV | 2 |
| IAS_POS_OUT_REQUEST_MST_TMP | 2 |
| S_PRD_MST | 2 |
| IAS_ALTERNATIVE_GROUP | 2 |
| IAS_MAINSUB_GRP_DTL | 2 |
| ITEM | 2 |
| S_FLD_DFLT_USR | 1 |
| NOWAIT | 1 |
| PRIV_REQ_TYPE | 1 |
| S_HRCHY | 1 |
| IAS_PRIV_PROJECTS | 1 |
| IAS_PRIV_ACTVTY | 1 |


_(+21 جدول/view آخر — انظر `_raw/POST019_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_ITM_PKG`, `IAS_CHECK_SYS_PKG`, `IAS_WCODE_PKG`, `IAS_WT_PKG`, `YS_GEN_PKG`, `IAS_USR_PKG`, `DATE_CNVRTR_PKG`, `SRCH_DTL_PKG`, `IAS_DOC_SERIAL_PKG`, `YS_SCR_PKG`, `YS_APPRVD_PKG`, `IAS_POS_REQUEST_PKG`, `YS_ITM_LOV_PKG`, `GNR_GET_ITM_QR_CODE_PKG`, `IAS_PRMTR_PKG`, `IAS_AUD_SYS_PKG`, `LOV_PKG`, `COMM_PKG`, `SETUP_PKG`, `IAS_FETCH_DATA_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT DB_LINK_NM FROM IAS_POS_SERVER_DB_LINK WHERE DB_LINK_NM
SELECT OUT_REQ_TYPE,W_CODE,F_W_CODE,HRCHY_NO,CC_CODE,PJ_NO,ACTV_NO,REQ_SIDE FROM IAS_OUT_REQUEST_MST WHERE OUT_REQ_SER
SELECT OUT_REQ_TYPE,I_CODE,I_QTY,P_SIZE,P_QTY,W_CODE,ITEM_DESC,RCRD_NO,USE_ATTCH,REC_ATTCH,I_LENGTH,I_WIDTH,I_HEIGHT,I_NUMBER,F_W_CODE,EXPIRE_DATE,BATCH_NO,BARCODE,CC_CODE,PJ_NO,ACTV_NO,ITM_UNT,WT_UNT,WT_QTY FROM IAS_OUT_REQUEST_DTL WHERE OUT_REQ_SER
SELECT OUT_TRNSFR FROM REQUEST_TYPES WHERE REQ_TYPE
SELECT POS_POINT_SEQ.NEXTVAL FROM DUAL
UPDATE S_APPRVD_MOV SET APPRVD=1,APPRVD_DATE=SYSDATE,APPRVD_DESC=''POS'' WHERE DOC_TYP = 31 AND DOC_SER = :b1" DELETE_PROC STANDARD IAS_CHECK_SYS_PKG YSPOS35 IAS_CHECK_SYS_PKG /LPOSLIB GEN_PKG SQLFORMS YSPOS35 IAS_OUT_REQUE
SELECT 1 FROM IAS_OUT_REQUEST_MST WHERE OUT_REQ_SER = :b1 AND NVL(APPROVED,0) = 1 AND ROWNUM <= 1"SELECT 1 FROM IAS_OUT_REQUEST_MST WHERE OUT_REQ_SER
SELECT 1 FROM IAS_OUT_REQUEST_MST WHERE NVL(OUT_REQ_SER,0) = NVL(:b1,0) AND NVL(EXTERNAL_POST,0) != 0 AND ROWNUM <= 1" FILL_ALL_LIST_PRC STANDARD /LPOSLIB GEN_PKG FORMS40 FORMS4C "PKG INIT"FILL_ALL_LIST_PRC"P_POS"V_STMT"" FILL_ALL_LIST_PRC Select To_Char(Req_Type)||'-'||Decode( ,1,Nvl(Req_Name,Req_E_Name),Nvl(Req_E_Name,Req_Name)), To_Char(Req_Type) From Request_Types
Select HRCHY_NO||' -'||Decode( ,1,nvl(HRCHY_L_NM,HRCHY_F_NM),nvl(HRCHY_F_NM,HRCHY_L_NM)), to_char(HRCHY_NO) From S_Hrchy
Select To_Char(w_code)||'- '||Decode( ,1,Nvl(w_name,w_e_name),Nvl(w_e_name,w_name)), To_Char(w_code) From warehouse_details
Select privilege_wh.w_code From privilege_wh
Select To_Char(Cc_Code)||'- '||Decode( Nvl(Cc_A_Name,Cc_E_Name), Nvl(Cc_E_Name,Cc_A_Name)) CC_name, To_Char(Cc_Code) From cost_centers
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST019_strings.txt`.
