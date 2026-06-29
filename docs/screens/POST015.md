# POST015 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 449,364 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST015.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> فائض وعجز مبيعات الكاشيرات 
>  نظام نقاط البيع > عمليات النظام > 
>  فائض وعجز مبيعات الكاشيرات 
>  الاستخدام: 
>  تظهر 
> الشاشة عند تفعيل المتغير (عرض قيد فائض وعجز الكاشيرات) في متغيرات وإعدادات نقاط 
> البيع، و تستخدم 
> لاستعراض القيد الخاص بفائض وعجز الكاش ي رات 
> حيث يقوم النظام وبشكل آلي بالمقارنة بين البيانات المدخلة في شاشة التصفية 
> والمبيعات الفعلية والعمليات الأخرى مثل الاستبدالات والدفع النقدي ويتم حساب 
> الفائض والعجز وإثبات القيد الخاص به. 
>  طريقة استخدام الشاشة 
>  أولاً: البيانات الرئيسية 
>  - 
>  من 
> الفرع: يتم تحديد الفرع 
> الذي تعمل فيه نقطة البيع والذي سيتم فيه تحديد العجز والفائض والذي تمت فيه عملية 
> تصفية مبيعات الكاشير. 
>  - 
>  من 
> رقم المستخدم – 
> إلى: يستخدم هذا الحقل 
> في تحديد رقم المستخدم (الكاشير) الذي سيقوم النظام بمطابقة مبيعاته بالتصفية التي 
> تمت في شاشة التصفية. 
>  - 
>  التاريخ: 
>  يظهر التاريخ 
> المحدد في شاشة تصفية مبيعات الكاشير بعد إدخال رقم التصفية. 
>  - 
>  رقم 
> التصفية/ إلى: 
>  يستخدم هذا الحقل 
> لإدخال رقم التصفية المراد إنزالها وبمجرد اختيار رقم التصفية يظهر التاريخ 
> آلياً. 
>  - 
>  إنزال 
> البيانات: بعد اختيار 
> التصفية المراد إنزالها 
>  يتم النقر على إنزال البيانات 
> لإنزال القيد في البيانات التفصيلية. 
>  - 
>  رقم 
> الفرع: 
>  يظهر رقم الفرع 
> آلياً بمجرد النقر على إنزال البيانات ولا يمكن اختيار أي فرع آخر. 
>  - 
>  رقم 
> المستند: يظهر رقم 
> المستند آلياً بمجرد النقر على إنزال البيانات مع إمكانية تعديله. 
>  - 
>  تاريخ 
> المستند: يظهر تاريخ 
> المستند آلياً بمجرد النقر على إنزال البيانات ولا يمكن تعديله. 
>  - 
>  تجميع 
> السجلات المكررة: يعمل هذا الخيار 
> على تجميع سجلات الحسابات المكررة في البيانات التفصيلية. 
>  - 
>  مستخدم: يظهر 
> هذا الخيار مفعلاً إذا تم إنزال هذا المستند في شاشة قيود اليومية. 
>  ثانياً: 
> البيانات التفصيلية 
>  - 
>  بمجرد 
> النقر على إنزال البيانات تتم عملية 
> المطابقة وإنزال القيد مباشرة بالفائض أو العجز شرط أن يكون قد تم إضافة حسابات 
> الفائض والعجز في الحسابات الوسيطة في نظام

## 2. Data Blocks (11)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| BLK_OPTIONS | ctrl | QIU | AUTOMATIC |  |
| IAS_POS_JRNL_DIFF_CSHR_MST | DB | QIU | DELAYED | ORDER:DOC_SER,DOC_DATE |
| IAS_POS_JRNL_DIFF_CSHR_DTL | DB | QIU | AUTOMATIC | ORDER:RCRD_NO |
| CLNDR | ctrl | QIU | DELAYED |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | STACKED | 1153×262 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (41)


