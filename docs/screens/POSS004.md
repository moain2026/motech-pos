# POSS004 — توثيق شاشة Onyx Pro POS

> النوع: **POSS** — إعدادات/نظام (Settings/System)  
> الحجم: 218,736 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSS004.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — ar)_

> تغيير كلمة السر 
>  نظام نقاط البيع > تهيئة النظام > 
>  تغيير كلمة السر 
>  الاستخدام: 
>  تستخدم 
> الشاشة لتغيير كلمة السر الخاصة بالمستخدم 
> لتحقيق الأمان في الدخول إلى النظام. 
>  طريقة استخدام الشاشة 
>  تستخدم الشاشة بعد النقر على زر تعديل على النحو التالي: 
>  - 
>  كلمة 
> السر القديمة: يتم تسجيل كلمة 
> السر القديمة الخاصة بالمستخدم. 
>  - 
>  كلمة 
> السر الجديدة: يتم تسجيل كلمة 
> السر الجديدة التي يحددها المستخدم. 
>  - 
>  تأكيد 
> كلمة السر الجديدة: يتم إعادة 
> تسجيل كلمة السر الجديدة كتأكيد لصحة كلمة السر. 
>  - 
>  حفظ: 
>  بعد استكمال 
> إدخال البيانات يتم 
> الحفظ. 
>  إد ارة 
>  و تخطيط م وارد 
>  الم ؤسسات

## 2. Data Blocks (9)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| CHNG_PASS | ctrl | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | IMMEDIATE |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
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
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |
| WIN_LOCK | 5055 | DIALOG | true |
| MAIN |  | DOCUMENT | false |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_PRNT | Print Options | DIALOG | false |

## 5. Triggers (45)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (30)


**Procedures/Functions (30):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `ENCRYPT_PASS`, `CHECK_DB_SRVR_TYP`, `CALL_SCR_LNK_PRC`, `CALL_BTN_SCR`

## 7. مكتبات مرفقة (4)

`POSLIB`, `D2KWUTIL`, `YSERPDBALIB`, `D2KCOMN`

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
| IAS_PARA_GEN | 1 |
| IAS_POS_MACHINE | 1 |
| DBA_SNAPSHOTS | 1 |
| DBA_SNAPSHOT_LOGS | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `IAS_GEN_PKG`, `YS_SCR_PKG`, `YS_GEN_PKG`, `LOV_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`, `IAS_PRMTR_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT PASSWORD,PWD_CHANGE_NEW_FLG FROM USER_R WHERE U_ID
UPDATE USER_R SET PASSWORD=:b1,CHNG_PASSWD_AFTR_LGN=0,UPD_PWD_CNT=NVL(UPD_PWD_CNT,0) + 1 WHERE U_ID = :b2" CALL_SCR_PRINT STANDARD SQLFORMS FORMS4W FORMS40 FORMS4C "PKG INIT"CALL_SCR_PRINT"V_AUDIT_REF"V_STAND_BY"" CAL
SELECT NVL(A.MIN_USR_PWD_LEN,1),NVL(A.MIN_USR_PWD_LETTER,0),NVL(A.MIN_USR_PWD_UPPER,0),NVL(A.MIN_USR_PWD_LOWER,0),NVL(A.MIN_USR_PWD_DIGIT,0),NVL(A.MIN_USR_PWD_SPECIAL,0) FROM IAS_PARA_GEN A
SELECT MOVE_DATA_TO_DB_LINK FROM IAS_POS_MACHINE WHERE UPPER
SELECT 1 FROM DBA_SNAPSHOTS WHERE TABLE_NAME = ''IAS_ITM_MST'' AND OWNER = USER AND ROWNUM <= 1"SELECT 1 FROM DBA_SNAPSHOT_LOGS WHERE MASTER
Select To_Char(Clndr_Code)||'-'||Cid_Addr_Op_Pkg.Get_Trns_Lbl (P_Cntry_2_Ltr =>'', P_Lang_Code =>'', P_Lang_Id => P_Cid_Name_Lbl =>Clndr_Nm_Lbl) Clndr_Nm_Lbl ,TO_CHAR(Clndr_Code) From S_Clndr_List WHERE CLNDR_CODE
SELECT PASSWORD FROM USER_R WHERE U_ID
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSS004_strings.txt`.
