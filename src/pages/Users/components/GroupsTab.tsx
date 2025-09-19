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
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <span className="text-4xl mb-4 block">👥</span>
        <p>{t('userActivity.groups.noGroups')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {currentGroups.map((group) => (
          <div key={group.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {group.avatar ? (
                  <img
                    className="h-12 w-12 rounded-full object-cover"
                    src={group.avatar}
                    alt={group.name}
                  />
                ) : (
                  <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{group.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('userActivity.groups.groupOwner')}: {group.owner.name}</p>
                {group.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{group.description}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
