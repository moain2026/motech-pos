import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import {
  CreateLocalPromotionInput,
  PromotionsRepository,
  PROMOTIONS_REPOSITORY,
  PromotionMaster,
} from '../domain/ports/promotions-repository.port';
import {
  EngineCartLine,
  PromotionResult,
  PromotionsEngine,
} from '../domain/promotions-engine';

export interface ApplyPromotionsInput {
  lines: EngineCartLine[];
  /** Evaluation date (defaults to now). */
  onDate?: Date;
}

/**
 * PromotionsService — POST001 promotion engine (GNR_QTN_PRM_PKG analogue).
 * Loads the active POS promotions from the ERP (read-only) and evaluates them
 * against a server-priced cart, returning the discounts + free items to apply.
 */
@Injectable()
export class PromotionsService {
  private readonly engine = new PromotionsEngine();

  constructor(
    @Inject(PROMOTIONS_REPOSITORY)
    private readonly repo: PromotionsRepository,
  ) {}

  /** List the promotions currently active for the POS (display / debug). */
  async listActive(onDate = new Date()): Promise<PromotionMaster[]> {
    return this.repo.activePromotions(onDate);
  }

  /** Evaluate active promotions against a cart. Pure result (no writes). */
  async apply(input: ApplyPromotionsInput): Promise<PromotionResult> {
    const onDate = input.onDate ?? new Date();
    const promos = await this.repo.activePromotions(onDate);
    const lines = (input.lines ?? []).filter(
      (l) => l && l.qty > 0 && l.unitPrice >= 0,
    );
    const billGross = lines.reduce((a, l) => a + l.unitPrice * l.qty, 0);
    if (promos.length === 0 || lines.length === 0) {
      return {
        lineDiscounts: [],
        freeItems: [],
        totalDiscount: 0,
        appliedPromoNos: [],
      };
    }
    return this.engine.evaluate(promos, lines, round2(billGross));
  }

  // ----- LOCAL overlay CRUD (POST001 promotions management) -----

  listLocal() {
    return this.repo.listLocal();
  }

  createLocal(input: CreateLocalPromotionInput) {
    return this.repo.createLocal(input);
  }

  async setLocalStatus(quotNo: number, inactive: boolean) {
    const row = await this.repo.setLocalStatus(quotNo, inactive);
    if (!row) throw new NotFoundException(`Local promotion ${quotNo} not found`);
    return row;
  }

  async deleteLocal(quotNo: number) {
    const ok = await this.repo.deleteLocal(quotNo);
    if (!ok) throw new NotFoundException(`Local promotion ${quotNo} not found`);
  }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
