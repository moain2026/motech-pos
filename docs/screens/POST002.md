# POST002 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 2,369,668 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST002.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> فاتورة مردود المبيعات 
>  نظام نقاط البيع > عمليات النظام > 
>  فاتورة مردود المبيعات 
>  الاستخدام: 
> تستخدم الشاشة لإدخال البضاعة المردودة من العملاء سواءً كانت مردودات نقدية أو 
> بالآجل، ويتم إدخال بيانات فاتورة مردود المبيعات بنفس الآلية لفاتورة المبيعات حيث 
> يمكن استخدام لوحة المفاتيح أو باستخدام القوائم المنسدلة أعلى 
> الشاشة. 
>  ملاحظة: 
>  لا 
> يسمح النظام بإرجاع فاتورة لم تدفع، وفي 
> حالة تم الدفع بواسطة خدمة تابي وتمارا لا يسمح النظام بتغيير طريقة الدفع، 
> وبالتالي يتم في المردود إنزال طريقة الدفع ورقم الجهة والنوع التحليلي من فاتورة 
> المبيعات. 
>  طريقة استخدام الشاشة 
>  أولاً: البيانات الرئيسية 
>  - 
>  رقم 
> المردود: يستخدم 
> هذا الحقل للتعامل مع الرقم التسلسلي لفاتورة مردود المبيعات، ويظهر آلياً حسب 
> تهيئة تسلسل الوثيقة التي تمت في شاشة متغيرات 
> وإعدادات نقاط البيع وشاشة أجهزة وآلات نقاط البيع. 
>  - 
>  تاريخ 
> الفاتورة: يظهر تاريخ 
> فاتورة مردود المبيعات آلياً حيث يتم قراءة تاريخ الجهاز السيرفر أو الفرعي ولا 
> يمكن تعديله. 
>  - 
>  الوقت: 
>  يظهر وقت 
> الفاتورة آلياً حيث يتم قراءة وقت الجهاز. 
>  - 
>  اسم 
> الاتصال: هو اسم الاتصال 
> الذي تم إدخاله في شاشة إعدادات نقاط البيع تبويب نوع الاتصال لغرض التمييز بين 
> أجهزة الفروع. 
>  - 
>  ملاحظات: 
>  في هذا الحقل يتم 
> تدوين أي ملاحظات على فاتورة مردود المبيعات. 
>  - 
>  العملة/ 
> سعر التحويل: 
>  تظهر آلياً 
> العملة الافتراضية التي تم تحديدها في شاشة أجهزة وآلات 
> نقاط البيع ، مع إمكانية اختيار عملة أخرى إذا تم تفعيل المتغير (السماح 
> بتعديل عملة الفاتورة والمردود) في شاشة متغيرات 
> وإعدادات نقاط البيع ، كما يظهر سعر التحويل المحدد في تهيئة العملات حسب 
> العملة المختارة. 
>  - 
>  نوع 
> سعر الإرجاع: 
>  يستخدم هذا الحقل 
> لتحديد ما هو السعر الذي سيتم استخدامه في مردود المبيعات؛ وهو إما سعر البيع 
> المدخل في فاتورة المبيعات أو سعر البيع الحالي الموجود في شاشة التسعيرة وقت إضافة 
> المردود. 
>  - 
>  رقم 
> الموظف: 
>  يمكن التعامل مع 
> هذا الحقل عند تفعيل المتغير (تفعيل حقل الموظف) ويك

