import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { CardsService } from '../application/cards.service';
import { CouponsQuery } from './cards.query';

/**
 * CardsController — READ-side over the ERP payment-card types (POSI007/POSI012)
 * and coupon documents. JWT-protected; RFC 9457 errors via the global filter.
 * Envelope shape { data, meta } mirrors the reports/bills endpoints.
 */
@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CardsController {
  constructor(private readonly cards: CardsService) {}

  @Get('cards')
  @ApiOperation({ summary: 'Payment-card types (CREDIT_CARD_TYPES)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async listCards() {
    const data = await this.cards.listCardTypes();
    return { data, meta: { count: data.length } };
  }

  @Get('coupons')
  @ApiOperation({ summary: 'Coupon document headers (IAS_CPN_MST)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async listCoupons(@Query() q: CouponsQuery) {
    const data = await this.cards.listCoupons(q.limit ?? 100);
    return { data, meta: { count: data.length } };
  }
}
