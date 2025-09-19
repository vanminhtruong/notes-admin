import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import type { User } from '../interfaces';

interface UserSelectorProps {
  selectedUserId: number | null;
  onUserSelect: (userId: number) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ selectedUserId, onUserSelect }) => {
  const { t } = useTranslation('users');
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [searchTerm]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const response = await adminService.getAllUsers({
        search: searchTerm || undefined,
        limit: 20
      });
      setUsers(response.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      let errorMessage = t('userActivity.errors.cannotLoadUsers');
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 500) {
        errorMessage = t('userActivity.errors.serverError');
      }
      
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <>
      {/* Search Bar */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('searchUser')}</h3>
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => loadUsers()}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
          >
            {t('common:buttons.tryAgain')}
          </button>
        </div>
      )}

      {/* Users Grid */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('userList')}</h3>
        
        {loadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500 dark:text-gray-400">{t('loadingUsers')}</span>
          </div>
        ) : users.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user.id)}
                className={`flex items-center p-4 rounded-lg border transition-all duration-200 text-left ${
                  selectedUserId === user.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-700' 
                    : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-700'
                }`}
              >
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                {selectedUserId === user.id && (
                  <div className="flex-shrink-0 ml-2">
                    <span className="text-blue-500">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mb-4 text-gray-400 dark:text-gray-500">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchTerm ? t('noUsersFound') : t('enterKeywordToSearch')}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default UserSelector;
