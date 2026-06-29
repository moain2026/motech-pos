# YSPOS23 — تحليل الحُزم ومنطق الأعمال (Packages & Business Logic Analysis)

> **المنهج:** proof-not-assumption — كل اسم package/procedure/function/جدول مذكور أدناه مُستخرَج **حرفياً** من ملفات المصدر في `/home/work/motech-pos/db/schema/plsql/` (تمت قراءة الأجسام `BODY` فعلياً وليس التعريفات فقط).
> **المدخلات:** 91 ملف PL/SQL (58 package spec+body مدمج، 20 function، 10 procedure، 2 trigger، 1 type) + 117 ملف DDL.
> **التاريخ:** 2026-06-29 (المرحلة 0-ب).
> **ملاحظة معمارية:** النظام موزّع (POS فرعي ↔ Main server) عبر database links (`IAS_POS_SERVER_DB_LINK`). الفاتورة تُستقبل XML من الكاشير، تُعالَج وتُحفظ، ثم تُرحَّل/تُزامَن. كل المنطق المالي مفروض في طبقة PL/SQL وليس في قيود DB.

---

## 0) خريطة الحُزم حسب الدور

| المجموعة | الحزمة | الدور المختصر |
|----------|--------|---------------|
| **قلب الـAPI** | `PKG_POS_API_PKG` (426KB) | استقبال/استخراج XML الفاتورة، حساب الضريبة والخصم، الإدراج، الترحيل |
| توليد أرقام/عام | `PKG_POS_GNR_PKG` | توليد رقم الفاتورة، رقم الوردية، طابور SQL غير المتزامن، فحص اتصال السيرفر الرئيسي |
| الورديات | `PKG_POS_WRK_SHFT_PKG` | فتح/إقفال/فحص ورديات الكاشير |
| الولاء | `PKG_POS_POINT_PKG` | حساب نقاط الولاء، استبدالها، صلاحيتها |
| الضريبة | `PKG_YS_TAX_PKG` | نِسَب الضريبة، حركة ضريبة الصنف/المدخلات بعد الحفظ |
| الترحيل/المزامنة | `PKG_POS_MOV_TRNS_PKG` | نقل الفواتير والمرتجعات والورديات من POS إلى Main عبر DB link |
| المزامنة التلقائية | `PKG_POS_SYNC_JOB_AUTO_PKG` | Job يدفع الفواتير لمنصّة الفوترة الإلكترونية |
| الفوترة الإلكترونية | `PKG_GNR_E_INVC_OP`, `PKG_GNR_TECH_SOLUTION_PKG`, `PKG_GNR_SND_DATA_TO_API_PKG`, `PKG_POS_UPLINES_PKG` | بناء/إرسال المستند الضريبي + المرتجع |
| الرسوم الإضافية | `PKG_POS_OTHR_CHRG_PKG` | رسوم خدمة/توصيل + ضريبتها |
| السندات | `PKG_POS_RCPTS_EXPNS_API_PKG` | سندات قبض/صرف |
| Snapshot/MV | `PKG_POS_SNPSHT_PKG` | إدارة الـMaterialized Views (الكميات المتاحة) |

---

## 1) `PKG_POS_API_PKG` — قلب نظام نقطة البيع

أكبر حزمة (426KB). تستقبل بيانات الفاتورة كـ **XML CLOB**، تستخرجها بـ `EXTRACTVALUE`/`XMLSEQUENCE`، تحسب، وتحفظ.

### 1.1 الإجراءات المحورية (أسماء حقيقية)

