# 🎯 ترتيب الشاشات بالأولوية لإعادة البناء (Strangler-Fig)

> 80 شاشة Onyx POS موثّقة (`docs/screens/INDEX.md`). نرتّبها بموجات: MVP أولاً (دورة البيع)، ثم الموجة 2/3.
> المرجع: ADR-005 (Strangler-Fig)، `SALES_FLOW.md`، `API_DESIGN.md`. التعقيد مُقدّر من حجم/Blocks/Triggers في INDEX.
> آخر تحديث: 2026-06-29.

---

## الموجة 0 — MVP (دورة البيع الأساسية الكاملة) 🚀

الهدف: كاشير يدخل، يفتح وردية، يبيع، يدفع، يقفل، يطبع تقرير يومي — كل ذلك offline-first.

| # | الشاشة | الوظيفة | الأولوية | الجداول الأساسية | الـ API | التعقيد |
|---|--------|---------|----------|-------------------|---------|---------|
| 1 | **POSLGN** | تسجيل الدخول | 🔴 P0 | `USER_R`, `IAS_USR_LGN_HSTRY`, `IAS_POS_MACHINE` | `POST /auth/login`, `/auth/me` | متوسط (مصادقة + RBAC + terminal) |
| 2 | **POST027** | ورديات العمل (فتح وردية) | 🔴 P0 | `POS_WRK_SHFT`, `POS_WRK_SHFT_CSHR`, `POS_FNCL_ADVNC_CSHR` | `POST /shifts/open`, `GET /shifts/current` | متوسط |
| 3 | **POST001** | **فاتورة المبيعات** (قلب النظام) | 🔴 P0 | `IAS_POS_BILL_MST/DTL`, `IAS_ITM_MST`, `IAS_ITEM_PRICE`, `MV_ITEM_AVL_QTY`, `IAS_POS_HUNG_BILLS` | `POST /bills`, `POST /bills/calculate`, `GET /items` | **عالٍ جداً** (59 block, 152 PU) — يُبنى تدريجياً |
| 4 | (داخل POST001) | الدفع (نقد/بطاقة/عملات) | 🔴 P0 | `IAS_POS_PAY_BILLS`, `IAS_POS_PAY_CASH` | جزء من `POST /bills` (payments[]) | متوسط |
| 5 | **POST027 (إقفال)** | إقفال الوردية + مطابقة النقد | 🔴 P0 | `POS_WRK_SHFT_CSHR`, `IAS_DEPOSIT_CURRENCY_MST` | `POST /shifts/{srl}/close` | متوسط |
| 6 | **POSR001** | تقرير يومي/مناوبة (Z-report) | 🔴 P0 | `POS_WRK_SHFT_CSHR`, `IAS_POS_BILL_MST/DTL` | `GET /reports/daily`, `/reports/shift-closing` | متوسط |

**ميزات MVP المصاحبة (POS-specific):** طباعة حرارية ESC/POS، ماسح باركود (HID)، offline طابور + مزامنة أساسية، Idempotency. (راجع `STANDARDS/13`).

**معيار اكتمال MVP:** اختبارات golden تطابق ضريبة/خصم/إجماليات/ترقيم مقابل فواتير Onyx حقيقية (ADR-003/005).

---

## الموجة 1 — إكمال دورة البيع وتوابعها

| # | الشاشة | الوظيفة | الأولوية | الجداول الأساسية | الـ API | التعقيد |
|---|--------|---------|----------|-------------------|---------|---------|
| 7 | **POST002** | فاتورة مردود المبيعات | 🟠 P1 | `IAS_POS_BILL_MST/DTL` (عكسي) | `POST /bills/{id}/refund` | عالٍ (31 block) |
| 8 | **POST003** | استعراض الفواتير المعلّقة | 🟠 P1 | `IAS_POS_HUNG_BILLS` | `GET /bills/held`, `resume` | متوسط |
| 9 | **POST004** | استعراض/إدارة الفواتير | 🟠 P1 | `IAS_POS_BILL_MST` | `GET /bills`, `/bills/{no}` | متوسط |
| 10 | **POST006** | الدفع النقدي للمرتجعات | 🟠 P1 | `IAS_POS_PAY_BILLS` | refund payments | متوسط |
| 11 | **POST010/011** | الدفع النقدي للفواتير | 🟠 P1 | `IAS_POS_PAY_BILLS` | `payments` | متوسط |
| 12 | **POST016** | قارئ الأسعار | 🟠 P1 | `IAS_ITM_MST`, `IAS_ITEM_PRICE` | `GET /items/{code}` | منخفض |
| 13 | **POST005** | الفواتير اللحظية (RT) | 🟠 P1 | `IAS_POS_RT_BILL_MST/DTL` | RT bills | عالٍ |
| 14 | **POST020** | ربط الفاتورة بعميل نقاطي | 🟠 P1 | `IAS_CASH_CUSTMR`, `Pos_Point_Calc_trns` | `customers`, `points` | متوسط |
| 15 | **POST021** | استعراض حركة النقاط | 🟠 P1 | `Pos_Point_Calc_trns` | `GET /customers/{c}/points` | منخفض |
| 16 | **POST025/026** | المقبوضات / المصروفات | 🟠 P1 | `POS_GNR_RCPTS/EXPNS` | `POST /receipts`, `/expenses` | متوسط |
| 17 | **POST008** | مزامنة البيانات | 🟠 P1 | `POS_SYNC_MNGMNT`, `POS_SQL_QUEUE` | `sync/*` | عالٍ |
| 18 | **POST012/013/015** | ملخص/تصفية/فائض-عجز الكاشيرات | 🟠 P1 | `POS_WRK_SHFT_CSHR` | `GET /reports/cashiers` | متوسط |
| 19 | **POST014** | عهدة الكاشير المالية | 🟠 P1 | `POS_FNCL_ADVNC_CSHR` | shifts custody | منخفض |
| 20 | **POST017** | استعراض حركة الفواتير | 🟠 P1 | `IAS_POS_BILL_MST/DTL` | `GET /bills` | متوسط |

