import { useEffect, useRef } from 'react';

/**
 * HID keyboard-wedge barcode scanner listener (STANDARDS/13 §4 — most common
 * scanner type). Scanners inject the barcode as very fast keystrokes ending in
 * Enter. We distinguish a scan from human typing by inter-keystroke timing:
 * characters arriving faster than `maxIntervalMs` accumulate into a buffer that
 * is flushed on Enter (or on a timeout) and reported via `onScan`.
 *
 * Listens globally at the document level, so it works regardless of focus
 * (kiosk POS). If the user is typing into a normal input at human speed, the
 * buffer never reaches the scan threshold and is discarded.
 */
export interface BarcodeScannerOptions {
  onScan: (code: string) => void;
  /** Max ms between keystrokes to count as machine input. Default 40ms. */
  maxIntervalMs?: number;
  /** Minimum length to accept as a barcode. Default 3. */
  minLength?: number;
  /** Disable while true (e.g. a modal owns input). */
  disabled?: boolean;
}

export function useBarcodeScanner({
  onScan,
  maxIntervalMs = 40,
  minLength = 3,
  disabled = false,
}: BarcodeScannerOptions): void {
  const buffer = useRef('');
  const lastTime = useRef(0);
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (disabled) return;

    const flush = () => {
      const code = buffer.current;
      buffer.current = '';
      if (code.length >= minLength) onScanRef.current(code);
    };

    const handler = (e: KeyboardEvent) => {
      // Ignore modifier combos.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const now = Date.now();
      const gap = now - lastTime.current;
      lastTime.current = now;

      // A long gap means a fresh (possibly human) sequence — reset first.
      if (gap > maxIntervalMs) buffer.current = '';

      if (e.key === 'Enter') {
        // Only treat as a scan if we accumulated fast input.
        if (buffer.current.length >= minLength) {
          e.preventDefault();
          flush();
        } else {
          buffer.current = '';
        }
        return;
      }

      // Only printable single chars belong in a barcode.
      if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };

    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [maxIntervalMs, minLength, disabled]);
}
