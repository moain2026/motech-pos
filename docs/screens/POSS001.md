# POSS001 — توثيق شاشة Onyx Pro POS

> النوع: **POSS** — إعدادات/نظام (Settings/System)  
> الحجم: 560,204 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSS001.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> متغيرات وإعدادات نقاط البيع 
>  نظام نقاط البيع > تهيئة النظام > 
>  متغيرات وإعدادات نقاط البيع 
>  الاستخدام: 
>  يقصد 
> بإعدادات نقاط البيع مجموعة المتغيرات والمحددات العامة التي من شأنها تهيئة وتكييف 
> نظام نقاط البيع بما يتوافق والسياسات التي تتبناها المنشأة عند مزاولة أنشطتها 
> والتي يجب على المستخدم توخي الدقة عند 
> التعامل مع تلك المتغيرات كونها توجه النظام لتحقيق متطلبات وسياسات وأهداف إدارة 
> المنشأة . 
>  طريقة استخدام الشاشة 
>  يتم استخدام الشاشة بعد النقر على زر تعديل ومن ثم يتم تفعيل الخيارات 
> المناسبة للمنشأة كما يلي: 
>  أولاً: المتغيرات 
>  - 
>  عدد 
> خانات رقم المستخدم: يتم تحديد عدد 
> خانات رقم المستخدم التي 
> تظهر كجزء من رقم 
> تسلسل الوثيقة إذا كان الخيار في متغير تسلسل الفواتير (مع رقم الآلة ورقم 
> المستخدم). 
>  - 
>  عدد 
> خانات رقم نقطة البيع: يتم تحديد عدد 
> خانات رقم نقطة البيع التي 
> تظهر كجزء من رقم 
> تسلسل الوثيقة إذا كان الخيار في متغير تسلسل الفواتير (مع رقم الآلة ورقم 
> المستخدم) أو (مع رقم الآلة فقط). 
>  - 
>  عدد 
> خانات الرقم المتسلسل: يتم تحديد عدد 
> خانات رقم التسلسل للفواتير والمردود والتي يظهر تأثيره في حقل رقم فواتير المبيعات 
> ومردود المبيعات مع الحقلين السابقين ويشكل طول رقم فاتورة المبيعات ومردود 
> المبيعات. 
>  كما يظهر رقم 
> الفاتورة في الشكل التالي: 
>  حيث 
> يعبر الرقم (21) في البداية عن السنة 2021 ثم يظهر رقم السيرفر (1) ثم ثلاثة أرقام 
> خاصة برقم الآلة أو نقطة البيع وهي (001) ثم يظهر رقم المستخدم للنظام ثم الخمسة 
> الأرقام خاصة بتسلسل الفاتورة وهي (00025) وهذا الترقيم يعتبر إجباري فقط يمكن 
> التغير في الحجم من خلال الحقول السابقة. 
>  - 
>  تأخير 
> أو تقديم الوقت/ عدد الساعات/ للفترة من: إلى: تستخدم هذه 
> الحقول لتحديد مدة تأخير تاريخ اليوم السابق بالساعة في فاتورة المبيعات عند وجود 
> ورديات تعمل على النظام بعد الساعة 12 ليلاً بحيث تظهر حركة البيع بعد منتصف الليل 
> بتاريخ اليوم السابق، فمثلاً لو تم تحديد ثلاث ساعات فإن الحركة حتى الساعة الثالثة 
> صباحاً سوف تعتبر من حركة اليوم ال

## 2. Data Blocks (14)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| IAS_PARA_POS | DB | QIU | AUTOMATIC |  |
| IAS_POS_SERVER_DB_LINK | DB | QIU | AUTOMATIC | ORDER:Server_No |
| IAS_POS_SERVER_SNCRNZ_DATA | DB | QIU | AUTOMATIC | ORDER:Server_No |
| S_EMAIL_SETTING | DB | QIU | DELAYED | WHERE:BRN_USR = :1; ORDER:CMP_NO |
| POS_WRK_SHFT | DB | QIU | DELAYED | ORDER:SHFT_CODE,BRN_NO |
| IAS_EXPDB_PARA | DB | QIU | DELAYED |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (8) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
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
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (34)


