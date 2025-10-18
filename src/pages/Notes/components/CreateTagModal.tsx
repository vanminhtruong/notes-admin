import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Pagination from '@components/common/Pagination';
import adminService from '@services/adminService';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface CreateTagModalProps {
  hook: any;
}

const CreateTagModal: React.FC<CreateTagModalProps> = ({ hook }) => {
  const { t } = useTranslation('notes');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const USERS_PER_PAGE = 3;

  const selectedUser = users.find(u => u.id.toString() === hook.formData.userId);

  useEffect(() => {
    if (hook.showCreateModal) {
      loadUsers();
    }
  }, [hook.showCreateModal, searchTerm, currentPage]);

  useEffect(() => {
    if (searchTerm) setCurrentPage(1);
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response: any = await adminService.getAllUsers({
        search: searchTerm || undefined,
        page: currentPage,
        limit: USERS_PER_PAGE,
        role: 'user',
      });
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSelect = (user: User) => {
    hook.setFormData({ ...hook.formData, userId: user.id.toString() });
  };

  if (!hook.showCreateModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 xl-down:p-3">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-xl max-w-2xl xl-down:max-w-xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 xl-down:p-3 border-b border-gray-200 dark:border-neutral-700">
          <h3 className="text-lg xl-down:text-base font-semibold text-gray-900 dark:text-white">{t('tags.modal.create')}</h3>
          <button
            onClick={hook.closeCreateModal}
            className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg xl-down:rounded-md transition-colors"
          >
            <X className="w-5 h-5 xl-down:w-4 xl-down:h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={hook.handleCreate} className="p-4 xl-down:p-3 space-y-4 xl-down:space-y-3 overflow-y-auto flex-1">
          {/* User Selection */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
              {t('tags.form.user.required')}
            </label>

            {/* Search */}
            {!selectedUser && (
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('tags.form.searchUser')}
                className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs mb-3"
              />
            )}

            {/* Selected User */}
            {selectedUser && (
              <div className="p-4 xl-down:p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg xl-down:rounded-md mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 xl-down:space-x-2">
                    {selectedUser.avatar ? (
                      <img
                        src={selectedUser.avatar}
                        alt={selectedUser.name}
                        className="w-10 h-10 xl-down:w-8 xl-down:h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 xl-down:w-8 xl-down:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm xl-down:text-xs">
                          {selectedUser.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs">{selectedUser.name}</p>
                      <p className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => hook.setFormData({ ...hook.formData, userId: '' })}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm xl-down:text-xs"
                  >
                    {t('tags.form.changeUser')}
                  </button>
                </div>
              </div>
            )}

            {/* Users List */}
            {!selectedUser && (
              <div className="space-y-2">
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : users.length > 0 ? (
                  <>
                    {users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleUserSelect(user)}
                        className="w-full flex items-center p-3 xl-down:p-2 rounded-lg xl-down:rounded-md transition-colors border border-gray-200 dark:border-neutral-600 hover:bg-gray-50 dark:hover:bg-neutral-700"
                      >
                        <div className="flex-shrink-0">
                          {user.avatar ? (
                            <img
                              className="h-10 w-10 xl-down:h-8 xl-down:w-8 rounded-full object-cover"
                              src={user.avatar}
                              alt={user.name}
                            />
                          ) : (
                            <div className="h-10 w-10 xl-down:h-8 xl-down:w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm xl-down:text-xs font-medium">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3 xl-down:ml-2 text-left flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs">{user.name}</p>
                          <p className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </button>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-4">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm xl-down:text-xs">
                    {t('tags.form.noUsersFound')}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tag Name */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('tags.form.name.label')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={hook.formData.name}
              onChange={(e) => hook.setFormData({ ...hook.formData, name: e.target.value })}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs"
              placeholder={t('tags.form.name.placeholder')}
              required
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 xl-down:mb-1">
              {t('tags.form.color.label')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={hook.formData.color}
                onChange={(e) => hook.setFormData({ ...hook.formData, color: e.target.value })}
                className="w-20 h-10 xl-down:w-16 xl-down:h-8 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md cursor-pointer"
              />
              <div className="flex items-center gap-2 flex-1">
                <div 
                  className="w-10 h-10 xl-down:w-8 xl-down:h-8 rounded-lg xl-down:rounded-md border border-gray-300 dark:border-neutral-600"
                  style={{ backgroundColor: hook.formData.color }}
                />
                <input
                  type="text"
                  value={hook.formData.color}
                  onChange={(e) => hook.setFormData({ ...hook.formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 xl-down:px-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs font-mono uppercase"
                  placeholder="#000000"
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={hook.closeCreateModal}
              className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg xl-down:rounded-md transition-colors text-sm xl-down:text-xs"
            >
              {t('tags.actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={!hook.formData.userId || !hook.formData.name}
              className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg xl-down:rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm xl-down:text-xs"
            >
              {t('tags.actions.create')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateTagModal;
