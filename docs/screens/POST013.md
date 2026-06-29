# POST013 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 518,636 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST013.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> تصفية مبيعات الكاشيرات 
>  نظام نقاط البيع > عمليات النظام > 
>  تصفية مبيعات الكاشيرات 
>  الاستخدام: 
> تستخدم الشاشة لتصفية مبيعات الكاشيرات بعد عملية انتهاء البيع، وتتم عملية التصفية 
> بإدخال المبالغ المستلمة من الكاشير حسب الفئات التي تم ترميزها في شاشة تهيئة 
> العملات في التهيئة العامة في الأونكس ERP ، 
>  ويكون استخدام هذه الشاشة إجباري إذا تم تفعيل المتغير (عدم السماح بالبيع 
> في حالة عدم تصفية المبيعات) في شاشة متغيرات وإعدادات نقاط البيع، ويتم الاستفادة 
> من عملية التصفية في شاشة فائض وعجز الكاشيرات حيث يتم مطابقة المبالغ المدخلة في 
> هذه الشاشة ومقارنتها مع المبيعات الفعلية وعرض فائض وعجز كل نقطة حسب المستخدم 
> (الكاشير). 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر الإضافة على النحو 
> التالي: 
>  أولاً: البيانات الرئيسية 
>  - 
>  رقم 
> الفرع: 
>  يستخدم 
> لاختيار الفرع الذي سيتم فيه إدخال عملية (تصفية مبيعات الكاشيرات). 
>  - 
>  المستخدم: 
>  يتم 
> اختيار المستخدم الذي سيتم تصفية مبيعاته. 
>  - 
>  رقم 
> الوثيقة/ تاريخ الوثيقة: 
>  تظهر 
> رقم وثيقة التصفية وتاريخها آلياً ولا يمكن التعديل. 
>  - 
>  البيان: 
>  يتم 
> إضافة بيان توضيحي 
> لعملية التصفية. 
>  - 
>  (من تاريخ/ إلى تاريخ) / (من وقت/ إلى 
> وقت): 
>  في 
> العادة يتم تصفية مبيعات الكاشير بشكل يومي لكن من خلال هذه الحقول يمكن تصفية 
> المبيعات لفترة ما من خلال تحديد فترة معينة (من تاريخ/ إلى تاريخ) ومن (وقت/ إلى 
> وقت) وتظهر هذه الحقول إذا تم اختيار (متعدد) لإدخال تصفية مبيعات في شاشة متغيرات 
> وإعدادات نقاط البيع. 
>  - 
>  رقم 
> الوردية: يعرض النظام رقم 
> الوردية آلياً بمجرد اختيار المستخدم، علماً أن هذا الحقل يظهر إذا تم تفعيل متغير 
> (استخدام ورديات العمل) في شاشة متغيرات نقاط البيع. 
>  ثانياً: 
> البيانات التفصيلية 
>  تحتوي على عدة تبويبات سيتم تناولها على النحو 
> التالي: 
>  - 
>  إجمالي 
> المبالغ بالعملة المحلية: يستخدم هذا 
> التبويب لتصفية المبالغ بالعملة المحلية فبعد عملية الإضافة يقوم النظام بعرض جميع 
> الفئات بالعملة المحلية ومن ثم يقوم مسئول المطابقة بإدخا

## 2. Data Blocks (12)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | UNKNOWN |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_DEPOSIT_CURRENCY_MST | DB | QIU | DELAYED | ORDER:Doc_No |
| IAS_DEPOSIT_CURRENCY_DTL | DB | QIU | DELAYED | WHERE:A_Cy = Ias_Gen_Pkg.Get_Local_Cur |
| IAS_DEPOSIT_CURRENCY_DTL_F | DB | QIU | DELAYED | WHERE:A_Cy <> Ias_Gen_Pkg.Get_Local_Cur |
| IAS_DEPOSIT_CREDIT_CARD | DB | QIU | DELAYED |  |
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
| MAIN1 | TAB | ?×? | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (6)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN1 |  | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (44)

**Packages (spec):** `WRK_SHFT_PKG`


**Packages (body):** `WRK_SHFT_PKG`


