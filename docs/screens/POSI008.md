# POSI008 — توثيق شاشة Onyx Pro POS

> النوع: **POSI** — إدخال/بيانات أساسية (Input/Master)  
> الحجم: 295,168 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSI008.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> ترميز برامج نقاطي 
>  نظام نقاط البيع > مدخلات النظام > 
>  ترميز برامج نقاطي 
>  الاستخدام: 
>  برامج 
> نقاطي عبارة عن برامج تحفيزية تصمم لجذب العملاء ودفعهم لشراء المزيد من الأصناف 
> التي توفرها المنشأة عن طريق رصد نقاط للعميل تحتسب وفق طرق معينة ليستخدمها العميل 
> عن طريق استبدال قيمة النقاط التي حصل عليها بشراء أصناف معينة أو احتسابها كخصم، 
> والغرض من الشاشة ترميز برنامج أو أكثر من برامج نقاطي وفقاً للسياسات البيعية التي 
> تتبعها المنشأة، مع ملاحظة أن هذه الشاشة تظهر إذا تم تفعيل (استخدام نظام النقاط) 
> في شاشة متغيرات وإعدادات نقاط البيع. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر الإضافة على النحو 
> التالي: 
>  - 
>  رقم 
> النوع: يقصد به رقم 
> البرنامج المطلوب ترميزه حيث يعرض النظام رقم تسلسلي آلي للبرنامج بمجرد النقر على 
> زر إضافة. 
>  - 
>  طريقة 
> الاحتساب: يستخدم هذا 
> الحقل لتحديد آلية احتساب النقاط على مستوى النوع في فواتير المبيعات في نظام نقاط 
> البيع؛ حيث يمكن احتساب النقاط حسب أحد الخيارات التالية: 
>  · 
>  من قيمة الأصناف 
> التي ليس لها عروض أو خصم. 
>  · 
>  من قيمة الأصناف 
> التي ليس لها خصم. 
>  · 
>  من قيمة الأصناف 
> التي ليس لها عروض. 
>  · 
>  من قيمة 
> الفاتورة. 
>  · 
>  من صافي مبلغ 
> الفاتورة. 
>  - 
>  الاسم/ 
> الاسم الأجنبي: في هذا الحقل يتم 
> إضافة اسم البرنامج باللغة الافتراضية للنظام وباللغة الأجنبية. 
>  - 
>  تاريخ 
> التفعيل: في هذا الحقل يتم 
> إضافة تاريخ التفعيل وهو التاريخ الذي سيبدأ فيه العمل بالبرنامج. 
>  - 
>  تاريخ 
> الانتهاء: يتم إضافة تاريخ 
> الانتهاء وهو التاريخ الذي سينتهي فيه العمل بالبرنامج ولن يتم احتساب أي نقاط بعد 
> التاريخ المحدد في هذا الحقل. 
>  - 
>  الحد 
> الأدنى لاحتساب النقاط: الحد الأدنى 
> لاحتساب النقاط هو المبلغ الذي لو أن فاتورة العميل أقل منه فلن يحتسب النظام 
> النقاط للعميل. 
>  - 
>  الحد 
> الأدنى لاستبدال النقاط : الحد الأدنى 
> لاستبدال النقاط هو المبلغ الذي لو حقق العميل أقل منه فلن يستبدل النظام النقاط 
> للعميل. 
>  - 
>  طريقة 
> احتساب النقاط: يمكن ترميز برامج 
> نقاطي وفقاً لط

## 2. Data Blocks (12)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| IAS_POINT_TYP_MST | DB | QIU | DELAYED |  |
| IAS_POINT_TYP_CALC_DTL | DB | QIU | AUTOMATIC |  |
| IAS_POINT_TYP_RPLC_DTL | DB | QIU | AUTOMATIC |  |
| IAS_POINT_TYP_GRP_DTL | DB | QIU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| CLNDR | ctrl | QIU | DELAYED |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×566 | visible |
| MAIN1 | TAB | ?×? | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (32)


