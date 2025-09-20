import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getVisibleUserActivityTabs } from '@utils/auth';

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
  
  // Get visible tabs based on permissions
  const visibleTabs = useMemo(() => getVisibleUserActivityTabs(), []);
  
  // Set default active tab to first visible tab
  const [activeTab, setActiveTab] = useState<'messages' | 'groups' | 'friends' | 'notifications' | 'monitor'>(() => {
    return visibleTabs.length > 0 ? visibleTabs[0].key as any : 'messages';
  });
  
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

  // Ensure active tab is always visible to current user
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some(tab => tab.key === activeTab)) {
      setActiveTab(visibleTabs[0].key as any);
    }
  }, [visibleTabs, activeTab]);

  // If no tabs are visible, show access denied message
  if (visibleTabs.length === 0) {
    return (
      <div className="max-w-7xl xl-down:max-w-full mx-auto space-y-6">
        <div>
          <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">{t('userList')}</h1>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-center py-8 text-gray-500">
            {t('noPermissionForUserActivity')}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl xl-down:max-w-full mx-auto space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      <div>
        <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">{t('userList')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 text-sm xl-down:text-xs">{t('subtitle')}</p>
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
              <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700">
                <div className="border-b border-gray-200 dark:border-neutral-700">
                  {/* Desktop Tabs */}
                  <nav className="flex space-x-8 xl-down:space-x-6 md-down:space-x-4 sm-down:space-x-2 px-6 xl-down:px-4 sm-down:px-3 lg-down:hidden overflow-x-auto">
                    {visibleTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`relative py-4 xl-down:py-3 sm-down:py-2 px-1 border-b-2 font-medium text-sm xl-down:text-xs transition-colors whitespace-nowrap ${
                          activeTab === tab.key
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <span className="relative mr-2 xl-down:mr-1">
                          <span className="xl-down:text-sm sm-down:text-xs">{tab.icon}</span>
                          {tab.key === 'notifications' && unreadNotificationsCount > 0 && (
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[18px] h-[18px] xl-down:min-w-[16px] xl-down:h-[16px] px-1 text-xs xl-down:text-xs font-bold leading-none text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg border-2 border-white dark:border-gray-800 animate-pulse">
                              {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                            </span>
                          )}
                        </span>
                        <span className="xl-down:hidden">{t(tab.label)}</span>
                      </button>
                    ))}
                  </nav>

                  {/* Mobile Tabs - Dropdown */}
                  <div className="hidden lg-down:block px-4 py-3">
                    <select
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {visibleTabs.map((tab) => (
                        <option key={tab.key} value={tab.key}>
                          {tab.icon} {t(tab.label)}
                          {tab.key === 'notifications' && unreadNotificationsCount > 0 && ` (${unreadNotificationsCount})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-6 xl-down:p-4 md-down:p-3 sm-down:p-2">
                  {activeTab === 'messages' && visibleTabs.some(tab => tab.key === 'messages') && (
                    <MessagesTab activityData={activityData} typingInfo={typingInfo} formatDate={formatDate} />
                  )}
                  {activeTab === 'groups' && visibleTabs.some(tab => tab.key === 'groups') && (
                    <GroupsTab activityData={activityData} formatDate={formatDate} />
                  )}
                  {activeTab === 'friends' && visibleTabs.some(tab => tab.key === 'friends') && (
                    <FriendsTab activityData={activityData} formatDate={formatDate} />
                  )}
                  {activeTab === 'notifications' && visibleTabs.some(tab => tab.key === 'notifications') && (
                    <NotificationsTab notifications={notifications} loadingNotifications={loadingNotifications} formatDate={formatDate} />
                  )}
                  {activeTab === 'monitor' && visibleTabs.some(tab => tab.key === 'monitor') && (
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
