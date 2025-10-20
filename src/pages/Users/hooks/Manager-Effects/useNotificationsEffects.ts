import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';

interface UseNotificationsEffectsProps {
  selectedUserId: number | null;
  setUnreadNotificationsCount: (count: number | ((prev: number) => number)) => void;
  loadNotifications: (id: number, showLoading?: boolean) => void;
}

export const useNotificationsEffects = ({
  selectedUserId,
  setUnreadNotificationsCount,
  loadNotifications
}: UseNotificationsEffectsProps) => {
  // Load notifications when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      loadNotifications(selectedUserId);
      setUnreadNotificationsCount(0);
    }
  }, [selectedUserId, loadNotifications, setUnreadNotificationsCount]);

  // Realtime notifications
  useEffect(() => {
    if (!selectedUserId) return;
    const s = getAdminSocket();

    const onAdminNotificationCreated = (p: any) => {
      try {
        if (!p) return;
        if (Number(p.userId) !== Number(selectedUserId)) return;
        loadNotifications(selectedUserId, false);
        setUnreadNotificationsCount(prev => prev + 1);
      } catch {}
    };

    const onAdminNotificationsMarkedAllRead = (p: any) => {
      try {
        if (!p) return;
        if (Number(p.userId) !== Number(selectedUserId)) return;
        loadNotifications(selectedUserId, false);
        setUnreadNotificationsCount(0);
      } catch {}
    };

    s.on('admin_notification_created', onAdminNotificationCreated);
    s.on('admin_notifications_marked_all_read', onAdminNotificationsMarkedAllRead);
    
    const onAdminNotificationDeleted = (p: any) => {
      try {
        if (!p) return;
        if (Number(p.userId) !== Number(selectedUserId)) return;
        loadNotifications(selectedUserId, false);
      } catch {}
    };
    s.on('admin_notification_deleted', onAdminNotificationDeleted);

    const onAdminNotificationsCleared = (p: any) => {
      try {
        if (!p) return;
        if (Number(p.userId) !== Number(selectedUserId)) return;
        loadNotifications(selectedUserId, false);
        setUnreadNotificationsCount(0);
      } catch {}
    };
    s.on('admin_notifications_cleared', onAdminNotificationsCleared);

    return () => {
      try {
        s.off('admin_notification_created', onAdminNotificationCreated);
        s.off('admin_notifications_marked_all_read', onAdminNotificationsMarkedAllRead);
        s.off('admin_notification_deleted', onAdminNotificationDeleted);
        s.off('admin_notifications_cleared', onAdminNotificationsCleared);
      } catch {}
    };
  }, [selectedUserId, loadNotifications, setUnreadNotificationsCount]);
};
