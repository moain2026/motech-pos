import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { LoyaltyService } from '../application/loyalty.service';

class LedgerQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}

/**
 * LoyaltyController — earned-points balance + movement history sourced from
 * MOTECH_POS (POINTS_LEDGER), i.e. points actually earned by OUR sales.
 */
@ApiTags('loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get('customers/:code/points')
  @ApiOperation({ summary: 'Earned loyalty balance + ledger for a customer (MOTECH_POS)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async points(@Param('code') code: string, @Query() q: LedgerQuery) {
    const [balance, ledger] = await Promise.all([
      this.loyalty.earnedBalance(code),
      this.loyalty.ledger(code, q.limit ?? 100),
    ]);
    return { data: { balance, ledger }, meta: { count: ledger.length } };
  }

  @Get('customers/:code/ledger')
  @ApiOperation({
    summary:
      'Full points movement history with running balance per row (POST021)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async ledger(@Param('code') code: string, @Query() q: LedgerQuery) {
    const view = await this.loyalty.customerLedger(code, q.limit ?? 100);
    return {
      data: view,
      meta: { count: view.entries.length },
    };
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Chain-wide loyalty totals: granted vs redeemed points (POST021)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async summary() {
    const data = await this.loyalty.summary();
    return { data, meta: {} };
  }
}
