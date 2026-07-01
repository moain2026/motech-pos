import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { ReportsService } from '../application/reports.service';
import { ByItemQuery, DateRangeQuery } from './reports.query';

/**
 * ReportsController — READ-side analytics over the live YSPOS23 POS tables.
 * All routes are JWT-protected; errors surface as RFC 9457 ProblemDetails via
 * the global exception filter. Envelope shape { data, meta } mirrors bills.
 */
@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('daily')
  @ApiOperation({ summary: 'Daily sales aggregation (count / amount / vat / disc)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async daily(@Query() q: DateRangeQuery) {
    const data = await this.reports.daily({ from: q.from, to: q.to });
    return { data, meta: { count: data.length } };
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Monthly sales aggregation (count / amount / vat / disc)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async monthly(@Query() q: DateRangeQuery) {
    const data = await this.reports.monthly({ from: q.from, to: q.to });
    return { data, meta: { count: data.length } };
  }

  @Get('by-item')
  @ApiOperation({ summary: 'Best-selling items (Arabic name, qty desc)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async byItem(@Query() q: ByItemQuery) {
    const data = await this.reports.byItem({
      from: q.from,
      to: q.to,
      limit: q.limit ?? 20,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('by-machine')
  @ApiOperation({ summary: 'Sales per cashier machine (MACHINE_NO)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async byMachine(@Query() q: DateRangeQuery) {
    const data = await this.reports.byMachine({ from: q.from, to: q.to });
    return { data, meta: { count: data.length } };
  }
}
