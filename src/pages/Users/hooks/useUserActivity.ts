import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import type { User, UserActivityData, TypingInfo } from '../interfaces';

export const useUserActivity = () => {
  const { t } = useTranslation('users');
  const { userId } = useParams<{ userId: string }>();
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'groups' | 'friends' | 'notifications' | 'monitor'>('messages');
  const [typingInfo, setTypingInfo] = useState<TypingInfo | null>(null);
  const typingTimerRef = useRef<number | null>(null);

  // Users list state
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedUserId) {
      loadUserActivity(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (userId) {
      setSelectedUserId(parseInt(userId));
    }
  }, [userId]);

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  // Clear typing info when switching user
  useEffect(() => {
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setTypingInfo(null);
  }, [selectedUserId]);

  const loadUserActivity = useCallback(async (id: number, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await adminService.getUserActivity(id);
      setActivityData(response);
    } catch (error) {
      console.error('Error loading user activity:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const response = await adminService.getAllUsers({
        search: searchTerm || undefined,
        limit: 20
      });
      setUsers(response.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      let errorMessage = t('userActivity.errors.cannotLoadUsers');
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 500) {
        errorMessage = t('userActivity.errors.serverError');
      }
      
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Realtime: listen typing info for selected user and their counterpart (both directions)
  useEffect(() => {
    if (!selectedUserId) return;
    const s = getAdminSocket();

    const onAdminTyping = (p: any) => {
      try {
        if (!p) return;
        // Hỗ trợ cả 2 chiều: nếu user đang theo dõi gõ (p.userId === selectedUserId)
        // hoặc bạn chat đang gõ với user đang theo dõi (p.withUserId === selectedUserId)
        const a = Number(selectedUserId);
        const userIdNum = Number(p.userId);
        const withUserIdNum = Number(p.withUserId);
        const relevant = userIdNum === a || withUserIdNum === a;
        if (!relevant) return;

        // Xác định "đối phương" để hiển thị trong typing bubble
        const otherId = userIdNum === a ? withUserIdNum : userIdNum;
        const otherName = userIdNum === a ? (p.withUserName || String(withUserIdNum)) : (p.userName || p.name || String(userIdNum));

        if (p.isTyping) {
          setTypingInfo({ withUserId: otherId, withUserName: otherName });
          if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
          // Auto-clear after 5s of inactivity to avoid stale state
          typingTimerRef.current = window.setTimeout(() => setTypingInfo(null), 5000);
        } else {
          setTypingInfo(prev => (prev && prev.withUserId === otherId ? null : prev));
        }
      } catch {}
    };
    s.on('admin_user_typing', onAdminTyping);

    const shouldReloadDM = (p: any) => p && (p.senderId === selectedUserId || p.receiverId === selectedUserId);
    const shouldReloadByUserId = (p: any) => p && p.userId === selectedUserId;
    const shouldReloadGroup = (p: any) => p && p.senderId === selectedUserId;

    const reload = () => loadUserActivity(selectedUserId, false);

    const onDmCreated = (p: any) => { if (shouldReloadDM(p)) reload(); };
    const onDmEdited = (p: any) => { if (shouldReloadDM(p)) reload(); };
    const onDmRecalledAll = (p: any) => { if (shouldReloadDM(p)) reload(); };
    const onDmDeletedAll = (p: any) => { if (shouldReloadDM(p)) reload(); };
    const onDmDeletedForUser = (p: any) => { if (shouldReloadDM(p)) reload(); };
    const onGroupCreated = (p: any) => { if (shouldReloadGroup(p)) reload(); };
    const onGroupEdited = (p: any) => { if (shouldReloadGroup(p)) reload(); };
    const onUserOnline = (p: any) => { if (shouldReloadByUserId(p)) reload(); };
    const onUserOffline = (p: any) => { if (shouldReloadByUserId(p)) reload(); };

    // Admin: listen for user actions (recall/delete messages)
    const onAdminMessagesRecalled = (p: any) => {
      if (p && (p.senderId === selectedUserId || p.receiverId === selectedUserId)) {
        reload();
      }
    };

    const onAdminMessagesDeleted = (p: any) => {
      if (p && (p.senderId === selectedUserId || p.receiverId === selectedUserId)) {
        reload();
      }
    };

    s.on('admin_dm_created', onDmCreated);
    s.on('admin_dm_edited', onDmEdited);
    s.on('admin_dm_recalled_all', onDmRecalledAll);
    s.on('admin_dm_deleted_all', onDmDeletedAll);
    s.on('admin_dm_deleted_for_user', onDmDeletedForUser);
    s.on('admin_group_message_created', onGroupCreated);
    s.on('admin_group_message_edited', onGroupEdited);
    s.on('admin_user_online', onUserOnline);
    s.on('admin_user_offline', onUserOffline);
    s.on('admin_messages_recalled', onAdminMessagesRecalled);
    s.on('admin_messages_deleted', onAdminMessagesDeleted);

    // When user's profile is updated, if it's the selected user, refresh activity or merge basic fields
    const onAdminUserUpdated = (p: any) => {
      try {
        const updated = p?.user;
        if (!updated || updated.id !== selectedUserId) return;
        // Lightweight merge to update header quickly
        setActivityData(prev => prev ? ({
          ...prev,
          user: {
            ...prev.user,
            name: updated.name ?? prev.user.name,
            avatar: updated.avatar ?? prev.user.avatar,
            phone: updated.phone ?? prev.user.phone,
            birthDate: updated.birthDate ?? prev.user.birthDate,
            gender: updated.gender ?? prev.user.gender,
            email: updated.email ?? prev.user.email,
          }
        }) : prev);
        // Optionally reload to keep consistency across tabs
        loadUserActivity(selectedUserId, false);
      } catch {}
    };
    s.on('admin_user_updated', onAdminUserUpdated);

    return () => {
      try {
        s.off('admin_user_typing', onAdminTyping);
        s.off('admin_dm_created', onDmCreated);
        s.off('admin_dm_edited', onDmEdited);
        s.off('admin_dm_recalled_all', onDmRecalledAll);
        s.off('admin_dm_deleted_all', onDmDeletedAll);
        s.off('admin_dm_deleted_for_user', onDmDeletedForUser);
        s.off('admin_group_message_created', onGroupCreated);
        s.off('admin_group_message_edited', onGroupEdited);
        s.off('admin_user_online', onUserOnline);
        s.off('admin_user_offline', onUserOffline);
        s.off('admin_messages_recalled', onAdminMessagesRecalled);
        s.off('admin_messages_deleted', onAdminMessagesDeleted);
        s.off('admin_user_updated', onAdminUserUpdated);
        if (typingTimerRef.current) {
          window.clearTimeout(typingTimerRef.current);
          typingTimerRef.current = null;
        }
      } catch {}
    };
  }, [selectedUserId, loadUserActivity]);

  return {
    activityData,
    loading,
    selectedUserId,
    setSelectedUserId,
    activeTab,
    setActiveTab,
    typingInfo,
    users,
    searchTerm,
    setSearchTerm,
    loadingUsers,
    error,
    loadUsers,
    loadUserActivity,
    formatDate,
    t
  };
};
