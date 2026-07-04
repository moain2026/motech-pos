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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { CustomerGroupsService } from '../application/customer-groups.service';

class UpsertGroupDto {
  @ApiPropertyOptional({ description: 'Group code. Omit on create to auto-assign.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99999)
  grpCode?: number;

  @ApiPropertyOptional({ description: 'Arabic name (e.g. عملاء الجملة)' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  arName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(60)
  enName?: string;

  @ApiPropertyOptional({ description: 'Marketing messages flag (SEND_MSG)' })
  @IsOptional()
  @IsBoolean()
  sendMsg?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inactive?: boolean;
}

class AssignMemberDto {
  @ApiProperty({ description: 'Customer code (C_CODE)' })
  @IsString()
  @MaxLength(15)
  customerCode!: string;
}

/**
 * CustomerGroupsController — POSI009 مجموعات عملاء نقاط البيع.
 * MOTECH_POS authoritative (V020). One group per customer (assign reassigns).
 * Reads all roles; mutations supervisor/admin. RFC 9457 errors.
 */
@ApiTags('customer-groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'supervisor', 'admin')
@Controller('customer-groups')
export class CustomerGroupsController {
  constructor(private readonly svc: CustomerGroupsService) {}

  @Get()
  @ApiOperation({ summary: 'List customer groups with member counts' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list() {
    const data = await this.svc.list();
    return { data, meta: { count: data.length } };
  }

  @Get(':no')
  @ApiOperation({ summary: 'Group detail + members (names resolved)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async get(@Param('no', ParseIntPipe) no: number) {
    const data = await this.svc.get(no);
    return { data, meta: { members: data.members.length } };
  }

  @Post()
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Create a customer group' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async create(@Body() dto: UpsertGroupDto) {
    const data = await this.svc.create(dto);
    return { data };
  }

  @Put(':no')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Edit a customer group' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async update(
    @Param('no', ParseIntPipe) no: number,
    @Body() dto: UpsertGroupDto,
  ) {
    const data = await this.svc.update(no, {
      arName: dto.arName ?? null,
      enName: dto.enName ?? null,
      sendMsg: dto.sendMsg ?? null,
      inactive: dto.inactive ?? null,
    });
    return { data };
  }

  @Post(':no/members')
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Assign a customer to the group (reassigns if already grouped)',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async assign(
    @Param('no', ParseIntPipe) no: number,
    @Body() dto: AssignMemberDto,
  ) {
    const data = await this.svc.assign(no, dto.customerCode);
    return { data };
  }

  @Delete('members/:customerCode')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Remove a customer from their group' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async unassign(@Param('customerCode') customerCode: string) {
    const data = await this.svc.unassign(customerCode);
    return { data };
  }
}
