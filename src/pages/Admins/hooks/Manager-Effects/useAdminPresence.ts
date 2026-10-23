import { useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { getAdminSocket } from '@services/socket';
import type { Admin } from '../../interfaces/admin.types';

interface PresenceEvent {
  userId: number | string;
  lastSeenAt?: string;
}

export function useAdminPresence(setAdmins: Dispatch<SetStateAction<Admin[]>>, refresh: () => void) {
  const refreshRef = useRef(refresh);
  useEffect(() => { refreshRef.current = refresh; }, [refresh]);

  useEffect(() => {
    const socket = getAdminSocket();
    const update = (data: PresenceEvent, online: boolean) => {
      setAdmins(previous => previous.map(admin => admin.id === Number(data.userId)
        ? { ...admin, isOnline: admin.isActive && online, lastSeenAt: data.lastSeenAt ?? admin.lastSeenAt }
        : admin));
    };
    const onOnline = (data: PresenceEvent) => update(data, true);
    const onOffline = (data: PresenceEvent) => update(data, false);
    const onConnect = () => { refreshRef.current(); };
    const onDisconnect = () => {
      setAdmins(previous => previous.map(admin => ({ ...admin, isOnline: undefined })));
    };
    socket.on('admin_user_online', onOnline);
    socket.on('admin_user_offline', onOffline);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('admin_user_online', onOnline);
      socket.off('admin_user_offline', onOffline);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [setAdmins]);
}
