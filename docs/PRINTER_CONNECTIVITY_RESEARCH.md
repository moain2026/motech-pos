# بحث تقني: توصيل الطابعات الحرارية (ESC/POS) بنظام Motech POS

> التاريخ: 2026-07-13 · النطاق: ويب (PWA React) + Android (Capacitor) + سطح مكتب (Tauri)
> الطابعة المرجعية: **Bixolon SPP-R310** (بلوتوث كلاسيكي SPP + USB + اختيارياً WLAN) — بالإضافة لطابعات USB/شبكة عامة.
> ملاحظة: النظام يولّد بالفعل بايتات ESC/POS (نصي + raster `GS v 0` للعربي — انظر `docs/PRINT_RASTER.md`). المشكلة إذن هي **النقل (Transport)** فقط: كيف نوصل البايتات للطابعة على كل منصة.

---

## 1. قيود المتصفح — الحقيقة الدقيقة (حالة 2026)

### 1.1 Web Bluetooth = BLE فقط، ولا شيء غيره
- **Web Bluetooth API يدعم حصرياً Bluetooth Low Energy (GATT)**. لا يوجد أي دعم لـ Bluetooth Classic أو بروفايل SPP/RFCOMM، ولا خطط لإضافته (المصدر: MDN + مواصفة W3C Web Bluetooth).
- **لماذا لا يعمل SPP-R310 عبر Web Bluetooth؟** لأن SPP-R310 يستخدم **Bluetooth Classic (BR/EDR) مع بروفايل Serial Port Profile فوق RFCOMM** — وهذا نظام مختلف جذرياً عن BLE/GATT. المتصفح لا يرى الجهاز أصلاً في نافذة اختيار Web Bluetooth (يعرض أجهزة BLE فقط).
- حتى لدى Zebra (مستند مطوّريهم الرسمي): "BLE أبطأ من Classic SPP — يُنصح بـ SPP للطباعة وBLE للإعدادات فقط". الطابعات المحمولة الجادة كلها SPP.

### 1.2 Web Serial API — **هذا هو التطور المهم** ✅
- **منذ Chrome 117 (سبتمبر 2023) على سطح المكتب**: Web Serial API يدعم الاتصال بخدمات **RFCOMM على أجهزة Bluetooth Classic المقترنة، بما فيها بروفايل SPP** (المصدر: developer.chrome.com/blog/serial-over-bluetooth). أي أن `navigator.serial.requestPort()` يعرض الطابعة المقترنة كمنفذ تسلسلي ويمكن الكتابة إليها مباشرة.
- **منذ Chrome 138 على Android (يونيو 2025)**: Web Serial أصبح مدعوماً على **Android عبر Bluetooth RFCOMM** (chromestatus feature 5139978918821888). أي أن PWA على جهاز Android بكروم حديث تستطيع نظرياً الطباعة إلى SPP-R310 مباشرة من المتصفح.
- **الشروط والقيود**:
  - الطابعة يجب أن تكون **مقترنة (paired) مسبقاً** على مستوى نظام التشغيل — الاقتران لا يتم من المتصفح.
  - Chrome/Edge (Chromium) فقط — **لا Safari ولا Firefox** (لا يدعمان Web Serial إطلاقاً).
  - على سطح المكتب يعمل على Windows/macOS/Linux. على Windows يظهر أيضاً كـ COM port افتراضي.
  - إيماءة مستخدم (نقرة) مطلوبة لأول `requestPort()` لكل أصل (origin)؛ بعدها يمكن إعادة الاتصال بدون حوار عبر `getPorts()`.
  - iOS: **صفر دعم** (Safari هو المحرك الوحيد المسموح؛ لا Web Serial ولا Web Bluetooth ولا WebUSB).
- **Web Serial لـ USB السلكي**: يعمل مع محوّلات USB-to-Serial (CDC/FTDI). معظم الطابعات الحرارية USB تَظهر كـ **USB printer class (class 7)** وليس serial — فلا يراها Web Serial. بعضها (ومنها SPP-R310 عبر كابل USB بوضع معيّن) قد يظهر كـ Virtual COM حسب الدرايفر.

