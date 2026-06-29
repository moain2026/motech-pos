# POST022 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 363,328 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST022.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> جرد أصناف مردود المبيعات 
>  نظام نقاط البيع > عمليات النظام > 
>  جرد أصناف مردود المبيعات 
>  الاستخدام: 
>  تستخدم 
> الشاشة لغرض جرد الأصناف المردودة على مستوى المستخدم لمطابقة الكمية المردودة 
> فعلاً مع الكمية المردودة في النظام، مثلها مثل جرد المخزون مع اختلاف مقارنة 
> الكميات فإنه يتم المقارنة مع المردودات وليس الكميات المتوفرة وبالتالي يمكن 
> استعراض تقارير الزيادة والنقص في الكميات. 
>  طريقة استخدام الشاشة 
>  أولاً: البيانات الرئيسية 
>  - 
>  رقم 
> الفرع: 
>  يظهر 
> رقم الفرع الذي دخل عليه 
> المستخدم وهو الفرع الذي سيتم فيه إدخال عملية جرد أصناف المردود مع إمكانية اختيار 
> فرع آخر إذا كان صلاحية بذلك. 
>  - 
>  رقم 
> المستند: 
>  يظهر 
> الرقم التسلسلي للعميلة. 
>  - 
>  تاريخ 
> الجرد: 
>  في 
> هذا الحقل يظهر 
> آلياً تاريخ المستند مع إمكانية تغييره. 
>  - 
>  الوقت: 
>  في 
> هذا الحقل يعرض النظام وقت العملية (وقت الإدخال) ولا يمكن تغييره. 
>  - 
>  رقم 
> الآلة: 
>  يتم 
> تحديد نقطة 
> البيع (الآلة) التي سيتم جرد مردودات المبيعات التي تمت فيها، وتظهر رسالة تنبيه 
> مفادها (يوجد جرد سابق بنفس هذا اليوم) إذا تم إضافة جرد لنفس الآلة في نفس 
> التاريخ. 
>  - 
>  المستخدم: 
>  يتم 
> اختيار المستخدم (الكاشير) الذي سيتم جرد مردودات المبيعات التي تمت بواسطته، وتظهر 
> رسالة تنبيه مفادها (هذا المستخدم ليس له مردودات لهذا اليوم) إذا لم يكن للمستخدم 
> أي مردودات مبيعات في التاريخ المدخل في البيانات الرئيسية. 
>  - 
>  رقم 
> المرجع: 
>  يتم 
> تدوين رقم مرجع للعملية. 
>  - 
>  رقم 
> المخزن: 
>  يتم 
> تحديد المخزن 
> الذي سيتم جرد مردودات المبيعات التي تمت فيه. 
>  - 
>  البيان: 
>  يتم 
> تدوين بيان توضيحي 
> للعملية. 
>  ثانيًا: 
> البيانات التفصيلية 
>  - 
>  رقم/ 
> اسم الصنف/ الوحدة: 
>  يتم 
> إدخال الأصناف 
> التي تم جردها يدوياً أو باستخدام باركود الصنف. 
>  - 
>  تاريخ 
> الانتهاء/ رقم الدفعة: 
>  يعرض 
> النظام بيانات 
> هذه الحقول آلياً إذا كان الصنف يستخدم ذلك. 
>  - 
>  كمية 
> الجرد: 
>  في 
> هذا الحقل يتم إدخال 
> كمية الجرد من الصنف التي تم جردها فعلاً. 
>  - 
>  البيان: 
>  يتم 
> تدوين بيان توضيحي على م

## 2. Data Blocks (12)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_INV_RT_BILL_MST | DB | QIU | DELAYED | ORDER:DOC_DATE desc,doc_no |
| IAS_INV_RT_BILL_DTL | DB | QIU | DELAYED |  |
| SRCH_DTL | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| DMY_SHW_RCRD | ctrl | Q-- | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (11) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_SRCH_MST_DTL | STACKED | 450×40 | hidden |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | STACKED | 613×249 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_SRCH_DTL | STACKED | 450×40 | hidden |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_SHW_RCRD | CONTENT | 300×398 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (9)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN2 | Inv Weight System | DIALOG | true |
| WIN3 | Item Search | DIALOG | true |
| WIN6 | Advance Options | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_SHW_RCRD |  | DIALOG | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (34)


