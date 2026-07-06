import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
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
import { LoyaltyService } from '../application/loyalty.service';
import { UpsertLoyaltyProgramDto } from './loyalty-program.dto';
import { UpsertLoyaltyProgramInput } from '../domain/ports/loyalty-repository.port';

class LedgerQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 100;
}

/**
 * LoyaltyController — earned-points balance + movement history sourced from
 * MOTECH_POS (POINTS_LEDGER), i.e. points actually earned by OUR sales.
 */
@ApiTags('loyalty')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyalty: LoyaltyService) {}

  @Get('customers/:code/points')
  @ApiOperation({ summary: 'Earned loyalty balance + ledger for a customer (MOTECH_POS)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async points(@Param('code') code: string, @Query() q: LedgerQuery) {
    const [balance, ledger] = await Promise.all([
      this.loyalty.earnedBalance(code),
      this.loyalty.ledger(code, q.limit ?? 100),
    ]);
    return { data: { balance, ledger }, meta: { count: ledger.length } };
  }

  @Get('customers/:code/ledger')
  @ApiOperation({
    summary:
      'Full points movement history with running balance per row (POST021)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async ledger(@Param('code') code: string, @Query() q: LedgerQuery) {
    const view = await this.loyalty.customerLedger(code, q.limit ?? 100);
    return {
      data: view,
      meta: { count: view.entries.length },
    };
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Chain-wide loyalty totals: granted vs redeemed points (POST021)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async summary() {
    const data = await this.loyalty.summary();
    return { data, meta: {} };
  }

  //==========================================================================
  // POSI008 — loyalty programs CRUD (ترميز برامج نقاطي)
  // Reads: any authenticated user. Writes: supervisor/admin (RBAC).
  //==========================================================================

  @Get('programs')
  @ApiOperation({ summary: 'List loyalty programs (POSI008)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async listPrograms() {
    const data = await this.loyalty.listPrograms();
    return { data, meta: { count: data.length } };
  }

  @Get('programs/:id')
  @ApiOperation({ summary: 'One loyalty program by id (POSI008)' })
  async getProgram(@Param('id') id: string) {
    const data = await this.loyalty.getProgram(id);
    return { data };
  }

  @Post('programs')
  @HttpCode(201)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Create a loyalty program (POSI008, supervisor/admin)' })
  async createProgram(
    @Body() body: UpsertLoyaltyProgramDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.loyalty.createProgram(
      this.toInput(body, req),
    );
    return { data };
  }

  @Put('programs/:id')
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Update a loyalty program (POSI008, supervisor/admin)' })
  async updateProgram(
    @Param('id') id: string,
    @Body() body: UpsertLoyaltyProgramDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.loyalty.updateProgram(id, this.toInput(body, req));
    return { data };
  }

  @Delete('programs/:id')
  @HttpCode(204)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Delete a loyalty program (POSI008, supervisor/admin)' })
  async deleteProgram(@Param('id') id: string) {
    await this.loyalty.deleteProgram(id);
  }

  private toInput(
    body: UpsertLoyaltyProgramDto,
    req: AuthenticatedRequest,
  ): UpsertLoyaltyProgramInput {
    const sub = req.user?.sub;
    const createdBy = typeof sub === 'number' ? sub : null;
    return {
      name: body.name.trim(),
      pointTypNo: body.pointTypNo ?? 1,
      calcType: body.calcType,
      amt4Point: body.amt4Point,
      pointCnt: body.pointCnt ?? 1,
      truncate: body.truncate ?? true,
      pointValue: body.pointValue ?? 1,
      minBillAmt: body.minBillAmt ?? 0,
      maxPointsPerBill: body.maxPointsPerBill ?? 0,
      startDate: body.startDate ?? null,
      endDate: body.endDate ?? null,
      active: body.active ?? true,
      createdBy,
    };
  }
}
