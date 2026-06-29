# سجلّات القرارات المعمارية (ADR Index)

> Architecture Decision Records — append-only. لا يُحذف ADR؛ القرار المُستبدَل يُعلّم `Superseded by`.
> القالب: MADR (السياق · القرار · البدائل · العواقب). راجع `STANDARDS/11_DOCUMENTATION.md §4`.

| # | العنوان | الحالة | التاريخ |
|---|---------|--------|---------|
| [ADR-001](ADR-001-modular-monolith-clean-hexagonal.md) | المعمارية: Modular Monolith + Clean/Hexagonal | مقبول | 2026-06-29 |
| [ADR-002](ADR-002-tech-stack.md) | حزمة التقنيات: React 19 + NestJS + (Oracle→Postgres) | مقبول | 2026-06-29 |
| [ADR-003](ADR-003-data-strategy-oracle-first.md) | إستراتيجية البيانات: Oracle أولاً + إعادة كتابة المنطق | مقبول | 2026-06-29 |
| [ADR-004](ADR-004-offline-first-pwa.md) | Offline-First / PWA | مقبول | 2026-06-29 |
| [ADR-005](ADR-005-strangler-fig-migration.md) | الترحيل التدريجي بنمط Strangler-Fig | مقبول | 2026-06-29 |

## ملاحظة عرضية على كل القرارات
كل القرارات أدناه مبنية على **حقائق مُستخرَجة حيّاً** من schema `YSPOS23` (118 جدول، 58 package) ومن توثيق 80 شاشة Onyx Pro POS، لا على افتراضات. المراجع الأساسية:
- `docs/db/SCHEMA_OVERVIEW.md` · `docs/db/PACKAGES_ANALYSIS.md` · `docs/db/SALES_FLOW.md`
- `docs/screens/INDEX.md` (80 شاشة) · `db/schema/tables/*.sql` (DDL حقيقي) · `db/schema/plsql/*` (58 package)
- كتيّب المعايير `/home/work/oracle/pos-alabasi/STANDARDS/`.