| Procedure/Function | الوظيفة |
|--------------------|---------|
| `EXTRCT_POS_BILL_PRC(P_XML CLOB, P_JSON_RSLT OUT CLOB)` | **نقطة الدخول الرئيسية** لفاتورة مبيعات. يفكّ XML لرأس `IAS_POS_BILL_MST` ثم الأسطر، يحسب، يحفظ، ويرجّع JSON بـ `_Doc_No/_ErrMsg/_ErrNo/_DOC_UUID`. |
| `EXTRCT_POS_RT_BILL_PRC` | نفس المنطق لكن للفاتورة اللحظية (Real-Time) → `IAS_POS_RT_BILL_MST/DTL`. |
| `INSRT_IAS_POS_BILL_MST(...)` | إدراج رأس الفاتورة في `IAS_POS_BILL_MST`. |
| `INSRT_IAS_POS_BILL_DTL(...)` | إدراج أسطر الفاتورة في `IAS_POS_BILL_DTL`. |
| `CLC_DISC_VAT_AMT_PRC(...)` | **توزيع خصم الرأس** (`DISC_AMT_MST`) على الأسطر تناسبياً مع/بدون ضريبة وبطاقة خصم. |
| `CLC_ITM_TAX(...)` | **حساب ضريبة الصنف** للسطر الواحد قبل الحفظ. |
| `PST_INSRT_BILL_PRC` / `UPDT_BILL_IN_SAV_PRC` | **ما بعد الإدراج**: إعادة تجميع إجماليات الفاتورة من الأسطر وتحديث الرأس + تطبيق العروض. |
| `CHK_BILL_NO_ST_PRC(...)` | **فحص حالة الفاتورة** عبر السيرفرات (محلي/أرشيف/DB link) قبل الإرجاع/التغيير. |
| `Chk_Itm` / `CHK_ITM_PRICE` / `Chk_Price_Lmt` | التحقق من الصنف والسعر وحدود السعر قبل القبول. |
| `EXTRCT_POS_SALES_ORDR_PRC` + `INSRT_SALES_ORDER_MST_FNC/DTL_FNC` | أوامر البيع (`SALES_ORDER`/`ORDER_DETAIL`). |
| `GET_BILL_DATA_XML` / `GET_BILL_MST_XML` / `GET_BILL_DTL_XML` | إرجاع بيانات الفاتورة كـ XML/CLOB للطباعة/الاسترجاع. |
| `INSRT_IAS_CASH_CUSTMR` + `EXTRCT_CASH_CUSTMR_PRC` | إنشاء/تحديث العميل النقدي. |
| `SYNC_E_INVC_PRC(P_DOC_TYPE, ...)` | استدعاء مزامنة المستند للفوترة الإلكترونية. |
| `Snd_Vrfct_Msg_Prc` | إرسال رسالة تحقق للجوال. |

### 1.2 منطق وضع الحفظ — `SAVE_TYP` (مستخرَج من `EXTRCT_POS_BILL_PRC`)

علّق الكود نفسه على المعنى:
```
SAVE_TYP --# 0 OFFLINE 1 ONLINE SAVE IN DB
         --  2 ONLINE CLC AND RETURN BILL DATA XML NO SAVE
         --  3 ONLINE SAVE BILL AFTER CLC AND RETURN BILL DATA
```
- `SAVE_TYP=0` (offline): يجب أن يكون `BILL_NO` موجوداً (الكاشير ولّد الرقم محلياً)؛ غير ذلك → `RAISE_APPLICATION_ERROR(-20904,'Error App BILL_NO IS NULL')`.
- `SAVE_TYP>0` (online): النظام يولّد الرقم بـ `POS_GNR_PKG.GET_BILL_NO_PRC` ويحدّث التاريخ بـ `GET_DATE_INCRS_DCRS_PRC`.
- **إعادة بناء فاتورة معلّقة (HUNG):** عند `HUNG=1` يحذف النظام أولاً من `IAS_POS_BILL_MST`, `IAS_POS_BILL_DTL`, `POS_TAX_ITM_MOVMNT (DOC_TYPE=4)`, `IAS_POS_PAY_BILLS` ثم يعيد الإدراج.

### 1.3 منطق الضريبة في `CLC_ITM_TAX` (مستخرَج)

- النسبة من `Ys_Tax_Pkg.Get_Itm_Tax_Prcnt(P_CLC_TYP_NO_TAX, P_I_CODE)`.
- نوع الحساب `P_CALC_VAT_AMT_TYPE`:
  - `=1`: الضريبة على السعر الكامل: `VAT_AMT = ROUND(I_PRICE * VAT_PRCNT/100, 12)`.
  - `=2`: الضريبة على السعر **بعد الخصم**: `VAT_AMT = ROUND((I_PRICE-(DIS_AMT_DTL+DIS_AMT_MST))*VAT_PRCNT/100,12)` ويُحسب `VAT_DISC_AMT` للجزء المخصوم.
- سعر شامل الضريبة (`USE_PRICE_INCLUDE_VAT=1`): `DIS_AMT_DTL = ROUND(DIS_AMT_DTL_VAT / (VAT_PRCNT/100 + 1), 12)`.
- يخرج: `VAT_AMT_BFR_DIS`, `VAT_AMT_AFTR_DIS`, `VAT_AMT_DIS_MST_VAT`, `DIS_AFTR_VAT_MST`.

