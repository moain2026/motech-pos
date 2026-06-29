# POSI006 — توثيق شاشة Onyx Pro POS

> النوع: **POSI** — إدخال/بيانات أساسية (Input/Master)  
> الحجم: 213,804 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSI006.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> مفاتيح أصناف الموزنات 
>  نظام نقاط البيع > مدخلات النظام > 
>  مفاتيح أصناف الموزنات 
>  الاستخدام: 
> تستخدم الشاشة – فقط - لعرض الأصناف المحددة أنها (صنف موزن) في شاشة بيانات 
> الأصناف، وفي هذه الشاشة يمكن ربط الصنف بمفتاح محدد يستخدم عند تحديث الأصناف إلى 
> الميزان. 
>  طريقة استخدام الشاشة 
>  تعرض الشاشة آلياً الأصناف الموزنة كما تستخدم الشاشة بعد النقر على زر 
> التعديل لإضافة مفاتيح للأصناف الموزنة في الميزان على النحو 
> التالي: 
>  - 
>  رقم 
> المجموعة: 
>  بمجرد 
> اختيار المجموعة من القائمة تظهر الأصناف الموزنة المرتبطة بها في البيانات 
> التفصيلية، وإذا لم يتم اختيار مجموعة فسوف تظهر الأصناف الموزنة لكل 
> المجموعات. 
>  - 
>  رقم/ 
> اسم الصنف/ الأجنبي/ الوحدة: بمجرد فتح الشاشة 
> تظهر الأصناف الموزنة فقط بموجب البيانات المدخلة في شاشة بيانات 
> الأصناف. 
>  - 
>  المفتاح: 
>  في هذا الحقل 
> يمكن إضافة مفتاح لكل صنف موزن، ويستخدم هذا المفتاح لاستدعاء الصنف بواسطة الميزان 
> عند البيع، فعلى سبيل المثال يمكن في هذه الشاشة تحديد F2 مفتاحاً لصنف البهارات وبالتالي فإنه عند بيع 
> هذا الصنف يتم الضغط على F2 في الميزان وهذه الميزة تعد اختصاراً للوقت 
> والجهد لإتمام عملية البيع وإنجازها بسرعة. 
>  - 
>  حفظ: 
>  يتم حفظ البيانات 
> بواسطة وسائل الحفظ المتاحة. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (9)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_ITM_MST | DB | QIU | AUTOMATIC | ORDER:Hot_Key,I_Code |
| CLNDR | ctrl | QIU | DELAYED |  |
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
| MAIN | CONTENT | 1024×517 | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (45)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (29)


**Procedures/Functions (29):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `LOAD_BLOCK`, `CALL_SCR_LNK_PRC`

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
| IAS_PARA_INV | 2 |
| USER_R | 2 |
| IAS_ITM_MST | 1 |
| GROUP_DETAILS | 1 |
| USER | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `IAS_ITM_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`, `IAS_GEN_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select G_Code||'-' ||Decode( ,1,Nvl(G_A_Name,G_E_Name),Nvl(G_E_Name,G_A_Name)) ,G_Code From Group_Details
SELECT WGHT_ITM_LNGTH FROM IAS_PARA_INV
Select To_Char(Clndr_Code)||'-'||Cid_Addr_Op_Pkg.Get_Trns_Lbl (P_Cntry_2_Ltr =>'', P_Lang_Code =>'', P_Lang_Id => P_Cid_Name_Lbl =>Clndr_Nm_Lbl) Clndr_Nm_Lbl ,TO_CHAR(Clndr_Code) From S_Clndr_List WHERE CLNDR_CODE
SELECT PASSWORD FROM USER_R WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSI006_strings.txt`.
