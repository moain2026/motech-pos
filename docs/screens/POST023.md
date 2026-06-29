# POST023 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 385,708 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST023.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> الوصفة الطبية 
>  نظام نقاط البيع > عمليات النظام > 
>  الوصفة الطبية 
>  الاستخدام: 
>  تظهر 
> الشاشة عند تفعيل المتغير (استخدام الوصفة الطبية) في متغيرات وإعدادات نقاط البيع، 
> وتستخدم في القطاع الطبي لتسجيل الوصفات الطبية للمريض مع تحديد الجرعة وطريقة 
> الاستخدام ومدة الاستخدام وغيرها من التعليمات التي ينصح بها الطبيب 
> المعالج. 
>  طريقة استخدام الشاشة 
>  تظهر 
> الشاشة في حالة الإضافة فبمجرد الدخول إليها تظهر مباشرة قائمة بفواتير المبيعات 
> السابقة المدخلة ليتم اختيار أحدها ومن ثم النقر على Ok لتظهر بيانات أصناف 
> الفاتورة وما على الطبيب إلا تحديد التعليمات الضرورية المطلوبة التي سينصح بها 
> المريض لاستخدام الأصناف المصروفة له ومن ثم طباعة تقرير بذلك. 
>  - 
>  حفظ: 
>  يتم 
> النقر على هذا الأمر لحفظ الوصفة الطبية وطباعتها. 
>  - 
>  عرض: 
>  يستخدم 
> هذا الأمر لعرض قائمة فواتير المبيعات السابقة. 
>  - 
>  قفل 
> الشاشة: 
>  يستخدم 
> هذا الأمر لقفل الشاشة ولا يتم الدخول إلى النظام إلا بعد إدخال كلمة السر الخاصة 
> بالمستخدم. 
>  - 
>  خروج: 
>  يستخدم 
> هذا الأمر للخروج من الشاشة بعد الانتهاء من العمل عليها. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (11)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | IMMEDIATE |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_BILL_MST | DB | QIU | AUTOMATIC |  |
| IAS_POS_BILL_DTL | DB | Q-U | DELAYED |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| DELITEM | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×22 | hidden |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| MAIN6 | STACKED | 294×110 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (6)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| MAIN6 | Delete Item | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (50)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `DISPLAY_BILL_TOTAL`, `DISPLAY_RTNBILL_TOTAL`, `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `SAVE_PROC`

## 6. Program Units (37)


**Procedures/Functions (37):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC_OLD`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHANGE_CURR_PC`, `SET_MENUS`, `FIELD_POSITION`, `GET_ITEM_INFO`, `GET_PRICE_RATE`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `PRINT_PROC`, `CALL_SCR_LNK_PRC`

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
| IAS_POS_BILL_DTL | 7 |
| USER_R | 5 |
| IAS_GNR_CODE_DTL | 5 |
| IAS_ITM_MST | 5 |
| CUSTOMER | 4 |
| IAS_POS_HST_BILL_DTL | 4 |
| EX_RATE | 3 |
| IAS_POS_BILL_MST | 2 |
| CASH_AT_BANK | 2 |
| CREDIT_CARD_TYPES | 2 |
| IAS_POS_RT_BILL_MST | 2 |
| PRIVILEGE_GC | 2 |
| IAS_PARA_POS | 1 |
| PRIVILEGE_FIXED | 1 |
| S_BRN | 1 |
| IAS_PRICING_LEVELS | 1 |
| PRIV_ACC | 1 |
| IAS_PRIV_CUSTOMER | 1 |
| PRIV_CASH | 1 |
| USER | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_GEN_PKG`, `IAS_USR_PKG`, `YS_GEN_PKG`, `YS_SCR_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `POS_MNU_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(USE_PAID,0),NVL(AUDIT_DEL_ITM,0),NVL(USE_VAT,0),COLLCT_RPT_ITM_PRNT,FTR_BILL,SHOW_AVLQTY_IN_BILL,SHOW_TOOLBAR,PRD_BACK_HOUR,PRD_BACK_INCRS_TYP,PRD_BACK_INCRS_F_DATE,PRD_BACK_INCRS_T_DATE,USE_FDA FROM IAS_PARA_POS,IAS_PARA_GEN,IAS_PARA_INV
SELECT NVL(PRINT_PREV_BILL,0),NVL(ALLOW_HUNG_BILLS,0),NVL(ALLOW_DEL_ITM_FROM_POS_BILL,0) FROM PRIVILEGE_FIXED WHERE U_ID
SELECT NVL(BRN_LNAME,BRN_FNAME) FROM S_BRN WHERE BRN_NO
SELECT PRINTER_BARCODE_DFLT_NM,PRINTER_BARCODE_PATH FROM USER_R WHERE U_ID
SELECT COUNT(1) FROM IAS_GNR_CODE_DTL WHERE MAIN_CODE IN
SELECT DECODE(:b1,1,NVL(I_NAME,I_E_NAME),NVL(I_E_NAME,I_NAME)) FROM IAS_ITM_MST WHERE I_CODE
SELECT A_CY FROM IAS_PRICING_LEVELS WHERE LEV_NO = :b1"SELECT CUR_RATE FROM EX_RATE WHERE NVL
SELECT CUR_RATE FROM EX_RATE WHERE CUR_CODE
SELECT COUNT(1) FROM IAS_POS_BILL_DTL WHERE BILL_NO
SELECT D.I_CODE,M.I_NAME,D.ITM_UNT,D.I_QTY,D.EXPIRE_DATE,D.FIELD_DTL1,D.FIELD_DTL2,D.FIELD_DTL3,D.FIELD_DTL4,D.USG_ITM FROM IAS_ITM_MST M,IAS_POS_BILL_DTL D WHERE D
Select customer.c_code, Decode (:Parameter.Lang_No,1, Nvl (c_a_name, c_e_name), Nvl (c_e_name, c_a_name)) c_name, Decode (:Parameter.Lang_No,1, Nvl (c_group_a_name, c_group_e_name), Nvl (c_group_e_name, c_group_a_name)) group_name, customer.c_a_code a_code From customer,Customer_Group
Select 1 From Priv_Acc
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST023_strings.txt`.
