# POSS005 — توثيق شاشة Onyx Pro POS

> النوع: **POSS** — إعدادات/نظام (Settings/System)  
> الحجم: 544,092 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSS005.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> الإعدادات الافتراضية 
>  نظام نقاط البيع > تهيئة النظام > 
>  الإعدادات الافتراضية 
>  الاستخدام: 
>  تستخدم الشاشة 
> لضبط وإعداد الخيارات الافتراضية التي سيتم تطبيقها على مستوى النظام ككل مع 
> إمكانية التخصيص والإعداد على مستوى نقاط البيع. 
>  طريقة الاستخدام 
>  بمجرد الدخول إلى 
> الشاشة تظهر قائمة بالإعدادات الافتراضية ليتم اختيار أياً منها ومن ثم النقر على 
> زر التعديل والانتقال إلى حقل القيمة ليتم عرض الخيارات باستخدام F9 واختيار الإعداد المناسب وبذلك سيتم اعتماده 
> للنظام ككل وليس لنقطة بيع معينة، أما إذا أراد المستخدم تطبيق سياسة أخرى لنقطة 
> بيع يتم الانتقال إلى الجزء الأسفل لتحديد نقطة البيع التي سيتم فيها تطبيق 
> الإعدادات ومن ثم يتم تحديد القيمة (نعم أم لا)، وأهم هذه الإعدادات نشرحها كما 
> يلي: 
>  - 
>  طريقة 
> الدفع الافتراضية في شاشة الدفع المتعدد للفواتير: تستخدم لتحديد 
> طريقة الدفع الافتراضية التي ستظهر آلياً عند الدفع المتعدد. 
>  - 
>  استخدام 
> شاشة اختيار الأصناف: يستخدم لإظهار 
> أو عدم إظهار شاشة عرض الأصناف في شاشة فاتورة المبيعات، عادة ما يتم تفعيل عرض 
> الأصناف عند التعامل مع شاشات اللمس لتسهيل عملية البيع. 
>  - 
>  نوع 
> مجموعة الأصناف في شاشة اختيار الأصناف: يستخدم -عند 
> تفعيل استخدام شاشة اختيار الأصناف- لتحديد طريقة عرض الأصناف في فاتورة 
> المبيعات. 
>  - 
>  اعتماد 
> مستوى سعر البيع للعميل الآجل من بيانات العملاء: يستخدم لإنزال 
> السعر حسب مستوى التسعيرة المرتبط بالعميل في شاشة بيانات العملاء، حيث يتم إنزاله 
> بشكل آلي للمبيعات الآجلة، ولا يسمح للكاشير التعديل في فاتورة المبيعات وفاتورة 
> مردود المبيعات. 
>  - 
>  استخدام 
> مفتاح الإنتر في حقل رقم الباركود الفارغ: يستخدم 
> مفتاح Enter للانتقال إلى 
> شاشة التدفيع المصغرة لتسجيل المبلغ المدفوع من العميل بعد الانتهاء من إدخال 
> الأصناف في الفاتورة. 
>  - 
>  إظهار 
> البيان على مستوى الصنف: يستخدم لإظهار 
> البيان على مستوى الصنف في فاتورة المبيعات. 
>  - 
>  طريقة 
> عرض شاشة الفاتورة المصغرة 1024*768: يستخدم لتحديد 
> نوع نموذج الفاتورة المستخدم في حالة استخدا

## 2. Data Blocks (12)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| POS_DFLT_STNG_MST | DB | QIU | AUTOMATIC |  |
| POS_DFLT_STNG_DTL | DB | QIU | AUTOMATIC |  |
| POS_DFLT_GRP_DTL | DB | QIU | AUTOMATIC |  |
| COLOR_BLK | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | IMMEDIATE |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (10) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 1022×65 | visible |
| CNV_DTL | TAB | ?×? | visible |
| CNVS_GRP_PRPRTY | STACKED | 317×164 | hidden |
| CNVS_COLOR | CONTENT | 659×119 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (7)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_GRP_PRPRTY | GROUP PROPERTIES | DIALOG | true |
| WIN_COLOR | COLORS | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (40)

**Packages (spec):** `COLOR_PKG`


**Packages (body):** `COLOR_PKG`


**Procedures/Functions (38):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CALL_SCR_LNK_PRC`, `DYNAMIC_LOV_FVRT_STNG_VAL`, `DYNAMIC_RECORD_GROUP`, `GET_VAL_DSC_NM_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `GET_GRP_NM_FUN`, `CHK_GRP_NO_PRC`, `SHW_HIDE_TABS_PRC`, `CHK_DUPLICATE_GRPS_PRC`

## 7. مكتبات مرفقة (4)

`D2KWUTIL`, `D2KCOMN`, `YSERPDBALIB`, `POSLIB`

## 8. Alerts (6)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ALERT_1 | Set at runtime | NOTE | OK |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| IAS_POS_MACHINE | 4 |
| POS_DFLT_STNG_DTL | 4 |
| S_FLAGS | 4 |
| GROUP_DETAILS | 3 |
| IAS_MAINSUB_GRP_DTL | 3 |
| IAS_SUB_GRP_DTL | 3 |
| IAS_ASSISTANT_GROUP | 3 |
| IAS_DETAIL_GROUP | 3 |
| IAS_ALTERNATIVE_GROUP | 3 |
| IAS_GRP_ITM_LVL | 3 |
| POS_DFLT_STNG_MST | 2 |
| POS_DFLT_GRP_DTL | 2 |
| USER_R | 2 |
| DBMS_OUTPUT | 1 |
| PRIVILEGE_GC | 1 |
| USER | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `COLOR_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT COUNT(1) FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT COUNT(1) FROM POS_DFLT_STNG_DTL WHERE MACHINE_NO
DELETE FROM POS_DFLT_GRP_DTL WHERE STNG_NO = :b1 AND NVL(STNG_VAL,0) != :b2" PRE_FORM_PRC STANDARD /Lyserpdbalib SETUP_PKG /LPOSLIB GEN_PKG /NSPC10/LOAD_PARAMETERS /NSPC10/FILL_ALL_LIS
SELECT 1 VAL,Ias_Gen_Pkg.Get_prompt( ,153) DSC FROM DUAL
SELECT 2 VAL,Ias_Gen_Pkg.Get_prompt( ,3002) DSC FROM DUAL
SELECT 3 VAL,Ias_Gen_Pkg.Get_prompt( ,17666) DSC FROM DUAL
SELECT 4 VAL,Ias_Gen_Pkg.Get_prompt( ,346) DSC FROM DUAL
SELECT 5 VAL,Ias_Gen_Pkg.Get_prompt( ,6885) DSC FROM DUAL
SELECT 2 VAL,Ias_Gen_Pkg.Get_prompt( ,724) DSC FROM DUAL
SELECT 2 VAL,Ias_Gen_Pkg.Get_prompt( ,1655) DSC FROM DUAL
SELECT 3 VAL,Ias_Gen_Pkg.Get_prompt( ,1656) DSC FROM DUAL
SELECT 4 VAL,Ias_Gen_Pkg.Get_prompt( ,2216) DSC FROM DUAL
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSS005_strings.txt`.
