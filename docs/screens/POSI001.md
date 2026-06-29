# POSI001 — توثيق شاشة Onyx Pro POS

> النوع: **POSI** — إدخال/بيانات أساسية (Input/Master)  
> الحجم: 438,796 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSI001.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> أجهزة وآلات نقاط بيع 
>  نظام نقاط البيع > مدخلات النظام > 
>  أجهزة وآلات نقاط بيع 
>  الاستخدام: 
>  تستخدم 
> الشاشة لإضافة نقاط البيع (الآلات) حيث يتم تعريف كل جهاز يستخدم الجهاز الرئيسي 
> (السيرفر) أو الفرعي على أنه نقطة بيع؛ بحيث يسمح النظام للمستخدم عبر هذه النقطة 
> الدخول إلى النظام بعد عملية التصريح للجهاز من الشاشة الخاصة 
> بالتصاريح. 
>  طريقة استخدام الشاشة 
>  تستخدم 
> الشاشة بعد النقر على زر الإضافة على النحو التالي: 
>  - 
>  نقطة 
> البيع: بمجرد عملية 
> الإضافة يظهر رقم نقطة البيع بشكل آلي ويتم إضافة اسم نقطة البيع وهو اسم الجهاز 
> الرئيسي (السيرفر) أو الطرفي (الكاشير) المراد استخدامه كنقطة بيع، كما يمكن إضافة 
> السيرفر الفرعي في حالة استخدام نقاط البيع المنفصل ليتم الدخول منه إلى النظام 
> وإجراء عملية نقل البيانات. 
>  - 
>  موقف: 
>  يستخدم هذا 
> الخيار في توقيف 
> استخدام نقطة البيع. 
>  أولاً: البيانات الرئيسية 
>  - 
>  اسم 
> الاتصال: إذا لم يتم إدخال 
> البيانات في هذا الحقل سيتم تعبئته من قبل النظام بشكل آلي عند عملية الحفظ، ويحتوي 
> على اسم الاتصال في حال استخدام نقاط البيع المنفصل وهو اسم DB_LINK للسيرفر الرئيسي الذي يربط بين السيرفر 
> الرئيسي والفرعي. 
>  - 
>  تسلسل 
> فواتير المبيعات: يتم تحديد 
>  تسلسل 
> فواتير المبيعات الذي سوف يبدأ به النظام عند العمل على شاشة فواتير المبيعات، فعلى 
> سبيل المثال يتم إدخال التسلسل بـ (1) ليبدأ تسلسل الفواتير من الواحد. 
>  - 
>  تسلسل 
> مردود المبيعات: يتم تحديد 
>  تسلسل 
> فواتير مردود المبيعات الذي سوف يبدأ به النظام عند العمل على مردود المبيعات، فعلى 
> سبيل المثال يتم إدخال التسلسل بـ (1) ليبدأ تسلسل فواتير المردود من 
> الواحد. 
>  - 
>  عملة 
> البيع الافتراضية: يتم تحديد عملة 
> البيع الافتراضية حيث تظهر بشكل آلي في شاشة الفاتورة مع إمكانية تعديلها إذا تم 
> تفعيل (السماح بتعديل عملة الفاتورة والمردود) 
> في شاشة إعدادات نقاط البيع. 
>  - 
>  رقم 
> الفرع: يتم تحديد رقم 
> الفرع المرتبط بنقطة البيع من بين الفروع المضافة في شاشة بيانات الفروع في نظام 
> الأونكس ERP . 
>  - 
>  نوع 
> الفواتير: 
>  

## 2. Data Blocks (10)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_MACHINE | DB | QIU | IMMEDIATE | ORDER:Machine_No |
| POS_DFLT_STNG_DTL | DB | QIU | DELAYED | WHERE:Nvl(POS_DFLT_STNG_DTL.INACTIVE,0)=0 |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | TAB | ?×? | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (42)

**Packages (spec):** `MYLIB`


**Packages (body):** `MYLIB`


