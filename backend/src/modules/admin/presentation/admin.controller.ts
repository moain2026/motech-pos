import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { AdminService } from '../application/admin.service';
import { SessionsQuery } from './admin.query';

/**
 * AdminController — READ-side administration endpoints (machines, users,
 * login history). ADMIN-ONLY via RBAC (JwtAuthGuard + RolesGuard). RFC 9457
 * errors via the global filter. Envelope shape { data, meta }.
 *
 * Data is read strictly from the live ERP (YSPOS23 / IAS202623) through the
 * least-privilege MOTECH_RO connection — no writes.
 */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('machines')
  @ApiOperation({ summary: 'POS cashier machines + status (IAS_POS_MACHINE)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async machines() {
    const data = await this.admin.listMachines();
    return { data, meta: { count: data.length } };
  }

  @Get('users')
  @ApiOperation({ summary: 'System users with Arabic names (USER_R)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async users() {
    const data = await this.admin.listUsers();
    return { data, meta: { count: data.length } };
  }

  @Get('sessions')
  @ApiOperation({
    summary: 'Login/logout history (IAS_USR_LGN_HSTRY, most recent first)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async sessions(@Query() q: SessionsQuery) {
    const data = await this.admin.listSessions({
      userId: q.userId,
      limit: q.limit ?? 100,
    });
    return { data, meta: { count: data.length } };
  }
}
