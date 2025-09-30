import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@hooks/usePagination';
import Pagination from '@components/common/Pagination';
import type { UserActivityData } from '../interfaces';

interface GroupsTabProps {
  activityData: UserActivityData | null;
  formatDate: (dateString: string) => string;
}

const GroupsTab: React.FC<GroupsTabProps> = ({ activityData, formatDate }) => {
  const { t } = useTranslation('users');

  const groups = activityData?.activity.groups || [];
  const {
    currentItems: currentGroups,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage
  } = usePagination<any>({ data: groups, itemsPerPage: 9 }); // 3x3 grid per page

  if (groups.length === 0) {
    return (
      <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2">
        <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 sm-down:p-2">
          <div className="text-center py-8 xl-down:py-6 sm-down:py-4 text-gray-500 dark:text-gray-400">
            <span className="text-4xl xl-down:text-3xl sm-down:text-2xl mb-4 xl-down:mb-3 sm-down:mb-2 block">👥</span>
            <p className="text-sm xl-down:text-xs">{t('userActivity.groups.noGroups')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 xl-down:grid-cols-2 lg-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
        {currentGroups.map((group) => (
          <div key={group.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 sm-down:p-2">
            <div className="flex items-center space-x-3 xl-down:space-x-2">
              <div className="flex-shrink-0">
                {group.avatar ? (
                  <img
                    className="h-12 w-12 xl-down:h-10 xl-down:w-10 sm-down:h-8 sm-down:w-8 rounded-full object-cover"
                    src={group.avatar}
                    alt={group.name}
                  />
                ) : (
                  <div className="h-12 w-12 xl-down:h-10 xl-down:w-10 sm-down:h-8 sm-down:w-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm xl-down:text-xs sm-down:text-2xs">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{group.name}</h4>
                <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 truncate">{t('userActivity.groups.groupOwner')}: {group.owner.name}</p>
                {group.description && (
                  <p className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 truncate">{group.description}</p>
                )}
                <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 mt-1 xl-down:mt-0.5">
                  {t('userActivity.groups.joined')}: {formatDate(group.createdAt)}
                </p>
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

export default GroupsTab;
