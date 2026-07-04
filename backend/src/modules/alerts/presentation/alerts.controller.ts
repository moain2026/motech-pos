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
import {
  AuthenticatedRequest,
  JwtAuthGuard,
} from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { AlertsService } from '../application/alerts.service';
import {
  CreateAlertDto,
  ListAlertsQuery,
  UpdateAlertDto,
} from './alerts.dto';

/**
 * AlertsController — POS_ALRT_SCR (تنبيهات الدخول). Admin/supervisor manage
 * notes; every signed-in user pulls /alerts/pending at login and acknowledges
 * what they've seen (shown once per user — UNIQUE ack).
 */
@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alerts: AlertsService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Create a login alert/note' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async create(@Body() dto: CreateAlertDto, @Req() req: AuthenticatedRequest) {
    const data = await this.alerts.create({
      title: dto.title,
      body: dto.body ?? null,
      showFrom: dto.showFrom ?? null,
      showUntil: dto.showUntil ?? null,
      createdBy: req.user?.username ?? 'unknown',
    });
    return { data };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'Update an alert (title/body/active/window)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async update(@Param('id') id: string, @Body() dto: UpdateAlertDto) {
    const data = await this.alerts.update(id, {
      title: dto.title,
      body: dto.body,
      active: dto.active,
      showFrom: dto.showFrom,
      showUntil: dto.showUntil,
    });
    return { data };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({ summary: 'List all alerts (admin view)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async listAll(@Query() q: ListAlertsQuery) {
    const data = await this.alerts.listAll(q.limit ?? 50);
    return { data, meta: { count: data.length } };
  }

  @Get('pending')
  @ApiOperation({
    summary: 'Alerts the CURRENT user has not acknowledged (login popup)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async pending(@Req() req: AuthenticatedRequest, @Query() q: ListAlertsQuery) {
    const data = await this.alerts.pendingFor(
      req.user?.username ?? 'unknown',
      q.limit ?? 20,
    );
    return { data, meta: { count: data.length } };
  }

  @Post(':id/ack')
  @HttpCode(200)
  @ApiOperation({ summary: 'Acknowledge an alert (idempotent, per user)' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async ack(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    await this.alerts.acknowledge(id, req.user?.username ?? 'unknown');
    return { data: { acknowledged: true } };
  }
}
