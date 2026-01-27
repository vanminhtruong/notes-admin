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
      {/* Header Section */}
      <div className="relative mb-2">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-teal-600/5 to-cyan-600/5 dark:from-emerald-500/10 dark:via-teal-500/10 dark:to-cyan-500/10 rounded-2xl xl-down:rounded-xl -z-10" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 xl-down:p-4 sm-down:p-3">
          <div className="flex items-center gap-4 xl-down:gap-3">
            <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 sm-down:w-10 sm-down:h-10 rounded-2xl xl-down:rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 dark:shadow-emerald-500/15">
              <svg className="w-7 h-7 xl-down:w-6 xl-down:h-6 sm-down:w-5 sm-down:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">{t('userList')}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm xl-down:text-xs">{t('subtitle')}</p>
            </div>
          </div>
          {canCreateUser && (
            <button
              onClick={() => setOpenCreateModal(true)}
              className="group mt-4 sm:mt-0 px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl xl-down:rounded-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center gap-2.5 text-sm xl-down:text-xs font-medium"
            >
              <svg className="h-5 w-5 xl-down:h-4 xl-down:w-4 transition-transform group-hover:rotate-90 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="sm-down:hidden">{t('create.title')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 p-5 xl-down:p-4 sm-down:p-3 hover:shadow-md transition-shadow duration-300">
        <div className="grid grid-cols-1 md:grid-cols-4 xl-down:grid-cols-2 lg-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
          {/* Search Input */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              {t('searchUser')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                placeholder={t('searchPlaceholder')}
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 xl-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-xl xl-down:rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm xl-down:text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              {t('filters.userType')}
            </label>
            <div className="w-full px-4 py-2.5 xl-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-neutral-800 dark:to-neutral-700/50 text-gray-600 dark:text-gray-300 rounded-xl xl-down:rounded-lg text-sm xl-down:text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t('roles.user')} {t('filters.only')}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              {t('filters.status')}
            </label>
            <div className="relative">
              <select
                value={filters.activeFilter}
                onChange={(e) => updateFilters({ activeFilter: e.target.value })}
                className="w-full px-4 py-2.5 xl-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-xl xl-down:rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm xl-down:text-xs appearance-none cursor-pointer"
              >
                <option value="">{t('filters.all')}</option>
                <option value="true" disabled={!canViewActive} title={!canViewActive ? t('alerts.noPermission') : undefined}>{t('status.active')}</option>
                <option value="false">{t('status.disabled')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Clear Button */}
          <div className="flex items-end xl-down:col-span-2 lg-down:col-span-1">
            <button
              onClick={clearFilters}
              className="group w-full xl-down:w-auto px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700 hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg transition-all duration-300 text-sm xl-down:text-xs font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {t('filters.clear')}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 overflow-hidden xl-down:overflow-x-auto hover:shadow-md transition-shadow duration-300">
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
