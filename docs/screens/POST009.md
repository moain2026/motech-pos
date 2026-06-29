# POST009 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 214,712 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST009.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> معلومات الآلات ( نقطة البيع ) 
>  نظام نقاط البيع > عمليات النظام > 
>  معلومات الآلات ( نقطة البيع ) 
>  الاستخدام: 
> تستخدم الشاشة لعرض معلومات أو تقرير عن الآلات كاسم الآلة واسم المخزن الافتراضي 
> المرتبط بها وتاريخ آخر فاتورة ورقمها وكذلك المردودات وصافي المبيعات وغيرها من 
> المعلومات. 
>  طريقة استخدام الشاشة 
>  تظهر البيانات في هذه الشاشة بمجرد فتحها حيث يتم فيها عرض معلومات عن كل 
> نقطة بيع تستخدم لتقييم الكاشيرات من قبل الإدارة من خلال البنود إجمالي قيمة 
> المبيعات وقيمة المردودات وصافي المبيعات، مع إمكانية تصدير هذه المعلومات إلى ملف 
> إكسل بالنقر على زر (الإكسل) في شريط 
> الأدوات. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (9)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| BLK_OPTIONS | ctrl | QIU | AUTOMATIC |  |
| IAS_POS_MACHINE | DB | QIU | AUTOMATIC | ORDER:Machine_No |
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
| MAIN1 | STACKED | 990×338 | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (4)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (45)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (33)


**Procedures/Functions (33):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `GET_BILL_USER`, `GET_MACHINE_INFO`, `GET_RT_BILL_USER`, `PRINT_FROM_SCR_PRC`, `FORMS_TO_EXCEL`, `CALL_SCR_LNK_PRC`

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
| USER_R | 4 |
| IAS_POS_BILL_MST | 3 |
| IAS_POS_RT_BILL_MST | 3 |
| IAS_POS_MACHINE | 2 |
| WAREHOUSE_DETAILS | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_USR_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT DECODE(:b1,1,NVL(U_A_NAME,U_E_NAME),NVL(U_E_NAME,U_A_NAME)) FROM USER_R WHERE U_ID
SELECT NVL(BRN_MACHINE_NO,TERMINAL),DEF_WCODE FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT DECODE(:b1,1,NVL(W_NAME,W_E_NAME),NVL(W_E_NAME,W_NAME)) FROM WAREHOUSE_DETAILS WHERE W_CODE
SELECT MAX(BILL_DATE),MAX(BILL_NO) FROM IAS_POS_BILL_MST WHERE MACHINE_NO
SELECT SUM(NVL(BILL_AMT,0) + NVL(VAT_AMT,0) - NVL(DISC_AMT,0) ) FROM IAS_POS_BILL_MST WHERE MACHINE_NO
SELECT MAX(RT_BILL_DATE),MAX(RT_BILL_NO) FROM IAS_POS_RT_BILL_MST WHERE MACHINE_NO
SELECT SUM(NVL(RT_BILL_AMT,0) + NVL(VAT_AMT,0) - NVL(DISC_AMT,0) ) FROM IAS_POS_RT_BILL_MST WHERE MACHINE_NO
SELECT AD_U_ID FROM IAS_POS_BILL_MST WHERE BILL_NO = :b1"SELECT AD_U_ID FROM IAS_POS_RT_BILL_MST WHERE RT_BILL_NO
SELECT PASSWORD FROM USER_R WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST009_strings.txt`.
