import { inflateRawSync } from 'node:zlib';

/**
 * Dependency-free spreadsheet parser for the POS_IMPXLS Excel/CSV import.
 *
 * Supports:
 *   - CSV (UTF-8, RFC 4180: quoted fields, escaped "", CRLF/LF, BOM).
 *   - XLSX (Office Open XML) — an XLSX is a ZIP of XML parts. We unzip using
 *     Node's built-in zlib (raw DEFLATE, method 8) with no third-party libs,
 *     then read the first worksheet + sharedStrings. This keeps the supply
 *     chain clean (no vulnerable SheetJS) while handling the format users
 *     actually export from Excel/LibreOffice.
 *
 * Returns a matrix of string cells (rows × columns). The import service maps
 * columns by header.
 */
export type SheetMatrix = string[][];

const BOM = '\uFEFF';

export function parseSpreadsheet(
  buffer: Buffer,
  fileName: string,
): SheetMatrix {
  const lower = (fileName ?? '').toLowerCase();
  // XLSX magic: ZIP local file header "PK\x03\x04".
  const isZip =
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    buffer[2] === 0x03 &&
    buffer[3] === 0x04;
  if (lower.endsWith('.xlsx') || isZip) {
    return parseXlsx(buffer);
  }
  return parseCsv(buffer.toString('utf8'));
}

//============================================================================
// CSV (RFC 4180)
//============================================================================
export function parseCsv(text: string): SheetMatrix {
  let src = text;
  if (src.startsWith(BOM)) src = src.slice(1);
  const rows: SheetMatrix = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c === '\r') {
      // swallow — the \n handles the row break
    } else {
      field += c;
    }
  }
  // trailing field/row (no final newline)
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // drop fully-empty rows
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

//============================================================================
// XLSX (minimal ZIP + Office Open XML reader)
//============================================================================
interface ZipEntry {
  name: string;
  data: Buffer;
}

/** Read all entries of a ZIP archive (stored=0 and deflate=8). */
function unzip(buffer: Buffer): Map<string, Buffer> {
  const entries = new Map<string, Buffer>();
  // Iterate local file headers (signature 0x04034b50).
  let off = 0;
  while (off + 4 <= buffer.length) {
    const sig = buffer.readUInt32LE(off);
    if (sig !== 0x04034b50) break; // reached central directory / end
    const method = buffer.readUInt16LE(off + 8);
    let compSize = buffer.readUInt32LE(off + 18);
    let uncompSize = buffer.readUInt32LE(off + 22);
    const nameLen = buffer.readUInt16LE(off + 26);
    const extraLen = buffer.readUInt16LE(off + 28);
    const flags = buffer.readUInt16LE(off + 6);
    const nameStart = off + 30;
    const name = buffer.toString('utf8', nameStart, nameStart + nameLen);
    const dataStart = nameStart + nameLen + extraLen;

    // Data-descriptor bit (flag 0x08): sizes are 0 in the header and follow
    // the data. We fall back to scanning to the next signature — but Excel
    // normally writes sizes in the header, so handle the common case first.
    if ((flags & 0x08) === 0 && compSize > 0) {
      const comp = buffer.subarray(dataStart, dataStart + compSize);
      const raw = method === 8 ? inflateRawSync(comp) : Buffer.from(comp);
      entries.set(name, raw);
      off = dataStart + compSize;
    } else {
      // Streamed entry: locate the data descriptor / next header by scanning.
      let scan = dataStart;
      while (scan + 4 <= buffer.length) {
        const s = buffer.readUInt32LE(scan);
        if (s === 0x08074b50) {
          // data descriptor: crc(4) compSize(4) uncompSize(4)
          compSize = buffer.readUInt32LE(scan + 8);
          uncompSize = buffer.readUInt32LE(scan + 12);
          break;
        }
        if (s === 0x04034b50 || s === 0x02014b50) break;
        scan++;
      }
      const comp = buffer.subarray(dataStart, dataStart + compSize);
      const raw =
        method === 8 && comp.length > 0
          ? inflateRawSync(comp)
          : Buffer.from(comp);
      entries.set(name, raw);
      off = dataStart + compSize + (uncompSize >= 0 ? 16 : 0);
    }
  }
  return entries;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h: string) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&amp;/g, '&');
}

/** sharedStrings.xml → ordered array of strings. */
function parseSharedStrings(xml: string): string[] {
  const out: string[] = [];
  // Each <si> may contain multiple <t> runs (rich text) — concatenate them.
  const siRe = /<si\b[^>]*>([\s\S]*?)<\/si>/g;
  let m: RegExpExecArray | null;
  while ((m = siRe.exec(xml)) !== null) {
    const inner = m[1];
    const tRe = /<t\b[^>]*>([\s\S]*?)<\/t>/g;
    let tm: RegExpExecArray | null;
    let val = '';
    while ((tm = tRe.exec(inner)) !== null) {
      val += decodeXmlEntities(tm[1]);
    }
    out.push(val);
  }
  return out;
}

/** Convert an A1 column reference (e.g. "AB") to a 0-based index. */
function colIndex(ref: string): number {
  const letters = ref.replace(/\d+$/, '');
  let n = 0;
  for (const ch of letters) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n - 1;
}

function parseSheet(xml: string, shared: string[]): SheetMatrix {
  const rows: SheetMatrix = [];
  const rowRe = /<row\b[^>]*>([\s\S]*?)<\/row>/g;
  let rm: RegExpExecArray | null;
  while ((rm = rowRe.exec(xml)) !== null) {
    const rowXml = rm[1];
    const cells: string[] = [];
    const cellRe = /<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/g;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(rowXml)) !== null) {
      const attrs = cm[1] ?? cm[3] ?? '';
      const body = cm[2] ?? '';
      const refMatch = /r="([A-Z]+\d+)"/.exec(attrs);
      const idx = refMatch ? colIndex(refMatch[1]) : cells.length;
      const typeMatch = /t="([^"]+)"/.exec(attrs);
      const type = typeMatch ? typeMatch[1] : 'n';
      let value = '';
      if (type === 's') {
        const vm = /<v>([\s\S]*?)<\/v>/.exec(body);
        if (vm) value = shared[Number(vm[1])] ?? '';
      } else if (type === 'inlineStr') {
        const tm = /<t\b[^>]*>([\s\S]*?)<\/t>/.exec(body);
        if (tm) value = decodeXmlEntities(tm[1]);
      } else {
        const vm = /<v>([\s\S]*?)<\/v>/.exec(body);
        if (vm) value = decodeXmlEntities(vm[1]);
      }
      while (cells.length < idx) cells.push('');
      cells[idx] = value;
    }
    rows.push(cells);
  }
  return rows.filter((r) => r.some((cell) => (cell ?? '').trim() !== ''));
}

export function parseXlsx(buffer: Buffer): SheetMatrix {
  const files = unzip(buffer);
  const sharedXml = files.get('xl/sharedStrings.xml');
  const shared = sharedXml
    ? parseSharedStrings(sharedXml.toString('utf8'))
    : [];
  // Pick the first worksheet part.
  let sheetBuf =
    files.get('xl/worksheets/sheet1.xml') ??
    [...files.entries()].find(([n]) =>
      /^xl\/worksheets\/sheet\d+\.xml$/.test(n),
    )?.[1];
  if (!sheetBuf) {
    throw new Error('No worksheet found in the XLSX file');
  }
  return parseSheet(sheetBuf.toString('utf8'), shared);
}
