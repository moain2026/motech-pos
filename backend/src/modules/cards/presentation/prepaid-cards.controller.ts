import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AuthenticatedRequest,
  JwtAuthGuard,
} from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { PrepaidCardsService } from '../application/prepaid-cards.service';

class ListPrepaidQuery {
  @IsOptional()
  @IsString()
  @MaxLength(15)
  customer?: string;

  @IsOptional()
  @IsIn(['CARD', 'COUPON'])
  type?: 'CARD' | 'COUPON';

  @IsOptional()
  @Type(() => Boolean)
  active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number;
}

class CreatePrepaidCardDto {
  @ApiProperty({ description: 'Card/coupon number (unique)' })
  @IsString()
  @MaxLength(60)
  cardNo!: string;

  @ApiPropertyOptional({ enum: ['CARD', 'COUPON'], default: 'CARD' })
  @IsOptional()
  @IsIn(['CARD', 'COUPON'])
  cardType?: 'CARD' | 'COUPON';

  @ApiPropertyOptional({ description: 'Currency (default YER)' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{2,7}$/)
  currency?: string;

  @ApiProperty({ description: 'Face value (> 0)' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({ description: 'Linked customer code (C_CODE)' })
  @IsOptional()
  @IsString()
  @MaxLength(15)
  customerCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: string;

  @ApiPropertyOptional({ description: 'Expiry date YYYY-MM-DD' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  expireDate?: string;
}

class MoveAmountDto {
  @ApiProperty({ description: 'Amount (> 0)' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @ApiPropertyOptional({ description: 'Reference (e.g. bill no)' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  ref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(250)
  note?: string;
}

class SetCardStatusDto {
  @ApiProperty({ description: 'true = disable the card' })
  @IsBoolean()
  inactive!: boolean;
}

/**
 * PrepaidCardsController — POSI007 بطاقات الدفع المسبق والكوبونات +
 * POSI200 مبالغ بطاقات العملاء. MOTECH_POS authoritative (V019); balance
 * moves are transactional and can never overdraw (422 RFC 9457).
 * Reads all roles (cashier resolves a card at pay time); issue/topup/status
 * supervisor/admin; redeem allowed to cashiers (it IS the payment action).
 */
@ApiTags('prepaid-cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cashier', 'supervisor', 'admin')
@Controller('prepaid-cards')
export class PrepaidCardsController {
  constructor(private readonly svc: PrepaidCardsService) {}

  @Get()
  @ApiOperation({
    summary: 'List prepaid cards/coupons (filter: customer/type/active)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListPrepaidQuery) {
    const data = await this.svc.list({
      customerCode: q.customer,
      cardType: q.type,
      activeOnly: q.active,
      limit: q.limit,
    });
    return { data, meta: { count: data.length } };
  }

  @Get(':cardNo')
  @ApiOperation({ summary: 'Card detail + live balance (pay-time lookup)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async get(@Param('cardNo') cardNo: string) {
    const data = await this.svc.get(cardNo);
    return { data };
  }

  @Get(':cardNo/movements')
  @ApiOperation({
    summary: 'Balance movement history (POSI200 حركة بطاقة العميل)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async movements(@Param('cardNo') cardNo: string) {
    const data = await this.svc.movements(cardNo);
    return { data, meta: { count: data.movements.length } };
  }

  @Post()
  @HttpCode(201)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Issue a prepaid card/coupon (POSI007)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async create(@Body() dto: CreatePrepaidCardDto, @Req() req: AuthenticatedRequest) {
    const data = await this.svc.create({
      cardNo: dto.cardNo,
      cardType: dto.cardType ?? 'CARD',
      currency: (dto.currency ?? 'YER').toUpperCase(),
      amount: dto.amount,
      customerCode: dto.customerCode ?? null,
      description: dto.description ?? null,
      expireDate: dto.expireDate ?? null,
      createdBy: req.user?.username ?? 'system',
    });
    return { data };
  }

  @Post(':cardNo/topup')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Top-up the card balance' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async topup(
    @Param('cardNo') cardNo: string,
    @Body() dto: MoveAmountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.svc.topup(
      cardNo,
      dto.amount,
      req.user?.username ?? 'system',
      dto.note,
    );
    return { data };
  }

  @Post(':cardNo/redeem')
  @ApiOperation({
    summary:
      'Redeem from the card (payment tender; guarded — can never overdraw)',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async redeem(
    @Param('cardNo') cardNo: string,
    @Body() dto: MoveAmountDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.svc.redeem(
      cardNo,
      dto.amount,
      req.user?.username ?? 'system',
      dto.ref,
      dto.note,
    );
    return { data };
  }

  @Put(':cardNo/status')
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Enable/disable a card' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async setStatus(
    @Param('cardNo') cardNo: string,
    @Body() dto: SetCardStatusDto,
  ) {
    const data = await this.svc.setStatus(cardNo, dto.inactive);
    return { data };
  }
}
