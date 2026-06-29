# POSR004 — توثيق شاشة Onyx Pro POS

> النوع: **POSR** — تقارير (Reports)  
> الحجم: 511,496 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSR004.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تقارير (Reports)**. أكثر الجداول استخداماً: `POS_WRK_SHFT_CSHR`, `S_BRN_USR_PRIV`, `USER_R`, `IAS_POS_PRIV_MACHINE`, `S_RPRT_USR_TMPLT_MST`, `S_RPRT_USR_TMPLT_DTL`.

## 2. Data Blocks (12)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| BAR | ctrl | -IU | AUTOMATIC |  |
| HDR | ctrl | -IU | AUTOMATIC |  |
| PARAMTRS | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| BLK_SND | ctrl | QIU | AUTOMATIC |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| LOV_MST_SLCT | ctrl | QIU | DELAYED |  |
| LOV_DTL_SLCT | DB | QIU | DELAYED |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (10) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_SND_MAIN | CONTENT | 352×237 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| HDR | STACKED | 1024×35 | visible |
| MAIN | CONTENT | 1024×510 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| CNV_SND | TAB | ?×? | visible |
| CNV_LOV_SLCT | CONTENT | 2014×354 | visible |
| FTR | STACKED | 1024×18 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (7)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_LOV |  | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | خيارات الطباعة | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_SND | Send Options | DIALOG | false |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_LOV_SLCT |  | DIALOG | true |

## 5. Triggers (32)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`, `WHEN-WINDOW-RESIZED`


**مخصّصة (custom):** `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `WHENWINDOWDEACTIVATED`

## 6. Program Units (9)


**Procedures/Functions (9):** `CLEAR_PROC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `PRINT_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `GET_DATE_WRK_SHFT`, `GET_SLCT_DATA`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`

## 8. Alerts (4)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| CNFRRP | ادارة نقاط البيع | STOP | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| POS_WRK_SHFT_CSHR | 11 |
| S_BRN_USR_PRIV | 4 |
| USER_R | 4 |
| IAS_POS_PRIV_MACHINE | 4 |
| S_RPRT_USR_TMPLT_MST | 4 |
| S_RPRT_USR_TMPLT_DTL | 3 |
| IAS_POS_BILL_MST | 2 |
| S_LOV_SLCT | 2 |
| IAS_PARA_POS | 1 |
| PRIVILEGE_FIXED | 1 |
| S_BRN | 1 |
| IAS_POS_MACHINE | 1 |
| IAS_DEPOSIT_CURRENCY_MST | 1 |
| WAREHOUSE_DETAILS | 1 |
| PRIVILEGE_WH | 1 |
| POS_WRK_SHFT | 1 |
| TIME | 1 |
| MACHINE | 1 |
| USER | 1 |
| WAREHOUSE | 1 |
| IAS_POS_RT_BILL_MST | 1 |
| DOC | 1 |
| ALL_DIRECTORIES | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_USR_PKG`, `YS_LOV_SLCT_PKG`, `IAS_SMS_MAIL_PKG`, `LOV_PKG`, `YS_GEN_PKG`, `POS_WRK_SHFT_PKG`, `IAS_FETCH_DATA_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT PRD_BACK_HOUR,USE_PAY_CASH_RT_BILLS,ALLOW_CHANGE_BILL_CURR,USE_VAT,DPST_TYP,USE_PAID,USE_WRK_SHFT FROM IAS_PARA_POS,IAS_PARA_GEN
SELECT NVL(SHOW_AR_REP_DAY,0) FROM PRIVILEGE_FIXED WHERE U_ID
SELECT COUNT(BILL_NO) FROM IAS_POS_BILL_MST WHERE NVL
DELETE FROM S_LOV_SLCT WHERE LOV_NO IN ( 703,704 ) AND LOV_NM = ''LOV_POS_WRK_SHFT_CSHR''"INSERT INTO S_LOV_SLCT ( LOV_NO,LOV_NM,LOV_LBL_NO,LOV_SQL,LOV_COL_CNT,LOV_COL_LBL,LOV_CO
SELECT SHFT_SRL,SHFT_NO,SHFT_CODE,CSHR_NO, Ias_Usr_Pkg.Get_Usr_Nm(CSHR_NO,:PARAMETER.LANG_DFLT ) CSHR_Name,OPN_DATE,CLS_DATE FROM POS_WRK_SHFT_CSHR WHERE 1
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
Select Brn_No, Decode(:Parameter.Lang_no,1,Nvl(Brn_Lname,Brn_Fname),Nvl(Brn_Fname,Brn_Lname)) Brn_name From S_Brn
select 1 From S_Brn_Usr_Priv Where U_Id = :Parameter.User_No And S_Brn_Usr_Priv.Brn_No = S_Brn.Brn_No And Nvl(View_Flag,1) = 1 And RowNum <=1 )) Order By Cmp_No , Brn_No Select u_id,Decode(:Parameter.Lang_no,1,U_a_Name,nvl(U_e_Name,U_a_Name)) U_name From User_r Order by U_id
Select machine_no, terminal From ias_pos_machine
Select 1 From IAS_POS_PRIV_MACHINE Where MACHINE_NO = ias_pos_machine.MACHINE_NO And USED = 1 And U_Id=:Parameter.User_No And Rownum <= 1) Order By ias_pos_machine.machine_no MACHINE_NO TERMINAL RG_USER_NO Select u_id, Nvl(u_a_name,u_e_name) u_name From user_r
Select Doc_No , Doc_Date , Ias_Usr_Pkg.Get_Usr_Nm(Cashier_No, :Parameter.Lang_No ) Cashier_Name , Doc_Desc , Brn_No , Doc_Ser From Ias_Deposit_Currency_Mst
Select warehouse_details.w_code, Decode(:Parameter.Lang_No,1,w_name,nvl(w_e_name,w_name)) w_name from warehouse_details
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSR004_strings.txt`.
