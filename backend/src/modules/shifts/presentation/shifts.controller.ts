import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ShiftsService } from '../application/shifts.service';

@ApiTags('shifts')
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shifts: ShiftsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Open shift for a cashier (GET_WRK_SHFT_OPN_FNC)' })
  @ApiQuery({ name: 'cashierNo', type: Number })
  async current(@Query('cashierNo', ParseIntPipe) cashierNo: number) {
    const data = await this.shifts.current(cashierNo);
    return { data };
  }
}
