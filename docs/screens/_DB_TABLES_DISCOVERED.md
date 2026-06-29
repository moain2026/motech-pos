# جداول قاعدة البيانات المكتشفة من شاشات POS (تحليل SQL في الـ .fmx)

> المصدر: استخراج `strings` (ASCII + UTF16LE) من كل ملفات `POS*.fmx` ثم رصد أسماء الجداول بعد `FROM/INTO/UPDATE/JOIN`.
> **proof-based:** هذه أسماء وردت فعلياً في نصوص SQL داخل الشاشات. التحقق النهائي من DDL يكون مقابل schema `YSPOS23`.

## أكثر 40 جدول/view ظهوراً (عبر كل الشاشات)

| # | الجدول/الـ View | مرات الظهور | الدور المُرجَّح |
|---|------|------|------|
| 1 | `IAS_ITM_MST` | 318 | الأصناف (master) |
| 2 | `USER_R` | 305 | المستخدمون/الكاشير |
| 3 | `IAS_POS_BILL_MST` | 233 | **رأس فاتورة البيع** |
| 4 | `IAS_POS_MACHINE` | 207 | أجهزة/آلات نقاط البيع |
| 5 | `S_MSGS` | 170 | رسائل النظام |
| 6 | `S_BRN_USR_PRIV` | 128 | صلاحيات المستخدم على الفرع |
| 7 | `FORM_DETAIL` | 120 | تفاصيل القوائم/الشاشات |
| 8 | `IAS_POS_HUNG_BILLS` | 117 | الفواتير المعلّقة |
| 9 | `PRIVILEGE_GC` | 111 | الصلاحيات |
| 10 | `IAS_FORM_NAME` | 107 | أسماء الشاشات |
| 11 | `IAS_POS_RT_BILL_MST` | 106 | **رأس فاتورة المرتجع** |
| 12 | `CUSTOMER` | 93 | العملاء |
| 13 | `CREDIT_CARD_TYPES` | 93 | أنواع بطاقات الدفع |
| 14 | `IAS_CASH_CUSTMR` | 89 | عميل نقدي |
| 15 | `WAREHOUSE_DETAILS` | 88 | المخازن |
| 16 | `EX_RATE` | 87 | أسعار الصرف |
| 17 | `POS_WRK_SHFT_CSHR` | 83 | ورديات الكاشير |
| 18 | `IAS_POS_BILL_DTL` | 81 | **تفاصيل فاتورة البيع** |
| 19 | `S_BRN` | 74 | الفروع |
| 20 | `IAS_PARA_POS` | 74 | متغيرات/إعدادات POS |
| 21 | `IAS_WHTRNS_MST` | 67 | حركة المخزن (تحويلات) |
| 22 | `S_RPRT_USR_TMPLT_MST` | 64 | قوالب تقارير المستخدم |
| 23 | `PRIVILEGE_WH` | 58 | صلاحيات المخازن |
| 24 | `IAS_QUT_PRM_MST` | 58 | العروض/الكوتات (promotions) |
| 25 | `IAS_SYS` | 53 | إعدادات النظام |
| 26 | `IAS_POS_RT_BILL_DTL_TMP` | 53 | تفاصيل مرتجع (مؤقت) |
| 27 | `IAS_DEPOSIT_CURRENCY_MST` | 53 | إيداع العملات |
| 28 | `PRIV_ACC` | 51 | صلاحيات الحسابات |
| 29 | `S_RPRT_USR_TMPLT_DTL` | 48 | تفاصيل قوالب التقارير |
| 30 | `S_FLAGS` | 48 | أعلام/خيارات النظام |
| 31 | `SALES_CHARGES` | 48 | رسوم/مصاريف البيع |
| 32 | `SALES_ORDER` | 47 | أوامر البيع |
| 33 | `IAS_POS_CUSTOMER_CARD_AMOUNT` | 47 | أرصدة بطاقات العملاء |
| 34 | `IAS_ITEM_PRICE` | 47 | أسعار الأصناف |
| 35 | `S_EMP` | 46 | الموظفون |
| 36 | `IAS_POS_BILL_DTL_TMP` | 46 | تفاصيل فاتورة (مؤقت) |
| 37 | `S_CLNDR_LIST` | 45 | التقويم |

## العمود الفقري لبيع POS (من POST001 — فاتورة المبيعات)

```
IAS_POS_BILL_MST   (رأس الفاتورة)  1───∞  IAS_POS_BILL_DTL  (بنود الفاتورة)
        │
        ├── IAS_ITM_MST / IAS_ITM_DTL / IAS_ITEM_PRICE   (الأصناف والأسعار)
        ├── IAS_CASH_CUSTMR / CUSTOMER                    (العميل)
        ├── IAS_POS_PAY_BILLS_CSH / _RPLC / _CPN          (طرق الدفع: نقد/استبدال/كوبون)
        ├── IAS_POS_HUNG_BILLS                            (تعليق/استرجاع الفاتورة)
        ├── IAS_QUT_PRM_MST / _DTL                        (العروض والكوتات)
        ├── CREDIT_CARD_TYPES                             (بطاقات الدفع)
        ├── IAS_POS_MACHINE / IAS_MACHINES                (الجهاز/الكاشير)
        └── WSFTY_PRSCRPTION_MST                          (وصفات طبية — صيدليات)
```

## حِزَم PL/SQL المُستدعاة (منطق الأعمال — في DB)

أبرز الحِزَم التي تنادي عليها الشاشات (الأجساد تُستخرَج من `ALL_SOURCE`/`DBMS_METADATA`):
`IAS_GEN_PKG`, `IAS_ITM_PKG`, `POS_POINT_PKG` (نقاط الولاء), `POS_MNU_PKG`, `YS_TAX_PKG` (الضريبة),
`IAS_QT_PRM_PKG` (العروض), `POS_GNR_PKG`, `IAS_USR_PKG`, `CR_CRD_PKG` (بطاقات الدفع),
`DATE_CNVRTR_PKG`, `IAS_AC_PKG`, `IAS_CST_PKG`, `IAS_SMS_MAIL_PKG`, `GNR_WASFATY_PKG` (الوصفات الطبية),
`IAS_POS_DISTIBUTED_DB_PKG` (قاعدة موزّعة), `SECURITY_PKG`, `YS_GEN_PKG`.

> ملاحظة: المنطق الإجرائي الكامل (IF/LOOP/متغيرات) ليس داخل الـ .fmx (p-code) — يُستخرَج من حِزَم DB.
> ما يُلتقط من الـ .fmx مباشرة: نصوص SQL الكاملة + أسماء الـ triggers/procedures + بنية الشاشة.
