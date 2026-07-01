/**
 * Barcode label rendering (STANDARDS/13 §4) — generate/display barcodes for
 * items via JsBarcode. Renders into an SVG or returns a PNG data-URL for
 * labels. Auto-picks EAN-13 when the value is 13 numeric digits, else Code-128.
 */
import JsBarcode from 'jsbarcode';

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'auto';

function resolveFormat(value: string, fmt: BarcodeFormat): 'CODE128' | 'EAN13' {
  if (fmt !== 'auto') return fmt;
  return /^\d{13}$/.test(value) ? 'EAN13' : 'CODE128';
}

export interface BarcodeOptions {
  format?: BarcodeFormat;
  displayValue?: boolean;
  height?: number;
  width?: number;
  margin?: number;
}

/** Render a barcode into an existing SVG element (for on-screen display). */
export function renderBarcodeSvg(
  svg: SVGSVGElement,
  value: string,
  opts: BarcodeOptions = {},
): boolean {
  try {
    JsBarcode(svg, value, {
      format: resolveFormat(value, opts.format ?? 'auto'),
      displayValue: opts.displayValue ?? true,
      height: opts.height ?? 50,
      width: opts.width ?? 2,
      margin: opts.margin ?? 6,
      fontOptions: 'bold',
    });
    return true;
  } catch {
    return false;
  }
}

/** Render a barcode to a PNG data-URL (for print labels / img src). */
export function barcodeDataUrl(value: string, opts: BarcodeOptions = {}): string | null {
  try {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, value, {
      format: resolveFormat(value, opts.format ?? 'auto'),
      displayValue: opts.displayValue ?? true,
      height: opts.height ?? 60,
      width: opts.width ?? 2,
      margin: opts.margin ?? 8,
    });
    return canvas.toDataURL('image/png');
  } catch {
    return null;
  }
}
