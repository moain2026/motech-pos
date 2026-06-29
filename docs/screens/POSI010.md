# POSI010 — توثيق شاشة Onyx Pro POS

> النوع: **POSI** — إدخال/بيانات أساسية (Input/Master)  
> الحجم: 401,568 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSI010.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> بيانات عملاء نقاط البيع 
>  نظام نقاط البيع > مدخلات النظام > 
>  بيانات عملاء نقاط البيع 
>  الاستخدام: 
>  إدخال البيانات 
> الرئيسية والتفصيلية الخاصة بالعم يل 
> النقدي كالاسم والعنوان والفرع، ووسائل التواصل المتاحة والدولة والمحافظة والمنطقة 
> التي ينتمي إليها، والمندوب المختص والبيانات الشخصية، والغرض من ترميز بيانات 
> العملاء النقديين التعامل معهم كعملاء إذا كانوا من المشتركين في برامج نقاطي أو 
> بطائق الخصم، أو استخدام اسم العميل النقدي كمعلومة في فاتورة المبيعات نقداً في 
> نظام المبيعات. 
>  ملاحظة: 
>  تتضمن 
> هذه الشاشة العديد من الحقول منها حقول إجبارية يجب إدخال بياناتها وبعضها حقول 
> اختيارية، ونشير بأنه يمكن أن يتم تغيير إعدادات هذه الحقول لتصبح إجبارية من شاشة 
> الحقول الإجبارية في إدارة النظام. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر إضافة على النحو 
> التالي: 
>  أولاً: البيانات الأساسية 
>  - 
>  رقم 
> الجوال: 
>  يُسجل 
> المستخدم في هذا الحقل رقم الجوال الخاص بالعميل باعتباره رقم العميل ويتم استخدامه 
> في شاشة التدفيع المتعدد. 
>  - 
>  اسم 
> العميل: يُسجل 
> المستخدم في هذا الحقل اسم العميل النقدي باللغة الافتراضية للمستخدم. 
>  - 
>  رقم 
> الفرع: 
>  يختار 
> المستخدم الفرع الذي 
> يتعامل معه العميل من القائمة. 
>  - 
>  الاسم 
> الأجنبي: 
>  يُسجل 
> المستخدم في هذا الحقل اسم العميل النقدي باللغة الأجنبية. 
>  - 
>  البريد 
> الإلكتروني: 
>  يُسجل 
>  المستخدم 
> في هذا الحقل البريد الإلكتروني للعميل النقدي. 
>  - 
>  المجموعة: 
>  في 
> هذا الحقل يختار المستخدم 
> المجموعة التي سيتم ربط العميل بها من بين المجموعات التي تم تعريفها في شاشة 
> (مجموعات العملاء النقديين). 
>  - 
>  نوع 
> برنامج نقاطي: يتم 
> تحديد نوع برنامج نقاطي من قائمة البرامج إذا كان العميل النقدي مشترك في برنامج 
> نقاطي شريطة أن يكون البرنامج ساري المفعول 
> ليتم ربطه بالعميل، وإذا لم يكن مشترك يتم اختيار (غير مشترك) من 
> القائمة. 
>  - 
>  تاريخ 
> التفعيل: 
>  يعرض 
> النظام آلياً تاريخ تفعيل 
> برنامج نقاطي بمجرد تحديده في حقل نوع برنامج نقاطي. 
>  - 
>  إرسال 
> رمز التحقق

## 2. Data Blocks (11)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| IAS_CASH_CUSTMR | DB | QIU | AUTOMATIC |  |
| IAS_CASH_CUSTMR_POINT_TRACE | DB | QIU | AUTOMATIC | ORDER:UP_DATE |
| IAS_GNR_CRD_IDNTTY | DB | QIU | DELAYED | WHERE:TYP_CODE= :1 AND TYP_NO=1 |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
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
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (39)


