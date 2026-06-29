# POST017 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 469,960 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST017.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> استعراض حركة الفواتير 
>  نظام نقاط البيع > عمليات النظام > 
>  استعراض حركة الفواتير 
>  الاستخدام: 
>  تستخدم 
> الشاشة لاستعراض حركة فواتير المبيعات ومردود المبيعات، ويمكن عرض الفواتير 
> حسب رقم الفاتورة، أو الكمية، أو السعر، أو 
> التاريخ، أو نقطة البيع، أو المستخدم، كما يمكن من خلال هذه الشاشة تصدير البيانات 
> إلى ملف إكسل. 
>  طريقة استخدام الشاشة 
>  تستخدم 
> هذه الشاشة للعرض فقط مع إمكانية تصديرها إلى ملف إكسل على النحو 
> التالي: 
>  أولاً: البيانات الرئيسية 
>  - 
>  نوع 
> الوثيقة: 
>  يستخدم 
> هذا الحقل لتحديد نوع الوثيقة التي سيتم استعراض وثائقها في البيانات التفصيلية 
> وهي إما فواتير مبيعات أو مردود 
> مبيعات. 
>  - 
>  رقم 
> الفاتورة: يستخدم هذا الحقل 
> لاختيار رقم فاتورة معينة لاستعراض تفاصيلها ويمكن إدخاله يدوياً أو باستخدام 
>  F9 لتظهر قائمة بكل 
> الفواتير واختيار الفاتورة المراد استعراضها ومن ثم يتم النقر على إنزال 
> البيانات ليتم عرض بيانات الوثيقة في البيانات التفصيلية. 
>  - 
>  طريقة 
> العرض: 
>  يستخدم هذا الحقل 
> لتحديد طريقة عرض الفواتير (المبيعات أو المردود) بطريقة تحليلية أو إجمالية، مع 
> ملاحظة أنه عند اختيار إجمالي تظهر الفواتير بشكل إجمالي ويظهر زر (طباعة) يمكن من 
> خلاله طباعة الفاتورة. 
>  - 
>  رقم 
> الصنف: 
>  يستخدم هذا الحقل 
> للبحث عن فواتير المبيعات أو مردود المبيعات التي تحتوي على رقم الصنف المحدد هنا 
> وبمجرد النقر على إنزال البيانات تظهر في البيانات التفصيلية الفواتير التي تحتوي 
> على هذا الصنف. 
>  - 
>  من 
> تاريخ: يستخدم هذا 
> الحقل للبحث عن فواتير المبيعات أو مردود المبيعات التي تقع ضمن فترة معينة من 
> تاريخ إلى تاريخ. 
>  - 
>  من 
> نقطة بيع/ إلى: يستخدم هذا 
> الحقل للبحث عن فواتير المبيعات أو مردود المبيعات حسب نقطة البيع. 
>  - 
>  من 
> رقم مستخدم/ إلى: يستخدم هذا 
> الحقل للبحث عن فواتير المبيعات أو مردود المبيعات حسب المستخدم. 
>  - 
>  رقم 
> العميل النقدي: يستخدم هذا الحقل 
> للبحث عن فواتير المبيعات أو مردود المبيعات حسب رقم العميل النقدي. 
>  - 
>  رقم 
> الجوال: يستخدم هذا 
> الحقل للبحث عن فواتير المبيعات أو مرد

## 2. Data Blocks (13)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| PARAMTRS | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_BILL_VW | DB | Q-- | AUTOMATIC | ORDER:Bill_date |
| IAS_POS_RT_BILL_VW | DB | Q-- | AUTOMATIC |  |
| IAS_POS_BILL_MST | DB | Q-- | AUTOMATIC | ORDER:Bill_date |
| IAS_POS_RT_BILL_MST | DB | Q-- | AUTOMATIC | ORDER:RT_Bill_date |
| CLNDR | ctrl | QIU | DELAYED |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |

## 3. Canvases (11) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | STACKED | 951×303 | visible |
| MAIN2 | STACKED | 893×297 | visible |
| MAIN3 | STACKED | 754×312 | visible |
| MAIN4 | STACKED | 754×312 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
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

