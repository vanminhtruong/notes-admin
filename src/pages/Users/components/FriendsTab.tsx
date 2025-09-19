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
      <div className="text-center py-8 xl-down:py-6 sm-down:py-4 text-gray-500 dark:text-gray-400">
        <span className="text-4xl xl-down:text-3xl sm-down:text-2xl mb-4 xl-down:mb-3 sm-down:mb-2 block">👫</span>
        <p className="text-sm xl-down:text-xs">{t('userActivity.friends.noFriends')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl-down:grid-cols-2 lg-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
        {currentFriends.map((friend) => (
          <div key={friend.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 sm-down:p-2">
            <div className="flex items-center space-x-3 xl-down:space-x-2">
              <div className="flex-shrink-0">
                {friend.avatar ? (
                  <img
                    className="h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 rounded-full object-cover"
                    src={friend.avatar}
                    alt={friend.name}
                  />
                ) : (
                  <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm xl-down:text-xs sm-down:text-2xs">
                      {friend.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{friend.name}</h4>
                <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 truncate">{friend.email}</p>
                {friend.lastSeenAt && (
                  <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
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
