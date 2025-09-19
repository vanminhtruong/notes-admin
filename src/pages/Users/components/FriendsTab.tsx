import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@hooks/usePagination';
import Pagination from '@components/common/Pagination';
import type { UserActivityData } from '../interfaces';

interface FriendsTabProps {
  activityData: UserActivityData | null;
  formatDate: (dateString: string) => string;
}

const FriendsTab: React.FC<FriendsTabProps> = ({ activityData, formatDate }) => {
  const { t } = useTranslation('users');

  const friends = activityData?.activity.friends || [];
  const {
    currentItems: currentFriends,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage
  } = usePagination<any>({ data: friends, itemsPerPage: 12 }); // 3x4 grid per page

  if (friends.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <span className="text-4xl mb-4 block">👫</span>
        <p>{t('userActivity.friends.noFriends')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentFriends.map((friend) => (
          <div key={friend.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {friend.avatar ? (
                  <img
                    className="h-10 w-10 rounded-full object-cover"
                    src={friend.avatar}
                    alt={friend.name}
                  />
                ) : (
                  <div className="h-10 w-10 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{friend.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{friend.email}</p>
                {friend.lastSeenAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('userActivity.friends.activity')}: {formatDate(friend.lastSeenAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          showInfo={true}
        />
      )}
    </div>
  );
};

export default FriendsTab;
