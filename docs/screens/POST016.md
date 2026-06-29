# POST016 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 322,524 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST016.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> قارئ الأسعار 
>  نظام نقاط البيع > عمليات النظام > 
>  قارئ الأسعار 
>  الاستخدام: 
>  تستخدم 
> الشاشة لعرض تسعيرة الأصناف وصورة الصنف إن وجدت، وذلك نظراً لكثرة استعلام الزبائن 
> عن أسعار المنتجات ففي بعض المنشآت كالمولات قد توفر شاشات للعرض يستخدمها العملاء 
> يمكنهم من خلالها الاستعلام عن سعر أي صنف من الأصناف. 
>  طريقة استخدام الشاشة 
>  يتم 
> قراءة رقم الصنف أو رقم الباركود أو إدخاله يدوياً في حقل رقم الصنف حيث يتم عرض 
> بقية البيانات مباشرة مع السعر الحالي للصنف بعد النقر Enter ، وتختفي البيانات آلياً بعد مرور برهة من 
> الوقت، كما يمكن مسح بيانات الشاشة عن طريق زر الحذف في شريط الأدوات أو باستخدام 
> قارئ الباركود لقراءة باركود صنف آخر. 
>  ملاحظة: 
> يتم عرض العروض الترويجية للصنف إذا كان الصنف الذي يتم عرضه في قارئ الأسعار له 
> عرض ترويجي. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (10)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_POS_ITM_PRICE | DB | QIU | AUTOMATIC | ORDER:P_SIZE |
| POS_ADS_IMG_DSPLY | DB | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| CLNDR | ctrl | QIU | DELAYED |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (9) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | STACKED | 776×255 | visible |
| MAIN2 | STACKED | 636×258 | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (5)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-LOGON`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (41)

**Packages (spec):** `SHW_IMG_PKG`


**Packages (body):** `SHW_IMG_PKG`


**Procedures/Functions (39):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_PRIV_GC`, `GET_ICODE_FOR_BARCODE`, `GET_ITEM_INFO`, `GET_PRICE_RATE`, `LIST_LOV`, `CLEAR_PROC`, `GET_SALESDISC_ITEM`, `READ_AUTO_ITEM_PRICE`, `GET_PRM_PRICE_PRC`, `SHOW_DATA_PRC`, `CALL_SCR_LNK_PRC`, `CREATE_TIMER_PRC`

## 7. مكتبات مرفقة (5)

`POSLIB`, `YSERPDBALIB`, `D2KCOMN`, `D2KWUTIL`, `YSERPDBA2LIB`

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
| IAS_ITM_MST | 9 |
| IAS_POS_MACHINE | 6 |
| EX_RATE | 5 |
| USER_R | 4 |
| PRIVILEGE_GC | 4 |
| IAS_ITM_DTL | 4 |
| IAS_PARA_GEN | 2 |
| IAS_PARA_POS | 2 |
| IAS_QUT_PRM_MST | 2 |
| S_BRN | 2 |
| IAS_ITM_WCODE | 1 |
| IAS_PRICING_LEVELS | 1 |
| WAREHOUSE_DETAILS | 1 |
| IAS_POS_BILL_DTL | 1 |
| IAS_POS_HST_BILL_DTL | 1 |
| IAS_POS_HUNG_BILLS | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_ITM_PKG`, `IAS_USR_PKG`, `YS_TAX_PKG`, `SHW_IMG_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `SECURITY_PKG`, `SETUP_PKG`, `IAS_PRMTR_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT CUR_CODE FROM EX_RATE WHERE L_F
SELECT CUR_CODE FROM EX_RATE WHERE STOCK_CUR
SELECT USE_PRICE_INCLUDE_VAT FROM IAS_PARA_GEN
SELECT ROUND_DISC_PER_ITM_TYP,POS_PRICING_TYPE,USE_BARCODE_ONLY,USE_F9_KEY_TO_VIEW_ITM,CURR_DFLT,SHW_ALL_ITM_UNT_IN_PRC_READER FROM IAS_PARA_POS
SELECT NVL(CONNECTION_TYPE,1) FROM USER_R WHERE U_ID
SELECT 1 FROM IAS_POS_MACHINE WHERE ROWNUM <= 1"SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT MACHINE_NO FROM USER_R WHERE U_ID
SELECT UPPER(TERMINAL) FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT 1 FROM IAS_POS_MACHINE WHERE UPPER(TERMINAL) = UPPER(:b1) AND ROWNUM <= 1"SELECT MACHINE_NO FROM IAS_POS_MACHINE WHERE UPPER
SELECT DEF_WCODE,DEF_BRN_NO,CURR_DFLT,CLC_TYP_NO_TAX,USE_VAT FROM IAS_POS_MACHINE WHERE MACHINE_NO
SELECT PRICE_LEVEL FROM IAS_PARA_POS
SELECT PRICE_LEVEL FROM IAS_POS_MACHINE WHERE MACHINE_NO
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST016_strings.txt`.
