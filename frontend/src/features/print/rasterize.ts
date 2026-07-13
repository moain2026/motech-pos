/**
 * rasterize.ts — تحويل الإيصال العربي إلى صورة نقطية (bitmap) للطابعة الحرارية.
 *
 * المشكلة: الطابعات الحرارية الرخيصة لا تملك صفحة ترميز عربية، فالنص العربي في
 * وضع ESC/POS النصي يخرج مشوّهاً. الحل المضمون (STANDARDS/13 §3): نرسم الإيصال
 * على canvas المتصفح (تشكيل عربي مثالي عبر محرك النصوص) ثم نحوّله لصورة أحادية
 * اللون ونطبعها بأمر GS v 0 — يعمل على أي طابعة حرارية بغضّ النظر عن ترميزها.
 *
 * يعتمد على Canvas API المتوفّر في المتصفح (PWA وقت التشغيل). الدالة النقية
 * `packMonochrome` قابلة للاختبار بلا متصفح.
 */
import type { ReceiptModel } from './receipt-model';
import { encodeRasterImage } from './escpos-encoder';

/** عرض رأس الطابعة بالنقاط: 80mm = 576 نقطة، 58mm = 384 نقطة. */
export const HEAD_WIDTH_80MM = 576;
export const HEAD_WIDTH_58MM = 384;

/**
 * تحويل ImageData (RGBA) إلى صورة 1-bpp معبّأة (MSB أولاً، 1 = نقطة سوداء).
 * دالة نقية قابلة للاختبار: البكسل يُعتبر أسود إذا كان لونه أغمق من العتبة.
 *
 * @param rgba   بيانات البكسل RGBA (طول = width*height*4)
 * @param width  العرض بالنقاط
 * @param height الارتفاع بالنقاط
 * @param threshold عتبة السطوع 0..255 (افتراضي 128)
 */
export function packMonochrome(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  threshold = 128,
): Uint8Array {
  const bytesPerRow = Math.ceil(width / 8);
  const out = new Uint8Array(bytesPerRow * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = rgba[i] ?? 255;
      const g = rgba[i + 1] ?? 255;
      const b = rgba[i + 2] ?? 255;
      const a = rgba[i + 3] ?? 255;
      // السطوع الموزون؛ البكسل الشفاف يُعتبر أبيض (خلفية).
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) * (a / 255) + 255 * (1 - a / 255);
      if (lum < threshold) {
        // نقطة سوداء → اضبط البِت (MSB = أقصى اليسار).
        out[y * bytesPerRow + (x >> 3)]! |= 0x80 >> (x & 7);
      }
    }
  }
  return out;
}

/** هل Canvas متاح (متصفح)؟ */
export function canRasterize(): boolean {
  return typeof document !== 'undefined' && typeof document.createElement === 'function';
}

/**
 * يرسم الإيصال على canvas عربي RTL ويعيد ImageData + الأبعاد.
 * يُستدعى في المتصفح فقط. الارتفاع ديناميكي حسب عدد الأسطر.
 */
