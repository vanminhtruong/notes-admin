import { useCallback } from 'react';
import adminService from '@services/adminService';
import type { AdminNotification } from '../../interfaces';

interface UseNotificationsHandlersProps {
  setNotifications: (notifications: AdminNotification[]) => void;
  setLoadingNotifications: (loading: boolean) => void;
  setUnreadNotificationsCount: (count: number) => void;
}

export const useNotificationsHandlers = ({
  setNotifications,
  setLoadingNotifications,
  setUnreadNotificationsCount
}: UseNotificationsHandlersProps) => {
  const loadNotifications = useCallback(async (id: number, showLoading = true) => {
    try {
      if (showLoading) setLoadingNotifications(true);
      
      const res = await adminService.adminGetUserNotifications(id, { limit: 200 });
      const normalize = (raw: any): AdminNotification[] => {
        if (Array.isArray(raw)) return raw as AdminNotification[];
        if (raw && Array.isArray(raw.data)) return raw.data as AdminNotification[];
        if (raw && raw.data && Array.isArray(raw.data.items)) return raw.data.items as AdminNotification[];
        if (raw && Array.isArray(raw.items)) return raw.items as AdminNotification[];
        return [] as AdminNotification[];
      };
      const notificationsList = normalize(res);
      
      const countRes = await adminService.adminGetUserNotifications(id, { unreadOnly: true });
      const unreadList = normalize(countRes);
      const unreadArr = Array.isArray(unreadList) ? unreadList : [];
      setUnreadNotificationsCount(unreadArr.length);
      
      const primaryList = Array.isArray(notificationsList) ? notificationsList : [];
      setNotifications(primaryList);
      
    } catch (e) {
      setNotifications([]);
      setUnreadNotificationsCount(0);
    } finally {
      if (showLoading) setLoadingNotifications(false);
    }
  }, [setNotifications, setLoadingNotifications, setUnreadNotificationsCount]);

  return {
    loadNotifications
  };
};
