# POSAVLQTY — توثيق شاشة Onyx Pro POS

> النوع: **POS*** — خدمي/مكتبة (Utility)  
> الحجم: 98,892 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POSAVLQTY.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

شاشة من فئة **خدمي/مكتبة (Utility)**. أكثر الجداول استخداماً: `S_THMS`, `IAS_V_ITM_AVL_QTY`, `PRIVILEGE_WH`, `FORM_DETAIL`, `USER_R`, `IAS_PARA_INV`.

## 2. Data Blocks (4)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| BAR | ctrl | -IU | AUTOMATIC |  |
| DMY_BLK | ctrl | QIU | DELAYED |  |
| IAS_V_ITM_AVL_QTY | DB | QIU | DELAYED | ORDER:I_code,W_code |
| FTR | ctrl | QIU | AUTOMATIC |  |

## 3. Canvases (1) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| MAIN | CONTENT | 768×527 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (1)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| MAIN |  | DIALOG | true |

## 5. Triggers (23)

**قياسية (Forms events):** `KEY-CLRBLK`, `KEY-CLRREC`, `KEY-COMMIT`, `KEY-CQUERY`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DUP-ITEM`, `KEY-DUPREC`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-MENU`, `KEY-NXTKEY`, `KEY-PRINT`, `ON-ERROR`, `ON-MESSAGE`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `ONERROR`

## 6. Program Units (8)


**Procedures/Functions (8):** `LOAD_PARAMETER`, `SET_POS_PRC`, `FILL_DATA`, `CHK_B4SAVE_DTL_PRC`, `SAVE_PROC`, `EXIT_PROC`, `UPDATE_PROC`, `FILL_DATA_PRE`

## 7. مكتبات مرفقة (5)

`ERP_YSLIB`, `D2KWUTIL`, `YSERPDBALIB`, `D2KCOMN`, `EDTNLIB`

## 8. Alerts (6)

| Alert | العنوان | النمط | زر1 |
| --- | --- | --- | --- |
| B4_SAVE | تراجع | WARNING | نعم |
| MSGBOX | النظام المالي | NOTE | نعم |
| DEL | تأكيد الحذف | STOP | نعم |
| AL_UNDO | تراجع | WARNING | نعم |
| ADD_F_DOC | إضافة من | NOTE | نعم |
| ALRT_CLR | تنبية | NOTE | نعم |

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

| الجدول/الـ View | عدد مرات الظهور في SQL |
| --- | --- |
| S_THMS | 2 |
| IAS_V_ITM_AVL_QTY | 2 |
| PRIVILEGE_WH | 2 |
| FORM_DETAIL | 1 |
| USER_R | 1 |
| IAS_PARA_INV | 1 |
| WAREHOUSE_DETAILS | 1 |
| IAS_ITM_MST | 1 |
| PRIVILEGE_GC | 1 |
| ITEM | 1 |
| DBA_SNAPSHOTS | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `YS_ITM_LOV_PKG`, `IAS_GEN_PKG`, `IAS_CHECK_SYS_PKG`, `IAS_WCODE_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
SELECT SCR_THEME_NO FROM FORM_DETAIL WHERE FORM_NO
SELECT SCR_THEME_NO FROM USER_R WHERE U_ID
SELECT THM_NO FROM S_THMS WHERE NVL(THM_FLG,0) = 1 AND ROWNUM <= 1"SELECT THM_COLR_DATA FROM S_THMS WHERE THM_NO
Select privilege_wh.w_code From privilege_wh
SELECT CONN_ITM_ACT_BY_USR_PRIV,USE_OUT_BILLS,PRICE_TYPE,NVL(USE_BATCH_NO,0),NVL(USE_EXPIRE_DATE,0),WTAVG_TYPE,COSTING_TYPE,STKCOST_FRACTION,SALES_DISC_TYPE,SC_ITEM_TYPE FROM IAS_PARA_INV,IAS_PARA_AR
select w_code,decode(:Parameter.Lang_No,1,nvl(w_name,w_e_name),nvl(w_e_name,w_name)) w_name from warehouse_details
Select 1 From Privilege_wh Where U_Id=:Parameter.User_No And Nvl(View_Flag,0)=1 And W_Code=warehouse_details.W_Code and rownum <=1)) order by w_code W_CODE W_NAME RG_I_CODE Select M.I_Code, Decode(:Parameter.Lang_No,1,Nvl(M.I_Name,M.I_E_Name),Nvl(M.I_E_Name,M.I_Name)) I_Name, M.I_Desc From Ias_Itm_Mst M ,IAS_V_ITM_AVL_QTY N
Select m.i_code i_code , M.i_name , M.i_e_name, M.itm_unt itm_unt , M.W_CODE, SUM(M.AVL_QTY) AVL_QTY From IAS_V_ITM_AVL_QTY M GROUP BY m
SELECT LAST_REFRESH FROM DBA_SNAPSHOTS WHERE NAME
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POSAVLQTY_strings.txt`.
