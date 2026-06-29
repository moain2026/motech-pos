# POSR007 — توثيق شاشة Onyx Pro POS

> النوع: **POSR** — تقارير (Reports)  
> الحجم: 349,372 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSR007.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تقارير (Reports)**. أكثر الجداول استخداماً: `S_BRN_USR_PRIV`, `IAS_POS_PRIV_MACHINE`, `S_EMP_PRV`, `IAS_ITEMS_ACTIVITY`, `USER_R`, `S_RPRT_USR_TMPLT_MST`.

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

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| HDR | STACKED | 1024×35 | visible |
| MAIN | CONTENT | 1024×510 | visible |
| MAIN1 | TAB | ?×? | visible |
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

## 6. Program Units (10)


**Procedures/Functions (10):** `CLEAR_PROC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `PRINT_PROC`, `CHECK_DB_BRANCH`, `DYNAMIC_RECORD_GROUP`, `LIST_LOV`, `WHEN_NEW_FORM_INSTANCE_PRC`

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
| S_BRN_USR_PRIV | 5 |
| IAS_POS_PRIV_MACHINE | 5 |
| S_EMP_PRV | 5 |
| IAS_ITEMS_ACTIVITY | 4 |
| USER_R | 4 |
| S_RPRT_USR_TMPLT_MST | 4 |
| IAS_ITEMS_ACTIVITY_PRIV | 3 |
| S_RPRT_USR_TMPLT_DTL | 3 |
| IAS_ITM_MST | 2 |
| S_EMP | 2 |
| ITEM_TYPES | 1 |
| IAS_PARA_INV | 1 |
| DBA_SNAPSHOTS | 1 |
| S_BRN | 1 |
| IAS_POS_MACHINE | 1 |
| IAS_POS_BILL_MST | 1 |
| IAS_POS_RT_BILL_MST | 1 |
| PRIVILEGE_GC | 1 |
| GROUP_DETAILS | 1 |
| IAS_MAINSUB_GRP_DTL | 1 |
| IAS_SUB_GRP_DTL | 1 |
| IAS_ALTERNATIVE_GROUP | 1 |
| IAS_ASSISTANT_GROUP | 1 |
| IAS_DETAIL_GROUP | 1 |
| ACTIVE | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `YS_GEN_PKG`, `IAS_GEN_PKG`, `LOV_PKG`, `IAS_USR_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`, `IAS_FETCH_DATA_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select to_char(TYPE_OF_ITEM)||'-'|| Decode(:parameter.lang_no,1,Nvl(IT_A_NAME,IT_E_NAME),Nvl(IT_E_NAME,IT_A_NAME)) Name , to_char(TYPE_OF_ITEM) From ITEM_TYPES
Select Activity_No||'-'|| Decode( ,1,Nvl(Activity_A_Name,Activity_E_Name),Nvl(Activity_E_Name,Activity_A_Name)) ,To_Char(Activity_No) From Ias_Items_Activity
SELECT NVL(CONN_ITM_ACT_BY_USR_PRIV,0) FROM IAS_PARA_INV
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
Select Brn_No, Decode(:Parameter.Lang_no,1,Nvl(Brn_Lname,Brn_Fname),Nvl(Brn_Fname,Brn_Lname)) Brn_name From S_Brn
select 1 From S_Brn_Usr_Priv Where U_Id = :Parameter.User_No And S_Brn_Usr_Priv.Brn_No = S_Brn.Brn_No And Nvl(View_Flag,1) = 1 And RowNum <=1 )) Order By Cmp_No , Brn_No BRN_NO BRN_NAME RG_USER Select u_id,Decode(:Parameter.Lang_no,1,U_a_Name,nvl(U_e_Name,U_a_Name)) U_name From User_r Order by U_id
Select machine_no, terminal ,brn_machine_no From ias_pos_machine
Select 1 From IAS_POS_PRIV_MACHINE Where MACHINE_NO = ias_pos_machine.MACHINE_NO And USED = 1 And U_Id=:Parameter.User_No And Rownum <= 1) Order By ias_pos_machine.machine_no MACHINE_NO TERMINAL BRN_MACHINE_NO RG_USER_NO Select u_id, Nvl(u_a_name,u_e_name) u_name From user_r
Select bill_no, bill_date, bill_time, flg_desc bill_type, a_cy, bill_amt, disc_amt From ias_pos_bill_mst ,s_flags
Select rt_bill_no, rt_bill_date, rt_bill_time, flg_desc rt_bill_type, a_cy, rt_bill_amt, disc_amt From ias_pos_rt_bill_mst ,s_flags
Select I_Code,Decode(:Parameter.Lang_No,1,nvl(I_name,I_e_name),nvl(I_e_name,I_name) )I_name,I_desc from ias_itm_mst where
select 1 from privilege_gc where u_id=:Parameter.User_no and g_code=ias_itm_mst.g_code and add_flag=1) order by i_code I_CODE I_NAME I_DESC RG_G_CODE select GROUP_DETAILS.g_code,Decode(:Parameter.Lang_no,1,nvl(g_a_name,g_e_name),nvl(g_e_name,g_a_name)) g_name from GROUP_DETAILS
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSR007_strings.txt`.
