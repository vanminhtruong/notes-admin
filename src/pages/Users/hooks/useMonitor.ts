import { useState, useEffect, useCallback, useRef } from 'react';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import type { MonitorState, GroupMemberInfo, GroupInfo } from '../interfaces';

export const useMonitor = (selectedUserId: number | null) => {
  const [monitorState, setMonitorState] = useState<MonitorState>({
    monitorTab: 'dm',
    selectedFriendId: null,
    selectedGroupId: null,
    dmMessages: [],
    groupMessages: [],
    loadingDm: false,
    loadingGroup: false
  });

  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [groupMemberInfo, setGroupMemberInfo] = useState<Record<number, GroupMemberInfo>>({});
  const [groupTyping, setGroupTyping] = useState<boolean>(false);
  // Theo dõi danh sách thành viên đang gõ trong group: userId -> { name, avatar }
  const [groupTypingUsers, setGroupTypingUsers] = useState<Record<number, { name?: string; avatar?: string }>>({});
  // Lưu timer riêng cho từng user để auto clear sau 5s không hoạt động
  const groupTypingTimersRef = useRef<Record<number, number>>({});

  // Group members modal state
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [membersModalGroup, setMembersModalGroup] = useState<any | null>(null);
  const [membersModalList, setMembersModalList] = useState<any[]>([]);
  const [loadingMembersModal, setLoadingMembersModal] = useState(false);
  const [openGroupMenuId, setOpenGroupMenuId] = useState<number | null>(null);

  const updateMonitorState = (updates: Partial<MonitorState>) => {
    setMonitorState(prev => ({ ...prev, ...updates }));
  };

  const resetMonitorState = () => {
    setMonitorState(prev => ({
      ...prev,
      selectedFriendId: null,
      selectedGroupId: null,
      dmMessages: [],
      groupMessages: []
    }));
  };

  const loadDm = useCallback(async (friendId: number) => {
    if (!selectedUserId) return;
    try {
      updateMonitorState({ loadingDm: true });
      const res = await adminService.adminGetDMMessages(selectedUserId, friendId, { limit: 50 });
      updateMonitorState({ 
        dmMessages: res?.data || res || [],
        loadingDm: false
      });
    } catch (e) {
      updateMonitorState({ 
        dmMessages: [],
        loadingDm: false
      });
    }
  }, [selectedUserId]);

  const loadGroup = useCallback(async (groupId: number) => {
    try {
      updateMonitorState({ loadingGroup: true });
      const [msgsRes, membersRes] = await Promise.all([
        adminService.adminGetGroupMessages(groupId, { limit: 50 }),
        adminService.adminGetGroupMembers(groupId)
      ]);
      
      const messages = msgsRes?.data || msgsRes || [];
      const groupData = membersRes?.data?.group || membersRes?.group || null;
      const members = membersRes?.data?.members || membersRes?.members || [];
      
      updateMonitorState({ 
        groupMessages: messages,
        loadingGroup: false
      });
      
      setGroupInfo(groupData ? { ownerId: Number(groupData.ownerId) } : null);
      
      const map: Record<number, GroupMemberInfo> = {};
      members.forEach((m: any) => {
        map[Number(m.id)] = { avatar: m.avatar, role: m.role, name: m.name };
      });
      setGroupMemberInfo(map);
    } catch (e) {
      updateMonitorState({ 
        groupMessages: [],
        loadingGroup: false
      });
      setGroupMemberInfo({});
      setGroupInfo(null);
    }
  }, []);

  const openGroupMembersModal = useCallback(async (group: any) => {
    try {
      setLoadingMembersModal(true);
      setMembersModalGroup(group);
      setShowGroupMembers(true);
      const res = await adminService.adminGetGroupMembers(group.id);
      const members = res?.data?.members || res?.members || [];
      setMembersModalList(Array.isArray(members) ? members : []);
    } catch (e) {
      setMembersModalList([]);
    } finally {
      setLoadingMembersModal(false);
    }
  }, []);

  const closeGroupMembersModal = useCallback(() => {
    setShowGroupMembers(false);
    setMembersModalGroup(null);
    setMembersModalList([]);
  }, []);

  // Realtime updates for monitor
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
          
          // Kiểm tra duplicate bằng ID
          const messageExists = prevState.dmMessages.some(msg => msg.id === p.id);
          if (messageExists) return prevState;
          
          return { 
            ...prevState,
            dmMessages: [...prevState.dmMessages, p] 
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
          
          // Kiểm tra duplicate bằng ID
          const messageExists = prevState.groupMessages.some(msg => msg.id === p.id);
          if (messageExists) return prevState;
          
          return { 
            ...prevState,
            groupMessages: [...prevState.groupMessages, p] 
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
            // Cập nhật map typing users
            setGroupTypingUsers(prev => {
              const next = { ...prev };
              next[typingUserId] = {
                name: p.userName || p.name,
                avatar: p.avatar
              };
              return next;
            });
            // Reset timer cho user này
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
            // Bỏ khỏi map ngay nếu user báo hết gõ
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

    return () => {
      try {
        s.off('admin_dm_created', onAdminDmCreated);
        s.off('admin_group_message_created', onAdminGroupMessageCreated);
        s.off('admin_group_typing', onAdminGroupTyping);
        // Clear tất cả timers khi unmount/đổi user
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
  }, [selectedUserId]);

  return {
    monitorState,
    updateMonitorState,
    resetMonitorState,
    loadDm,
    loadGroup,
    groupInfo,
    groupMemberInfo,
    groupTyping,
    groupTypingUsers,
    showGroupMembers,
    membersModalGroup,
    membersModalList,
    loadingMembersModal,
    openGroupMenuId,
    setOpenGroupMenuId,
    openGroupMembersModal,
    closeGroupMembersModal
  };
};
