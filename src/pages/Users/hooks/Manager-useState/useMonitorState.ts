import { useState, useRef } from 'react';
import type { MonitorState, GroupMemberInfo, GroupInfo } from '../../interfaces';

export const useMonitorState = () => {
  const [monitorState, setMonitorState] = useState<MonitorState>({
    monitorTab: 'dm',
    selectedFriendId: null,
    selectedGroupId: null,
    dmMessages: [],
    groupMessages: [],
    loadingDm: false,
    loadingGroup: false,
    dmStatusById: {},
    groupStatusById: {},
    dmReadBy: {},
    groupReadBy: {},
    dmPinnedMessages: [],
    groupPinnedMessages: [],
    loadingDmPinned: false,
    loadingGroupPinned: false,
    blockedUsers: [],
    loadingBlockedUsers: false
  });

  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [groupMemberInfo, setGroupMemberInfo] = useState<Record<number, GroupMemberInfo>>({});
  const [groupTyping, setGroupTyping] = useState<boolean>(false);
  const [groupTypingUsers, setGroupTypingUsers] = useState<Record<number, { name?: string; avatar?: string }>>({});
  const groupTypingTimersRef = useRef<Record<number, number>>({});
  const [showGroupMembers, setShowGroupMembers] = useState(false);
  const [membersModalGroup, setMembersModalGroup] = useState<any | null>(null);
  const [membersModalList, setMembersModalList] = useState<any[]>([]);
  const [loadingMembersModal, setLoadingMembersModal] = useState(false);
  const [openGroupMenuId, setOpenGroupMenuId] = useState<number | null>(null);

  return {
    monitorState,
    setMonitorState,
    groupInfo,
    setGroupInfo,
    groupMemberInfo,
    setGroupMemberInfo,
    groupTyping,
    setGroupTyping,
    groupTypingUsers,
    setGroupTypingUsers,
    groupTypingTimersRef,
    showGroupMembers,
    setShowGroupMembers,
    membersModalGroup,
    setMembersModalGroup,
    membersModalList,
    setMembersModalList,
    loadingMembersModal,
    setLoadingMembersModal,
    openGroupMenuId,
    setOpenGroupMenuId
  };
};
