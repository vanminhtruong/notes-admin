import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';
import adminService from '@services/adminService';
import type { MonitorState } from '../../interfaces';

interface UseMonitorEffectsProps {
  selectedUserId: number | null;
  monitorState: MonitorState;
  setMonitorState: (state: MonitorState | ((prev: MonitorState) => MonitorState)) => void;
  setGroupTypingUsers: (users: Record<number, { name?: string; avatar?: string }> | ((prev: Record<number, { name?: string; avatar?: string }>) => Record<number, { name?: string; avatar?: string }>)) => void;
  setGroupTyping: (typing: boolean) => void;
  groupTypingTimersRef: React.MutableRefObject<Record<number, number>>;
}

export const useMonitorEffects = ({
  selectedUserId,
  setMonitorState,
  setGroupTypingUsers,
  setGroupTyping,
  groupTypingTimersRef
}: UseMonitorEffectsProps) => {
  // Load blocked users list whenever selectedUserId is available (includes mount after F5)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!selectedUserId) {
        // Clear blocked users if no user selected
        setMonitorState(prev => ({ ...prev, blockedUsers: [], loadingBlockedUsers: false }));
        return;
      }
      try {
        setMonitorState(prev => ({ ...prev, loadingBlockedUsers: true }));
        const res = await adminService.adminGetUserBlockedList(Number(selectedUserId)).catch(() => ({ data: [] }));
        const blockedUsers = (res as any)?.data || [];
        if (!cancelled) {
          setMonitorState(prev => ({ ...prev, blockedUsers, loadingBlockedUsers: false }));
        }
      } catch {
        if (!cancelled) setMonitorState(prev => ({ ...prev, blockedUsers: [], loadingBlockedUsers: false }));
      }
    };
    run();
    return () => { cancelled = true; };
  }, [selectedUserId, setMonitorState]);
  useEffect(() => {
    if (!selectedUserId) return;
    const s = getAdminSocket();

    // Realtime: DM message append for monitor viewer
    const onAdminDmCreated = (p: any) => {
      try {
        if (!p) return;
        setMonitorState(prevState => {
          if (!selectedUserId || !prevState.selectedFriendId) return prevState;
          const a = Number(selectedUserId);
          const b = Number(prevState.selectedFriendId);
          const betweenPair = (Number(p.senderId) === a && Number(p.receiverId) === b) || (Number(p.senderId) === b && Number(p.receiverId) === a);
          if (!betweenPair) return prevState;
          
          const messageExists = prevState.dmMessages.some(msg => msg.id === p.id);
          if (messageExists) return prevState;
          
          const nextStatus = { ...(prevState.dmStatusById || {}) } as Record<number, string>;
          if (p && p.id != null) {
            nextStatus[Number(p.id)] = typeof p.status === 'string' ? p.status : 'sent';
          }
          return { 
            ...prevState,
            dmMessages: [...prevState.dmMessages, p],
            dmStatusById: nextStatus
          };
        });
      } catch {}
    };
    s.on('admin_dm_created', onAdminDmCreated);

    // Realtime: group message append for monitor viewer
    const onAdminGroupMessageCreated = (p: any) => {
      try {
        if (!p) return;
        setMonitorState(prevState => {
          if (!prevState.selectedGroupId) return prevState;
          if (Number(p.groupId) !== Number(prevState.selectedGroupId)) return prevState;
          
          const messageExists = prevState.groupMessages.some(msg => msg.id === p.id);
          if (messageExists) return prevState;
          
          const nextStatus = { ...(prevState.groupStatusById || {}) } as Record<number, string>;
          if (p && p.id != null) {
            nextStatus[Number(p.id)] = typeof p.status === 'string' ? p.status : 'sent';
          }
          return { 
            ...prevState,
            groupMessages: [...prevState.groupMessages, p],
            groupStatusById: nextStatus
          };
        });
      } catch {}
    };
    s.on('admin_group_message_created', onAdminGroupMessageCreated);

    // Realtime: group typing by the selected user
    const onAdminGroupTyping = (p: any) => {
      try {
        if (!p) return;
        setMonitorState(prevState => {
          if (!prevState.selectedGroupId) return prevState;
          if (Number(p.groupId) !== Number(prevState.selectedGroupId)) return prevState;

          const typingUserId = Number(p.userId);

          if (p.isTyping) {
            setGroupTypingUsers(prev => {
              const next = { ...prev };
              next[typingUserId] = {
                name: p.userName || p.name,
                avatar: p.avatar
              };
              return next;
            });
            const timers = groupTypingTimersRef.current;
            if (timers[typingUserId]) window.clearTimeout(timers[typingUserId]);
            timers[typingUserId] = window.setTimeout(() => {
              setGroupTypingUsers(prev => {
                const next = { ...prev };
                delete next[typingUserId];
                setGroupTyping(Object.keys(next).length > 0);
                return next;
              });
              delete groupTypingTimersRef.current[typingUserId];
            }, 5000) as unknown as number;

            setGroupTyping(true);
          } else {
            setGroupTypingUsers(prev => {
              const next = { ...prev };
              if (next[typingUserId]) delete next[typingUserId];
              setGroupTyping(Object.keys(next).length > 0);
              return next;
            });
            const timers = groupTypingTimersRef.current;
            if (timers[typingUserId]) {
              window.clearTimeout(timers[typingUserId]);
              delete timers[typingUserId];
            }
          }
          return prevState;
        });
      } catch {}
    };
    s.on('admin_group_typing', onAdminGroupTyping);

    // Realtime: trạng thái DM delivered
    const onAdminMessageDelivered = (p: any) => {
      try {
        if (!p || p.messageId == null) return;
        setMonitorState(prev => ({
          ...prev,
          dmStatusById: { ...prev.dmStatusById, [Number(p.messageId)]: 'delivered' }
        }));
      } catch {}
    };
    s.on('admin_message_delivered', onAdminMessageDelivered);

    // Realtime: trạng thái DM read
    const onAdminMessageRead = (p: any) => {
      try {
        if (!p || p.messageId == null) return;
        setMonitorState(prev => {
          const mid = Number(p.messageId);
          const nextStatus = { ...prev.dmStatusById, [mid]: 'read' } as Record<number, string>;
          const nextReadBy = { ...(prev.dmReadBy || {}) } as Record<number, number>;
          if (p.readerId != null) nextReadBy[mid] = Number(p.readerId);
          return {
            ...prev,
            dmStatusById: nextStatus,
            dmReadBy: nextReadBy
          };
        });
      } catch {}
    };
    s.on('admin_message_read', onAdminMessageRead);

    // Realtime: trạng thái Group delivered
    const onAdminGroupMessageDelivered = (p: any) => {
      try {
        if (!p || p.messageId == null) return;
        setMonitorState(prev => ({
          ...prev,
          groupStatusById: { ...prev.groupStatusById, [Number(p.messageId)]: 'delivered' }
        }));
      } catch {}
    };
    s.on('admin_group_message_delivered', onAdminGroupMessageDelivered);

    // Realtime: trạng thái Group read
    const onAdminGroupMessageRead = (p: any) => {
      try {
        if (!p || p.messageId == null) return;
        setMonitorState(prev => {
          const mid = Number(p.messageId);
          const nextStatus = { ...prev.groupStatusById, [mid]: 'read' } as Record<number, string>;
          const prevReaders = prev.groupReadBy?.[mid] || [];
          const readers = prevReaders.includes(Number(p.readerId)) ? prevReaders : [...prevReaders, Number(p.readerId)];
          return {
            ...prev,
            groupStatusById: nextStatus,
            groupReadBy: { ...(prev.groupReadBy || {}), [mid]: readers }
          };
        });
      } catch {}
    };
    s.on('admin_group_message_read', onAdminGroupMessageRead);

    // Realtime: DM message pinned/unpinned (handle both users)
    const onAdminDmMessagePinned = async (p: any) => {
      try {
        if (!p || p.messageId == null) return;
        setMonitorState(prev => {
          // Check if this is relevant to current DM conversation
          if (!prev.selectedFriendId) return prev;
          const a = Number(selectedUserId);
          const b = Number(prev.selectedFriendId);
          const isRelevant = (Number(p.senderId) === a && Number(p.receiverId) === b) || 
                            (Number(p.senderId) === b && Number(p.receiverId) === a);
          if (!isRelevant) return prev;

          const messageId = Number(p.messageId);
          const pinned = !!p.pinned;
          let nextPinned = [...(prev.dmPinnedMessages || [])];

          if (pinned) {
            // Find the message in dmMessages
            const msg = prev.dmMessages.find(m => m.id === messageId);
            if (msg && !nextPinned.some(pm => pm.messageId === messageId || pm.message?.id === messageId)) {
              // Xác định ai là người ghim
              const pinnerId = (Number(p.senderId) === a || Number(p.senderId) === b) ? Number(p.senderId) : a;
              nextPinned.push({
                id: Date.now(),
                messageId: messageId,
                userId: pinnerId,
                pinnedAt: new Date().toISOString(),
                message: msg
              });
            }
          } else {
            // Remove from pinned
            nextPinned = nextPinned.filter(pm => pm.messageId !== messageId && pm.message?.id !== messageId);
          }

          return { ...prev, dmPinnedMessages: nextPinned };
        });
      } catch {}
    };
    s.on('admin_dm_message_pinned', onAdminDmMessagePinned);

    // Realtime: Group message pinned/unpinned
    const onAdminGroupMessagePinned = async (p: any) => {
      try {
        if (!p || p.messageId == null) return;
        setMonitorState(prev => {
          // Check if this is relevant to current group conversation
          if (!prev.selectedGroupId) return prev;
          if (Number(p.groupId) !== Number(prev.selectedGroupId)) return prev;

          const messageId = Number(p.messageId);
          const pinned = !!p.pinned;
          let nextPinned = [...(prev.groupPinnedMessages || [])];

          if (pinned) {
            // Find the message in groupMessages
            const msg = prev.groupMessages.find(m => m.id === messageId);
            if (msg && !nextPinned.some(pm => pm.messageId === messageId || pm.groupMessage?.id === messageId)) {
              nextPinned.push({
                id: Date.now(),
                messageId: messageId,
                groupId: p.groupId,
                userId: msg.senderId,
                pinnedAt: new Date().toISOString(),
                groupMessage: msg
              });
            }
          } else {
            // Remove from pinned
            nextPinned = nextPinned.filter(pm => pm.messageId !== messageId && pm.groupMessage?.id !== messageId);
          }

          return { ...prev, groupPinnedMessages: nextPinned };
        });
      } catch {}
    };
    s.on('admin_group_message_pinned', onAdminGroupMessagePinned);

    // Realtime: User blocked another user (handle both directions)
    const onAdminUserBlocked = async (p: any) => {
      try {
        if (!p || p.blockerId == null || p.blockedUserId == null) return;
        setMonitorState(prev => {
          // Check if this affects the monitored user (CẢ HAI CHIỀU)
          const userId = Number(selectedUserId);
          const blockerId = Number(p.blockerId);
          const blockedId = Number(p.blockedUserId);
          
          if (userId !== blockerId && userId !== blockedId) return prev;
          
          // Add to blocked list if not already there
          const blocked = prev.blockedUsers || [];
          const exists = blocked.some(bu => 
            Number(bu.blockerId) === blockerId && Number(bu.blockedUserId) === blockedId
          );
          if (exists) return prev;
          
          return {
            ...prev,
            blockedUsers: [...blocked, {
              id: Date.now(),
              blockerId: blockerId,
              blockedUserId: blockedId,
              blockedAt: new Date().toISOString()
            }]
          };
        });
      } catch {}
    };
    s.on('admin_user_blocked', onAdminUserBlocked);

    // Realtime: User unblocked another user (handle both directions)
    const onAdminUserUnblocked = async (p: any) => {
      try {
        if (!p || p.blockerId == null || p.blockedUserId == null) return;
        setMonitorState(prev => {
          // Check if this affects the monitored user (CẢ HAI CHIỀU)
          const userId = Number(selectedUserId);
          const blockerId = Number(p.blockerId);
          const blockedId = Number(p.blockedUserId);
          
          if (userId !== blockerId && userId !== blockedId) return prev;
          
          // Remove from blocked list
          const blocked = prev.blockedUsers || [];
          const filtered = blocked.filter(bu => 
            !(Number(bu.blockerId) === blockerId && Number(bu.blockedUserId) === blockedId)
          );
          
          return { ...prev, blockedUsers: filtered };
        });
      } catch {}
    };
    s.on('admin_user_unblocked', onAdminUserUnblocked);

    return () => {
      try {
        s.off('admin_dm_created', onAdminDmCreated);
        s.off('admin_group_message_created', onAdminGroupMessageCreated);
        s.off('admin_group_typing', onAdminGroupTyping);
        s.off('admin_message_delivered', onAdminMessageDelivered);
        s.off('admin_message_read', onAdminMessageRead);
        s.off('admin_group_message_delivered', onAdminGroupMessageDelivered);
        s.off('admin_group_message_read', onAdminGroupMessageRead);
        s.off('admin_dm_message_pinned', onAdminDmMessagePinned);
        s.off('admin_group_message_pinned', onAdminGroupMessagePinned);
        s.off('admin_user_blocked', onAdminUserBlocked);
        s.off('admin_user_unblocked', onAdminUserUnblocked);
        const timers = groupTypingTimersRef.current;
        Object.keys(timers).forEach((k) => {
          const id = Number(k);
          if (timers[id]) window.clearTimeout(timers[id]);
        });
        groupTypingTimersRef.current = {};
        setGroupTypingUsers({});
        setGroupTyping(false);
      } catch {}
    };
  }, [selectedUserId, setMonitorState, setGroupTypingUsers, setGroupTyping, groupTypingTimersRef]);
};