### 1.3 WebUSB — يعمل لكن بمطبّات على Windows
- WebUSB يسمح بإرسال bulk transfer خام مباشرة لطابعة USB (class 7) — وهذا ما يستخدمه النظام حالياً (`webusb-printer.ts`).
- **الواقع حسب المنصة** (مرجع ممتاز: Niels Leenheer — "Receipt Printers 101"، 2024):
  - **Linux / macOS / ChromeOS / Android**: يعمل مباشرة (على Linux قد يحتاج udev rule).
  - **Windows**: **لا يعمل مباشرة** لأن درايفر `usbprint.sys` يستحوذ حصرياً على الجهاز، فيفشل `claimInterface` بـ Access Denied. الحل الوحيد: استبدال الدرايفر بـ **WinUSB عبر أداة Zadig** — إجراء تقني غير مقبول تشغيلياً لعملاء POS (يكسر أيضاً أي برنامج ويندوز آخر يطبع لنفس الطابعة).
- WebUSB لا يدعم البلوتوث إطلاقاً (USB فقط بالتعريف).

### 1.4 خلاصة قدرات المتصفح 2026
| API | Bluetooth Classic SPP | USB خام | شبكة TCP:9100 | Windows | Android | iOS |
|---|---|---|---|---|---|---|
| Web Bluetooth | ❌ (BLE فقط) | ❌ | ❌ | BLE فقط | BLE فقط | ❌ |
| **Web Serial** | ✅ Chrome 117+ سطح مكتب، 138+ أندرويد | جزئي (Virtual COM فقط) | ❌ | ✅ | ✅ (RFCOMM) | ❌ |
| WebUSB | ❌ | ✅ (ما عدا Windows بدون Zadig) | ❌ | ⚠️ Zadig | ✅ | ❌ |
| المتصفح لا يستطيع فتح TCP socket خام → الطباعة الشبكية المباشرة (9100) **مستحيلة من المتصفح** بدون وسيط. |

**النتيجة الحاسمة:** SPP-R310 **يمكن** الوصول إليه من متصفح Chrome حديث عبر **Web Serial (RFCOMM)** على سطح المكتب وعلى Android — هذا يغيّر المعادلة عمّا كان شائعاً ("مستحيل من المتصفح"). لكنه يبقى Chromium-only ويتطلب اقتراناً مسبقاً، فلا يصلح كمسار وحيد.

---

## 2. حلول الوسيط المحلي (Print Bridge / Agent)

عندما لا تكفي واجهات المتصفح (Windows+USB، طابعات شبكة، Safari/Firefox)، الحل القياسي: عملية محلية صغيرة تستقبل من صفحة الويب عبر WebSocket/HTTP على `localhost` وترسل للطابعة.

