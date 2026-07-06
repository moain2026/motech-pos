# STYLE_GUIDE — نظام تصميم Motech POS

> المرجع الموحّد للواجهة. مبني على **معايير POS العالمية** (DevPro «10 UX tactics for POS» + Nielsen touch guidelines) وموثّق في `docs/UIUX_RESPONSIVE_PLAN.md`.
> **القاعدة:** لا ألوان/مقاسات/خطوط سحرية في المكوّنات — كلها من الـtokens.

## 0) المبادئ (POS-first)
1. **Mobile-first إلزامي** — نبني للجوال (390px) أولاً ثم نوسّع (تابلت 820px، ديسكتوب 1440px).
2. **أهداف لمس ≥48px** لأزرار POS الأساسية (≥44px حد أدنى عالمي لكل زر).
3. **يُقرأ من بعيد (~30 بوصة)** — خطوط سُلّمية responsive، ترميز لوني عالي التباين.
4. **تغذية راجعة فورية** لكل تفاعل (toast/haptic/تغيّر لوني).
5. **صفر overflow أفقي** على 390px — تُختبر كل شاشة حياً.

## 1) الـTokens — `src/styles/tokens.css`
مصدر الحقيقة الوحيد. مربوطة بـTailwind v4 عبر `@theme` في `src/styles.css` (لا يوجد `tailwind.config.js` — Tailwind v4 يعرّف الـtheme داخل CSS).

### الألوان الدلالية
| Token | الاستخدام |
|---|---|
| `--color-brand-50…900` | العلامة (teal) — الأزرار الأساسية، التمييز |
| `--color-bg` / `--color-surface` / `--color-surface-2` / `--color-surface-3` | تدرّج أعماق الأسطح |
| `--color-border` / `--color-border-strong` | الحدود |
| `--color-fg` / `--color-fg-strong` / `--color-muted` / `--color-muted-2` | النص |
| `--color-success` / `--color-warning` / `--color-danger` / `--color-info` | الحالات (+ `-soft` للخلفيات الشفّافة) |
| `--color-stock-in` / `-low` / `-out` / `-weighed` | ترميز حالة المخزون (POS) |

استخدمها في JSX هكذا: `bg-[var(--color-surface)]`، `text-[var(--color-muted)]`، أو utilities Tailwind المولّدة `bg-brand-600`.

### الخطوط (سُلّمية responsive بـclamp)
`--text-2xs … --text-4xl` — تكبر بلطف بين الجوال والديسكتوب. الاستخدام: `text-[length:var(--text-lg)]` أو utility `text-lg`.
- المبالغ الكبيرة (الإجمالي): `--text-3xl` bold.
- نص الجسم: `--text-base`. الشارات: `--text-2xs/--text-xs`.

### المسافات / الأقطار / الظلال
`--space-1…12` (أساس 4px) · `--radius-sm…xl` (الافتراضي `--radius`=12px) · `--shadow-sm…xl`.

### أهداف اللمس
`--touch-min` (44px) · `--touch` (48px، الافتراضي لأزرار POS) · `--touch-lg` (56px، أزرار الدفع).

### نقاط التوقّف (mobile-first)
`xs`(416) · `sm`(640) · `md`(768) · `tab`(816≈820) · `lg`(1024) · `xl`(1280) · `2xl`(1440).
المرجع للاختبار الحي: **390 / 820 / 1440**.

## 2) المكوّنات المشتركة — `src/shared/ui/*`
كلها موحّدة على الـtokens.

### `Button`
variants: `primary` · `secondary` · `success` · `warning` · `danger` · `ghost` · `outline`.
sizes: `sm` · `md` (افتراضي) · `lg` · **`touch`** (≥48px) · **`xl`** (≥56px، دفع كبير) · `icon` · `icon-touch` (48px).
```tsx
<Button variant="success" size="xl">دفع نقدي</Button>
```

### `Input`
`inputSize`: `sm` · `md` (افتراضي h-11) · `touch` (≥48px). يقبل تجاوز الارتفاع عبر className.

### `Card` (+ `CardHeader` / `CardTitle` / `CardBody`)
`variant`: `surface` (افتراضي) · `surface-2`.

### `Dialog` — **متجاوب**
- **جوال:** bottom-sheet ينزلق من الأسفل (`animate-sheet-up`)، أقصى 90vh.
- **تابلت/ديسكتوب:** نافذة مركزية.
- إغلاق: Esc + خلفية + زر ×. يقفل تمرير الجسم. `size`: `sm|md|lg`.
```tsx
<Dialog title="عنوان" size="md" onClose={close} footer={<Button>حفظ</Button>}>…</Dialog>
```

### `Table` (+ `THead/TBody/TR/TH/TD`) — **متجاوب**
نمط "stacked": على الجوال (<640px) يتحوّل كل صف إلى بطاقة label/value عبر `data-label` على `<TD>`؛ على الأكبر جدول قابل للتمرير أفقياً.
```tsx
<TD data-label="السعر">{price}</TD>
```

### حالات العرض — `StateView`
`LoadingView` · `EmptyView` · `ErrorView` (يعرض RFC9457 detail + traceId + retry).

## 3) الأدوات المساعدة (utilities في styles.css)
- `.tnum` — أرقام جدولية لأعمدة المال.
- `.scroll-thin` — شريط تمرير رفيع.
- `.scroll-x-touch` — تمرير أفقي سلس بلا شريط (شرائح الفئات/التبويبات).
- `.pb-safe` / `.pt-safe` — احترام المنطقة الآمنة (شقّ الجوال).
- `.animate-sheet-up` / `.animate-fade-in` — حركات الحوار/الـsheet (تحترم prefers-reduced-motion).

## 4) قواعد RTL
- استخدم الخصائص المنطقية دائماً: `ps-*/pe-*/ms-*/me-*/start-*/end-*/text-start/text-end`، وحدود `border-s/border-e`.
- لا `left/right` ثابتة.

## 5) قواعد الشبكة المتجاوبة (POS)
- شاشة البيع: ديسكتوب = شبكة أصناف + سلة جانبية · تابلت = شبكة أوسع + سلة قابلة للطي · جوال = أصناف ملء الشاشة + سلة كـsheet سفلي.
- شبكة الأصناف: `grid-cols-2` (جوال) → `sm:3` → `lg:4` → `2xl:5`. بطاقات بحد أدنى ~150px.
- أزرار الدفع الأساسية: كبيرة (`size="xl"`)، ثابتة أسفل السلة، ترميز لوني (نقد=success، بطاقة=primary).

## 6) الترميز اللوني لحالة المخزون
| الحالة | Token | الدلالة البصرية |
|---|---|---|
| متوفر | `--color-stock-in` | أخضر |
| منخفض | `--color-stock-low` | برتقالي |
| نافد | `--color-stock-out` | أحمر |
| موزون | `--color-stock-weighed` | بنفسجي |

---
_يُحدّث مع كل توسعة للنظام. المرحلة 1 (نظام التصميم) — 2026-07-06._
