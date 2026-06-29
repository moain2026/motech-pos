# POSI003 — توثيق شاشة Onyx Pro POS

> النوع: **POSI** — إدخال/بيانات أساسية (Input/Master)  
> الحجم: 267,568 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSI003.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> أصناف لوحة المفاتيح 
>  نظام نقاط البيع > مدخلات النظام > 
>  أصناف لوحة المفاتيح 
>  الاستخدام: 
> تستخدم الشاشة لربط 
> الأصناف بلوحة المفاتيح الإضافية مع ملاحظة أنه يمكن الربط لمجموعة 
> أصناف 
> كمجموعة الأصناف التي ليس لها باركود وغيرها كي 
> يمكن 
> التعامل معها في شاشة الفواتير كمجموعة 
> اللحوم 
> والدواجن أو البقوليات والفواكه لتسهيل عملية البحث عن هذه الأصناف باستخدام 
> المفتاح Ctrl + K . 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر الإضافة على النحو 
> التالي: 
>  - 
>  رقم/ 
> اسم لوحة المفاتيح الإضافية: يتم إدخال رقم 
> لوحة المفاتيح الإضافية من بين لوحات المفاتيح الإضافية التي تم إضافتهم في شاشة لوحة المفاتيح 
> الإضافية ، وبمجرد اختيار الرقم يظهر اسم اللوحة آلياً. 
>  - 
>  رقم 
> المجموعة: يستخدم هذا الحقل 
> لتحديد رقم مجموعة الأصناف ليتم ربطها بلوحة المفاتيح الإضافية. 
>  - 
>  اسم 
> المجموعة/ الاسم الأجنبي: يستخدم هذا الحقل 
> لإدخال اسم للمجموعة باللغة الافتراضية واللغة الأجنبية. 
>  - 
>  رقم 
> الصنف: يستخدم هذا الحقل 
> لإدخال رقم الصنف المراد ربطه بالمجموعة ولوحة المفاتيح. 
>  - 
>  اسم 
> الصنف/ الوحدة: تظهر بيانات هذين 
> الحقلين بشكل آلي بمجرد اختيار الصنف، مع ملاحظة أن الوحدة التي تظهر هي الوحدة 
> الرئيسية للصنف ولا يمكن تعديلها. 
>  - 
>  حفظ: 
>  يتم حفظ البيانات 
> بواسطة وسائل الحفظ المتاحة. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (10)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| IAS_POS_KEY_BRD_GRPS_MST | DB | QIU | AUTOMATIC |  |
| IAS_POS_KEY_BRD_GRPS_DTL | DB | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (31)


**Procedures/Functions (31):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `CALL_SCR_LNK_PRC`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KWUTIL`, `D2KCOMN`

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
| IAS_ITM_MST | 5 |
| IAS_POS_EXTRA_KEYPAD | 3 |
| PRIVILEGE_GC | 3 |
| IAS_POS_KEY_BRD_GRPS_MST | 2 |
| IAS_POS_KEY_BRD_GRPS_DTL | 2 |
| USER_R | 2 |
| GROUP_DETAILS | 1 |
| IAS_ITEM_PRICE | 1 |
| S_CLNDR_LIST | 1 |
| USER | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_ITM_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`, `IAS_GEN_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select extra_keypad_no, Decode(:Parameter.lang_no,1,Nvl(extra_keypad_a_name,extra_keypad_e_name) ,Nvl(extra_keypad_a_name,extra_keypad_e_name)) extra_keypad_name From ias_pos_extra_keypad
Select m.I_Code,Decode(:Parameter.Lang_No,1,nvl(I_name,I_e_name),nvl(I_e_name,I_name) )I_name,d.itm_unt Unit,m.I_desc From Ias_Itm_Mst M,Ias_Itm_Dtl D
select decode(:Parameter.Lang_No,1,nvl(i_name,i_e_name),nvl(i_e_name,i_name)) i_name,m.i_code,d.itm_unt unit,m.i_desc From Ias_Itm_Mst M,Ias_Itm_Dtl D
Select extra_keypad_no, kgrp_code , Decode(:parameter.lang_no,1,Nvl(kgrp_a_name,kgrp_e_name) ,Nvl(kgrp_e_name,kgrp_a_name)) Group_Name From ias_pos_key_brd_grps_mst
Select G_Code, Decode(:Parameter.lang_no,1,Nvl(g_a_name,g_e_name) ,Nvl(g_e_name,g_a_name) ) G_Name From group_Details
Select D.Itm_Unt, Lvl_Unit, P_Size From Ias_Itm_Mst M,Ias_Itm_Dtl D
Select To_Char(Clndr_Code)||'-'||Cid_Addr_Op_Pkg.Get_Trns_Lbl (P_Cntry_2_Ltr =>'', P_Lang_Code =>'', P_Lang_Id => P_Cid_Name_Lbl =>Clndr_Nm_Lbl) Clndr_Nm_Lbl ,TO_CHAR(Clndr_Code) From S_Clndr_List WHERE CLNDR_CODE
SELECT DECODE(:b1,1,NVL(IAS_POS_EXTRA_KEYPAD.EXTRA_KEYPAD_A_NAME,IAS_POS_EXTRA_KEYPAD.EXTRA_KEYPAD_E_NAME),NVL(IAS_POS_EXTRA_KEYPAD.EXTRA_KEYPAD_E_NAME,IAS_POS_EXTRA_KEYPAD.EXTRA_KEYPAD_A_NAME)) FROM IAS_POS_EXTRA_KEYPAD WHERE EXTRA_KEYPAD_NO
DELETE FROM IAS_POS_KEY_BRD_GRPS_DTL
SELECT DECODE(:b1,1,NVL(I_NAME,I_E_NAME),NVL(I_E_NAME,I_NAME)) I_NAME FROM IAS_ITM_MST WHERE I_CODE
SELECT PASSWORD FROM USER_R WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSI003_strings.txt`.
