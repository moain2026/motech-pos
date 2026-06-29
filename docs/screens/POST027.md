# POST027 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 349,156 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST027.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> ورديات العمل 
>  نظام نقاط البيع > عمليات النظام > 
>  ورديات العمل 
>  الاستخدام: 
>  تظهر 
> الشاشة إذا تم تفعيل متغير (استخدام ورديات العمل) في شاشة متغيرات نظام نقاط 
> البيع، وتستخدم لربط المستخدم بالورديات سواءً من قائمة الورديات المعرفة في تبويب 
> الورديات في متغيرات النظام أو يتم ربطه بوردية متغيرة، يتم إغلاق الورديات بمجرد 
> تصفية مبيعات الكاشيرات، مع العلم أنه يمكن إغلاق الوردية بالنقر على زر (إغلاق) في 
> شريط الأدوات بشرط عدم تفعيل المتغير (عدم السماح بالبيع في حالة عدم تصفية 
> المبيعات). 
>  طريقة 
> استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر إضافة على النحو 
> التالي: 
>  أولاً: البيانات الرئيسية 
>  - 
>  رقم 
> الوردية: يولد النظام رقم 
> تسلسلي آلي للوردية مجرد النقر على زر إضافة. 
>  - 
>  رقم 
> الفرع: يعرض النظام 
> الفرع الذي دخل فيه المستخدم آلياً قابل للتعديل إذا كان للمستخدم صلاحية التعامل 
> مع الفروع. 
>  - 
>  رقم 
> الكاشير: يعرض النظام رقم 
> الكاشير المرتبط بالمستخدم الداخل في النظام آلياً قابل للتعديل إلى مستخدم 
> آخر. 
>  - 
>  كود 
> الوردية: يعرض النظام كود 
> الوردية آلياً بالنسبة للورديات المعرفة، أما المتغيرة فيتم تسجيل الكود يدوياً. 
>  - 
>  الوصف: يعرض 
> النظام الوصف آلياً من واقع شاشة تعريف الورديات في تبويب الورديات (شاشة متغيرات 
> وإعدادات نقاط البيع) بالنسبة للورديات المعرفة، أما المتغيرة فيتم تسجيل الوصف 
> يدوياً. 
>  - 
>  من 
> الوقت: يعرض النظام وقت 
> بداية الوردية متضمناً (فترة السماح قبل) آلياً بالنسبة للورديات المعرفة من واقع 
> شاشة تعريف الورديات في تبويب الورديات (شاشة متغيرات وإعدادات نقاط البيع)، أما 
> المتغيرة فيعرض النظام وقت دخول المستخدم إلى الشاشة كوقت لبداية 
> الوردية. 
>  - 
>  إلى 
> الوقت: يعرض النظام وقت 
> نهاية الوردية متضمناً (فترة السماح بعد) آلياً بالنسبة للورديات المعرفة من واقع 
> شاشة تعريف الورديات في تبويب الورديات، أما المتغيرة يعرض الحقل فارغاً كون 
> الوردية المتغيرة غير محددة بوقت معين. 
>  - 
>  من 
> تاريخ: يعرض النظام 
> التاريخ آلياً بالنسبة للورديات المعرفة من واقع شاشة تعريف ا

## 2. Data Blocks (10)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| POS_WRK_SHFT_CSHR | DB | QIU | DELAYED |  |
| POS_FNCL_ADVNC_CSHR | DB | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×566 | visible |
| MAIN1 | TAB | ?×? | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (35)


**Procedures/Functions (35):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_DB_BRANCH`, `CALL_SCR_LNK_PRC`, `GET_POS_CUR_RATE_FNC`, `GET_SHFT_INFO`, `SET_ALRT_CHK_DATA_PRPRTY_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`

## 7. مكتبات مرفقة (4)

`YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`, `POSLIB`

## 8. Alerts (7)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| CLOSE_SHFT | اغلاق الوردية | WARNING | نعم |
| ALT_CHK_DATA | Pos | WARNING | OK |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| POS_WRK_SHFT_CSHR | 11 |
| USER_R | 10 |
| POS_WRK_SHFT | 6 |
| IAS_SHW_DOC_PRIV | 3 |
| IAS_POS_MACHINE | 3 |
| TIME | 3 |
| POS_FNCL_ADVNC_CSHR | 2 |
| IAS_POS_BILL_MST | 2 |
| IAS_POS_FNL_DATA_ALL | 2 |
| EX_RATE | 2 |
| IAS_CURRENCY_VALUE | 2 |
| USER | 2 |
| IAS_PARA_POS | 1 |
| PRIVILEGE_FIXED | 1 |
| DBA_SNAPSHOTS | 1 |
| GLS_CRNCY_USR_LMT | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_USR_PKG`, `DATE_CNVRTR_PKG`, `YS_GEN_PKG`, `IAS_BRN_PKG`, `YS_SCR_PKG`, `POS_WRK_SHFT_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(MAX(TO_NUMBER(SHFT_NO)),0) + 1 FROM POS_WRK_SHFT_CSHR
SELECT DECODE(:b1,1,SHFT_DSC,SHFT_DSC_F) FROM POS_WRK_SHFT WHERE SHFT_CODE
SELECT 1 FROM POS_WRK_SHFT_CSHR WHERE SHFT_CODE = :b1 AND CSHR_NO = :b2 AND OPN_DATE = TO_DATE(:b3,''DD/MM/YYYY'') AND ROWNUM <= 1"SELECT 1 FROM POS_WRK_SHFT_CSHR WHERE SHFT_CODE
select 1 from ias_pos_bill_mst where RowNum<=1 And Shft_srl= IAS_GEN_PKGYSPOS35GET_CNTIAS IAS_GEN_PKG select 1 from IAS_POS_FNL_DATA_ALL where Doc_type
SELECT 1 FROM IAS_SHW_DOC_PRIV
SELECT NVL(USE_WRK_SHFT,0),NVL(WRK_SHFT_TYP,0),NVL(OPN_SHFT_TYP,0) FROM IAS_PARA_POS WHERE ROWNUM
SELECT USER_VIEW_DOC_ENTR FROM PRIVILEGE_FIXED WHERE U_ID
SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT 1 FROM IAS_POS_MACHINE WHERE UPPER(TERMINAL) = UPPER(:b1) AND ROWNUM <= 1"SELECT MACHINE_NO FROM IAS_POS_MACHINE WHERE UPPER
SELECT CASH_NO FROM USER_R WHERE U_ID = :b1"SELECT CASH_NO_CNCT FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT CUR_RATE FROM GLS_CRNCY_USR_LMT WHERE CUR_CODE
SELECT CUR_RATE_POS FROM EX_RATE WHERE CUR_CODE
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST027_strings.txt`.
