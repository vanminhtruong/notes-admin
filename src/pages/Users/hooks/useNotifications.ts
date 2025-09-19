import { useState, useEffect, useCallback } from 'react';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import type { AdminNotification } from '../interfaces';

export const useNotifications = (selectedUserId: number | null) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);

  const loadNotifications = useCallback(async (id: number, showLoading = true) => {
    try {
      if (showLoading) setLoadingNotifications(true);
      
      // Load collapsed notifications for display
      const res = await adminService.adminGetUserNotifications(id, { limit: 50, collapse: 'message_by_other' });
      const list = res?.data || res || [];
      const notificationsList = Array.isArray(list) ? list : [];
      setNotifications(notificationsList);
      
      // Load ALL unread notifications separately for accurate count
      const countRes = await adminService.adminGetUserNotifications(id, { unreadOnly: true });
      const unreadList = countRes?.data || countRes || [];
      const unreadNotifications = Array.isArray(unreadList) ? unreadList : [];
      setUnreadNotificationsCount(unreadNotifications.length);
    } catch (e) {
      setNotifications([]);
      setUnreadNotificationsCount(0);
    } finally {
      if (showLoading) setLoadingNotifications(false);
    }
  }, []);

  // Load notifications when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      loadNotifications(selectedUserId);
      // Reset unread notifications count when switching users
      setUnreadNotificationsCount(0);
    }
  }, [selectedUserId, loadNotifications]);

  // Realtime notifications
  useEffect(() => {
    if (!selectedUserId) return;
    const s = getAdminSocket();

    const onAdminNotificationCreated = (p: any) => {
      try {
        if (!p) return;
        if (Number(p.userId) !== Number(selectedUserId)) return;
        // Always reload to ensure realtime
        loadNotifications(selectedUserId, false);
        // Increment unread count for real-time badge update
        setUnreadNotificationsCount(prev => prev + 1);
      } catch {}
    };

    const onAdminNotificationsMarkedAllRead = (p: any) => {
      try {
        if (!p) return;
        if (Number(p.userId) !== Number(selectedUserId)) return;
        loadNotifications(selectedUserId, false);
        // Reset unread count when all notifications are marked as read
        setUnreadNotificationsCount(0);
      } catch {}
    };

    s.on('admin_notification_created', onAdminNotificationCreated);
    s.on('admin_notifications_marked_all_read', onAdminNotificationsMarkedAllRead);

    return () => {
      try {
        s.off('admin_notification_created', onAdminNotificationCreated);
        s.off('admin_notifications_marked_all_read', onAdminNotificationsMarkedAllRead);
      } catch {}
    };
  }, [selectedUserId, loadNotifications]);

  return {
    notifications,
    loadingNotifications,
    unreadNotificationsCount,
    loadNotifications
  };
};
