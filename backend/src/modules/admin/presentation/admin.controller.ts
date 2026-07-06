import { createReadStream } from 'node:fs';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
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
import { BackupService } from '../application/backup.service';
import { BackupsQuery, SessionsQuery } from './admin.query';
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
    private readonly backup: BackupService,
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

  //==========================================================================
  // Data backup (POSS003 النسخ الاحتياطية)
  //==========================================================================

  @Post('backups')
  @HttpCode(201)
  @ApiOperation({
    summary:
      'Take a data backup now — exports the MOTECH_POS write schema (JSON). ERP is never touched. Admin only.',
  })
  @ApiOkResponse({ description: 'Envelope { data: BackupRun, meta }' })
  async createBackup(@Req() req: AuthenticatedRequest) {
    const createdBy = req.user?.sub != null ? String(req.user.sub) : null;
    const { run, skipped } = await this.backup.runBackup('MANUAL', createdBy);
    return { data: run, meta: { skipped: skipped ?? false } };
  }

  @Get('backups')
  @ApiOperation({
    summary: 'List past backup runs (MOTECH_POS.BACKUP_RUNS, newest first)',
  })
  @ApiOkResponse({ description: 'Envelope { data: BackupRun[], meta }' })
  async backups(@Query() q: BackupsQuery) {
    const data = await this.backup.listRuns(q.limit ?? 50);
    return { data, meta: { count: data.length } };
  }

  @Get('backups/:id/download')
  @Header('Content-Type', 'application/json; charset=utf-8')
  @ApiOperation({
    summary: 'Download a backup snapshot file (JSON) by run id — admin only',
  })
  @ApiOkResponse({ description: 'application/json snapshot body' })
  async downloadBackup(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { filePath, fileName } = await this.backup.getDownload(id);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );
    return new StreamableFile(createReadStream(filePath));
  }
}
