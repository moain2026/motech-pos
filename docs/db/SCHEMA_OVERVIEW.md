# YSPOS23 — نظرة عامة على المخطط (Schema Overview)

> **المصدر:** قاعدة Oracle محلية في حاوية `oracle12` (service `xe`)، schema `YSPOS23`.
> **المنهج:** proof-not-assumption — كل الأرقام والأسماء مُستخرجة حيّاً عبر `DBMS_METADATA` و `ALL_SOURCE` و `ALL_CONSTRAINTS`.
> **تاريخ الاستخراج:** 2026-06-29 (المرحلة 0-ب).

---

## 1) الأرقام الإجمالية (مُتحقَّقة حيّاً)

| العنصر | العدد | ملاحظة |
|--------|-------|--------|
| الجداول (Tables) | **118** | منها ~30 جدول مؤقت (`_TMP`) و~15 جدول `MLOG$` و6 `AQ$` نظامية |
| DDL مُستخرج لكل جدول | **117** ملف | استثناء وحيد: `SYS_IOT_OVER_92914` (جدول overflow لـ IOT — لا يُستخرج مستقلاً) |
| الـ Views | 31 | |
| Packages (spec) | **58** | + 58 package body |
| ملفات PL/SQL مُستخرجة | **91** | 58 package (spec+body مدمجين) + 20 function + 10 procedure + 2 trigger + 1 type |
| Functions / Procedures مستقلة | 20 / 10 | |
| Triggers | 2 | |
| Sequences | 5 | `POS_BILLS_SEQ`, `POS_BILL_DTL_SEQ`, `POS_POINT_SEQ`, `POS_RT_BILL_DTL_SEQ`, `AQ$_…_N` |
| Foreign Keys | **9** | (انظر ERD.md) |
| إجمالي الصفوف | ~70,223 | الأغلبية في BILL_DTL/MST |

> **ملاحظة عن صلاحية الكائنات:** في النسخة المعزولة، الأغلبية الساحقة من الـ packages/functions تظهر **INVALID** لأنها تعتمد على:
> - schema مركزي مفقود (`IAS202623` / كائنات `IAS_*` مثل `CUSTOMER`, `IAS_ITM_MST`, `GNR_TAX_CODE_MST`, `S_BRN`، إلخ).
> - 5 database links (`IAS_POS_SERVER_DB_LINK`).
> **هذا لا يفسد منطق الأعمال** — مصدر الكود (ALL_SOURCE) مُستخرج كاملاً، والمنطق سليم. الـ INVALID حالة ربط فقط.

## 2) أماكن الملفات

```
/home/work/motech-pos/db/schema/
  ├── tables/   → 117 ملف DDL (جدول واحد لكل ملف، constraints مضمّنة inline)
  └── plsql/    → 91 ملف مصدر (PKG_*, FUNC_*, PROC_*, TRG_*, TYPE_*)
/home/work/motech-pos/docs/db/
  ├── SCHEMA_OVERVIEW.md   (هذا الملف)
  ├── ERD.md               (العلاقات + Mermaid)
  ├── PACKAGES_ANALYSIS.md (تحليل منطق الأعمال)
  └── SALES_FLOW.md        (دورة البيع الكاملة)
```

---

## 3) تصنيف الـ118 جدول حسب الـ Domain

### 🧾 A) المبيعات والفواتير (Sales / Billing) — قلب النظام

| الجدول | الصفوف (حي) | الوصف |
|--------|------------|-------|
| **IAS_POS_BILL_MST** | 20,569 | رأس فاتورة المبيعات (master). PK=`BILL_NO`. |
| **IAS_POS_BILL_DTL** | 41,945 | أسطر تفاصيل الفاتورة. FK→BILL_MST. **لا PK** (heap)، فهرس فريد `POSBILLDTL_UQ`. |
| IAS_POS_RT_BILL_MST | 221 | رأس فواتير لحظية (Real-Time) قبل الترحيل. PK=`RT_BILL_NO`. |
| IAS_POS_RT_BILL_DTL | 368 | أسطر الفواتير اللحظية. FK→RT_BILL_MST. |
| IAS_POS_HST_BILL_MST/_DTL | 0 / 0 | أرشيف الفواتير المُرحّلة (history). |
| IAS_POS_HST_RT_BILL_MST/_DTL | 0 / 0 | أرشيف الفواتير اللحظية. |
| IAS_POS_HUNG_BILLS / _HISTORY_HUNG_BILLS | 0 / 0 | الفواتير المعلّقة (hung/hold). |
| IAS_POS_BILL_TEMP / _TMP / _MST_TMP / _DTL_TMP | 0 | جداول مؤقتة لمعالجة الفاتورة قبل الحفظ. |
| IAS_INV_RT_BILL_MST/_DTL | 0 | فواتير جرد لحظية. |
| SALES_ORDER / ORDER_DETAIL / SALES_ORDER_TMP | 2/4/0 | أوامر البيع (طلبات). |
| ARS_INTRMDT_CMPNY | 0 | جدول وسيط للفاتورة الإلكترونية (assignment refs). PK=(DOC_SEQ_M,DOC_TYP). |

