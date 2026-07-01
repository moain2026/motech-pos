import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { ShiftsService } from '../application/shifts.service';
import { CloseShiftDto, OpenShiftDto, ReconciliationQuery } from './shifts.dto';

@ApiTags('shifts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'supervisor', 'admin')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shifts: ShiftsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Open shift for a cashier (MOTECH_POS.SHIFTS)' })
  @ApiQuery({ name: 'cashierNo', type: Number })
  async current(@Query('cashierNo', ParseIntPipe) cashierNo: number) {
    const data = await this.shifts.current(cashierNo);
    return { data };
  }

  @Get('legacy/current')
  @ApiOperation({
    summary: 'Open shift from YSPOS23 (GET_WRK_SHFT_OPN_FNC, read-only)',
  })
  @ApiQuery({ name: 'cashierNo', type: Number })
  async legacyCurrent(@Query('cashierNo', ParseIntPipe) cashierNo: number) {
    const data = await this.shifts.legacyCurrent(cashierNo);
    return { data };
  }

  @Post('open')
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'Open a work shift (selling precondition)' })
  async open(@Body() body: OpenShiftDto) {
    const data = await this.shifts.open({
      cashierNo: body.cashierNo,
      shiftCode: body.shiftCode,
      machineNo: body.machineNo,
      openingBalance: body.openingBalance,
      currency: body.currency,
    });
    return { data };
  }

  @Post(':id/close')
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'Close a work shift (expected cash + over/short)' })
  async close(@Param('id') id: string, @Body() body: CloseShiftDto) {
    const shift = await this.shifts.close({
      shiftId: id,
      closingBalance: body.closingBalance,
      cashExpenses: body.cashExpenses,
      closeNote: body.closeNote,
    });
    // Backward-compatible: `data` is the closed shift record (expectedCash /
    // cashDifference are on it). The full Z-report breakdown is available via
    // GET /shifts/:id/reconciliation and echoed here under meta for convenience.
    const reconciliation = await this.shifts.reconciliation(id, {
      cashExpenses: body.cashExpenses,
    });
    return { data: shift, meta: { reconciliation } };
  }

  @Get(':id/reconciliation')
  @ApiOperation({
    summary:
      'Cashier reconciliation / Z-report: expected vs actual cash, over/short, per-method breakdown',
  })
  async reconciliation(
    @Param('id') id: string,
    @Query() q: ReconciliationQuery,
  ) {
    const data = await this.shifts.reconciliation(id, {
      actualCash: q.actualCash,
      cashExpenses: q.cashExpenses,
    });
    return { data };
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Shift summary (X/Z report: sales + cash totals)' })
  async summary(@Param('id') id: string) {
    const data = await this.shifts.summary(id);
    return { data };
  }
}
