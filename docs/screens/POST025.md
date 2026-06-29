# POST025 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 627,204 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST025.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> المقبوضات 
>  نظام نقاط البيع > عمليات النظام > 
>  المقبوضات 
>  الاستخدام: 
> تظهر شاشة المقبوضات عتد تفعيل المتغير (استخدام المقبوضات) في شاشة متغيرات 
> وإعدادات نقاط البيع، وتستخدم لغرض إدخال المقبوضات النقدية التي يستلمها الكاشير 
> (نقطة البيع) من الغير، ويتم عرض هذه المقبوضات عند تصفية مبيعات الكاشير، ونشير 
> هنا بأنه يمكن في سند القبض استخدام كل أنواع الحسابات المتاحة في النظام، أما 
> بالنسبة للتأثير المالي للسند فإنه يتم عند الترحيل من نظام نقاط البيع إلى نظام 
> الأونكس. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر (إضافة)، مع ملاحظة أنه يمكن التعامل مع 
> المقبوضات في الشاشة حسب طريقة الدفع (نقداً/ شبكة/ تحويل) كما 
> يلي: 
>  أولاً: طريقة الدفع (نقداً) 
>  - 
>  رقم 
> الفرع: يستخدم 
> هذا الحقل لتحديد الفرع الذي ستتم فيه عملية القبض، مع ملاحظة أن الفروع التي تظهر 
> للكاشير الفروع التي له صلاحية التعامل معها. 
>  - 
>  طريقة 
> الدفع: يستخدم 
> هذا الحقل لتحديد طريقة الدفع التي بها تم سداد المبلغ من الغير. 
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
> إدخال المبلغ المستلم من الغير. 
>  - 
>  العملة: 
>  يستخدم 
> هذا الحقل لتحديد عملة القبض. 
>  - 
>  سعر 
> التحويل: يظهر 
> سعر التحويل المحدد في شاشة تهيئة العملات مع إمكانية تعديله في إطار الحدود 
> المتاحة. 
>  - 
>  النوع: 
>  يستخدم 
> هذا الحقل لتحديد نوع القبض، ويتضمن نوعين إما (سند قبض) أو (دفعة 
> مقدمة). 
>  - 
>  نوع 
> الحساب: يستخدم 
> هذا الحقل لتحديد نوع الحساب الذي ينتمي له الحساب التحليلي والذي سيتم القبض منه، 
> ويتضمن الحقل هذه الأنواع (عام/ عميل/ مورد/ مدينة أخرى/ دائنة أخرى/ ذمم 
> موظفين). 
>  - 
>  رقم 
> الحساب/ الحساب التحليلي: يستخدم حقل 
> (الحساب التحليلي) لإدخال رقم الحساب التحليلي يدوياً أو باستخدام F9 بعد تحديد نوع الحساب في الحقل السابق، 
> وبمجرد إدخال الحساب التحليلي يظهر رقم الحساب. 
>  - 
>  رقم 
> الجوال/ رقم العميل النقدي: تستخدم 
> هذه الحقول عند إدخال عمي

## 2. Data Blocks (16)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | IMMEDIATE |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| POS_GNR_RCPTS | DB | QIU | AUTOMATIC | ORDER:DOC_NO |
| DMY_SHW_RCRD | ctrl | Q-- | AUTOMATIC |  |
| SRCH_DTL | ctrl | QIU | AUTOMATIC |  |
| LOV_MST_SLCT | ctrl | QIU | DELAYED |  |
| LOV_DTL_SLCT | DB | QIU | DELAYED |  |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (12) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_SHW_RCRD | CONTENT | 300×398 | visible |
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

## 4. Windows (8)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_SHW_RCRD |  | DIALOG | false |
| WIN_LOV_SLCT |  | DIALOG | true |
| WIN_LOV |  | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (43)

**Packages (spec):** `IAS_AC_PKG`


**Packages (body):** `IAS_AC_PKG`


