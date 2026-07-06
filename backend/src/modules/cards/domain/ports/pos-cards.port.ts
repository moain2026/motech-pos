/** DI token for the POS card types overlay repository (POSI012). */
export const POS_CARDS_REPOSITORY = Symbol('POS_CARDS_REPOSITORY');

/**
 * A POS card type (POSI012 — بطاقات الشبكة/الخصم). The real ERP table
 * IAS_POS_CARD does NOT exist in this environment; the card master is
 * IAS202623.CREDIT_CARD_TYPES (SACRED read-only). So reads MERGE the ERP
 * master with the MOTECH_POS.CARD_TYPES_OVERLAY (overlay wins), tagging each
 * row with its origin.
 */
export interface PosCardRow {
  cardNo: number; // CR_CARD_NO
  arName: string | null; // CR_CARD_NAME
  enName: string | null; // CR_CARD_E_NAME
  cardType: number | null; // CR_CARD_TYPE (network kind)
  bankNo: number | null; // BANK_NO
  commissionPct: number | null; // COMM_PER
  commCalcType: number | null; // COMM_CALC_TYPE
  duePeriod: number | null; // DUE_PERIOD (settlement days)
  bankAc: string | null; // BANK_AC
  inactive: boolean;
  /** ERP = live master only; LOCAL = created here; EDIT = ERP row overridden. */
  origin: 'ERP' | 'LOCAL' | 'EDIT';
}

/** Fields the API may write for a POS card (create/edit). */
export interface UpsertPosCardInput {
  /** Business key; when omitted on create a LOCAL number is allocated. */
  cardNo?: number;
  arName: string;
  enName?: string | null;
  cardType?: number | null;
  bankNo?: number | null;
  commissionPct?: number | null;
  commCalcType?: number | null;
  duePeriod?: number | null;
  bankAc?: string | null;
  inactive?: boolean;
}

export interface PosCardsRepository {
  /** All card types (ERP master merged with overlay; overlay wins). */
  listMerged(): Promise<PosCardRow[]>;

  /** One merged card by number, or null. */
  findMerged(cardNo: number): Promise<PosCardRow | null>;

  /** Does an ERP master card with this number exist? */
  erpCardExists(cardNo: number): Promise<boolean>;

  /** Does an overlay row with this number exist? */
  overlayExists(cardNo: number): Promise<boolean>;

  /** Allocate the next LOCAL card number (SEQ_LOCAL_CARD_NO). */
  nextLocalCardNo(): Promise<number>;

  /** Insert an overlay row (origin LOCAL or EDIT). */
  insertOverlay(
    cardNo: number,
    origin: 'LOCAL' | 'EDIT',
    input: UpsertPosCardInput,
  ): Promise<void>;

  /** Update an existing overlay row (returns false if none). */
  updateOverlay(cardNo: number, input: UpsertPosCardInput): Promise<boolean>;
}
