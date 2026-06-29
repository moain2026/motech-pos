# POST024 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 1,717,104 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST024.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> طلبات العملاء 
>  نظام نقاط البيع > عمليات النظام > 
>  طلبات العملاء 
>  الاستخدام: تظهر الشاشة إذا كان استخدام طلب العميل (اختياري أو إجباري) في شاشة 
> متغيرات وإعدادات نقاط البيع، وتستخدم لإدخال طلبات العملاء بصورة اختيارية أو 
> إجبارية حسب سياسة المنشأة، وبعد استكمال بيانات الطلب يتم إنزاله في فاتورة 
> المبيعات. 
>  طريقة استخدام الشاشة 
>  بمجرد الدخول إلى الشاشة تظهر في حالة الإضافة وتعد هذه ميزة في نظام نقاط 
> البيع، وتستخدم على النحو التالي: 
>  أولاً: البيانات الرئيسية 
>  - 
>  النوع: يستخدم 
>  هذا الحقل 
> لاختيار نوع الطلب من القائمة، مع العلم أنه يتم إضافة هذه الأنواع في شاشة أنواع 
> طلبات العملاء في نظام إدارة المبيعات. 
>  - 
>  رقم 
> الطلب: في هذا الحقل 
> يعرض النظام تسلسل آلي لطلبات العملاء غير قابل للتعديل. 
>  - 
>  تاريخ 
> الطلب: يظهر تاريخ الطلب 
> غير قابل للتعديل. 
>  - 
>  رقم 
> العميل: يستخدم 
> هذا الحقل لإدخال رقم العميل يدوياً أو باستخدام F9 ، وبمجرد إدخال الرقم يظهر اسم العميل، مع 
> ملاحظة أنه تظهر قائمة بالعملاء 
> المضافين في شاشة بيانات العملاء في نظام إدارة العملاء. 
>  - 
>  عميل 
> نقدي: يتم 
> تفعيل هذا المؤشر إذا كان الطلب سيتم لعميل نقدي، وبعد تفعيل هذا المؤشر يتم 
> الانتقال إلى حقل رقم العميل لإدخال رقم جوال العميل النقدي يدوياً أو باستخدام 
>  F9 ، مع ملاحظة أن العملاء النقديين يتم إضافتهم 
> في شاشة بيانات العملاء النقديون في مدخلات نظام نقاط البيع، أو في مدخلات نظام 
> إدارة العملاء. 
>  - 
>  العملة: 
>  في 
> هذا الحقل تظهر عملة البيع الافتراضية 
> المحددة في شاشة أجهزة وآلات نقاط البيع. 
>  - 
>  رقم 
> الموظف: يمكن التعامل مع 
> هذا الحقل عند تفعيل المتغير (تفعيل حقل الموظف)، ويكون إدخاله إجبارياً عند اختيار 
> (إجباري أو حسب ترميز العمولة) في متغير طريقة إدخال رقم الموظف، ويتم اختيار 
> الموظف من بين الموظفين الذين تم إضافتهم في شاشة بيانات الموظفين في نظام الأونكس 
>  ERP . 
>  - 
>  رقم 
> المندوب: يمكن 
> التعامل مع هذا الحقل عند تفعيل المتغير (تفعيل حقل المندوب) ، 
>  ويستخدم لإدخال 
> رقم مندوب المبيعات الذي قام بع

