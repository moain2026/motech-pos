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
import { StockCountService } from '../application/stock-count.service';
import {
  CountLineDto,
  ListCountsQuery,
  StartCountDto,
} from './stock-count.dto';

/**
 * StockCountController — POST018 (جرد المخزون): DRAFT count sessions per
 * warehouse, per-item physical counts with variance vs the live
 * MV_ITEM_AVL_QTY snapshot, and a supervisor/admin approval that freezes the
 * session (idempotent). JWT-protected; RFC 9457 errors via the global filter.
 *
 * NOTE: registered BEFORE InventoryController in the module so that
 * `/inventory/counts` wins over the catch-all `/inventory/:code`.
 */
@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/counts')
export class StockCountController {
  constructor(private readonly counts: StockCountService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Start a new stock-count session (جرد) for a warehouse' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async start(@Body() body: StartCountDto, @Req() req: AuthenticatedRequest) {
    const data = await this.counts.start({
      warehouseCode: body.warehouseCode,
      note: body.note ?? null,
      createdBy: req.user?.username ?? 'unknown',
    });
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'List stock-count sessions (newest first)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListCountsQuery) {
    const data = await this.counts.list({
      status: q.status,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Stock-count detail with lines (Arabic item names)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async byId(@Param('id') id: string) {
    const data = await this.counts.byId(id);
    return { data };
  }

  @Post(':id/lines')
  @ApiOperation({
    summary:
      'Record the physical count of one item (diff = counted − system qty)',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async countLine(@Param('id') id: string, @Body() body: CountLineDto) {
    const data = await this.counts.countLine({
      countId: id,
      itemCode: body.itemCode,
      countedQty: body.countedQty,
    });
    return { data };
  }

  @Post(':id/post')
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'uuid — mandatory; replays return the same posted count',
    required: true,
  })
  @ApiOperation({
    summary: 'Approve (post) the stock count — freezes variances, immutable',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async post(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required to post a stock count',
        {},
      );
    }
    const { count, replayed } = await this.counts.post(
      id,
      req.user?.username ?? 'unknown',
      idempotencyKey,
    );
    return { data: count, meta: { replayed } };
  }
}