### 1.4 منطق الخصم في `CLC_DISC_VAT_AMT_PRC` (مستخرَج)

يوزّع **خصم الرأس** على كل سطر تناسبياً:
```
P_DIS_AMT_MST = (DISC_AMT_MST / (TOT_ITEM_PRICE - TOT_DISC)) * (I_PRICE - DIS_AMT_DTL)   -- مع علم CLC_SI_DISC_WITHOUT_ITM_DISC=1
P_DIS_AMT     = DIS_AMT_MST + DIS_AMT_DTL
```
يتعامل مع: بطاقة خصم (`DISC_CARD_PRCNT`)، عروض (`TOTAL_PRICE_WITH_PRM`)، خصم قبل/بعد الضريبة.

### 1.5 إعادة التجميع في `UPDT_BILL_IN_SAV_PRC` (ما بعد الحفظ)

- يستدعي `GNR_QTN_PRM_PKG.CLC_DOC_QTN_PRM` لتطبيق العروض/التسعير على المستند.
- يعيد جمع الإجماليات من `IAS_POS_BILL_DTL`:
  `SUM(I_QTY*I_PRICE)`, `SUM(I_QTY*I_PRICE_VAT)`, `SUM(I_QTY*DIS_AMT_DTL)`, `SUM((I_QTY+FREE_QTY*CLC_TAX_FREE_QTY_FLG)*VAT_AMT)` → يحدّث رأس الفاتورة.

### 1.6 أعمدة رأس الفاتورة (من جملة `INSERT INTO IAS_POS_BILL_MST` الحقيقية)

`BILL_NO, BILL_SRL, DOC_MCHN_SQ, BILL_DATE, BILL_TIME, BILL_TYPE, SI_TYPE, C_CODE, A_CY, BILL_RATE, BILL_AMT, CASH_NO, POSTED, MACHINE_NO, HUNG, PAYED_AMT, CARD_AMT, VAT_AMT, DISC_AMT, DISC_AMT_MST, DISC_AMT_DTL, W_CODE, POINT_RPLC_AMT, POINT_TYP_NO, POINT_CALC_TYP_NO, MOBILE_NO, CUST_CODE, CLC_TYP_NO_TAX, CREDIT_CARD, ...`

---

## 2) `PKG_POS_GNR_PKG` — التوليد والبنية التحتية

| Function/Procedure | الوظيفة (مستخرَجة) |
|--------------------|---------------------|
| `GET_BILL_NO_PRC(...)` | **توليد رقم الفاتورة**. يقرأ `IAS_PARA_POS` (`POS_BILL_SERIAL`, `USER_DIGIT`, `MACHINE_DIGIT`, `SERIAL_DIGIT`)، يركّب الرقم: `سنتين + SRVR_NO + LPAD(MACHINE_NO) + [AD_USR_NO] + LPAD(SALE_SER+1)`. `BILL_SRL = سنتين+'01'+LPAD(SRVR_NO,3)+LPAD(MCHN,5)+DOC_MCHN_SQ`. يحدّث `IAS_POS_MACHINE.SALE_SER`. |
| `GET_RT_BILL_NO_PRC` | نفس المنطق لرقم الفاتورة اللحظية. |
| `GET_DATE_INCRS_DCRS_PRC` | ضبط تاريخ/وقت الفاتورة (منع التكرار/الانزياح). |
| `GET_USD_WRK_SHFT_FNC`, `CHK_WRK_SHFT_CSHR_FNC`, `GET_WRK_SHFT_OPN_FNC` | دوال الوردية (wrappers لـ WRK_SHFT). |
| `GET_SRVR_NO_FNC(P_HST_NM)` | رقم السيرفر الحالي. |
| `ADD_SQL_QUEUE_TSK_PRC` + `EXEC_SQL_QUEUE_TSK_PRC` | **طابور SQL غير متزامن** عبر جدول `POS_SQL_QUEUE`: يدرج جملة SQL مع `EXEC_TIME/RTRY_CNT/ALLWD_RTRY_CNT`، يفعّل `DBMS_SCHEDULER` job `POS23_SQL_QUEUE_JOB`، ينفّذ ويعيد المحاولة عند الفشل ثم يحذف عند النجاح. |
| `EXECUTE_PRGMA_PRC` | تنفيذ ديناميكي معزول (autonomous-style). |
| `CHK_MAIN_SRVR_CNCT_FNC(P_DB_LNK)` | فحص اتصال السيرفر الرئيسي قبل المزامنة. |
| `INSRT_INSTAL_CMPNY_PRC` | شركات التقسيط. |

