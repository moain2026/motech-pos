# POST_WST — توثيق شاشة Onyx Pro POS

> النوع: **POST** — حركات/فواتير (Transactions)  
> الحجم: 10,524 bytes · فك witchi: ✅ كامل · المصدر: `D:\YS_ERP\Forms\POST_WST.fmx`

## 1. الوظيفة

_(لا يوجد ملف مساعدة مطابق؛ الوظيفة مُستنتَجة من النوع والـ SQL)_

## 2. Data Blocks (2)

| Block | نوع | QIU | Lock | ملاحظات |
| --- | --- | --- | --- | --- |
| BLOCK8 | ctrl | QIU | AUTOMATIC |  |
| MTX_WST_TRANS | DB | QIU | AUTOMATIC |  |

## 3. Canvases (1) — التخطيط البصري

| Canvas | النوع | الأبعاد (W×H) | الظهور |
| --- | --- | --- | --- |
| CANVAS2 | CONTENT | 615×547 | visible |


_ملاحظة: أبعاد الـ canvas بوحدة الـ character cell (8×16 px تقريباً للـ Forms 6i)._

## 4. Windows (1)

| Window | العنوان | النمط | Modal |
| --- | --- | --- | --- |
| WINDOW1 |  | DOCUMENT | false |

## 5. Triggers (0)

_(لا يوجد)_

## 6. Program Units (0)

_(لا يوجد)_

## 9. جداول قاعدة البيانات المرتبطة (من تحليل SQL في الـ .fmx)

_(لم تُكتشف جداول صريحة في نصوص الـ SQL)_

## 11. ملاحظات / قيود

- منطق PL/SQL داخل الـ triggers/program-units = p-code (لا يُستعاد نصّه؛ الأسماء فقط). المنطق الكامل يُستخرَج من حِزَم DB عبر `ALL_SOURCE`.
- الـ items (الحقول داخل البلوكات) لا تُطبع في CLI الحالي — تُستكمل عبر Visual RE (screenshots) للـ layout والتسميات العربية.
- عدد الجُمل/الأسطر في ملف strings: راجع `_raw/POST_WST_strings.txt`.
