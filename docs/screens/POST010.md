# POST010 — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 296,424 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST010.fmx`

## 1. الوظيفة

_(من ملف المساعدة poshelp.chm — en)_

> Cash Payment for Invoices 
>  > 
>  POS System > System Transactions > 
>  Cash Payment for Invoices 
>  Use: This screen is 
> used in the cash invoices payment, noting that using it becomes mandatory upon 
> activating the (Paying Sales Invoices from Payment Screen) parameter in the POS 
> Parameters and Settings screen. It separates between the selling transaction and 
> the payment transaction; therefore, the selling can be done in a certain POS 
> (Cashier), while the invoice payment can be made in another POS (Cash). It is 
> important to note that the invoices cannot be posted to the Onyx system until 
> the payment is done, which means that the status for all the invoices will be 
> the same as the pending invoices and that the user can delete some of the 
> invoice items upon the customer’s demand. 
>  How to Use Screen 
>  After clicking on the Modify button, the screen is used as 
> follows: 
>  - 
>  Invoice 
> Number: The invoice 
> number is entered manually, and then the user clicks on the ENTER button to 
> display all the invoice data. Note that an alert message may appear to the user 
> in the following cases: 
>  ? 
>  The invoice has 
> already been paid 
>  ? 
>  The invoice has 
> been posted to the Onyx system 
>  ? 
>  The invoice has 
> an invalid number 
>  - 
>  After displaying 
> the invoice data, the items can be deleted by using the right click of the mouse 
> to select the Delete Record option. 
>  - 
>  Paid 
> Amount: The amount that 
> has been paid by the customer is entered here; therefore, the remaining amount 
> automatically appears to be delivered to the customer. 
>  - 
>  User 
> Number: The system 
> automatically displays the name of the user who made the 
> payment. 
>  - 
>  Payment 
> Date: The system 
> automatically displays the payment date and time. 
>  - 
>  Payment: This parameter 
> appears as activated for the invoic

## 2. Data Blocks (11)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| HDR | ctrl | -IU | AUTOMATIC |  |
| BAR | ctrl | -IU | AUTOMATIC |  |
| PARAMTRS | ctrl | QIU | AUTOMATIC |  |
| IAS_POS_BILL_MST | DB | Q-U | DELAYED | WHERE:AND NVL(PAID_BILL,0)=0 AND NVL(Posted,0); ORDER:BILL_D |
| IAS_POS_BILL_DTL | DB | QIU | AUTOMATIC |  |
| PRNT | ctrl | QIU | AUTOMATIC |  |
| DMY_LOCK | ctrl | QIU | AUTOMATIC |  |
| BTN_DOC | ctrl | -IU | AUTOMATIC |  |
| CLNDR | ctrl | QIU | DELAYED |  |
| CALL_SCR_LNK | DB | Q-- | AUTOMATIC | WHERE:FORM_NO=:1 AND U_ID=:2; ORDER:ORDR_NO |
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
| MAIN |  | DOCUMENT | false |
| WIN_PRNT | Print Options | DIALOG | false |
| WIN_LOCK | 5055 | DIALOG | true |
| WIN_CLNDR | Calender\التقويم | DIALOG | true |
| WIN_CALL_SCR_LNK | Shorcuts | DIALOG | true |

## 5. Triggers (46)

**قياسية (Forms events):** `KEY-COMMIT`, `KEY-CREREC`, `KEY-DELREC`, `KEY-DOWN`, `KEY-ENTER`, `KEY-ENTQRY`, `KEY-EXEQRY`, `KEY-EXIT`, `KEY-HELP`, `KEY-LISTVAL`, `KEY-MENU`, `KEY-NEXT-ITEM`, `KEY-OTHERS`, `KEY-PREV-ITEM`, `KEY-PRINT`, `KEY-SCRDOWN`, `KEY-SCRUP`, `KEY-UP`, `ON-CLEAR-DETAILS`, `ON-ERROR`, `ON-LOCK`, `ON-MESSAGE`, `POST-FORMS-COMMIT`, `PRE-FORM`, `WHEN-NEW-FORM-INSTANCE`, `WHEN-TAB-PAGE-CHANGED`, `WHEN-TIMER-EXPIRED`, `WHEN-WINDOW-ACTIVATED`, `WHEN-WINDOW-CLOSED`


**مخصّصة (custom):** `KEY_ADD2`, `KEY_APRRVSCR`, `KEY_ARCHVSCR`, `KEY_AUDITSCR`, `KEY_FRSTREC`, `KEY_INCTVSCR`, `KEY_JRNLSCR`, `KEY_LCKSCR`, `KEY_LNKSCR`, `KEY_LSTREC`, `KEY_MODREC`, `KEY_NXTREC`, `KEY_PRVSREC`, `KEY_RPRTSCR`, `KEY_SAMSCR`, `KEY_TREESCR`, `LOV_TRG`

## 6. Program Units (33)