---

## 3) `PKG_POS_WRK_SHFT_PKG` — الورديات والكاشير

| Function/Procedure | الوظيفة (مستخرَجة) |
|--------------------|---------------------|
| `GET_WRK_SHFT_OPN_FNC(P_CSHR_NO)` | **يرجع SHFT_SRL لوردية الكاشير المفتوحة**: `MIN(SHFT_SRL) FROM POS_WRK_SHFT_CSHR WHERE CSHR_NO=? AND CLS_DATE IS NULL`. يتحقق ألا يوجد إيداع عملة (`IAS_DEPOSIT_CURRENCY_MST`) وأن `SYSDATE` ضمن `F_DATE/F_TIME .. T_DATE/T_TIME` و`CLS_FLG=0`. |
| `CHK_WRK_SHFT_CSHR_FNC` | هل للكاشير وردية مفتوحة. |
| `GET_USD_WRK_SHFT_FNC(P_MCHN_NO)` | الوردية المستخدمة على الجهاز. |
| `CHK_SHFT_INTRFRNC` | تداخل أوقات الورديات. |
| `GET_PNG_BLNC(P_SHFT_SRL)` | الرصيد الافتتاحي: `SUM(CSH_AMT*CUR_RATE) FROM POS_FNCL_ADVNC_CSHR WHERE SHFT_SRL=?`. |
| `INSRT_WRK_SHFTS(P_XML_INPT CLOB)` | **فتح/إقفال وردية** من XML → `POS_WRK_SHFT_CSHR` (الحقول: `SHFT_NO, SHFT_SRL, SHFT_CODE, CSHR_NO, F_DATE/T_DATE, F_TIME/T_TIME, CLS_FLG, CLS_DATE, CLS_U_ID`). يرجّع JSON `_DOC_NO/_DOC_SRL/_ErrMsg`. |
| `GET_SHFT_INFO`, `GET_AVL_SHFT_INFO`, `GET_OPN_WRK_SHFT_LST`, `GET_CSHRS`, `GET_CURR_DFLT`, `GET_CASH_CTGRIES` | استعلامات شاشات الوردية. |

**الجداول:** `POS_WRK_SHFT` (تعريف، PK=`SHFT_CODE`), `POS_WRK_SHFT_CSHR` (فتح/إقفال، PK=`SHFT_SRL`), `POS_FNCL_ADVNC_CSHR` (سُلف/عهدة), `IAS_DEPOSIT_CURRENCY_MST/DTL` (إيداع العملة عند الإقفال).

---

## 4) `PKG_POS_POINT_PKG` — نقاط الولاء

| Function/Procedure | الوظيفة (مستخرَجة) |
|--------------------|---------------------|
| `Get_Point_Cnt(P_Point_Typ_No, P_Bill_Amt, P_G_Code)` | **عدد النقاط المكتسبة** من مبلغ الفاتورة حسب نوع النقاط. |
| `Get_Point_Amt` / `Get_Point_Rplc_Amt` | قيمة النقاط / قيمة الاستبدال. |
| `Get_Point_Rplc_Cnt(P_Point_Typ_No, P_Amt_Rplc)` | عدد النقاط المقابل لمبلغ مُستبدَل. |
| `Get_Cust_Point_bal` | رصيد نقاط العميل. |
| `Get_Cust_Point_typ` / `Get_Point_Calc_Typ` / `Check_Point_Type_State` | نوع النقاط وحالته. |
| `Get_Point_Typ_Min_Lmt` | الحد الأدنى للاستبدال. |
| `Chk_Point_Trns` / `Get_bill_doc_amt_point_fnc` | صلاحية حركة النقاط للفاتورة. |
| `Check_Insert_Expired_Point` | إدراج/تصفية النقاط المنتهية. |
| `Insrt_Pos_Point_Trns(...)` | **تسجيل حركة نقاط** في `Pos_Point_Calc_trns` (الحقول: `TRNS_NO, TRNS_DATE, CUST_CODE, MOBILE_NO, POINT_TYP_NO, Bill_NO, DOC_AMT, POINT_CNT, TRNS_TYPE, Point_Amt, EXPIRE_DATE, EXTERNAL_POST`). يحسب تاريخ الانتهاء عبر `Get_Expire_Date` ويدعم الإدراج عبر DB link (`P_Db_Link`). |

