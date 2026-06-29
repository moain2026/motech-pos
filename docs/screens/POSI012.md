# POSI012 — توثيق شاشة Onyx Pro POS

> النوع: **POSI** — إدخال/بيانات أساسية (Input/Master)  
> الحجم: 220,960 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSI012.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **إدخال/بيانات أساسية (Input/Master)**. أكثر الجداول استخداماً: `IAS_POS_CARD`, `USER_R`, `IAS_POS_BILL_MST`, `IAS_POINT_TYP_MST`, `IAS_PARA_POS`, `EXCEL`.

## 2. Data Blocks (8)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| PARAMTRS | ctrl | QIU | AUTOMATIC |  |
| IAS_POS_CARD | DB | QIU | AUTOMATIC | ORDER:Crd_No |
| MAIN | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×41 | visible |
| MAIN | CONTENT | 768×525 | visible |
| MAIN1 | CONTENT | 337×181 | visible |
| MAIN2 | STACKED | 672×274 | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 766×66 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (4)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN1 | Import From Excel | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | false |

## 5. Triggers (29)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `LOV_TRG`

## 6. Program Units (30)


**Procedures/Functions (30):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `IMP_F_EXCEL`, `FILL_DATA_INSRT_PRC`, `FILL_DATA_QRY_PRC`

## 7. مكتبات مرفقة (4)

`D2KWUTIL`, `YSPOS_LIB`, `YSERPDBALIB`, `D2KCOMN`

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
| IAS_POS_CARD | 6 |
| USER_R | 2 |
| IAS_POS_BILL_MST | 1 |
| IAS_POINT_TYP_MST | 1 |
| IAS_PARA_POS | 1 |
| EXCEL | 1 |
| IAS_CASH_CUSTMR | 1 |
| CARD | 1 |
| IAS_PARA_GEN | 1 |
| USER | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `POS_POINT_PKG`, `IAS_USR_PKG`, `IAS_GEN_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT 1 FROM IAS_POS_CARD WHERE CRD_NO = :b1"SELECT 1 FROM IAS_POS_CARD WHERE CRD_NO
Select POINT_TYP_NO||'-'||Nvl(TYP_L_NM,TYP_f_NM) TYP_NM, To_Char(POINT_TYP_NO) POINT_TYP_NO From Ias_Point_Typ_Mst
SELECT USE_DISC_CARD,USE_POS_POINT_SYS FROM IAS_PARA_POS
Select Excel(.Xls) File Enter Excel Path Error excel path......... excel system [Open( EXCEL IAS_POS_CARD ROLLBACK Bar.Save_Btn SELECT 1 FROM IAS_POS_CARD WHERE CRD_NO
Select Crd_No , CRD_DESC, EXPIRE_DATE, DISC_PER From ias_pos_card
Select Crd_No , CRD_DESC, ias_pos_card.POINT_TYP_NO, Decode(:lang_no,1,TYP_L_NM,nvl(TYP_f_NM,TYP_L_NM) )point_typ_nm From ias_pos_card,Ias_Point_Typ_Mst
Select Cust_Code, Decode (:Parameter.Lang_No,1, Nvl (Cust_L_Nm , Cust_F_Nm ), Nvl (Cust_F_Nm , Cust_L_Nm )) cust_name, Decode (:Parameter.Lang_No,1, Nvl (Cust_GRP_L_NM , Cust_GRP_F_NM ), Nvl (Cust_GRP_F_NM,Cust_GRP_L_NM )) group_name From IAS_CASH_CUSTMR,IAS_CASH_CUSTMR_GRP
SELECT PATH_EXCEL FROM IAS_PARA_GEN
SELECT PASSWORD FROM USER_R WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSI012_strings.txt`.