| الحل | المنصات | Bluetooth SPP | USB | شبكة 9100 | الترخيص/التكلفة | النضج |
|---|---|---|---|---|---|---|
| **QZ Tray** | Win/macOS/Linux | ⚠️ غير مباشر فقط (إن ظهرت الطابعة كـ COM افتراضي أو طابعة نظام بعد الاقتران) — لا إدارة بلوتوث أصلية | ✅ (raw + عبر درايفر النظام) | ✅ | LGPL مجاني؛ لكن **إسكات نافذة التوقيع يتطلب شهادة مدفوعة** (~$599/سنة Premium، وباقات أعلى) أو توقيع ذاتي بخطوات تقنية | ناضج جداً (10+ سنوات، معيار فعلي)؛ يتطلب **Java** على كل جهاز عميل (ثقيل) |
| **Star WebPRNT** | متصفح/أجهزة Star | ✅ (عبر تطبيق WebPRNT Browser على Android/iOS) | ✅ | ✅ | مجاني | ناضج لكن **حبيس طابعات Star فقط** — لا يفيد Bixolon |
| **Bixolon Web Print SDK** (وسيط رسمي من الشركة) | Windows (V2.2.8)، iOS (تطبيق App Store)، Android (V1.21) | ✅ (طابعات Bixolon، ومنها SPP-R310 المذكورة صراحة في دليل الـ API) | ✅ | ✅ | مجاني | رسمي ومُحدَّث (آخر إصدار ويندوز 2025-06)؛ يعمل كخدمة محلية + مكتبة JS (`bxlpos.js`)؛ **حبيس طابعات Bixolon** |
| **بدائل مفتوحة** (escpos-printer-server PHP/Workerman، جسور Node.js حديثة، ESC POS Bridge لكروم) | حسب التنفيذ | حسب التنفيذ | ✅ | ✅ | مجاني MIT/GPL | متفاوت — مشاريع فردية، صيانة غير مضمونة |
| **وسيط مخصّص (Node أو Rust) عبر WebSocket محلي** | Win/macOS/Linux | ✅ (Windows: COM افتراضي بعد الاقتران؛ Linux: `/dev/rfcomm0`) | ✅ (escpos/rusb أو `\\.\COMx` أو lp) | ✅ TCP خام | مجاني — كوده لنا | نبنيه نحن؛ ~200–400 سطر؛ **وميزة ذهبية: نفس كود Rust يُعاد استخدامه داخل Tauri** |

**نقطة جوهرية عن البلوتوث في الوسطاء:** على Windows، اقتران أي طابعة SPP ينشئ تلقائياً **منفذ COM افتراضي** (Outgoing COM port). أي وسيط يكتب إلى COM/serial (بما فيه QZ Tray ووسيطنا المخصص) يغطي البلوتوث بهذه الطريقة — بدون أي كود بلوتوث حقيقي. هذا هو المسار الأكثر موثوقية على سطح المكتب.

---

## 3. مسار Android (Capacitor)

داخل تطبيق أصلي لا توجد أي قيود متصفح — Android يدعم Bluetooth Classic SPP بالكامل عبر `BluetoothSocket` + UUID القياسي `00001101-0000-1000-8000-00805F9B34FB`.

| Plugin | SPP كلاسيكي | ملاحظات |
|---|---|---|
| **`capacitor-thermal-printer`** (Malik12tree) | ✅ | يستخدم Rongta RTPrinter SDK رسمياً؛ يعمل مع طابعات ESC/POS عامة عبر البلوتوث الكلاسيكي؛ Android + iOS؛ **الأكثر ملاءمة إن أردنا plugin جاهزاً**؛ لكن API عالي المستوى (نصوص/صور) — نحتاج التأكد من تمرير bytes خام (يدعم `raw`) |
| **`lidta-capacitor-bl-printer`** | ✅ | مجاني، Capacitor أصيل، طباعة صور/HTML — مناسب لمسار الـ raster عندنا |
| `cordova-plugin-bluetooth-serial` | ✅ | يعمل ويغطي SPP تماماً (كُتب أصلاً لأردوينو)؛ لكنه **مهجور منذ ~2017** — مخاطرة صيانة مع أهداف Android الجديدة (أذونات BLUETOOTH_CONNECT في API 31+ تتطلب ترقيعاً) |
| `@capacitor-community/bluetooth-le` | ❌ | **BLE فقط** — لا يرى SPP-R310 نهائياً. غير صالح |
| **Bixolon Android SDK الرسمي** | ✅ | يدعم SPP-R310 بالاسم؛ الأقوى للطابعة المرجعية لكن يتطلب كتابة Capacitor plugin جسر خاص بنا؛ حبيس Bixolon |
| **plugin مخصّص بسيط** (كتابتنا) | ✅ | `BluetoothSocket` + كتابة bytes — ~150 سطر Kotlin؛ يستقبل نفس بايتات ESC/POS المولّدة في الواجهة؛ **صفر تبعية لمصنّع** |

**هل SPP-R310 مدعوم؟ نعم بلا نقاش** — أي حل SPP كلاسيكي يعمل معه (وهو من أشهر طابعات الجيب توافقاً)، وBixolon توفر فوقها SDK أندرويد رسمياً.