### 💳 B) الدفع والتحصيل (Payments / Cash)

| الجدول | الصفوف | الوصف |
|--------|--------|-------|
| **IAS_POS_PAY_BILLS** | 1 | دفعات الفواتير (نقد/بطاقة/عملات متعددة). |
| IAS_POS_PAY_RT_BILLS / _HST_RT_BILLS | 2 / 0 | دفعات الفواتير اللحظية + أرشيفها. |
| IAS_POS_PAY_CASH / _TMP | 0 | المدفوعات النقدية. |
| POS_BILL_CRDT_CRD | 0 | بطاقات ائتمان الفاتورة. |
| IAS_POS_CARD_AMOUNT_TMP | 0 | مبالغ البطاقات (مؤقت). |
| IAS_DEPOSIT_CREDIT_CARD | 0 | إيداع بطاقات الائتمان. |
| IAS_DEPOSIT_CURRENCY_MST/_DTL/_TMP | 0 | إيداع العملات. |
| POS_GNR_RCPTS / POS_GNR_EXPNS | 0 | سندات قبض / صرف عامة. |
| POS_RCPTS_ADVNC / _TMP | 0 | سندات قبض مقدمة. |
| POS_FNCL_ADVNC_CSHR | 0 | سُلف مالية للكاشير. |
| POS_INSTLMNT_CMPNY | 0 | شركات التقسيط. |

### 📦 C) الأصناف والمخزون (Items / Inventory)

| الجدول | الصفوف | الوصف |
|--------|--------|-------|
| **MV_ITEM_AVL_QTY** | 2,004 | Materialized View — الكميات المتاحة. PK=(I_CODE,W_CODE,EXPIRE_DATE,BATCH_NO). |
| MV_IAS_POST_DTL | 0 | MV لتفاصيل الترحيل. |
| **IAS_POS_AUD_ITEM** | 4,115 | تدقيق/جرد الأصناف. |
| IAS_POS_MINUS_STK_QTY_TMP | 0 | تتبّع الكميات السالبة (مؤقت). |
| IAS_PRINT_BARCODE_TMP | 0 | طباعة الباركود. |
| POS_TAX_ITM_MOVMNT / _HSTRY | 0 | حركة ضريبة الصنف + أرشيفها. |
| POS_TAX_INPT_MOVMNT | 0 | حركة ضريبة المدخلات. |

### 👤 D) العملاء والولاء (Customers / Loyalty)

| الجدول | الصفوف | الوصف |
|--------|--------|-------|
| IAS_POS_CUSTOMER_CARD_AMOUNT / IAS_POS_CUST_CARD_AMT_TMP | 0 | أرصدة بطاقات العملاء. |
| IAS_CASH_CUSTMR_BRN | 0 | ربط العميل النقدي بالفرع. |
| POS_BILL_CPN / IAS_POS_BILL_CPN_MOVMNT / IAS_POS_COUPON_PST_AUTO_TMP | 0 | الكوبونات وحركتها. |
| *(نقاط الولاء تُخزَّن مركزياً عبر `POS_POINT_PKG`؛ الجداول `IAS_POINT_TYP_MST`/`POS_POINT_TRNS` في الـschema المركزي. التسلسل `POS_POINT_SEQ` محلي.)* | | |

### 🏪 E) الورديات والكاشير (Work Shifts / Cashier)

| الجدول | الصفوف | الوصف |
|--------|--------|-------|
| **POS_WRK_SHFT** | 0 | تعريف الورديات (SHFT_CODE, أوقات F/T). PK=`SHFT_CODE`. |
| **POS_WRK_SHFT_CSHR** | 0 | فتح/إقفال وردية كاشير (OPN_DATE, CLS_DATE, CLS_FLG, SHFT_SRL). PK=`SHFT_SRL`. |
| IAS_POS_CASHIER_FIN_TRUST | 0 | عهدة الكاشير المالية. |
| IAS_POS_JRNL_DIFF_CSHR_MST/_DTL | 0 | فروقات يومية الكاشير. FK داخلي. |
| IAS_USR_LGN_HSTRY | 608 | سجل دخول المستخدمين. |
| IAS_TRACE_LGN_NOTE | 0 | ملاحظات تتبّع الدخول. |

### ⚙️ F) الأجهزة والإعدادات (Machines / Settings / Privileges)

