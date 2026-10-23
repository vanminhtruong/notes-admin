let revision = 0;
const listeners = new Set<() => void>();

export function notifyAdminPermissionsChanged() {
  revision++;
  listeners.forEach(listener => listener());
}

export function subscribeAdminPermissions(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export const getAdminPermissionsRevision = () => revision;
