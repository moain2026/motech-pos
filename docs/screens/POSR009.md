# POSR009 — توثيق شاشة Onyx Pro POS

> النوع: **POSR** — تقارير (Reports)  
> الحجم: 269,040 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSR009.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تقارير (Reports)**. أكثر الجداول استخداماً: `IAS_POS_MACHINE`, `USER_R`, `S_RPRT_USR_TMPLT_MST`, `S_RPRT_USR_TMPLT_DTL`, `EX_RATE`, `VAOUCHER`.

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

## 6. Program Units (6)


**Procedures/Functions (6):** `CLEAR_PROC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `LOAD_PARAMETERS`, `PRE_FORM_PRC`, `PRINT_PROC`

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
| IAS_POS_MACHINE | 5 |
| USER_R | 4 |
| S_RPRT_USR_TMPLT_MST | 4 |
| S_RPRT_USR_TMPLT_DTL | 3 |
| EX_RATE | 2 |
| VAOUCHER | 2 |
| S_BRN | 1 |
| S_BRN_USR_PRIV | 1 |
| USER | 1 |
| MACHINE | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `LOV_PKG`, `IAS_USR_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`, `IAS_FETCH_DATA_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select IAS_GEN_PKGYSPOS1GET_PROMPTI IAS_GEN_PKG ,'0' From dual Union
Select decode( ,1,nvl(cur_name,cur_e_name),nvl(cur_e_name,cur_name)),cur_code from ex_rate
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
Select Brn_No, Decode(:Parameter.Lang_no,1,Nvl(Brn_Lname,Brn_Fname),Nvl(Brn_Fname,Brn_Lname)) Brn_name From S_Brn
select 1 From S_Brn_Usr_Priv Where U_Id = :Parameter.User_No And S_Brn_Usr_Priv.Brn_No = S_Brn.Brn_No And Nvl(View_Flag,1) = 1 And RowNum <=1 )) Order By Cmp_No , Brn_No BRN_NO BRN_NAME RG_USER Select u_id,Decode(:Parameter.Lang_no,1,U_a_Name,nvl(U_e_Name,U_a_Name)) U_name From User_r Order by U_id
Select machine_no, terminal From ias_pos_machine
Select u_id, Nvl(u_a_name,u_e_name) u_name From user_r
SELECT MIN(MACHINE_NO) FROM IAS_POS_MACHINE
SELECT MAX(MACHINE_NO) FROM IAS_POS_MACHINE
SELECT BLK_NM,ITM_NM,VAL FROM S_RPRT_USR_TMPLT_DTL WHERE TMPLT_NO
SELECT NVL(MAX(TMPLT_NO),0) + 1 FROM S_RPRT_USR_TMPLT_MST WHERE U_ID
INSERT INTO S_RPRT_USR_TMPLT_MST ( TMPLT_NO,ORDR_NO,TMPLT_NM,AD_TRMNL_NM,AD_DATE,AD_U_ID,U_ID,FORM_NO )
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSR009_strings.txt`.
