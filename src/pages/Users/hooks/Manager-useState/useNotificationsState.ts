import { useState } from 'react';
import type { AdminNotification } from '../../interfaces';

export const useNotificationsState = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  return {
    notifications,
    setNotifications,
    loadingNotifications,
    setLoadingNotifications,
    unreadNotificationsCount,
    setUnreadNotificationsCount
  };
};
