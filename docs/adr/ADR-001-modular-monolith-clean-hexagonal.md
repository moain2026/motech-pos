# ADR-001 — المعمارية: Modular Monolith + Clean/Hexagonal

- **الحالة:** مقبول (Accepted) · 2026-06-29
- **المرجع:** `STANDARDS/01_ARCHITECTURE.md` (§1.2, §2, §6)

## السياق
Motech POS نظام نقاط بيع مالي يحلّ محل YemenSoft Onyx Pro. خصائص مؤكَّدة من الهندسة العكسية:
- **اتساق مالي قوي مطلوب:** دورة البيع (فاتورة + خصم + ضريبة + دفع + ولاء) ذرّية — راجع `SALES_FLOW.md` (الخطوات 1–10 كلها في معاملة واحدة في PL/SQL).
- النظام الأصلي **موزّع** (POS فرعي ↔ Main server عبر DB links) لكن منطق الأعمال **مركّز في طبقة واحدة** (`PKG_POS_API_PKG` وحدها 426KB).
- حدود المجال **واضحة فعلاً** من البيانات: مبيعات، أصناف/مخزون، عملاء/ولاء، دفع، ورديات، ضريبة، مزامنة، إعدادات/صلاحيات.
- الفريق صغير (منفّذ واحد + وكلاء)، مرحلة MVP.

## القرار
نتبنّى **Modular Monolith** (وحدة نشر واحدة، قاعدة بيانات واحدة، modules ذات حدود صريحة) مع طبقات **Clean Architecture + Ports & Adapters (Hexagonal)**:

```
presentation → application → domain        (التبعيات للداخل فقط)
                    ↑
            infrastructure (تُحقن عبر DI)
```

- كل module ≈ **Bounded Context** واحد (Tactical DDD كامل: Entity/Value Object/Aggregate/Repository/Domain Event).
- `domain` نقي (لا يعرف HTTP/DB). `application` ينسّق use-cases. `infrastructure` adapters (repo، طابعة، بوابة فوترة). `presentation` controllers نحيفة.
- **قاعدة الحدود الإلزامية:** module لا يستورد repos/جداول module آخر مباشرة — فقط عبر public port أو in-process event bus (NestJS EventEmitter/CQRS).
- CQRS **انتقائي للتقارير فقط** (راجع `SALES_FLOW §14` — التقارير ثقيلة وخارج مسار البيع).
- Event-driven **in-process** أولاً (مثال: `InvoicePosted` → يطلق مزامنة + طباعة + فوترة إلكترونية)، بلا message broker قبل ألم حقيقي.

## البدائل المدروسة
| البديل | لماذا رُفض |
|--------|-----------|
| **Monolith بلا modules** | يعيد إنتاج تشابك Onyx (package 426KB واحدة) — نفس مرض النظام القديم. |
| **Microservices من البداية** | اتساق مالي عبر الشبكة = Saga/eventual consistency + تعقيد تشغيلي ضخم لفريق صغير. ليس نقطة بداية (Monolith First — Fowler). |
| **Layered تقليدي (بلا Ports)** | يربط منطق الأعمال بـ Oracle مباشرة؛ ونحن نحتاج تبديل Oracle→Postgres لاحقاً (ADR-003) بلا لمس المنطق. |

## العواقب
- ✅ معاملات DB محلية ذرّية (حرج للمال) تبقى ممكنة بلا تعقيد موزّع.
- ✅ الحدود جاهزة للتقطيع لاحقاً إلى خدمات عند الحاجة (مثلاً خدمة المزامنة/الفوترة الإلكترونية).
- ✅ استبدال Oracle↔Postgres يتم في طبقة infrastructure فقط (Ports&Adapters).
- ⚠️ انضباط مطلوب لمنع تسرّب الحدود (يُفرض بـ ESLint boundaries + مراجعة).
- ⚠️ in-process events تعني أن فشل المستمع داخل نفس العملية — نعزل التوابع غير الحرجة في طابور (BullMQ) لا في المعاملة.
