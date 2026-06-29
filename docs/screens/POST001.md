# POST001 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 4,790,736 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST001.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> فاتورة المبيعات 
>  نظام نقاط البيع > عمليات النظام > 
>  فاتورة المبيعات 
>  الاستخدام: 
>  تستخدم 
> الشاشة في عملية البيع دون فحص الكمية المتوفرة إلا إذا تم تفعيل متغير (فحص الكمية 
> المتوفرة)، حيث أن الغرض الأساسي من ذلك هو تسريع عملية البيع لدى الكاشير وعدم 
> انتظار توريد الكميات للأصناف المباعة، ويتم التأثير المخزني عند عملية الترحيل إلى 
> نظام الأونكس، وتعتبر هذه الشاشة غاية نظام نقاط البيع بشكل خاص والمنشأة بشكل عام 
> لأنه عن طريقها تتم كل العمليات التي تتحقق بواسطتها الإيرادات المختلفة وتمنح من 
> خلالها الخصومات ومن مخرجاتها تستنتج المنشأة تقارير متنوعة لما حققته من إيرادات 
> خلال فترة معينة وتعمل المقارنات اللازمة بين الفترات المختلفة وتعتبر الوثيقة 
> الرسمية الملزمة للطرفين المنشأة تجاه العملاء بالأصناف والعملاء تجاه المنشأة 
> بقيمة هذا الفاتورة من مبالغ مالية. 
>  تحتوي 
> الشاشة على قوائم رئيسية متعددة في كل قائمة مجموعة من العمليات أمام كل عملية 
> يتوفر توضيح بالاختصار الخاص بها، ويمكننا 
> تلخيص 
>  أهم استخدامات 
> فاتورة المبيعات فيما يلي: 
>  - 
>  إدخال 
> عملية البيع دون فحص الكمية المتوفرة لتسريع عملية البيع. 
>  - 
>  خفض 
> كمية الأصناف المباعة 
> من المخزن بعد عملية الترحيل إلى نظام الأونكس. 
>  - 
>  قيد 
> التأثير المالي بعد عملية الترحيل 
> إلى نظام الأونكس. 
>  - 
>  إمكانية 
> إدخال الأصناف باللمس عند استخدام شاشة لمس. 
>  قد 
> تظهر عدة رسائل عند فتح الفاتورة وهذا يعني أنه يوجد إعدادات لا بد منها حتى لا 
> تظهر هذه الرسائل نذكرها كما يلي: 
>  - 
>  (أدخل رقم حساب الصندوق) ولإخفاء 
> هذه التنبيه لا بد من ربط المستخدم (الكاشير) برقم صندوق في شاشة بيانات 
> المستخدمين تبويب نقاط البيع. 
>  - 
>  (أدخل 
> عملة البيع الافتراضية) ولإخفاء 
> هذه التنبيه لا بد من تحديد عملة البيع الافتراضية ويتم تحديدها من شاشة أجهزة وآلات نقاط البيع على مستوى كل 
> نقطة بيع يتم إضافتها. 
>  ملاحظة: 
> بعد حفظ فاتورة المبيعات يتم إرسال الفاتورة للعميل حسب ترميز رسائل حفظ العميات 
> لفواتير مبيعات نقاط البيع في شاشة متغيرات التنبيهات تبويب (رسائل حفظ 

## 2. Data Blocks (59)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | IMMEDIATE |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_BILL_MST | DB | QIU | AUTOMATIC | WHERE:S |
| IAS_POS_BILL_DTL | DB | QIU | DELAYED | ORDER:RCRD_NO |
| ITM_GRP | DB | Q-- | AUTOMATIC | ORDER:GRP_CODE |
| DMY_ITM_DTL | ctrl | QIU | AUTOMATIC |  |
| WEIGHTEDFILTER | ctrl | QIU | AUTOMATIC |  |
| WEIGHTED | DB | QIU | AUTOMATIC | WHERE:Length(I_Code)=:1 |
| LENGTHEDFILTER | ctrl | QIU | AUTOMATIC |  |
| LENGTHED | DB | QIU | AUTOMATIC | WHERE:Length(i_code)=:1; ORDER:I_Name |
| IAS_POS_KEY_BRD_GRPS_MST | DB | QIU | AUTOMATIC | WHERE:EXTRA_KEYPAD_NO=:1 |
| IAS_POS_KEY_BRD_GRPS_DTL | DB | Q-- | AUTOMATIC |  |
| ITEMSEARCHFLTR | ctrl | QIU | AUTOMATIC |  |
| ITEMSEARCH | DB | QIU | AUTOMATIC | ORDER:I_Name |
| MAIN_CALC_BLK | ctrl | QIU | AUTOMATIC |  |
| PAYED | ctrl | QIU | AUTOMATIC |  |
| DMY_PYMNT | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_HELP_KEYS | DB | QIU | AUTOMATIC |  |
| IAS_POS_PAY_BILLS_CSH | DB | QIU | AUTOMATIC |  |
| IAS_POS_PAY_BILLS_RPLC | DB | QIU | AUTOMATIC |  |
| IAS_POS_PAY_BILLS_CPN | DB | QIU | AUTOMATIC |  |
| POS_BILL_CPN | DB | QIU | AUTOMATIC |  |
| DMY_IMG | ctrl | QIU | AUTOMATIC |  |
| POS_ASSCTN_TRNS | DB | QIU | AUTOMATIC |  |
| IAS_ASSCTN_TRNS | DB | QIU | AUTOMATIC |  |
| IAS_ASSCTN_TRNS1 | DB | QIU | AUTOMATIC |  |
| DMY_MANFTH | DB | QIU | DELAYED |  |
| IAS_POS_CUSTOMER_CARD_AMOUNT | DB | QIU | AUTOMATIC | WHERE:NVL(PROCESSED,0)=0 AND NVL(STATE_TYP,0)=; ORDER:CARD_N |
| DMY_CALC_PYMNT | ctrl | QIU | AUTOMATIC |  |
| PARAMTRS_CPN | ctrl | QIU | AUTOMATIC |  |
| POS_OTHR_CHRG_MVMNT | DB | QIU | DELAYED | WHERE:bill_type=1; ORDER:SC_NO |
| CUSTOMERS | ctrl | QIU | AUTOMATIC |  |
| DELITEM | ctrl | QIU | AUTOMATIC |  |
| LOCK_SCR | ctrl | QIU | AUTOMATIC |  |
| SUPERVISOR_SYSTEM | ctrl | QIU | AUTOMATIC |  |
| SHW_COMM_EMP | ctrl | QIU | AUTOMATIC |  |
| PARAMTRS_SRCH | ctrl | QIU | AUTOMATIC |  |
| SEARCH_ITEM | DB | QIU | DELAYED |  |
| PARAMTRS_FDA_SRCH | ctrl | QIU | AUTOMATIC |  |
| DMY_FDA_LST | DB | QIU | AUTOMATIC |  |
| DMY_FDA_ITM | DB | QIU | IMMEDIATE |  |
| PARAMTRS_FDA_HSTRY | ctrl | QIU | AUTOMATIC |  |
| DMY_FDA_LST_HSTRY | DB | QIU | AUTOMATIC |  |
| DMY_FDA_ITM_HSTRY | DB | QIU | DELAYED |  |
| PARAMTRS_FDA_MDC | ctrl | QIU | AUTOMATIC |  |
| DMY_FDA_MDC | DB | QIU | DELAYED |  |
| SRCH_ICODE_FDA | DB | QIU | IMMEDIATE |  |
| PRMTRS_QUT_PRM | ctrl | QIU | AUTOMATIC |  |
| IAS_QUT_PRM_ITM_FREE_QRY | DB | QIU | DELAYED |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| YSOCX | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (53) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×23 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | STACKED | 479×285 | visible |
| MAIN0 | STACKED | 1230×257 | visible |
| MAIN12 | STACKED | 351×432 | visible |
| MAIN2 | STACKED | 542×301 | visible |
| MAIN3 | STACKED | 488×309 | visible |
| MAIN4 | STACKED | 556×291 | visible |
| MAIN5 | STACKED | 361×274 | visible |
| MAIN6 | STACKED | 294×110 | visible |
| MAIN7 | STACKED | 317×174 | visible |
| MAIN8 | CONTENT | 754×420 | visible |
| MAIN9 | STACKED | 396×216 | visible |
| MAIN10 | STACKED | 294×110 | visible |
| MAIN11 | STACKED | 294×110 | visible |
| MAIN24 | STACKED | 294×110 | visible |
| MAIN14 | STACKED | 219×71 | visible |
| MAIN15 | STACKED | 238×205 | visible |
| MAIN16 | STACKED | 210×102 | visible |
| MAIN17 | STACKED | 317×186 | visible |
| MAIN18 | CONTENT | 344×176 | visible |
| MAIN_PYMNT_CSH | STACKED | 520×100 | visible |
| MAIN_PYMNT_VISA | STACKED | 538×120 | hidden |
| MAIN_PYMNT_RPLC | STACKED | 520×100 | hidden |
| MAIN_PYMNT_CPN | STACKED | 510×114 | hidden |
| MAIN_PYMNT_CPNAR | STACKED | 520×114 | hidden |
| MAIN_PYMNT_CRDT | STACKED | 504×84 | hidden |
| MAIN_PYMNT_AC | STACKED | 426×96 | hidden |
| MAIN_PYMNT_ASSCTN_TRNS | STACKED | 210×60 | hidden |
| MAIN_PYMNT_POINT_RPLC | STACKED | 520×100 | hidden |
| MAIN_PYMNT_ASS | STACKED | 534×126 | visible |
| MAIN_PYMNT_ASS2 | STACKED | 548×158 | visible |
| MAIN_OTHR_CHRG | STACKED | 272×77 | visible |
| CNV_MANFTH | CONTENT | 738×142 | visible |
| MAIN21 | CONTENT | 744×326 | visible |
| MAIN22 | STACKED | 709×258 | visible |
| MAIN23 | CONTENT | 480×325 | visible |
| MAIN27 | CONTENT | 560×307 | visible |
| MAIN28 | STACKED | 999×240 | visible |
| MAIN30 | CONTENT | 999×320 | visible |
| MAIN31 | CONTENT | 999×320 | visible |
| MAIN32 | CONTENT | 890×320 | visible |
| MAIN33 | STACKED | 1015×229 | visible |
| MAIN35 | STACKED | 1050×165 | visible |
| MAIN36 | STACKED | 1080×1254 | visible |
| MAIN38 | STACKED | 900×1254 | visible |
| CNV_LBL_INSTRCTN | STACKED | 295×120 | hidden |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| FTR | STACKED | 1022×36 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (31)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN | Bill | DOCUMENT | false |
| MAIN1 | . | DIALOG | true |
| MAIN2 | . | DIALOG | true |
| MAIN3 | . | DIALOG | true |
| MAIN4 | . | DIALOG | true |
| MAIN5 | Help | DIALOG | true |
| MAIN6 | Delete Item | DIALOG | true |
| MAIN7 | Payment Details | DIALOG | true |
| MAIN8 | Payment Details | DIALOG | true |
| WIN9 | Others Data | DIALOG | true |
| WIN10 | Lock Screen | DIALOG | true |
| MAIN11 | Supervisor System | DIALOG | true |
| WIN24 | عرض العمولة | DIALOG | true |
| WIN11 | Caution | DIALOG | true |
| WIN15 | Show Image | DIALOG | true |
| WIN16 | Qr Code | DIALOG | true |
| WIN17 | Coupon | DIALOG | true |
| WIN18 | Customers | DIALOG | true |
| WIN21 |  | DIALOG | true |
| WIN22 | IMG | DIALOG | true |
| WIN30 | Wasfaty/وصفتي | DIALOG | true |
| WIN31 | Patient History/الوصفات السابقة | DIALOG | false |
| WIN32 | View Active Mediaction/عرض الادوية الفعالة | DIALOG | true |
| WIN33 | قائمة اصناف وصفتي | DIALOG | true |
| WIN27 | قائمة الاصناف المجانية | DIALOG | true |
| WIN_MANFTH | انواع البنود | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CLNDR | Calender | DIALOG | true |
| WIN_LOV |  | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |

## 5. Triggers (63)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-DUP-ITEM`, `KEY-DUPREC`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `ADD_AFTR_TRG`, `BFR_PYMNT_MLTI_PRC`, `BFR_PYMNT_SCRN_TRG`, `CHANGE_USER`, `DISPLAY_BILL_TOTAL`, `DISPLAY_RTNBILL_TOTAL`, `FNGR_CALL_PRC`, `GET_DISCOUNT`, `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_DEL_REC`, `KEY_DEL_REC_AFTR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `PRNT_OLD_BILL_TRG`, `RTRN_NOT_PYD_BILL_TRG`, `UNDO_AFTR_TRG`, `UNDO_BFR_TRG`

## 6. Program Units (152)

**Packages (spec):** `MYLIB`, `ZKFPENGXCONTROL_CONSTANTS`, `ZKFPENGXCONTROL_IZKFPENGX`, `ZKFPENGXCONTROL_ZKFPENG_EVENTS`, `FINGER_PKG`, `POINT_PKG`, `IAS_AC_PKG`, `DEV_PKG`, `FETCH_ITMS_SRCH_PKG`, `CR_CRD_PKG`, `ACTIVESKIN4_ISKIN`, `ACTIVESKIN4_SKIN_EVENTS`, `ACTIVESKINLIB_CONSTANTS`, `SCRN_TOUCH_PKG`, `IAS_QT_PRM_SCR_PKG`, `CPN_PKG`, `DEV_PKG1`, `FETCH_ITMS_FDA`, `EMP_COM_PKG`, `OTHR_CHRG_PKG`, `IAS_GET_QR_CODE`


**Packages (body):** `MYLIB`, `ZKFPENGXCONTROL_IZKFPENGX`, `ZKFPENGXCONTROL_ZKFPENG_EVENTS`, `FINGER_PKG`, `POINT_PKG`, `IAS_AC_PKG`, `DEV_PKG`, `FETCH_ITMS_SRCH_PKG`, `CR_CRD_PKG`, `ACTIVESKIN4_ISKIN`, `SCRN_TOUCH_PKG`, `IAS_QT_PRM_SCR_PKG`, `CPN_PKG`, `DEV_PKG1`, `FETCH_ITMS_FDA`, `EMP_COM_PKG`, `OTHR_CHRG_PKG`, `IAS_GET_QR_CODE`


**Procedures/Functions (113):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `ADD_DOC_PROC`, `AUD_HUNG_BILLS`, `CHANGE_CURR_PC_OLD`, `CHANGE_USER`, `CHECK_CREDIT_LIMIT`, `CHECK_DB_BRANCH`, `CHECK_I_PRICE`, `CHECK_PAY_PREV_SAL`, `CHECK_PRIV_GC`, `DECRYPT_PASS`, `GET_BARCODE_SIZE`, `GET_DISC_ITEM`, `GET_ICODE_FOR_BARCODE`, `GET_DISCSALES_ITEM_PRC`, `GET_ITEM_INFO`, `GET_PRICE_RATE`, `GET_SI_TYPE_MACHINE`, `HUNG_BILL_AUDTING`, `HUNG_BILL_OPEN_IN_OTHR_SCR`, `POS_PARAMETERS`, `PRINT_F_SCR_PRC`, `RETRIVE_NOT_SAVED_BILL`, `SET_MENUS`, `SHOW_NOTIFY_HUNG_BILL`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `CALL_DEL_ITM_PRC`, `CHECK_BILL_DOC_TYPE`, `GET_DISC_ITM_CST`, `CUSTOMER_DISPLAYED_PRC`, `CHECK_DISC_PRIV`, `CALL_SCREAN_ADV`…

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`

## 8. Alerts (20)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | Pos System | NOTE | Ok |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| AL_P_LIMIT | تنبيه | STOP | نعم |
| AL_LOW_PR | تنبيه | STOP | نعم |
| AL_HIGH_PR | تنبيه | STOP | نعم |
| AL_CR_LIMIT | تنبيه | STOP | نعم |
| AL_INV_LIMIT | تنبيه | STOP | نعم |
| AL_BNK_MCHN | نظام نقاط البيع POS | WARNING | نعم |
| AL_BNK_MCHN2 | نظام نقاط البيع POS | WARNING | اعادة المحولة |
| ALRT_ADD_CSTMR | نظام نقاط البيع POS | WARNING | نعم |
| AL_CPN | تراجع | WARNING | نعم |
| ALT_CHK_DATA | Pos | WARNING | OK |
| SKN_RGSTR | LOGIN SKIN IS NOT REGISTER | STOP | OK |
| AL_PYMNT | تنبيه | STOP | نعم |
| AL_CPN_AMT | Message | STOP | استمرار |
| AL_WSFTY_SAVE | Message | STOP | إلغاء العملية |
| AL_ALT_ITM | تنبيه | STOP | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_POS_HUNG_BILLS | 106 |
| IAS_ITM_MST | 64 |
| IAS_POS_BILL_MST | 57 |
| IAS_QUT_PRM_MST | 34 |
| IAS_POS_BILL_DTL | 33 |
| CREDIT_CARD_TYPES | 33 |
| IAS_CASH_CUSTMR | 29 |
| CUSTOMER | 27 |
| PRIVILEGE_GC | 23 |
| POS_BILL_FREE_QTY_PRM_TMP | 22 |
| IAS_V_ITM_AVL_QTY | 21 |
| IAS_ITEM_PRICE | 20 |
| ARS_FDA_ITM_LST_DTL_TMP | 20 |
| IAS_POS_MACHINE | 19 |
| USER_R | 18 |
| SALES_CHARGES | 16 |
| WSFTY_PRSCRPTION_MST | 16 |
| POS_DFLT_STNG_DTL | 15 |
| IAS_ASSCTN_ACCNT | 15 |
| ARS_INTRMDT_CMPNY | 15 |
| POS_DFLT_STNG_MST | 14 |
| S_EMP | 14 |
| IAS_MACHINES | 14 |
| POS_INSTLMNT_CMPNY | 13 |
| POS_DFLT_GRP_DTL | 13 |
| EX_RATE | 12 |
| IAS_POS_RT_BILL_MST | 12 |
| IAS_POS_CUSTOMER_CARD_AMOUNT | 12 |
| MEASUREMENT | 12 |
| IAS_CPN_DTL | 12 |


_(+150 جدول/view آخر — انظر `_raw/POST001_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `DEV_PKG`, `SCRN_TOUCH_PKG`, `IAS_ITM_PKG`, `YS_GEN_PKG`, `POS_POINT_PKG`, `GNR_WASFATY_PKG`, `POS_MNU_PKG`, `IAS_QT_PRM_PKG`, `YS_TAX_PKG`, `POS_GNR_PKG`, `IAS_QT_PRM_SCR_PKG`, `IAS_USR_PKG`, `FETCH_ITMS_SRCH_PKG`, `POINT_PKG`, `CR_CRD_PKG`, `IAS_POS_DISTIBUTED_DB_PKG`, `IAS_DBS_SYS_PKG`, `IAS_SMS_MAIL_PKG`, `IAS_CST_PKG`, `DATE_CNVRTR_PKG`, `IAS_AC_PKG`, `IAS_BRN_PKG`, `IAS_ACODE_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT QUOT_SER FROM POS_GRP_PRM_QTN_ITM_VW WHERE I_CODE
DELETE FROM IAS_POS_HUNG_BILLS WHERE BILL_NO = :b1 AND BILL_SEQ = :b2 AND MACHINE_NO = :b3" P2_26_MAY_202216_44_22 "PKG INIT"<anonymous>"" P266_20_MAR_201415_05_23 STANDARD /NSPC7/CUSTO
SELECT STNG_MCHN_VAL FROM POS_DFLT_STNG_DTL WHERE STNG_NO
SELECT STNG_VAL FROM POS_DFLT_STNG_MST WHERE STNG_NO
SELECT COUNT(PRM_GRP_NO) FROM POS_GRP_PRM_QTN_ITM_VW WHERE QT_PRM_TYPE
SELECT (PRM_GRP_NO) FROM POS_GRP_PRM_QTN_ITM_VW WHERE QT_PRM_TYPE
SELECT SUM(I_QTY) FROM IAS_POS_HUNG_BILLS WHERE BILL_NO
SELECT COUNT(1) FROM IAS_QUT_PRM_MST WHERE TO_DATE
SELECT COUNT(NVL(D.QUOT_SER,0)) FROM IAS_QUT_PRM_MST M,IAS_QUT_PRM_DTL D WHERE M
DELETE FROM IAS_POS_HUNG_BILLS WHERE BILL_SEQ = :b1 AND MACHINE_NO = :b2" PU_003 STANDARD /NSPC7/KEY_LISTVAL_PRC "PKG INIT"<anonymous>"" IAS_POS_BILL_MST.BILL_NO ADD_PROC STANDARD FORMS4
SELECT DB_LINK_NM FROM IAS_POS_SERVER_DB_LINK WHERE DB_LINK_NM
SELECT POS_BILLS_SEQ.NEXTVAL FROM DUAL
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST001_strings.txt`.
