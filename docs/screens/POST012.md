# POST012 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 338,564 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST012.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> ملخص مبيعات الكاشيرات 
>  نظام نقاط البيع > عمليات النظام > 
>  ملخص مبيعات الكاشيرات 
>  الاستخدام: 
>  تستخدم 
> الشاشة لعرض ملخص للمبيعات النقدية والآجلة وبطائق الائتمان (الشبكات) والمردودات 
> وجميع الخصومات الممنوحة ومبالغ الاستبدالات والمرتجعات التي تمت، وتعتبر هذه 
> الشاشة تقرير ملخص عن حركة البيع التي تمت على مستوى كل كاشير. 
>  طريقة استخدام الشاشة 
>  أولاً: البيانات الرئيسية 
>  - 
>  المستخدم: 
>  بعد الدخول إلى 
> الشاشة يتم استعراض بيانات المستخدمين عن طريق الزر (عرض) واختيار المستخدم 
> (الكاشير) المطلوب عرض ملخص بيانات نقطة البيع الخاص به. 
>  - 
>  العملة: 
>  يستخدم هذا الحقل 
> لتحديد العملة حيث يتم عرض البيانات حسب العملة المختارة. 
>  - 
>  من 
> تاريخ – 
> إلى تاريخ: من خلال حقول 
> التاريخ يتم عرض البيانات حسب الفترة المحددة في هذه 
> الحقول. 
>  - 
>  تاريخ 
> ووقت الإضافة: تستخدم 
> هذه الحقول لفلترة البيانات حسب القيم المدخلة فيها. 
>  ثانياً: البيانات التفصيلية 
>  - 
>  يتم 
>  عرض تفاصيل عامة 
> لحركة هذا المستخدم (الكاشير) خلال الفترة المحددة للاطلاع عليها، كما يتم عرض صافي 
> (المبيعات النقدية/ المبيعات الآجلة/ مبيعات بطائق الائتمان) وعرض إجمالي المقبوضات 
> والمصروفات. 
>  - 
>  تصدير 
> إلى ملف إكسل: 
>  بالنقر على زر الإكسل في شريط الأدوات يمكن تصدير هذه البيانات 
> إلى ملف إكسل. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (10)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| USER_R | DB | QIU | AUTOMATIC | WHERE:User_Type In (1,3); ORDER:U_Id |
| BLK_INFO | ctrl | QIU | AUTOMATIC |  |
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
| CNV_PRNT | CONTENT | 302×122 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (33)


