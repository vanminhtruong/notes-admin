import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { getAdminToken } from '@utils/auth';
import adminService from './adminService';

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export function getAdminSocket(): Socket {
  if (socket && socket.connected) return socket;

  const token = getAdminToken();
  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
    auth: { token },
  });

  // Safe connect
  try {
    socket.connect();
  } catch (e) {
    // no-op
  }

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

  // Debug: listen to ALL admin events to verify they're being received
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

  // Handle permissions changed event for real-time updates
  socket?.on('permissions_changed', async (data) => {
    console.log('[AdminSocket] Permissions changed:', data);
    try {
      // Refresh token to get new permissions
      await adminService.refreshToken();
      
      // Show notification to user
      toast.success(data.message || 'Quyền hạn của bạn đã được cập nhật');
      
      // Reload the page to apply new permissions immediately
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[AdminSocket] Failed to refresh token:', error);
      toast.error('Không thể cập nhật quyền hạn. Vui lòng đăng nhập lại.');
    }
  });

  // Handle admin access revoked
  socket?.on('admin_access_revoked', (data) => {
    console.log('[AdminSocket] Admin access revoked:', data);
    toast.error(data.message || 'Quyền truy cập admin đã bị thu hồi');
    
    // Clear admin token and redirect to login
    localStorage.removeItem('adminToken');
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
  });

  // Handle admin account deactivated
  socket?.on('admin_account_deactivated', (data) => {
    console.log('[AdminSocket] Admin account deactivated:', data);
    toast.error(data.message || 'Tài khoản admin đã bị vô hiệu hóa');
    
    // Clear admin token and redirect to login
    localStorage.removeItem('adminToken');
    setTimeout(() => {
      window.location.href = '/admin/login';
    }, 2000);
  });

  // Handle specific permission revoked
  socket?.on('permission_revoked', (data) => {
    console.log('[AdminSocket] Permission revoked:', data);
    toast.warning(data.message || `Quyền "${data.permission}" đã bị thu hồi`);
    
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

  return socket;
}

export function closeAdminSocket() {
  try {
    socket?.off();
    socket?.disconnect();
  } catch {}
  socket = null;
}
