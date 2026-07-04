import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { isUuid } from '../../../shared/domain/uuid';
import { IdempotencyKeyRequiredError } from '../../../shared/errors/domain-error';
import {
  AuthenticatedRequest,
  JwtAuthGuard,
} from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { SalesOrderService } from '../application/sales-order.service';
import {
  ConvertSalesOrderDto,
  CreateSalesOrderDto,
  ListSalesOrdersQuery,
} from './sales-order.dto';

/**
 * SalesOrderController — POST024 (طلبات العملاء): record a customer order,
 * later convert it into a REAL sale bill (تنزيل في فاتورة) or cancel it.
 * Orders live in MOTECH_POS only; conversion goes through PostBillUseCase
 * (server-side pricing, open-shift guard, YSPOS23 twin write). JWT-protected;
 * RFC 9457 errors; envelope { data, meta }.
 */
@ApiTags('sales-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'supervisor', 'admin')
@Controller('sales-orders')
export class SalesOrderController {
  constructor(private readonly orders: SalesOrderService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Record a customer order (POST024)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async create(
    @Body() dto: CreateSalesOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.orders.create({
      customerCode: dto.customerCode ?? null,
      customerName: dto.customerName ?? null,
      currency: dto.currency ?? null,
      refNo: dto.refNo ?? null,
      note: dto.note ?? null,
      expireDate: dto.expireDate ?? null,
      createdBy: req.user?.username ?? 'unknown',
      lines: dto.lines.map((l) => ({
        itemCode: l.itemCode,
        qty: l.qty,
        discDtl: l.discDtl ?? null,
        note: l.note ?? null,
      })),
    });
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'List sales orders (filter status/customer)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListSalesOrdersQuery) {
    const data = await this.orders.list({
      status: q.status,
      customerCode: q.customer,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Sales order detail with lines' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async byId(@Param('id') id: string) {
    const data = await this.orders.byId(id);
    return { data };
  }

  @Post(':id/convert')
  @HttpCode(201)
  @ApiHeader({
    name: 'Idempotency-Key',
    description:
      'uuid — mandatory; replays return the same converted order + bill',
    required: true,
  })
  @ApiOperation({
    summary:
      'Convert the order into a REAL sale bill (تنزيل الطلب في فاتورة, idempotent)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async convert(
    @Param('id') id: string,
    @Body() dto: ConvertSalesOrderDto,
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required to convert a sales order',
        {},
      );
    }
    const { order, replayed } = await this.orders.convert({
      orderId: id,
      idempotencyKey,
      cashierNo: dto.cashierNo,
      machineNo: dto.machineNo,
      // SECURITY: role comes from the VERIFIED JWT (gates price overrides in
      // the underlying bill), never from the body.
      actorRole: req.user?.role,
      convertedBy: req.user?.username ?? 'unknown',
    });
    return { data: order, meta: { replayed } };
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel an OPEN sales order' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.orders.cancel(id, req.user?.username ?? 'unknown');
    return { data };
  }
}
