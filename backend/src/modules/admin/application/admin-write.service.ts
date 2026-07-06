import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminRepository,
  ADMIN_REPOSITORY,
  MachineRow,
  UserRow,
} from '../domain/ports/admin-repository.port';
import {
  AdminWriteRepository,
  ADMIN_WRITE_REPOSITORY,
  MachineOverlayRow,
  RolePermission,
  UserOverlayRow,
} from '../domain/ports/admin-write-repository.port';
import { PermissionsService } from '../../auth/application/permissions.service';

/** A user as surfaced by the admin API: ERP row merged with local overlay. */
export interface MergedUser extends UserRow {
  origin: 'ERP' | 'LOCAL' | 'EDIT';
  role: string | null;
  authUsername: string | null;
}

/** A machine as surfaced by the admin API: ERP row merged with local overlay. */
export interface MergedMachine extends MachineRow {
  origin: 'ERP' | 'LOCAL' | 'EDIT';
  currency: string | null;
}

export interface CreateUserInput {
  userId?: number;
  arName?: string;
  enName?: string;
  code?: string;
  role: 'cashier' | 'supervisor' | 'admin';
  email?: string;
  authUsername?: string;
  inactive?: boolean;
}

export type UpdateUserInput = Partial<Omit<CreateUserInput, 'userId'>>;

export interface CreateMachineInput {
  machineNo: number;
  terminal?: string;
  branchNo?: number;
  warehouse?: number;
  ipAddress?: string;
  priceLevel?: number;
  useVat?: boolean;
  currency?: string;
  inactive?: boolean;
}

export type UpdateMachineInput = Partial<Omit<CreateMachineInput, 'machineNo'>>;

/**
 * AdminWriteService — WRITE-side administration (users/machines overlays +
 * role permissions). All mutations land in MOTECH_POS only; the live ERP
 * (YSPOS23 / IAS202623) is read-only. Reads MERGE the ERP master with the
 * local overlay (overlay wins for edited fields; overlay-only rows surface
 * as LOCAL). Admin-only via RBAC at the controller.
 */
