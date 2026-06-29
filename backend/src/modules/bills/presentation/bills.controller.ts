import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillsService } from '../application/bills.service';
import { DailySummaryQuery, ListBillsQuery } from './list-bills.query';

@ApiTags('bills')
@Controller('bills')
export class BillsController {
  constructor(private readonly bills: BillsService) {}

  @Get()
  @ApiOperation({ summary: 'List bills (newest first, cursor paginated)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListBillsQuery) {
    const { items, nextCursor } = await this.bills.list({
      from: q.from,
      to: q.to,
      machineNo: q.machineNo,
      cursor: q.cursor,
      limit: q.limit ?? 50,
    });
    return { data: items, meta: { count: items.length, nextCursor: nextCursor ?? null } };
  }

  @Get('summary/daily')
  @ApiOperation({ summary: 'Daily sales summary (count / amount / vat / disc)' })
  async daily(@Query() q: DailySummaryQuery) {
    const data = await this.bills.dailySummary(q.from, q.to);
    return { data, meta: { count: data.length } };
  }

  @Get(':billNo')
  @ApiOperation({ summary: 'Bill detail (header + lines + recomputed totals)' })
  async getOne(@Param('billNo') billNo: string) {
    const data = await this.bills.getByNo(billNo);
    return { data };
  }
}
