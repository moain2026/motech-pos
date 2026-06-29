# CLAUDE.md — تعليمات المشروع (تُقرأ في كل جلسة/وكيل)

## المشروع
Motech POS — بديل web حديث عن YemenSoft Onyx Pro. عربي RTL. متصل بقاعدة Oracle YSPOS23 (محلياً في حاوية oracle12).

## القواعد الذهبية
1. **proof-not-assumption:** كل ادعاء بأمر حي/اختبار. لا تخمين، لا أسماء جداول/أعمدة مخترعة — تحقّق من DDL الحقيقي أولاً.
2. **اقرأ قبل العمل:** docs/PROJECT_PLAN.md + docs/PROGRESS.md + docs/ARCHITECTURE.md + STANDARDS/ (في /home/work/oracle/pos-alabasi/STANDARDS/).
3. **حدّث docs/PROGRESS.md** بعد كل خطوة مهمة.
4. **المعايير إلزامية:** اتبع كتيّب STANDARDS (Clean Code, SOLID, الأمان OWASP 2025, الاختبارات).
5. **النظام الحقيقي على الجهاز = قراءة فقط.** لا تكسر الإنتاج.
6. **git identity:** MoainAlabbasi <Moain.learn@gmail.com>. conventional commits.
7. **الأمان:** لا أسرار في git. .env محلي. تحقّق المدخلات. NUMERIC للمال.

## الـ Stack
Frontend: React19+Vite PWA, TanStack Query+Zustand, Tailwind+shadcn RTL.
Backend: NestJS, REST+OpenAPI, RFC9457, BullMQ.
DB: Oracle (الآن، node-oracledb) → PostgreSQL16+Prisma (لاحقاً).

## مصدر الحقيقة للبيانات
حاوية docker oracle12، schema YSPOS23: `sudo docker exec -i oracle12 sqlplus YSPOS23/<pw>@//localhost:1521/xe`.
DDL + packages في /home/work/oracle/pos-alabasi/schema/.
