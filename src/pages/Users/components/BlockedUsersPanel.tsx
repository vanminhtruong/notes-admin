import React from 'react';
import { ShieldOff, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BlockedUsersPanelProps {
  blockedUsers: any[];
  loading: boolean;
  formatDate: (dateString: string) => string;
  resolveAvatar: (url?: string | null) => string;
}

const BlockedUsersPanel: React.FC<BlockedUsersPanelProps> = ({
  blockedUsers,
  loading,
  formatDate,
  resolveAvatar
}) => {
  const { t } = useTranslation('users');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">
        {t('common:loading')}
      </div>
    );
  }

  if (!blockedUsers || blockedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
        <ShieldOff className="w-12 h-12 xl-down:w-10 xl-down:h-10 mb-2 opacity-30" />
        <p className="text-sm xl-down:text-xs">
          {t('userActivity.monitor.noBlockedUsers', 'Chưa chặn ai')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 xl-down:space-y-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-lg xl-down:rounded-md border border-red-200 dark:border-red-800">
        <ShieldOff className="w-4 h-4 text-red-600 dark:text-red-400" />
        <span className="text-sm xl-down:text-xs font-medium text-red-900 dark:text-red-100">
          {t('userActivity.monitor.blockedUsers', 'Người dùng bị chặn')} ({blockedUsers.length})
        </span>
      </div>

      <div className="space-y-2 xl-down:space-y-1.5 max-h-[300px] xl-down:max-h-[200px] overflow-y-auto pr-2">
        {blockedUsers.map((bu) => {
          const user = bu.blockedUser;
          if (!user) return null;

          return (
            <div
              key={bu.id}
              className="bg-white dark:bg-neutral-800 rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700 p-3 xl-down:p-2 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 xl-down:gap-2">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={resolveAvatar(user.avatar)}
                      alt={user.name}
                      className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center text-sm xl-down:text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <UserX className="w-3.5 h-3.5 xl-down:w-3 xl-down:h-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                  </div>
                  <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs xl-down:text-2xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {t('userActivity.monitor.blockedAt', { 
                      date: formatDate(bu.blockedAt), 
                      defaultValue: `Đã chặn lúc ${formatDate(bu.blockedAt)}` 
                    })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlockedUsersPanel;
