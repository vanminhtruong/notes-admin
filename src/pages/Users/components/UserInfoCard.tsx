import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UserActivityData } from '../interfaces';

interface UserInfoCardProps {
  activityData: UserActivityData | null;
  formatDate: (dateString: string) => string;
}

const UserInfoCard: React.FC<UserInfoCardProps> = ({ activityData, formatDate }) => {
  const { t } = useTranslation('users');

  if (!activityData) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-6 xl-down:p-4 sm-down:p-3">
      <div className="flex items-center space-x-4 xl-down:space-x-3 sm-down:space-x-2">
        <div className="flex-shrink-0">
          {activityData.user.avatar ? (
            <img
              className="h-16 w-16 xl-down:h-12 xl-down:w-12 sm-down:h-10 sm-down:w-10 rounded-full object-cover"
              src={activityData.user.avatar}
              alt={activityData.user.name}
            />
          ) : (
            <div className="h-16 w-16 xl-down:h-12 xl-down:w-12 sm-down:h-10 sm-down:w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl xl-down:text-lg sm-down:text-base font-medium">
                {activityData.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl xl-down:text-lg sm-down:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{activityData.user.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base xl-down:text-sm sm-down:text-xs truncate">{activityData.user.email}</p>
          {activityData.user.lastSeenAt && (
            <p className="text-sm xl-down:text-xs sm-down:text-2xs text-gray-500 dark:text-gray-400">
              {t('lastActivity')}: {formatDate(activityData.user.lastSeenAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;