**Procedures/Functions (41):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `SHOW_OR_HIDE_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `GET_MAX_DOC_NO`, `GET_CASH_NO`, `GET_AC_CODE_DTL_NM`, `CHK_DOC_PRCSS_FLG`, `CHK_CSTMR_ORDR_PYMNT`, `GET_RSRV_PRVS_AMT`, `GET_CSTMR_DATA`, `CHK_ADVNC_AMT_PRC`, `SEND_MSG_PRC`, `CHECK_DB_BRANCH`, `GET_DATE_DLY_INCRS_PRC`, `CHECK_CREDIT_LIMIT_AC`, `CALL_SCR_LNK_PRC`, `GET_SLCT_DATA`

## 7. مكتبات مرفقة (5)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`, `YSERPDBA2LIB`

## 8. Alerts (5)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| B4_SAVE | تراجع | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| POS_GNR_RCPTS | 8 |
| IAS_POS_MACHINE | 7 |
| PRIV_ACC | 5 |
| USER_R | 5 |
| V_DETAILS | 5 |
| SALES_ORDER | 5 |
| ACCOUNT | 5 |
| S_BRN_USR_PRIV | 3 |
| CREDIT_CARD_TYPES | 3 |
| CASH_AT_BANK | 3 |
| IAS_ACTVTY | 3 |
| S_FLAGS | 2 |
| IAS_SHW_DOC_PRIV | 2 |
| PRIVILEGE_FIXED | 2 |
| CUSTOMER | 2 |
| S_EMP | 2 |
| GLS_ACCNT_DTL | 2 |
| PRIV_CASH | 2 |
| IAS_CASH_CUSTMR | 2 |
| COST_CENTERS | 2 |
| IAS_PROJECTS | 2 |
| EX_RATE | 1 |
| S_FLAGS_PRIV | 1 |
| IAS_CR_CARD_TYPES | 1 |
| COST_CENTER_TYPES | 1 |
| IAS_PARA_GEN | 1 |
| IAS_PARA_POS | 1 |
| POS_DFLT_STNG_DTL | 1 |
| POS_DFLT_STNG_MST | 1 |
| POS_WRK_SHFT_CSHR | 1 |


_(+14 جدول/view آخر — انظر `_raw/POST025_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_ACODE_PKG`, `YS_LOV_SLCT_PKG`, `DATE_CNVRTR_PKG`, `SRCH_DTL_PKG`, `POS_GNR_PKG`, `IAS_AC_PKG`, `IAS_USR_PKG`, `YS_GEN_PKG`, `LOV_PKG`, `IAS_SMS_MAIL_PKG`, `IAS_CHECK_SYS_PKG`, `YS_SCR_PKG`, `IAS_CST_PKG`, `GLS_LMT_PKG`, `IAS_PRMTR_PKG`, `IAS_FETCH_DATA_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT CC_CODE,PJ_NO,ACTV_NO FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT COUNT(1) FROM PRIV_ACC WHERE A_CODE
SELECT COUNT(1) FROM POS_GNR_RCPTS WHERE DOC_NO
SELECT COUNT(1) FROM POS_GNR_RCPTS WHERE DOC_SRL
Select To_Char(CUR_NO)||' - '||CUR_CODE||' '||CUR_NAME,to_char(CUR_CODE) from EX_RATE order by CUR_NO
Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
SELECT 1 FROM S_FLAGS_PRIV WHERE U_ID= AND FLG_CODE=S_FLAGS.FLG_CODE AND FLG_VALUE=S_FLAGS.FLG_VALUE AND PRIV_FLAG=1) Order By FLG_SR POS_GNR_RCPTS.PYMNT_TYPE Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
Select To_Char(CR_CARD_TYPE)||'- '||Decode( ,1,Nvl(CARD_A_NAME, CARD_E_NAME),Nvl(CARD_E_NAME,CARD_A_NAME)), To_Char(CR_CARD_TYPE) From IAS_CR_CARD_TYPES
SELECT 1 FROM IAS_SHW_DOC_PRIV
SELECT NVL(CONNECTION_TYPE,1) FROM USER_R WHERE U_ID
SELECT 1 FROM IAS_POS_MACHINE WHERE ROWNUM <= 1"SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT MACHINE_NO FROM USER_R WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST025_strings.txt`.
