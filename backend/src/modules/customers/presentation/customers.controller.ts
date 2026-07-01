import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { CustomersService } from '../application/customers.service';
import { CustomerSearchQuery, PointsQuery } from './customers.query';

/**
 * CustomersController — READ-side lookups over the IAS202623 ERP master
 * customer tables (Arabic names + loyalty points). All routes are
 * JWT-protected; errors surface as RFC 9457 ProblemDetails via the global
 * exception filter. Envelope shape { data, meta } mirrors reports/bills.
 */
@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @ApiOperation({ summary: 'Search customers by Arabic/English name, code or mobile' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async search(@Query() q: CustomerSearchQuery) {
    const data = await this.customers.search({
      search: q.search,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Single customer by C_CODE' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async byCode(@Param('code') code: string) {
    const data = await this.customers.findByCode(code);
    return { data, meta: {} };
  }

  @Get(':code/points')
  @ApiOperation({ summary: 'Loyalty-points balance + movements (IAS_POINT_CALC_TRNS)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async points(@Param('code') code: string, @Query() q: PointsQuery) {
    const { balance, txns, earned } = await this.customers.points(
      code,
      q.limit ?? 100,
    );
    return { data: { balance, txns, earned }, meta: { count: txns.length } };
  }
}