| الجدول | الصفوف | الوصف |
|--------|--------|-------|
| **IAS_POS_MACHINE** | 3 | أجهزة الكاشير. PK=`MACHINE_NO`. يحمل `CLC_TYP_NO_TAX` (نوع حساب الضريبة للجهاز). |
| IAS_POS_PRIV_MACHINE | 12 | صلاحيات الأجهزة. |
| POS_DFLT_STNG_MST / _DTL | 17 / 4 | الإعدادات الافتراضية. FK `POS_DFLT_STNG_DTL_FK`. |
| POS_DFLT_GRP_DTL | 0 | مجموعات الإعداد الافتراضي. |
| IAS_PARA_POS | 1 | بارامترات POS العامة (صف واحد). |
| IAS_POS_HELP_KEYS | 42 | مفاتيح المساعدة. |
| IAS_POS_EXTRA_KEYPAD | 0 | لوحة مفاتيح إضافية. |
| IAS_POS_KEY_BRD_GRPS_MST/_DTL | 0 | مجموعات لوحة المفاتيح. FK `IAS_FK_KGPS_DTL`/`IAS_FK_KGRPS_MST`. |
| IAS_POS_BALANCE | 0 | جهاز الميزان (balance). |
| POS_S_FLD_PRV_FXD / _USR | 7 / 28 | صلاحيات الحقول الثابتة للمستخدمين. |
| IAS_POS_OTHR… / POS_OTHR_CHRG_MVMNT(_TMP) / POS_RQ_OTHR_CHRG_MVMNT | 0 | رسوم أخرى وحركتها. |
| POS_ASSCTN_TRNS | 0 | حركات الجمعيات/الروابط. |

### 🔄 G) المزامنة والترحيل (Sync / Distribution)

| الجدول | الصفوف | الوصف |
|--------|--------|-------|
| **POS_SYNC_MNGMNT** | 252 | إدارة مزامنة الجداول مع الخادم المركزي. PK=`TBL_NM`. |
| **IAS_POS_SERVER_DB_LINK** | 5 | تعريف روابط قواعد البيانات للخوادم. |
| IAS_POS_SERVER_SNCRNZ_DATA | 0 | بيانات المزامنة. |
| IAS_EXTRNL_SYS_SYNC_LOG | 0 | سجل مزامنة الأنظمة الخارجية. |
| POS_EXTRNL_DOC_SYNC | 0 | مزامنة الوثائق الخارجية. |
| POS_SQL_QUEUE | 0 | طابور تنفيذ SQL. |
| POS_BACKUP | 4 | نسخ احتياطية. |
| IAS_POS_*_PST_AUTO_TMP (عدة) | 0 | جداول مؤقتة للترحيل التلقائي (BILL/RTBILL/COUPON/PAID_CASH/CHNG_BILL). |
| MLOG$_* (15 جدول) | متغيّر | Materialized View Logs لتتبّع تغييرات المزامنة. |

### 🔧 H) فنية / نظامية (E-Invoice / Queues / System)

| الجدول | الوصف |
|--------|-------|
| GNR_QR_CODE | بيانات QR للفاتورة الإلكترونية. |
| DOC_SYS_ID_Q_TBL + AQ$_DOC_SYS_ID_Q_TBL_* (G/H/I/L/S/T) | طابور Oracle AQ لمعرّفات الوثائق. |
| QUE_MSG_TBL | جدول رسائل الطابور. |
| LST_DOC_SRL_QR_TMP | تسلسل وثائق QR (مؤقت). |
| S_ALRT_DATA_TMP | بيانات التنبيهات (مؤقت). |
| SYS_IOT_OVER_92914 | overflow table نظامي (IOT). |
| BILL_TRC / POS_BILL_TRC / POS_BILL_FREE_QTY_PRM_TMP | تتبّع الفاتورة والكميات المجانية. |

---

## 4) الجداول الأساسية ذات البيانات الفعلية (مرتّبة)

| # | الجدول | الصفوف | Domain |
|---|--------|--------|--------|
| 1 | IAS_POS_BILL_DTL | 41,945 | مبيعات |
| 2 | IAS_POS_BILL_MST | 20,569 | مبيعات |
| 3 | IAS_POS_AUD_ITEM | 4,115 | مخزون |
| 4 | MV_ITEM_AVL_QTY | 2,004 | مخزون |
| 5 | IAS_USR_LGN_HSTRY | 608 | ورديات/أمان |
| 6 | IAS_POS_RT_BILL_DTL | 368 | مبيعات (لحظي) |
| 7 | POS_SYNC_MNGMNT | 252 | مزامنة |
| 8 | IAS_POS_RT_BILL_MST | 221 | مبيعات (لحظي) |
| 9 | IAS_POS_HELP_KEYS | 42 | إعدادات |
| 10 | POS_S_FLD_PRV_FXD_USR | 28 | صلاحيات |

**الخلاصة:** البيانات الحقيقية تتركّز في دورة المبيعات (BILL_MST/DTL) والمخزون (AUD_ITEM، MV_ITEM_AVL_QTY). أغلب جداول الدفع/الورديات/الترحيل فارغة في هذه النسخة (إما لم تُستخدم، أو رُحِّلت بياناتها للخادم المركزي وأُفرغت محلياً).