**Procedures/Functions (42):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_ACY`, `GET_DOC_DATE`, `GET_SUM_BILL_AMT`, `GET_SUM_BILL_AMT_F`, `PRINT_HUNG_BILL_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `GET_SERIAL`, `GET_TIME_PRC`, `GET_POS_CUR_RATE_FNC`, `GET_SUM_ALL_AMT`, `GET_SUM_BILL_AMT_OLD`, `CALL_SCR_LNK_PRC`, `SET_ALRT_CHK_DATA_PRPRTY_PRC`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KWUTIL`, `D2KCOMN`

## 8. Alerts (7)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| HUNG_BILL | Pos | WARNING | طباعة الفواتير |
| ALT_CHK_DATA | Pos | WARNING | OK |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_POS_FNL_DATA_ALL | 30 |
| IAS_POS_BILL_MST | 26 |
| IAS_DEPOSIT_CURRENCY_MST | 24 |
| POS_WRK_SHFT_CSHR | 14 |
| IAS_POS_PAY_CASH | 10 |
| USER_R | 9 |
| IAS_POS_HST_BILL_MST | 7 |
| IAS_CURRENCY_VALUE | 5 |
| IAS_POS_PAY_BILLS | 5 |
| IAS_CR_CARD_TYPES | 5 |
| EX_RATE | 4 |
| S_BRN_USR_PRIV | 3 |
| IAS_SHW_DOC_PRIV | 3 |
| POS_BILL_MST_ALL_VW | 3 |
| POS_GNR_RCPTS | 3 |
| POS_GNR_EXPNS | 3 |
| CASH_AT_BANK | 3 |
| IAS_POS_RT_BILL_MST | 2 |
| IAS_POS_HST_RT_BILL_MST | 2 |
| TIME | 2 |
| IAS_DEPOSIT_CURRENCY_DTL | 2 |
| CREDIT_CARD_TYPES | 2 |
| IAS_PARA_GEN | 1 |
| PRIVILEGE_FIXED | 1 |
| IAS_PARA_POS | 1 |
| POS_DFLT_STNG_DTL | 1 |
| POS_DFLT_STNG_MST | 1 |
| S_FLAGS_PRIV | 1 |
| PRIVILEGE | 1 |
| GLS_CRNCY_USR_LMT | 1 |


_(+4 جدول/view آخر — انظر `_raw/POST013_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `WRK_SHFT_PKG`, `YS_GEN_PKG`, `IAS_CHECK_SYS_PKG`, `YS_SCR_PKG`, `IAS_BRN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT A_CY,CUR_VALUE FROM IAS_CURRENCY_VALUE WHERE A_CY
SELECT 1 FROM IAS_DEPOSIT_CURRENCY_MST WHERE DOC_NO = :b1 AND BRN_NO = :b2 AND ROWNUM <= 1"SELECT NVL(MAX(DOC_NO),0) + 1 FROM IAS_DEPOSIT_CURRENCY_MST WHERE BRN_NO
SELECT 1 FROM IAS_DEPOSIT_CURRENCY_MST WHERE NVL(DOC_SER,0) != NVL(:b1,0) AND CASHIER_NO = :b2 AND TO_DATE(T_DATE || '' '' || T_TIME ,''DD/MM/RRRR HH24:MI:SS'') > TO_DATE(:b3 || '' '' || :b4 ,''DD/MM/RRRR HH24:MI:SS'') AND ROWNUM <= 1"SELECT 1 FROM IAS_DEPOSIT_CURRENCY_MST WHERE NVL
UPDATE POS_WRK_SHFT_CSHR SET CLS_DATE='''',CLS_TIME='''',CLS_FLG=0 WHERE CSHR_NO = :b1 AND SHFT_SRL = :b2" ENA_DIS_ITM_PRC STANDARD /LPOSLIB GEN_PKG FORMS40 FORMS4C "PKG INIT"ENA_DIS_ITM_PRC"P_TYP"" ENA_DIS_ITM_PRC Ias_Deposit_C
Select U_Id||'-'||Decode( ,1,Nvl(U_A_Name,U_E_Name), Nvl(U_E_Name,U_A_Name))U_Name,To_Char(U_Id) U_Id From User_R Usr
SELECT U_ID FROM USER_R
Select 1 From S_Brn_Usr_Priv Where U_Id = And S_Brn_Usr_Priv.Brn_No = Ias_Deposit_Currency_Mst.Brn_No And Nvl(Add_Flag,1) = 1 And Rownum <=1 ) And Exists(Select 1 From Ias_Shw_Doc_Priv
SELECT 1 FROM IAS_SHW_DOC_PRIV
SELECT IAS_GEN_PKG.GET_CURDATE FROM DUAL
SELECT USER_VIEW_DOC_ENTR FROM PRIVILEGE_FIXED WHERE U_ID
SELECT USE_WRK_SHFT FROM IAS_PARA_POS
SELECT STNG_MCHN_VAL FROM POS_DFLT_STNG_DTL WHERE STNG_NO
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST013_strings.txt`.
