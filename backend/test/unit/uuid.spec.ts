import { describe, expect, it } from 'vitest';
import { isUuid, uuidv7 } from '../../src/shared/domain/uuid';

describe('uuidv7', () => {
  it('produces a canonical v7 UUID', () => {
    const u = uuidv7();
    expect(isUuid(u)).toBe(true);
    // version nibble == 7
    expect(u[14]).toBe('7');
    // variant nibble in {8,9,a,b}
    expect(['8', '9', 'a', 'b']).toContain(u[19].toLowerCase());
  });

  it('is time-ordered (later timestamp sorts after earlier)', () => {
    const a = uuidv7(1_000_000_000_000);
    const b = uuidv7(2_000_000_000_000);
    expect(a < b).toBe(true);
  });

  it('is unique across many calls', () => {
    const set = new Set<string>();
    for (let i = 0; i < 5000; i++) set.add(uuidv7());
    expect(set.size).toBe(5000);
  });

  it('rejects non-uuid strings', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid('')).toBe(false);
  });
});
