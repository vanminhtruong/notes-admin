import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import i18next from 'i18next';
import { getAdminToken } from '@utils/auth';
import adminService from './adminService';
import { emitAdminEvent } from './adminEvents';

let socket: Socket | null = null;
let listenersRegistered = false; // Guard để tránh đăng ký listener nhiều lần
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

    // Debug logs for troubleshooting
    socket.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('[AdminSocket] CONNECTED with ID:', socket?.id);
    });
    socket.on('disconnect', (reason) => {
      // eslint-disable-next-line no-console
      console.log('[AdminSocket] DISCONNECTED reason:', reason);
    });
    socket.on('connect_error', (err) => {
      // eslint-disable-next-line no-console
      console.error('[AdminSocket] CONNECT_ERROR:', err.message);
    });

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
      'admin_message_delivered', 'admin_message_read', 'admin_group_message_delivered', 'admin_group_message_read'
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
        const msg = i18next.t('admins:messages.permissionsChanged', { defaultValue: 'Quyền hạn của bạn đã được cập nhật' }) || data.message;
        toast.success(msg);
        
        // Reload the page to apply new permissions immediately
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error('[AdminSocket] Failed to refresh token:', error);
        toast.error(i18next.t('admins:messages.permissionsChangedError', { defaultValue: 'Không thể cập nhật quyền hạn. Vui lòng đăng nhập lại.' }));
      }
    });

    // Handle admin access revoked
    socket.on('admin_access_revoked', (data) => {
      console.log('[AdminSocket] Admin access revoked:', data);
      const eventKey = `admin_access_revoked:${data?.timestamp || ''}`;
      if (!shouldToastOnce(eventKey)) return;
      const msg = i18next.t('admins:messages.adminAccessRevoked', { defaultValue: 'Quyền truy cập admin đã bị thu hồi' }) || data.message;
      toast.error(msg);
      
      // Clear admin token and redirect to login
      localStorage.removeItem('adminToken');
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    });

    // Handle admin account deactivated
    socket.on('admin_account_deactivated', (data) => {
      console.log('[AdminSocket] Admin account deactivated:', data);
      const eventKey = `admin_account_deactivated:${data?.timestamp || ''}`;
      if (!shouldToastOnce(eventKey)) return;
      const msg = i18next.t('admins:messages.adminAccountDeactivated', { defaultValue: 'Tài khoản admin đã bị vô hiệu hóa' }) || data.message;
      toast.error(msg);
      
      // Clear admin token and redirect to login
      localStorage.removeItem('adminToken');
      setTimeout(() => {
        window.location.href = '/admin/login';
      }, 2000);
    });

    // Handle specific permission revoked
    socket.on('permission_revoked', (data) => {
      console.log('[AdminSocket] Permission revoked:', data);
      const eventKey = `permission_revoked:${data?.timestamp || ''}:${data?.permission || ''}`;
      if (!shouldToastOnce(eventKey)) return;
      const defaultMsg = i18next.t('admins:messages.permissionRevokedGeneric', { permission: data.permission, defaultValue: `Quyền "${data.permission}" đã bị thu hồi` });
      toast.warning(defaultMsg || data.message);
      
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
