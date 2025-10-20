import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';
import type { UserActivityData, TypingInfo } from '../../interfaces';

interface UseUserActivityEffectsProps {
  selectedUserId: number | null;
  searchTerm: string;
  userId?: string;
  setSelectedUserId: (id: number | null) => void;
  setTypingInfo: (info: TypingInfo | null | ((prev: TypingInfo | null) => TypingInfo | null)) => void;
  setActivityData: (data: UserActivityData | null | ((prev: UserActivityData | null) => UserActivityData | null)) => void;
  typingTimerRef: React.MutableRefObject<number | null>;
  loadUserActivity: (id: number, showLoading?: boolean) => void;
  loadUsers: () => void;
}

export const useUserActivityEffects = ({
  selectedUserId,
  searchTerm,
  userId,
  setSelectedUserId,
  setTypingInfo,
  setActivityData,
  typingTimerRef,
  loadUserActivity,
  loadUsers
}: UseUserActivityEffectsProps) => {
  // Load user activity when selectedUserId changes
  useEffect(() => {
    if (selectedUserId) {
      loadUserActivity(selectedUserId);
    }
  }, [selectedUserId, loadUserActivity]);

  // Set userId from params
  useEffect(() => {
    if (userId) {
      setSelectedUserId(parseInt(userId));
    }
  }, [userId, setSelectedUserId]);

  // Load users when searchTerm changes
  useEffect(() => {
    loadUsers();
  }, [searchTerm, loadUsers]);

  // Clear typing info when switching user
  useEffect(() => {
    if (typingTimerRef.current) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    setTypingInfo(null);
  }, [selectedUserId, setTypingInfo, typingTimerRef]);

  // Realtime: listen typing info and socket events
  useEffect(() => {
    if (!selectedUserId) return;
    const s = getAdminSocket();

    const onAdminTyping = (p: any) => {
      try {
        if (!p) return;
        const a = Number(selectedUserId);
        const userIdNum = Number(p.userId);
        const withUserIdNum = Number(p.withUserId);
        const relevant = userIdNum === a || withUserIdNum === a;
        if (!relevant) return;

        const otherId = userIdNum === a ? withUserIdNum : userIdNum;
        const otherName = userIdNum === a ? (p.withUserName || String(withUserIdNum)) : (p.userName || p.name || String(userIdNum));

        if (p.isTyping) {
          setTypingInfo({ withUserId: otherId, withUserName: otherName });
          if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
          typingTimerRef.current = window.setTimeout(() => setTypingInfo(null), 5000);
        } else {
          setTypingInfo((prev: TypingInfo | null) => (prev && prev.withUserId === otherId ? null : prev));
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

    const onAdminUserUpdated = (p: any) => {
      try {
        const updated = p?.user;
        if (!updated || updated.id !== selectedUserId) return;
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
  }, [selectedUserId, loadUserActivity, setTypingInfo, setActivityData, typingTimerRef]);
};