## 5. Triggers (45)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (33)


**Procedures/Functions (33):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `FORMS_TO_EXCEL`, `SHOW_DATA`, `DEL_REC_DET`, `PRINT_BILL`, `CALL_SCR_LNK_PRC`, `PRINT_RT_BILL`

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
| IAS_POS_BILL_MST | 5 |
| IAS_POS_RT_BILL_MST | 4 |
| IAS_ITM_MST | 3 |
| USER_R | 3 |
| S_BRN_USR_PRIV | 2 |
| IAS_POS_BILL_VW | 2 |
| IAS_POS_RT_BILL_VW | 2 |
| IAS_PARA_INV | 1 |
| PRIVILEGE | 1 |
| IAS_POS_HST_BILL_MST | 1 |
| IAS_POS_HST_RT_BILL_MST | 1 |
| IAS_POS_BILL_DTL | 1 |
| IAS_POS_HST_BILL_DTL | 1 |
| IAS_POS_RT_BILL_DTL | 1 |
| IAS_POS_HST_RT_BILL_DTL | 1 |
| PRIVILEGE_GC | 1 |
| IAS_POS_MACHINE | 1 |
| CUSTOMER | 1 |
| PRIV_ACC | 1 |
| IAS_PRIV_CUSTOMER | 1 |
| IAS_CASH_CUSTMR | 1 |
| MACHINE | 1 |
| USER | 1 |
| C_CODE | 1 |
| ITEM | 1 |
| BARCODE | 1 |
| IAS_POS_PAY_BILLS | 1 |
| IAS_POS_PAY_CASH | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_USR_PKG`, `DATE_CNVRTR_PKG`, `IAS_ITM_PKG`, `IAS_PRMTR_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_DBS_SYS_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT CONN_ITM_ACT_BY_USR_PRIV,USE_PAY_CASH_RT_BILLS,AR_AC_LINK_TYPE FROM IAS_PARA_INV,IAS_PARA_POS,IAS_PARA_AR
SELECT INCLUDE_FLAG FROM PRIVILEGE WHERE U_ID
Select Bill_No From ( Select Bill_No,I_Code From Ias_Pos_Bill_Dtl
Select Bill_No,I_Code From Ias_Pos_Hst_Bill_Dtl
SELECT BILL_NO,BILL_DATE ,A_CY,AD_U_ID,VAT_AMT_MST,MACHINE_NO,AD_DATE,BRN_YEAR,BRN_NO,ROUND(SUM(I_PRICE*I_QTY),4) BILL_AMT,ROUND(SUM(VAT_AMT*I_QTY),4) VAT_AMT,ROUND(SUM(DIS_AMT*I_QTY),4) DISC_AMT FROM IAS_POS_BILL_VW
Select Rt_Bill_No From ( Select Rt_Bill_No,I_Code From Ias_Pos_Rt_Bill_Dtl
Select Rt_Bill_No,I_Code From Ias_Pos_Hst_Rt_Bill_Dtl
SELECT RT_BILL_NO,RT_BILL_DATE ,A_CY,AD_U_ID,VAT_AMT_MST,MACHINE_NO,AD_DATE,BRN_YEAR,BRN_NO,ROUND(SUM(I_PRICE*I_QTY),4) BILL_AMT,ROUND(SUM(VAT_AMT*I_QTY),4) VAT_AMT,SUM(DIS_AMT) DISC_AMT FROM IAS_POS_RT_BILL_VW
Select I_Code,Decode(:Parameter.Lang_No,1,nvl(I_name,I_e_name),nvl(I_e_name,I_name) )I_name,I_desc from Ias_itm_mst where
Select bill_no, bill_date, bill_time, flg_desc bill_type, a_cy, bill_amt, disc_amt From ias_pos_bill_mst ,s_flags
Select rt_bill_no, rt_bill_date, rt_bill_time, flg_desc rt_bill_type, a_cy, rt_bill_amt, disc_amt From ias_pos_rt_bill_mst ,s_flags
Select machine_no, terminal From ias_pos_machine
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST017_strings.txt`.
