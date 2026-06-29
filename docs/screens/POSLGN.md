# POSLGN — توثيق شاشة Onyx Pro POS

> النوع: **POSLGN** — تسجيل الدخول (Login)  
> الحجم: 644,808 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSLGN.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **تسجيل الدخول (Login)**. أكثر الجداول استخداماً: `USER_R`, `IAS_SYS`, `S_BRN`, `FORM_DETAIL`, `IAS_POS_MACHINE`, `ALL_USERS`.

## 2. Data Blocks (7)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| LOGIN | ctrl | QIU | AUTOMATIC |  |
| MAIN_SCR | ctrl | QIU | AUTOMATIC |  |
| NAVIGATOR | ctrl | QIU | AUTOMATIC |  |
| NOTE_BOOK | ctrl | QIU | AUTOMATIC |  |
| IAS_FAVORITE_SCR | DB | QIU | DELAYED |  |
| ABOUT_BLK | ctrl | QIU | AUTOMATIC |  |
| LIC_INFO | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (6) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| MAIN | CONTENT | 485×283 | visible |
| MAIN2 | CONTENT | 768×511 | visible |
| MAIN3 | CONTENT | 382×264 | visible |
| CAVER | STACKED | 28×95 | hidden |
| MAIN5 | CONTENT | 323×286 | visible |
| NAVIGATOR_VER_TOOLBAR | H_TOOLBAR | ?×23 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (4)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| LOGIN | Login | DIALOG | true |
| MSG | Messgas | DIALOG | true |
| WIN1 | Main Scr. | DOCUMENT | false |
| WIN2 | About | DIALOG | true |

## 5. Triggers (19)

**قياسية (Forms events):** `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-LISTVAL`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-UP`, `ON-ERROR`, `ON-LOGON`, `ON-MESSAGE`, `PRE-FORM`, `PRE-LOGON`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`

## 6. Program Units (61)

**Packages (spec):** `SECU_CONSTANTS`, `SECU_YSSEC`, `SECU_YSSEC_EVENTS`, `IAS_GET_PC_NAME`, `WINDOW_UTIL`, `ZKFPENGXCONTROL_CONSTANTS`, `ZKFPENGXCONTROL_IZKFPENGX`, `ZKFPENGXCONTROL_ZKFPENG_EVENTS`, `FINGER_PKG`


**Packages (body):** `SECU_YSSEC`, `SECU_YSSEC_EVENTS`, `IAS_GET_PC_NAME`, `WINDOW_UTIL`, `ZKFPENGXCONTROL_IZKFPENGX`, `ZKFPENGXCONTROL_ZKFPENG_EVENTS`, `FINGER_PKG`


**Procedures/Functions (45):** `KDOWN`, `KUP`, `RESIZE_WINDOWS`, `CHECK_HDSERIAL`, `CHECK_USER_TRMNAL`, `EXIT_PRC`, `DECRYPT_PASS`, `COLLAPSE`, `COLLAPSE_ALL`, `EXPAND`, `EXPAND_ALL`, `CHECK_MSG_USR`, `LOAD_FONT`, `CHECK_NOTE_USR`, `UPDATE_COLUMN_NEED`, `ALTER_PASS`, `GET_DT_DIS_NOTE`, `GET_PROMPT`, `SEND_MSG`, `INSRT_INTO_LGN_HSTY_PRC`, `GET_CLIENT_NAME`, `GET_CONNECTION_TYPE`, `CALL_FAV_SCR`, `CALL_SCR`, `CHECK_DB_BRANCH`, `CHECK_LANG`, `GET_TERMINAL_DFLT`, `LOAD_TREE`, `POS_PARAMETERS`, `PROC_PRE_FORM`, `RUN_TIMER`, `SHOW_HIDE_FLD`, `STOP_TIMER`, `TM`, `UPDATE_TERMINAL_DFLT`, `VALIDATE_PASS`, `UPDATE_FONT`, `FIND_IN_TREE_PRC`, `RUNPRG`, `LOAD_FAV_SCR`, `SET_SEC_PARA`, `CLR_MSG`, `ENCRYPT_PASS`, `OK_BUTTON_PRC`, `SET_DIR_PRC`

## 7. مكتبات مرفقة (5)

`D2KWUTIL`, `YSPOS_LIB`, `YSERPDBALIB`, `YSERPDBA2LIB`, `D2KCOMN`

