# POST003 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 433,956 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST003.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> استعراض الفواتير المعلقة 
>  نظام نقاط البيع > عمليات النظام > 
>  استعراض الفواتير المعلقة 
>  الاستخدام: 
>  تستخدم 
> الشاشة لاستعراض الفواتير المعلقة ومن ثم التأكد منها وبالتالي حذفها أو حذف جزء من 
> أصنافها، كما يمكن من خلال هذه الشاشة استعراض جميع 
> الفواتير المعلقة التي قد تم استعادتها وتدفيعها. 
>  طريقة استخدام الشاشة 
>  يتم 
> اختيار الفاتورة المعلقة المراد إنزالها باستخدام المفتاح Ctrl+3 أو بالنقر على زر استعراض 
> الفواتير المعلقة الموجود ضمن شريط الأدوات وبالتالي ستظهر البيانات 
> الرئيسية والتفصيلية للفاتورة المعلقة بمجرد اختيار الفاتورة المعلقة، وللتعامل مع 
> هذه الشاشة يمكن استخدام المفاتيح والأوامر 
> التالية: 
>  - 
>  : Shift+F8 يستخدم هذا 
> المفتاح لاستعراض جميع الفواتير المعلقة التي قد تم استعادتها، أو باستخدام زر 
> العرض في شريط الأدوات. 
>  - 
>  Ctrl+3 : يستخدم هذا 
> المفتاح لعرض جميع الفواتير المعلقة التي لم يتم تدفيعها، ويُسمح للمستخدم حذف 
> أصناف من الفاتورة أو إلغائها بشكل كامل عن طريق الزر Ctrl + 
> x . 
>  ملاحظة: 
>  في 
> حالة استخدام شاشة التدفيع النقدي للفواتير فإن النظام يعتبر أن جميع الفواتير 
> المعلقة تبقى معلقة ولا يمكن ترحيلها مالم يتم تدفيعها من شاشة التدفيع 
> النقدي. 
>  - 
>  Ctrl + X : يستخدم هذا 
> المفتاح للقيام بحذف الأصناف أو إلغاء الفاتورة بشكل كامل في حال حذف جميع الأصناف 
> أو باستخدام زر الحذف في شريط الأدوات. 
>  ملاحظة: 
>  يمكن 
> إجراء عملية الاستعراض للفواتير المعلقة واسترجاعها من شاشة فواتير المبيعات بنفس 
> الآلية. 
>  - 
>  بيانات 
> الفاتورة: 
>  بمجرد اختيار أي 
> فاتورة معلقة تظهر أصناف الفاتورة في البيانات التفصيلية كما يظهر في البيانات 
> الرئيسية تاريخ الفاتورة ورقمها والملاحظات التي تم تدوينها في فاتورة المبيعات عند 
> التعليق لمعرفة الفاتورة من خلال الملاحظات. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (11)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | IMMEDIATE |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_BILL_MST | DB | Q-U | AUTOMATIC |  |
| IAS_POS_BILL_DTL | DB | Q-U | DELAYED |  |
| DELITEM | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×22 | hidden |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN6 | STACKED | 294×110 | visible |
| CNV_PRNT | CONTENT | 242×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (6)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | false |
| MAIN6 | Delete Item | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (49)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `ADD_AFTR_TRG`, `DISPLAY_BILL_TOTAL`, `DISPLAY_RTNBILL_TOTAL`, `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (39)


**Procedures/Functions (39):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `AUD_ITM`, `CHANGE_CURR_PC`, `CHECK_PRICING_LEVEL`, `GET_ICODE_FOR_BARCODE`, `SET_MENUS`, `FIELD_POSITION`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `GET_ITEM_INFO`, `GET_PRICE_RATE`, `CALL_SCR_LNK_PRC`

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
| IAS_ITM_MST | 8 |
| USER_R | 6 |
| IAS_POS_MACHINE | 6 |
| IAS_POS_BILL_MST | 3 |
| IAS_ITM_UNT_BARCODE | 3 |
| CUSTOMER | 3 |
| IAS_PARA_POS | 2 |
| IAS_POS_AUD_ITEM | 2 |
| CASH_AT_BANK | 2 |
| CREDIT_CARD_TYPES | 2 |
| IAS_POS_RT_BILL_MST | 2 |
| PRIVILEGE_GC | 2 |
| PRIVILEGE_FIXED | 1 |
| S_BRN | 1 |
| IAS_ITM_WCODE | 1 |
| PRIV_ACC | 1 |
| IAS_PRIV_CUSTOMER | 1 |
| EX_RATE | 1 |
| PRIV_CASH | 1 |
| USER | 1 |
| SALE_SERIAL | 1 |
| IAS_POS_BILL_DTL | 1 |
| IAS_POS_PAY_BILLS | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `DATE_CNVRTR_PKG`, `YS_GEN_PKG`, `IAS_USR_PKG`, `IAS_ITM_PKG`, `POS_MNU_PKG`, `YS_SCR_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(USE_PAID,0),NVL(AUDIT_DEL_ITM,0),NVL(USE_VAT,0),COLLCT_RPT_ITM_PRNT,FTR_BILL,SHOW_AVLQTY_IN_BILL,PRD_BACK_HOUR,PRD_BACK_INCRS_TYP,PRD_BACK_INCRS_F_DATE,PRD_BACK_INCRS_T_DATE,USE_HUNG_BILLS,NVL(IAS_PARA_AR.NO_OF_DECIMAL_AR,2) FROM IAS_PARA_POS,IAS_PARA_GEN,IAS_PARA_AR
SELECT NUM_OF_DAYS_SHW_BILLS FROM IAS_PARA_POS
SELECT NVL(PRINT_PREV_BILL,0),NVL(ALLOW_HUNG_BILLS,0),NVL(ALLOW_DEL_ITM_FROM_POS_BILL,0) FROM PRIVILEGE_FIXED WHERE U_ID
SELECT NVL(BRN_LNAME,BRN_FNAME) FROM S_BRN WHERE BRN_NO
SELECT NVL(CONNECTION_TYPE,1) FROM USER_R WHERE U_ID
SELECT 1 FROM IAS_POS_MACHINE WHERE ROWNUM <= 1"SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT MACHINE_NO FROM USER_R WHERE U_ID
SELECT UPPER(TERMINAL) FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT 1 FROM IAS_POS_MACHINE WHERE UPPER(TERMINAL) = UPPER(:b1) AND ROWNUM <= 1"SELECT MACHINE_NO FROM IAS_POS_MACHINE WHERE UPPER
SELECT DEF_WCODE,REP_CODE,DEF_BRN_NO,USE_ATTCH_SCRN FROM IAS_POS_MACHINE WHERE UPPER
INSERT INTO IAS_POS_AUD_ITEM ( BILL_NO,BILL_TIME,A_CY,BILL_RATE,MACHINE_NO,I_CODE,P_SIZE,ITM_UNT,W_CODE,I_QTY,I_PRICE,BARCODE,AUD_U_ID,AUD_DATE,BRN_NO,BRN_YEAR,CMP_NO,BRN_USR,HUNG_BILL )
SELECT :b1,TO_CHAR(IAS_GEN_PKG.GET_CURDATE,''HH24:MI:SS''),:b2,:b3,:b4,:b5,:b6,:b7,:b8,:b9,:b10,:b11,:b12,IAS_GEN_PKG.GET_CURDATE,:b13,:b14,:b15,:b16,:b17 FROM DUAL
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST003_strings.txt`.
