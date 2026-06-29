# POSR002 — توثيق شاشة Onyx Pro POS

> النوع: **POSR** — تقارير (Reports)  
> الحجم: 611,416 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSR002.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تقارير (Reports)**. أكثر الجداول استخداماً: `IAS_CASH_CUSTMR`, `POS_WRK_SHFT_CSHR`, `S_BRN_USR_PRIV`, `IAS_PRIV_CUSTOMER`, `IAS_POS_PRIV_MACHINE`, `PRIVILEGE_WH`.

## 2. Data Blocks (12)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| BAR | ctrl | -IU | AUTOMATIC |  |
| HDR | ctrl | -IU | AUTOMATIC |  |
| PARAMTRS | ctrl | QIU | AUTOMATIC |  |
| ITEM_OPTION | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 |
| LOV_MST_SLCT | ctrl | QIU | DELAYED |  |
| LOV_DTL_SLCT | DB | QIU | DELAYED |  |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | IMMEDIATE |  |

## 3. Canvases (10) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| HDR | STACKED | 1024×35 | visible |
| MAIN | CONTENT | 1024×510 | visible |
| MAIN1 | TAB | ?×? | visible |
| MAIN2 | CONTENT | 511×185 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOV_SLCT | CONTENT | 2014×354 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| FTR | STACKED | 1024×18 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (7)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_LOV_SLCT |  | DIALOG | true |
| WIN_LOV |  | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN1 | Item Search | DIALOG | true |
| WIN_PRNT | خيارات الطباعة | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (32)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`, `WHEN-WINDOW-RESIZED`


**مخصّصة (custom):** `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `WHENWINDOWDEACTIVATED`

## 6. Program Units (13)


**Procedures/Functions (13):** `CLEAR_PROC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `PRINT_PROC`, `CHECK_DB_BRANCH`, `DYNAMIC_RECORD_GROUP`, `GET_COND`, `LIST_LOV`, `WHEN_NEW_FORM_INSTANCE_PRC`, `GET_SLCT_DATA`, `CHECK_CUSTMR_FNC`

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
| IAS_CASH_CUSTMR | 12 |
| POS_WRK_SHFT_CSHR | 11 |
| S_BRN_USR_PRIV | 7 |
| IAS_PRIV_CUSTOMER | 6 |
| IAS_POS_PRIV_MACHINE | 5 |
| PRIVILEGE_WH | 5 |
| IAS_ITEMS_ACTIVITY | 4 |
| USER_R | 4 |
| S_RPRT_USR_TMPLT_MST | 4 |
| IAS_ITEMS_ACTIVITY_PRIV | 3 |
| PRIVILEGE_GC | 3 |
| S_RPRT_USR_TMPLT_DTL | 3 |
| CUSTOMER | 2 |
| IAS_POS_RT_BILL_MST | 2 |
| IAS_V_VNDR_ITM | 2 |
| IAS_POS_BILL_MST | 2 |
| S_BRN | 2 |
| IAS_ITM_MST | 2 |
| IAS_PARA_INV | 1 |
| PRIVILEGE_FIXED | 1 |
| DBA_SNAPSHOTS | 1 |
| IAS_POINT_TYP_MST | 1 |
| S_FLAGS | 1 |
| ITEM_TYPES | 1 |
| IAS_POS_HST_RT_BILL_MST | 1 |
| IAS_POS_HST_BILL_MST | 1 |
| IAS_POS_MACHINE | 1 |
| GROUP_DETAILS | 1 |
| IAS_MAINSUB_GRP_DTL | 1 |
| IAS_SUB_GRP_DTL | 1 |


_(+22 جدول/view آخر — انظر `_raw/POSR002_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `YS_LOV_SLCT_PKG`, `LOV_PKG`, `IAS_USR_PKG`, `IAS_CHECK_SYS_PKG`, `IAS_FETCH_DATA_PKG`, `SETUP_PKG`, `IAS_DBS_SYS_PKG`, `IAS_PRMTR_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT COSTING_TYPE,WTAVG_TYPE,NVL(CONN_ITM_ACT_BY_USR_PRIV,0),AR_EMP_TYPE,AR_AC_LINK_TYPE,CUST_D_TYPE,NUM_OF_DAYS_SHW_BILLS FROM IAS_PARA_INV,IAS_PARA_AR,IAS_PARA_POS
SELECT HIDE_COST,INV_REP,NVL(SHOW_AR_REP_DAY,0) FROM PRIVILEGE_FIXED WHERE U_ID
Select Point_Typ_No||' - '||Decode( ,1,nvl(Typ_l_Nm ,Typ_F_Nm ),nvl(Typ_F_Nm ,Typ_l_Nm )), to_char(Point_Typ_No) From Ias_Point_Typ_Mst
Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
Select to_char(TYPE_OF_ITEM)||'-'|| Decode(:parameter.lang_no,1,Nvl(IT_A_NAME,IT_E_NAME),Nvl(IT_E_NAME,IT_A_NAME)) Name , to_char(TYPE_OF_ITEM) From ITEM_TYPES
Select Activity_No||'-'|| Decode( ,1,Nvl(Activity_A_Name,Activity_E_Name),Nvl(Activity_E_Name,Activity_A_Name)) ,To_Char(Activity_No) From Ias_Items_Activity
SELECT 1 FROM CUSTOMER WHERE C_CODE = :b1 AND ROWNUM <= 1"SELECT 1 FROM IAS_PRIV_CUSTOMER WHERE U_ID
Select 1 From POS_WRK_SHFT_CSHR Where POS_WRK_SHFT_CSHR.SHFT_SRL=ias_pos_bill_mst.SHFT_SRL and POS_WRK_SHFT_CSHR.SHFT_CODE Between and And RowNum <= 1 ) And Exists (Select 1 From POS_WRK_SHFT_CSHR Where POS_WRK_SHFT_CSHR
Select 1 From IAS_POS_PRIV_MACHINE Where MACHINE_NO = ias_pos_bill_mst.MACHINE_NO And USED = 1 And U_Id= And Rownum <= 1) And Exists (Select 1 From IAS_POS_PRIV_MACHINE Where MACHINE_NO
select w_code from PRIVILEGE_WH where u_id= And View_flag=1) And Ias_Itm_Mst.g_code in (select g_code from PRIVILEGE_GC where u_id
select w_code from PRIVILEGE_WH where u_id= And ias_pos_bill_mst.Brn_No Between And ias_pos_hst_bill_mst.Brn_No Between And Exists (Select 1 From S_Brn_Usr_Priv Where Brn_No
Select 1 From Ias_Pos_Rt_Bill_Mst Where Ias_Pos_Rt_Bill_Mst.Bill_No=Ias_Pos_Bill_Mst.Bill_No and Ias_Pos_Rt_Bill_Mst.Rt_Bill_No Betwee And Exists (Select 1 From Ias_Pos_Hst_Rt_Bill_Mst Where Ias_Pos_Hst_Rt_Bill_Mst
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSR002_strings.txt`.
