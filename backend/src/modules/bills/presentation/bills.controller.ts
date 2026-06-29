import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { isUuid, uuidv7 } from '../../../shared/domain/uuid';
import { IdempotencyKeyRequiredError } from '../../../shared/errors/domain-error';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { AddPaymentUseCase } from '../application/add-payment.usecase';
import { BillsService } from '../application/bills.service';
import { PostBillUseCase } from '../application/post-bill.usecase';
import { DailySummaryQuery, ListBillsQuery } from './list-bills.query';
import { AddPaymentDto, PostBillDto } from './post-bill.dto';

@ApiTags('bills')
@Controller('bills')
export class BillsController {
  constructor(
    private readonly bills: BillsService,
    private readonly postBill: PostBillUseCase,
    private readonly addPayment: AddPaymentUseCase,
  ) {}

  //==========================================================================
  // WRITE side (MOTECH_POS) — protected, idempotent
  //==========================================================================

  @Post()
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'uuid v7 — mandatory; replays return the same bill (no dup)',
    required: true,
  })
  @ApiOperation({ summary: 'Create a sale bill (open shift required, idempotent)' })
  async create(
    @Body() body: PostBillDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required for bill creation',
        {},
      );
    }
    const { bill, replayed } = await this.postBill.execute({
      idempotencyKey,
      cashierNo: body.cashierNo,
      machineNo: body.machineNo,
      customerCode: body.customerCode,
      customerName: body.customerName,
      currency: body.currency,
      taxCalcType: body.taxCalcType,
      headerDiscount: body.headerDiscount,
      clientOperationId: body.clientOperationId ?? uuidv7(),
      lines: body.lines,
    });
    return { data: bill, meta: { replayed } };
  }

  @Post(':id/payments')
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'Add a payment (cash/card/credit) to a posted bill' })
  async pay(@Param('id') id: string, @Body() body: AddPaymentDto) {
    const data = await this.addPayment.execute({
      billId: id,
      method: body.method,
      amount: body.amount,
      currency: body.currency,
      rate: body.rate,
      cardNo: body.cardNo,
      customerCode: body.customerCode,
    });
    return { data };
  }

  @Get('posted/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'Fetch a posted bill from MOTECH_POS (header+lines+payments)' })
  async getPosted(@Param('id') id: string) {
    const data = await this.bills.getPostedById(id);
    return { data };
  }

  //==========================================================================
  // READ side (YSPOS23) — existing reporting/browse endpoints
  //==========================================================================

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