**بديل إضافي على Android:** بما أن Chrome 138+ يدعم Web Serial/RFCOMM، حتى الـ PWA (قبل التغليف) تطبع بلوتوث على أندرويد. لكن التطبيق المغلّف أفضل (لا حوار اختيار منفذ متكرر، تحكم كامل).

---

## 4. مسار Tauri (سطح المكتب)

في Rust كل الأبواب مفتوحة:

1. **`escpos` crate** (crates.io — محدَّث 2026): يدعم drivers جاهزة: **USB (rusb)، HidApi، شبكة TCP، ملف/serial**. الأنسب لنا لأنه transport فقط أو ترميز+transport.
2. **البلوتوث SPP على سطح المكتب**: أنظف طريقة = **الاقتران على مستوى النظام ثم الكتابة للمنفذ التسلسلي الافتراضي** (`COMx` على Windows، `/dev/rfcomm0` على Linux، `/dev/tty.*` على macOS) عبر **`serialport` crate**. لا حاجة لمكدس بلوتوث في كودنا (btleplug = BLE فقط، لا يفيد SPP).
3. **USB**: خياران — خام عبر `rusb` (نفس فكرة WebUSB لكن بدون قيود Windows لأن Tauri عملية أصلية يمكنها استخدام libusb مع WinUSB أو المرور من درايفر الطباعة)، أو **عبر طابعة النظام** (RAW spool: `winspool` على Windows / CUPS على Linux/macOS) — وهذا **الأكثر موثوقية على Windows** (الدرايفر موجود أصلاً).
4. **الشبكة**: `TcpStream::connect("ip:9100")` وكتابة البايتات — أبسط مسار على الإطلاق.
5. Plugins جاهزة: `tauri-plugin-thermal-printer` (يغلّف ESC/POS)، `tauri-plugin-escpos` (⚠️ BLE فقط حالياً — لا يصلح). الأفضل: **أمر Tauri مخصّص** يستقبل `Vec<u8>` من الواجهة ويوجهه لـ serial/USB/TCP — ~100 سطر.

---

## 5. SDK الشركة المصنّعة (Bixolon)

نعم، Bixolon لديها منظومة رسمية كاملة لـ SPP-R310 (صفحة تحميلات الموديل idx=14):
- **Web Print SDK**: Windows V2.2.8 (2025-06)، iOS (App Store، iOS 15+)، **Android Web Print SDK V1.21** — خدمة محلية + JS API (`bxlpos.js`) للطباعة من المتصفح. يغطي SPP-R310 صراحة في دليل الـ API المرجعي.
- **Android SDK / iOS SDK** أصليان (Java/Swift) — اتصال SPP وUSB مباشر.
- **mPrint Server**: طباعة من متصفحات Windows/iOS لطابعات Bixolon.
- القيد الوحيد والحاسم: **كل هذا حبيس Bixolon**. نظام POS تجاري سيواجه Epson وXprinter وRongta وSunmi… الاعتماد المعماري على SDK مصنّع واحد خطأ استراتيجي — نستخدمه كـ**مرجع اختبار** لا كأساس.

---

## 6. WebPRNT والطباعة الشبكية المباشرة (TCP 9100)

- **الطابعات الشبكية (Ethernet/WiFi)** تستمع على منفذ **9100 (RAW/JetDirect)** — ترسل بايتات ESC/POS عبر TCP وتُطبع فوراً. أسرع وأثبت مسار في المطاعم/المطابخ.
- **من المتصفح: مستحيل مباشرة** (لا TCP sockets خام في الويب، وfetch لن ينفع لبروتوكول خام + mixed content). يتطلب وسيطاً (bridge) أو تطبيقاً أصلياً.
- من **Capacitor**: socket أصلي (plugin بسيط) ✅. من **Tauri**: `TcpStream` ✅. من **الوسيط المحلي**: ✅.
- **Star WebPRNT**: بروتوكول HTTP/XML خاص بطابعات Star فيه خادم ويب داخل الطابعة — فكرة أنيقة لكنها لا تنطبق على Bixolon/ESC/POS العام. (Epson لديها المكافئ ePOS-Print/ePOS-Device على طابعات TM الشبكية — إن دعمنا Epson شبكية لاحقاً فهي تُطبع حتى من المتصفح مباشرة عبر HTTP POST لأن الطابعة نفسها الخادم).

