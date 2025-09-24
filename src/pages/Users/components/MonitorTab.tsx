import React, { useEffect, useRef, useState } from 'react';
import { hasPermission } from '@utils/auth';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { UserActivityData, TypingInfo } from '../interfaces';
import adminService from '@services/adminService';

interface MonitorTabProps {
  activityData: UserActivityData | null;
  selectedUserId: number | null;
  typingInfo: TypingInfo | null;
  formatDate: (dateString: string) => string;
  monitorState: any;
  groupInfo: any;
  groupMemberInfo: any;
  groupTyping: any;
  groupTypingUsers?: Record<number, { name?: string; avatar?: string }>;
  showGroupMembers: boolean;
  membersModalGroup: any;
  membersModalList: any[];
  loadingMembersModal: boolean;
  openGroupMenuId: number | null;
  loadDm: (friendId: number) => void;
  loadGroup: (groupId: number) => void;
  openGroupMembersModal: (group: any) => void;
  closeGroupMembersModal: () => void;
  setOpenGroupMenuId: (id: number | null) => void;
  updateMonitorState: (update: any) => void;
  onRecallMessage?: (messageId: number, isGroup?: boolean) => void;
  onDeleteMessage?: (messageId: number, isGroup?: boolean) => void;
  onEditMessage?: (messageId: number, isGroup?: boolean, currentContent?: string) => void;
}

