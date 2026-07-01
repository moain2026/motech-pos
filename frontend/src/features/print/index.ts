/**
 * POS hardware / print feature (STANDARDS/13 §3–§5).
 * Public surface: receipt building, browser + ESC/POS printing, barcode
 * rendering, and the print button component.
 */
export { buildReceipt, type ReceiptModel } from './receipt-model';
export { printReceipt, buildReceiptHtml, renderQrDataUrl } from './receipt-print';
export { encodeReceiptEscPos, toHex } from './escpos-encoder';
export { isWebUsbSupported, sendEscPosOverWebUsb } from './webusb-printer';
export { renderBarcodeSvg, barcodeDataUrl, type BarcodeFormat } from './barcode';
export { lookupBarcode, cacheItems } from './api/barcode-lookup.api';
export { PrintReceiptButton } from './components/PrintReceiptButton';
export { BarcodeDisplay } from './components/BarcodeDisplay';
