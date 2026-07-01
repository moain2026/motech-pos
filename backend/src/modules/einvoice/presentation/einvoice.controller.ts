import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { EInvoiceService } from '../application/einvoice.service';

/**
 * EInvoiceController — generate + fetch the electronic tax document per bill
 * (الفوترة الإلكترونية). Write path (generate) is idempotent by bill id: a
 * re-POST returns the original document (meta.replayed=true).
 */
@ApiTags('einvoice')
@ApiBearerAuth()
@Controller('einvoice')
export class EInvoiceController {
  constructor(private readonly einvoice: EInvoiceService) {}

  @Post('generate/:billId')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({
    summary:
      'Generate the e-invoice (TLV/QR + JSON + hash) for a posted bill; simulates SUBMITDOCUMENT',
  })
  async generate(@Param('billId') billId: string) {
    const { einvoice, replayed } = await this.einvoice.generate(billId);
    return { data: einvoice, meta: { replayed } };
  }

  @Get(':billId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiOperation({ summary: 'Fetch the generated e-invoice document for a bill' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async get(@Param('billId') billId: string) {
    const data = await this.einvoice.getByBillId(billId);
    return { data };
  }
}