## 8. Alerts (4)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| MSGBOX | ONYX-PRO | STOP | OK |
| TOO_MANY_SELECTION |  | WARNING | OK |
| NO_SELECTION |  | WARNING | OK |
| ALRT_KILL_SESSTION |  | STOP | OK |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| USER_R | 14 |
| IAS_SYS | 14 |
| S_BRN | 13 |
| FORM_DETAIL | 10 |
| IAS_POS_MACHINE | 9 |
| ALL_USERS | 6 |
| V$SESSION | 4 |
| S_YS_CMP | 4 |
| IAS_PARA_GEN | 3 |
| EX_RATE | 3 |
| LANG_DEF | 3 |
| IAS_PARA_POS | 3 |
| S_BRN_USR_PRIV | 3 |
| PRIVILEGE_FIXED | 2 |
| S_PRD_DTL | 2 |
| THIS | 1 |
| S_CMPNY | 1 |
| ALL_BRANCHES | 1 |
| IAS_USR_LGN_HSTRY | 1 |
| DBA_OBJECTS | 1 |
| DBA_TAB_COLUMNS | 1 |
| ACCOUNT_TYPES | 1 |
| IAS_POS_PRIV_MACHINE | 1 |
| USER_FNGR | 1 |
| USR | 1 |
| USER_OBJECTS | 1 |
| IAS_POS_BILL_MST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `IAS_GEN_PKG`, `GEN_PKG`, `IAS_DBS_SYS_PKG`, `YS_GEN_PKG`, `FINGER_PKG`, `SETUP_PKG`, `SECURITY_PKG`, `YS_SCR_PKG`, `IAS_USR_PKG`, `COMM_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT NVL(IAS_PARA_GEN.CONN_DETER_TRMNL,0),NVL(IAS_PARA_GEN.CONN_NOT_MORE_ONE,0),NVL(IAS_PARA_POS.OPEN_SYS_MORE_ONE,0) FROM IAS_PARA_GEN,IAS_PARA_POS
SELECT TRMNL_NAME FROM USER_R WHERE U_ID
SELECT OPN_SYS_MORE_ONCE FROM PRIVILEGE_FIXED WHERE U_ID
SELECT 1 FROM V$SESSION WHERE TERMINAL != USERENV(''TERMINAL'') AND SCHEMANAME = LTRIM(RTRIM(''YSPOS'' || :b1 )) AND ROWNUM <= 1"SELECT 1,TRMNL_LGN FROM USER_R WHERE TRMNL_LGN
UPDATE USER_R SET LOGGED_ON=0"SELECT SID,SERIAL# SERIAL FROM V$SESSION WHERE UPPER(CLIENT_IDENTIFIER) = :b1"SELECT COUNT(*) FROM V$SESSION WHERE UPPER(CLIENT_IDENTIFIER) = :b1 AND UPPER(STATUS) != UPPER(''KILLED
UPDATE USER_R SET LOGGED_ON=NVL(LOGGED_ON,0) - 1 ,TRMNL_LGN= NULL ,LOGOUT=TO_CHAR(IAS_GEN_PKG.GET_CURDATE,''DD/MM/YYYY HH:MI:SS'') WHERE U_ID = :b1 AND LOGGED_ON >= 1" DECRYPT_PASS STANDARD "PKG INIT"DECRYPT_PASS"P_P
Update S_CMPNY SET BRN_USR = Update S_BRN SET BRN_USR = Update S_BRN SET BRN_NO = 1 Update S_BRN SET CMP_GRP = 1 Update S_BRN SET BRN_PARENT = 0 Update ALL_BRANCHES SET CMP_GRP = 1 IAS_SYS.S_TRMNLS LAST_C
SELECT USERNAME USR FROM ALL_USERS WHERE USERNAME LIKE
SELECT CAPTION_DET FROM IAS_SYS
INSERT INTO IAS_USR_LGN_HSTRY ( U_ID,TRMNL_NM,LNG_NO,LGN_TYP,LGN_OUT_DATE,CMP_NO,BRN_NO,BRN_YEAR,BRN_USR )
Select To_Char(Ias_Sys.S_Trmnls_Authrty.Server_No)||'-'|| Nvl(Ias_Sys.S_Trmnls_Authrty.Server_Name,Ias_Sys.S_Trmnls_Authrty.Trmnl_Name) Server_Nm , To_Char(Ias_Sys.S_Trmnls_Authrty.Server_No) From Ias_Sys
Select lang_no||' - '||lang_Name,To_Char(lang_no) From ias_sys
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSLGN_strings.txt`.
