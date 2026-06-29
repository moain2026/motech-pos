# POSS003 — توثيق شاشة Onyx Pro POS

> النوع: **POSS** — إعدادات/نظام (Settings/System)  
> الحجم: 228,840 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSS003.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> النسخ الاحتياطية 
>  نظام نقاط البيع > تهيئة النظام > 
>  النسخ الاحتياطية 
>  الاستخدام: 
> تستخدم الشاشة لحماية البيانات والمعلومات المدخلة في النظام عن طريق النسخ 
> الاحتياطي تفادياً للتلف أو الضياع الناتج عن أي طارئ (تقني – فني – مادي..) مع 
> إمكانية إنشاء نسخ احتياطية لنظام نقاط البيع من شاشة النسخ الاحتياطي في إدارة 
> النظام في الأونكس. 
>  طريقة استخدام الشاشة 
>  - 
>  الوحدة 
> المحاسبية: 
>  تظهر 
> الوحدة المحاسبية آلياً 
> وهي الوحدة التي سيتم نسخ بياناتها مع عدم إمكانية اختيار أي وحدة محاسبية 
> أخرى. 
>  - 
>  مسار 
> النسخة الاحتياطية: 
> يتم تحديد مسار أو موقع النسخة الاحتياطية في جهاز الكمبيوتر، ويتم تحديد المجلد 
> الذي سيتم حفظ النسخة الاحتياطية فيه؛ ويفضل أن يكون أحد الأقراص باستثناء قرص 
> النظام ( C )، ثم يتم كتابة اسم ملف النسخة الاحتياطية ثم 
> النقر على زر Open يقوم النظام بإنزال مسار 
> النسخة والاسم، ولعمل نسخة احتياطية يتم الأخذ في الاعتبار ما 
> يلي: 
>  · 
>  يجب 
>  ألا 
> يكون المسار طويلاً. 
>  · 
>  يجب 
> ألا يحتوي اسم النسخة على فراغ. 
>  · 
>  يجب 
> أن يكون 
> اسم النسخة أرقاماً أو حروفاً إنجليزية. 
>  - 
>  الشاشة: 
>  عند 
> تفعيل هذا المؤشر تظهر شاشة النسخ الاحتياطي (شاشة سوداء) لاستعراض عملية النسخ 
> الاحتياطي ومعرفة أين وصل النظام في عملية النسخ. 
>  - 
>  كلمة 
> السر/ تأكيد كلمة السر: 
> يتم إدخال كلمة السر للنسخة الاحتياطية حيث لا يمكن استرجاعها إلا بإدخال كلمة 
> السر، ويعد هذا الحقل اختيارياً. 
>  - 
>  نسخة 
> احتياطية: 
> بالنقر على زر (نسخة احتياطية) يقوم النظام بحفظ النسخة الاحتياطية في المجلد 
> والمسار المحدد، وبعد إتمام عملية النسخ تظهر رسالة مفادها ( تمت العملية 
> بنجاح)، ويفضل الاحتفاظ بالنسخة في أي وسيلة حفظ خارج 
> الجهاز. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (9)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| BK | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
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
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | false |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`, `WHEN-WINDOW-DEACTIVATED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (28)


**Procedures/Functions (28):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CALL_SCR_LNK_PRC`

## 7. مكتبات مرفقة (4)

`POSLIB`, `YSERPDBALIB`, `D2KWUTIL`, `D2KCOMN`

## 8. Alerts (7)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| CONFIRM | تكرار الملف ! | STOP | نعم |
| CONRES | إسترجاع النسخة الإحتياطية | STOP | موافق |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| POS_BACKUP | 6 |
| ALL_USERS | 2 |
| USER_R | 2 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `YS_GEN_PKG`, `YS_SCR_PKG`, `YS_BKUP_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT COUNT(*) FROM ALL_USERS WHERE USERNAME
SELECT 1 FROM POS_BACKUP WHERE BK_NAME = :b1"SELECT COUNT(1) FROM POS_BACKUP
SELECT NVL(MAX(BK_NO),0) + 1 FROM POS_BACKUP
INSERT INTO POS_BACKUP ( BK_NO,BK_NAME,FILE_NAME,BK_DATE,BRN_NO,BRN_YEAR,CMP_NO,BRN_USR,ENC_PASSWD,AD_TRMNL_NM )
SELECT USERNAME,1 FROM ALL_USERS WHERE USERNAME
SELECT MAX(BK_NO) + 1 FROM POS_BACKUP
Select To_Char(Clndr_Code)||'-'||Cid_Addr_Op_Pkg.Get_Trns_Lbl (P_Cntry_2_Ltr =>'', P_Lang_Code =>'', P_Lang_Id => P_Cid_Name_Lbl =>Clndr_Nm_Lbl) Clndr_Nm_Lbl ,TO_CHAR(Clndr_Code) From S_Clndr_List WHERE CLNDR_CODE
SELECT PASSWORD FROM USER_R WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSS003_strings.txt`.