---

## 7. جدول المقارنة الشامل

| الحل | ويب PWA | Android | سطح مكتب | SPP (مثل R310) | USB | شبكة | التكلفة | النضج | ملاحظة حاسمة |
|---|---|---|---|---|---|---|---|---|---|
| **Web Serial (RFCOMM)** | ✅ Chrome فقط | ✅ Chrome 138+ | ✅ (عبر PWA) | ✅ | ⚠️ Virtual COM فقط | ❌ | مجاني | جديد نسبياً، مستقر | يتطلب اقتراناً مسبقاً + Chromium حصراً |
| **WebUSB** (الحالي عندنا) | ✅ | ✅ | ⚠️ | ❌ | ✅ إلا Windows (Zadig) | ❌ | مجاني | ناضج | عقبة Windows قاتلة تشغيلياً |
| **QZ Tray** | ✅ (عبر الوسيط) | ❌ | ✅ | ⚠️ غير مباشر (COM) | ✅ | ✅ | مجاني + ~$599/سنة للصمت | ناضج جداً | يفرض Java على كل POS |
| **Bixolon Web Print SDK** | ✅ | ✅ | ✅ Windows | ✅ | ✅ | ✅ | مجاني | رسمي محدَّث | Bixolon فقط — vendor lock-in |
| **Star WebPRNT** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | مجاني | ناضج | Star فقط — خارج الموضوع |
| **Capacitor plugin SPP** (thermal-printer / مخصّص) | — | ✅ | — | ✅ | ⚠️ (USB OTG ممكن) | ✅ | مجاني | جيد | يغطي أندرويد بالكامل |
| **Tauri (serialport + escpos + TCP + spooler)** | — | — | ✅ | ✅ (COM افتراضي) | ✅ | ✅ | مجاني | crates ناضجة | يغطي سطح المكتب بالكامل |
| **وسيط مخصّص Rust/Node (WebSocket محلي)** | ✅ | — | ✅ | ✅ (COM) | ✅ | ✅ | مجاني (كودنا) | نبنيه | يشارك كود Tauri نفسه |

---

## 8. التوصية المعمارية النهائية

### المبدأ: **افصل الترميز عن النقل** — وقد فعلنا نصف العمل
مولّد البايتات (نصي + raster عربي `GS v 0`) موجود ومُثبت في `frontend/src/features/print/`. المطلوب طبقة نقل واحدة موحّدة بواجهة `PrintTransport { write(bytes: Uint8Array): Promise<void> }` وخلفها 4 تطبيقات حسب بيئة التشغيل (كشف تلقائي):

```
ReceiptBytes (ESC/POS — مشترك 100%)
        │
        ▼  PrintTransport (اختيار تلقائي)
┌───────────────┬───────────────────┬───────────────────┬─────────────────┐
│ 1) Web Serial │ 2) WebUSB         │ 3) Capacitor SPP  │ 4) Tauri cmd    │
│ بلوتوث SPP    │ USB خام           │ (Android مغلّف)    │ (سطح مكتب)      │
│ Chrome سطح    │ Linux/macOS/      │ BluetoothSocket    │ serialport +    │
│ مكتب+Android  │ Android           │ + TCP socket       │ rusb/spooler +  │
│               │                   │                    │ TcpStream:9100  │
└───────────────┴───────────────────┴───────────────────┴─────────────────┘
        └── fallback أخير دائماً: window.print (HTML عربي عبر درايفر النظام)
```