## 2. Data Blocks (29)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | IMMEDIATE |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| SALES_ORDER | DB | Q-- | AUTOMATIC | ORDER:ORDER_NO |
| ORDER_DETAIL | DB | Q-- | DELAYED | ORDER:RCRD_NO |
| IAS_POS_KEY_BRD_GRPS_MST | DB | QIU | AUTOMATIC | WHERE:EXTRA_KEYPAD_NO=:1 |
| IAS_POS_KEY_BRD_GRPS_DTL | DB | Q-- | AUTOMATIC |  |
| POS_RQ_OTHR_CHRG_MVMNT | DB | QIU | DELAYED | WHERE:DOC_TYPE=149; ORDER:SC_NO |
| WEIGHTEDFILTER | ctrl | QIU | AUTOMATIC |  |
| WEIGHTED | DB | QIU | AUTOMATIC | WHERE:Length(I_Code)=:1 |
| LENGTHEDFILTER | ctrl | QIU | AUTOMATIC |  |
| LENGTHED | DB | QIU | AUTOMATIC | WHERE:Length(i_code)=:1; ORDER:I_Name |
| ITEMSEARCHFLTR | ctrl | QIU | AUTOMATIC |  |
| ITEMSEARCH | DB | QIU | AUTOMATIC | ORDER:I_Name |
| IAS_POS_HELP_KEYS | DB | QIU | AUTOMATIC |  |
| DELITEM | ctrl | QIU | AUTOMATIC |  |
| LOCK_SCR | ctrl | QIU | AUTOMATIC |  |
| SUPERVISOR_SYSTEM | ctrl | QIU | AUTOMATIC |  |
| ITM_GRP | DB | Q-- | AUTOMATIC | WHERE:Exists (select 1 from privilege_gc where; ORDER:G_CODE |
| ITM_DTL | DB | QIU | AUTOMATIC |  |
| CALC | ctrl | -IU | AUTOMATIC |  |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (26) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN0 | STACKED | 943×266 | visible |
| MAIN1 | STACKED | 479×285 | visible |
| MAIN2 | STACKED | 542×301 | visible |
| MAIN3 | STACKED | 488×309 | visible |
| MAIN4 | STACKED | 556×291 | visible |
| MAIN5 | STACKED | 361×274 | visible |
| MAIN6 | STACKED | 294×110 | visible |
| MAIN7 | STACKED | 317×186 | visible |
| MAIN8 | CONTENT | 420×252 | visible |
| MAIN9 | STACKED | 408×247 | visible |
| MAIN10 | STACKED | 294×110 | visible |
| MAIN11 | STACKED | 294×110 | visible |
| MAIN12 | STACKED | 318×282 | visible |
| MAIN13 | STACKED | 210×282 | visible |
| MAIN14 | STACKED | 214×71 | visible |
| MAIN15 | STACKED | 238×205 | visible |
| MAIN16 | STACKED | 294×110 | visible |
| MAIN_OTHR_CHRG | STACKED | 234×62 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (21)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_LOV |  | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| MAIN1 | . | DIALOG | true |
| MAIN2 | . | DIALOG | true |
| MAIN3 | . | DIALOG | true |
| MAIN4 | . | DIALOG | true |
| MAIN5 | Help / المساعدة | DIALOG | true |
| MAIN6 | Delete Item /حذف صنف | DIALOG | true |
| MAIN7 | Payment Details/التدفيع | DIALOG | true |
| MAIN8 | Payment Details/التدفيع | DIALOG | true |
| WIN9 | Others Data/بيانات أخري | DIALOG | true |
| WIN10 | Lock Screen/قفل الشاشة | DIALOG | true |
| MAIN11 | Supervisor System/نظام المشرف | DIALOG | true |
| WIN13 | الحاسبة | DIALOG | true |
| WIN11 | Caution/تنبيه | DIALOG | true |
| WIN15 | Show Image | DIALOG | true |
| WIN16 | توقيف | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |

## 5. Triggers (55)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-DUP-ITEM`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `CALC_QUOT_PRM_LH_PRC_PRC`, `CHANGE_USER`, `DISPLAY_BILL_TOTAL`, `DISPLAY_RTNBILL_TOTAL`, `FNGR_CALL_PRC`, `GET_DISCOUNT`, `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_DEL_REC`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (92)

**Packages (spec):** `MYLIB`, `ZKFPENGXCONTROL_CONSTANTS`, `ZKFPENGXCONTROL_IZKFPENGX`, `ZKFPENGXCONTROL_ZKFPENG_EVENTS`, `FINGER_PKG`, `CR_CRD_PKG`, `DEV_PKG`, `OTHR_CHRG_PKG`


**Packages (body):** `MYLIB`, `ZKFPENGXCONTROL_IZKFPENGX`, `ZKFPENGXCONTROL_ZKFPENG_EVENTS`, `FINGER_PKG`, `CR_CRD_PKG`, `DEV_PKG`, `OTHR_CHRG_PKG`


**Procedures/Functions (77):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `ADD_DOC_PROC`, `AUD_HISTORY_HUNG_BILLS`, `AUD_HUNG_BILLS`, `CHANGE_USER`, `CHECK_DB_BRANCH`, `CHECK_I_PRICE_OLD`, `CHECK_PAY_PREV_SAL`, `CHECK_PRICING_LEVEL`, `CHECK_PRIV_GC`, `DECRYPT_PASS`, `FIELD_POSITION`, `GET_BARCODE_SIZE`, `GET_DISC_ITEM`, `GET_ICODE_FOR_BARCODE`, `GET_SALESDISC_ITEM`, `GET_ITEM_INFO`, `GET_PRICE_RATE`, `GET_SI_TYPE_MACHINE`, `POS_PARAMETERS`, `PRINT_F_SCR_PRC`, `SET_MENUS`, `SHOW_NOTIFY_HUNG_BILL`, `CALL_DEL_ITM_PRC`, `CHECK_BILL_DOC_TYPE`, `GET_DISC_ITM_CST`, `CUSTOMER_DISPLAYED_PRC`, `CHECK_DISC_PRIV`, `CALL_SCREAN_ADV`, `GET_BARCODE`, `CHECK_AVL_QTY_PRC`, `GET_RCRD_NO_BILL_DET`, `GET_POS_CUR_RATE_FNC`, `CALC_VAT_ITM_PRC`, `CALC_DIS_VAT_AMT`…

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`

## 8. Alerts (18)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
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

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_ITM_MST | 33 |
| CREDIT_CARD_TYPES | 19 |
| SALES_ORDER | 18 |
| POS_GNR_RCPTS | 14 |
| SALES_CHARGES | 14 |
| ORDER_DETAIL | 13 |
| USER_R | 12 |
| IAS_POS_MACHINE | 12 |
| PRIVILEGE_GC | 9 |
| IAS_PRICING_LEVELS | 9 |
| EX_RATE | 9 |
| POS_RCPTS_ADVNC | 8 |
| S_EMP | 8 |
| CUSTOMER | 7 |
| IAS_MACHINES | 7 |
| IAS_ITM_UNT_BARCODE | 6 |
| IAS_QUT_PRM_MST | 6 |
| IAS_ITEM_PRICE | 6 |
| POS_RQ_OTHR_CHRG_MVMNT | 6 |
| IAS_PARA_POS | 5 |
| SALES_MAN | 4 |
| ITEM_DETAILS | 4 |
| IAS_POS_SERVER_DB_LINK | 3 |
| PRIVILEGE_FIXED | 3 |
| IAS_POS_KEY_BRD_GRPS_MST | 3 |
| IAS_CASH_CUSTMR | 3 |
| S_BRN_USR_PRIV | 3 |
| IAS_CST_ACCNT | 3 |
| IAS_GRP_CST_ACCNT | 3 |
| S_FLAGS_PRIV | 2 |


_(+42 جدول/view آخر — انظر `_raw/POST024_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_ITM_PKG`, `YS_TAX_PKG`, `IAS_USR_PKG`, `YS_GEN_PKG`, `CR_CRD_PKG`, `POS_GNR_PKG`, `DATE_CNVRTR_PKG`, `OTHR_CHRG_PKG`, `FINGER_PKG`, `DEV_PKG`, `LOV_PKG`, `IAS_SMS_MAIL_PKG`, `YS_SCR_PKG`, `IAS_WCODE_PKG`, `IAS_PRMTR_PKG`, `IAS_ACODE_PKG`, `POS_PKG`, `POS_MNU_PKG`, `SETUP_PKG`, `IAS_FETCH_DATA_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(MAX(TO_NUMBER(ORDER_NO)),0) + 1 FROM SALES_ORDER WHERE BRN_NO
SELECT SO_TYPE,ORDER_CUR,CUR_RATE,C_CODE,C_NAME,W_CODE,REP_CODE,PROCESED,DISC_AMT,DISC_AMT_MST,DISC_AMT_DTL,PREPARE_DATE,PROCESS_INC_FLG,EXPORT,VAT_AMT,ORDER_AMT,EMP_NO,SI_TYPE,FIELD1,FIELD2,FIELD3,FIELD4,FIELD5,DISC_AMT_MST_VAT,MACHINE_NO,CUST_CODE,MOBILE_NO,PYMNT_TYPE,CASH_NO,ADVNC_PYMNT_A_CODE,ADVNC_PYMNT_AC_CODE_DTL,ADVNC_PYMNT_AC_DTL_TYP,CMP_NO FROM SALES_ORDER WHERE ORDER_SER
SELECT SO_TYPE,I_CODE,I_QTY,FREE_QTY,ITM_UNT,P_SIZE,P_QTY,I_PRICE,RES_DATE,W_CODE,RCRD_NO,BARCODE,EXPIRE_DATE,BATCH_NO,VAT_PER,VAT_AMT,WT_UNT,WT_QTY,DIS_AMT,DIS_AMT_MST,DIS_PER,DIS_AMT_DTL,EMP_NO,SUB_C_CODE,FIELD_DTL1,FIELD_DTL2,FIELD_DTL3,SI_TYPE,OTHR_AMT,I_PRICE_VAT,DIS_AMT_DTL_VAT,DIS_AMT_MST_VAT,CMP_NO,BRN_NO,BRN_YEAR,BRN_USR FROM ORDER_DETAIL WHERE ORDER_SER
Select 1 from Sales_Order where Order_No= And Brn_No = And RowNum<=1 IAS_GEN_PKGYSPOS35GET_CNTIAS IAS_GEN_PKG SELECT NVL(MAX(TO_NUMBER(ORDER_NO)),0) + 1 FROM SALES_ORDER WHERE BRN_NO
Select 1 From SALES_ORDER where ORDER_SER = and APPROVED = 1 and RowNum<=1 IAS_GEN_PKGYSPOS35GET_CNTIAS IAS_GEN_PKG and PROCESS_INC_FLG = 1 and RowNum<=1 IAS_GEN_PKGYSPOS35GET_CNTIAS IAS_GEN_PKG Select 1 From SALES_ORDER WHERE NVL
Select 1 From POS_RCPTS_ADVNC WHERE DOC_SRL_REF = and RowNum<=1 IAS_GEN_PKGYSPOS35GET_CNTIAS IAS_GEN_PKG Select 1 From POS_RCPTS_ADVNC WHERE Nvl
Select 1 From POS_GNR_RCPTS WHERE DOC_TYPE=2 AND DOC_SRL_REF = IAS_GEN_PKGYSPOS35GET_CNTIAS IAS_GEN_PKG Select 1 From POS_GNR_RCPTS WHERE DOC_TYPE
delete from POS_GNR_RCPTS
DELETE FROM POS_RCPTS_ADVNC WHERE DOC_SRL_REF = :b1"DELETE FROM POS_GNR_RCPTS WHERE DOC_TYPE = 2 AND DOC_SRL_REF = :b1" DEL_DET_REC_PRC STANDARD SQLFORMS "PKG INIT"DEL_DET_REC_PRC"P_B
Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
SELECT 1 FROM S_FLAGS_PRIV WHERE U_ID= AND FLG_CODE=S_FLAGS.FLG_CODE AND FLG_VALUE=S_FLAGS.FLG_VALUE AND PRIV_FLAG=1) Order By FLG_SR Sales_Order.PYMNT_TYPE Select To_Char(So_Type)||'- '||Decode( ,1,Nvl(So_A_Name,So_E_Name),Nvl(So_E_Name,So_A_Name)),To_Char(So_Type) From Ias_Sorder_Types
Select Server_No||'-'||Nvl(Db_Link_Desc,Server_Nm) Server_Name, Db_Link_Nm From Ias_Pos_Server_Db_Link
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST024_strings.txt`.