const MonitorTab: React.FC<MonitorTabProps> = ({
  activityData,
  selectedUserId,
  typingInfo,
  formatDate,
  monitorState,
  groupInfo,
  groupMemberInfo,
  groupTyping,
  groupTypingUsers,
  showGroupMembers,
  membersModalGroup,
  membersModalList,
  loadingMembersModal,
  openGroupMenuId,
  loadDm,
  loadGroup,
  openGroupMembersModal,
  closeGroupMembersModal,
  setOpenGroupMenuId,
  updateMonitorState,
  onRecallMessage,
  onDeleteMessage,
  onEditMessage
}) => {
  const { t } = useTranslation('users');
  const [openMessageMenuId, setOpenMessageMenuId] = useState<number | null>(null);
  const { monitorTab, selectedFriendId, selectedGroupId, dmMessages, groupMessages, loadingDm, loadingGroup, dmStatusById = {}, groupStatusById = {} } = monitorState;
  const hasFriends = Array.isArray(activityData?.activity.friends) && (activityData!.activity.friends.length > 0);

  // Quyền granular theo dõi trạng thái tin nhắn trong Monitor
  const canSeeMsgStatusParent = hasPermission('manage_users.activity.monitor.message_status');
  const canSeeSent = canSeeMsgStatusParent || hasPermission('manage_users.activity.monitor.message_status.sent');
  const canSeeDelivered = canSeeMsgStatusParent || hasPermission('manage_users.activity.monitor.message_status.delivered');
  const canSeeRead = canSeeMsgStatusParent || hasPermission('manage_users.activity.monitor.message_status.read');
  // Prevent unused prop warnings for optional handlers we might not render depending on permissions
  void openGroupMenuId; void openGroupMembersModal; void setOpenGroupMenuId; void groupTyping;

  // Chuẩn hóa URL avatar để đảm bảo hiển thị được cả khi backend trả về đường dẫn tương đối
  const API_BASE: string = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  const BASE_ORIGIN: string = (() => { try { return new URL(API_BASE).origin; } catch { return ''; } })();
  const resolveAvatar = (url?: string | null): string => {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('//')) return `${window.location.protocol}${url}`;
    if (url.startsWith('/')) return `${BASE_ORIGIN}${url}`;
    return `${BASE_ORIGIN}/${url}`;
  };

  // Refs for auto-scroll to typing
  const dmListRef = useRef<HTMLDivElement | null>(null);
  const dmTypingRef = useRef<HTMLDivElement | null>(null);
  const groupListRef = useRef<HTMLDivElement | null>(null);
  const groupEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when counterpart or monitored user is typing in DM
  useEffect(() => {
    try {
      if (monitorTab !== 'dm') return;
      if (!typingInfo || !selectedFriendId) return;
      if (typingInfo.withUserId !== selectedFriendId) return;
      // Scroll to typing bubble if available; fallback to bottom
      setTimeout(() => {
        if (dmTypingRef.current && dmTypingRef.current.scrollIntoView) {
          dmTypingRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else if (dmListRef.current) {
          dmListRef.current.scrollTop = dmListRef.current.scrollHeight;
        }
      }, 0);
    } catch {}
  }, [typingInfo, selectedFriendId, monitorTab]);

  // Auto-scroll when any group member is typing in current group
  useEffect(() => {
    try {
      if (monitorTab !== 'groups') return;
      if (!selectedGroupId) return;
      const hasTyping = !!(groupTypingUsers && Object.keys(groupTypingUsers).length > 0);
      if (!hasTyping) return;
      setTimeout(() => {
        if (groupEndRef.current && groupEndRef.current.scrollIntoView) {
          groupEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else if (groupListRef.current) {
          groupListRef.current.scrollTop = groupListRef.current.scrollHeight;
        }
      }, 0);
    } catch {}
  }, [groupTypingUsers, selectedGroupId, monitorTab]);

  return (
    <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2">
      {/* Nested tabs */}
      <div className="flex space-x-4 xl-down:space-x-3 sm-down:space-x-2 border-b border-gray-200 dark:border-neutral-700 pb-2 xl-down:pb-1.5">
        {[
          { key: 'dm', label: t('userActivity.monitor.tabs.dm') },
          { key: 'groups', label: t('userActivity.monitor.tabs.groups') },
        ].map((sub) => (
          <button
            key={sub.key}
            onClick={() => updateMonitorState({ monitorTab: sub.key as any, selectedFriendId: null, selectedGroupId: null, dmMessages: [], groupMessages: [] })}
            className={`py-2 px-3 xl-down:py-1.5 xl-down:px-2 sm-down:py-1 sm-down:px-1.5 rounded-md xl-down:rounded text-sm xl-down:text-xs ${monitorTab === sub.key ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {monitorTab === 'dm' ? (
        <div className={`grid grid-cols-1 ${hasFriends ? 'lg:grid-cols-3' : ''} xl-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2`}>
          {/* Friends list */}
          <div className="lg:col-span-1">
            <h4 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 mb-2 xl-down:mb-1">{t('userActivity.monitor.friendsList')}</h4>
            <div className="space-y-2 xl-down:space-y-1 max-h-[520px] xl-down:max-h-[300px] sm-down:max-h-[200px] overflow-auto pr-1">
              {Array.isArray(activityData?.activity.friends) && activityData!.activity.friends.length === 0 ? (
                <div className="flex items-center justify-center h-[120px] text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md border border-dashed border-gray-200 dark:border-neutral-700">
                  {t('userActivity.monitor.noFriends', 'Người này chưa kết bạn với ai')}
                </div>
              ) : (
                (activityData?.activity.friends || []).map((f) => (
                  <button key={f.id} onClick={() => { updateMonitorState({ selectedFriendId: f.id }); loadDm(f.id); }} className={`w-full flex items-center p-3 xl-down:p-2 sm-down:p-1.5 rounded-lg xl-down:rounded-md border text-left ${selectedFriendId === f.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700'}`}>
                    <div className="flex-shrink-0 h-9 w-9 xl-down:h-7 xl-down:w-7 sm-down:h-6 sm-down:w-6 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center">
                      {f.avatar ? (
                        <img src={resolveAvatar(f.avatar)} alt={f.name || 'avatar'} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-sm xl-down:text-xs sm-down:text-2xs font-medium">{f.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="ml-3 xl-down:ml-2 flex-1 min-w-0">
                      <p className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{f.name}</p>
                      <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 truncate">{f.email}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* DM Viewer - ẩn hoàn toàn nếu không có bạn bè */}
          {hasFriends && (
          <div className="lg:col-span-2">
            {!selectedFriendId ? (
              <div className="h-[520px] xl-down:h-[300px] sm-down:h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700 text-sm xl-down:text-xs">
                {Array.isArray(activityData?.activity.friends) && activityData!.activity.friends.length === 0
                  ? t('userActivity.monitor.noFriends', 'Người này chưa kết bạn với ai')
                  : t('userActivity.monitor.selectFriendToView')}
              </div>
            ) : (
              <div className="h-[520px] xl-down:h-[300px] sm-down:h-[200px] flex flex-col bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700">
                <div className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between xl-down:flex-col xl-down:items-start xl-down:space-y-1">
                  <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">{t('userActivity.monitor.chatWith', { name: activityData?.activity.friends.find(f => f.id === selectedFriendId)?.name || selectedFriendId })}</div>
                  {/* Đưa typing xuống khung chat dưới dạng bubble, giữ header gọn gàng */}
                </div>
                <div ref={dmListRef} className="flex-1 overflow-auto p-4 xl-down:p-3 sm-down:p-2 space-y-3 xl-down:space-y-2">
                  {loadingDm ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('common:loading')}</div>
                  ) : dmMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('userActivity.monitor.noMessages')}</div>
                  ) : (
                    (() => {
                      const fragments: React.ReactNode[] = [];
                      let lastDayKey: string | null = null;
                      const today = new Date();
                      const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
                      // Xác định messageId gần nhất (do user đang theo dõi gửi) đã được đọc để hiển thị avatar
                      let latestReadDmId: number | null = null;
                      for (let i = (dmMessages as any[]).length - 1; i >= 0; i--) {
                        const mm: any = (dmMessages as any[])[i];
                        const isMine = Number(mm.senderId) === Number(selectedUserId);
                        const statusStr: string = (dmStatusById as any)[Number(mm.id)] || (mm as any).status || '';
                        const hasReader = !!(monitorState as any).dmReadBy?.[Number(mm.id)];
                        if (isMine && (statusStr === 'read' || hasReader)) { latestReadDmId = Number(mm.id); break; }
                      }
                      (dmMessages as any[]).forEach((m: any) => {
                        const d = new Date(m.createdAt);
                        const dayKey = startOf(d).toISOString();
                        if (lastDayKey !== dayKey) {
                          const diffDays = Math.floor((startOf(today).getTime() - startOf(d).getTime()) / (24 * 60 * 60 * 1000));
                          const sepLabel = diffDays === 0
                            ? t('userActivity.monitor.daySeparator.today', 'Hôm nay')
                            : diffDays === 1
                              ? t('userActivity.monitor.daySeparator.yesterday', 'Hôm qua')
                              : d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
                          fragments.push(
                            <div key={`dm-sep-${dayKey}`} className="flex items-center justify-center my-1">
                              <span className="text-[11px] xl-down:text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700">{sepLabel}</span>
                            </div>
                          );
                          lastDayKey = dayKey;
                        }
                        const isUserMessage = Number(m.senderId) === Number(selectedUserId);
                        const userInfo = activityData?.user;
                        const friendInfo = activityData?.activity.friends.find((f) => f.id === selectedFriendId);
                        const avatarUrl = isUserMessage ? userInfo?.avatar : friendInfo?.avatar;
                        const name = isUserMessage ? (userInfo?.name || '') : (friendInfo?.name || '');

                        const Avatar = (
                          <div className="relative flex-shrink-0">
                            {avatarUrl ? (
                              <img src={resolveAvatar(avatarUrl)} alt={name || 'avatar'} className="h-8 w-8 xl-down:h-6 xl-down:w-6 sm-down:h-5 sm-down:w-5 rounded-full object-cover" />
                            ) : (
                              <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 sm-down:h-5 sm-down:w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs xl-down:text-2xs font-medium">
                                {(name || '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        );

                        fragments.push(
                          <React.Fragment key={`dm-${m.id}`}>
                          <div className={`flex items-end ${isUserMessage ? 'justify-end' : 'justify-start'}`}>
                            {!isUserMessage && <div className="mr-2 xl-down:mr-1">{Avatar}</div>}
                            <div className={`relative max-w-[75%] xl-down:max-w-[85%] px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-1.5 sm-down:py-1 rounded-lg xl-down:rounded-md text-sm xl-down:text-xs ${isUserMessage ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100'}`}>
                              <div className="flex items-start justify-between space-x-2">
                                <div className="flex-1">
                                  {!isUserMessage && (
                                    <div className="font-medium mb-0.5 xl-down:mb-0.5 opacity-80 text-xs xl-down:text-2xs">{name}</div>
                                  )}
                                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                                </div>
                                {(((onRecallMessage && hasPermission('manage_users.activity.messages.recall')) || (onDeleteMessage && hasPermission('manage_users.activity.messages.delete')) || (onEditMessage && hasPermission('manage_users.activity.messages.edit'))) && isUserMessage) && (
                                  <div className="relative flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMessageMenuId(openMessageMenuId === m.id ? null : m.id);
                                      }}
                                      className={`p-1 rounded transition-colors ${
                                        isUserMessage 
                                          ? 'text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/30' 
                                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 focus:ring-blue-500'
                                      } focus:outline-none focus:ring-1`}
                                      aria-label={t('userActivity.messages.actions.menu', 'Menu')}
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </button>
                                    {openMessageMenuId === m.id && (
                                      <div
                                        className="absolute right-0 top-6 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-[160px]"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {onEditMessage && hasPermission('manage_users.activity.messages.edit') && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMessageMenuId(null);
                                              onEditMessage(m.id, false, m.content);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-2"
                                          >
                                            <span>✏️</span>
                                            <span>{t('userActivity.messages.actions.edit', 'Chỉnh sửa tin nhắn')}</span>
                                          </button>
                                        )}
                                        {onRecallMessage && hasPermission('manage_users.activity.messages.recall') && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMessageMenuId(null);
                                              onRecallMessage(m.id, false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-2"
                                          >
                                            <span>🔄</span>
                                            <span>{t('userActivity.messages.actions.recall', 'Thu hồi tin nhắn')}</span>
                                          </button>
                                        )}
                                        {onDeleteMessage && hasPermission('manage_users.activity.messages.delete') && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMessageMenuId(null);
                                              onDeleteMessage(m.id, false);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                                          >
                                            <span>🗑️</span>
                                            <span>{t('userActivity.messages.actions.delete', 'Xóa tin nhắn')}</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Menu phía BẠN CHAT: Xóa phía Users (DM) */}
                                {(!isUserMessage && hasPermission('manage_users.activity.messages.delete')) && (
                                  <div className="relative flex-shrink-0 ml-2 xl-down:ml-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMessageMenuId(openMessageMenuId === m.id ? null : m.id);
                                      }}
                                      className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-colors"
                                      aria-label={t('userActivity.messages.actions.menu', 'Menu')}
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </button>
                                    {openMessageMenuId === m.id && (
                                      <div
                                        className="absolute left-full top-6 translate-x-2 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-[180px]"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            setOpenMessageMenuId(null);
                                            if (!selectedUserId) return;
                                            const ok = window.confirm(t('userActivity.messages.actions.confirmDeleteForUser', 'Bạn có chắc muốn xóa tin nhắn này phía người dùng đang theo dõi?'));
                                            if (!ok) return;
                                            try {
                                              await adminService.deleteDMMessage(Number(m.id), Number(selectedUserId));
                                              // Reload DM sau khi xóa
                                              const friendId = (monitorState as any)?.selectedFriendId;
                                              if (friendId) { loadDm(friendId); }
                                            } catch (err: any) {
                                              // no toast here to avoid import; native alert
                                              alert(err?.message || t('userActivity.messages.actions.deleteError', 'Không thể xóa tin nhắn'));
                                            }
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                                        >
                                          <span>🗑️</span>
                                          <span>{t('userActivity.messages.actions.deleteForUser', 'Xóa phía Users')}</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Ẩn avatar to cho tin nhắn của user đang theo dõi; trạng thái đã xem đã có avatar nhỏ bên dưới */}
                            {false && isUserMessage && <div className="ml-2 xl-down:ml-1">{Avatar}</div>}
                          </div>
                          {/* Hàng trạng thái dưới bong bóng (DM) */}
                          {(() => {
                            const status: string = (dmStatusById as any)[Number(m.id)] || (m as any).status || 'sent';
                            // Chỉ hiển thị theo đúng quyền của từng trạng thái
                            const canShow = (status === 'sent' && canSeeSent) || (status === 'delivered' && canSeeDelivered) || (status === 'read' && canSeeRead);
                            if (!canShow) return null;
                            const label = status === 'read' ? t('userActivity.monitor.status.read', 'Đã xem')
                              : status === 'delivered' ? t('userActivity.monitor.status.delivered', 'Đã nhận')
                              : t('userActivity.monitor.status.sent', 'Đã gửi');
                            const color = status === 'read' ? 'bg-green-500' : status === 'delivered' ? 'bg-blue-500' : 'bg-gray-400';
                            const rowAlign = isUserMessage ? 'justify-end' : 'justify-start';
                            // Xác định avatar người đã xem nếu status = read
                            let readerAvatar: string | undefined;
                            let readerName: string = '';
                            const readerId = (monitorState as any).dmReadBy?.[Number(m.id)];
                            if (status === 'read' && readerId && canSeeRead) {
                              if (activityData?.user && Number(activityData.user.id) === Number(readerId)) {
                                readerAvatar = activityData.user.avatar || undefined;
                                readerName = activityData.user.name || '';
                              } else {
                                const friend = activityData?.activity.friends.find((f) => Number(f.id) === Number(readerId));
                                readerAvatar = friend?.avatar;
                                readerName = friend?.name || '';
                              }
                            }
                            return (
                              <div className={`mt-1 px-1 flex items-center gap-2 text-[10px] xl-down:text-[9px] opacity-80 ${rowAlign}`}>
                                <span>{formatDate(m.createdAt)}</span>
                                <span className="inline-flex items-center">
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${color}`}></span>
                                  <span>{label}</span>
                                </span>
                                {status === 'read' && readerAvatar && Number(m.id) === latestReadDmId && (
                                  <img
                                    src={resolveAvatar(readerAvatar)}
                                    alt={readerName || 'read by'}
                                    className="h-4 w-4 rounded-full object-cover ring-1 ring-white/50 dark:ring-neutral-800"
                                  />
                                )}
                              </div>
                            );
                          })()}
                          </React.Fragment>
                        );
                      });
                      return fragments;
                    })()
                  )}
                  {/* Typing bubble hiển thị trong khung chat, ưu tiên phía bạn chat */}
                  {typingInfo && typingInfo.withUserId === selectedFriendId && (
                    <div ref={dmTypingRef} className="flex items-end justify-start">
                      {/* Avatar bạn chat */}
                      <div className="mr-2 xl-down:mr-1">
                        {(() => {
                          const friendInfo = activityData?.activity.friends.find((f) => f.id === selectedFriendId);
                          const name = friendInfo?.name || typingInfo.withUserName || '';
                          const avatarUrl = friendInfo?.avatar;
                          return (
                            <div className="relative flex-shrink-0">
                              {avatarUrl ? (
                                <img src={resolveAvatar(avatarUrl)} alt={name || 'avatar'} className="h-8 w-8 xl-down:h-6 xl-down:w-6 sm-down:h-5 sm-down:w-5 rounded-full object-cover" />
                              ) : (
                                <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 sm-down:h-5 sm-down:w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs xl-down:text-2xs font-medium">
                                  {(name || '?').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="relative max-w-[75%] xl-down:max-w-[85%] px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-1.5 sm-down:py-1 rounded-lg xl-down:rounded-md text-sm xl-down:text-xs bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100">
                        <div className="flex items-center space-x-1 opacity-80">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
          {/* Groups list */}
          <div className="lg:col-span-1">
            <h4 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 mb-2 xl-down:mb-1">{t('userActivity.monitor.groupsList')}</h4>
            <div className="space-y-2 xl-down:space-y-1 max-h-[520px] xl-down:max-h-[300px] sm-down:max-h-[200px] overflow-auto pr-1">
              {activityData?.activity.groups.map((g: any) => (
                <div
                  key={g.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => { updateMonitorState({ selectedGroupId: g.id }); loadGroup(g.id); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); updateMonitorState({ selectedGroupId: g.id }); loadGroup(g.id); } }}
                  className={`relative w-full p-3 xl-down:p-2 sm-down:p-1.5 rounded-lg xl-down:rounded-md border text-left cursor-pointer ${selectedGroupId === g.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0 h-9 w-9 xl-down:h-7 xl-down:w-7 sm-down:h-6 sm-down:w-6 rounded-full overflow-hidden bg-gradient-to-r from-green-500 to-blue-500 text-white flex items-center justify-center">
                        {g.avatar ? (
                          <img src={resolveAvatar(g.avatar)} alt={g.name || 'group'} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm xl-down:text-xs sm-down:text-2xs font-medium">{(g.name || '?').charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="ml-3 xl-down:ml-2 flex-1 min-w-0">
                        <p className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{g.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            {!selectedGroupId ? (
              <div className="h-[520px] xl-down:h-[300px] sm-down:h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700 text-sm xl-down:text-xs">
                {t('userActivity.monitor.selectGroupToView')}
              </div>
            ) : (
              <div className="h-[520px] xl-down:h-[300px] sm-down:h-[200px] flex flex-col bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700">
                <div className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between xl-down:flex-col xl-down:items-start xl-down:space-y-1">
                  <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">{t('userActivity.monitor.groupChat')}</div>
                  {/* Đưa typing xuống khung chat dưới dạng bubble cho từng thành viên */}
                </div>
                <div className="flex-1 overflow-auto p-4 xl-down:p-3 sm-down:p-2 space-y-3 xl-down:space-y-2">
                  {loadingGroup ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('common:loading')}</div>
                  ) : groupMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('userActivity.monitor.noMessages')}</div>
                  ) : (
                    (() => {
                      const fragments: React.ReactNode[] = [];
                      let lastDayKey: string | null = null;
                      const today = new Date();
                      const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
                      // Xác định message gần nhất do user đang theo dõi gửi mà đã có người đọc
                      let latestReadGroupId: number | null = null;
                      for (let i = (groupMessages as any[]).length - 1; i >= 0; i--) {
                        const gm: any = (groupMessages as any[])[i];
                        const mineCheck = Number(gm.senderId) === Number(selectedUserId);
                        const readersArr: number[] = ((monitorState as any).groupReadBy?.[Number(gm.id)] || []) as number[];
                        if (mineCheck && readersArr.length > 0) { latestReadGroupId = Number(gm.id); break; }
                      }
                      (groupMessages as any[]).forEach((m: any) => {
                        const isSystem = m?.messageType === 'system' || (typeof m?.content === 'string' && m.content.toLowerCase().includes('joined the group'));
                        const d = new Date(m.createdAt);
                        const dayKey = startOf(d).toISOString();
                        if (lastDayKey !== dayKey) {
                          const diffDays = Math.floor((startOf(today).getTime() - startOf(d).getTime()) / (24 * 60 * 60 * 1000));
                          const sepLabel = diffDays === 0
                            ? t('userActivity.monitor.daySeparator.today', 'Hôm nay')
                            : diffDays === 1
                              ? t('userActivity.monitor.daySeparator.yesterday', 'Hôm qua')
                              : d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
                          fragments.push(
                            <div key={`group-sep-${dayKey}`} className="flex items-center justify-center my-1">
                              <span className="text-[11px] xl-down:text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-neutral-700">{sepLabel}</span>
                            </div>
                          );
                          lastDayKey = dayKey;
                        }
                        if (isSystem) {
                          fragments.push(
                            <div key={m.id} className="flex justify-center">
                              <div className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
                                {m.content}
                              </div>
                            </div>
                          );
                          return;
                        }
                        const senderId = Number(m.senderId);
                        const mine = Number(selectedUserId) === senderId;
                        const info = groupMemberInfo[senderId] || {};
                        const avatarUrl = m.senderAvatar || info.avatar;
                        const role = info.role || (groupInfo?.ownerId && senderId === groupInfo.ownerId ? 'owner' : undefined);
                        const name = m.senderName || info.name || '';
                        const Avatar = (
                          <div className="relative flex-shrink-0">
                            {avatarUrl ? (
                              <img src={resolveAvatar(avatarUrl)} alt={name || 'avatar'} className="h-8 w-8 xl-down:h-6 xl-down:w-6 sm-down:h-5 sm-down:w-5 rounded-full object-cover" />
                            ) : (
                              <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 sm-down:h-5 sm-down:w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs xl-down:text-2xs font-medium">
                                {(name || '?').charAt(0).toUpperCase()}
                              </div>
                            )}
                            {role === 'owner' && (
                              <span className="absolute -bottom-1 -right-1 h-4 w-4 xl-down:h-3 xl-down:w-3 rounded-full bg-yellow-400 text-[10px] xl-down:text-[8px] flex items-center justify-center ring-2 ring-white dark:ring-neutral-900" title={t('userActivity.monitor.members.roles.owner')}>🔑</span>
                            )}
                            {role === 'admin' && (
                              <span className="absolute -bottom-1 -right-1 h-4 w-4 xl-down:h-3 xl-down:w-3 rounded-full bg-blue-500 text-[10px] xl-down:text-[8px] flex items-center justify-center ring-2 ring-white dark:ring-neutral-900" title={t('userActivity.monitor.members.roles.admin')}>🛡️</span>
                            )}
                          </div>
                        );
                        fragments.push(
                          <React.Fragment key={`grp-${m.id}`}>
                          <div className={`flex items-end ${mine ? 'justify-end' : 'justify-start'}`}>
                            {!mine && <div className="mr-2 xl-down:mr-1">{Avatar}</div>}
                            <div className={`relative max-w-[75%] xl-down:max-w-[85%] px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-1.5 sm-down:py-1 rounded-lg xl-down:rounded-md text-sm xl-down:text-xs ${mine ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100'}`}>
                              <div className="flex items-start justify-between space-x-2">
                                <div className="flex-1">
                                  <div className="font-medium mb-0.5 xl-down:mb-0.5 opacity-80 text-xs xl-down:text-2xs">{name}</div>
                                  <div className="whitespace-pre-wrap break-words">{m.content}</div>
                                </div>
                                {mine && (onRecallMessage || onDeleteMessage || onEditMessage) && (
                                  <div className="relative flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMessageMenuId(openMessageMenuId === m.id ? null : m.id);
                                      }}
                                      className={`p-1 rounded transition-colors ${
                                        mine 
                                          ? 'text-white/70 hover:text-white hover:bg-white/10 focus:ring-white/30' 
                                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 focus:ring-blue-500'
                                      } focus:outline-none focus:ring-1`}
                                      aria-label={t('userActivity.messages.actions.menu', 'Menu')}
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </button>
                                    {openMessageMenuId === m.id && (
                                      <div
                                        className="absolute right-0 top-6 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-[160px]"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {onEditMessage && hasPermission('manage_users.activity.groups.edit') && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMessageMenuId(null);
                                              onEditMessage(m.id, true, m.content);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors flex items-center space-x-2"
                                          >
                                            <span>✏️</span>
                                            <span>{t('userActivity.messages.actions.edit', 'Chỉnh sửa tin nhắn')}</span>
                                          </button>
                                        )}
                                        {onRecallMessage && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMessageMenuId(null);
                                              onRecallMessage(m.id, true);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center space-x-2"
                                          >
                                            <span>🔄</span>
                                            <span>{t('userActivity.messages.actions.recall', 'Thu hồi tin nhắn')}</span>
                                          </button>
                                        )}
                                        {onDeleteMessage && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMessageMenuId(null);
                                              onDeleteMessage(m.id, true);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                                          >
                                            <span>🗑️</span>
                                            <span>{t('userActivity.messages.actions.delete', 'Xóa tin nhắn')}</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {/* Menu phía THÀNH VIÊN KHÁC: Xóa phía Users (Group) */}
                                {(!mine && hasPermission('manage_users.activity.groups.delete')) && (
                                  <div className="relative flex-shrink-0 ml-2 xl-down:ml-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMessageMenuId(openMessageMenuId === m.id ? null : m.id);
                                      }}
                                      className="p-1 rounded text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 focus:outline-none focus:ring-1 focus:ring-gray-300 transition-colors"
                                      aria-label={t('userActivity.messages.actions.menu', 'Menu')}
                                    >
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                      </svg>
                                    </button>
                                    {openMessageMenuId === m.id && (
                                      <div
                                        className="absolute left-full top-6 translate-x-2 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg py-1 min-w-[180px]"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button
                                          type="button"
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            setOpenMessageMenuId(null);
                                            if (!selectedUserId) return;
                                            const ok = window.confirm(t('userActivity.messages.actions.confirmDeleteForUser', 'Bạn có chắc muốn xóa tin nhắn này phía người dùng đang theo dõi?'));
                                            if (!ok) return;
                                            try {
                                              await adminService.deleteGroupMessage(Number(m.id), Number(selectedUserId));
                                              // Reload Group sau khi xóa
                                              const gid = (monitorState as any)?.selectedGroupId;
                                              if (gid) { loadGroup(gid); }
                                            } catch (err: any) {
                                              alert(err?.message || t('userActivity.messages.actions.deleteError', 'Không thể xóa tin nhắn'));
                                            }
                                          }}
                                          className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center space-x-2"
                                        >
                                          <span>🗑️</span>
                                          <span>{t('userActivity.messages.actions.deleteForUser', 'Xóa phía Users')}</span>
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {/* Ẩn avatar to cho tin nhắn của user đang theo dõi (mine); trạng thái đã xem đã có avatar nhỏ bên dưới */}
                            {false && mine && <div className="ml-2 xl-down:ml-1">{Avatar}</div>}
                          </div>
                          {/* Hàng trạng thái dưới bong bóng (Group) */}
                          {(() => {
                            const status: string = (groupStatusById as any)[Number(m.id)] || (m as any).status || 'sent';
                            // Chỉ hiển thị theo đúng quyền của từng trạng thái
                            const canShow = (status === 'sent' && canSeeSent) || (status === 'delivered' && canSeeDelivered) || (status === 'read' && canSeeRead);
                            if (!canShow) return null;
                            const label = status === 'read' ? t('userActivity.monitor.status.read', 'Đã xem')
                              : status === 'delivered' ? t('userActivity.monitor.status.delivered', 'Đã nhận')
                              : t('userActivity.monitor.status.sent', 'Đã gửi');
                            const color = status === 'read' ? 'bg-green-500' : status === 'delivered' ? 'bg-blue-500' : 'bg-gray-400';
                            const rowAlign = mine ? 'justify-end' : 'justify-start';
                            const readerIds: number[] = (monitorState as any).groupReadBy?.[Number(m.id)] || [];
                            const topReaders = readerIds.filter((uid) => Number(uid) !== Number(m.senderId)).slice(0, 3);
                            return (
                              <div className={`mt-1 px-1 flex items-center gap-2 text-[10px] xl-down:text-[9px] opacity-80 ${rowAlign}`}>
                                <span>{formatDate(m.createdAt)}</span>
                                <span className="inline-flex items-center">
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${color}`}></span>
                                  <span>{label}</span>
                                </span>
                                {status === 'read' && canSeeRead && topReaders.length > 0 && Number(m.id) === latestReadGroupId && (
                                  <div className="flex -space-x-1">
                                    {topReaders.map((uid) => {
                                      const info = groupMemberInfo[Number(uid)] || {} as any;
                                      const a = info.avatar;
                                      const n = info.name || '';
                                      return (
                                        <img key={uid} src={a ? resolveAvatar(a) : ''} alt={n || 'read by'} className="h-4 w-4 rounded-full object-cover ring-1 ring-white/50 dark:ring-neutral-800" />
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                          </React.Fragment>
                        );
                      });
                      return fragments;
                    })()
                  )}
                  {/* Typing bubbles for group members (exclude monitored user to giảm nhiễu) */}
                  {groupTypingUsers && Object.keys(groupTypingUsers).length > 0 && (
                    Object.entries(groupTypingUsers).map(([uid, info]) => {
                      const id = Number(uid);
                      if (Number(selectedUserId) === id) return null;
                      const member = groupMemberInfo[id] || {};
                      const name = info?.name || member.name || '';
                      const avatarUrl = info?.avatar || member.avatar;
                      const Avatar = (
                        <div className="relative flex-shrink-0">
                          {avatarUrl ? (
                            <img src={resolveAvatar(avatarUrl)} alt={name || 'avatar'} className="h-8 w-8 xl-down:h-6 xl-down:w-6 sm-down:h-5 sm-down:w-5 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 sm-down:h-5 sm-down:w-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs xl-down:text-2xs font-medium">
                              {(name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      );
                      return (
                        <div key={`typing-${id}`} className="flex items-end justify-start">
                          <div className="mr-2 xl-down:mr-1">{Avatar}</div>
                          <div className="relative max-w-[75%] xl-down:max-w-[85%] px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-1.5 sm-down:py-1 rounded-lg xl-down:rounded-md text-sm xl-down:text-xs bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100">
                            <div className="flex items-center space-x-1 opacity-80">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {/* Anchor to ensure we can scroll to the bottom (typing bubbles appended above) */}
                  <div ref={groupEndRef} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {showGroupMembers && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[2147483647]">
          <div className="fixed inset-0 bg-black/40" onClick={closeGroupMembersModal} />
          <div className="fixed inset-y-0 right-0 w-full sm:w-[380px] md:w-[420px] xl-down:w-[320px] sm-down:w-full bg-white dark:bg-neutral-900 shadow-xl border-l border-gray-200 dark:border-neutral-700 flex flex-col">
            <div className="flex items-center justify-between p-4 xl-down:p-3 sm-down:p-2 border-b border-gray-200 dark:border-neutral-700">
              <div className="flex items-center space-x-3 xl-down:space-x-2">
                <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white flex items-center justify-center">
                  <span className="text-sm xl-down:text-xs sm-down:text-2xs font-medium">{(membersModalGroup?.name || '?').charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm xl-down:text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{membersModalGroup?.name || t('userActivity.tabs.groups')}</div>
                  <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">{t('userActivity.monitor.members.title')}</div>
                </div>
              </div>
              <button onClick={closeGroupMembersModal} className="p-2 xl-down:p-1.5 sm-down:p-1 rounded-md xl-down:rounded text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm xl-down:text-xs" aria-label={t('userActivity.monitor.actions.close')}>✕</button>
            </div>

            <div className="flex-1 overflow-auto p-4 xl-down:p-3 sm-down:p-2 space-y-2 xl-down:space-y-1">
              {loadingMembersModal ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('common:loading')}</div>
              ) : membersModalList.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('userActivity.monitor.members.empty')}</div>
              ) : (
                [...membersModalList].sort((a: any, b: any) => {
                  const pri: any = { owner: 0, admin: 1, member: 2 };
                  const pa = pri[a.role] ?? 9; const pb = pri[b.role] ?? 9;
                  if (pa !== pb) return pa - pb;
                  const na = (a.name || '').toLowerCase();
                  const nb = (b.name || '').toLowerCase();
                  if (na < nb) return -1; if (na > nb) return 1; return 0;
                }).map((m: any) => {
                  const role = m.role;
                  return (
                    <div key={m.id} className="flex items-center justify-between p-2 xl-down:p-1.5 sm-down:p-1 rounded-md xl-down:rounded hover:bg-gray-50 dark:hover:bg-neutral-800">
                      <div className="flex items-center space-x-3 xl-down:space-x-2 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          {m.avatar ? (
                            <img src={m.avatar} alt={m.name} className="h-8 w-8 xl-down:h-7 xl-down:w-7 sm-down:h-6 sm-down:w-6 rounded-full object-cover" />
                          ) : (
                            <div className="h-8 w-8 xl-down:h-7 xl-down:w-7 sm-down:h-6 sm-down:w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xs xl-down:text-2xs font-medium">
                              {(m.name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          {role === 'owner' && (
                            <span className="absolute -bottom-1 -right-1 h-4 w-4 xl-down:h-3 xl-down:w-3 rounded-full bg-yellow-400 text-[10px] xl-down:text-[8px] flex items-center justify-center ring-2 ring-white dark:ring-neutral-900" title="Owner">🔑</span>
                          )}
                          {role === 'admin' && (
                            <span className="absolute -bottom-1 -right-1 h-4 w-4 xl-down:h-3 xl-down:w-3 rounded-full bg-blue-500 text-[10px] xl-down:text-[8px] flex items-center justify-center ring-2 ring-white dark:ring-neutral-900" title="Admin">🛡️</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{m.name}</div>
                          <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 truncate">{t('userActivity.monitor.members.id')}: {m.id}</div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {role === 'owner' ? (
                          <span className="inline-flex items-center px-2 py-0.5 xl-down:px-1.5 xl-down:py-0.5 rounded-full text-[10px] xl-down:text-[9px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">{t('userActivity.monitor.members.roles.owner')}</span>
                        ) : role === 'admin' ? (
                          <span className="inline-flex items-center px-2 py-0.5 xl-down:px-1.5 xl-down:py-0.5 rounded-full text-[10px] xl-down:text-[9px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">{t('userActivity.monitor.members.roles.admin')}</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 xl-down:px-1.5 xl-down:py-0.5 rounded-full text-[10px] xl-down:text-[9px] font-medium bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-gray-300">{t('userActivity.monitor.members.roles.member')}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MonitorTab;
