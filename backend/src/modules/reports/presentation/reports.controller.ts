import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { ReportsService } from '../application/reports.service';
import {
  AuditQuery,
  ByItemQuery,
  ComparisonQuery,
  DateRangeQuery,
  ItemMovementQuery,
  PosReportQuery,
  ProfitQuery,
  SlowMovingQuery,
  TopCustomersQuery,
  ZReportQuery,
} from './reports.query';

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

  @Get('tax')
  @ApiOperation({ summary: 'VAT/tax report by day (taxable base + VAT collected)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async tax(@Query() q: DateRangeQuery) {
    const data = await this.reports.taxReport({ from: q.from, to: q.to });
    return { data, meta: { count: data.length } };
  }

  @Get('hourly-sales')
  @ApiOperation({ summary: 'Hourly sales distribution (00..23) from BILL_TIME' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async hourlySales(@Query() q: DateRangeQuery) {
    const data = await this.reports.hourlySales({ from: q.from, to: q.to });
    return { data, meta: { count: data.length } };
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Top customers by total sales (bill header key)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async topCustomers(@Query() q: TopCustomersQuery) {
    const data = await this.reports.topCustomers({
      from: q.from,
      to: q.to,
      limit: q.limit ?? 20,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('discount')
  @ApiOperation({ summary: 'Discount report by day (header discount vs gross)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async discount(@Query() q: DateRangeQuery) {
    const data = await this.reports.discountReport({ from: q.from, to: q.to });
    return { data, meta: { count: data.length } };
  }

  @Get('sales-by-category')
  @ApiOperation({ summary: 'Sales grouped by item category (ITEM_TYPES)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async salesByCategory(@Query() q: DateRangeQuery) {
    const data = await this.reports.salesByCategory({ from: q.from, to: q.to });
    return { data, meta: { count: data.length } };
  }

  @Get('z-report')
  @ApiOperation({
    summary: 'Z-report: full end-of-shift/day close (single summary object)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async zReport(@Query() q: ZReportQuery) {
    const data = await this.reports.zReport({
      from: q.from,
      to: q.to,
      machineNo: q.machine,
    });
    return { data, meta: { count: 1 } };
  }

  //==========================================================================
  // Historical / advanced YSPOS23 reports
  //==========================================================================

  @Get('slow-moving')
  @ApiOperation({
    summary: 'Slow-moving items: least/zero-sold items in the period',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async slowMoving(@Query() q: SlowMovingQuery) {
    const data = await this.reports.slowMoving({
      from: q.from,
      to: q.to,
      limit: q.limit ?? 50,
      maxQty: q.maxQty ?? 5,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('profit')
  @ApiOperation({
    summary: 'Profit per item: revenue vs PRIMARY_COST (item master)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async profit(@Query() q: ProfitQuery) {
    const data = await this.reports.profitReport({
      from: q.from,
      to: q.to,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('comparison')
  @ApiOperation({
    summary: 'Two-period sales comparison (A vs B) with absolute + % deltas',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async comparison(@Query() q: ComparisonQuery) {
    const data = await this.reports.comparison({
      fromA: q.fromA,
      toA: q.toA,
      fromB: q.fromB,
      toB: q.toB,
    });
    return { data, meta: { count: 1 } };
  }

  @Get('item-movement')
  @ApiOperation({
    summary: 'Full movement history of one item (sales + returns) in a period',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async itemMovement(@Query() q: ItemMovementQuery) {
    const data = await this.reports.itemMovement({
      from: q.from,
      to: q.to,
      iCode: q.item,
      limit: q.limit ?? 200,
    });
    return { data, meta: { count: data.movements.length } };
  }

  @Get('audit')
  @ApiOperation({
    summary:
      'Deleted-lines audit trail (IAS_POS_AUD_ITEM; POSR005 domain)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async audit(@Query() q: AuditQuery) {
    const data = await this.reports.auditReport({
      from: q.from,
      to: q.to,
      limit: q.limit ?? 100,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('vat-detailed')
  @ApiOperation({
    summary: 'Detailed VAT report grouped by effective rate x item category',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async vatDetailed(@Query() q: DateRangeQuery) {
    const data = await this.reports.vatDetailed({ from: q.from, to: q.to });
    return { data, meta: { count: data.length } };
  }

  //==========================================================================
  // MOTECH_POS reports (our own recorded sales)
  //==========================================================================

  @Get('by-cashier')
  @ApiOperation({
    summary: 'Sales per cashier (MOTECH_POS bills+payments; POST012)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async byCashier(@Query() q: PosReportQuery) {
    const data = await this.reports.byCashier({
      from: q.from,
      to: q.to,
      shiftId: q.shift,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('payment-methods')
  @ApiOperation({
    summary: 'Payment-method distribution (MOTECH_POS payments)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async paymentMethods(@Query() q: PosReportQuery) {
    const data = await this.reports.paymentMethods({
      from: q.from,
      to: q.to,
      shiftId: q.shift,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('returns')
  @ApiOperation({ summary: 'Returns aggregation by day (MOTECH_POS returns)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async returns(@Query() q: PosReportQuery) {
    const data = await this.reports.returnsReport({
      from: q.from,
      to: q.to,
      shiftId: q.shift,
    });
    return { data, meta: { count: data.length } };
  }
}