**Procedures/Functions (32):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_DB_BRANCH`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `CALL_SCR_LNK_PRC`

## 7. مكتبات مرفقة (4)

`YSERPDBALIB`, `POSLIB`, `D2KCOMN`, `D2KWUTIL`

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
| IAS_POINT_TYP_MST | 3 |
| IAS_POINT_TYP_CALC_DTL | 3 |
| IAS_POINT_TYP_RPLC_DTL | 3 |
| IAS_POINT_TYP_GRP_DTL | 3 |
| GROUP_DETAILS | 3 |
| USER | 3 |
| IAS_POINT_CALC_TRNS | 2 |
| USER_R | 2 |
| S_FLAGS | 1 |
| DBA_SNAPSHOTS | 1 |
| POINT | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(MAX(TO_NUMBER(POINT_TYP_NO)),0) + 1 FROM IAS_POINT_TYP_MST
SELECT 1 FROM IAS_POINT_TYP_MST WHERE POINT_TYP_NO = :b1 AND ROWNUM <= 1" CHK_B4SAVE_MST_PRC STANDARD /LPOSLIB GEN_PKG /NSPC28/CHECK_DUPLICATE SQLFORMS "PKG INIT"CHK_B4SAVE_MST_PRC"P_REC_ST"" CHK_B4SAVE_MST_PRC PARAMETER.BLK DELETE_PROC STANDARD FORMS4W IAS_GEN_PKG YSPOS1 IAS_GEN_PKG /LPOSLIB GEN_PKG SQLFORMS "PKG INIT"DELETE_PROC"V_SHALT"V_CNT1"" DELETE_PROC select 1 from IAS_POINT_CALC_TRNS where RowNum
SELECT 1 FROM IAS_POINT_TYP_CALC_DTL WHERE POINT_TYP_NO = :b1 AND RCRD_NO != :b2 AND FROM_AMT BETWEEN :b3 AND :b4"SELECT 1 FROM IAS_POINT_TYP_CALC_DTL WHERE POINT_TYP_NO
SELECT 1 FROM IAS_POINT_TYP_RPLC_DTL WHERE POINT_TYP_NO = :b1 AND RCRD_NO != :b2 AND FROM_POINT BETWEEN :b3 AND :b4"SELECT 1 FROM IAS_POINT_TYP_RPLC_DTL WHERE POINT_TYP_NO
SELECT 1 FROM IAS_POINT_TYP_GRP_DTL WHERE POINT_TYP_NO = :b1 AND G_CODE = :b2" EXIT_PROC STANDARD FORMS40 FORMS4C SQLFORMS /LPOSLIB GEN_PKG FORMS4W "PKG INIT"EXIT_PROC"" EXIT_PROC Bar.Exit_Btn CANCEL ENTER-QUERY al_undo .Dummy RollBack FILL_ALL_LIST_PRC STANDARD /LPOSLIB GEN_PKG "PKG INIT"FILL_ALL_LIST_PRC"P_ITM"V_STM"" FILL_ALL_LIST_PRC Select FLG_SR||'-'||FLG_DESC,to_char(FLG_VALUE) From S_Flags
Select Group_Details.G_Code, Decode ( :Parameter.Lang_No, 1, Nvl (G_A_Name, G_E_Name), Nvl (G_E_Name, G_A_Name)) G_Name From Group_Details, Privilege_Gc
select Point_Typ_No,Typ_l_Nm,Typ_F_Nm FROM IAS_POINT_TYP_MST
SELECT PASSWORD FROM USER_R WHERE U_ID
DELETE FROM IAS_POINT_TYP_CALC_DTL
DELETE FROM IAS_POINT_TYP_RPLC_DTL
DELETE FROM IAS_POINT_TYP_GRP_DTL
SELECT DECODE(:b1,1,NVL(G_A_NAME,G_E_NAME),NVL(G_E_NAME,G_A_NAME)) GRP_NAME FROM GROUP_DETAILS,PRIVILEGE_GC WHERE GROUP_DETAILS
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSI008_strings.txt`.
