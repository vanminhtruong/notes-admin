import React from 'react';
import { useAdminPermissions } from '@hooks/useAdminPermissions';
import { hasPermission } from '@utils/auth';
import type { UserChatSettings } from '../interfaces';
import ChatSettingsDesktopTable from './ChatSettingsDesktopTable';
import ChatSettingsMobileCard from './ChatSettingsMobileCard';

interface UserChatSettingsTableProps {
  users: UserChatSettings[];
  loading: boolean;
  onToggleReadStatus: (userId: number, currentValue: boolean) => void;
  onToggleNonFriends: (userId: number, currentValue: boolean) => void;
  onToggleHidePhone: (userId: number, currentValue: boolean) => void;
  onToggleHideBirthDate: (userId: number, currentValue: boolean) => void;
  formatDate: (date: string) => string;
}

const UserChatSettingsTable: React.FC<UserChatSettingsTableProps> = ({
  users,
  loading,
  onToggleReadStatus,
  onToggleNonFriends,
  onToggleHidePhone,
  onToggleHideBirthDate,
  formatDate,
}) => {
  useAdminPermissions();
  const canEdit = hasPermission('manage_users.chat_settings.edit');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 xl-down:py-10 md-down:py-8 sm-down:py-6">
        <div className="animate-spin rounded-full h-8 w-8 xl-down:h-7 xl-down:w-7 sm-down:h-6 sm-down:w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 xl-down:py-12 sm-down:py-8 text-gray-500 dark:text-gray-400">
        <div className="mb-3 text-gray-400 dark:text-gray-500">
          <span className="text-4xl xl-down:text-3xl sm-down:text-2xl">📭</span>
        </div>
        <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-semibold text-gray-800 dark:text-gray-200">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <ChatSettingsDesktopTable
        users={users}
        canEdit={canEdit}
        formatDate={formatDate}
        onToggleReadStatus={onToggleReadStatus}
        onToggleNonFriends={onToggleNonFriends}
        onToggleHidePhone={onToggleHidePhone}
        onToggleHideBirthDate={onToggleHideBirthDate}
      />

      {/* Mobile Card View */}
      <ChatSettingsMobileCard
        users={users}
        canEdit={canEdit}
        formatDate={formatDate}
        onToggleReadStatus={onToggleReadStatus}
        onToggleNonFriends={onToggleNonFriends}
        onToggleHidePhone={onToggleHidePhone}
        onToggleHideBirthDate={onToggleHideBirthDate}
      />
    </>
  );
};

export default UserChatSettingsTable;
