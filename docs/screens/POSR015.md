# POSR015 — توثيق شاشة Onyx Pro POS

> النوع: **POSR** — تقارير (Reports)  
> الحجم: 303,028 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSR015.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تقارير (Reports)**. أكثر الجداول استخداماً: `S_BRN_USR_PRIV`, `SALES_ORDER`, `S_RPRT_USR_TMPLT_MST`, `USER_R`, `S_RPRT_USR_TMPLT_DTL`, `S_FLAGS`.

## 2. Data Blocks (9)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| BAR | ctrl | -IU | AUTOMATIC |  |
| HDR | ctrl | -IU | AUTOMATIC |  |
| PARAMTRS | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_LOV | STACKED | 2000×364 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| HDR | STACKED | 1024×35 | visible |
| MAIN | CONTENT | 1024×510 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 1024×18 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_LOV |  | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | خيارات الطباعة | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (32)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`, `WHEN-WINDOW-RESIZED`


**مخصّصة (custom):** `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `WHENWINDOWDEACTIVATED`

## 6. Program Units (7)


**Procedures/Functions (7):** `CLEAR_PROC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `PRINT_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`

## 8. Alerts (3)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| S_BRN_USR_PRIV | 5 |
| SALES_ORDER | 4 |
| S_RPRT_USR_TMPLT_MST | 4 |
| USER_R | 3 |
| S_RPRT_USR_TMPLT_DTL | 3 |
| S_FLAGS | 2 |
| ACCOUNT | 2 |
| PRIV_ACC | 2 |
| S_FLAGS_PRIV | 1 |
| EX_RATE | 1 |
| IAS_PARA_AP | 1 |
| S_BRN | 1 |
| ACCOUNT_TYPES | 1 |
| GLS_ACCNT_DTL | 1 |
| GLS_ACCNT_DTL_PRIV | 1 |
| S_EMP | 1 |
| CUSTOMER | 1 |
| IAS_PRIV_CUSTOMER | 1 |
| IAS_POS_MACHINE | 1 |
| PRIV_CASH | 1 |
| INVOICE | 1 |
| TIME | 1 |
| CSH | 1 |
| MACHINE | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_CHECK_SYS_PKG`, `IAS_GEN_PKG`, `LOV_PKG`, `YS_GEN_PKG`, `IAS_USR_PKG`, `GEN_RPRT_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`, `IAS_FETCH_DATA_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
SELECT 1 FROM S_FLAGS_PRIV WHERE U_ID= AND FLG_CODE=S_FLAGS.FLG_CODE AND FLG_VALUE=S_FLAGS.FLG_VALUE AND PRIV_FLAG=1) Order By FLG_SR PARAMTRS.PYMNT_TYPE IAS_GEN_PKGYSPOS1GET_PROMPTI IAS_GEN_PKG Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
Select To_Char(CUR_NO)||' - '||CUR_CODE||' '||CUR_NAME,to_char(CUR_CODE) from EX_RATE order by CUR_NO
SELECT AP_AC_LINK_TYPE,AR_AC_LINK_TYPE FROM IAS_PARA_AP,IAS_PARA_POS,IAS_PARA_AR
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
SELECT R.ORDER_NO, R.ORDER_SER, R.ORDER_DATE, R.ORDER_TIME, R.CUST_CODE C_CODE,DECODE(:PARAMETER.LANG_NO,1,CUST_L_NM,NVL(CUST_F_NM,CUST_L_NM)) CSTMR_NM, R.PROCESED PRCSS_FLG,DECODE(SO_TYPE,1,' ',2,' ') SO_TYPE_NM,SO_TYPE FROM SALES_ORDER R,IAS_CASH_CUSTMR C
Select 1 From S_Brn_Usr_Priv
Select Brn_No, Decode(:Parameter.Lang_no,1,Nvl(Brn_Lname,Brn_Fname),Nvl(Brn_Fname,Brn_Lname)) Brn_name From S_Brn
select 1 From S_Brn_Usr_Priv Where U_Id = :Parameter.User_No And S_Brn_Usr_Priv.Brn_No = S_Brn.Brn_No And Nvl(View_Flag,1) = 1 And RowNum <=1 )) Order By Cmp_No , Brn_No BRN_NO BRN_NAME RG_USER Select u_id,Decode(:Parameter.Lang_no,1,U_a_Name,nvl(U_e_Name,U_a_Name)) U_name From User_r Order by U_id
Select A_Code, Decode(:Parameter.lang_dflt, 1, A_Name, Nvl(A_Name_Eng, A_Name)) A_Name, Decode(:Parameter.lang_dflt, 1, Group_Name, Group_E_Name) Group_Name From Account, Account_Grouping
Select Account_Type From Account_Types
Select 1 From Priv_Acc
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSR015_strings.txt`.