> الجداول المرجعية (`IAS_POINT_TYP_MST`, `IAS_CASH_CUSTMR`) في الـschema المركزي؛ التسلسل `POS_POINT_SEQ` محلي.

---

## 5) `PKG_YS_TAX_PKG` — الضريبة (VAT)

| Function/Procedure | الوظيفة (مستخرَجة) |
|--------------------|---------------------|
| `GET_ITM_TAX_PRCNT(P_CLC_TYP_NO, P_I_CODE)` | **نسبة ضريبة الصنف** (الأساس لكل الحسابات). |
| `CHK_USE_TAX(P_CLC_DOC_TYP)` | هل الضريبة مفعّلة (`1=SALES,2=PURCHASE,3=BOTH`). |
| `GET_CLC_TYP_NO_DFLT(P_BRN_NO)` / `GET_CLC_TYP_NO` / `GET_CLC_TAX_TYP` | نوع حساب الضريبة الافتراضي/التحويل بينه. |
| `GET_TAX_BILL_TYP(P_BILL_TYPE, P_C_CODE)` / `GET_CST_TAX_BILL_TYP` | نوع الفاتورة الضريبي حسب العميل. |
| `CHK_TAX_STNDRD(P_CLC_TYP_NO)` | هل نوع الضريبة قياسي. |
| `GET_INPT_PRCNT(P_CLC_TYP_NO, P_INPT_TYP, P_INPT_CODE)` | نسبة ضريبة المدخلات (للرسوم/الخدمات). |
| `CLC_ITM_TAX_AFTR_SAVE(...)` | **بناء حركة ضريبة الصنف بعد الحفظ** في `POS_TAX_ITM_MOVMNT`: يحذف الحركة القديمة لنفس `DOC_TYPE/DOC_SER`، يحسب `ITM_NET_PRICE = I_PRICE-(DIS_AMT_MST+DIS_AMT_DTL)*(I_QTY/(I_QTY+FREE_QTY))`, `ITM_NET_AMT`, `NET_TAX_AMT = ITM_NET_AMT*TAX_PRCNT/100`, ويملأ حقول الفاتورة الإلكترونية (`ITM_VAT_CAT_CODE, ITM_VAT_EX_RSN_CODE, TAX_CUR_CODE, TAX_CUR_RATE, BILL_TAX_STATUS`). |
| `CLC_INPT_TAX_AFTR_SAVE` | نفس المنطق لضريبة المدخلات → `POS_TAX_INPT_MOVMNT`. |
| `DEL_TAX_MOVMNT` | حذف حركة الضريبة. |
| `GET_ETS_SRVC_FLG_FNC(P_BRN_NO)` | هل المزامنة الفورية للفوترة الإلكترونية مفعّلة. |
| `GET_TAX_PRD(P_DOC_DATE)` / `GET_CLC_TYP_NO_ACTV_DATE` | الفترة الضريبية وتاريخ تفعيل نوع الحساب. |

**الجداول:** `POS_TAX_ITM_MOVMNT` (+`_HSTRY`), `POS_TAX_INPT_MOVMNT`. مرجع: `GNR_TAX_CODE_MST`, `GNR_TAX_TYP_CLC_MST` (مركزي).
**Triggers:** `TRG_IAS_POS_BILL_CHK_TYP_TAX_TRG` و`TRG_IAS_POS_RTBILL_CHK_TYPTAX_TRG` لفرض نوع الضريبة على الفاتورة/الفاتورة اللحظية.

---

## 6) `PKG_POS_OTHR_CHRG_PKG` — الرسوم الإضافية

| Function/Procedure | الوظيفة (مستخرَجة) |
|--------------------|---------------------|
| `INSRT_OTHR_CHRG_MVMNT(...)` | إدراج حركة رسوم خدمة/توصيل → `POS_OTHR_CHRG_MVMNT`. |
| `INSRT_RQ_OTHR_CHRG_MVMNT_PRC` | رسوم طلبات → `POS_RQ_OTHR_CHRG_MVMNT`. |
| `CALC_VAT_AMT_OTHR(P_SRVC_AMT)` | **ضريبة الرسم**: إن كان نوع الحساب غير معفى و`USE_VAT=1` بعد `ACTIVE_VAT_DATE` → `L_VAT_AMT = SRVC_AMT * GET_INPT_PRCNT/100`. يدعم مبلغ شامل/غير شامل الضريبة (`AMT_TYPE 0=نسبة 1=مبلغ`). |

