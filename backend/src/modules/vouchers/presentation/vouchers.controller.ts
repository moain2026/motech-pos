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
import { CreateVoucherUseCase } from '../application/create-voucher.usecase';
import { RefundVoucherUseCase } from '../application/refund-voucher.usecase';
import { VouchersService } from '../application/vouchers.service';
import { CreateVoucherDto } from './create-voucher.dto';
import { RefundVoucherDto } from './refund-voucher.dto';
import { ListVouchersQuery } from './list-vouchers.query';

/**
 * VouchersController — cash receipts (سند قبض / POST025) and expenses
 * (سند صرف / POST026). Vouchers attach to the cashier's open shift and feed
 * the shift-close cash reconciliation. Writes go to MOTECH_POS only.
 */
@ApiTags('vouchers')
@Controller('vouchers')
export class VouchersController {
  constructor(
    private readonly vouchers: VouchersService,
    private readonly createVoucher: CreateVoucherUseCase,
    private readonly refundVoucher: RefundVoucherUseCase,
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
    description: 'uuid v7 — mandatory; replays return the same voucher (no dup)',
    required: true,
  })
  @ApiOperation({
    summary:
      'Create a cash voucher (RECEIPT/قبض or EXPENSE/صرف); open shift required, idempotent',
  })
  async create(
    @Body() body: CreateVoucherDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required for voucher creation',
        {},
      );
    }
    const { voucher, replayed } = await this.createVoucher.execute({
      idempotencyKey,
      type: body.type,
      cashierNo: body.cashierNo,
      machineNo: body.machineNo,
      amount: body.amount,
      currency: body.currency,
      rate: body.rate,
      paymentMethod: body.paymentMethod,
      description: body.description,
      partyName: body.partyName,
      category: body.category,
      clientOperationId: body.clientOperationId ?? uuidv7(),
    });
    return { data: voucher, meta: { replayed } };
  }

  //==========================================================================
  // POST006 — refund voucher for a return (auto-link, idempotent 1:1)
  //==========================================================================

  @Post('refunds')
  @HttpCode(201)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({
    summary:
      'Issue (or fetch) the cash refund voucher (سند صرف) for a MOTECH_POS return — idempotent, one voucher per return (POST006)',
  })
  async createRefund(@Body() body: RefundVoucherDto) {
    const { voucher, replayed } = await this.refundVoucher.execute({
      returnId: body.returnId,
      cashierNo: body.cashierNo,
      machineNo: body.machineNo,
      note: body.note,
    });
    return { data: voucher, meta: { replayed } };
  }

  //==========================================================================
  // READ side — list + detail
  //==========================================================================

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List vouchers (filter by shift, type, cashier, date)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListVouchersQuery) {
    const items = await this.vouchers.list({
      shiftId: q.shift,
      type: q.type,
      cashierNo: q.cashierNo,
      from: q.from,
      to: q.to,
      limit: q.limit ?? 100,
    });
    return { data: items, meta: { count: items.length } };
  }

  @Get('for-return/:returnId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'The refund voucher already issued for a return, or null (POST006 idempotency probe)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async forReturn(@Param('returnId') returnId: string) {
    const data = await this.vouchers.findByRefundReturnId(returnId);
    return { data, meta: {} };
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Voucher detail (MOTECH_POS by UUID)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async getOne(@Param('id') id: string) {
    const data = await this.vouchers.getById(id);
    return { data, meta: {} };
  }
}
