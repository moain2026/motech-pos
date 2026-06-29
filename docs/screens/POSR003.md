# POSR003 — توثيق شاشة Onyx Pro POS

> النوع: **POSR** — تقارير (Reports)  
> الحجم: 291,504 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSR003.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تقارير (Reports)**. أكثر الجداول استخداماً: `S_RPRT_USR_TMPLT_MST`, `USER_R`, `S_RPRT_USR_TMPLT_DTL`, `PRIVILEGE_WH`, `S_BRN`, `S_BRN_USR_PRIV`.

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

## 5. Triggers (32)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`, `WHEN-WINDOW-RESIZED`


**مخصّصة (custom):** `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `WHENWINDOWDEACTIVATED`

## 6. Program Units (8)


**Procedures/Functions (8):** `CLEAR_PROC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `PRINT_PROC`, `LIST_LOV`, `WHEN_NEW_FORM_INSTANCE_PRC`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KWUTIL`, `D2KCOMN`

## 8. Alerts (3)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| S_RPRT_USR_TMPLT_MST | 4 |
| USER_R | 3 |
| S_RPRT_USR_TMPLT_DTL | 3 |
| PRIVILEGE_WH | 2 |
| S_BRN | 1 |
| S_BRN_USR_PRIV | 1 |
| WAREHOUSE_DETAILS | 1 |
| IAS_POS_MACHINE | 1 |
| IAS_POS_PRIV_MACHINE | 1 |
| IAS_ITM_MST | 1 |
| PRIVILEGE_GC | 1 |
| GROUP_DETAILS | 1 |
| IAS_MAINSUB_GRP_DTL | 1 |
| IAS_SUB_GRP_DTL | 1 |
| IAS_ALTERNATIVE_GROUP | 1 |
| IAS_ASSISTANT_GROUP | 1 |
| IAS_DETAIL_GROUP | 1 |
| W_CODE | 1 |
| ITEM | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_ITM_PKG`, `LOV_PKG`, `IAS_USR_PKG`, `GEN_RPRT_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`, `IAS_FETCH_DATA_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
Select Brn_No, Decode(:Parameter.Lang_no,1,Nvl(Brn_Lname,Brn_Fname),Nvl(Brn_Fname,Brn_Lname)) Brn_name From S_Brn
select 1 From S_Brn_Usr_Priv Where U_Id = :Parameter.User_No And S_Brn_Usr_Priv.Brn_No = S_Brn.Brn_No And Nvl(View_Flag,1) = 1 And RowNum <=1 )) Order By Cmp_No , Brn_No BRN_NAME RG_USER Select u_id,Decode(:Parameter.Lang_no,1,U_a_Name,nvl(U_e_Name,U_a_Name)) U_name From User_r Order by U_id
Select warehouse_details.w_code, Decode(:Parameter.Lang_No,1,Nvl(w_name,w_e_name),Nvl(w_e_name,w_name)) w_name from warehouse_details
select 1 from PRIVILEGE_WH where u_id=:Parameter.user_no and w_code=warehouse_details.w_code and add_flag=1 and RowNum<=1) order by warehouse_details.w_code W_CODE W_NAME RG_MACHINES Select machine_no, terminal From ias_pos_machine
Select 1 From IAS_POS_PRIV_MACHINE Where MACHINE_NO = ias_pos_machine.MACHINE_NO And USED = 1 And U_Id=:Parameter.User_No And Rownum <= 1) Order By ias_pos_machine.machine_no MACHINE_NO TERMINAL RG_I_CODE Select I_Code,Decode(:Parameter.Lang_No,1,nvl(I_name,I_e_name),nvl(I_e_name,I_name) )I_name,I_desc from iAS_ITM_MST where
select 1 from privilege_gc where u_id=:Parameter.User_no and g_code=IAS_ITM_MST.g_code and add_flag=1) order by i_code I_CODE I_NAME I_DESC RG_G_CODE select g_code,Decode(:Parameter.Lang_no,1,nvl(g_a_name,g_e_name),nvl(g_e_name,g_a_name)) g_name from GROUP_DETAILS
Select MNG_Code,G_Code , Decode(:Parameter.lang_no,1,Nvl(mng_a_name,mng_e_name) ,Nvl(mng_e_name,mng_a_name)) Mng_Name From Ias_mainsub_grp_dtl
Select Subg_Code,Mng_Code, Decode(:Parameter.lang_no,1,Nvl(Subg_a_name,Subg_e_name) ,Nvl(Subg_e_name,Subg_a_name)) Subg_Name From Ias_sub_grp_dtl
Select Group_NO, Decode(:Parameter.lang_no,1,Nvl(Group_a_name,Group_e_name) ,Nvl(Group_e_name,Group_a_name)) G_Name From IAS_ALTERNATIVE_GROUP
Select Assistant_No, Decode(:Parameter.lang_no,1,Nvl(Assistant_A_Name,Assistant_E_Name) ,Nvl(Assistant_E_Name,Assistant_A_Name)) G_Name From Ias_Assistant_Group
Select Detail_No, Decode(:Parameter.lang_no,1,Nvl(Detail_A_Name,Detail_E_Name) ,Nvl(Detail_E_Name,Detail_A_Name)) G_Name From Ias_Detail_Group
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSR003_strings.txt`.