**Procedures/Functions (34):** `WHEN_TAB_PAGE_CHANGED_PRC`, `KEY_LISTVAL_PRC`, `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `GET_SERIAL`, `INSTALL_RT_BILL`, `CHEK_DUPLICATE_DOC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `CALL_SCR_LNK_PRC`

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
| IAS_ITM_MST | 10 |
| IAS_INV_RT_BILL_MST | 5 |
| S_BRN_USR_PRIV | 4 |
| USER_R | 4 |
| PRIVILEGE_GC | 4 |
| IAS_SHW_DOC_PRIV | 3 |
| EX_RATE | 3 |
| IAS_POS_MACHINE | 2 |
| IAS_POS_RT_BILL_MST | 2 |
| IAS_POS_HST_RT_BILL_MST | 2 |
| S_BRN | 1 |
| IAS_POS_PRIV_MACHINE | 1 |
| IAS_PARA_AR | 1 |
| PRIVILEGE_FIXED | 1 |
| WAREHOUSE_DETAILS | 1 |
| PRIVILEGE_WH | 1 |
| USER | 1 |
| IAS_INV_RT_BILL_DTL | 1 |
| IAS_ITM_UNT_BARCODE | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_ITM_PKG`, `DATE_CNVRTR_PKG`, `SRCH_DTL_PKG`, `IAS_USR_PKG`, `YS_SCR_PKG`, `IAS_WCODE_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select Brn_no||'-'||Decode( ,1,Nvl(BRN_LNAME,BRN_FNAME), Nvl(BRN_FNAME,BRN_LNAME))BRN_NAME,To_Char(Brn_no) Brn_no From S_Brn
Select MACHINE_NO||'-'||TERMINAL, To_Char(MACHINE_NO) MACHINE_NO From IAS_POS_MACHINE
Select U_Id||'-'||Decode( ,1,Nvl(U_A_Name,U_E_Name), Nvl(U_E_Name,U_A_Name))U_Name,To_Char(U_Id) U_Id From User_R
Select 1 From S_Brn_Usr_Priv Where U_Id = And S_Brn_Usr_Priv.Brn_No = IAS_INV_RT_BILL_MST.Brn_No And Nvl(Add_Flag,1) = 1 And Rownum <=1 ) And Exists(Select 1 From Ias_Shw_Doc_Priv
SELECT 1 FROM IAS_SHW_DOC_PRIV
SELECT USER_VIEW_DOC_ENTR FROM PRIVILEGE_FIXED WHERE U_ID
SELECT CUR_CODE FROM EX_RATE WHERE L_F
SELECT CUR_CODE FROM EX_RATE WHERE STOCK_CUR
SELECT NVL(MAX(DOC_NO),0) + 1 FROM IAS_INV_RT_BILL_MST WHERE BRN_NO
Select Doc_no, doc_date, DOC_DESC, MACHINE_NO, Brn_No, Decode(PROCESSED,1,Ias_Gen_Pkg.Get_Prompt(:Parameter.Lang_No,897)) processed , doc_Ser from IAS_INV_RT_BILL_MST
Select 1 From S_Brn_Usr_Priv Where U_Id = :Parameter.User_No And S_Brn_Usr_Priv.Brn_No = IAS_INV_RT_BILL_MST.Brn_No And Nvl(Add_Flag,1) = 1 And Rownum <=1 )) And 1 = (Case When :Parameter.User_View_Doc_Entr=0 Then 1 Else (Select 1 From Ias_Shw_Doc_Priv
select w_code,decode(:Parameter.lang_no,1,nvl(w_name,w_e_name),nvl(w_e_name,w_name)) w_name from warehouse_details
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST022_strings.txt`.
