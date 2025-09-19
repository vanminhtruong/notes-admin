import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useUserActivity } from './hooks/useUserActivity';
import { useNotifications } from './hooks/useNotifications';
import { useMonitor } from './hooks/useMonitor';
import MessagesTab from './components/MessagesTab';
import NotificationsTab from './components/NotificationsTab';
import GroupsTab from './components/GroupsTab';
import FriendsTab from './components/FriendsTab';
import UserSelector from './components/UserSelector';
import UserInfoCard from './components/UserInfoCard';
import MonitorTab from './components/MonitorTab';

const UserActivity: React.FC = () => {
  const { t } = useTranslation('users');
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState<'messages' | 'groups' | 'friends' | 'notifications' | 'monitor'>('messages');
  
  // Sử dụng custom hooks
  const {
    activityData,
    loading,
    selectedUserId,
    setSelectedUserId,
    typingInfo,
    formatDate
  } = useUserActivity();
  
  const {
    notifications,
    loadingNotifications,
    unreadNotificationsCount
  } = useNotifications(selectedUserId);
  
  const {
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
  } = useMonitor(selectedUserId);
  
  // Không cần destructure monitorState nữa vì đã được truyền trực tiếp vào MonitorTab component

  // Set userId from params
  useEffect(() => {
    if (userId) {
      setSelectedUserId(parseInt(userId));
    }
  }, [userId, setSelectedUserId]);


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('userList')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('subtitle')}</p>
      </div>

      <UserSelector selectedUserId={selectedUserId} onUserSelect={setSelectedUserId} />

      {selectedUserId && (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : activityData ? (
            <>
              <UserInfoCard activityData={activityData} formatDate={formatDate} />

              {/* Tabs */}
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700">
                <div className="border-b border-gray-200 dark:border-neutral-700">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { key: 'messages', label: t('userActivity.tabs.messages'), icon: '💬' },
                      { key: 'groups', label: t('userActivity.tabs.groups'), icon: '👥' },
                      { key: 'friends', label: t('userActivity.tabs.friends'), icon: '👫' },
                      { key: 'notifications', label: t('userActivity.tabs.notifications'), icon: '🔔' },
                      { key: 'monitor', label: t('userActivity.tabs.monitor'), icon: '🕵️' }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <span className="relative mr-2">
                          {tab.icon}
                          {tab.key === 'notifications' && unreadNotificationsCount > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg border-2 border-white dark:border-gray-800 animate-pulse">
                              {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                            </span>
                          )}
                        </span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'messages' && <MessagesTab activityData={activityData} typingInfo={typingInfo} formatDate={formatDate} />}
                  {activeTab === 'groups' && <GroupsTab activityData={activityData} formatDate={formatDate} />}
                  {activeTab === 'friends' && <FriendsTab activityData={activityData} formatDate={formatDate} />}
                  {activeTab === 'notifications' && <NotificationsTab notifications={notifications} loadingNotifications={loadingNotifications} formatDate={formatDate} />}
                  {activeTab === 'monitor' && (
                    <MonitorTab
                      activityData={activityData}
                      selectedUserId={selectedUserId}
                      typingInfo={typingInfo}
                      formatDate={formatDate}
                      monitorState={monitorState}
                      groupInfo={groupInfo}
                      groupMemberInfo={groupMemberInfo}
                      groupTyping={groupTyping}
                      showGroupMembers={showGroupMembers}
                      membersModalGroup={membersModalGroup}
                      membersModalList={membersModalList}
                      loadingMembersModal={loadingMembersModal}
                      openGroupMenuId={openGroupMenuId}
                      loadDm={loadDm}
                      loadGroup={loadGroup}
                      openGroupMembersModal={openGroupMembersModal}
                      closeGroupMembersModal={closeGroupMembersModal}
                      setOpenGroupMenuId={setOpenGroupMenuId}
                      updateMonitorState={updateMonitorState}
                    />
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <span className="text-4xl mb-4 block">❌</span>
              <p>{t('cannotLoadUserInfo')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserActivity;