---

## 7) `PKG_POS_MOV_TRNS_PKG` — الترحيل والمزامنة إلى السيرفر الرئيسي

كل الإجراءات تأخذ `(P_POS_SCMA, P_DB_LNK)` وتنقل البيانات من قاعدة POS الفرعية إلى Main:

| Procedure | ما يُنقل |
|-----------|----------|
| `MOV_BILLS_PRC` | **ترحيل فواتير المبيعات** (`POSTED=0, HUNG=0`). **يحرس** أولاً: إن كانت الفوترة الإلكترونية مفعّلة (`Use_e_invoice=1`) وهناك فواتير لم تُزامَن (`WEB_SRVC_TRNSFR_DATA_FLG<>1`, `FDA_CODE IS NULL`) → `RAISE_APPLICATION_ERROR(-20001,'There are tax bills not Sync...')`. |
| `MOV_BILLS_TO_HSTRY_PRC` | نقل المُرحَّلة إلى `IAS_POS_HST_BILL_MST/DTL`. |
| `MOV_BILLS_TAX_TO_HSTRY_PRC` | أرشفة حركة الضريبة. |
| `MOV_RTRN_BILLS_PRC` / `MOV_RTRN_BILLS_TO_HSTRY_PRC` / `MOV_RTRN_TAX_TO_HSTRY_PRC` | المرتجعات. |
| `MOV_RT_PYMNT_CSH_PRC` / `_TO_HSTRY_PRC` | دفعات الفواتير اللحظية. |
| `MOV_BILLS_DIFF_PRC` / `MOV_RTRN_BILLS_DIFF_PRC` | فروقات الفواتير. |
| `MOV_MCHN_INFO_PRC` / `UPD_MCHN_INFO_MAIN_TO_SUB_PRC` | معلومات الأجهزة (اتجاهين). |
| `MOV_CASHIER_DEPOSIT_PRC` | إيداعات الكاشير. |
| `MOV_CASH_CUSTMR_PRC` / `UPD_CASH_CUSTMR_TO_MAIN_PRC` | العملاء النقديون. |
| `MOV_POS_AUD_ITM_PRC` | جرد الأصناف (`IAS_POS_AUD_ITEM`). |
| `MOV_WRK_SHFT_PRC` | الورديات. |
| `MOV_RCPTS_ADVNC_PRC`, `MOV_GNR_RCPTS_PRC`, `MOV_GNR_EXPNS_PRC`, `MOV_SALES_ORDER_PRC`, `MOV_USR_LGN_HSTRY_PRC` | سندات/طلبات/سجلات. |
| `GET_FLDS_TBL_FNC` | يبني قائمة الأعمدة ديناميكياً (مطابقة مخطط POS↔Main). |

---

## 8) `PKG_POS_SYNC_JOB_AUTO_PKG` + الفوترة الإلكترونية

- `POS_SYNC_DOC_TCH_SLTION_PRC` (Job تلقائي): يمرّ على فواتير `WEB_SRVC_TRNSFR_DATA_FLG IN (0,2)` التي فرعها متصل (`S_CMPNY.ETS_CONN_DATE <= BILL_DATE`)، ويستدعي:
  - `GNR_TECH_SOLUTION_PKG.INITIALIZE(P_SRVC_NO)` ثم
  - `GNR_TECH_SOLUTION_PKG.SUBMITDOCUMENT(P_DOC_TYPE=>4, P_DOC_SER=>BILL_SRL, P_BRN_NO, P_SYS_NO=>80, ...)` لرفع المستند الضريبي.
