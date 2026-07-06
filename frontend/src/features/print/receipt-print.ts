/**
 * Browser print path (STANDARDS/13 §3) — the reliable default until a thermal
 * transport (WebUSB / Web Serial / print agent) is wired.
 *
 * Renders the receipt as 80mm-wide RTL HTML into a hidden iframe, injects a QR
 * (e-invoice TLV) as a data-URL image, and calls `window.print()` scoped to a
 * `@page { size: 80mm auto }`. Works with the OS/browser driver for any USB or
 * network thermal printer exposed to the system.
 */
import type { ReceiptModel } from './receipt-model';

function esc(s: string | number | null | undefined): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function money(n: number, currency: string): string {
  const v = Math.round((n + Number.EPSILON) * 100) / 100;
  return `${v.toLocaleString('ar')} ${currency}`;
}

/** Build the printable 80mm RTL HTML document as a string. */
export function buildReceiptHtml(r: ReceiptModel, qrDataUrl: string): string {
  const rows = r.lines
    .map(
      (l) => `
      <tr class="item">
        <td class="name" colspan="3">${esc(l.name)}</td>
      </tr>
      <tr class="item-detail">
        <td class="qty">${esc(l.qty)}${l.unit ? ' ' + esc(l.unit) : ''}</td>
        <td class="price">${esc(l.unitPrice.toFixed(2))}</td>
        <td class="net">${esc(l.lineNet.toFixed(2))}</td>
      </tr>`,
    )
    .join('');

  const totalRow = (label: string, val: string, strong = false) =>
    `<div class="trow${strong ? ' strong' : ''}"><span>${esc(label)}</span><span>${esc(val)}</span></div>`;

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<title>إيصال ${esc(r.billNo)}</title>
<style>
  @page { size: 80mm auto; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    width: 80mm;
    font-family: "Tahoma", "Amiri", "Noto Naskh Arabic", sans-serif;
    font-size: 12px; color: #000; background: #fff;
    padding: 4mm 3mm; direction: rtl; text-align: right;
  }
  .center { text-align: center; }
  .store-name { font-size: 18px; font-weight: 800; margin: 0 0 2px; }
  .store-sub { font-size: 12px; margin: 0; }
  .muted { color: #333; font-size: 11px; }
  hr { border: none; border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 1px 0; vertical-align: top; }
  .item .name { font-weight: 700; padding-top: 3px; }
  .item-detail td { font-size: 11px; color: #111; }
  .item-detail .qty { text-align: right; width: 33%; }
  .item-detail .price { text-align: center; width: 33%; }
  .item-detail .net { text-align: left; width: 34%; font-weight: 700; }
  .thead td { font-weight: 700; border-bottom: 1px solid #000; }
  .trow { display: flex; justify-content: space-between; font-size: 12px; padding: 1px 0; }
  .trow.strong { font-size: 15px; font-weight: 800; border-top: 1px solid #000; padding-top: 4px; margin-top: 2px; }
  .qr { margin: 8px auto 2px; display: block; width: 30mm; height: 30mm; }
  .footer { text-align: center; margin-top: 6px; font-size: 12px; font-weight: 700; }
  .tnum { font-variant-numeric: tabular-nums; }
</style>
</head>
<body class="tnum">
  <div class="center">
    <p class="store-name">${esc(r.store.name)}</p>
    ${r.store.subtitle ? `<p class="store-sub">${esc(r.store.subtitle)}</p>` : ''}
    ${r.store.address ? `<p class="muted">${esc(r.store.address)}</p>` : ''}
    ${r.store.phone ? `<p class="muted">${esc(r.store.phone)}</p>` : ''}
    ${r.store.vatNumber ? `<p class="muted">الرقم الضريبي: ${esc(r.store.vatNumber)}</p>` : ''}
  </div>
  <hr />
  <div class="muted">فاتورة رقم: <b>${esc(r.billNo)}</b></div>
  <div class="muted">التاريخ: ${esc(new Date(r.issuedAt).toLocaleString('ar'))}</div>
  <div class="muted">الكاشير: ${esc(r.cashierNo)} — الجهاز: ${esc(r.machineNo)}</div>
  ${r.customerName ? `<div class="muted">العميل: ${esc(r.customerName)}</div>` : ''}
  <hr />
  <table>
    <tr class="thead"><td>الكمية</td><td class="center">السعر</td><td style="text-align:left">الإجمالي</td></tr>
    ${rows}
  </table>
  <hr />
  ${totalRow('الإجمالي', money(r.totals.gross, r.currency))}
  ${r.totals.discount > 0 ? totalRow('الخصم', money(r.totals.discount, r.currency)) : ''}
  ${r.totals.vat > 0 ? totalRow('الضريبة', money(r.totals.vat, r.currency)) : ''}
  ${totalRow('الصافي', money(r.totals.net, r.currency), true)}
  ${r.paymentMethod ? totalRow('طريقة الدفع', esc(r.paymentMethod)) : ''}
  ${r.totals.paid > 0 ? totalRow('المدفوع', money(r.totals.paid, r.currency)) : ''}
  ${r.totals.change > 0 ? totalRow('الباقي', money(r.totals.change, r.currency)) : ''}
  <hr />
  <img class="qr" src="${qrDataUrl}" alt="QR الفاتورة الإلكترونية" />
  <div class="footer">${esc(r.store.footerNote)}</div>
</body>
</html>`;
}

/**
 * Render the e-invoice QR (TLV payload) to a PNG data-URL.
 * `qrcode` is imported dynamically so it ships in its own lazy chunk — it is
 * only needed at print/e-invoice time, never on the critical POS path.
 */
export async function renderQrDataUrl(payload: string): Promise<string> {
  const { default: QRCode } = await import('qrcode');
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 240,
  });
}

/**
 * Print a receipt via a hidden iframe + window.print(). Resolves after the
 * print dialog is dismissed (or a timeout, since not all browsers fire
 * afterprint). Never throws into the sale path — printing failure ≠ sale
 * failure (STANDARDS/13 §3).
 */
export async function printReceipt(r: ReceiptModel): Promise<void> {
  const qr = await renderQrDataUrl(r.qrPayload);
  const html = buildReceiptHtml(r, qr);

  return new Promise<void>((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const cleanup = () => {
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 500);
    };

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      cleanup();
      resolve();
      return;
    }
    doc.open();
    doc.write(html);
    doc.close();

    const run = () => {
      try {
        const win = iframe.contentWindow!;
        win.focus();
        win.addEventListener('afterprint', () => {
          cleanup();
          resolve();
        });
        win.print();
        // Safety net: some browsers never fire afterprint.
        setTimeout(() => {
          cleanup();
          resolve();
        }, 3000);
      } catch {
        cleanup();
        resolve();
      }
    };

    // Wait for the QR image to load before printing.
    if (iframe.contentWindow) {
      const img = doc.querySelector('img.qr');
      if (img && !(img as HTMLImageElement).complete) {
        img.addEventListener('load', run, { once: true });
        img.addEventListener('error', run, { once: true });
        setTimeout(run, 1500);
      } else {
        setTimeout(run, 150);
      }
    } else {
      resolve();
    }
  });
}
