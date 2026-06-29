# 📈 سجل تقدّم Motech POS
> يُحدّث بعد كل خطوة. الأحدث أعلى. (ضد النسيان — يُقرأ كل جلسة)

## 2026-06-29
### 16:45 — ✅ المرحلة 0-أ مكتملة: فك وتوثيق كل شاشات POS (subagent phase0a-screens)
- **سُحبت 86 ملف** من جهاز POS (SERVER3, `D:\YS_ERP\Forms`) عبر scp إلى `db/forms_raw/`:
  80 شاشة `POS*.fmx` + 3 مكتبات (POSLIB/POSOTHRLIB/POSSTPLIB.plx) + قائمة POSMNU.mmx + ملفّا مساعدة poshelp.chm/poshelp_E.chm. (استُبعدت نسخ backup/test ذات اللواحق والمسافات).
- **80/80 شاشة فُكّت بنجاح كامل** بأداة witchi المُصلَّحة (صفر استثناءات). كل شاشة → `docs/screens/_raw/<NAME>_structure.txt`.
- **إصلاحان جديدان على الأداة** (تجاوز قيود v0.1 التي أوقفت الشاشات الكبيرة سابقاً):
  1. `LockingMode.lookup` → degrade لـ UNKNOWN بدل رمي استثناء (أصلح POST013/POST021).
  2. `FormCanvasFactory` → التفاف try/catch حول قراءة graphic-tree (تجاهل آمن لـ `ElementType 0x70207` غير المعروف) → **أصلح POST001 (فاتورة البيع، 4.8MB) + POSS004/POST024/POS_ALRT_SCR/POS_ITM_PRICE**. البنية البنيوية تُقرأ كاملة قبل الـ graphic-tree فلا تتأثّر.
- **strings (ASCII+UTF16LE)** على كل .fmx → `_raw/<NAME>_strings.txt` (SQL + literals). مثال: POST001 = 180+ جدول، 481 جملة SQL.
- **استُخرج poshelp.chm** (extract_chmLib) → 52 ملف مساعدة عربي لكل شاشة (POST001.htm = شرح فاتورة المبيعات…) → `_help/txt_ar` + 32 إنجليزي `_help/txt_en`.
- **وُثِّقت 80 شاشة**: `docs/screens/<NAME>.md` (الوظيفة من CHM + data blocks + canvases بإحداثياتها + windows + triggers + program units/packages + libraries + alerts + جداول DB من SQL + عيّنة SQL + قيود). الأسماء العربية المُشوّهة (CP1256-as-Latin1) أُصلِحت برمجياً.
- `docs/screens/INDEX.md` (جدول الـ80 شاشة) + `docs/screens/_DB_TABLES_DISCOVERED.md` (أكثر 37 جدول + العمود الفقري للبيع + حِزَم المنطق).
- **عيّنة proof (POST001 فاتورة المبيعات):** 59 data block · 53 canvas · 31 window · 63 trigger · 152 program unit (22 package) · 180+ جدول. العمود الفقري: `IAS_POS_BILL_MST`↔`IAS_POS_BILL_DTL`، الأصناف `IAS_ITM_MST`/`IAS_ITEM_PRICE`، المعلّق `IAS_POS_HUNG_BILLS`، الدفع `IAS_POS_PAY_BILLS_*`، العروض `IAS_QUT_PRM_*`.
- **القيود (proof-based):** (أ) منطق PL/SQL الإجرائي = p-code، يُستخرَج لاحقاً من DB `ALL_SOURCE`. (ب) الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي → تُستكمل بـ Visual RE. (ج) .plx لا تُفكّ بالأداة (حاوية ROS) → strings + DB.
- **التالي: المرحلة 0-ب** — سحب أجساد حِزَم POS من DB (ALL_SOURCE) + Visual RE للـ layout/الحقول العربية لشاشات البيع الأساسية.

### 16:12 — تأسيس المشروع
- أُنشئ مجلد المشروع /home/work/motech-pos/ + git + هيكل (backend/frontend/db/docs/scripts).
- كُتبت الخطة الشاملة: docs/PROJECT_PLAN.md (6 مراحل، Stack معتمد).
- المصادر جاهزة في /home/work/oracle/pos-alabasi/ (STANDARDS 15 ملف، SYSTEM_MAP، أبحاث الفك، Opus mastery، fmx output: 4 شاشات مفكوكة كإثبات).
- **التالي: المرحلة 0 — إكمال الفك الكامل (~100 شاشة + packages + توثيق).**

## الحالة العامة
- المرحلة الحالية: **0 (الهندسة العكسية الكاملة)** 🔄
- القاعدة: حاوية oracle12 (YSPOS23، 118 جدول) شغّالة محلياً.
- ✅ **فُكّت ووُثِّقت 80 شاشة POS كاملة** (المرحلة 0-أ). راجع `docs/screens/INDEX.md`.
- الباقي للمرحلة 0: أجساد حِزَم DB (POSLIB/IAS_*_PKG via ALL_SOURCE) + Visual RE للحقول/التسميات + شاشات غير-POS عند الحاجة.
