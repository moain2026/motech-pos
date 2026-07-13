# طبقة النقل الموحّدة للطباعة (PrintTransport)

> التاريخ: 2026-07-13 · تنفيذ التوصية المعمارية في `PRINTER_CONNECTIVITY_RESEARCH.md` §8 (المرحلة الويب)
> المبدأ: **افصل الترميز عن النقل** — بايتات ESC/POS (نصي + raster عربي `GS v 0`) تُبنى مرة واحدة، وطبقة النقل توصلها للطابعة عبر أفضل قناة متاحة.

## المعمارية

```
ReceiptModel
    │  buildPrintBytes()  ← raster عربي (افتراضي) أو ESC/POS نصي CP1256
    ▼
PrintTransport (اختيار تلقائي بالأفضلية)
┌──────────────────────┬───────────────────┬─────────────────────────┐
│ 1) WebSerialTransport│ 2) WebUsbTransport │ 3) BrowserPrintTransport│
│ بلوتوث SPP كلاسيكي   │ USB خام (class 7)  │ window.print (HTML RTL) │
│ (Bixolon SPP-R310…)  │ Linux/macOS/Android│ fallback دائم — كل      │
│ + USB-serial         │ (Windows: Zadig)   │ المتصفحات               │
│ Chrome 117+/138+     │                    │                         │
└──────────────────────┴───────────────────┴─────────────────────────┘
```

## الملفات (`frontend/src/features/print/transport/`)

| ملف | الدور |
|---|---|
| `types.ts` | واجهة `PrintTransport { id, label, raw, isSupported, connect, pair?, send, disconnect }` + أنواع Web Serial (غير موجودة في lib.dom — معرّفة حسب مواصفة W3C) |
| `web-serial.ts` | `WebSerialTransport` — `navigator.serial`: بلوتوث SPP الكلاسيكي (RFCOMM، Chrome 117+ سطح مكتب / 138+ أندرويد) + محوّلات USB-serial. baud قابل للضبط (9600 افتراضي، `setSerialBaudRate`، مفتاح `motech.print.serial.baud`). إعادة اتصال صامتة عبر `getPorts()` |
| `web-usb.ts` | `WebUsbTransport` — طابعات USB class 7، إعادة استخدام الأجهزة المأذونة عبر `getDevices()`؛ يبقي الجهاز مفتوحاً بين الطباعات |
| `browser-print.ts` | `BrowserPrintTransport` — يغلّف `printReceipt` (iframe + window.print). ناقل «مستندي» (`raw=false`): يطبع HTML لا بايتات |
| `index.ts` | `detectTransports()` (الأفضلية: Serial → USB → Browser) · `resolveActiveTransport()` (تفضيل localStorage `motech.print.transport` أو الأفضل المتاح) · `buildPrintBytes(model, {raster, headWidth, openDrawer, cut})` · `printViaTransport(transport, model, opts)` |
| `../hooks/usePrinter.ts` | hook للواجهة: `print()` مع **fallback تلقائي للمتصفح عند فشل الناقل الخام**، `pair(id)` (حوار الاقتران + حفظ التفضيل)، `select(id)` |
| `../components/PrintReceiptButton.tsx` | زر الطباعة: ناقل تلقائي + زر «إعداد الطابعة» (⚙) يعرض الناقلات المتاحة ويطلب الاقتران |

## سلوك الطباعة

1. **الافتراضي:** raster عربي (`GS v 0`) — canvas يرسم الإيصال بتشكيل عربي مثالي ثم يُرسل كصورة، فيعمل على أي طابعة حرارية بغضّ النظر عن ترميزها (`PRINT_RASTER.md`). البايتات النهائية: `ESC @` + صورة + تغذية + درج (`ESC p`) + قص (`GS V B`).
2. **`raster:false`:** ESC/POS نصي CP1256 (للطابعات ذات صفحة عربية) — عبر `encodeReceiptEscPos` كما كان.
3. **الفشل لا يكسر البيع أبداً:** فشل ناقل خام → `usePrinter.print` يسقط تلقائياً إلى `window.print` ويبلّغ (`print.fellBack`). فشل كل شيء → رسالة `print.failed` وإعادة الطباعة متاحة.

## القيود المعروفة (من البحث — لم تتغير)

- Web Serial/WebUSB: **Chromium فقط** (لا Safari/Firefox) + سياق آمن + إيماءة مستخدم لأول اقتران.
- بلوتوث SPP: يجب الاقتران **مسبقاً على مستوى نظام التشغيل** — المتصفح لا يقترن.
- Windows + USB: `usbprint.sys` يمنع WebUSB (يتطلب Zadig) — المسار الصحيح هناك حالياً `window.print`، ولاحقاً وسيط Tauri/Rust.
- الطباعة الشبكية TCP:9100 مستحيلة من المتصفح — مرحلة Capacitor/Tauri القادمة (نفس واجهة `PrintTransport` ستُوسَّع بناقلَي `capacitor-spp` و`tauri-cmd`).

## التحقق المُنجز (2026-07-13)

- `npx tsc -b` (strict) — صفر أخطاء · `oxlint` — صفر أخطاء في ملفات print · `npm run build` نجاح.
- deploy إلى `/var/www/motech-pos/` — `index.html` المنشور مطابق بايت-ببايت للبناء المحلي، والدومين 200، وbundle المنشور يحوي كود النقل (`motech.print.transport`, `requestPort`).
- **الاختبار على عتاد حقيقي يبقى للمالك** (لا طابعة على بيئة التطوير):
  1. **بلوتوث (SPP-R310):** اقرن الطابعة من إعدادات النظام → افتح POS في Chrome → ⚙ «إعداد الطابعة» → «بلوتوث / منفذ تسلسلي» → اختر المنفذ من الحوار → اطبع.
  2. **USB (Linux/Android):** ⚙ → «طابعة USB (WebUSB)» → اختر الجهاز → اطبع.
  3. تحقّق: العربي يخرج مرسوماً صحيحاً (raster)، القص يعمل، الدرج ينفتح مع البيع.
