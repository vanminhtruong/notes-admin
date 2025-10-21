import React from 'react';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@utils/auth';
import Pagination from '@components/common/Pagination';

import { useUsersListState } from './hooks/Manager-useState/useUsersListState';
import { useUsersListModalsState } from './hooks/Manager-useState/useUsersListModalsState';
import { useUsersListHandlers } from './hooks/Manager-handle/useUsersListHandlers';
import { useUsersListModalsHandlers } from './hooks/Manager-handle/useUsersListModalsHandlers';
import { useUsersListUIHelpers } from './hooks/Manager-handle/useUsersListUIHelpers.tsx';
import { useUsersListEffects } from './hooks/Manager-Effects/useUsersListEffects';
import { useUsersListModalsEffects } from './hooks/Manager-Effects/useUsersListModalsEffects';
import UsersTable from './components/UsersTable';
import ConfirmDialog from './components/ConfirmDialog';
import UserDetailModal from './components/UserDetailModal';
import CreateUserModal from './components/CreateUserModal';
import UserSessionsModal from './components/UserSessionsModal';
const UsersList: React.FC = () => {
  const { t } = useTranslation('users');
  const canViewActive = hasPermission('manage_users.view_active_accounts') || hasPermission('manage_users');
  
  // useState hooks
  const usersListState = useUsersListState();
  const modalsState = useUsersListModalsState();

  // Handlers hooks
  const {
    loadUsers,
    updateFilters,
    clearFilters,
    handleToggleStatus,
    handleDeletePermanently,
    closeConfirm
  } = useUsersListHandlers({
    filters: usersListState.filters,
    setLoading: usersListState.setLoading,
    setUsers: usersListState.setUsers,
    setTotalPages: usersListState.setTotalPages,
    setTotalItems: usersListState.setTotalItems,
    setFilters: usersListState.setFilters,
    setConfirmState: usersListState.setConfirmState
  });

  const {
    openUserModal,
    closeUserModal,
    handleCreateSuccess,
    handleViewSessions,
    closeSessionsModal,
    handleUserUpdated
  } = useUsersListModalsHandlers({
    setDetailUser: modalsState.setDetailUser,
    setOpenDetail: modalsState.setOpenDetail,
    setSessionUser: modalsState.setSessionUser,
    setSessionsModalOpen: modalsState.setSessionsModalOpen,
    setUsers: usersListState.setUsers,
    detailUser: modalsState.detailUser
  });

  const { formatDate, getStatusBadge, getRoleBadge } = useUsersListUIHelpers();

  // Effects hooks
  useUsersListEffects({
    loadUsers
  });

  useUsersListModalsEffects({
    openDetail: modalsState.openDetail,
    filters: usersListState.filters,
    setOpenDetail: modalsState.setOpenDetail,
    setDetailUser: modalsState.setDetailUser
  });

  // Destructure để dùng trong component
  const { users, loading, totalPages, totalItems, filters, confirmState, setConfirmState } = usersListState;
  const { openDetail, detailUser, openCreateModal, setOpenCreateModal, sessionsModalOpen, sessionUser } = modalsState;
  
  // Permissions
  const canViewDetail = hasPermission('manage_users.view_detail');
  const canCreateUser = hasPermission('manage_users.create');


  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between xl-down:flex-col xl-down:items-start">
        <div className="xl-down:w-full">
          <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">{t('userList')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 text-sm xl-down:text-xs">{t('subtitle')}</p>
        </div>
        {canCreateUser && (
          <button
            onClick={() => setOpenCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm xl-down:text-xs mt-4 sm:mt-0 xl-down:mt-3 sm-down:mt-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('create.title')}
          </button>
        )}
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
              autoComplete="off"
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xl-down:text-xs"
            />
          </div>

          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
              {t('filters.userType')}
            </label>
            <div className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 rounded-lg xl-down:rounded-md text-sm xl-down:text-xs">
              {t('roles.user')} {t('filters.only')}
            </div>
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
          onViewSessions={handleViewSessions}
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
        onUserUpdated={handleUserUpdated}
      />
      {/* Pagination (common) - chỉ hiển thị khi có từ 2 trang trở lên */}
      {totalPages > 1 && (
        <Pagination
          currentPage={filters.currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={5}
          onPageChange={(page) => updateFilters({ currentPage: page })}
        />
      )}
      {/* Create User Modal */}
      <CreateUserModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
      {/* Sessions Modal */}
      {sessionUser && (
        <UserSessionsModal
          isOpen={sessionsModalOpen}
          onClose={closeSessionsModal}
          userId={sessionUser.id}
          userName={sessionUser.name}
        />
      )}
      {/* Confirm Dialog */}
      <ConfirmDialog state={confirmState} onClose={closeConfirm} setState={setConfirmState} />
    </div>
  );
};


export default UsersList;
