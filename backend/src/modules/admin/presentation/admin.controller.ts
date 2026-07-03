import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
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
import { AuthenticatedRequest, JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { AdminService } from '../application/admin.service';
import { AdminWriteService } from '../application/admin-write.service';
import { SessionsQuery } from './admin.query';
import {
  CreateAdminMachineDto,
  CreateAdminUserDto,
  isKnownPermission,
  SetUserStatusDto,
  UpdateAdminMachineDto,
  UpdateAdminUserDto,
  UpdatePermissionsDto,
} from './admin-write.dto';

/**
 * AdminController — administration endpoints (machines, users, login history,
 * role permissions). ADMIN-ONLY via RBAC (JwtAuthGuard + RolesGuard). RFC 9457
 * errors via the global filter. Envelope shape { data, meta }.
 *
 * READS come from the live ERP (YSPOS23 / IAS202623) through the
 * least-privilege MOTECH_RO connection, MERGED with local MOTECH_POS overlays.
 * WRITES (create/edit users & machines, permission matrix) land ONLY in
 * MOTECH_POS (USERS_OVERLAY / MACHINES_OVERLAY / ROLE_PERMISSIONS) — the live
 * ERP is never mutated.
 */
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly admin: AdminService,
    private readonly writes: AdminWriteService,
  ) {}

  //==========================================================================
  // Machines (POST009)
  //==========================================================================

  @Get('machines')
  @ApiOperation({
    summary: 'POS cashier machines + status (IAS_POS_MACHINE merged with overlay)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async machines() {
    const data = await this.writes.listMergedMachines();
    return { data, meta: { count: data.length } };
  }

  @Post('machines')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Add a cashier machine (LOCAL overlay in MOTECH_POS) — admin only',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async createMachine(@Body() dto: CreateAdminMachineDto) {
    const data = await this.writes.createMachine(dto);
    return { data, meta: { origin: data.origin } };
  }

  @Put('machines/:no')
  @ApiOperation({
    summary: 'Edit a cashier machine (overlay of ERP/local row) — admin only',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async updateMachine(
    @Param('no', ParseIntPipe) no: number,
    @Body() dto: UpdateAdminMachineDto,
  ) {
    const data = await this.writes.updateMachine(no, dto);
    return { data, meta: { origin: data.origin } };
  }

  //==========================================================================
  // Users (POSI011)
  //==========================================================================

  @Get('users')
  @ApiOperation({
    summary: 'System users (USER_R merged with local overlay, Arabic names)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async users() {
    const data = await this.writes.listMergedUsers();
    return { data, meta: { count: data.length } };
  }

  @Post('users')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Create a POS user (LOCAL overlay in MOTECH_POS) — admin only',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async createUser(@Body() dto: CreateAdminUserDto) {
    const data = await this.writes.createUser(dto);
    return { data, meta: { origin: data.origin } };
  }

  @Put('users/:id')
  @ApiOperation({
    summary: 'Edit a POS user (overlay of ERP/local row) — admin only',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminUserDto,
  ) {
    const data = await this.writes.updateUser(id, dto);
    return { data, meta: { origin: data.origin } };
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: 'Enable/disable a POS user — admin only' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async setUserStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetUserStatusDto,
  ) {
    const data = await this.writes.setUserStatus(id, dto.active);
    return { data, meta: { active: dto.active } };
  }

  //==========================================================================
  // Sessions (login history)
  //==========================================================================

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

  //==========================================================================
  // Role permissions (fine-grained RBAC matrix)
  //==========================================================================

  @Get('permissions')
  @ApiOperation({
    summary: 'Role → action permission matrix (MOTECH_POS.ROLE_PERMISSIONS)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async permissions() {
    const data = await this.writes.listPermissions();
    return { data, meta: { count: data.length } };
  }

  @Put('permissions')
  @ApiOperation({
    summary: 'Update role permissions (MERGE into ROLE_PERMISSIONS) — admin only',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta } with refreshed matrix' })
  async setPermissions(
    @Body() dto: UpdatePermissionsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const unknown = dto.entries
      .map((e) => e.permission)
      .filter((p) => !isKnownPermission(p));
    if (unknown.length > 0) {
      throw new BadRequestException(
        `Unknown permission code(s): ${unknown.join(', ')}`,
      );
    }
    const updatedBy = req.user?.sub ?? null;
    const { applied, matrix } = await this.writes.setPermissions(
      dto.entries,
      updatedBy,
    );
    return { data: matrix, meta: { applied, count: matrix.length } };
  }
}
