import { describe, expect, it } from 'vitest';
import {
  parseCsv,
  parseSpreadsheet,
} from '../../src/modules/catalog/domain/spreadsheet-parser';
import * as zlib from 'node:zlib';

describe('parseCsv', () => {
  it('parses a simple CSV with a header + rows', () => {
    const m = parseCsv('code,name,price\nA1,Foo,10\nA2,Bar,20\n');
    expect(m).toEqual([
      ['code', 'name', 'price'],
      ['A1', 'Foo', '10'],
      ['A2', 'Bar', '20'],
    ]);
  });

  it('handles quoted fields with commas and escaped quotes', () => {
    const m = parseCsv('code,name\nA1,"Foo, Inc."\nA2,"He said ""hi"""\n');
    expect(m[1]).toEqual(['A1', 'Foo, Inc.']);
    expect(m[2]).toEqual(['A2', 'He said "hi"']);
  });

  it('handles CRLF line endings and a BOM', () => {
    const m = parseCsv('\uFEFFcode,name\r\nA1,Foo\r\n');
    expect(m[0]).toEqual(['code', 'name']);
    expect(m[1]).toEqual(['A1', 'Foo']);
  });

  it('preserves Arabic text', () => {
    const m = parseCsv('code,name\nA1,صنف\n');
    expect(m[1][1]).toBe('صنف');
  });

  it('drops fully-empty rows', () => {
    const m = parseCsv('code\nA1\n\n\nA2\n');
    expect(m).toEqual([['code'], ['A1'], ['A2']]);
  });

  it('keeps the last row without a trailing newline', () => {
    const m = parseCsv('code,name\nA1,Foo');
    expect(m[1]).toEqual(['A1', 'Foo']);
  });
});

/** Build a minimal valid XLSX in-memory for the parser test. */
function makeXlsx(): Buffer {
  const parts: Record<string, string> = {
    'xl/sharedStrings.xml':
      '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
      '<si><t>code</t></si><si><t>name</t></si><si><t>صنف اكسل</t></si></sst>',
    'xl/worksheets/sheet1.xml':
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
      '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' +
      '<row r="2"><c r="A2" t="s"><v>2</v></c><c r="B2"><v>250</v></c></row>' +
      '</sheetData></worksheet>',
  };
  // Assemble a ZIP (deflate) manually with local headers only (our reader
  // walks local headers). Reuse zlib.deflateRawSync.
  const chunks: Buffer[] = [];
  for (const [name, xml] of Object.entries(parts)) {
    const data = Buffer.from(xml, 'utf8');
    const comp = zlib.deflateRawSync(data);
    const nameBuf = Buffer.from(name, 'utf8');
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4); // version
    header.writeUInt16LE(0, 6); // flags
    header.writeUInt16LE(8, 8); // method = deflate
    header.writeUInt16LE(0, 10); // time
    header.writeUInt16LE(0, 12); // date
    header.writeUInt32LE(0, 14); // crc (unused by our reader)
    header.writeUInt32LE(comp.length, 18);
    header.writeUInt32LE(data.length, 22);
    header.writeUInt16LE(nameBuf.length, 26);
    header.writeUInt16LE(0, 28);
    chunks.push(header, nameBuf, comp);
  }
  return Buffer.concat(chunks);
}

describe('parseSpreadsheet (XLSX)', () => {
  it('parses a minimal XLSX with shared strings + numbers + Arabic', () => {
    const buf = makeXlsx();
    const m = parseSpreadsheet(buf, 'items.xlsx');
    expect(m[0]).toEqual(['code', 'name']);
    expect(m[1][0]).toBe('صنف اكسل');
    expect(m[1][1]).toBe('250');
  });

  it('routes CSV content by extension', () => {
    const m = parseSpreadsheet(Buffer.from('a,b\n1,2\n', 'utf8'), 'x.csv');
    expect(m[1]).toEqual(['1', '2']);
  });
});
