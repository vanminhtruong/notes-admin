import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { UserActivityData, TypingInfo } from '../interfaces';

interface MonitorTabProps {
  activityData: UserActivityData | null;
  selectedUserId: number | null;
  typingInfo: TypingInfo | null;
  formatDate: (dateString: string) => string;
  monitorState: any;
  groupInfo: any;
  groupMemberInfo: any;
  groupTyping: any;
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
  updateMonitorState
}) => {
  const { t } = useTranslation('users');
  const { monitorTab, selectedFriendId, selectedGroupId, dmMessages, groupMessages, loadingDm, loadingGroup } = monitorState;

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
        <div className="grid grid-cols-1 lg:grid-cols-3 xl-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
          {/* Friends list */}
          <div className="lg:col-span-1">
            <h4 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 mb-2 xl-down:mb-1">{t('userActivity.monitor.friendsList')}</h4>
            <div className="space-y-2 xl-down:space-y-1 max-h-[520px] xl-down:max-h-[300px] sm-down:max-h-[200px] overflow-auto pr-1">
              {activityData?.activity.friends.map((f) => (
                <button key={f.id} onClick={() => { updateMonitorState({ selectedFriendId: f.id }); loadDm(f.id); }} className={`w-full flex items-center p-3 xl-down:p-2 sm-down:p-1.5 rounded-lg xl-down:rounded-md border text-left ${selectedFriendId === f.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700'}`}>
                  <div className="flex-shrink-0 h-9 w-9 xl-down:h-7 xl-down:w-7 sm-down:h-6 sm-down:w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center">
                    <span className="text-sm xl-down:text-xs sm-down:text-2xs font-medium">{f.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="ml-3 xl-down:ml-2 flex-1 min-w-0">
                    <p className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{f.name}</p>
                    <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 truncate">{f.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* DM Viewer */}
          <div className="lg:col-span-2">
            {!selectedFriendId ? (
              <div className="h-[520px] xl-down:h-[300px] sm-down:h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700 text-sm xl-down:text-xs">
                {t('userActivity.monitor.selectFriendToView')}
              </div>
            ) : (
              <div className="h-[520px] xl-down:h-[300px] sm-down:h-[200px] flex flex-col bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700">
                <div className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between xl-down:flex-col xl-down:items-start xl-down:space-y-1">
                  <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">{t('userActivity.monitor.chatWith', { name: activityData?.activity.friends.find(f => f.id === selectedFriendId)?.name || selectedFriendId })}</div>
                  {typingInfo && typingInfo.withUserId === selectedFriendId && (
                    <div className="text-xs xl-down:text-2xs text-blue-600 dark:text-blue-400">{t('userActivity.typing.typingWith', { name: activityData?.activity.friends.find(f => f.id === selectedFriendId)?.name || typingInfo.withUserName })}</div>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-4 xl-down:p-3 sm-down:p-2 space-y-3 xl-down:space-y-2">
                  {loadingDm ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('common:loading')}</div>
                  ) : dmMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('userActivity.monitor.noMessages')}</div>
                  ) : (
                    dmMessages.map((m: any) => (
                      <div key={m.id} className={`flex ${Number(m.senderId) === Number(selectedUserId) ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] xl-down:max-w-[85%] px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-1.5 sm-down:py-1 rounded-lg xl-down:rounded-md text-sm xl-down:text-xs ${Number(m.senderId) === Number(selectedUserId) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100'}`}>
                          <div className="whitespace-pre-wrap break-words">{m.content}</div>
                          <div className="text-[10px] xl-down:text-[9px] opacity-70 mt-1 xl-down:mt-0.5">{formatDate(m.createdAt)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
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
                      <div className="flex-shrink-0 h-9 w-9 xl-down:h-7 xl-down:w-7 sm-down:h-6 sm-down:w-6 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white flex items-center justify-center">
                        <span className="text-sm xl-down:text-xs sm-down:text-2xs font-medium">{(g.name || '?').charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="ml-3 xl-down:ml-2 flex-1 min-w-0">
                        <p className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{g.name}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setOpenGroupMenuId(openGroupMenuId === g.id ? null : g.id); }}
                      className="p-1.5 xl-down:p-1 rounded-md xl-down:rounded text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-neutral-700/60 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm xl-down:text-xs"
                      aria-label={t('userActivity.monitor.actions.viewMembers')}
                    >
                      ⋮
                    </button>
                  </div>
                  {openGroupMenuId === g.id && (
                    <div
                      className="absolute right-2 top-10 xl-down:top-8 z-50 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-md xl-down:rounded shadow-lg py-1 min-w-[200px] xl-down:min-w-[150px]"
                      onClick={(e) => e.stopPropagation()}
                      role="menu"
                    >
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setOpenGroupMenuId(null); openGroupMembersModal(g); }}
                        className="w-full text-left px-3 py-2 xl-down:px-2 xl-down:py-1.5 text-sm xl-down:text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                        role="menuitem"
                      >
                        👥 {t('userActivity.monitor.actions.viewMembers')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Group Viewer */}
          <div className="lg:col-span-2">
            {!selectedGroupId ? (
              <div className="h-[520px] xl-down:h-[300px] sm-down:h-[200px] flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700 text-sm xl-down:text-xs">
                {t('userActivity.monitor.selectGroupToView')}
              </div>
            ) : (
              <div className="h-[520px] xl-down:h-[300px] sm-down:h-[200px] flex flex-col bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700">
                <div className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border-b border-gray-200 dark:border-neutral-700 flex items-center justify-between xl-down:flex-col xl-down:items-start xl-down:space-y-1">
                  <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">{t('userActivity.monitor.groupChat')}</div>
                  {groupTyping && (
                    <div className="text-xs xl-down:text-2xs text-blue-600 dark:text-blue-400">{t('userActivity.typing.typingInGroup')}</div>
                  )}
                </div>
                <div className="flex-1 overflow-auto p-4 xl-down:p-3 sm-down:p-2 space-y-3 xl-down:space-y-2">
                  {loadingGroup ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('common:loading')}</div>
                  ) : groupMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">{t('userActivity.monitor.noMessages')}</div>
                  ) : (
                    groupMessages.map((m: any) => {
                      const isSystem = m?.messageType === 'system' || (typeof m?.content === 'string' && m.content.toLowerCase().includes('joined the group'));
                      if (isSystem) {
                        return (
                          <div key={m.id} className="flex justify-center">
                            <div className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
                              {m.content}
                            </div>
                          </div>
                        );
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
                            <img src={avatarUrl} alt={name || 'avatar'} className="h-8 w-8 xl-down:h-6 xl-down:w-6 sm-down:h-5 sm-down:w-5 rounded-full object-cover" />
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
                      return (
                        <div key={m.id} className={`flex items-end ${mine ? 'justify-end' : 'justify-start'}`}>
                          {!mine && <div className="mr-2 xl-down:mr-1">{Avatar}</div>}
                          <div className={`max-w-[75%] xl-down:max-w-[85%] px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-1.5 sm-down:py-1 rounded-lg xl-down:rounded-md text-sm xl-down:text-xs ${mine ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100'}`}>
                            <div className="font-medium mb-0.5 xl-down:mb-0.5 opacity-80 text-xs xl-down:text-2xs">{name}</div>
                            <div className="whitespace-pre-wrap break-words">{m.content}</div>
                            <div className="text-[10px] xl-down:text-[9px] opacity-70 mt-1 xl-down:mt-0.5">{formatDate(m.createdAt)}</div>
                          </div>
                          {mine && <div className="ml-2 xl-down:ml-1">{Avatar}</div>}
                        </div>
                      );
                    })
                  )}
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
