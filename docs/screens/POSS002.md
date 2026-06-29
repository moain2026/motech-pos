# POSS002 — توثيق شاشة Onyx Pro POS

> النوع: **POSS** — إعدادات/نظام (Settings/System)  
> الحجم: 495,560 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSS002.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> صلاحيات المستخدمين 
>  نظام نقاط البيع > تهيئة النظام > 
>  صلاحيات المستخدمين 
>  الاستخدام: 
>  تستخدم 
> الشاشة لتحقيق الأهداف التالية: 
>  - 
>  منح 
>  المستخدمين صلاحيات العمل 
> على الشاشات في نظام نقاط البيع. 
>  - 
>  منح 
> المستخدمين صلاحيات تفصيلية أو منعهم من القيام بها على مستوى بعض الإجراءات في عمليات 
> وتقارير نظام نقاط البيع، حيث يمكن منح صلاحية لمستخدم وحجبها عن مستخدم 
> آخر. 
>  - 
>  منح 
> المستخدمين صلاحية على الآلات. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر التعديل وتفعيل الصلاحيات اللازمة لكل 
> مستخدم على حدة كما يلي: 
>  أولاً: صلاحيات الشاشات 
>  يستخدم هذا 
> التبويب لمنح صلاحيات شاشات نظام نقاط البيع للمستخدمين بعد إضافة المستخدم في 
> بيانات المستخدمين في نظام الأونكس ERP ، فمن خلال هذا التبويب يتم تحديد الشاشات 
> التي يسمح للمستخدم التعامل معها، وكذلك تحديد نوع التعامل داخل كل شاشة من إضافة 
> وتعديل وحذف وطباعة وتقارير وغيرها من الصلاحيات. 
>  تلميح: 
>  تفعيل 
> مؤشر (تضمين) في الجانب الأيمن سيعمل على إظهار شجرة نظام نقاط البيع وهي (النظام/ 
> التهيئة/ المدخلات العمليات/ التقارير) وسيظهر (تضمين) مفعلاً في الجانب الأيسر بعد 
> الحفظ، أما بالنسبة لبقية الشاشات فبتفعيل مؤشر (تضمين) سيعمل على إظهارها للمستخدم 
> وعدم تفعيله يعني إخفاءها عن المستخدم. 
>  مع 
> ملاحظة أنه بعد 
> حفظ الصلاحيات تظهر فقط الشاشات التي تم منح المستخدم صلاحيات عليها وتختفي بقية 
> الشاشات غير الممنوحة له. 
>  ثانياً: صلاحيات الآلات 
>  يستخدم هذا 
> التبويب في عملية منح صلاحيات نقاط البيع أو ما يسمى بالآلات حيث يتم تحديد الآلة 
> أو الجهاز التي يسمح للمستخدم من خلالها الدخول إلى نظام نقاط البيع مع ملاحظة أنه 
> يتم ربط المستخدم بنقطة بيع في بيانات المستخدمين لكي يستطيع أيضاً الدخول إلى 
> النظام. 
>  ثالثاً: صلاحيات العمليات 
>  يستخدم هذا التبويب لمنح صلاحيات تفصيلية على مستوى المستخدم فعلى سبيل 
> المثال لا يمكن حذف الأصناف في فاتورة نقطة البيع إلا أنه من الممكن منح أحد 
> المستخدمين صلاحية (حذف الأصناف في فاتورة نقاط البيع) وحجبها 

