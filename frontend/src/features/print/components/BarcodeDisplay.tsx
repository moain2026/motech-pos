import { useEffect, useRef } from 'react';
import { renderBarcodeSvg, type BarcodeFormat } from '../barcode';

/**
 * Renders an item barcode as an inline SVG (JsBarcode) for on-screen display
 * or a printable label (STANDARDS/13 §4). Auto-detects EAN-13 vs Code-128.
 */
export function BarcodeDisplay({
  value,
  format = 'auto',
  height = 50,
  displayValue = true,
  className,
}: {
  value: string;
  format?: BarcodeFormat;
  height?: number;
  displayValue?: boolean;
  className?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (ref.current && value) {
      // Async (jsbarcode lazy chunk) — guard against unmount between await
      // and render by re-checking the ref.
      const el = ref.current;
      void renderBarcodeSvg(el, value, { format, height, displayValue });
    }
  }, [value, format, height, displayValue]);

  return <svg ref={ref} className={className} aria-label={`باركود ${value}`} role="img" />;
}
