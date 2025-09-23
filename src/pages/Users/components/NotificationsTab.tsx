import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePagination } from '@hooks/usePagination';
import Pagination from '@components/common/Pagination';
import type { AdminNotification } from '../interfaces';
import { hasPermission } from '@utils/auth';

interface NotificationsTabProps {
  notifications: AdminNotification[];
  loadingNotifications: boolean;
  formatDate: (dateString: string) => string;
  onDelete?: (notificationId: number) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifications, loadingNotifications, formatDate, onDelete }) => {
  const { t } = useTranslation('users');
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);
  const canDelete = hasPermission('manage_users.activity.notifications.delete');

  const {
    currentItems: currentNotifications,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage
  } = usePagination<AdminNotification>({ data: notifications, itemsPerPage: 10 });

  if (loadingNotifications) {
    return (
      <div className="flex items-center justify-center py-12 xl-down:py-8 sm-down:py-6 text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">
        {t('common:loading')}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 xl-down:py-6 sm-down:py-4 text-gray-500 dark:text-gray-400">
        <span className="text-4xl xl-down:text-3xl sm-down:text-2xl mb-4 xl-down:mb-3 sm-down:mb-2 block">🔔</span>
        <p className="text-sm xl-down:text-xs">{t('userActivity.notifications.noNotifications')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      <div className="space-y-3 xl-down:space-y-2">
        {currentNotifications.map((n) => {
          const isGroupInvite = n.type === 'group_invite';
          const avatarUrl = isGroupInvite ? (n.group?.avatar || null) : (n.fromUser?.avatar || null);
          const displayName = isGroupInvite ? (n.group?.name || t('userActivity.notifications.unknown')) : (n.fromUser?.name || t('userActivity.notifications.unknown'));
          const ts = formatDate(n.updatedAt || n.createdAt);
          const typeBadge = n.type === 'message'
            ? t('userActivity.notifications.types.message')
            : n.type === 'friend_request'
              ? t('userActivity.notifications.types.friend_request')
              : n.type === 'group_invite'
                ? t('userActivity.notifications.types.group_invite')
                : 'Notification';

          let title: string = '';
          let desc: string | null = null;
          if (n.type === 'message') {
            title = t('userActivity.notifications.message.title', { name: displayName });
            const preview = (n.metadata && typeof n.metadata.preview === 'string') ? n.metadata.preview : null;
            desc = preview ? t('userActivity.notifications.message.preview', { preview }) : null;
          } else if (n.type === 'friend_request') {
            title = t('userActivity.notifications.friendRequest.title', { name: displayName });
            desc = n.fromUser?.email || null;
          } else if (n.type === 'group_invite') {
            title = t('userActivity.notifications.groupInvite.title', { name: n.group?.name || displayName });
            desc = null;
          } else {
            title = displayName;
            desc = null;
          }

          return (
            <div key={n.id} className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 sm-down:p-2 hover:shadow-sm transition-shadow">
              <div className="flex items-start xl-down:flex-col xl-down:space-y-2">
                <div className="flex-shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 sm-down:h-7 sm-down:w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center text-sm xl-down:text-xs sm-down:text-2xs font-semibold">
                      {(displayName || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="ml-3 xl-down:ml-0 flex-1 min-w-0">
                  <div className="flex items-start justify-between xl-down:flex-col xl-down:space-y-1">
                    <div className="pr-3 xl-down:pr-0 flex-1">
                      <h4 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">{title}</h4>
                      {desc && (
                        <p className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 break-words">{desc}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 xl-down:space-x-1 xl-down:self-end relative">
                      <span className="inline-flex items-center px-2 py-0.5 xl-down:px-1.5 xl-down:py-0.5 rounded-full text-[10px] xl-down:text-[9px] font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {typeBadge}
                      </span>
                      <span className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{ts}</span>
                      {canDelete && onDelete && (
                        <>
                          <button
                            aria-label={t('userActivity.notifications.actions.menu')}
                            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => setOpenMenuId(openMenuId === n.id ? null : n.id)}
                          >
                            ⋯
                          </button>
                          {openMenuId === n.id && (
                            <div className="absolute right-0 top-6 z-10 w-40 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md shadow-lg overflow-hidden">
                              <button
                                className="w-full text-left px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={() => {
                                  setOpenMenuId(null);
                                  onDelete(n.id);
                                }}
                              >
                                {t('userActivity.notifications.actions.delete')}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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

export default NotificationsTab;
