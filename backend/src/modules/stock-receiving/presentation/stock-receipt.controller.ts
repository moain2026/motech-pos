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
import { StockReceiptService } from '../application/stock-receipt.service';
import {
  CreateStockReceiptDto,
  ListStockReceiptsQuery,
} from './stock-receipt.dto';

/**
 * StockReceiptController — POST029 (الاستلام المخزني). Record incoming goods
 * as a DRAFT document; a supervisor/admin POSTS it — approval writes the REAL
 * ITEM_MOVEMENT rows (DOC_TYPE=8 / IN_OUT=+1) and refreshes MV_ITEM_AVL_QTY,
 * so available stock truly increases. JWT-protected; RFC 9457 errors;
 * envelope { data, meta }.
 */
@ApiTags('stock-receipts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-receipts')
export class StockReceiptController {
  constructor(private readonly receipts: StockReceiptService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Record an incoming stock receipt (DRAFT)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async create(
    @Body() dto: CreateStockReceiptDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.receipts.create({
      warehouseCode: dto.warehouseCode,
      sourceWarehouseCode: dto.sourceWarehouseCode ?? null,
      transferId: dto.transferId ?? null,
      refNo: dto.refNo ?? null,
      note: dto.note ?? null,
      createdBy: req.user?.username ?? 'unknown',
      lines: dto.lines.map((l) => ({
        itemCode: l.itemCode,
        qty: l.qty,
        note: l.note ?? null,
      })),
    });
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'List stock receipts (filter status/warehouse)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListStockReceiptsQuery) {
    const data = await this.receipts.list({
      status: q.status,
      warehouse: q.warehouse,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Stock receipt detail with lines' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async byId(@Param('id') id: string) {
    const data = await this.receipts.byId(id);
    return { data };
  }

  @Post(':id/post')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'uuid — mandatory; replays return the same posted receipt',
    required: true,
  })
  @ApiOperation({
    summary:
      'Approve (post) the receipt — writes ITEM_MOVEMENT and INCREASES available stock',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async post(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required to post a stock receipt',
        {},
      );
    }
    const { receipt, replayed } = await this.receipts.post(
      id,
      req.user?.username ?? 'unknown',
      idempotencyKey,
    );
    return { data: receipt, meta: { replayed } };
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel a DRAFT stock receipt' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.receipts.cancel(
      id,
      req.user?.username ?? 'unknown',
    );
    return { data };
  }
}