export function renderReceiptToImageData(
  r: ReceiptModel,
  headWidth: number = HEAD_WIDTH_80MM,
): { data: Uint8ClampedArray; width: number; height: number } {
  const pad = 12;
  const lineH = 34;
  const smallH = 26;
  // ارتفاع تقديري: رأس + أسطر + إجماليات + تذييل + QR.
  const height =
    pad * 2 + 160 + r.lines.length * lineH + 7 * smallH + 180;
  const canvas = document.createElement('canvas');
  canvas.width = headWidth;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, headWidth, height);
  ctx.fillStyle = '#000';
  ctx.direction = 'rtl';
  ctx.textAlign = 'right';
  const right = headWidth - pad;
  let y = pad + 28;

  // الرأس (وسط)
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px "Cairo","Tahoma",sans-serif';
  ctx.fillText(r.store.name, headWidth / 2, y);
  y += 34;
  ctx.font = '20px "Cairo","Tahoma",sans-serif';
  if (r.store.subtitle) { ctx.fillText(r.store.subtitle, headWidth / 2, y); y += 26; }
  if (r.store.vatNumber) { ctx.fillText(`الرقم الضريبي: ${r.store.vatNumber}`, headWidth / 2, y); y += 26; }
  if (r.store.phone) { ctx.fillText(r.store.phone, headWidth / 2, y); y += 26; }
  y += 6;

  // معلومات الفاتورة (يمين)
  ctx.textAlign = 'right';
  ctx.font = '20px "Cairo","Tahoma",sans-serif';
  ctx.fillText(`فاتورة: ${r.billNo}`, right, y); y += smallH;
  ctx.fillText(`التاريخ: ${new Date(r.issuedAt).toLocaleString('ar')}`, right, y); y += smallH;
  if (r.customerName) { ctx.fillText(`العميل: ${r.customerName}`, right, y); y += smallH; }
  drawDivider(ctx, headWidth, pad, y); y += 10;

  // البنود
  for (const l of r.lines) {
    ctx.textAlign = 'right';
    ctx.fillText(l.name, right, y);
    ctx.textAlign = 'left';
    ctx.fillText(`${l.qty} × ${fmt(l.unitPrice)} = ${fmt(l.lineNet)}`, pad, y);
    y += lineH;
  }
  drawDivider(ctx, headWidth, pad, y); y += 10;

  // الإجماليات
  const t = r.totals;
  drawTotal(ctx, headWidth, pad, y, 'الإجمالي', fmt(t.gross)); y += smallH;
  if (t.discount > 0) { drawTotal(ctx, headWidth, pad, y, 'الخصم', fmt(t.discount)); y += smallH; }
  drawTotal(ctx, headWidth, pad, y, 'الضريبة', fmt(t.vat)); y += smallH;
  ctx.font = 'bold 24px "Cairo","Tahoma",sans-serif';
  drawTotal(ctx, headWidth, pad, y, 'الصافي', fmt(t.net)); y += lineH;
  ctx.font = '20px "Cairo","Tahoma",sans-serif';
  drawTotal(ctx, headWidth, pad, y, 'المدفوع', fmt(t.paid)); y += smallH;
  if (t.change > 0) { drawTotal(ctx, headWidth, pad, y, 'الباقي', fmt(t.change)); y += smallH; }
  y += 10;

  // التذييل (وسط)
  ctx.textAlign = 'center';
  if (r.store.footerNote) { ctx.fillText(r.store.footerNote, headWidth / 2, y); y += smallH; }

  const finalHeight = Math.min(y + pad, height);
  const img = ctx.getImageData(0, 0, headWidth, finalHeight);
  return { data: img.data, width: headWidth, height: finalHeight };
}

/**
 * المسار الكامل: يرسم الإيصال العربي كصورة ويعيد بايتات GS v 0 جاهزة للطابعة.
 * يُستدعى في المتصفح. يُغلَّف عادةً بـ init/cut من encodeReceiptEscPos أو منفصلاً.
 */
export function rasterizeReceipt(
  r: ReceiptModel,
  headWidth: number = HEAD_WIDTH_80MM,
): Uint8Array {
  const { data, width, height } = renderReceiptToImageData(r, headWidth);
  const mono = packMonochrome(data, width, height);
  return encodeRasterImage(mono, width, height);
}

function fmt(n: number): string {
  return n.toLocaleString('ar', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function drawDivider(ctx: CanvasRenderingContext2D, w: number, pad: number, y: number): void {
  ctx.save();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(w - pad, y);
  ctx.stroke();
  ctx.restore();
}

function drawTotal(
  ctx: CanvasRenderingContext2D,
  w: number,
  pad: number,
  y: number,
  label: string,
  value: string,
): void {
  ctx.textAlign = 'right';
  ctx.fillText(label, w - pad, y);
  ctx.textAlign = 'left';
  ctx.fillText(value, pad, y);
}
