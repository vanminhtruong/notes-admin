// Simple event-bus for Admin realtime events
export type AdminEventMap = {
  admin_dm_message_reacted: { messageId: number; userId: number; type: string; count?: number; user?: { id: number; name?: string; avatar?: string | null } };
  admin_dm_message_unreacted: { messageId: number; userId: number; type?: string };
  admin_group_message_reacted: { groupId: number; messageId: number; userId: number; type: string; count?: number; user?: { id: number; name?: string; avatar?: string | null } };
  admin_group_message_unreacted: { groupId: number; messageId: number; userId: number; type?: string };
};

export type AdminEventKey = keyof AdminEventMap;

const listeners: { [K in AdminEventKey]?: Array<(payload: AdminEventMap[K]) => void> } = {} as any;

export function onAdminEvent<K extends AdminEventKey>(event: K, cb: (payload: AdminEventMap[K]) => void) {
  if (!listeners[event]) listeners[event] = [] as any;
  listeners[event]!.push(cb as any);
  return () => offAdminEvent(event, cb);
}

export function offAdminEvent<K extends AdminEventKey>(event: K, cb: (payload: AdminEventMap[K]) => void) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event]!.filter(fn => fn !== cb) as any;
}

export function emitAdminEvent<K extends AdminEventKey>(event: K, payload: AdminEventMap[K]) {
  if (!listeners[event]) return;
  for (const fn of listeners[event]!) {
    try { fn(payload as any); } catch {}
  }
}
