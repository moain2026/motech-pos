# POSR001 — توثيق شاشة Onyx Pro POS

> النوع: **POSR** — تقارير (Reports)  
> الحجم: 593,064 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSR001.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تقارير (Reports)**. أكثر الجداول استخداماً: `POS_WRK_SHFT_CSHR`, `S_BRN_USR_PRIV`, `IAS_CASH_CUSTMR`, `IAS_PRIV_CUSTOMER`, `IAS_POS_PAY_BILLS`, `USER_R`.

## 2. Data Blocks (11)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| BAR | ctrl | -IU | AUTOMATIC |  |
| HDR | ctrl | -IU | AUTOMATIC |  |
| PARAMTRS | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 |
| LOV_MST_SLCT | ctrl | QIU | DELAYED |  |
| LOV_DTL_SLCT | DB | QIU | DELAYED |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| HDR | STACKED | 1024×35 | visible |
| MAIN | CONTENT | 1024×510 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| CNV_LOV_SLCT | CONTENT | 2014×354 | visible |
| FTR | STACKED | 1024×18 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (6)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_LOV |  | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | خيارات الطباعة | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_LOV_SLCT |  | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (32)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`, `WHEN-WINDOW-RESIZED`


**مخصّصة (custom):** `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `WHENWINDOWDEACTIVATED`

## 6. Program Units (10)


**Procedures/Functions (10):** `CLEAR_PROC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `PRINT_PROC`, `CHECK_DB_BRANCH`, `WHEN_NEW_FORM_INSTANCE_PRC`, `GET_SLCT_DATA`, `CHECK_CUSTMR_FNC`

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
| POS_WRK_SHFT_CSHR | 11 |
| S_BRN_USR_PRIV | 9 |
| IAS_CASH_CUSTMR | 8 |
| IAS_PRIV_CUSTOMER | 7 |
| IAS_POS_PAY_BILLS | 6 |
| USER_R | 4 |
| IAS_POS_PRIV_MACHINE | 4 |
| IAS_POS_PAY_CASH | 4 |
| S_RPRT_USR_TMPLT_MST | 4 |
| CUSTOMER | 3 |
| PRIV_ACC | 3 |
| ACCOUNT | 3 |
| BILL | 3 |
| S_RPRT_USR_TMPLT_DTL | 3 |
| S_FLAGS | 2 |
| IAS_POS_BILL_MST | 2 |
| IAS_POS_RT_BILL_MST | 2 |
| S_EMP | 2 |
| IAS_PRIV_AR | 2 |
| CARD | 2 |
| IAS_POINT_TYP_MST | 1 |
| IAS_PARA_AR | 1 |
| PRIVILEGE_FIXED | 1 |
| DBA_SNAPSHOTS | 1 |
| S_BRN | 1 |
| IAS_POS_MACHINE | 1 |
| WAREHOUSE_DETAILS | 1 |
| PRIVILEGE_WH | 1 |
| SALES_MAN | 1 |
| CREDIT_CARD_TYPES | 1 |


_(+21 جدول/view آخر — انظر `_raw/POSR001_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `YS_LOV_SLCT_PKG`, `IAS_USR_PKG`, `LOV_PKG`, `IAS_CHECK_SYS_PKG`, `IAS_FETCH_DATA_PKG`, `GEN_RPRT_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select Point_Typ_No||' - '||Decode( ,1,nvl(Typ_l_Nm ,Typ_F_Nm ),nvl(Typ_F_Nm ,Typ_l_Nm )), to_char(Point_Typ_No) From Ias_Point_Typ_Mst
Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
SELECT CUST_D_TYPE,AR_AC_LINK_TYPE,USE_DISC_CARD,NVL(USE_PAY_CASH_RT_BILLS,0),USE_PAID,AR_EMP_TYPE,NUM_OF_DAYS_SHW_BILLS FROM IAS_PARA_AR,IAS_PARA_POS
SELECT NVL(SHOW_AR_REP_DAY,0) FROM PRIVILEGE_FIXED WHERE U_ID
SELECT 1 FROM CUSTOMER WHERE C_CODE = :b1 AND ROWNUM <= 1"SELECT 1 FROM IAS_PRIV_CUSTOMER WHERE U_ID
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
Select Brn_No, Decode(:Parameter.Lang_no,1,Nvl(Brn_Lname,Brn_Fname),Nvl(Brn_Fname,Brn_Lname)) Brn_name From S_Brn
select 1 From S_Brn_Usr_Priv Where U_Id = :Parameter.User_No And S_Brn_Usr_Priv.Brn_No = S_Brn.Brn_No And Nvl(View_Flag,1) = 1 And RowNum <=1 )) Order By Cmp_No , Brn_No BRN_NO BRN_NAME RG_USER Select u_id,Decode(:Parameter.Lang_no,1,U_a_Name,nvl(U_e_Name,U_a_Name)) U_name From User_r Order by U_id
Select machine_no, terminal ,brn_machine_no From ias_pos_machine
Select u_id, Nvl(u_a_name,u_e_name) u_name From user_r
Select bill_no, bill_date, bill_time, flg_desc bill_type, a_cy, bill_amt, disc_amt From ias_pos_bill_mst ,s_flags
Select rt_bill_no, rt_bill_date, rt_bill_time, flg_desc rt_bill_type, a_cy, rt_bill_amt, disc_amt From ias_pos_rt_bill_mst ,s_flags
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSR001_strings.txt`.
