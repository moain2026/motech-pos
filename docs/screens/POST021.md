# POST021 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 256,568 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST021.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> استعراض حركة النقاط 
>  نظام نقاط البيع > عمليات النظام > 
>  استعراض حركة النقاط 
>  الاستخدام: 
>  تستخدم 
> الشاشة لاستعراض تقرير بالنقاط المحسوبة لكافة العملاء وتاريخ انتهاء البرنامج 
> نقاطي للبرامج المفتوحة والمنتهية، إضافة إلى عرض عدد النقاط المستبدلة وعرض النقاط 
> لمرود المبيعات وعرض النقاط لمرود المبيعات لنقاط مستبدلة كما يتم عرض رصيد النقاط 
> كمية وقيمة، 
>  حيث 
> يمكن فلترة البيانات حسب طريقة الاحتساب ومجموعة العملاء أو من عميل إلى عميل ومن 
> ثم النقر على إنزال البيانات ليعرض النظام البيانات التفصيلية حسب الخيارات 
> المختارة. 
>  ملاحظة: 
>  يمكن 
> النقر على السهم أمام رقم العميل لعرض شاشة من خلالها يتم استعراض العمليات 
> التحليلية لرصيد النقاط المحتسب 
> للعميل. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (11)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| BLK_OPTIONS | ctrl | QIU | UNKNOWN |  |
| POS_CUST_POINT_BAL | DB | QIU | AUTOMATIC | ORDER:CUST_CODE |
| POS_POINT_CALC_TRNS | DB | Q-- | AUTOMATIC | ORDER:trns_no,trns_date,trns_type |
| CLNDR | ctrl | QIU | DELAYED |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (9) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN1 | STACKED | 946×302 | visible |
| MAIN2 | STACKED | 1015×301 | visible |
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

## 5. Triggers (45)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (34)


**Procedures/Functions (34):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `PRINT_FROM_SCR_PRC`, `SHOW_DATA`, `INSERT_EXPIRED_POINT_TRNS`, `CHECK_DB_BRANCH`, `GET_TRNS_NM`, `FORMS_TO_EXCEL`, `CALL_SCR_LNK_PRC`

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
| POS_POINT_CALC_TRNS | 3 |
| USER_R | 2 |
| IAS_CASH_CUSTMR_GRP | 1 |
| IAS_POINT_TYP_MST | 1 |
| IAS_POS_SERVER_DB_LINK | 1 |
| IAS_POS_MACHINE | 1 |
| DBA_SNAPSHOTS | 1 |
| IAS_CASH_CUSTMR | 1 |
| S_BRN_USR_PRIV | 1 |
| C_CODE | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `POS_POINT_PKG`, `YS_GEN_PKG`, `YS_SCR_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select Cust_GRP_CODE||' - '||Decode( ,1,nvl(Cust_GRP_L_NM ,Cust_GRP_F_NM ),nvl(Cust_GRP_F_NM ,Cust_GRP_L_NM )), to_char(Cust_GRP_CODE) From IAS_CASH_CUSTMR_GRP
Select Point_Typ_No||' - '||Decode( ,1,nvl(Typ_l_Nm ,Typ_F_Nm ),nvl(Typ_F_Nm ,Typ_l_Nm )), to_char(Point_Typ_No) From IAS_POINT_TYP_MST
SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT DB_LINK_NM FROM IAS_POS_SERVER_DB_LINK WHERE DB_MAIN_SERVER
INSERT INTO POS_POINT_CALC_TRNS ( TRNS_NO,TRNS_DATE,CUST_CODE,MOBILE_NO,POINT_TYP_NO,BILL_NO,DOC_AMT,POINT_CNT,TRNS_TYPE,MACHINE_NO,AD_U_ID,AD_DATE,BRN_NO,CMP_NO,BRN_YEAR,BRN_USR )
Select IAS_CASH_CUSTMR.CUST_CODE, Decode (:Parameter.Lang_No,1, Nvl (CUST_L_NM, CUST_F_NM), Nvl (CUST_F_NM, CUST_L_NM)) CUST_Name, Decode (:Parameter.Lang_No,1, Nvl (CUST_GRP_L_NM, CUST_GRP_F_NM), Nvl (CUST_GRP_F_NM, CUST_GRP_L_NM)) C_Group_Name From IAS_CASH_CUSTMR,IAS_CASH_CUSTMR_GRP
Select trns_no, trns_date , cust_code, Pos_Point_Pkg.Get_Cust_Nm(cust_code,:lang_no) cust_nm, mobile_no, point_typ_no, Pos_Point_Pkg.Get_Point_Type_Nm(point_Typ_no,:lang_no) point_typ_nm, bill_no, rt_bill_no, doc_amt, point_cnt, trns_type,POINT_AMT,EXPIRE_DATE, machine_no,doc_typ From pos_point_calc_trns Where 1
Select To_Char(Clndr_Code)||'-'||Cid_Addr_Op_Pkg.Get_Trns_Lbl (P_Cntry_2_Ltr =>'', P_Lang_Code =>'', P_Lang_Id => P_Cid_Name_Lbl =>Clndr_Nm_Lbl) Clndr_Nm_Lbl ,TO_CHAR(Clndr_Code) From S_Clndr_List WHERE CLNDR_CODE
SELECT PASSWORD FROM USER_R WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST021_strings.txt`.
