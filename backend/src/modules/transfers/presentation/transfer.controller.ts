import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthenticatedRequest,
  JwtAuthGuard,
} from '../../auth/presentation/jwt-auth.guard';
import { TransferService } from '../application/transfer.service';
import { CreateTransferDto, ListTransfersQuery } from './transfer.dto';

/**
 * TransferController — POST019 (طلب صرف/تحويل مواد). Raises a transfer
 * request for goods FROM a source warehouse TO the requesting point's
 * warehouse (Onyx IAS_OUT_REQUEST_MST/DTL analogue). Warehouses are
 * validated LIVE against YSPOS23; per-line source availability is
 * snapshotted for the approver; requests never reserve or mutate stock.
 * JWT-protected; RFC 9457 errors; envelope { data, meta }.
 */
@ApiTags('transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transfers')
export class TransferController {
  constructor(private readonly transfers: TransferService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Raise a material transfer request between two warehouses',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async create(
    @Body() dto: CreateTransferDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.transfers.create({
      fromWarehouse: dto.fromWarehouse,
      toWarehouse: dto.toWarehouse,
      reqSide: dto.reqSide ?? null,
      purpose: dto.purpose ?? null,
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
  @ApiOperation({ summary: 'List transfer requests (filter status/warehouse)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListTransfersQuery) {
    const data = await this.transfers.list({
      status: q.status,
      warehouse: q.warehouse,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Transfer request detail with lines' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async byId(@Param('id') id: string) {
    const data = await this.transfers.byId(id);
    return { data };
  }

  @Post(':id/cancel')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancel an OPEN transfer request' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async cancel(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const data = await this.transfers.cancel(
      id,
      req.user?.username ?? 'unknown',
    );
    return { data };
  }
}
