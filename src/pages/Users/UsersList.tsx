import React from 'react';
import { useTranslation } from 'react-i18next';

import { useUsersList } from './hooks/useUsersList';
import UsersTable from './components/UsersTable';
import ConfirmDialog from './components/ConfirmDialog';

const UsersList: React.FC = () => {
  const { t } = useTranslation('users');
  const {
    users,
    loading,
    totalPages,
    filters,
    confirmState,
    updateFilters,
    clearFilters,
    handleToggleStatus,
    handleDeletePermanently,
    closeConfirm,
    setConfirmState
  } = useUsersList();


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
        {t('status.active')}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
        {t('status.disabled')}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <span className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
        {t('roles.admin')}
      </span>
    ) : (
      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
        {t('roles.user')}
      </span>
    );
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('userList')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('searchUser')}
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              placeholder={t('searchPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('filters.role')}
            </label>
            <select
              value={filters.roleFilter}
              onChange={(e) => updateFilters({ roleFilter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('filters.all')}</option>
              <option value="user">{t('roles.user')}</option>
              <option value="admin">{t('roles.admin')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('filters.status')}
            </label>
            <select
              value={filters.activeFilter}
              onChange={(e) => updateFilters({ activeFilter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('filters.all')}</option>
              <option value="true">{t('status.active')}</option>
              <option value="false">{t('status.disabled')}</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              {t('filters.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <UsersTable
          users={users}
          loading={loading}
          totalPages={totalPages}
          currentPage={filters.currentPage}
          onPageChange={(page: number) => updateFilters({ currentPage: page })}
          onToggleStatus={handleToggleStatus}
          onDeletePermanently={handleDeletePermanently}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getRoleBadge={getRoleBadge}
        />
      </div>
      {/* Confirm Dialog */}
      <ConfirmDialog state={confirmState} onClose={closeConfirm} setState={setConfirmState} />
    </div>
  );
};


export default UsersList;
