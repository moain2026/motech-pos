# POSR014 — توثيق شاشة Onyx Pro POS

> النوع: **POSR** — تقارير (Reports)  
> الحجم: 284,948 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSR014.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تقارير (Reports)**. أكثر الجداول استخداماً: `POS_WRK_SHFT_CSHR`, `S_RPRT_USR_TMPLT_MST`, `USER_R`, `S_RPRT_USR_TMPLT_DTL`, `S_BRN_USR_PRIV`, `CASHER`.

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

## 6. Program Units (9)


**Procedures/Functions (9):** `CLEAR_PROC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `PRINT_PROC`, `LIST_LOV`, `WHEN_NEW_FORM_INSTANCE_PRC`, `GET_DATE_WRK_SHFT`

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
| POS_WRK_SHFT_CSHR | 6 |
| S_RPRT_USR_TMPLT_MST | 4 |
| USER_R | 3 |
| S_RPRT_USR_TMPLT_DTL | 3 |
| S_BRN_USR_PRIV | 2 |
| CASHER | 2 |
| TIME | 2 |
| PRIVILEGE | 1 |
| IAS_PARA_POS | 1 |
| S_BRN | 1 |
| IAS_POS_MACHINE | 1 |
| IAS_DEPOSIT_CURRENCY_MST | 1 |
| POS_WRK_SHFT | 1 |
| MACHINE | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_USR_PKG`, `LOV_PKG`, `YS_GEN_PKG`, `YS_SCR_PKG`, `POS_WRK_SHFT_PKG`, `GEN_RPRT_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`, `IAS_FETCH_DATA_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT INCLUDE_FLAG FROM PRIVILEGE WHERE U_ID
SELECT DPST_TYP,USE_WRK_SHFT FROM IAS_PARA_POS
SELECT SHFT_SRL FROM POS_WRK_SHFT_CSHR WHERE SHFT_NO
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
Select Brn_No, Decode(:Parameter.Lang_no,1,Nvl(Brn_Lname,Brn_Fname),Nvl(Brn_Fname,Brn_Lname)) Brn_name From S_Brn
select 1 From S_Brn_Usr_Priv Where U_Id = :Parameter.User_No And S_Brn_Usr_Priv.Brn_No = S_Brn.Brn_No And Nvl(View_Flag,1) = 1 And RowNum <=1 )) Order By Cmp_No , Brn_No BRN_NO BRN_NAME RG_USER Select u_id,Decode(:Parameter.Lang_no,1,U_a_Name,nvl(U_e_Name,U_a_Name)) U_name From User_r Order by U_id
Select machine_no, terminal ,brn_machine_no From ias_pos_machine
Select Doc_No , Doc_Date , Ias_Usr_Pkg.Get_Usr_Nm(Cashier_No, :Parameter.Lang_No ) Cashier_Name , Doc_Desc , Brn_No , Doc_Ser, FLG_DESC prss_name From Ias_Deposit_Currency_Mst,S_FLAGS
select SHFT_NO,SHFT_CODE,SHFT_SRL,CSHR_NO,OPN_DATE,CLS_DATE, Ias_Usr_Pkg.Get_Usr_Nm(CSHR_NO, :Parameter.Lang_No ) CSHR_Name FROM POS_WRK_SHFT_CSHR WHERE NVL
Select SHFT_CODE,DECODE(:Parameter.Lang_No,1,shft_dsc,shft_dsc_F) shft_dsc,F_TIME,T_TIME FROM POS_WRK_SHFT WHERE NVL
SELECT BLK_NM,ITM_NM,VAL FROM S_RPRT_USR_TMPLT_DTL WHERE TMPLT_NO
SELECT NVL(MAX(TMPLT_NO),0) + 1 FROM S_RPRT_USR_TMPLT_MST WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSR014_strings.txt`.
