# POSI009 — توثيق شاشة Onyx Pro POS

> النوع: **POSI** — إدخال/بيانات أساسية (Input/Master)  
> الحجم: 221,020 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSI009.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> مجموعة عملاء نقاط البيع 
>  نظام نقاط البيع > مدخلات النظام > 
>  مجموعة عملاء نقاط البيع 
>  الاستخدام: 
>  من 
> خلال هذه الشاشة يمكن تقسيم العملاء النقديين إلى مجموعات متجانسة لغرض استعراض 
> تقارير حسب هذا التقسيم، حيث يمكن تقسيم العملاء حسب الموقع الجغرافي أو حسب نوع 
> المبيعات أو حسب أي تقسيم يناسب المنشأة وسياساتها البيعية، مع ملاحظة أن المجموعات 
> التي يتم إضافتها هنا تظهر في نظام الأونكس والعكس 
> صحيح. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر الإضافة على النحو 
> التالي: 
>  - 
>  رقم 
> المجموعة: 
>  يعرض 
> النظام رقم تسلسلي مع إمكانية تعديله. 
>  - 
>  اسم 
> المجموعة/ الاسم الأجنبي: 
>  يتم 
> إدخال اسم المجموعة باللغة الافتراضية للنظام وباللغة الأجنبية. 
>  - 
>  إرسال 
> رسالة: 
>  بتفعيل هذا 
> المؤشر يعني تفعيل خدمة الرسائل لهذه المجموعة التي يتم إضافتها. 
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
| IAS_CASH_CUSTMR_GRP | DB | QIU | DELAYED | ORDER:Cust_GRP_CODE |
| CLNDR | ctrl | QIU | DELAYED |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
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

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `WHENWINDOWDEACTIVATED`

## 6. Program Units (28)


**Procedures/Functions (28):** `WHEN_TAB_PAGE_CHANGED_PRC`, `KEY_LISTVAL_PRC`, `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CALL_SCR_LNK_PRC`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`

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
| IAS_CASH_CUSTMR_GRP | 6 |
| USER_R | 2 |
| IAS_CASH_CUSTMR | 1 |
| IAS_PARA_POS | 1 |
| USER | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `IAS_GEN_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(MAX(TO_NUMBER(CUST_GRP_CODE)),0) + 1 FROM IAS_CASH_CUSTMR_GRP
SELECT CUST_GRP_L_NM,CUST_GRP_F_NM FROM IAS_CASH_CUSTMR_GRP WHERE CUST_GRP_CODE
SELECT COUNT(1) FROM IAS_CASH_CUSTMR WHERE CUST_GRP_CODE
SELECT SEND_MSG_CST_TYP FROM IAS_PARA_POS
SELECT Cust_GRP_CODE, decode(:Parameter.Lang_No,1,Nvl(Cust_GRP_L_NM ,Cust_GRP_F_NM ),Nvl(Cust_GRP_F_NM ,Cust_GRP_L_NM )) C_Group_Name FROM IAS_CASH_CUSTMR_GRP
Select D.Cust_Code, Decode (:Parameter.Lang_No,1, Nvl (Cust_L_Nm, Cust_F_Nm), Nvl (Cust_F_Nm, Cust_L_Nm)) C_Name, Decode (:Parameter.Lang_No,1, Nvl (Cust_GRP_L_NM, Cust_GRP_F_NM), Nvl (Cust_GRP_F_NM, Cust_GRP_L_NM)) C_Group_Name From IAS_CASH_CUSTMR_GRP M,IAS_CASH_CUSTMR D
Select To_Char(Clndr_Code)||'-'||Cid_Addr_Op_Pkg.Get_Trns_Lbl (P_Cntry_2_Ltr =>'', P_Lang_Code =>'', P_Lang_Id => P_Cid_Name_Lbl =>Clndr_Nm_Lbl) Clndr_Nm_Lbl ,TO_CHAR(Clndr_Code) From S_Clndr_List WHERE CLNDR_CODE
SELECT PASSWORD FROM USER_R WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSI009_strings.txt`.
