# POST006 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 387,668 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST006.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> الدفع النقدي للمرتجعات 
>  نظام نقاط البيع > عمليات النظام > 
>  الدفع النقدي للمرتجعات 
>  الاستخدام: 
> تستخدم الشاشة لتسجيل المدفوعات النقدية للمرتجعات والاستبدالات، ويتم استخراج 
> وثيقة كسند إرجاع (صرف) ليتم استلام المبلغ من الصندوق أو من إي كاشر، وهي شاشة يتم 
> ترحيلها ولها تأثيرات محاسبية. 
>  ولتفعيل 
> هذه الشاشة وربط حساباتها التي ستتأثر بعملياتها عند الترحيل يتم استخدام المتغير 
> (استخدام الدفع النقدي للمرتجعات والاستبدالات) في شاشة إعدادات نقاط البيع، وكذلك 
> إدخال حساب وسيط المرتجعات والاستبدالات في الحسابات الوسيطة أو صندوق الاستبدال في 
> شاشة المتغيرات، الفائدة منه عند إجراء عملية الاستبدال أو الإرجاع تكون مقيد لهذا 
> الحساب، ولا تقيد لحساب الكاش ي رات 
> إلا في حالة دفع المبلغ نقداً دون استخدام هذه 
> الشاشة. 
>  للتمييز بين عملية الاستبدال والإرجاع نذكر الخطوات التي تتم في 
> العمليتين: 
>  أولاً: الاستبدال 
>  عملية الاستبدال 
> تمر بالخطوات التالية: 
>  - 
>  بعد 
> إرجاع البضاعة في قسم 
> المرتجعات يقوم مسئول المرتجعات بإعطاء العميل فاتورة مردود بقيمة البضاعة 
> المرتجعة. 
>  - 
>  يقوم 
> العميل باستبدال القطعة بقطعة أخرى ومن ثم التوجه إلى الكاشير. 
>  - 
>  يقوم 
> العميل بإبراز فاتورة المردود 
> للكاشير والذي من خلالها يقوم الكاشير بتسديد قيمة البضاعة المستبدلة بعمل فاتورة 
> مبيعات جديدة ومن خلال شاشة التدفيع يتم إدخال رقم المردود والتدفيع بقيمة مبلغ 
> المردود. 
>  - 
>  يتم 
> الاحتفاظ بفاتورة المردود من 
> قبل الكاشير لغرض المطابقة نهاية الوردية. 
>  ثانياً: المرتجعات 
>  عملية المرتجعات 
> تمر بالخطوات التالية: 
>  - 
>  بعد 
> إرجاع البضاعة في قسم المرتجعات 
> يقوم مسئول المرتجعات بإعطاء العميل فاتورة مردود بقيمة البضاعة 
> المرتجعة. 
>  - 
>  يقوم 
> العميل بأخذ فاتورة المردود 
> والتوجه إلى مسئول المرتجعات النقدية ليقوم بعمل سند صرف نقدي من شاشة الدفع النقدي 
> للمرتجعات النقدية ويعطى هذا السند للعميل. 
>  - 
>  يتوجه 
> العميل إلى أي نقطة 
> كاشير ويسلمه السند ويقوم الكاشير بأخذ السند وإعادة المبلغ للعميل ويتم الاحتفاظ 
> بالسند من قبل الكاش

## 2. Data Blocks (10)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_PAY_CASH | DB | QIU | AUTOMATIC |  |
| MAIN_CALC_BLK | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (7) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`, `SAVE_PROC`

## 6. Program Units (38)

**Packages (spec):** `SCRN_TOUCH_PKG`


**Packages (body):** `SCRN_TOUCH_PKG`


**Procedures/Functions (36):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_DB_BRANCH`, `GET_DB_LINK_NM`, `WHEN_NEW_FORM_INSTANCE_PRC1`, `GET_DATE_DLY_INCRS_PRC`, `CHECK_PERIOD_RETURN`, `CHK_PYD_RTBILL_LCL_SRVR_PRC`, `CALL_SCR_LNK_PRC`, `SET_MNDTRY_FLD_PRC`, `CHK_MNDTRY_FLD_PRC`

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
| IAS_POS_MACHINE | 15 |
| IAS_POS_PAY_CASH | 7 |
| USER_R | 7 |
| IAS_POS_RT_BILL_MST | 6 |
| IAS_POS_HST_RT_BILL_MST | 6 |
| IAS_PARA_POS | 4 |
| IAS_POS_SERVER_DB_LINK | 2 |
| S_BRN_USR_PRIV | 2 |
| IAS_POS_PAY_BILLS | 2 |
| IAS_POS_BILL_MST | 2 |
| IAS_POS_HST_BILL_MST | 2 |
| IAS_MNDTRY_SCR_FIELDS | 2 |
| S_BRN | 1 |
| POS_DFLT_STNG_DTL | 1 |
| POS_DFLT_STNG_MST | 1 |
| DBA_SNAPSHOTS | 1 |
| USER | 1 |
| IAS_POS_RT_BILL_DTL | 1 |
| IAS_POS_HST_RT_BILL_DTL | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `SCRN_TOUCH_PKG`, `DATE_CNVRTR_PKG`, `IAS_POS_DISTIBUTED_DB_PKG`, `IAS_USR_PKG`, `POS_GNR_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT MAX(RET_VOUCHER_NO) + 1 FROM IAS_POS_PAY_CASH WHERE MACHINE_NO
SELECT 1 FROM IAS_POS_PAY_CASH WHERE RT_BILL_NO = :b1 AND ROWNUM <= 1"SELECT MAX(RET_VOUCHER_NO) + 1 FROM IAS_POS_PAY_CASH WHERE MACHINE_NO
Select Server_No||'-'||Nvl(Db_Link_Desc,Server_Nm) Server_Name, Db_Link_Nm From Ias_Pos_Server_Db_Link
Select Brn_no||'-'||Decode( ,1,Nvl(BRN_LNAME,BRN_FNAME), Nvl(BRN_FNAME,BRN_LNAME))BRN_NAME,To_Char(Brn_no) Brn_no From S_Brn
SELECT PRD_BACK_HOUR,USE_POS_POINT_SYS,PRD_BACK_INCRS_TYP,PRD_BACK_INCRS_F_DATE,PRD_BACK_INCRS_T_DATE,PRINT_BILL,NVL(IAS_PARA_AR.NO_OF_DECIMAL_AR,2),RETURN_CHANGE_TYPE,USE_BALANCED_BRN,USE_PAY_CASH_RT_BILLS FROM IAS_PARA_POS,IAS_PARA_AR,IAS_PARA_GEN
SELECT RTRN_PYD_CSH_IN_OTHR_RTSAL_BRN FROM IAS_PARA_POS
SELECT NVL(CONNECTION_TYPE,1) FROM USER_R WHERE U_ID
SELECT 1 FROM IAS_POS_MACHINE WHERE ROWNUM <= 1"SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT MACHINE_NO FROM USER_R WHERE U_ID
SELECT UPPER(TERMINAL) FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT 1 FROM IAS_POS_MACHINE WHERE UPPER(TERMINAL) = UPPER(:b1) AND ROWNUM <= 1"SELECT MACHINE_NO FROM IAS_POS_MACHINE WHERE UPPER
SELECT RETURN_PERIOD FROM IAS_PARA_POS
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST006_strings.txt`.
