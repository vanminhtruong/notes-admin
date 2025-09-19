import { io, Socket } from 'socket.io-client';
import { getAdminToken } from '@utils/auth';

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
    'user_note_created', 'user_note_updated', 'user_note_deleted', 'user_note_archived'
  ];
  
  adminEvents.forEach(event => {
    socket?.on(event, (data) => {
      // eslint-disable-next-line no-console
      console.log(`[AdminSocket] RECEIVED EVENT: ${event}`, data);
    });
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
