# 📋 خطة مشروع Motech POS — نظام نقاط بيع web حديث

> بديل احترافي عن YemenSoft Onyx Pro · عربي/RTL · متصل بنفس بيانات Oracle ثم قاعدة خاصة
> المالك: معين العبّاسي · بدأ: 2026-06-29 · المنفّذ: Genspark Claw (Opus 4.8) + وكلاء فرعيون

---

## 🎯 الهدف النهائي
نظام POS web حديث، احترافي، يطابق وظائف Onyx Pro 100% بدون نقص، أسرع وأنظف وأسهل، عربي RTL، offline-first، مع فاتورة إلكترونية + QR + طباعة حرارية + barcode + multi-branch.

## 🧱 الـ Stack المعتمد (من كتيّب المعايير)
- **Frontend:** React 19 + Vite (PWA, offline-first) · TanStack Query + Zustand · Tailwind + shadcn/ui (RTL) · i18n عربي
- **Backend:** NestJS · REST + OpenAPI · RFC 9457 للأخطاء · BullMQ للطوابير
- **DB:** المرحلة الأولى = Oracle (نفس البيانات، node-oracledb) · لاحقاً PostgreSQL 16 + Prisma (هجرة تدريجية)
- **المعمارية:** Modular Monolith + Clean/Ports & Adapters · Strangler-Fig من Onyx
- **POS الحرج:** Idempotency-Key (منع ازدواج الفواتير) · فواتير immutable · NUMERIC للمال · قفل صارم لمنع البيع الزائد · QR/TLV · وكيل طباعة ESC/POS محلي

## 📚 المراجع (أساس القرارات — في /home/work/oracle/pos-alabasi/)
- `STANDARDS/` (15 ملف) — كتيّب الهندسة
- `SYSTEM_MAP.md` — خريطة قاعدة YSPOS23
- `FMX_DECOMPILE_RESEARCH.md` + `fmx_decompile/` — الهندسة العكسية
- `OPUS_4.8_MASTERY/` — تشغيل الموديل بأقصى أداء

---

## 🗺️ المراحل

### المرحلة 0 — إكمال الهندسة العكسية الكاملة (الأساس) 🔄
**الهدف:** توثيق كامل لكل شاشة + كل منطق، صفر نقص.
- [ ] 0.1 سحب كل ملفات POS (.fmx + .plx + .mmx + poshelp.chm) من الجهاز
- [ ] 0.2 فك كل الشاشات (~100) بأداة witchi المُصلّحة
- [ ] 0.3 strings على كل fmx (استخراج SQL + literals + labels عربية)
- [ ] 0.4 سحب كل الـ packages PL/SQL من القاعدة (ALL_SOURCE) — المنطق الحقيقي
- [ ] 0.5 توثيق كل شاشة: الحقول + triggers + SQL + الجداول + المنطق → docs/screens/<NAME>.md
- [ ] 0.6 خريطة شاملة: الشاشات → الجداول → الـ packages → الوظائف

### المرحلة 1 — التصميم
- [ ] 1.1 ERD كامل + تصميم schema الجديد
- [ ] 1.2 ADRs (قرارات معمارية) + هيكلة المشروع
- [ ] 1.3 OpenAPI spec للـ endpoints
- [ ] 1.4 ترتيب الشاشات بالأولوية (MVP أول)

### المرحلة 2 — Backend (NestJS)
- [ ] 2.1 هيكل المشروع + الاتصال بـ Oracle + config + الأمان
- [ ] 2.2 modules حسب الـ domains (bills, items, customers, shifts, reports...)
- [ ] 2.3 اختبارات + OpenAPI

### المرحلة 3 — Frontend (React PWA)
- [ ] 3.1 هيكل + design system RTL + التوجيه
- [ ] 3.2 شاشة فاتورة المبيعات (MVP) → باقي الشاشات
- [ ] 3.3 offline-first + sync

### المرحلة 4 — ميزات POS الحرجة
- [ ] طباعة حرارية ESC/POS · barcode · فاتورة إلكترونية + QR · multi-branch

### المرحلة 5 — الاختبار والنشر
- [ ] اختبارات شاملة · CI/CD · نشر · توثيق نهائي

---

## ⚙️ منهجية العمل (حسب Opus 4.8 mastery)
- وكلاء فرعيون متوازيون للمهام المستقلة (أسرع + أدق)
- توثيق تراكمي: PROGRESS.md يُحدّث كل خطوة · ARCHITECTURE.md · CLAUDE.md
- proof-not-assumption: كل مكوّن يُختبر حياً قبل اعتماده
- الإشراف: المنسّق (أنا) يدقّق ويختبر مخرجات كل وكيل
- صفر تخمين · أمان افتراضي · كود نظيف حسب الكتيّب

## ⚠️ قيود مهمة
- النظام الحقيقي على الجهاز = قراءة فقط (لا نكسره)
- جهاز العباسي (السيرفر) قد يكون طافياً — نعمل على النسخة المحلية
- القاعدة المحلية: حاوية oracle12 (YSPOS23، 118 جدول) — مصدر الحقيقة الحالي
