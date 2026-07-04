/** DI token for the keypads repository (MOTECH_POS authoritative). */
export const KEYPADS_REPOSITORY = Symbol('KEYPADS_REPOSITORY');

/** One extra touch keypad (POSI002 — لوحة المفاتيح الإضافية). */
export interface KeypadRow {
  id: string;
  keypadNo: number;
  arName: string | null;
  enName: string | null;
  inactive: boolean;
  keyCount: number;
}

/** One item key on a keypad (POSI003 — أصناف لوحة المفاتيح). */
export interface KeypadKeyRow {
  id: string;
  keypadNo: number;
  grpNo: number;
  grpName: string | null;
  itemCode: string;
  itemName: string | null; // resolved from the item master at read time
  price: number | null; // resolved price-list price (LEV 1)
  posNo: number | null;
  color: string | null;
  label: string | null;
}

export interface UpsertKeypadInput {
  keypadNo: number;
  arName?: string | null;
  enName?: string | null;
  inactive?: boolean | null;
}

export interface AddKeypadKeyInput {
  keypadNo: number;
  grpNo?: number;
  grpName?: string | null;
  itemCode: string;
  posNo?: number | null;
  color?: string | null;
  label?: string | null;
}

export interface KeypadsRepository {
  list(): Promise<KeypadRow[]>;
  find(keypadNo: number): Promise<KeypadRow | null>;
  upsert(input: UpsertKeypadInput): Promise<KeypadRow>;
  nextKeypadNo(): Promise<number>;
  listKeys(keypadNo: number): Promise<KeypadKeyRow[]>;
  addKey(input: AddKeypadKeyInput): Promise<KeypadKeyRow>;
  removeKey(id: string): Promise<boolean>;
}