@Injectable()
export class AdminWriteService {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly reads: AdminRepository,
    @Inject(ADMIN_WRITE_REPOSITORY)
    private readonly writes: AdminWriteRepository,
    private readonly permissions: PermissionsService,
  ) {}

  //==========================================================================
  // Users
  //==========================================================================

  private mergeUser(erp: UserRow | null, ov: UserOverlayRow): MergedUser {
    return {
      userId: ov.userId,
      arabicName: ov.arName ?? erp?.arabicName ?? null,
      englishName: ov.enName ?? erp?.englishName ?? null,
      code: ov.code ?? erp?.code ?? null,
      inactive: ov.inactive,
      isAdmin: ov.role === 'admin' || (erp?.isAdmin ?? false),
      userType: erp?.userType ?? null,
      loggedOn: erp?.loggedOn ?? false,
      locked: erp?.locked ?? false,
      email: ov.email ?? erp?.email ?? null,
      origin: ov.origin,
      role: ov.role,
      authUsername: ov.authUsername,
    };
  }

  /** ERP users + local overlays merged (overlay wins; LOCAL rows appended). */
  async listMergedUsers(): Promise<MergedUser[]> {
    const [erp, overlays] = await Promise.all([
      this.reads.listUsers(),
      this.writes.listUserOverlays(),
    ]);
    const byId = new Map<number, UserRow>(erp.map((u) => [u.userId, u]));
    const overlayIds = new Set(overlays.map((o) => o.userId));
    const merged: MergedUser[] = [];
    for (const u of erp) {
      if (!overlayIds.has(u.userId)) {
        merged.push({ ...u, origin: 'ERP', role: null, authUsername: null });
      }
    }
    for (const o of overlays) {
      merged.push(this.mergeUser(byId.get(o.userId) ?? null, o));
    }
    merged.sort((a, b) => a.userId - b.userId);
    return merged;
  }

  /** Create a POS user (local overlay row; ERP untouched). */
  async createUser(input: CreateUserInput): Promise<MergedUser> {
    const erp = await this.reads.listUsers();
    let userId = input.userId;
    if (userId != null) {
      const existsOverlay = await this.writes.getUserOverlay(userId);
      if (existsOverlay) {
        throw new ConflictException(`User ${userId} already exists (overlay)`);
      }
      if (erp.some((u) => u.userId === userId)) {
        throw new ConflictException(
          `User ${userId} already exists in the ERP — use PUT to edit`,
        );
      }
    } else {
      userId = await this.writes.nextLocalUserId();
    }
    const row = await this.writes.upsertUserOverlay({
      userId,
      origin: 'LOCAL',
      arName: input.arName ?? null,
      enName: input.enName ?? null,
      code: input.code ?? null,
      role: input.role,
      email: input.email ?? null,
      authUsername: input.authUsername ?? null,
      inactive: input.inactive ?? false,
    });
    return this.mergeUser(null, row);
  }

  /** Edit a POS user (overlay of an ERP user, or a local user). */
  async updateUser(userId: number, input: UpdateUserInput): Promise<MergedUser> {
    const erp = await this.reads.listUsers();
    const erpRow = erp.find((u) => u.userId === userId) ?? null;
    const overlay = await this.writes.getUserOverlay(userId);
    if (!erpRow && !overlay) {
      throw new NotFoundException(`User ${userId} not found`);
    }
    const row = await this.writes.upsertUserOverlay({
      userId,
      origin: overlay?.origin ?? (erpRow ? 'EDIT' : 'LOCAL'),
      arName: input.arName,
      enName: input.enName,
      code: input.code,
      role: input.role,
      email: input.email,
      authUsername: input.authUsername,
      inactive: input.inactive,
    });
    return this.mergeUser(erpRow, row);
  }

  /** Enable/disable a POS user (overlay INACTIVE flag). */
  async setUserStatus(userId: number, active: boolean): Promise<MergedUser> {
    return this.updateUser(userId, { inactive: !active });
  }

  //==========================================================================
  // Machines
  //==========================================================================

  private mergeMachine(
    erp: MachineRow | null,
    ov: MachineOverlayRow,
  ): MergedMachine {
    return {
      machineNo: ov.machineNo,
      terminal: ov.terminal ?? erp?.terminal ?? null,
      inactive: ov.inactive,
      defWarehouse: ov.warehouse ?? erp?.defWarehouse ?? null,
      defBranch: ov.branchNo ?? erp?.defBranch ?? null,
      ipAddress: ov.ipAddress ?? erp?.ipAddress ?? null,
      lastBillDate: erp?.lastBillDate ?? null,
      useVat: ov.useVat ?? erp?.useVat ?? false,
      priceLevel: ov.priceLevel ?? erp?.priceLevel ?? null,
      origin: ov.origin,
      currency: ov.currency,
    };
  }

  /** ERP machines + local overlays merged. */
  async listMergedMachines(): Promise<MergedMachine[]> {
    const [erp, overlays] = await Promise.all([
      this.reads.listMachines(),
      this.writes.listMachineOverlays(),
    ]);
    const byNo = new Map<number, MachineRow>(erp.map((m) => [m.machineNo, m]));
    const overlayNos = new Set(overlays.map((o) => o.machineNo));
    const merged: MergedMachine[] = [];
    for (const m of erp) {
      if (!overlayNos.has(m.machineNo)) {
        merged.push({ ...m, origin: 'ERP', currency: null });
      }
    }
    for (const o of overlays) {
      merged.push(this.mergeMachine(byNo.get(o.machineNo) ?? null, o));
    }
    merged.sort((a, b) => a.machineNo - b.machineNo);
    return merged;
  }

  /** Add a cashier machine (local overlay row; ERP untouched). */
  async createMachine(input: CreateMachineInput): Promise<MergedMachine> {
    const erp = await this.reads.listMachines();
    if (erp.some((m) => m.machineNo === input.machineNo)) {
      throw new ConflictException(
        `Machine ${input.machineNo} already exists in the ERP — use PUT to edit`,
      );
    }
    const existing = await this.writes.getMachineOverlay(input.machineNo);
    if (existing) {
      throw new ConflictException(
        `Machine ${input.machineNo} already exists (overlay)`,
      );
    }
    const row = await this.writes.upsertMachineOverlay({
      machineNo: input.machineNo,
      origin: 'LOCAL',
      terminal: input.terminal ?? null,
      branchNo: input.branchNo ?? null,
      warehouse: input.warehouse ?? null,
      ipAddress: input.ipAddress ?? null,
      priceLevel: input.priceLevel ?? null,
      useVat: input.useVat ?? null,
      currency: input.currency ?? null,
      inactive: input.inactive ?? false,
    });
    return this.mergeMachine(null, row);
  }

  /** Edit a cashier machine (overlay of an ERP machine, or a local one). */
  async updateMachine(
    machineNo: number,
    input: UpdateMachineInput,
  ): Promise<MergedMachine> {
    const erp = await this.reads.listMachines();
    const erpRow = erp.find((m) => m.machineNo === machineNo) ?? null;
    const overlay = await this.writes.getMachineOverlay(machineNo);
    if (!erpRow && !overlay) {
      throw new NotFoundException(`Machine ${machineNo} not found`);
    }
    const row = await this.writes.upsertMachineOverlay({
      machineNo,
      origin: overlay?.origin ?? (erpRow ? 'EDIT' : 'LOCAL'),
      terminal: input.terminal,
      branchNo: input.branchNo,
      warehouse: input.warehouse,
      ipAddress: input.ipAddress,
      priceLevel: input.priceLevel,
      useVat: input.useVat,
      currency: input.currency,
      inactive: input.inactive,
    });
    return this.mergeMachine(erpRow, row);
  }

  //==========================================================================
  // Role permissions
  //==========================================================================

  /** Whole role → permission matrix. */
  listPermissions(): Promise<RolePermission[]> {
    return this.writes.listPermissions();
  }

  /** Upsert permission entries; returns the refreshed matrix. */
  async setPermissions(
    entries: RolePermission[],
    updatedBy: number | null,
  ): Promise<{ applied: number; matrix: RolePermission[] }> {
    const applied = await this.writes.setPermissions(entries, updatedBy);
    // Dynamic RBAC (POSS002): clear the cached matrix so the new grants take
    // effect on the very next request instead of after the TTL expires.
    this.permissions.invalidate();
    const matrix = await this.writes.listPermissions();
    return { applied, matrix };
  }
}
