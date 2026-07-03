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
import { HoldBillUseCase } from '../application/hold-bill.usecase';
import { PostBillUseCase } from '../application/post-bill.usecase';
import { VatCalcType } from '../domain/entities/bill-line.entity';
import { DailySummaryQuery, ListBillsQuery } from './list-bills.query';
import {
  AddPaymentDto,
  AddPaymentsDto,
  HoldBillDto,
  PostBillDto,
  ResumeBillDto,
} from './post-bill.dto';

@ApiTags('bills')
@Controller('bills')
export class BillsController {
  constructor(
    private readonly bills: BillsService,
    private readonly postBill: PostBillUseCase,
    private readonly addPayment: AddPaymentUseCase,
    private readonly holdBill: HoldBillUseCase,
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
  @ApiOperation({
    summary:
      'Add a payment (cash/card/credit/points/coupon; partial/multi-currency) to a posted bill',
  })
  async pay(@Param('id') id: string, @Body() body: AddPaymentDto) {
    const data = await this.addPayment.execute({
      billId: id,
      method: body.method,
      amount: body.amount,
      currency: body.currency,
      rate: body.rate,
      cardNo: body.cardNo,
      customerCode: body.customerCode,
      couponNo: body.couponNo,
    });
    return { data };
  }

  @Post(':id/payments/multi')
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({
    summary:
      'Settle a bill with MULTIPLE tenders in one call (cash + card + credit, multi-currency)',
  })
  async payMulti(@Param('id') id: string, @Body() body: AddPaymentsDto) {
    const data = await this.addPayment.executeMany({
      billId: id,
      tenders: body.tenders,
    });
    return { data };
  }

  //==========================================================================
  // HELD (hung) bills — Hold / Resume (POST003)
  //==========================================================================

  @Post('hold')
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'uuid — mandatory; replays return the same held bill',
    required: true,
  })
  @ApiOperation({ summary: 'Hold (park) an in-progress sale (open shift required)' })
  async hold(
    @Body() body: HoldBillDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required to hold a bill',
        {},
      );
    }
    const { held, replayed } = await this.holdBill.hold({
      idempotencyKey,
      cashierNo: body.cashierNo,
      machineNo: body.machineNo,
      label: body.label,
      customerCode: body.customerCode,
      customerName: body.customerName,
      currency: body.currency,
      taxCalcType: body.taxCalcType as VatCalcType | undefined,
      headerDiscount: body.headerDiscount,
      clientOperationId: body.clientOperationId ?? uuidv7(),
      lines: body.lines,
    });
    return { data: held, meta: { replayed } };
  }

  @Get('held')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'List held (parked) bills for a cashier' })
  async listHeld(@Query('cashierNo') cashierNo: string) {
    const items = await this.holdBill.listHeld(Number(cashierNo));
    return { data: items, meta: { count: items.length } };
  }

  @Post('held/:id/resume')
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'uuid — mandatory; idempotency key for the produced POSTED bill',
    required: true,
  })
  @ApiOperation({ summary: 'Resume a held bill → post it as a real sale' })
  async resume(
    @Param('id') id: string,
    @Body() body: ResumeBillDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required to resume a bill',
        {},
      );
    }
    const { bill, held, replayed } = await this.holdBill.resume({
      heldId: id,
      cashierNo: body.cashierNo,
      idempotencyKey,
    });
    return { data: { bill, held }, meta: { replayed } };
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
