import { Inject, Injectable } from '@nestjs/common';
import {
  CardsRepository,
  CARDS_REPOSITORY,
} from '../domain/ports/cards-repository.port';

/**
 * CardsService (application layer) — orchestrates read access to payment-card
 * types and coupon documents. No SQL here; depends on the CardsRepository port.
 */
@Injectable()
export class CardsService {
  constructor(
    @Inject(CARDS_REPOSITORY) private readonly repo: CardsRepository,
  ) {}

  /** Configured payment-card types. */
  listCardTypes() {
    return this.repo.listCardTypes();
  }

  /** Coupon document headers (empty array when none). */
  listCoupons(limit: number) {
    return this.repo.listCoupons(limit);
  }

  /** Resolve a coupon number against IAS_CPN_MST (null when unknown). */
  findCoupon(couponNo: string) {
    return this.repo.findCoupon(couponNo);
  }
}
