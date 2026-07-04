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
import { ReturnCountService } from '../application/return-count.service';
import {
  CountReturnLineDto,
  ListReturnCountsQuery,
  StartReturnCountDto,
} from './return-count.dto';

/**
 * ReturnCountController — POST022 (جرد أصناف مردود المبيعات). Open a count
 * session per machine + day, record physically counted returned quantities
 * (system side snapshotted LIVE from YSPOS23.IAS_POS_RT_BILL_MST/DTL), then a
 * supervisor/admin posts — variances freeze (POSTED terminal). Counts never
 * mutate stock. JWT; RFC 9457; envelope { data, meta }.
 */
@ApiTags('return-counts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('return-counts')
export class ReturnCountController {
  constructor(private readonly counts: ReturnCountService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Open a return count session (machine + day)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async start(
    @Body() dto: StartReturnCountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.counts.start({
      machineNo: dto.machineNo,
      countDate: dto.countDate,
      refNo: dto.refNo ?? null,
      note: dto.note ?? null,
      createdBy: req.user?.username ?? 'unknown',
    });
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'List return count sessions' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListReturnCountsQuery) {
    const data = await this.counts.list({
      status: q.status,
      machineNo: q.machine,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Return count detail with lines (system vs counted)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async byId(@Param('id') id: string) {
    const data = await this.counts.byId(id);
    return { data };
  }

  @Post(':id/lines')
  @ApiOperation({
    summary:
      'Record the physical count of one returned item (diff = counted − system returns)',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async countLine(@Param('id') id: string, @Body() body: CountReturnLineDto) {
    const data = await this.counts.countLine({
      countId: id,
      itemCode: body.itemCode,
      countedQty: body.countedQty,
    });
    return { data };
  }

  @Post(':id/post')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'uuid — mandatory; replays return the same posted count',
    required: true,
  })
  @ApiOperation({
    summary: 'Approve (post) the return count — freezes variances, immutable',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async post(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required to post a return count',
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
