import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { PromotionsService } from '../application/promotions.service';
import {
  ApplyPromotionsDto,
  CreateLocalPromotionDto,
  SetPromotionStatusDto,
} from './apply-promotions.dto';

/**
 * PromotionsController — POST001 promotion engine (GNR_QTN_PRM_PKG analogue).
 *   GET  /promotions          → active POS promotions today (ERP + LOCAL).
 *   POST /promotions/apply    → evaluate promotions against a cart → discounts
 *                                + free items to apply (no writes).
 *   GET/POST/PUT/DELETE /promotions/local → LOCAL overlay CRUD (supervisor/
 *                                admin) — ERP catalog stays read-only.
 */
@ApiTags('promotions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotions: PromotionsService) {}

  @Get()
  @ApiOperation({ summary: 'Active POS promotions today (POST001; ERP + LOCAL)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async listActive() {
    const data = await this.promotions.listActive();
    return { data, meta: { count: data.length } };
  }

  @Post('apply')
  @ApiOperation({
    summary:
      'Evaluate active promotions against a cart → line discounts + free items',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async apply(@Body() body: ApplyPromotionsDto) {
    const data = await this.promotions.apply({
      lines: body.lines.map((l) => ({
        itemCode: l.itemCode,
        itemUnit: l.itemUnit ?? null,
        qty: l.qty,
        unitPrice: l.unitPrice,
      })),
    });
    return { data };
  }

  //==========================================================================
  // LOCAL overlay CRUD — POS-defined promotions (MOTECH_POS, ERP untouched).
  //==========================================================================

  @Get('local')
  @ApiOperation({ summary: 'List LOCAL overlay promotions (any state)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async listLocal() {
    const data = await this.promotions.listLocal();
    return { data, meta: { count: data.length } };
  }

  @Post('local')
  @HttpCode(201)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Create a LOCAL promotion (supervisor/admin)' })
  async createLocal(
    @Body() body: CreateLocalPromotionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const sub = req.user?.sub;
    const data = await this.promotions.createLocal({
      description: body.description ?? null,
      prmType: body.prmType,
      prmMethod: body.prmMethod ?? 1,
      fromDate: body.fromDate,
      toDate: body.toDate,
      fromTime: body.fromTime ?? null,
      toTime: body.toTime ?? null,
      dowMask: body.dowMask ?? null,
      byInvoiceAmount: body.byInvoiceAmount ?? false,
      freeQtyAsDiscount: body.freeQtyAsDiscount ?? false,
      createdBy: sub == null ? null : String(sub),
      lines: body.lines,
    });
    return { data };
  }

  @Put('local/:quotNo/status')
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Activate/deactivate a LOCAL promotion (supervisor/admin)' })
  async setStatus(
    @Param('quotNo', ParseIntPipe) quotNo: number,
    @Body() body: SetPromotionStatusDto,
  ) {
    const data = await this.promotions.setLocalStatus(quotNo, body.inactive);
    return { data };
  }

  @Delete('local/:quotNo')
  @HttpCode(204)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Delete a LOCAL promotion (supervisor/admin)' })
  async deleteLocal(@Param('quotNo', ParseIntPipe) quotNo: number) {
    await this.promotions.deleteLocal(quotNo);
  }
}