---

## الموجة 2 — البيانات الأساسية والإعدادات والتقارير

| الفئة | الشاشات | الوظيفة | الأولوية | الـ API/Module |
|------|---------|---------|----------|-----------------|
| أصناف/أسعار | POSI2000, POS_ITM_PRICE, POSQ001 | بيانات الأصناف والأسعار | 🟡 P2 | catalog |
| عملاء/ولاء | POSI009, POSI010, POSI200 | مجموعات/بيانات/بطاقات العملاء | 🟡 P2 | customers/loyalty |
| الأجهزة/الإعدادات | POSI001, POSS001, POSS005, POST009 | أجهزة POS، المتغيرات، الإعدادات الافتراضية | 🟡 P2 | settings |
| الصلاحيات/الأمان | POSS002, POSS004, POSS007 | صلاحيات المستخدمين، كلمة السر | 🟡 P2 | auth |
| لوحة المفاتيح/المساعدة | POSI002..006, POSI004 | لوحة مفاتيح إضافية، موزّنات، مساعدة | 🟡 P2 | settings |
| بطاقات/كوبونات | POSI007, POSI008, POSI012 | بطائق دفع مسبق، برامج نقاط، البطاقات | 🟡 P2 | loyalty/payments |
| التقارير | POSR002..016 | تقارير متنوعة | 🟡 P2 | reports (CQRS) |
| النسخ الاحتياطية | POSS003 | النسخ | 🟡 P2 | settings/ops |

---

## الموجة 3 — المخزون والتحويلات والمتقدّم

| الشاشة | الوظيفة | الأولوية | ملاحظة |
|--------|---------|----------|--------|
| POST018 | جرد الآلات | 🟢 P3 | `IAS_POS_AUD_ITEM` |
| POST019 | طلب صرف/تحويل مواد | 🟢 P3 | تحويلات مخزنية |
| POST022 | جرد أصناف مردود المبيعات | 🟢 P3 | |
| POST024 | طلبات العملاء (أوامر بيع) | 🟢 P3 | `SALES_ORDER` (عالٍ — 29 block) |
| POST028/029 | التحويل/الاستلام المخزني | 🟢 P3 | معقّد (36/35 block) |
| POST023 | الوصفة الطبية (Wasfaty) | 🟢 P3 | تكامل صحّي |
| POSADVS*, POSAVLQTY | شاشات لمس متقدمة، الكميات المتاحة | 🟢 P3 | |
| POS_IMPXLS_AVLQTY, POSI014, POSS006/028/029 | استيراد Excel، تحديث DB، تسجيل أجهزة WMS | 🟢 P3 | إدارية |
| POST007? / POSTIN_MTX / POST_WST | شاشات خدمية/متخصّصة | 🟢 P3 | حسب الحاجة |

---

## ملخّص المنطق

- **MVP = 6 شاشات** تغطّي دورة البيع كاملة (دخول→وردية→بيع→دفع→إقفال→تقرير) + ميزات POS الحرجة.
- **POST001** هو أعقد شاشة (4.8MB، 59 block، 152 program unit، 180+ جدول) — يُبنى تدريجياً داخل MVP: أولاً المسار السعيد (إضافة صنف→حساب→دفع نقدي→حفظ→طباعة)، ثم العروض/الكوبونات/الوصفات لاحقاً.
- الترتيب يحترم Strangler-Fig: كل موجة تترك بقية الشاشات على Onyx حتى تُحوَّل، مع feature flag للتراجع.
