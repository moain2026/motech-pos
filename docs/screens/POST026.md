# POST026 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 604,992 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST026.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> المصروفات 
>  نظام نقاط البيع > عمليات النظام > 
>  المصروفات 
>  الاستخدام: 
> تظهر شاشة المدفوعات عند 
> تفعيل المتغير (استخدام المدفوعات) في شاشة متغيرات وإعدادات نقاط البيع، وتستخدم 
> لغرض إدخال المدفوعات النقدية التي يتم دفعها من قبل الكاشير (نقطة البيع) لصالح 
> الغير سواءً كانت التزامات للغير أو مقابل سداد مصاريف، ويتم عرض المدفوعات عند 
> تصفية مبيعات الكاشير، ونشير هنا بأنه يمكن في سند الصرف استخدام كل أنواع الحسابات 
> المتاحة في النظام، أما بالنسبة للتأثير المالي للسند فإنه يتم عند الترحيل من نظام 
> نقاط البيع إلى نظام الأونكس. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر (إضافة) كما 
> يلي: 
>  - 
>  رقم 
> الفرع: يستخدم 
> هذا الحقل لتحديد الفرع الذي ستتم فيه عملية الصرف، مع ملاحظة أن الفروع التي تظهر 
> للكاشير الفروع التي له صلاحية التعامل معها. 
>  - 
>  طريقة 
> الدفع: يستخدم 
> هذا الحقل لتحديد طريقة الدفع التي بها تم سداد المبلغ للغير. 
>  - 
>  رقم 
> السند: يظهر رقم آلي غير 
> قابل للتعديل. 
>  - 
>  تاريخ 
> ووقت السند: يتم 
> عرض تاريخ ووقت السند آلياً غير قابل للتعديل. 
>  - 
>  المبلغ: 
>  يتم 
> إدخال المبلغ المدفوع للغير. 
>  - 
>  العملة: 
>  يستخدم 
> هذا الحقل لتحديد عملة الصرف. 
>  - 
>  سعر 
> التحويل: يظهر 
> سعر التحويل المحدد في شاشة تهيئة العملات مع إمكانية تعديله في إطار الحدود 
> المتاحة. 
>  - 
>  نوع 
> الحساب: يستخدم 
> هذا الحقل لتحديد نوع الحساب الذي ينتمي له الحساب التحليلي والذي سيتم الصرف له، 
> ويتضمن الحقل هذه الأنواع (عام/ عميل/ مورد/ مدينة أخرى/ دائنة أخرى/ ذمم 
> موظفين). 
>  - 
>  رقم 
> الحساب/ الحساب التحليلي: يستخدم حقل 
> (الحساب التحليلي) لإدخال رقم الحساب التحليلي يدوياً أو باستخدام F9 بعد تحديد نوع الحساب في الحقل السابق، 
> وبمجرد إدخال الحساب التحليلي يظهر رقم الحساب. 
>  - 
>  المرجع: 
>  يستخدم 
> لإدخال رقم مرجع للعملية. 
>  - 
>  رقم 
> العميل النقدي/ رقم الجوال: 
> تستخدم هذه الحقول لإدخال بيانات العميل النقدي فعند إدخال رقم العميل النقدي يتم 
> عرض رقم الجوال وعند إدخال رقم الجوال يتم عرض رقم العميل آلياً. 
>  - 

## 2. Data Blocks (15)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| POS_GNR_EXPNS | DB | QIU | AUTOMATIC | ORDER:DOC_SRL |
| SRCH_DTL | ctrl | QIU | AUTOMATIC |  |
| LOV_MST_SLCT | ctrl | QIU | DELAYED |  |
| LOV_DTL_SLCT | DB | QIU | DELAYED |  |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | IMMEDIATE |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (11) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_SRCH_DTL | STACKED | 450×40 | hidden |
| CNV_SRCH_MST_DTL | STACKED | 450×40 | hidden |
| CNV_LOV_SLCT | CONTENT | 2014×354 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (7)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_LOV_SLCT |  | DIALOG | true |
| WIN_LOV |  | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (44)

**Packages (spec):** `IAS_AC_PKG`


**Packages (body):** `IAS_AC_PKG`


