# POSR011 — توثيق شاشة Onyx Pro POS

> النوع: **POSR** — تقارير (Reports)  
> الحجم: 307,568 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSR011.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تقارير (Reports)**. أكثر الجداول استخداماً: `USER_R`, `S_RPRT_USR_TMPLT_MST`, `S_BRN_USR_PRIV`, `IAS_POS_MACHINE`, `S_RPRT_USR_TMPLT_DTL`, `S_BRN`.

## 2. Data Blocks (9)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| BAR | ctrl | -IU | AUTOMATIC |  |
| HDR | ctrl | -IU | AUTOMATIC |  |
| PARAMTRS | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| HDR | STACKED | 1024×35 | visible |
| MAIN | CONTENT | 1024×510 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| FTR | STACKED | 1024×18 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_LOV |  | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | خيارات الطباعة | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (31)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `PRE-FORM`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`, `WHEN-WINDOW-RESIZED`


**مخصّصة (custom):** `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `WHENWINDOWDEACTIVATED`

## 6. Program Units (7)


**Procedures/Functions (7):** `CLEAR_PROC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `PRINT_PROC`, `LIST_LOV`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KWUTIL`, `D2KCOMN`

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
| USER_R | 4 |
| S_RPRT_USR_TMPLT_MST | 4 |
| S_BRN_USR_PRIV | 3 |
| IAS_POS_MACHINE | 3 |
| S_RPRT_USR_TMPLT_DTL | 3 |
| S_BRN | 2 |
| IAS_PARA_POS | 1 |
| IAS_INV_RT_BILL_MST | 1 |
| WAREHOUSE_DETAILS | 1 |
| PRIVILEGE_WH | 1 |
| IAS_ITM_MST | 1 |
| PRIVILEGE_GC | 1 |
| GROUP_DETAILS | 1 |
| IAS_MAINSUB_GRP_DTL | 1 |
| IAS_SUB_GRP_DTL | 1 |
| IAS_ALTERNATIVE_GROUP | 1 |
| IAS_ASSISTANT_GROUP | 1 |
| IAS_DETAIL_GROUP | 1 |
| TIME | 1 |
| MACHINE | 1 |
| USER | 1 |
| WAREHOUSE | 1 |
| DOC | 1 |
| ITEM | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `LOV_PKG`, `IAS_USR_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`, `IAS_FETCH_DATA_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT PRD_BACK_HOUR,USE_PAY_CASH_RT_BILLS FROM IAS_PARA_POS
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
Select Brn_No, Decode(:Parameter.Lang_no,1,Nvl(Brn_Lname,Brn_Fname),Nvl(Brn_Fname,Brn_Lname)) Brn_name From S_Brn
select 1 From S_Brn_Usr_Priv Where U_Id = :Parameter.User_No And S_Brn_Usr_Priv.Brn_No = S_Brn.Brn_No And Nvl(View_Flag,1) = 1 And RowNum <=1 )) Order By Cmp_No , Brn_No BRN_NO BRN_NAME RG_USER Select u_id,Decode(:Parameter.Lang_no,1,U_a_Name,nvl(U_e_Name,U_a_Name)) U_name From User_r Order by U_id
SELECT MIN(MACHINE_NO) FROM IAS_POS_MACHINE
SELECT MAX(MACHINE_NO) FROM IAS_POS_MACHINE
Select machine_no, terminal From ias_pos_machine
Select u_id, Nvl(u_a_name,u_e_name) u_name From user_r
Select Doc_No , TO_DATE(Doc_Date,'DD/MM/YYYY') DOC_DATE , Ias_Usr_Pkg.Get_Usr_Nm(Cashier_No, :Parameter.Lang_No ) Cashier_Name , Doc_Desc , Brn_No , Doc_Ser From IAS_INV_RT_BILL_MST
Select warehouse_details.w_code, Decode(:Parameter.Lang_No,1,w_name,nvl(w_e_name,w_name)) w_name from warehouse_details
select 1 from PRIVILEGE_WH where u_id=:Parameter.user_no and w_code=warehouse_details.w_code and add_flag=1) order by warehouse_details.w_code W_CODE W_NAME RG_I_CODE Select I_Code,Decode(:Parameter.Lang_No,1,nvl(I_name,I_e_name),nvl(I_e_name,I_name) )I_name,I_desc from iAS_ITM_MST where
select 1 from privilege_gc where u_id=:Parameter.User_no and g_code=IAS_ITM_MST.g_code and add_flag=1) order by i_code I_CODE I_NAME I_DESC RG_G_CODE select g_code,Decode(:Parameter.Lang_no,1,nvl(g_a_name,g_e_name),nvl(g_e_name,g_a_name)) g_name from GROUP_DETAILS
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSR011_strings.txt`.
