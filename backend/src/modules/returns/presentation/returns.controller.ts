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
import { CreateReturnUseCase } from '../application/create-return.usecase';
import { ReturnsService } from '../application/returns.service';
import { CreateReturnDto } from './create-return.dto';
import { ListReturnsQuery } from './list-returns.query';

@ApiTags('returns')
@Controller('returns')
export class ReturnsController {
  constructor(
    private readonly returns: ReturnsService,
    private readonly createReturn: CreateReturnUseCase,
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
    description: 'uuid v7 — mandatory; replays return the same document (no dup)',
    required: true,
  })
  @ApiOperation({
    summary:
      'Create a sales return (original bill verified, open shift required, idempotent)',
  })
  async create(
    @Body() body: CreateReturnDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required for return creation',
        {},
      );
    }
    const { ret, replayed } = await this.createReturn.execute({
      idempotencyKey,
      originalBillNo: body.originalBillNo,
      cashierNo: body.cashierNo,
      machineNo: body.machineNo,
      returnType: body.returnType,
      currency: body.currency,
      clientOperationId: body.clientOperationId ?? uuidv7(),
      lines: body.lines,
    });
    return { data: ret, meta: { replayed } };
  }

  //==========================================================================
  // READ side — list (YSPOS23 RT) + detail (MOTECH_POS or YSPOS23)
  //==========================================================================

  @Get()
  @ApiOperation({ summary: 'List returns (newest first, cursor paginated)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListReturnsQuery) {
    const { items, nextCursor } = await this.returns.list({
      from: q.from,
      to: q.to,
      machineNo: q.machineNo,
      originalBillNo: q.originalBillNo,
      cursor: q.cursor,
      limit: q.limit ?? 50,
    });
    return {
      data: items,
      meta: { count: items.length, nextCursor: nextCursor ?? null },
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Return detail (MOTECH_POS by UUID, or legacy YSPOS23 by RT number)',
  })
  async getOne(@Param('id') id: string) {
    const result = await this.returns.getById(id);
    return { data: result.data, meta: { source: result.source } };
  }
}