**Procedures/Functions (40):** `CHECK_PACKAGE_FAILURE`, `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `DYNAMIC_RECORD_GROUP`, `CLEAR_ALL_MASTER_DETAILS`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `GET_VAL_DSC_NM_PRC`, `QUERY_MASTER_DETAILS`, `DYNAMIC_LOV_FVRT_STNG_VAL`, `GET_SERIAL`, `CHK_MCHN_LCNS_CNT_PRC_OLD`, `CHECK_DB_BRANCH`, `CALL_SCR_LNK_PRC`, `CHK_MCHN_LCNS_CNT_PRC`, `CUSTOMER_DISPLAYED_PRC`, `CHK_WCODE_PRC`

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
| IAS_POS_MACHINE | 12 |
| WAREHOUSE_DETAILS | 5 |
| IAS_ACTVTY | 4 |
| SALES_MAN | 4 |
| CREDIT_CARD_TYPES | 4 |
| GNR_TAX_TYP_CLC_MST | 3 |
| GNR_TAX_TYP_CLC_DTL | 3 |
| COST_CENTERS | 3 |
| IAS_PROJECTS | 3 |
| USER_R | 3 |
| IAS_PARA_GEN | 2 |
| POS_DFLT_STNG_DTL | 2 |
| IAS_POS_BILL_MST | 2 |
| IAS_POS_RT_BILL_MST | 2 |
| CASH_IN_HAND | 2 |
| S_FLAGS | 2 |
| IAS_POS_EXTRA_KEYPAD | 2 |
| IAS_MACHINES | 2 |
| IAS_POS_PRIV_MACHINE | 2 |
| IAS_PARA_AR | 1 |
| POS_BILL_MST_ALL_VW | 1 |
| IAS_PRICING_LEVELS | 1 |
| IAS_SALES_TYPES | 1 |
| IAS_RT_SALES_TYPES | 1 |
| IAS_PARA_POS | 1 |
| COST_CENTER_TYPES | 1 |
| IAS_CR_CARD_TYPES | 1 |
| DBA_SNAPSHOTS | 1 |
| POS_DFLT_STNG_MST | 1 |
| PRIVILEGE_WH | 1 |


_(+9 جدول/view آخر — انظر `_raw/POSI001_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `YS_TAX_PKG`, `DATE_CNVRTR_PKG`, `YS_GEN_PKG`, `IAS_USR_PKG`, `YS_SCR_PKG`, `IAS_BRN_PKG`, `IAS_PRMTR_PKG`, `COMM_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT INVOICING_SERIALS,INVOICING_SERIALS_SR FROM IAS_PARA_AR
SELECT CC_AVAIL,USE_PROJECTS,NVL(AR_CS_TYPE,0),NVL(AR_PJ_TYPE,0),NVL(AR_ACTV_TYPE,0) FROM IAS_PARA_GEN,IAS_PARA_AR
SELECT CONN_BRN_NO FROM WAREHOUSE_DETAILS WHERE W_CODE
UPDATE IAS_POS_MACHINE SET ADVR_CUST_TXT1=:b1,ADVR_CUST_TXT2=:b2,ADVR_CUST_TXT3=:b3 WHERE :b4 = 1"SELECT SALE_SER,RT_SALE_SER FROM IAS_POS_MACHINE WHERE MACHINE_NO = :b1 AND ROWNUM <= 1" DYNAMIC_RECORD_GROUP STANDARD FORMS4
SELECT COUNT(MACHINE_NO) FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT COUNT(MACHINE_NO) FROM IAS_POS_MACHINE WHERE TERMINAL
SELECT COUNT(STNG_NO) FROM POS_DFLT_STNG_DTL WHERE STNG_NO
SELECT 1 FROM IAS_POS_BILL_MST WHERE MACHINE_NO = :b1 AND ROWNUM <= 1"SELECT 1 FROM IAS_POS_RT_BILL_MST WHERE MACHINE_NO
SELECT COUNT(1) FROM POS_BILL_MST_ALL_VW WHERE REF_NO
Select To_Char(lev_no)||'- '||Decode( ,1,Nvl(lev_a_name,lev_e_name) ,Nvl(lev_e_name,lev_a_name)) , To_Char(lev_no) From ias_pricing_levels
Select To_Char(Si_Type)||'- '||Decode( ,1,Nvl(Si_A_Name,Si_E_Name) ,Nvl(Si_E_Name,Si_A_Name)) , To_Char(Si_Type) From Ias_Sales_Types
Select To_Char(Sr_Type)||'- '||Decode( ,1,Nvl(Sr_A_Name,Sr_E_Name) ,Nvl(Sr_E_Name,Sr_A_Name)) , To_Char(Sr_Type) From Ias_Rt_Sales_Types
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSI001_strings.txt`.
