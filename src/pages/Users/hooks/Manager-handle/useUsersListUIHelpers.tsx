import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useUsersListUIHelpers = () => {
  const { t } = useTranslation('users');

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const getStatusBadge = useCallback((isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
        {t('status.active')}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
        {t('status.disabled')}
      </span>
    );
  }, [t]);

  const getRoleBadge = useCallback((role: string) => {
    return role === 'admin' ? (
      <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
        {t('roles.admin')}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
        {t('roles.user')}
      </span>
    );
  }, [t]);

  return {
    formatDate,
    getStatusBadge,
    getRoleBadge
  };
};
