# POSI007 — توثيق شاشة Onyx Pro POS

> النوع: **POSI** — إدخال/بيانات أساسية (Input/Master)  
> الحجم: 262,488 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSI007.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> بطائق الدفع المسبق والكوبونات 
>  نظام نقاط البيع > مدخلات النظام > 
>  بطائق الدفع المسبق والكوبونات 
>  الاستخدام: 
>  تظهر الشاشة إذا 
> تم تفعيل (استخدام بطائق الدفع المسبق) في شاشة متغيرات وإعدادات نقاط البيع، 
> وتستخدم 
> لترميز بطائق الدفع المسبق وكذلك الكوبونات ليتم التعامل معها في شاشة التدفيع 
> المتعدد في فواتير المبيعات وكذلك يتم ربطها بالعميل من خلال رقم 
> العميل. 
>  طريقة استخدام الشاشة 
>  تستخدم 
> الشاشة بعد النقر على زر الإضافة على النحو التالي: 
>  - 
>  رقم 
> البطاقة: يستخدم هذا الحقل 
> لإضافة رقم البطاقة المراد التعامل معها في شاشة التدفيع (الفيزا كارد) أو رقم 
> الكوبون، ولا يسمح بتكرار الرقم في هذا الحقل. 
>  - 
>  العملة: 
>  يستخدم هذا الحقل 
> لتحديد عملة البطاقة أو الكوبون التي ستستخدم في عملية التدفيع في 
> الفواتير. 
>  - 
>  المبلغ: 
>  يستخدم هذا الحقل 
> لتحديد مبلغ البطاقة أو الكوبون. 
>  - 
>  المبلغ 
> المتبقي: يتم عرض المبلغ 
> المتبقي في هذا الحقل بعد عملية التدفيع. 
>  - 
>  من 
> تاريخ/ إلى تاريخ: 
>  في هذين الحقلين 
> يتم إدخال فترة صلاحية بطاقة الدفع المسبق، ويعد إدخال فترة الصلاحية اختيارياً إذا 
> لم يتم تفعيل المتغير (إدخال فترة تفعيل بطائق الدفع المسبق إجباري). 
>  - 
>  مجاني: 
>  يتم تفعيل هذا 
> الخيار إذا كانت بطاقة الدفع التي ترميزها مجانية للعميل. 
>  - 
>  رقم/ 
> اسم العميل: يستخدم هذا الحقل 
> لإدخال رقم العميل وربطه بالكوبون وهو حقل اختياري. 
>  - 
>  البيان: 
>  يتم تدوين بيان 
> توضيحي على مستوى كل بطاقة دفع يتم ترميزها. 
>  - 
>  رقم 
> المرجع: 
>  يتم تدوين رقم 
> مرجع على مستوى كل بطاقة دفع يتم ترميزها. 
>  - 
>  رقم 
> التسلسل: يستخدم هذا الحقل 
> لإدخال رقم تسلسل لبطاقة الدفع المسبق تظهر عند التدفيع. 
>  - 
>  كلمة 
> السر: 
>  يتم تدوين كلمة 
> سر على مستوى كل بطاقة دفع يتم إضافتها، ويتم طلب هذه الكلمة من العميل عند عملية 
> التدفيع. 
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
| MAIN | ctrl | QIU | AUTOMATIC |  |
| IAS_POS_CUSTOMER_CARD_AMOUNT | DB | QIU | AUTOMATIC | ORDER:Card_No |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (9) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | CONTENT | 373×176 | visible |
| MAIN2 | STACKED | 678×338 | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (6)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN1 | Import From Excel | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (45)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (29)


**Procedures/Functions (29):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `IMP_F_EXCEL`, `CALL_SCR_LNK_PRC`

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
| IAS_POS_CUSTOMER_CARD_AMOUNT | 5 |
| CUSTOMER | 4 |
| USER_R | 3 |
| EX_RATE | 2 |
| IAS_PARA_POS | 1 |
| EXCEL | 1 |
| USER | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `IAS_CST_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select 1 From Ias_Pos_Customer_Card_Amount
SELECT CPN_EXPIRE_DATE_MNDTRY FROM IAS_PARA_POS
SELECT COUNT(1) FROM (SELECT COUNT(A_CY) FROM IAS_POS_CUSTOMER_CARD_AMOUNT GROUP BY UPPER
Select Excel(.Xls) File Enter Excel Path Error excel path......... excel system [Open( EXCEL Ias_Pos_Customer_Card_Amount Ias_Pos_Customer_Card_Amount.F_DATE Ias_Pos_Customer_Card_Amount.T_Date ROLLBACK Bar.Save_Btn SELECT 1 FROM IAS_POS_CUSTOMER_CARD_AMOUNT WHERE CARD_NO
SELECT DECODE(:b1,1,NVL(C_A_NAME,C_E_NAME),NVL(C_E_NAME,C_A_NAME)) FROM CUSTOMER WHERE C_CODE
Select Card_No , Card_Amt , Rem_Card_Amt , C_Code , Ias_Cst_Pkg. Get_C_Name (C_Code,:Parameter.Lang_No) C_Name From Ias_Pos_Customer_Card_Amount
Select Cur_Code, Decode(:Parameter.Lang_No ,1,Nvl(Cur_Name,Cur_E_Name),Nvl(Cur_E_Name,Cur_Name)) Cur_Name , Cur_Rate From Ex_Rate
Select customer.c_code, Decode (:Parameter.Lang_No,1, Nvl (c_a_name, c_e_name), Nvl (c_e_name, c_a_name)) c_name, Decode (:Parameter.Lang_No,1, Nvl (c_group_a_name, c_group_e_name), Nvl (c_group_e_name, c_group_a_name)) group_name, customer.c_a_code a_code From customer,Customer_Group
SELECT EXCEL_PATH FROM USER_R WHERE U_ID
SELECT DECODE(:b1,1,NVL(C_A_NAME,C_E_NAME),NVL(C_E_NAME,C_A_NAME)),NVL(INACTIVE,0),NVL(INACTIVE_SALES,0) FROM CUSTOMER WHERE C_CODE
SELECT PASSWORD FROM USER_R WHERE U_ID
Select To_Char(Clndr_Code)||'-'||Cid_Addr_Op_Pkg.Get_Trns_Lbl (P_Cntry_2_Ltr =>'', P_Lang_Code =>'', P_Lang_Id => P_Cid_Name_Lbl =>Clndr_Nm_Lbl) Clndr_Nm_Lbl ,TO_CHAR(Clndr_Code) From S_Clndr_List WHERE CLNDR_CODE
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSI007_strings.txt`.
