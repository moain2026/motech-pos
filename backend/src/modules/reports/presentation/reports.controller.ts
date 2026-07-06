import {
  BadRequestException,
  Controller,
  Get,
  Header,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  ByShiftQuery,
  ComparisonQuery,
  CustomerStatementQuery,
  DateRangeQuery,
  ItemMovementQuery,
  LoyaltyReportQuery,
  PosReportQuery,
  ProfitQuery,
  SalesOrdersQuery,
  ShiftsHistoryQuery,
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
  @ApiOperation({
    summary:
      'Sales grouped by item category (ITEM_TYPES); optional ?machine= cut (POSR006)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async salesByCategory(@Query() q: ZReportQuery) {
    const data = await this.reports.salesByCategory({
      from: q.from,
      to: q.to,
      machineNo: q.machine,
    });
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

  @Get('cashier-payment-summary')
  @ApiOperation({
    summary:
      'Payment methods PER cashier (+ returns/refunds) — ملخص مبيعات الكاشيرات (POST012)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async cashierPaymentSummary(@Query() q: ByShiftQuery) {
    const data = await this.reports.cashierPaymentSummary({
      from: q.from,
      to: q.to,
      shiftId: q.shift,
      cashierNo: q.cashier,
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

  //==========================================================================
  // Wave F — POSR completions
  //==========================================================================

  @Get('by-shift')
  @ApiOperation({
    summary:
      'Sales per shift (shift-by-shift detail + over/short; POSR004)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async byShift(@Query() q: ByShiftQuery) {
    const data = await this.reports.byShift({
      from: q.from,
      to: q.to,
      shiftId: q.shift,
      cashierNo: q.cashier,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('shifts-history')
  @ApiOperation({
    summary:
      'Historical shifts list with reconciliation figures (POSR014)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async shiftsHistory(@Query() q: ShiftsHistoryQuery) {
    const data = await this.reports.shiftsHistory({
      from: q.from,
      to: q.to,
      status: q.status,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('customer-statement')
  @ApiOperation({
    summary:
      'Full statement of one cash customer: bills/returns/points/collections (POSR002)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async customerStatement(@Query() q: CustomerStatementQuery) {
    const data = await this.reports.customerStatement({
      from: q.from,
      to: q.to,
      customerCode: q.customer,
    });
    return { data, meta: { count: data.bills.length } };
  }

  @Get('receivables')
  @ApiOperation({
    summary: 'Credit receivables (ذمم آجلة) per customer (POSR008)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async receivables() {
    const data = await this.reports.receivables();
    return { data, meta: { count: data.length } };
  }

  @Get('vouchers-summary')
  @ApiOperation({
    summary:
      'Vouchers aggregated by machine × type × method × currency (POSR009/POSR016)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async vouchersSummary(@Query() q: PosReportQuery) {
    const data = await this.reports.vouchersSummary({
      from: q.from,
      to: q.to,
      shiftId: q.shift,
    });
    return { data, meta: { count: data.rows.length } };
  }

  @Get('loyalty')
  @ApiOperation({
    summary: 'Loyalty points report for a period (POSR010)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async loyalty(@Query() q: LoyaltyReportQuery) {
    const data = await this.reports.loyaltyReport({
      from: q.from,
      to: q.to,
      shiftId: q.shift,
      customerCode: q.customer,
    });
    return { data, meta: { count: data.byCustomer.length } };
  }

  @Get('returns-window')
  @ApiOperation({
    summary:
      'Returns vs the allowed return window PRD_BACK_HOUR (POSR011)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async returnsWindow(@Query() q: PosReportQuery) {
    const data = await this.reports.returnsWindow({
      from: q.from,
      to: q.to,
      shiftId: q.shift,
    });
    return { data, meta: { count: data.rows.length } };
  }

  @Get('sales-orders')
  @ApiOperation({
    summary: 'Sales orders from YSPOS23.SALES_ORDER (POSR015, read-only)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async salesOrders(@Query() q: SalesOrdersQuery) {
    const data = await this.reports.salesOrders({
      from: q.from,
      to: q.to,
      processed: q.processed == null ? undefined : q.processed === 'true',
      limit: q.limit ?? 100,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('customer-groups')
  @ApiOperation({
    summary:
      'Sales grouped by cash-customer group (IAS_CASH_CUSTMR_GRP; POSR012)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async customerGroups(@Query() q: DateRangeQuery) {
    const data = await this.reports.customerGroups({ from: q.from, to: q.to });
    return { data, meta: { count: data.length } };
  }

  /**
   * POSR003 substitute — CSV export of any flat (array-shaped) report.
   * Onyx's saveable user report templates (S_RPRT_USR_TMPLT) are replaced by
   * a spreadsheet-friendly export: same filters, same data, text/csv out.
   */
  @Get('export')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOperation({
    summary:
      'CSV export of a flat report (report=daily|monthly|by-item|…; POSR003 substitute)',
  })
  @ApiOkResponse({ description: 'text/csv body (UTF-8, comma-separated)' })
  async export(
    @Query('report') report: string,
    @Query() q: DateRangeQuery & { shift?: string },
  ): Promise<string> {
    const range = { from: q.from, to: q.to };
    const posRange = { ...range, shiftId: q.shift };
    const runners: Record<string, () => Promise<object[]>> = {
      daily: () => this.reports.daily(range),
      monthly: () => this.reports.monthly(range),
      'by-item': () => this.reports.byItem({ ...range, limit: 500 }),
      'by-machine': () => this.reports.byMachine(range),
      tax: () => this.reports.taxReport(range),
      'hourly-sales': () => this.reports.hourlySales(range),
      'top-customers': () => this.reports.topCustomers({ ...range, limit: 500 }),
      discount: () => this.reports.discountReport(range),
      'sales-by-category': () => this.reports.salesByCategory(range),
      'by-cashier': () => this.reports.byCashier(posRange),
      'payment-methods': () => this.reports.paymentMethods(posRange),
      returns: () => this.reports.returnsReport(posRange),
      'by-shift': () => this.reports.byShift(posRange),
      'shifts-history': () => this.reports.shiftsHistory(range),
      receivables: () => this.reports.receivables(),
      'customer-groups': () => this.reports.customerGroups(range),
      'sales-orders': () => this.reports.salesOrders({ ...range, limit: 500 }),
    };
    const run = runners[report];
    if (!run) {
      throw new BadRequestException(
        `Unknown report '${report}'. Valid: ${Object.keys(runners).join(', ')}`,
      );
    }
    const rows = await run();
    return toCsv(rows);
  }
}

/** Minimal CSV writer: header from first row's keys; RFC 4180 quoting. */
function toCsv(rowsIn: object[]): string {
  if (rowsIn.length === 0) return '';
  const rows = rowsIn as Record<string, unknown>[];
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown): string => {
    if (v == null) return '';
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(',')];
  for (const r of rows) {
    lines.push(cols.map((c) => esc(r[c])).join(','));
  }
  return lines.join('\r\n') + '\r\n';
}