## 2. Data Blocks (31)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_RT_BILL_MST | DB | QIU | AUTOMATIC |  |
| IAS_POS_RT_BILL_DTL | DB | QIU | DELAYED |  |
| IAS_POS_KEY_BRD_GRPS_MST | DB | QIU | AUTOMATIC | WHERE:EXTRA_KEYPAD_NO=:1 |
| IAS_POS_KEY_BRD_GRPS_DTL | DB | Q-- | AUTOMATIC |  |
| WEIGHTEDFILTER | ctrl | QIU | AUTOMATIC |  |
| WEIGHTED | DB | QIU | AUTOMATIC | WHERE:Length(I_Code)=:1 |
| LENGTHEDFILTER | ctrl | QIU | AUTOMATIC |  |
| LENGTHED | DB | QIU | AUTOMATIC | WHERE:Length(i_code)=:1; ORDER:I_Name |
| ITEMSEARCHFLTR | ctrl | QIU | AUTOMATIC |  |
| ITEMSEARCH | DB | QIU | AUTOMATIC | ORDER:I_Name |
| IAS_POS_HELP_KEYS | DB | QIU | AUTOMATIC |  |
| PAYED | ctrl | QIU | AUTOMATIC |  |
| DMY_PYMNT | ctrl | QIU | AUTOMATIC |  |
| IAS_POS_PAY_RT_BILLS | DB | QIU | AUTOMATIC |  |
| DELITEM | ctrl | QIU | AUTOMATIC |  |
| SUPERVISOR_SYSTEM | ctrl | QIU | AUTOMATIC |  |
| IAS_POS_CUSTOMER_CARD_AMOUNT | DB | QIU | AUTOMATIC | WHERE:NVL(PROCESSED,0)=0 AND NVL(STATE_TYP,0)=; ORDER:CARD_N |
| POS_OTHR_CHRG_MVMNT | DB | QIU | DELAYED | WHERE:bill_type=1; ORDER:SC_NO |
| BLK_SEARCH | ctrl | QIU | AUTOMATIC |  |
| LOCK_SCR | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (25) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×22 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN0 | STACKED | 812×275 | visible |
| MAIN1 | STACKED | 479×285 | visible |
| MAIN2 | STACKED | 542×301 | visible |
| MAIN3 | STACKED | 488×309 | visible |
| MAIN4 | STACKED | 542×302 | visible |
| MAIN5 | STACKED | 361×274 | visible |
| MAIN6 | STACKED | 294×110 | visible |
| MAIN7 | STACKED | 300×140 | visible |
| MAIN8 | CONTENT | 698×311 | visible |
| MAIN_PYMNT_CSH | STACKED | 492×114 | visible |
| MAIN_PYMNT_VISA | STACKED | 498×132 | visible |
| MAIN_PYMNT_CRDT | STACKED | 504×114 | hidden |
| MAIN_OTHR_CHRG | STACKED | 272×77 | visible |
| MAIN9 | CONTENT | 382×201 | visible |
| MAIN10 | STACKED | 294×110 | visible |
| MAIN11 | STACKED | 294×110 | visible |
| MAIN17 | STACKED | 317×186 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| FTR | STACKED | 1022×35 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (18)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| MAIN1 | . | DIALOG | true |
| MAIN2 | . | DIALOG | true |
| MAIN3 | . | DIALOG | true |
| MAIN4 | . | DIALOG | true |
| MAIN5 | Help | DIALOG | true |
| MAIN6 | Delete Item | DIALOG | true |
| MAIN7 | Payment Details | DIALOG | true |
| MAIN8 | Others Detail | DIALOG | true |
| MAIN9 | Bill Items | DIALOG | true |
| WIN10 | Lock Screen | DIALOG | true |
| WIN11 | Supervisor System | DIALOG | true |
| WIN12 | Coupon | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOV |  | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |

## 5. Triggers (57)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-DUP-ITEM`, `KEY-DUPREC`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `ADD_AFTR_TRG`, `BFR_PYMNT_MLTI_PRC`, `CHANGE_USER`, `DISPLAY_BILL_TOTAL`, `DISPLAY_RTNBILL_TOTAL`, `FNGR_CALL_PRC`, `GET_DISCOUNT`, `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_DELREC_AFTR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (113)

**Packages (spec):** `IAS_QT_PRM_SCR_PKG_OLD`, `FINGER_PKG`, `ZKFPENGXCONTROL_CONSTANTS`, `ZKFPENGXCONTROL_IZKFPENGX`, `ZKFPENGXCONTROL_ZKFPENG_EVENTS`, `IAS_AC_PKG`, `DEV_PKG`, `SCRN_TOUCH_PKG`, `POINT_PKG`, `CR_CRD_PKG`, `IAS_QT_PRM_SCR_PKG`, `OTHR_CHRG_PKG`


**Packages (body):** `IAS_QT_PRM_SCR_PKG_OLD`, `FINGER_PKG`, `ZKFPENGXCONTROL_IZKFPENGX`, `ZKFPENGXCONTROL_ZKFPENG_EVENTS`, `IAS_AC_PKG`, `DEV_PKG`, `SCRN_TOUCH_PKG`, `POINT_PKG`, `CR_CRD_PKG`, `IAS_QT_PRM_SCR_PKG`, `OTHR_CHRG_PKG`