**Procedures/Functions (33):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `GET_FLD_TXT`, `GET_USER_INFO`, `FORMS_TO_EXCEL_OLD`, `FORMS_TO_EXCEL`, `CALL_SCR_LNK_PRC`, `GET_DATE_WRK_SHFT`

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
| POS_WRK_SHFT_CSHR | 7 |
| USER_R | 5 |
| IAS_POS_BILL_MST | 3 |
| IAS_POS_HST_BILL_MST | 3 |
| IAS_POS_RT_BILL_MST | 3 |
| IAS_POS_HST_RT_BILL_MST | 3 |
| IAS_POS_PAY_BILLS | 2 |
| POS_GNR_RCPTS | 2 |
| IAS_PARA_POS | 1 |
| EX_RATE | 1 |
| S_FLAGS_PRIV | 1 |
| POS_RT_BILL_MST_ALL_VW | 1 |
| IAS_POS_PAY_CASH | 1 |
| POS_GNR_EXPNS | 1 |
| IAS_POS_FNL_DATA_ALL | 1 |
| TIME | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_USR_PKG`, `DATE_CNVRTR_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `POS_WRK_SHFT_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`, `IAS_PRMTR_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(USE_PAY_CASH_RT_BILLS,0),NVL(IAS_PARA_AR.NO_OF_DECIMAL_AR,2),USE_WRK_SHFT,USE_CLC_TAX_FREE_QTY FROM IAS_PARA_POS,IAS_PARA_AR
Select Cur_Code ||'- '||Nvl(Cur_Name,Cur_E_Name), To_Char(Cur_Code) From Ex_Rate
SELECT PRIV_FLAG FROM S_FLAGS_PRIV WHERE U_ID
SELECT SHFT_SRL FROM POS_WRK_SHFT_CSHR WHERE SHFT_NO
SELECT (NVL(SUM(NVL(CR_CARD_AMT,0)),0) + NVL(SUM(NVL(CR_CARD_AMT_SCND,0)),0) + NVL(SUM(NVL(CR_CARD_AMT_THRD,0)),0) ),SUM(DECODE(BILL_TYPE,1,NVL(NVL(CR_CARD_AMT,0),0) + NVL(NVL(CR_CARD_AMT_SCND,0),0) + NVL(NVL(CR_CARD_AMT_THRD,0),0) ,0)),SUM(DECODE(BILL_TYPE,4,NVL(DISC_AMT,0) + NVL(DISC_AMT_AFTR_VAT,0) ,0)) FROM IAS_POS_BILL_MST WHERE BILL_TYPE IN
SELECT (NVL(SUM(NVL(CR_CARD_AMT,0)),0) + NVL(SUM(NVL(CR_CARD_AMT_SCND,0)),0) + NVL(SUM(NVL(CR_CARD_AMT_THRD,0)),0) ),SUM(DECODE(BILL_TYPE,1,NVL(NVL(CR_CARD_AMT,0),0) + NVL(NVL(CR_CARD_AMT_SCND,0),0) + NVL(NVL(CR_CARD_AMT_THRD,0),0) ,0)),SUM(DECODE(BILL_TYPE,4,NVL(DISC_AMT,0) + NVL(DISC_AMT_AFTR_VAT,0) ,0)) FROM IAS_POS_HST_BILL_MST WHERE BILL_TYPE IN
SELECT (NVL(SUM(NVL(CR_CARD_AMT,0)),0) + NVL(SUM(NVL(CR_CARD_AMT_SCND,0)),0) + NVL(SUM(NVL(CR_CARD_AMT_THRD,0)),0) ),SUM(DECODE(RT_BILL_TYPE,1,NVL(NVL(CR_CARD_AMT,0),0) + NVL(NVL(CR_CARD_AMT_SCND,0),0) + NVL(NVL(CR_CARD_AMT_THRD,0),0) ,0)),SUM(DECODE(RT_BILL_TYPE,4,NVL(DISC_AMT,0) + NVL(DISC_AMT_AFTR_VAT,0) ,0)) FROM POS_RT_BILL_MST_ALL_VW WHERE RT_BILL_TYPE IN
SELECT NVL(SUM(NVL(I_PRICE * I_QTY ,0)),0) + SUM(((NVL(I_QTY,0) + (NVL(FREE_QTY,0) * NVL(M.CLC_TAX_FREE_QTY_FLG,0) ) ) * NVL(D.VAT_AMT,0) )) ,NVL(SUM((NVL(D.DIS_AMT,0) + NVL(D.DIS_AFTR_VAT_MST,0) ) * I_QTY ),0) FROM IAS_POS_BILL_MST M,IAS_POS_BILL_DTL D WHERE M
SELECT NVL(SUM(NVL(I_PRICE * I_QTY ,0)),0) + SUM(((NVL(I_QTY,0) + (NVL(FREE_QTY,0) * NVL(M.CLC_TAX_FREE_QTY_FLG,0) ) ) * NVL(D.VAT_AMT,0) )) ,NVL(SUM((NVL(D.DIS_AMT,0) + NVL(D.DIS_AFTR_VAT_MST,0) ) * I_QTY ),0) FROM IAS_POS_HST_BILL_MST M,IAS_POS_HST_BILL_DTL D WHERE M
SELECT NVL(SUM(NVL(I_PRICE * I_QTY ,0)),0) + SUM(((NVL(I_QTY,0) + (NVL(FREE_QTY,0) * NVL(M.CLC_TAX_FREE_QTY_FLG,0) ) ) * NVL(D.VAT_AMT,0) )) ,NVL(SUM((NVL(D.DIS_AMT,0) + NVL(D.DIS_AFTR_VAT_MST,0) ) * I_QTY ),0) FROM IAS_POS_RT_BILL_MST M,IAS_POS_RT_BILL_DTL D WHERE M
SELECT NVL(SUM(NVL(I_PRICE * I_QTY ,0)),0) + SUM(((NVL(I_QTY,0) + (NVL(FREE_QTY,0) * NVL(M.CLC_TAX_FREE_QTY_FLG,0) ) ) * NVL(D.VAT_AMT,0) )) ,NVL(SUM((NVL(D.DIS_AMT,0) + NVL(D.DIS_AFTR_VAT_MST,0) ) * I_QTY ),0) FROM IAS_POS_HST_RT_BILL_MST M,IAS_POS_HST_RT_BILL_DTL D WHERE M
SELECT SUM(NVL(RT_BILL_AMT,0) + NVL(VAT_AMT,0) - NVL(DISC_AMT,0) ) FROM IAS_POS_PAY_CASH WHERE A_CY
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST012_strings.txt`.
