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
import { StockIssueService } from '../application/stock-issue.service';
import { CreateStockIssueDto, ListStockIssuesQuery } from './stock-issue.dto';

/**
 * StockIssueController — POST028 (التحويل المخزني الصادر). Record an outgoing
 * transfer as DRAFT; a supervisor/admin POSTS it — approval writes the REAL
 * ITEM_MOVEMENT rows (DOC_TYPE=7 / IN_OUT=−1, availability-guarded) and
 * refreshes MV_ITEM_AVL_QTY — stock truly LEAVES the source warehouse.
 */
@ApiTags('stock-issues')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stock-issues')
export class StockIssueController {
  constructor(private readonly issues: StockIssueService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Record an outgoing warehouse transfer (DRAFT)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async create(
    @Body() dto: CreateStockIssueDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.issues.create({
      warehouseCode: dto.warehouseCode,
      destWarehouseCode: dto.destWarehouseCode ?? null,
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
  @ApiOperation({ summary: 'List stock issues (filter status/warehouse)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListStockIssuesQuery) {
    const data = await this.issues.list({
      status: q.status,
      warehouse: q.warehouse,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Stock issue detail with lines' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async byId(@Param('id') id: string) {
    const data = await this.issues.byId(id);
    return { data };
  }

  @Post(':id/post')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'uuid — mandatory; replays return the same posted issue',
    required: true,
  })
  @ApiOperation({
    summary:
      'Approve (post) the issue — availability-guarded; stock LEAVES the source warehouse',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async post(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required to post a stock issue',
        {},
      );
    }
    const { issue, replayed } = await this.issues.post(
      id,
      req.user?.username ?? 'unknown',
      idempotencyKey,
    );
    return { data: issue, meta: { replayed } };
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel a DRAFT stock issue' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.issues.cancel(id, req.user?.username ?? 'unknown');
    return { data };
  }
}