**Procedures/Functions (90):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `ADD_DOC_PROC`, `AUD_ITM_RT_BILL_DTL_TMP`, `CHANGE_CURR_PC`, `CHECK_BILL_DOC_TYPE`, `CHECK_DB_BRANCH`, `CHECK_PERIOD_RETURN`, `CHECK_PRICING_LEVEL`, `CHECK_PRIV_GC`, `DECRYPT_PASS`, `DEL_DOC_TYPE`, `FIELD_POSITION`, `GET_BARCODE_SIZE`, `GET_BRANCH_DB_LINK_AUTO`, `GET_DISC_ITEM`, `GET_ICODE_FOR_BARCODE`, `GET_INSERT_DISC_ITEM`, `GET_ITEM_INFO`, `GET_DATA_FROM_BILL`, `GET_PRICE_RATE`, `CHK_GET_RT_BILL_QTY`, `GET_SR_TYPE_MACHINE`, `POS_PARAMETERS`, `SET_MENUS`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `GET_BARCODE`, `CHECK_BILL_TYP`, `CHECK_BILL_CUR`, `INSRT_RT_BILL_TMP`, `CHECK_BILL_PRM_FREE_QTY`, `SEND_MSG_PRC`, `GET_RCRD_NO_RT_BILL_DET`…

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`

## 8. Alerts (7)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| AL_CR_LIMIT | تنبيه | STOP | نعم |
| ALT_CHK_DATA | Pos | WARNING | OK |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_POS_RT_BILL_DTL_TMP | 53 |
| IAS_POS_BILL_DTL_TMP | 46 |
| IAS_ITM_MST | 30 |
| CREDIT_CARD_TYPES | 23 |
| IAS_POS_RT_BILL_MST | 22 |
| CUSTOMER | 19 |
| IAS_POS_RT_BILL_DTL | 18 |
| IAS_QUT_PRM_MST | 15 |
| IAS_POS_MACHINE | 15 |
| SALES_CHARGES | 14 |
| IAS_POS_BILL_MST | 13 |
| USER_R | 13 |
| S_EMP | 12 |
| EX_RATE | 12 |
| IAS_POS_BILL_DTL | 12 |
| IAS_POS_HST_BILL_DTL | 12 |
| IAS_POS_RT_BILL_DTL_AUD_TMP | 10 |
| IAS_POS_BILL_MST_TMP | 10 |
| IAS_POS_HST_BILL_MST | 9 |
| IAS_ITEM_PRICE | 9 |
| IAS_PRICING_LEVELS | 9 |
| IAS_PARA_POS | 8 |
| IAS_CASH_CUSTMR | 7 |
| POS_OTHR_CHRG_MVMNT | 7 |
| ITEM_DETAILS | 7 |
| IAS_POS_SERVER_DB_LINK | 6 |
| IAS_POS_HST_RT_BILL_MST | 6 |
| IAS_COMM_CR_CARD_BANK | 6 |
| IAS_MACHINES | 6 |
| S_FLAGS_PRIV | 5 |


_(+76 جدول/view آخر — انظر `_raw/POST002_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_ITM_PKG`, `IAS_QT_PRM_PKG`, `YS_GEN_PKG`, `DEV_PKG`, `YS_TAX_PKG`, `IAS_QT_PRM_SCR_PKG`, `POS_MNU_PKG`, `IAS_USR_PKG`, `POS_POINT_PKG`, `SCRN_TOUCH_PKG`, `IAS_SMS_MAIL_PKG`, `DATE_CNVRTR_PKG`, `POINT_PKG`, `IAS_POS_DISTIBUTED_DB_PKG`, `IAS_BRN_PKG`, `OTHR_CHRG_PKG`, `POS_GNR_PKG`, `IAS_AC_PKG`, `FINGER_PKG`, `CR_CRD_PKG`, `IAS_ACODE_PKG`, `YS_JSON_PKG`, `IAS_CST_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
DELETE FROM IAS_POS_RT_BILL_DTL_AUD_TMP WHERE RT_BILL_NO = :b1 AND RCRD_NO = NVL(:b2,:b3)"DELETE FROM IAS_POS_RT_BILL_DTL_TMP WHERE RT_BILL_NO = :b1 AND RCRD_NO = NVL(:b2,:b3)" P15_16_JAN_201412
SELECT DB_LINK_NM FROM IAS_POS_SERVER_DB_LINK WHERE DB_LINK_NM
SELECT 1 FROM IAS_QUT_PRM_MST WHERE QT_PRM_TYPE IN ( 4,5 ) AND NVL(USE_QTN_PRM_IN_POS_SYS_FLG,0) = 1 AND ROWNUM <= 1"SELECT POS_BILLS_SEQ.NEXTVAL FROM DUAL
SELECT DECODE(:b1,1,NVL(EMP_L_NM,EMP_F_NM),NVL(EMP_F_NM,EMP_L_NM)) FROM S_EMP WHERE EMP_NO
SELECT 1 FROM IAS_POS_RT_BILL_MST WHERE RT_BILL_NO = :b1 AND ROWNUM <= 1"SELECT 1 FROM IAS_POS_HST_RT_BILL_MST WHERE RT_BILL_NO
Select Server_No||'-'||Nvl(Db_Link_Desc,Server_Nm) Server_Name, Db_Link_Nm From Ias_Pos_Server_Db_Link
Select Distinct To_Char(M.Clc_Typ_No)||'- '||Decode( ,1,Nvl(Clc_Typ_L_Nm, Clc_Typ_F_Nm),Nvl(Clc_Typ_F_Nm,Clc_Typ_L_Nm)),To_Char(M.Clc_Typ_No) From Gnr_Tax_Typ_Clc_Mst M,Gnr_Tax_Typ_Clc_Brn DB
Select D.Clc_Typ_No From Gnr_Tax_Typ_Clc_Dtl D, Gnr_Tax_Code_Mst T
Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
Select GROUP_NO||'-'||Decode( ,1,GROUP_L_NAME,Nvl(GROUP_F_NAME,GROUP_L_NAME)) GRP_NM, To_Char(GROUP_NO) GROUP_NO From IAS_CR_CARD_GROUP
SELECT 1 FROM S_FLAGS_PRIV WHERE U_ID= AND FLG_CODE=S_FLAGS.FLG_CODE AND FLG_VALUE=S_FLAGS.FLG_VALUE AND PRIV_FLAG=1) Order By FLG_SR SELECT RT_RPLC_A_CODE FROM INTERFACE_ACC WHERE BRN_NO
SELECT NVL(BRN_LNAME,BRN_FNAME) FROM S_BRN WHERE BRN_NO
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST002_strings.txt`.
