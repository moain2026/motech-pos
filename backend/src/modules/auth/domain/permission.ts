import { Role } from './user.entity';

/**
 * Permission — fine-grained action codes for the dynamic RBAC matrix
 * (POSS002 صلاحيات المستخدمين). Mirrors MOTECH_POS.ROLE_PERMISSIONS.PERMISSION
 * and the whitelist in admin-write.dto.ts (PERMISSIONS). Keeping the canonical
 * list here (domain layer) lets guards, the matrix editor, and the frontend
 * share one source of truth.
 *
 * Screen mapping (Onyx → permission):
 *   SALE           POST001 فاتورة المبيعات
 *   RETURN         POST002 مردود المبيعات
 *   DISCOUNT       خصم يدوي على البيع
 *   VOID           حذف/إلغاء سطر أو فاتورة
 *   HOLD           POST003 الفواتير المعلّقة
 *   REPORTS        POSR* التقارير
 *   SETTINGS       POSS001/005 الإعدادات
 *   SHIFT_OPEN     POST027 فتح وردية
 *   SHIFT_CLOSE    POST013/027 إقفال/تصفية الوردية
 *   PRICE_OVERRIDE تجاوز السعر المرجعي
 *   VOUCHERS       POST025/026 المقبوضات/المصروفات
 *   EINVOICE       الفوترة الإلكترونية + المزامنة (POST008)
 */
export const PERMISSION_CODES = [
  'SALE',
  'RETURN',
  'DISCOUNT',
  'VOID',
  'HOLD',
  'REPORTS',
  'SETTINGS',
  'SHIFT_OPEN',
  'SHIFT_CLOSE',
  'PRICE_OVERRIDE',
  'VOUCHERS',
  'EINVOICE',
] as const;

export type Permission = (typeof PERMISSION_CODES)[number];

export function isKnownPermission(p: string): p is Permission {
  return (PERMISSION_CODES as readonly string[]).includes(p);
}

/** One matrix cell: may `role` perform `permission`? */
export interface PermissionCell {
  role: Role;
  permission: Permission;
  allowed: boolean;
}

/**
 * Coarse fallback (used when the matrix has no explicit row for a
 * role×permission pair, or the matrix cannot be read). It mirrors the seed in
 * V013 so behaviour is unchanged when the DB is empty/unreachable: the matrix
 * can only FURTHER RESTRICT beyond these safe defaults. admin = everything.
 */
export function fallbackAllows(role: Role, permission: Permission): boolean {
  if (role === 'admin') return true;
  // Deny the sensitive actions by default for non-admins; allow the rest.
  const nonAdminDenied: Record<string, Role[]> = {
    SETTINGS: ['cashier', 'supervisor'],
    PRICE_OVERRIDE: ['cashier'],
    VOID: ['cashier'],
  };
  const denied = nonAdminDenied[permission];
  if (denied && denied.includes(role)) return false;
  return true;
}
