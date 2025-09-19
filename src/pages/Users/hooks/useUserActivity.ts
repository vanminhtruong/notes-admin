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

  // Realtime: listen typing info for selected user
  useEffect(() => {
    if (!selectedUserId) return;
    const s = getAdminSocket();

    const onAdminTyping = (p: any) => {
      try {
        if (!p || p.userId !== selectedUserId) return;
        if (p.isTyping) {
          const name = p.withUserName || String(p.withUserId);
          setTypingInfo({ withUserId: Number(p.withUserId), withUserName: name });
          if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
          // Auto-clear after 5s of inactivity to avoid stale state
          typingTimerRef.current = window.setTimeout(() => setTypingInfo(null), 5000);
        } else {
          setTypingInfo(prev => (prev && prev.withUserId === Number(p.withUserId) ? null : prev));
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
    const onDmDeletedForUser = (p: any) => { if (shouldReloadDM(p)) reload(); };
    const onGroupCreated = (p: any) => { if (shouldReloadGroup(p)) reload(); };
    const onGroupEdited = (p: any) => { if (shouldReloadGroup(p)) reload(); };
    const onUserOnline = (p: any) => { if (shouldReloadByUserId(p)) reload(); };
    const onUserOffline = (p: any) => { if (shouldReloadByUserId(p)) reload(); };

    s.on('admin_dm_created', onDmCreated);
    s.on('admin_dm_edited', onDmEdited);
    s.on('admin_dm_recalled_all', onDmRecalledAll);
    s.on('admin_dm_deleted_for_user', onDmDeletedForUser);
    s.on('admin_group_message_created', onGroupCreated);
    s.on('admin_group_message_edited', onGroupEdited);
    s.on('admin_user_online', onUserOnline);
    s.on('admin_user_offline', onUserOffline);

    return () => {
      try {
        s.off('admin_user_typing', onAdminTyping);
        s.off('admin_dm_created', onDmCreated);
        s.off('admin_dm_edited', onDmEdited);
        s.off('admin_dm_recalled_all', onDmRecalledAll);
        s.off('admin_dm_deleted_for_user', onDmDeletedForUser);
        s.off('admin_group_message_created', onGroupCreated);
        s.off('admin_group_message_edited', onGroupEdited);
        s.off('admin_user_online', onUserOnline);
        s.off('admin_user_offline', onUserOffline);
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
    formatDate,
    t
  };
};
