import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { SuppliersService } from '../application/suppliers.service';
import { CreateSupplierDto, UpdateSupplierDto } from './suppliers.dto';

class ListSuppliersQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}

/**
 * SuppliersController — POSI001/POSI002 supplier master.
 * READS merge the live ERP (IAS202623.V_DETAILS) with the MOTECH_POS overlay;
 * WRITES (create/edit) land ONLY in MOTECH_POS.SUPPLIERS_OVERLAY.
 * RBAC: read for all roles, mutations supervisor/admin. RFC 9457 errors.
 */
@ApiTags('suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'supervisor', 'admin')
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliers: SuppliersService) {}

  @Get()
  @ApiOperation({
    summary: 'List suppliers (V_DETAILS merged with local overlay)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListSuppliersQuery) {
    const data = await this.suppliers.list(q.search, q.limit ?? 200);
    return { data, meta: { count: data.length } };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Supplier detail (merged)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async get(@Param('code') code: string) {
    const data = await this.suppliers.getByCode(code);
    return { data };
  }

  @Post()
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Create a LOCAL supplier (MOTECH_POS overlay; POSI001/002)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async create(@Body() dto: CreateSupplierDto) {
    const data = await this.suppliers.create(dto);
    return { data, meta: { origin: data.origin } };
  }

  @Put(':code')
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Edit a supplier (overlay of ERP/local row; ERP never mutated)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async update(@Param('code') code: string, @Body() dto: UpdateSupplierDto) {
    const data = await this.suppliers.update(code, dto);
    return { data, meta: { origin: data.origin } };
  }
}