**Procedures/Functions (42):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `GET_MAX_DOC_NO`, `CHK_DOC_PRCSS_FLG`, `VALIDATE_DOC_NO_REF`, `GET_EXPNS_PRVS_AMT`, `GET_CASH_NO`, `CHECK_CREDIT_LIMIT_AC`, `CHECK_DB_BRANCH`, `GET_AC_CODE_DTL_NM`, `SEND_MSG_PRC`, `GET_DATE_DLY_INCRS_PRC`, `CALL_SCR_LNK_PRC`, `GET_SLCT_DATA`, `GET_TAX_EXPNS_PRC`, `CLC_DOC_TAX`, `DLT_TAX_MOV_PRC`

## 7. مكتبات مرفقة (5)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`, `YSERPDBA2LIB`

## 8. Alerts (6)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| B4_SAVE | تراجع | WARNING | نعم |
| AL_CR_LIMIT | تنبيه | STOP | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| POS_GNR_EXPNS | 9 |
| IAS_POS_MACHINE | 8 |
| USER_R | 6 |
| V_DETAILS | 5 |
| ACCOUNT | 5 |
| PRIV_ACC | 5 |
| S_BRN_USR_PRIV | 4 |
| IAS_ACTVTY | 4 |
| SALES_ORDER | 3 |
| COST_CENTERS | 3 |
| IAS_PROJECTS | 3 |
| POS_BILL_DTL_ALL_VW | 2 |
| IAS_SHW_DOC_PRIV | 2 |
| PRIVILEGE_FIXED | 2 |
| CUSTOMER | 2 |
| S_EMP | 2 |
| GLS_ACCNT_DTL | 2 |
| GLS_TAX_ACC | 2 |
| IAS_CASH_CUSTMR | 2 |
| POS_GNR_RCPTS | 2 |
| EX_RATE | 1 |
| S_FLAGS | 1 |
| COST_CENTER_TYPES | 1 |
| IAS_PARA_GEN | 1 |
| IAS_PARA_POS | 1 |
| POS_DFLT_STNG_DTL | 1 |
| POS_DFLT_STNG_MST | 1 |
| POS_WRK_SHFT_CSHR | 1 |
| IAS_DEPOSIT_CURRENCY_MST | 1 |
| CUSTOMER_CURR | 1 |


_(+15 جدول/view آخر — انظر `_raw/POST026_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_ACODE_PKG`, `YS_LOV_SLCT_PKG`, `DATE_CNVRTR_PKG`, `SRCH_DTL_PKG`, `IAS_AC_PKG`, `IAS_USR_PKG`, `YS_TAX_PKG`, `LOV_PKG`, `IAS_SMS_MAIL_PKG`, `IAS_CHECK_SYS_PKG`, `YS_SCR_PKG`, `POS_GNR_PKG`, `GLS_LMT_PKG`, `IAS_CST_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `IAS_FETCH_DATA_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT CC_CODE,PJ_NO,ACTV_NO FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT COUNT(1) FROM POS_GNR_EXPNS WHERE DOC_NO
SELECT COUNT(1) FROM POS_GNR_EXPNS WHERE DOC_SRL
SELECT COUNT(1) FROM SALES_ORDER WHERE ORDER_SER
SELECT COUNT(1) FROM POS_BILL_DTL_ALL_VW WHERE ORDER_SER
SELECT 1 FROM POS_GNR_EXPNS WHERE DOC_SRL = :b1 AND NVL(EXTRNL_PST,0) = 1 AND ROWNUM <= 1" FILL_ALL_LIST_PRC STANDARD /LPOSLIB GEN_PKG "PKG INIT"FILL_ALL_LIST_PRC"P_ITM"V_STM"" FILL_ALL_LIST_PRC Select To_Char(CUR_NO)||' - '||CUR_CODE||' '||CUR_NAME,to_char(CUR_CODE) from EX_RATE order by CUR_NO
Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
SELECT 1 FROM IAS_SHW_DOC_PRIV
SELECT 1 FROM S_BRN_USR_PRIV
SELECT 1 FROM POS_GNR_EXPNS
SELECT NVL(CONNECTION_TYPE,1) FROM USER_R WHERE U_ID
SELECT 1 FROM IAS_POS_MACHINE WHERE ROWNUM <= 1"SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST026_strings.txt`.
