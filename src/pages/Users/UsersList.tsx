import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@utils/auth';
import Pagination from '@components/common/Pagination';

import { useUsersList } from './hooks/useUsersList';
import UsersTable from './components/UsersTable';
import ConfirmDialog from './components/ConfirmDialog';
import UserDetailModal from './components/UserDetailModal';
import type { User } from './interfaces';

const UsersList: React.FC = () => {
  const { t } = useTranslation('users');
  const canViewActive = hasPermission('manage_users.view_active_accounts') || hasPermission('manage_users');
  const {
    users,
    loading,
    totalPages,
    totalItems,
    filters,
    confirmState,
    updateFilters,
    clearFilters,
    handleToggleStatus,
    handleDeletePermanently,
    closeConfirm,
    setConfirmState
  } = useUsersList();

  // Modal chi tiết user (hoist state)
  const [openDetail, setOpenDetail] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const openUserModal = (user: User) => { setDetailUser(user); setOpenDetail(true); };
  const canViewDetail = hasPermission('manage_users.view_detail');
  const closeUserModal = () => { setOpenDetail(false); setDetailUser(null); };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Đóng modal khi thay đổi phân trang/bộ lọc để tránh flicker
  useEffect(() => {
    if (openDetail) {
      setOpenDetail(false);
      setDetailUser(null);
    }
  }, [filters.currentPage, filters.searchTerm, filters.roleFilter, filters.activeFilter]);

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
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between xl-down:flex-col xl-down:items-start">
        <div className="xl-down:w-full">
          <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">{t('userList')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 text-sm xl-down:text-xs">{t('subtitle')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2">
        <div className="grid grid-cols-1 md:grid-cols-4 xl-down:grid-cols-2 lg-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
              {t('searchUser')}
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              placeholder={t('searchPlaceholder')}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xl-down:text-xs"
            />
          </div>

          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
              {t('filters.role')}
            </label>
            <select
              value={filters.roleFilter}
              onChange={(e) => updateFilters({ roleFilter: e.target.value })}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xl-down:text-xs"
            >
              <option value="">{t('filters.all')}</option>
              <option value="user">{t('roles.user')}</option>
              <option value="admin">{t('roles.admin')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
              {t('filters.status')}
            </label>
            <select
              value={filters.activeFilter}
              onChange={(e) => updateFilters({ activeFilter: e.target.value })}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xl-down:text-xs"
            >
              <option value="">{t('filters.all')}</option>
              <option value="true" disabled={!canViewActive} title={!canViewActive ? t('alerts.noPermission') : undefined}>{t('status.active')}</option>
              <option value="false">{t('status.disabled')}</option>
            </select>
          </div>

          <div className="flex items-end xl-down:col-span-2 lg-down:col-span-1">
            <button
              onClick={clearFilters}
              className="w-full xl-down:w-auto px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-sm xl-down:text-xs"
            >
              {t('filters.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden xl-down:overflow-x-auto">
        <UsersTable
          users={users}
          loading={loading}
          onToggleStatus={handleToggleStatus}
          onDeletePermanently={handleDeletePermanently}
          formatDate={formatDate}
          getStatusBadge={getStatusBadge}
          getRoleBadge={getRoleBadge}
          onRowClick={canViewDetail ? openUserModal : undefined}
        />
      </div>
      {/* User Detail Modal (render tại UsersList để bền vững khi loading/pagination) */}
      <UserDetailModal
        open={openDetail}
        user={detailUser}
        onClose={closeUserModal}
        formatDate={formatDate}
        getStatusBadge={getStatusBadge}
        getRoleBadge={getRoleBadge}
      />
      {/* Pagination (common) - đặt ngoài thẻ card để đảm bảo không bị ẩn bởi overflow */}
      <Pagination
        currentPage={filters.currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={5}
        onPageChange={(page) => updateFilters({ currentPage: page })}
      />
      {/* Confirm Dialog */}
      <ConfirmDialog state={confirmState} onClose={closeConfirm} setState={setConfirmState} />
    </div>
  );
};


export default UsersList;
