import { useCallback } from 'react';
import adminService from '@services/adminService';
import type { MonitorState, GroupMemberInfo, GroupInfo } from '../../interfaces';

interface UseMonitorHandlersProps {
  selectedUserId: number | null;
  monitorState: MonitorState;
  setMonitorState: (state: MonitorState | ((prev: MonitorState) => MonitorState)) => void;
  setGroupInfo: (info: GroupInfo | null) => void;
  setGroupMemberInfo: (info: Record<number, GroupMemberInfo>) => void;
  setShowGroupMembers: (show: boolean) => void;
  setMembersModalGroup: (group: any) => void;
  setMembersModalList: (list: any[]) => void;
  setLoadingMembersModal: (loading: boolean) => void;
}

export const useMonitorHandlers = ({
  selectedUserId,
  setMonitorState,
  setGroupInfo,
  setGroupMemberInfo,
  setShowGroupMembers,
  setMembersModalGroup,
  setMembersModalList,
  setLoadingMembersModal
}: UseMonitorHandlersProps) => {
  const updateMonitorState = useCallback((updates: Partial<MonitorState>) => {
    setMonitorState(prev => ({ ...prev, ...updates }));
  }, [setMonitorState]);

  const resetMonitorState = useCallback(() => {
    setMonitorState(prev => ({
      ...prev,
      selectedFriendId: null,
      selectedGroupId: null,
      dmMessages: [],
      groupMessages: []
    }));
  }, [setMonitorState]);

  const loadDm = useCallback(async (friendId: number) => {
    if (!selectedUserId) return;
    try {
      updateMonitorState({ loadingDm: true });
      const res = await adminService.adminGetDMMessages(selectedUserId, friendId, { limit: 50 });
      const messages = res?.data || res || [];
      
      const nextStatus: Record<number, string> = {};
      const nextReadBy: Record<number, number> = {};
      (Array.isArray(messages) ? messages : []).forEach((m: any) => {
        if (m && m.id != null && typeof m.status === 'string') {
          nextStatus[Number(m.id)] = m.status;
        }
        if (m && m.id != null && Array.isArray(m.readByUserIds) && m.readByUserIds.length > 0) {
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
  }, [selectedUserId, updateMonitorState]);

  const loadGroup = useCallback(async (groupId: number) => {
    try {
      updateMonitorState({ loadingGroup: true });
      const [msgsRes, membersRes] = await Promise.all([
        adminService.adminGetGroupMessages(groupId, { limit: 50 }),
        adminService.adminGetGroupMembers(groupId)
      ]);
      
      const messages = msgsRes?.data || msgsRes || [];
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
      const groupData = membersRes?.data?.group || null;
      const members = membersRes?.data?.members || [];
      
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
  }, [updateMonitorState, setGroupInfo, setGroupMemberInfo]);

  const openGroupMembersModal = useCallback(async (group: any) => {
    try {
      setLoadingMembersModal(true);
      setMembersModalGroup(group);
      setShowGroupMembers(true);
      const res = await adminService.adminGetGroupMembers(group.id);
      const members = res?.data?.members || [];
      setMembersModalList(Array.isArray(members) ? members : []);
    } catch (e) {
      setMembersModalList([]);
    } finally {
      setLoadingMembersModal(false);
    }
  }, [setLoadingMembersModal, setMembersModalGroup, setShowGroupMembers, setMembersModalList]);

  const closeGroupMembersModal = useCallback(() => {
    setShowGroupMembers(false);
    setMembersModalGroup(null);
    setMembersModalList([]);
  }, [setShowGroupMembers, setMembersModalGroup, setMembersModalList]);

  return {
    updateMonitorState,
    resetMonitorState,
    loadDm,
    loadGroup,
    openGroupMembersModal,
    closeGroupMembersModal
  };
};
