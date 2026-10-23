import { getCurrentAdminInfo, setAdminPermissionOverride } from '@utils/auth';
import type { AdminTokenPayload } from '../types/auth';

export interface LiveAdminPermissionUpdate {
  permissions?: string[];
  adminLevel?: AdminTokenPayload['adminLevel'];
  permission?: string;
}

export function applyLiveAdminPermissions(update: LiveAdminPermissionUpdate) {
  const current = getCurrentAdminInfo();
  if (!current) return;
  const previous = current.adminPermissions ?? [];
  const revoked = update.permission;
  const permissions = Array.isArray(update.permissions) ? [...update.permissions]
    : revoked ? previous.filter(permission => permission !== revoked &&
      (revoked.includes('.') || !permission.startsWith(`${revoked}.`)))
      : previous;
  setAdminPermissionOverride({ permissions, adminLevel: update.adminLevel ?? current.adminLevel });
}
