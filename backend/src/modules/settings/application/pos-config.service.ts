import { Inject, Injectable } from '@nestjs/common';
import {
  InvalidOverlayError,
  OverlayNotFoundError,
} from '../../../shared/errors/domain-error';
import {
  PosConfigRepository,
  POS_CONFIG_REPOSITORY,
  ScaleDefinitionRow,
  ShortcutRow,
  UpsertScaleDefinition,
  UpsertShortcut,
} from '../domain/ports/pos-config.port';
import { decodeScaleBarcode } from '../domain/scale-barcode';

/**
 * PosConfigService — POSI004 keyboard shortcuts + POSI005/006 scale barcode
 * schemes. Orchestrates the MOTECH_POS-owned config (no SQL here) and exposes
 * a pure decode helper the sale flow can use.
 */
@Injectable()
export class PosConfigService {
  /** Whitelisted POS actions a shortcut may bind to (matches PosPage). */
  static readonly KNOWN_ACTIONS = [
    'focusSearch',
    'pay',
    'hold',
    'heldList',
    'clearCart',
    'customer',
    'help',
  ] as const;

  constructor(
    @Inject(POS_CONFIG_REPOSITORY)
    private readonly repo: PosConfigRepository,
  ) {}

  //==========================================================================
  // Shortcuts
  //==========================================================================
  listShortcuts(): Promise<ShortcutRow[]> {
    return this.repo.listShortcuts();
  }

  async upsertShortcut(input: UpsertShortcut): Promise<ShortcutRow> {
    const action = (input.action ?? '').trim();
    if (!action) {
      throw new InvalidOverlayError('Shortcut action is required', {});
    }
    if (
      !(PosConfigService.KNOWN_ACTIONS as readonly string[]).includes(action)
    ) {
      throw new InvalidOverlayError(
        `Unknown shortcut action '${action}'`,
        { action, allowed: PosConfigService.KNOWN_ACTIONS },
      );
    }
    const keyCombo = (input.keyCombo ?? '').trim();
    if (!keyCombo) {
      throw new InvalidOverlayError('Shortcut key combination is required', {
        action,
      });
    }
    return this.repo.upsertShortcut({ ...input, action, keyCombo });
  }

  async deleteShortcut(action: string): Promise<void> {
    const ok = await this.repo.deleteShortcut(action);
    if (!ok) {
      throw new OverlayNotFoundError(`Shortcut '${action}' not found`, {
        action,
      });
    }
  }

  //==========================================================================
  // Scale definitions
  //==========================================================================
  listScales(): Promise<ScaleDefinitionRow[]> {
    return this.repo.listScales();
  }

  private validateScale(input: UpsertScaleDefinition): void {
    if (!input.name || !input.name.trim()) {
      throw new InvalidOverlayError('Scale name is required', {});
    }
    if (!input.prefix || !/^\d+$/.test(input.prefix)) {
      throw new InvalidOverlayError('Prefix must be numeric', {
        prefix: input.prefix,
      });
    }
    if (input.mode !== 'WEIGHT' && input.mode !== 'PRICE') {
      throw new InvalidOverlayError("Mode must be 'WEIGHT' or 'PRICE'", {
        mode: input.mode,
      });
    }
    const bl = input.barcodeLength;
    const il = input.itemCodeLen;
    const is = input.itemCodeStart ?? 2;
    const vl = input.valueLen ?? null;
    if (!Number.isInteger(bl) || bl <= 0) {
      throw new InvalidOverlayError('Barcode length must be a positive integer', {
        barcodeLength: bl,
      });
    }
    if (!Number.isInteger(il) || il <= 0) {
      throw new InvalidOverlayError('Item-code length must be a positive integer', {
        itemCodeLen: il,
      });
    }
    if (!Number.isInteger(is) || is < 0) {
      throw new InvalidOverlayError('Item-code start must be >= 0', {
        itemCodeStart: is,
      });
    }
    if (!Number.isFinite(input.divisor) || input.divisor <= 0) {
      throw new InvalidOverlayError('Divisor must be a positive number', {
        divisor: input.divisor,
      });
    }
    // Geometry sanity: prefix + item slot + value slot must fit the barcode.
    if (is + il > bl) {
      throw new InvalidOverlayError(
        'Item-code slot exceeds the barcode length',
        { itemCodeStart: is, itemCodeLen: il, barcodeLength: bl },
      );
    }
    if (vl != null && (!Number.isInteger(vl) || vl <= 0 || is + il + vl > bl)) {
      throw new InvalidOverlayError(
        'Value slot exceeds the barcode length',
        { itemCodeStart: is, itemCodeLen: il, valueLen: vl, barcodeLength: bl },
      );
    }
    if (input.prefix.length > is + il) {
      // The prefix must sit before (or overlap the start of) the item slot.
      if (input.prefix.length > is) {
        throw new InvalidOverlayError(
          'Prefix overlaps the item-code slot',
          { prefix: input.prefix, itemCodeStart: is },
        );
      }
    }
  }

  async createScale(input: UpsertScaleDefinition): Promise<ScaleDefinitionRow> {
    this.validateScale(input);
    return this.repo.createScale(input);
  }

  async updateScale(
    id: string,
    input: UpsertScaleDefinition,
  ): Promise<ScaleDefinitionRow> {
    this.validateScale(input);
    const row = await this.repo.updateScale(id, input);
    if (!row) {
      throw new OverlayNotFoundError(`Scale definition '${id}' not found`, {
        id,
      });
    }
    return row;
  }

  async deleteScale(id: string): Promise<void> {
    const ok = await this.repo.deleteScale(id);
    if (!ok) {
      throw new OverlayNotFoundError(`Scale definition '${id}' not found`, {
        id,
      });
    }
  }

  /**
   * Decode a scanned barcode against the enabled scale schemes. Returns null
   * when it is not a scale barcode (caller falls back to normal lookup).
   */
  async decode(barcode: string) {
    const defs = await this.repo.listScales();
    return decodeScaleBarcode(barcode, defs);
  }
}
