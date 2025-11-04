import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import i18next from 'i18next';
import { getAdminToken, getAdminFromToken, removeAdminToken, setAdminPermissionOverride } from '@utils/auth';
import adminService from './adminService';
import { emitAdminEvent } from './adminEvents';

let socket: Socket | null = null;
let listenersRegistered = false; // Guard để tránh đăng ký listener nhiều lần
let currentAdminId: number | null = null; // Lưu id admin hiện tại để xử lý self events
// Dedupe các sự kiện để không toast nhiều lần trong thời gian ngắn (HMR hoặc multi-mount)
const recentEvents = new Map<string, number>();
function shouldToastOnce(key: string, dedupeMs = 3000): boolean {
  const now = Date.now();
  // Dọn rác các key cũ
  for (const [k, ts] of recentEvents) {
    if (now - ts > dedupeMs) recentEvents.delete(k);
  }
  if (recentEvents.has(key)) return false;
  recentEvents.set(key, now);
  return true;
}

// Logout helper: xóa token, reset override, đóng socket và chuyển hướng ngay lập tức
function forceLogoutImmediately() {
  try { removeAdminToken(); } catch {}
  try { setAdminPermissionOverride(null as any); } catch {}
  try { closeAdminSocket(); } catch {}
  try { window.location.replace('/login?forced=1'); } catch { window.location.href = '/login?forced=1'; }
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function getAdminSocket(): Socket {
  // Nếu đã có socket, đảm bảo kết nối và trả về, KHÔNG đăng ký listener lại
  if (socket) {
    if (!socket.connected) {
      try { socket.connect(); } catch {}
    }
    return socket;
  }

  const token = getAdminToken();
  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
    auth: { token },
  });

  // Safe connect
  try { socket.connect(); } catch {}

  if (!listenersRegistered) {
    listenersRegistered = true;

    // Thiết lập currentAdminId đồng bộ từ token để nhận diện self-case ngay lập tức
    if (token) {
      try {
        const info = getAdminFromToken(token as string);
        if (info?.id) currentAdminId = info.id as unknown as number;
        else if ((info as any)?.userId) currentAdminId = (info as any).userId as number;
      } catch {}
    }

    // Debug logs for troubleshooting
    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('[AdminSocket] CONNECTED with ID:', socket?.id);
    });

    // Handle admin status changed (global) -> nếu chính mình bị vô hiệu hóa thì đăng xuất NGAY
    socket.on('admin_status_changed', (data: any) => {
      try {
        const eventKey = `admin_status_changed:${data?.timestamp || ''}:${data?.adminId || ''}`;
        const canToast = shouldToastOnce(eventKey);

        // Xác định self từ biến đã lưu, nếu chưa có thì decode token tại chỗ
        let selfId = currentAdminId;
        if (selfId == null) {
          const t = getAdminToken();
          if (t) {
            const info = getAdminFromToken(t);
            selfId = (info as any)?.id ?? (info as any)?.userId ?? null;
          }
        }
        const isSelf = selfId != null && data?.adminId == selfId;
        if (isSelf && data?.isActive === false) {
          if (canToast) {
            const msg = i18next.t('admins:messages.adminAccountDeactivated');
            toast.error(msg);
          }
          forceLogoutImmediately();
          return;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[AdminSocket] Error handling admin_status_changed', e);
      }
    });
    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log('[AdminSocket] DISCONNECTED reason:', reason);
    });
    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[AdminSocket] CONNECT_ERROR:', err.message);
    });

    // Lấy admin hiện tại để nhận diện self events
    if (currentAdminId == null) {
      try {
        // Không chặn luồng nếu lỗi
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        adminService.getMyPermissions().then((res: any) => {
          currentAdminId = res?.admin?.id ?? null;
        }).catch(() => {});
      } catch {}
    }

    // Debug: listen to ALL admin events to verify they're being received (only once)
    const adminEvents = [
      'admin_dm_created', 'admin_dm_edited', 'admin_dm_recalled_all', 'admin_dm_deleted_for_user',
      'admin_group_message_created', 'admin_group_message_edited',
      'admin_user_online', 'admin_user_offline', 'admin_user_typing', 'admin_group_typing', 'admin_group_message_created',
      'note_created_by_admin', 'note_updated_by_admin', 'note_deleted_by_admin',
      'user_note_created', 'user_note_updated', 'user_note_deleted', 'user_note_archived',
      // Admin message management events
      'message_recalled_by_admin', 'message_deleted_by_admin', 'group_message_recalled_by_admin', 'group_message_deleted_by_admin',
      // Admin permissions management events
      'admin_created', 'admin_permissions_updated', 'admin_permission_revoked', 
      'admin_status_changed', 'admin_removed', 'permissions_changed', 'permission_revoked',
      'admin_access_revoked', 'admin_account_deactivated',
      // New: status events for monitoring
      'admin_message_delivered', 'admin_message_read', 'admin_group_message_delivered', 'admin_group_message_read',
      // User management events
      'user_registered', 'user_status_changed', 'user_deleted_permanently'
    ];
    adminEvents.forEach(event => {
      socket?.on(event, (data) => {
        // eslint-disable-next-line no-console
        console.log(`[AdminSocket] RECEIVED EVENT: ${event}`, data);
      });
    });

    // Reactions (DM)
    socket.on('admin_dm_message_reacted', (payload) => {
      emitAdminEvent('admin_dm_message_reacted', payload);
    });
    socket.on('admin_dm_message_unreacted', (payload) => {
      emitAdminEvent('admin_dm_message_unreacted', payload);
    });
    // Reactions (Group)
    socket.on('admin_group_message_reacted', (payload) => {
      emitAdminEvent('admin_group_message_reacted', payload);
    });
    socket.on('admin_group_message_unreacted', (payload) => {
      emitAdminEvent('admin_group_message_unreacted', payload);
    });

    // Handle permissions changed event for real-time updates
    socket.on('permissions_changed', async (data) => {
      console.log('[AdminSocket] Permissions changed:', data);
      // Dedupe theo timestamp (server gửi kèm), fallback theo thời gian hiện tại và payload hash
      const eventKey = `permissions_changed:${data?.timestamp || ''}`;
      if (!shouldToastOnce(eventKey)) return;
      try {
        // Refresh token to get new permissions
        await adminService.refreshToken();
        
        // Show notification to user with i18n
        const msg = i18next.t('admins:messages.permissionsChanged');
        toast.success(msg);
        
        // Reload the page to apply new permissions immediately
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('[AdminSocket] Failed to refresh token:', error);
        toast.error(i18next.t('admins:messages.permissionsChangedError'));
      }
    });

    // Handle admin access revoked
    socket.on('admin_access_revoked', (data) => {
      console.log('[AdminSocket] Admin access revoked:', data);
      const eventKey = `admin_access_revoked:${data?.timestamp || ''}`;
      const canToast = shouldToastOnce(eventKey);
      const msg = i18next.t('admins:messages.adminAccessRevoked');
      if (canToast) toast.error(msg);
      forceLogoutImmediately();
    });

    // Handle admin account deactivated
    socket.on('admin_account_deactivated', (data) => {
      console.log('[AdminSocket] Admin account deactivated:', data);
      const eventKey = `admin_account_deactivated:${data?.timestamp || ''}`;
      const canToast = shouldToastOnce(eventKey);
      const msg = i18next.t('admins:messages.adminAccountDeactivated');
      if (canToast) toast.error(msg);
      forceLogoutImmediately();
    });

    // Handle specific permission revoked
    socket.on('permission_revoked', (data) => {
      console.log('[AdminSocket] Permission revoked:', data);
      const eventKey = `permission_revoked:${data?.timestamp || ''}:${data?.permission || ''}`;
      if (!shouldToastOnce(eventKey)) return;
      const msg = i18next.t('admins:messages.permissionRevokedGeneric', { permission: data.permission });
      toast.warning(msg);
      
      // Refresh token and reload page
      setTimeout(async () => {
        try {
          await adminService.refreshToken();
          window.location.reload();
        } catch (error) {
          console.error('[AdminSocket] Failed to refresh after permission revocation:', error);
        }
      }, 1000);
    });
  }

  return socket;
}

export function closeAdminSocket() {
  try {
    socket?.off();
    socket?.disconnect();
  } catch {}
  socket = null;
  listenersRegistered = false;
}
