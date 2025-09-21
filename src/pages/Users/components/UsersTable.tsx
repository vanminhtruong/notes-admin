import React from 'react';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@utils/auth';
import type { User } from '../interfaces';

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onToggleStatus: (user: User) => void;
  onDeletePermanently: (user: User) => void;
  formatDate: (date: string) => string;
  getStatusBadge: (isActive: boolean) => React.ReactNode;
  getRoleBadge: (role: string) => React.ReactNode;
  onRowClick?: (user: User) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  onToggleStatus,
  onDeletePermanently,
  formatDate,
  getStatusBadge,
  getRoleBadge,
  onRowClick
}) => {
  const { t } = useTranslation('users');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="overflow-x-auto lg-down:hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead className="bg-gray-50 dark:bg-neutral-800">
            <tr>
              <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('userList')}
              </th>
              <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('filters.role')}
              </th>
              <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('filters.status')}
              </th>
              <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider xl-down:hidden">
                Online
              </th>
              <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider xl-down:hidden">
                {t('lastActivity')}
              </th>
              <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider xl-down:hidden">
                {t('createdAt')}
              </th>
              <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className={`hover:bg-gray-50 dark:hover:bg-neutral-800 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(user)}
              >
                <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 xl-down:h-8 xl-down:w-8">
                      {user.avatar ? (
                        <img
                          className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full object-cover"
                          src={user.avatar}
                          alt={user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium xl-down:text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 xl-down:ml-3">
                      <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate max-w-32">
                        {user.name}
                      </div>
                      <div className="text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 truncate max-w-36">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                  {getStatusBadge(user.isActive)}
                </td>
                <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap xl-down:hidden">
                  {user.isOnline ? (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      <span className="text-xs font-medium text-green-800 dark:text-green-200">
                        {t('online')}
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {t('offline')}
                      </span>
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 xl-down:hidden">
                  {user.lastSeenAt ? formatDate(user.lastSeenAt) : t('neverLoggedIn')}
                </td>
                <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 xl-down:hidden">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2 xl-down:gap-1">
                    {hasPermission('manage_users.view') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); window.location.href = `/users/${user.id}/activity`; }}
                        className="p-2 xl-down:p-1.5 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Xem hoạt động"
                      >
                        <svg className="w-4 h-4 xl-down:w-3 xl-down:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}
                    {hasPermission('manage_notes') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); window.location.href = `/notes?userId=${user.id}`; }}
                        className="p-2 xl-down:p-1.5 text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
                        title="Xem ghi chú"
                      >
                        <svg className="w-4 h-4 xl-down:w-3 xl-down:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    )}
                    {user.role !== 'admin' && (
                      <>
                        {hasPermission('manage_users.activate') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleStatus(user); }}
                            className={`p-2 xl-down:p-1.5 rounded-md transition-colors ${
                              user.isActive 
                                ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                            title={user.isActive ? t('action.disableAccount') : t('action.enableAccount')}
                          >
                            {user.isActive ? (
                              <svg className="w-4 h-4 xl-down:w-3 xl-down:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 xl-down:w-3 xl-down:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                        )}
                        {hasPermission('manage_users.delete_permanently') && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeletePermanently(user); }}
                            className="p-2 xl-down:p-1.5 text-red-700 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                            title="Xóa vĩnh viễn - Không thể hoàn tác!"
                          >
                            <svg className="w-4 h-4 xl-down:w-3 xl-down:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="hidden lg-down:block space-y-3 sm-down:space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-white dark:bg-neutral-900 rounded-lg sm-down:rounded-md border border-gray-200 dark:border-neutral-700 p-4 sm-down:p-3 ${onRowClick ? 'cursor-pointer' : ''}`}
            onClick={() => onRowClick?.(user)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 sm-down:space-x-2 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      className="h-10 w-10 sm-down:h-8 sm-down:w-8 rounded-full object-cover"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-10 w-10 sm-down:h-8 sm-down:w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium sm-down:text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm sm-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                      {user.name}
                    </h3>
                    {user.isOnline && (
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0"></span>
                    )}
                  </div>
                  <p className="text-xs sm-down:text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-2 sm-down:mt-1">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.isActive)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 sm-down:mt-0.5">
                    {t('createdAt')}: {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                {hasPermission('manage_users.view') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); window.location.href = `/users/${user.id}/activity`; }}
                    className="p-1.5 sm-down:p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                    title="Xem hoạt động"
                  >
                    <svg className="w-3 h-3 sm-down:w-2.5 sm-down:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                )}
                {hasPermission('manage_notes') && (
                  <button
                    onClick={(e) => { e.stopPropagation(); window.location.href = `/notes?userId=${user.id}`; }}
                    className="p-1.5 sm-down:p-1 text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
                    title="Xem ghi chú"
                  >
                    <svg className="w-3 h-3 sm-down:w-2.5 sm-down:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                )}
                {user.role !== 'admin' && (
                  <>
                    {hasPermission('manage_users.activate') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleStatus(user); }}
                        className={`p-1.5 sm-down:p-1 rounded transition-colors ${
                          user.isActive 
                            ? 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                        }`}
                        title={user.isActive ? t('action.disableAccount') : t('action.enableAccount')}
                      >
                        {user.isActive ? (
                          <svg className="w-3 h-3 sm-down:w-2.5 sm-down:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 sm-down:w-2.5 sm-down:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                    )}
                    {hasPermission('manage_users.delete_permanently') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeletePermanently(user); }}
                        className="p-1.5 sm-down:p-1 text-red-700 hover:text-red-900 dark:text-red-500 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Xóa vĩnh viễn - Không thể hoàn tác!"
                      >
                        <svg className="w-3 h-3 sm-down:w-2.5 sm-down:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination được render ở UsersList */}
    </>
  );
};

export default UsersTable;
