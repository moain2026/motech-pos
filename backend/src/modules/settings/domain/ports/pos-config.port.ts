export const POS_CONFIG_REPOSITORY = Symbol('POS_CONFIG_REPOSITORY');

//============================================================================
// POSI004 — keyboard shortcuts
//============================================================================
export interface ShortcutRow {
  id: string;
  action: string;
  keyCombo: string;
  arLabel: string | null;
  sortOrder: number;
  enabled: boolean;
}

export interface UpsertShortcut {
  action: string;
  keyCombo: string;
  arLabel?: string | null;
  sortOrder?: number | null;
  enabled?: boolean;
}

//============================================================================
// POSI005/006 — scale barcode definitions
//============================================================================
export type ScaleMode = 'WEIGHT' | 'PRICE';

export interface ScaleDefinitionRow {
  id: string;
  name: string;
  prefix: string;
  barcodeLength: number;
  itemCodeStart: number;
  itemCodeLen: number;
  /** null → the value slot runs to the end of the barcode. */
  valueLen: number | null;
  divisor: number;
  mode: ScaleMode;
  enabled: boolean;
  sortOrder: number;
}

export interface UpsertScaleDefinition {
  name: string;
  prefix: string;
  barcodeLength: number;
  itemCodeStart?: number | null;
  itemCodeLen: number;
  valueLen?: number | null;
  divisor: number;
  mode: ScaleMode;
  enabled?: boolean;
  sortOrder?: number | null;
}

/**
 * PosConfigRepository — MOTECH_POS-owned config for keyboard shortcuts
 * (POS_SHORTCUTS) and scale barcode schemes (SCALE_DEFINITIONS). Writes stay
 * in our own schema; the live ERP is never touched. (V029)
 */
export interface PosConfigRepository {
  // Shortcuts
  listShortcuts(): Promise<ShortcutRow[]>;
  upsertShortcut(input: UpsertShortcut): Promise<ShortcutRow>;
  deleteShortcut(action: string): Promise<boolean>;

  // Scale definitions
  listScales(): Promise<ScaleDefinitionRow[]>;
  findScale(id: string): Promise<ScaleDefinitionRow | null>;
  createScale(input: UpsertScaleDefinition): Promise<ScaleDefinitionRow>;
  updateScale(
    id: string,
    input: UpsertScaleDefinition,
  ): Promise<ScaleDefinitionRow | null>;
  deleteScale(id: string): Promise<boolean>;
}