- **حُزم الفوترة الإلكترونية المساندة:** `PKG_GNR_E_INVC_OP` (بناء نوع/فئة المستند: `is_export`, `is_simplified`, `is_taxinvoice`, `GET_ITM_VAT_CAT_CODE`, `CHK_TAX_CAT_RSN`), `PKG_GNR_TECH_SOLUTION_PKG` (تنفيذ الرفع), `PKG_GNR_SND_DATA_TO_API_PKG`, `PKG_GNR_TFF_GATEWAY_PKG`, `PKG_GNR_QR_CODE_API_PKG` (رمز QR للفاتورة).
- `PKG_POS_UPLINES_PKG` (وكلاء التسويق/منصّات خارجية): `Register_Invoice` / `Register_Invoices` (رفع), `Refund_Invoice` (مرتجع), `SYNC_RT_BILL_PRC(P_RT_BILL_SRL, P_TYP)` يربط الفاتورة اللحظية بـ `POS_EXTRNL_DOC_SYNC.DOC_SER_EXTRNL` ويستدعي `REFUND_INVOICE`. مصادقة عبر `Login`/`Generate_Api_Key`/`Refresh_Access_Token`.
- `PROC_SYNC_E_INVC_PRC` (مستقل) يخدم نفس الغرض.

---

## 9) `PKG_POS_RCPTS_EXPNS_API_PKG` — السندات

`INSRT_RCPTS` / `INSRT_EXPNS` (إدراج سند قبض/صرف من XML → `POS_GNR_RCPTS` / `POS_GNR_EXPNS`), `GET_RCPTS`/`GET_EXPNS`, `GET_PYMNT_TYPE`, `GET_CRRNCS`, `GET_CRDT_CRDS`, `GET_CSTMR_ORDRS`.

## 10) `PKG_POS_SNPSHT_PKG` — الكميات المتاحة (MV)

`MVIEW_REFRESH(P_LIST, P_METHOD)`, `MVIEW_EDIT`, `CHK_MATCH_FLDS`, `ADD_MINUS_FLDS` — إدارة وتحديث الـMaterialized View `MV_ITEM_AVL_QTY` (الكميات المتاحة للأصناف) عبر DB links.

---

## 11) دوال/إجراءات مستقلة مهمة

| الملف | الوظيفة |
|-------|---------|
| `FUNC_GET_ICODE_AVLQTY` / `_REALQTY` / `_PRIV` | الكمية المتاحة/الفعلية للصنف. |
| `FUNC_GET_POS_NET_SALE_QTY` | صافي كمية مبيعات الصنف. |
| `FUNC_GET_BLNC_CST_FNC` | تكلفة الرصيد. |
| `FUNC_TAFKEET` / `FUNC_TAFKEET_F` | تفقيط المبلغ (عربي/أجنبي) للطباعة. |
| `PROC_IAS_GET_SALESDISC_PRC` | جلب خصم المبيعات. |
| `PROC_UPDT_BILL_SRL_IN_RT_INFO` / `_RTHST_INFO` | تحديث تسلسل الفاتورة في معلومات RT. |
| `PROC_UPDT_ITM_TAX_TRNS_INFO` | تحديث معلومات حركة ضريبة الصنف. |
| `PROC_SYNC_E_INVC_PRC` | مزامنة الفاتورة الإلكترونية. |
| `PROC_GET_ICODE_QTY_LMT` | حدود كمية الصنف. |

---

## 12) خلاصة منطق الأعمال (proof-based)

1. **توليد الترقيم** مركزي في `GET_BILL_NO_PRC` معتمداً على `IAS_PARA_POS` و`IAS_POS_MACHINE.SALE_SER`.
2. **الضريبة** كلها تمرّ عبر `YS_TAX_PKG.GET_ITM_TAX_PRCNT` ونوعان للحساب (1=على السعر، 2=بعد الخصم)، مع جدول حركة `POS_TAX_ITM_MOVMNT` يُبنى بعد الحفظ في `CLC_ITM_TAX_AFTR_SAVE`.
3. **الخصم** نوعان: تفصيلي (`DIS_AMT_DTL`) ورأس (`DISC_AMT_MST`) يُوزَّع تناسبياً في `CLC_DISC_VAT_AMT_PRC`.
4. **الولاء** مفصول في `POS_POINT_PKG` ويكتب `Pos_Point_Calc_trns` مع صلاحية انتهاء.
5. **الوردية** شرط للبيع: `GET_WRK_SHFT_OPN_FNC` يحدد `SHFT_SRL` المفتوح.
6. **المزامنة** على مسارين: (أ) ترحيل DB-link عبر `POS_MOV_TRNS_PKG`، (ب) فوترة إلكترونية عبر `SYNC_JOB_AUTO` + `GNR_TECH_SOLUTION_PKG.SUBMITDOCUMENT`، مع طابور `POS_SQL_QUEUE` للمهام المؤجلة. الترحيل **محجوب** ما لم تُزامَن الفواتير الضريبية أولاً.