**Procedures/Functions (39):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `CHECK_DB_BRANCH`, `INSRT_UPDT_CUST_4BRN_PRC`, `SEND_MSG_PRC`, `CHECK_CARD_DISC_PRC`, `GET_TRMNL_DATA_PRC`, `CALL_SCR_LNK_PRC`, `CHECK_MNDTRY_FLD`, `GET_LIST_CHANGE`, `CHECK_CONNCT_SRVR`

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
| IAS_CASH_CUSTMR | 12 |
| IAS_CASH_CUSTMR_BRN | 8 |
| IAS_CARD_SAL | 6 |
| IAS_POINT_TYP_MST | 4 |
| IAS_CASH_CUSTMR_POINT_TRACE | 4 |
| IAS_POS_MACHINE | 4 |
| USER_R | 4 |
| IAS_PROVINCES | 3 |
| CITIES | 2 |
| REGIONS | 2 |
| IAS_PARA_POS | 2 |
| IAS_POS_BILL_MST | 2 |
| USER | 2 |
| POS_POINT_CALC_TRNS | 1 |
| SALES_MAN | 1 |
| CNTRY | 1 |
| IAS_CASH_CUSTMR_GRP | 1 |
| IAS_PARA_AR | 1 |
| IAS_POS_SERVER_DB_LINK | 1 |
| DBA_SNAPSHOTS | 1 |
| MAIN | 1 |
| IAS_MNDTRY_SCR_FIELDS | 1 |
| IAS_POS_HST_BILL_MST | 1 |
| IAS_GNR_CRD_IDNTTY | 1 |
| UP_DATE | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `DATE_CNVRTR_PKG`, `YS_GEN_PKG`, `IAS_USR_PKG`, `POS_POINT_PKG`, `IAS_BRN_PKG`, `POS_MOV_TRNS_PKG`, `IAS_PRMTR_PKG`, `YS_SCR_PKG`, `IAS_SMS_MAIL_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(MAX(TO_NUMBER(CUST_CODE)),0) + 1 FROM IAS_CASH_CUSTMR
SELECT POINT_TYP_NO FROM IAS_POINT_TYP_MST WHERE POS_POINT_PKG
SELECT 1 FROM IAS_CASH_CUSTMR WHERE CUST_CODE = :b1"SELECT 1 FROM IAS_CASH_CUSTMR_BRN WHERE CUST_CODE
Select Count(Cust_Code) From Ias_Cash_Custmr
Select Count(Mobile_No) From Ias_Cash_Custmr
UPDATE IAS_CARD_SAL SET PROCESSED=1 WHERE CRD_NO = :b1 AND CRD_TYPE = 2"INSERT INTO IAS_CASH_CUSTMR_POINT_TRACE ( CUST_CODE,POINT_TYP_NO,POINT_TYP_ACTV_DATE,UP_U_ID,UP_DATE,UP_TRMNL_NM ) VALUES ( :b1,:b2,:b3,:b4,IAS_GEN_PK
INSERT INTO IAS_CASH_CUSTMR_POINT_TRACE ( CUST_CODE,CRD_NO_DISC,POINT_TYP_ACTV_DATE,UP_U_ID,UP_DATE,UP_TRMNL_NM )
Select Count(Cust_Code) From Pos_Point_Calc_Trns
UPDATE IAS_CARD_SAL SET PROCESSED=0 WHERE CRD_NO = :b1 AND CRD_TYPE = 2"DELETE FROM IAS_CASH_CUSTMR_BRN WHERE CUST_CODE = :b1" DEL_DET_REC_PRC STANDARD /NSPC1/CHECK_DB_BRANCH /LPOSLIB GEN_PKG SQLFORMS "PKG INIT"DEL_DET_REC_
Select Reprs_Code||'- '||Decode ( ,1,Nvl(Reprs_A_Name,Reprs_E_Name),Nvl(Reprs_E_Name,Reprs_A_Name)),Reprs_Code From Sales_Man
Select to_char(cntry_no)||' -'||Decode( nvl(cntry_a_name,cntry_e_name),nvl(cntry_e_name,cntry_a_name)),to_char(cntry_no) from CNTRY order by cntry_no
Select to_char(Prov_no)||' -'||Decode( nvl(Prov_a_name,Prov_e_name),nvl(Prov_e_name,Prov_a_name)),to_char(Prov_no) from Ias_Provinces order by Prov_no
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSI010_strings.txt`.
