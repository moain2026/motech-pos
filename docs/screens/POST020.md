# POST020 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 402,220 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST020.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> ربط الفاتورة بعميل نقاطي 
>  نظام نقاط البيع > عمليات النظام > 
>  ربط الفاتورة بعميل نقاطي 
>  الاستخدام: 
>  تستخدم 
> الشاشة من أجل ربط عميل نقاطي بفاتورة مبيعات معينة لم يتم ربطه بها بموجب فاتورة 
> المبيعات عن طريق الكاشير وذلك من أجل إضافة نقاط جديدة له واحتسابها في برنامج 
> النقاط. 
>  طريقة استخدام الشاشة 
>  تظهر الشاشة في حالة الإضافة وسيتم شرحها على النحو 
> التالي: 
>  - 
>  رقم 
> الفاتورة: في هذا الحقل 
> يتم إدخال رقم الفاتورة. 
>  - 
>  تاريخ 
> الفاتورة/ الوقت/ العملة/ سعر التحويل: بيانات هذه 
> الحقول تظهر آلياً بمجرد إدخال رقم الفاتورة والنقر على ENTER في لوحة المفاتيح. 
>  - 
>  البيانات 
> التفصيلية: 
> تظهر البيانات التفصيلية - الأصناف التي تم بيعها للعميل - بعد اختيار رقم 
> الفاتورة. 
>  - 
>  رقم 
> الجوال/ رقم العميل/ اسم العميل: 
> يتم إدخال العميل الذي سيتم احتساب نقاط له على الفاتورة المحددة، حيث يتم إدخال 
> إما رقم العميل أو رقم الجوال وستظهر باقي الحقول آلياً. 
>  - 
>  عدد 
> النقاط: تظهر عدد النقاط 
> التي سيتم احتسابها للعميل على الفاتورة المحددة. 
>  - 
>  حفظ: يتم 
> حفظ البيانات بواسطة وسائل الحفظ 
> المتاحة. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (10)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | IMMEDIATE |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_BILL_MST | DB | QIU | AUTOMATIC |  |
| IAS_POS_BILL_DTL | DB | QIU | DELAYED |  |
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
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (48)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `DISPLAY_BILL_TOTAL`, `DISPLAY_RTNBILL_TOTAL`, `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (41)

**Packages (spec):** `POINT_PKG`


**Packages (body):** `POINT_PKG`


**Procedures/Functions (39):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `AUD_ITM`, `CHANGE_CURR_PC`, `CHECK_BILL_DOC_TYPE`, `CHECK_PRICING_LEVEL`, `SET_MENUS`, `FIELD_POSITION`, `SHOW_DATA`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `CHECK_DB_BRANCH`, `CALL_SCR_LNK_PRC`

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
| USER_R | 6 |
| IAS_POS_MACHINE | 6 |
| IAS_POS_BILL_MST | 5 |
| IAS_ITM_MST | 5 |
| IAS_CASH_CUSTMR | 4 |
| IAS_ITM_DTL | 3 |
| IAS_POINT_TYP_MST | 2 |
| IAS_PARA_POS | 2 |
| IAS_POS_AUD_ITEM | 2 |
| IAS_ITEM_PRICE | 2 |
| CUSTOMER | 2 |
| CASH_AT_BANK | 2 |
| CREDIT_CARD_TYPES | 2 |
| IAS_POS_RT_BILL_MST | 2 |
| PRIVILEGE_GC | 2 |
| PRIVILEGE_FIXED | 1 |
| S_BRN | 1 |
| IAS_SYS | 1 |
| S_FLAGS_PRIV | 1 |
| DBA_SNAPSHOTS | 1 |
| POS_POINT_CALC_TRNS | 1 |
| PRIV_ACC | 1 |
| IAS_PRIV_CUSTOMER | 1 |
| EX_RATE | 1 |
| PRIV_CASH | 1 |
| USER | 1 |
| IAS_POS_BILL_DTL | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `POS_POINT_PKG`, `IAS_GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `POINT_PKG`, `IAS_ITM_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select Point_Typ_No||'-'||Nvl(Typ_l_Nm,Typ_f_Nm) Typ_Nm, To_Char(Point_Typ_No) Point_Typ_No From Ias_Point_Typ_Mst
SELECT NVL(USE_PAID,0),NVL(AUDIT_DEL_ITM,0),NVL(USE_VAT,0),COLLCT_RPT_ITM_PRNT,FTR_BILL,SHOW_AVLQTY_IN_BILL,USE_POS_POINT_SYS,IAS_PARA_AR.POINT_CALC_TYP,IAS_PARA_AR.POINT_AGE_EXPIRED_PRD,IAS_PARA_AR.POINT_AGE_EXPIRED_TYP FROM IAS_PARA_POS,IAS_PARA_AR,IAS_PARA_GEN
SELECT NVL(PRINT_PREV_BILL,0),NVL(ALLOW_HUNG_BILLS,0) FROM PRIVILEGE_FIXED WHERE U_ID
SELECT NVL(BRN_LNAME,BRN_FNAME) FROM S_BRN WHERE BRN_NO
SELECT NVL(CONNECTION_TYPE,1) FROM USER_R WHERE U_ID
SELECT 1 FROM IAS_POS_MACHINE WHERE ROWNUM <= 1"SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT MACHINE_NO FROM USER_R WHERE U_ID
SELECT UPPER(TERMINAL) FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT 1 FROM IAS_POS_MACHINE WHERE UPPER(TERMINAL) = UPPER(:b1) AND ROWNUM <= 1"SELECT MACHINE_NO FROM IAS_POS_MACHINE WHERE UPPER
SELECT DEF_WCODE,REP_CODE,DEF_BRN_NO FROM IAS_POS_MACHINE WHERE UPPER
SELECT SERVER_NO FROM IAS_SYS
UPDATE IAS_CASH_CUSTMR SET FIRST_DEAL_DATE=:b1 WHERE CUST_CODE = :b2 AND FIRST_DEAL_DATE IS NULL" PRE_FORM_PRC STANDARD /Lyserpdbalib SETUP_PKG /LPOSLIB GEN_PKG /NSPC5/LOAD_PARAMETERS /NSPC5/FILL_ALL_LIST_PRC /NSPC5/SET_POS_PR
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST020_strings.txt`.