**Procedures/Functions (33):** `ADD_PROC`, `ADD_PROC2`, `B4SAVE_PRC`, `CALL_BTN_SCR`, `CALL_SCR_PRINT`, `CHECK_DUPLICATE`, `CHK_B4SAVE_DTL_PRC`, `CHK_B4SAVE_MST_PRC`, `DELETE_PROC`, `DEL_DET_REC_PRC`, `ENA_DIS_ITM_PRC`, `EXIT_PROC`, `FILL_ALL_LIST_PRC`, `KEY_ENTQRY`, `KEY_EXEQRY`, `KEY_LISTVAL_PRC`, `LIST_PROC`, `LOAD_PARAMETERS`, `POST_FORMS_COMMIT_PRC`, `PRE_FORM_PRC`, `PRINT_PROC`, `SAVE_PROC`, `SET_POS_PRC`, `UPDATE_PROC`, `WHEN_NEW_FORM_INSTANCE_PRC`, `WHEN_TAB_PAGE_CHANGED_PRC`, `WHEN_TIMER_EXPIRED_PRC`, `AUD_ITM`, `SHOW_DATA`, `CHECK_PACKAGE_FAILURE`, `QUERY_MASTER_DETAILS`, `CLEAR_ALL_MASTER_DETAILS`, `CALL_SCR_LNK_PRC`

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
| IAS_POS_PRIV_MACHINE | 8 |
| USER_R | 4 |
| IAS_POS_MACHINE | 2 |
| IAS_POS_BILL_MST | 2 |
| CASH_IN_HAND | 2 |
| IAS_PARA_POS | 1 |
| IAS_POS_AUD_ITEM | 1 |
| IAS_POS_RT_BILL_MST | 1 |
| USER | 1 |
| IAS_POS_BILL_DTL | 1 |
| IAS_ITM_MST | 1 |
| S_CLNDR_LIST | 1 |


**حِزَم DB المُستدعاة (PL/SQL packages):** `GEN_PKG`, `IAS_GEN_PKG`, `DATE_CNVRTR_PKG`, `IAS_USR_PKG`, `IAS_ITM_PKG`, `YS_SCR_PKG`, `POS_PKG`, `YS_GEN_PKG`, `IAS_PRMTR_PKG`, `SETUP_PKG`, `CID_ADDR_OP_PKG`

## 10. عيّنة جُمل SQL مُستخرَجة (proof)
```sql
Select 1 From Ias_Pos_Priv_Machine Where Ias_Pos_Priv_Machine.Machine_No = Ias_Pos_Bill_Mst.Machine_No And Nvl(Used,0) = 1 And RowNum <= 1 ) Ias_Pos_Bill_Mst Nvl(Paid_Bill,0)=0 And Nvl(Posted,0)=0 And Bill_Type = 1 And Exists(Select 1 From Ias_Pos_Priv_Machine
Select 1 From Ias_Pos_Priv_Machine Where Ias_Pos_Priv_Machine.Machine_No = Ias_Pos_Bill_Mst.Machine_No And Nvl(Used,0) = 1 And RowNum <= 1 ) (Nvl(Paid_Bill,0)=0 And Nvl(Posted,0)=0) And Bill_Type = 1 And Exists(Select 1 From Ias_Pos_Priv_Machine
SELECT NVL(USE_PAID,0),NVL(PRINT_BILL,0),NVL(SHOW_DISC_PER_ITEMS_AR,0),NVL(AUDIT_DEL_ITM,0) FROM IAS_PARA_POS,IAS_PARA_AR
SELECT UPPER(USERENV(''Terminal'')) FROM DUAL
SELECT 1 FROM IAS_POS_MACHINE WHERE UPPER(TERMINAL) = UPPER(:b1) AND ROWNUM <= 1"SELECT MACHINE_NO FROM IAS_POS_MACHINE WHERE UPPER
INSERT INTO IAS_POS_AUD_ITEM ( BILL_NO,BILL_TIME,A_CY,BILL_RATE,MACHINE_NO,I_CODE,P_SIZE,ITM_UNT,I_QTY,I_PRICE,BARCODE,AUD_U_ID,AUD_DATE,BRN_NO,BRN_YEAR,CMP_NO,BRN_USR )
SELECT :b1,TO_CHAR(IAS_GEN_PKG.GET_CURDATE,''HH24:MI:SS''),:b2,:b3,:b4,:b5,:b6,:b7,:b8,:b9,:b10,:b11,IAS_GEN_PKG.GET_CURDATE,:b12,:b13,:b14,:b15 FROM DUAL
SELECT PAID_BILL,POSTED FROM IAS_POS_BILL_MST WHERE BILL_NO
Select Bill_Date, Flg_Desc T_Name, Bill_No, Bill_Type, Decode(Ias_Pos_Bill_Mst.Hung,1,Ias_Gen_Pkg.Get_Prompt(:Parameter.Lang_No,1948)) Stand_By From Ias_Pos_Bill_Mst,S_Flags
Select 1 From Ias_Pos_Priv_Machine Where Ias_Pos_Priv_Machine.Machine_No = Ias_Pos_Bill_Mst.Machine_No And Nvl(Used,0) = 1 And RowNum <= 1 ) Order By Ias_Pos_Bill_Mst.Bill_Date,Ias_Pos_Bill_Mst.Bill_No,Ias_Pos_Bill_Mst.Ad_U_Id Select Rt_Bill_Date, Flg_Desc T_Name, Rt_Bill_No, Rt_Bill_Type From Ias_Pos_Rt_Bill_Mst,S_Flags
SELECT A_CODE FROM USER_R WHERE U_ID = :b1"SELECT CASH_NO FROM CASH_IN_HAND WHERE A_CODE
SELECT DECODE(:b1,1,NVL(I_NAME,I_E_NAME),NVL(I_E_NAME,I_NAME)) FROM IAS_ITM_MST WHERE I_CODE
```

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST010_strings.txt`.
