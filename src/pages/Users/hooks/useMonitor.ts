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
    loadingGroup: false,
    // Bổ sung map trạng thái theo messageId
    dmStatusById: {},
    groupStatusById: {},
    // Người đã xem
    dmReadBy: {},
    groupReadBy: {}
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
      const messages = res?.data || res || [];
      // Khởi tạo map trạng thái từ dữ liệu trả về
      const nextStatus: Record<number, string> = {};
      // Khởi tạo map người đã xem từ readByUserIds để sau F5 vẫn giữ avatar "Đã xem"
      const nextReadBy: Record<number, number> = {};
      (Array.isArray(messages) ? messages : []).forEach((m: any) => {
        if (m && m.id != null && typeof m.status === 'string') {
          nextStatus[Number(m.id)] = m.status;
        }
        if (m && m.id != null && Array.isArray(m.readByUserIds) && m.readByUserIds.length > 0) {
          // Với DM: chọn người đọc khác người gửi nếu có, nếu không lấy phần tử đầu tiên
          const senderId = Number(m.senderId);
          const reader = m.readByUserIds.find((uid: any) => Number(uid) !== senderId);
          const rid = Number(reader ?? m.readByUserIds[0]);
          if (!Number.isNaN(rid)) nextReadBy[Number(m.id)] = rid;
        }
      });
      updateMonitorState({ 
        dmMessages: messages,
        loadingDm: false,
        dmStatusById: nextStatus,
        dmReadBy: nextReadBy
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
      // Khởi tạo map trạng thái group từ dữ liệu
      const nextGroupStatus: Record<number, string> = {};
      const nextGroupReadBy: Record<number, number[]> = {};
      (Array.isArray(messages) ? messages : []).forEach((m: any) => {
        if (m && m.id != null && typeof m.status === 'string') {
          nextGroupStatus[Number(m.id)] = m.status;
        }
        if (m && m.id != null && Array.isArray(m.readByUserIds)) {
          nextGroupReadBy[Number(m.id)] = m.readByUserIds.map((x: any) => Number(x)).filter((x: number) => !Number.isNaN(x));
        }
      });
      const groupData = membersRes?.data?.group || membersRes?.group || null;
      const members = membersRes?.data?.members || membersRes?.members || [];
      
      updateMonitorState({ 
        groupMessages: messages,
        loadingGroup: false,
        groupStatusById: nextGroupStatus,
        groupReadBy: nextGroupReadBy
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
          
          // Kiểm tra duplicate bằng ID
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

    return () => {
      try {
        s.off('admin_dm_created', onAdminDmCreated);
        s.off('admin_group_message_created', onAdminGroupMessageCreated);
        s.off('admin_group_typing', onAdminGroupTyping);
        s.off('admin_message_delivered', onAdminMessageDelivered);
        s.off('admin_message_read', onAdminMessageRead);
        s.off('admin_group_message_delivered', onAdminGroupMessageDelivered);
        s.off('admin_group_message_read', onAdminGroupMessageRead);
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
