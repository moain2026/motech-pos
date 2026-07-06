/**
 * Barcode label rendering (STANDARDS/13 §4) — generate/display barcodes for
 * items via JsBarcode. Renders into an SVG or returns a PNG data-URL for
 * labels. Auto-picks EAN-13 when the value is 13 numeric digits, else Code-128.
 */
export type BarcodeFormat = 'CODE128' | 'EAN13' | 'auto';

// `jsbarcode` is imported dynamically so it ships in its own lazy chunk —
// it is only needed when a barcode is actually rendered (labels/dialogs),
// never on the critical POS path.
type JsBarcodeFn = (
  el: SVGSVGElement | HTMLCanvasElement,
  value: string,
  opts: Record<string, unknown>,
) => void;
async function loadJsBarcode(): Promise<JsBarcodeFn> {
  const mod = await import('jsbarcode');
  return mod.default as unknown as JsBarcodeFn;
}

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
export async function renderBarcodeSvg(
  svg: SVGSVGElement,
  value: string,
  opts: BarcodeOptions = {},
): Promise<boolean> {
  try {
    const JsBarcode = await loadJsBarcode();
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
export async function barcodeDataUrl(
  value: string,
  opts: BarcodeOptions = {},
): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    const JsBarcode = await loadJsBarcode();
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