**Procedures/Functions (34):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_DB_BRANCH`, `SRCH_FLD_PRC`, `CALL_SCR_LNK_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `YS_CHK_SPCL_CHR_FNC`

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
| FORM_DETAIL | 25 |
| S_FLAGS | 6 |
| POS_S_FLD_PRV_FXD | 6 |
| ACCOUNT | 6 |
| IAS_POS_BILL_MST | 5 |
| POS_DFLT_STNG_MST | 4 |
| IAS_PARA_POS | 4 |
| CASH_IN_HAND | 4 |
| IAS_POS_SERVER_DB_LINK | 3 |
| S_ALRT_SYS_MST | 2 |
| POS_DFLT_STNG_DTL | 2 |
| IAS_PARA_AR | 2 |
| V$INSTANCE | 2 |
| IAS_PRICING_LEVELS | 2 |
| IAS_POS_BILL_DTL | 2 |
| ACCOUNT_TYPES | 2 |
| PRG | 2 |
| IAS_POS_RT_BILL_MST | 2 |
| USER_R | 2 |
| IAS_POS_CUSTOMER_CARD_AMOUNT | 1 |
| POS_WRK_SHFT | 1 |
| GNR_WEB_SRVC_MST | 1 |
| S_THMS | 1 |
| IAS_PARA_INV | 1 |
| WAREHOUSE_DETAILS | 1 |
| DBA_SNAPSHOTS | 1 |
| IAS_POS_PAY_CASH | 1 |
| IAS_POS_PAY_BILLS | 1 |
| IAS_DEPOSIT_CURRENCY_MST | 1 |
| IAS_POS_FNL_DATA_ALL | 1 |


_(+15 جدول/view آخر — انظر `_raw/POSS001_strings.txt`)_


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `YS_GEN_PKG`, `IAS_BRN_PKG`, `IAS_CSHBNK_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `IAS_ACODE_PKG`, `POS_WRK_SHFT_PKG`, `IAS_PRMTR_PKG`, `YS_SCR_PKG`, `SETUP_PKG`, `POS_SYNC_JOB_AUTO_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO = 934"UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO = 934"UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO IN ( 943,925 )"UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FOR
UPDATE S_ALRT_SYS_MST SET INACTIVE=1 WHERE ALRT_NO = 806"UPDATE S_ALRT_SYS_MST SET INACTIVE=0 WHERE ALRT_NO = 806"UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO = 941"SELECT COUNT(1) FROM IAS_POS_CUSTOMER_CARD_AMOUNT WHE
UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO IN ( 943,916,948 )"UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO IN ( 916,948 )"UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO = 952"UPDATE S_FLAGS SET FLG_ST=1 WHE
UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO = 952"UPDATE S_FLAGS SET FLG_ST=0 WHERE FLG_CODE = ''JV_DOC_TYPE_REF'' AND FLG_VALUE = 6"UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO IN ( 917,955,956,927 )"UPDATE FO
UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO = 859"UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO = 961"UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO = 961"UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO IN (
UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO IN ( 963,964 )"UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO IN ( 966,968 )"UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO IN ( 966,968 )"UPDATE FORM_DETAIL SET F_
UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO IN ( 967,969 )"UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO = 943"UPDATE POS_DFLT_STNG_MST SET INACTIVE=0 WHERE STNG_NO = 8"UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE F
UPDATE POS_DFLT_STNG_MST SET INACTIVE=1 WHERE STNG_NO = 8"UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO IN ( 971 )"UPDATE POS_DFLT_STNG_MST SET INACTIVE=0,STNG_VAL=2 WHERE STNG_NO = 16"UPDATE POS_DFLT_STNG_DTL SET INACTIVE=0
UPDATE POS_DFLT_STNG_MST SET INACTIVE=1,STNG_VAL=1 WHERE STNG_NO = 16"UPDATE POS_DFLT_STNG_DTL SET INACTIVE=1 WHERE STNG_NO = 16"UPDATE POS_S_FLD_PRV_FXD SET FLD_ST_FLG=1 WHERE FLD_NM = ''POS_SHW_AVLQTY_IN_BILL''"UPDATE POS_S_FLD
UPDATE POS_S_FLD_PRV_FXD SET FLD_ST_FLG=1 WHERE FLD_NM = ''POS_OPEN_BILL_MORE_ONE''"UPDATE POS_S_FLD_PRV_FXD SET FLD_ST_FLG=0 WHERE FLD_NM = ''POS_OPEN_BILL_MORE_ONE''"UPDATE FORM_DETAIL SET F_INACTIVE=0 WHERE FORM_NO IN ( 973,97
UPDATE FORM_DETAIL SET F_INACTIVE=1 WHERE FORM_NO IN ( 973,974 )"UPDATE POS_S_FLD_PRV_FXD SET FLD_ST_FLG=1 WHERE FLD_NM = ''ENTR_MOBILE_NO_MNDTRY''"UPDATE POS_S_FLD_PRV_FXD SET FLD_ST_FLG=0 WHERE FLD_NM = ''ENTR_MOBILE_NO_
SELECT IAS_PARA_POS.USE_POS_POINT_SYS,USE_E_INVOICE,USE_VAT,POST_OTHR_CHR_ITM,COSTING_TYPE,AR_INV_EFCT_MTHD FROM IAS_PARA_AR,IAS_PARA_POS,IAS_PARA_GEN,IAS_PARA_INV
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSS001_strings.txt`.