## 2. Data Blocks (17)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| USER_R | DB | Q-U | AUTOMATIC | WHERE:user_type in (1,3); ORDER:u_id |
| PRIVILEGE_MAIN | DB | QIU | AUTOMATIC | WHERE:Exists (Select 1 From form_detail Where ; ORDER:FORM_N |
| PRIVILEGE | DB | QIU | AUTOMATIC | WHERE:Exists (Select 1 From form_detail Where ; ORDER:FORM_N |
| IAS_POS_PRIV_MACHINE | DB | QIU | AUTOMATIC | WHERE:U_ID=:1; ORDER:MACHINE_NO |
| POS_S_FLD_PRV_FXD_USR | DB | QIU | AUTOMATIC | WHERE:EXISTS (SELECT 1 FROM POS_S_FLD_PRV_FXD ; ORDER:(SELEC |
| POS_S_FLD_PRV_FXD_USR_LST | DB | QIU | DELAYED | WHERE:EXISTS (SELECT 1 FROM POS_S_FLD_PRV_FXD ; ORDER:(SELEC |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| LOV_MST | ctrl | QIU | DELAYED |  |
| LOV_DTL | DB | QIU | DELAYED |  |
| LOVRTRN | ctrl | QIU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (9) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CNV_CLNDR | CONTENT | 260×80 | visible |
| BAR | H_TOOLBAR | ?×44 | visible |
| MAIN | CONTENT | 1024×517 | visible |
| MAIN2 | TAB | ?×? | visible |
| CNV_PRNT | CONTENT | 302×122 | visible |
| CNV_LOCK | CONTENT | 320×126 | visible |
| CALL_SCR_LNK | CONTENT | 245×155 | visible |
| CNV_LOV | STACKED | 2000×364 | visible |
| FTR | STACKED | 1022×65 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (6)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WIN_LOV |  | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |

## 5. Triggers (47)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `PRE-QUERY`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (31)


**Procedures/Functions (31):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `CALL_SCR_LNK_PRC`

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
| POS_S_FLD_PRV_FXD | 11 |
| USER_R | 9 |
| PRIVILEGE_FIXED | 5 |
| FORM_DETAIL | 4 |
| PRIVILEGE | 4 |
| USER | 3 |
| IAS_PARA_POS | 2 |
| IAS_V_USR_SCR_PRV | 2 |
| POS_S_FLD_PRV_FXD_USR | 2 |
| IAS_POS_PRIV_MACHINE | 2 |
| IAS_PARA_INV | 1 |
| POS | 1 |
| PRICE | 1 |
| IAS_V_USR_PRIV_MACHINE_PRV | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `IAS_USR_PKG`, `YS_GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_PRMTR_PKG`, `IAS_DBS_SYS_PKG`, `LOV_PKG`, `YS_SCR_PKG`, `SRCH_DTL_PKG`, `ADM_INSRT_TRNS_PKG`, `SETUP_PKG`, `IAS_FETCH_DATA_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT ALLW_UPDATE_PRICE FROM IAS_PARA_POS
Select u_id||' - '||Decode( ,1,U_a_name,nvl(U_e_name,U_a_name)), To_Char(U_Id) From User_R Usr
SELECT USE_HUNG_BILLS,USE_APRVD_IN_RTBILL,CHCK_AVL_QTY,SHW_ITM_COMM_PER,SHW_STK_CST_BY_PRV FROM IAS_PARA_POS,IAS_PARA_AR
SELECT COSTING_TYPE FROM IAS_PARA_INV
UPDATE PRIVILEGE_FIXED SET INV_DIS_LMT=:b1,INV_DIS_LMT_ITM=:b2,MOD_ITM_DISC=:b3,MAX_DISC_ITM_PER=:b4,ALLOW_DEL_ITM_FROM_POS_BILL=:b5,ALLW_DECRS_QTY=:b6,ALLOW_CHANGE_POS_QTY=:b7,PMANUAL=:b8,USE_UNDO_CTRLU=:b9,RTN_BILL_NO=:b10,PR
UPDATE PRIVILEGE_FIXED SET HIDE_COST=:b1 WHERE U_ID = :b2" SET_POS_PRC STANDARD /LPOSLIB GEN_PKG "PKG INIT"SET_POS_PRC"P_BLK_NM"" SET_POS_PRC .First_Item ,Item_Name,Item_Name, UPDATE_PROC STANDARD /NSPC6/ENA_DIS_ITM_PRC /LPOSLI
SELECT NULL "FLD1", NULL "FLD2", NULL "FLD3", NULL "FLD4", NULL "FLD5", NULL "FLD6", NULL "FLD7", NULL "FLD8", NULL "FLD9", NULL "FLD10", NULL "FLD11" , NULL "FLD12", NULL "FLD13" , NULL "FLD14" , NULL "FLD15", NULL "FLD16", NULL "FLD17", NULL "FLD18", NULL "FLD19", NULL "FLD20" FROM DUAL
Select a.u_id,Decode(:Parameter.Lang_no,1,Nvl(a.u_a_name,a.u_e_name),nvl(a.u_e_name,a.u_a_name)) U_name From user_r a
SELECT 1 FROM IAS_V_USR_SCR_PRV I WHERE I.U_ID = :b1"SELECT 1 FROM IAS_V_USR_SCR_PRV I WHERE I
SELECT 1 FROM IAS_V_USR_PRIV_MACHINE_PRV I WHERE I.U_ID = :b1"SELECT 1 FROM POS_S_FLD_PRV_FXD_USR P WHERE P
DELETE FROM PRIVILEGE WHERE FORM_NO = :b1 AND U_ID = :b2"INSERT INTO PRIVILEGE ( U_ID,FORM_NO,INCLUDE_FLAG,F_ORDER_NO,AD_U_ID,AD_DATE ) SELECT :b1,:b2,NVL(:b3,0),F_ORDER_NO,:b4
DELETE FROM PRIVILEGE WHERE FORM_NO = :b1 AND U_ID = :b2"INSERT INTO PRIVILEGE ( U_ID,FORM_NO,INCLUDE_FLAG,AD_FLAG,DEL_FLAG,MOD_FLAG,VIEW_FLAG,PRINT_FLAG,VWREP_FLAG,F_ORDER_NO,A
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSS002_strings.txt`.