### التفصيل لكل منصة
1. **الويب (PWA — المرحلة الحالية)**:
   - **أضف Web Serial transport فوراً** — هذا يفتح SPP-R310 بلوتوث من المتصفح على سطح المكتب (Chrome 117+) وعلى Android (Chrome 138+) بدون أي وسيط. جهد صغير وأثر كبير.
   - أبقِ WebUSB لطابعات USB على Linux/macOS/Android.
   - على **Windows + USB** لا تعِد المستخدم بالطباعة الصامتة من المتصفح — وجّهه لـ `window.print` أو لنسخة سطح المكتب (Tauri).
   - **لا نوصي بـ QZ Tray**: تكلفة سنوية لإسكات الحوار + تبعية Java + لا يضيف شيئاً لن نحصل عليه من وسيط Tauri الخاص بنا.
2. **Android (Capacitor)**:
   - Plugin بلوتوث كلاسيكي: ابدأ بـ **`capacitor-thermal-printer`** (يدعم raw bytes وSPP)، وإن ظهرت حدود اكتب **plugin مخصّص** (`BluetoothSocket` + UUID SPP، ~150 سطر Kotlin) — SPP-R310 مضمون في الحالتين.
   - أضف socket TCP بسيط للطابعات الشبكية (المطبخ).
   - تجنّب `@capacitor-community/bluetooth-le` نهائياً (BLE فقط).
3. **سطح المكتب (Tauri)**:
   - أمر Rust واحد `print_raw(target, bytes)` بثلاث قنوات: **`serialport`** (بلوتوث SPP عبر COM الافتراضي بعد الاقتران — يغطي R310)، **spooler النظام RAW** (winspool/CUPS — أوثق مسار USB على Windows)، **`TcpStream` إلى :9100** (شبكة).
   - **مكافأة معمارية**: نفس هذا الكود يُبنى كـ **binary وسيط مستقل صغير (Rust, WebSocket على 127.0.0.1)** يُثبَّت على أجهزة العملاء الذين يريدون البقاء على المتصفح مع طباعة صامتة كاملة على Windows — بديل QZ Tray مجاني ومملوك لنا.
4. **Bixolon SDK**: لا يدخل المعمارية. يُستخدم فقط أداة تشخيص/تحقق عند مشاكل جهاز معيّن.

### لماذا هذه هي "الأدق"؟
- **تغطية SPP-R310 على المنصات الثلاث** بمسارات أصلية موثوقة (Web Serial، BluetoothSocket، serialport) بدون أي رسوم ترخيص أو vendor lock-in أو Java.
- **صفر ازدواجية ترميز**: ESC/POS (بما فيه raster العربي) يُولَّد مرة واحدة في TypeScript ويُنقل بايتات خام في كل مسار.
- **تدرّج عملي**: كل مرحلة تعمل وحدها — اليوم Web Serial + WebUSB، غداً Capacitor، بعده Tauri — بلا إعادة هيكلة.
- **مخرج Windows الوحيد الصحيح**: الطباعة الصامتة USB على Windows تمر حصراً عبر عملية أصلية (Tauri/وسيط) — وهذا ما تؤكده كل المصادر (قيد usbprint.sys ليس قابلاً للالتفاف من المتصفح).

### مصادر رئيسية
- Chrome Developers: *Serial over Bluetooth on the web* (Chrome 117) + *Web serial over Bluetooth on Android* (chromestatus 5139978918821888, Chrome 138).
- MDN: Web Bluetooth API (BLE only) / Web Serial API.
- Niels Leenheer: *Receipt Printers 101* (2024) — قيود WebUSB على Windows (usbprint.sys/Zadig).
- QZ Tray: qz.io (LGPL + تسعير التوقيع/الدعم).
- Bixolon: صفحة تحميلات SPP-R310 (Web Print SDK Windows V2.2.8 · Android V1.21 · iOS) + دليل Web Print SDK API (يشمل SPP-R310).
- GitHub: Malik12tree/capacitor-thermal-printer · DantSu/ESCPOS-ThermalPrinter-Android · crates: escpos، serialport، tauri-plugin-thermal-printer.
- Zebra Developer Portal: توصية SPP للطباعة مقابل BLE للإعدادات.
