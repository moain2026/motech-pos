# POSTIN_MTX — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 68,224 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSTIN_MTX.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **حركات/فواتير (Transactions)**. أكثر الجداول استخداماً: `MTX_JV_DTLS`, `ACCOUNT_CURR`, `DETAIL_JOURNAL`, `MTX_JVS`, `MTX_JV_TYPS`, `DETAIL_PERIODS`.

## 2. Data Blocks (2)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| POSTING_MTX | ctrl | QIU | AUTOMATIC |  |
| TSK_PROGRESS | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (2) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| POSTING_MTX | CONTENT | 540×324 | visible |
| TSK_PROGRESS | CONTENT | 284×198 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (2)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| POSTING_MTX |  | DOCUMENT | false |
| TSK_PROGRESS |  | DIALOG | false |

## 5. Triggers (3)

**قياسية (Forms events):** `ON-ERROR`, `ON-MESSAGE`, `WHEN-NEW-FORM-INSTANCE`

## 6. Program Units (6)

**Packages (spec):** `F50WRITE`


**Packages (body):** `F50WRITE`


**Procedures/Functions (4):** `PROGRESS`, `CHECK_DATE`, `UPGRADE_ACC`, `POST_MTX_JVS`

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| MTX_JV_DTLS | 4 |
| ACCOUNT_CURR | 3 |
| DETAIL_JOURNAL | 2 |
| MTX_JVS | 2 |
| MTX_JV_TYPS | 1 |
| DETAIL_PERIODS | 1 |
| DATE_LOCK | 1 |
| ACCOUNT | 1 |
| EX_RATE | 1 |
| MASTER_JOURNAL | 1 |

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select ' '||' ','-1' From Dual Union
Select To_Char(JV_TYP_NO)||'-'||JV_TYP_ADES, To_Char(JV_TYP_NO) From MTX_JV_TYPS
SELECT STATUS FROM DETAIL_PERIODS WHERE :b1 BETWEEN FROM_DATE AND TO_DATE"SELECT COUNT(*) FROM DATE_LOCK WHERE
SELECT A_PARENT FROM ACCOUNT WHERE A_CODE
SELECT NVL(CURR_BAL,0) FROM ACCOUNT_CURR WHERE A_CODE
INSERT INTO DETAIL_JOURNAL ( J_DATE,JV_TYPE,DOC_NO,DOC_TYPE,A_CODE,AMT,MNTH,YEAR,A_CY,MN_SB,CB_BEFORE,CB_AFTER )
SELECT ACCT_NO,CURR_SHRT FROM MTX_JV_DTLS,GEN_CURR WHERE MTX_JV_DTLS
SELECT TO_NUMBER(A_CODE),A_CY FROM ACCOUNT_CURR
SELECT ACCT_NO FROM MTX_JV_DTLS,ACCOUNT WHERE MTX_JV_DTLS.ACCT_NO = TO_NUMBER(ACCOUNT.A_CODE) AND ACCOUNT.AC_CLOSE = 2"SELECT JV_SER FROM (SELECT JV_SER,SUM(DTL_CR) - SUM(DTL_DB) AMT,SUM(DTL_LCR) - SUM(DTL_LDB) LOCA_AMT FROM MTX_JV_DTLS GROUP BY JV_SER
SELECT * FROM MTX_JVS WHERE TRUNC(JV_DATE) BETWEEN TRUNC(NVL(:b1,JV_DATE)) AND TRUNC(NVL(:b2,JV_DATE)) AND JV_TYP_NO = NVL(:b3,JV_TYP_NO)"SELECT BRN_NO,FIN_YR,JV_SER,DTL_SER,ACCT_BRN_NO,ACCT_NO,MTX_JV_DTLS.CURR_NO,DTL_NOTE,DTL_CR,DTL_DB,EXCH_RATE,DTL_LCR,DTL_LDB,CURR_SH RT FROM MTX_JV_DTLS,GEN_CURR WHERE MTX_JV_DTLS
SELECT CUR_CODE FROM EX_RATE WHERE L_F
INSERT INTO MASTER_JOURNAL ( JV_TYPE,DOC_NO,DOC_TYPE,J_DATE,J_POSTED,J_CLOSE,MNTH )
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSTIN_MTX_strings.txt`.