**Procedures/Functions (41):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `GET_A_NAME`, `POST_JRNL_CNFRM_CSHIER_OLD`, `POST_JRNL_CNFRM_CSHR_BNK_OLD`, `POST_JRNL_CNFRM_CSHIER`, `POST_JRNL_CNFRM_CSHR_BNK`, `GRP_DPLCT_RCRD_PRC`, `FILL_RG_DOC_NO_REF_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `CALL_SCR_LNK_PRC`, `SET_ALRT_CHK_DATA_PRPRTY_PRC`, `GET_DATE_WRK_SHFT`, `GET_CRD_CARD_NM_FNC`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KWUTIL`, `D2KCOMN`

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
| IAS_POS_BILL_MST | 23 |
| IAS_DEPOSIT_CURRENCY_MST | 21 |
| IAS_POS_JRNL_DIFF_CSHR_DTL | 11 |
| USER_R | 9 |
| ACCOUNT_CURR | 8 |
| POS_WRK_SHFT_CSHR | 8 |
| S_BRN_USR_PRIV | 5 |
| IAS_POS_JRNL_DIFF_CSHR_MST | 5 |
| POS_JRNL_CNFRM_CSHR_TMP | 5 |
| INTERFACE_ACC | 4 |
| IAS_POS_FNL_DATA_ALL | 4 |
| IAS_SHW_DOC_PRIV | 3 |
| POS_GNR_RCPTS | 3 |
| S_BRN | 2 |
| IAS_DEPOSIT_CURRENCY_DTL | 2 |
| IAS_DEPOSIT_CREDIT_CARD | 2 |
| CASH_AT_BANK | 2 |
| CREDIT_CARD_TYPES | 2 |
| IAS_PARA_POS | 1 |
| PRIVILEGE_FIXED | 1 |
| ACCOUNT | 1 |
| IAS_POS_RT_BILL_MST | 1 |
| IAS_POS_PAY_BILLS | 1 |
| IAS_POS_PAY_CASH | 1 |
| IAS_POS_MACHINE | 1 |
| USER | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `IAS_CSHBNK_PKG`, `YS_GEN_PKG`, `IAS_ACODE_PKG`, `YS_SCR_PKG`, `IAS_CST_PKG`, `POS_WRK_SHFT_PKG`, `YS_AC_DTL_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
UPDATE IAS_DEPOSIT_CURRENCY_MST SET PROCESS=0 WHERE DOC_SER IN (SELECT DISTINCT (DOC_SER_REF) FROM IAS_POS_JRNL_DIFF_CSHR_DTL WHERE DOC_SER = :b1 )" DEL_DET_REC_PRC STANDARD SQLFORMS "PKG INIT"DEL_DET_REC_PRC"P_BLK_NM"" DEL_DET_REC_P
Select Brn_no||'-'||Decode( ,1,Nvl(BRN_LNAME,BRN_FNAME), Nvl(BRN_FNAME,BRN_LNAME))BRN_NAME,To_Char(Brn_no) Brn_no From S_Brn
Select 1 From S_Brn_Usr_Priv Where U_Id = And S_Brn_Usr_Priv.Brn_No = IAS_POS_JRNL_DIFF_CSHR_MST.Brn_No And Nvl(Add_Flag,1) = 1 And Rownum <=1 ) And Exists(Select 1 From Ias_Shw_Doc_Priv
Select 1 From IAS_POS_JRNL_DIFF_CSHR_DTL Where Cashier_no BETWEEN AND And IAS_POS_JRNL_DIFF_CSHR_DTL.DOC_SER = IAS_POS_JRNL_DIFF_CSHR_MST.DOC_SER And Rownum <=1 ) And Exists (Select 1 From IAS_POS_JRNL_DIFF_CSHR_DTL
SELECT 1 FROM IAS_SHW_DOC_PRIV
SELECT USE_PAY_CASH_RT_BILLS,DPST_TYP,USE_PAID,USE_WRK_SHFT FROM IAS_PARA_POS
SELECT USER_VIEW_DOC_ENTR FROM PRIVILEGE_FIXED WHERE U_ID
UPDATE IAS_DEPOSIT_CURRENCY_MST SET PROCESS=1 WHERE DOC_SER IN (SELECT DISTINCT (DOC_SER_REF) FROM IAS_POS_JRNL_DIFF_CSHR_DTL WHERE DOC_SER = :b1 )" PRE_FORM_PRC STANDARD /Lyserpdbalib SETUP_PKG /LPOSLIB GEN_PKG /NSPC8/LOAD_PARAMETER
SELECT NVL(AC_DTL_TYP,0) FROM ACCOUNT WHERE A_CODE
SELECT MIN(AD_U_ID) FROM IAS_POS_BILL_MST WHERE BRN_NO
SELECT MAX(AD_U_ID) FROM IAS_POS_BILL_MST WHERE BRN_NO
SELECT 1 FROM IAS_POS_JRNL_DIFF_CSHR_DTL WHERE CASHIER_NO BETWEEN :b1 AND :b2 AND DOC_DATE = TO_DATE(:b3,''DD/MM/RRRR'') AND NVL(BRN_NO,0) = NVL(:b4,NVL(BRN_NO,0)) AND ROWNUM <= 1"SELECT 1 FROM IAS_POS_BILL_MST WHERE NVL
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST015_strings.txt`.
