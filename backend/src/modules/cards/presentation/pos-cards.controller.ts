import {
  Body,
  Controller,
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
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { PosCardsService } from '../application/pos-cards.service';
import { UpsertPosCardDto } from './pos-card.dto';
import { UpsertPosCardInput } from '../domain/ports/pos-cards.port';

/**
 * PosCardsController — CRUD for POS card types (POSI012). Reads merge the ERP
 * master with the MOTECH_POS overlay; writes land only in the overlay.
 * Reads: any authenticated user. Writes: supervisor/admin (RBAC).
 */
@ApiTags('pos-cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pos-cards')
export class PosCardsController {
  constructor(private readonly cards: PosCardsService) {}

  @Get()
  @ApiOperation({ summary: 'List POS card types (ERP master merged with overlay)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list() {
    const data = await this.cards.list();
    return { data, meta: { count: data.length } };
  }

  @Get(':cardNo')
  @ApiOperation({ summary: 'One POS card type by number' })
  async get(@Param('cardNo', ParseIntPipe) cardNo: number) {
    const data = await this.cards.get(cardNo);
    return { data };
  }

  @Post()
  @HttpCode(201)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Create a POS card type (supervisor/admin, overlay)' })
  async create(@Body() body: UpsertPosCardDto) {
    const data = await this.cards.create(this.toInput(body));
    return { data };
  }

  @Put(':cardNo')
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Edit a POS card type (supervisor/admin, overlay)' })
  async update(
    @Param('cardNo', ParseIntPipe) cardNo: number,
    @Body() body: UpsertPosCardDto,
  ) {
    const data = await this.cards.update(cardNo, this.toInput(body));
    return { data };
  }

  private toInput(body: UpsertPosCardDto): UpsertPosCardInput {
    return {
      cardNo: body.cardNo,
      arName: body.arName.trim(),
      enName: body.enName ?? null,
      cardType: body.cardType ?? null,
      bankNo: body.bankNo ?? null,
      commissionPct: body.commissionPct ?? null,
      commCalcType: body.commCalcType ?? null,
      duePeriod: body.duePeriod ?? null,
      bankAc: body.bankAc ?? null,
      inactive: body.inactive ?? false,
    };
  }
}
