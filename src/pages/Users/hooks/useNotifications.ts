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
      
      // Prefer non-collapsed list first to ensure visibility
      const res = await adminService.adminGetUserNotifications(id, { limit: 200 });
      const normalize = (raw: any): AdminNotification[] => {
        if (Array.isArray(raw)) return raw as AdminNotification[];
        if (raw && Array.isArray(raw.data)) return raw.data as AdminNotification[];
        if (raw && raw.data && Array.isArray(raw.data.items)) return raw.data.items as AdminNotification[];
        if (raw && Array.isArray(raw.items)) return raw.items as AdminNotification[];
        return [] as AdminNotification[];
      };
      const notificationsList = normalize(res);
      // Load ALL unread notifications separately for accurate count
      const countRes = await adminService.adminGetUserNotifications(id, { unreadOnly: true });
      const unreadList = normalize(countRes);
      const unreadArr = Array.isArray(unreadList) ? unreadList : [];
      setUnreadNotificationsCount(unreadArr.length);
      // Luôn hiển thị danh sách chính (không-collapsed). Không override bằng danh sách unread-only để tránh hiện lại thông báo đã xóa.
      const primaryList = Array.isArray(notificationsList) ? notificationsList : [];
      setNotifications(primaryList);
      
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
    const onAdminNotificationDeleted = (p: any) => {
      try {
        if (!p) return;
        if (Number(p.userId) !== Number(selectedUserId)) return;
        // Reload to reflect deletion in UI and count
        loadNotifications(selectedUserId, false);
      } catch {}
    };
    s.on('admin_notification_deleted', onAdminNotificationDeleted);

    return () => {
      try {
        s.off('admin_notification_created', onAdminNotificationCreated);
        s.off('admin_notifications_marked_all_read', onAdminNotificationsMarkedAllRead);
        s.off('admin_notification_deleted', onAdminNotificationDeleted);
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
