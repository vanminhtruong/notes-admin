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
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {activityData.user.avatar ? (
            <img
              className="h-16 w-16 rounded-full object-cover"
              src={activityData.user.avatar}
              alt={activityData.user.name}
            />
          ) : (
            <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-medium">
                {activityData.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{activityData.user.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">{activityData.user.email}</p>
          {activityData.user.lastSeenAt && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('lastActivity')}: {formatDate(activityData.user.lastSeenAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;
