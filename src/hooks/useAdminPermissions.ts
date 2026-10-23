import { useSyncExternalStore } from 'react';
import { getAdminPermissionsRevision, subscribeAdminPermissions } from '@utils/adminPermissionStore';

// Subscribe in place: existing components and form state stay mounted.
export function useAdminPermissions() {
  return useSyncExternalStore(subscribeAdminPermissions, getAdminPermissionsRevision, getAdminPermissionsRevision);
}
