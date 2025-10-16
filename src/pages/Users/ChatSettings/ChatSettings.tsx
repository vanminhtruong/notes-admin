import React from 'react';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@utils/auth';
import Pagination from '@components/common/Pagination';
import { useChatSettings } from './hooks/useChatSettings';
import FilterBar from './components/FilterBar';
import UserChatSettingsTable from './components/UserChatSettingsTable';

const ChatSettings: React.FC = () => {
  const { t } = useTranslation('chatSettings');
  const {
    users,
    loading,
    totalPages,
    totalItems,
    filters,
    updateFilters,
    clearFilters,
    handleToggleE2EE,
    handleToggleReadStatus,
    handleToggleNonFriends,
    handleToggleHidePhone,
    handleToggleHideBirthDate,
  } = useChatSettings();

  const canView = hasPermission('manage_users.chat_settings.view');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!canView) {
    return (
      <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
        <div>
          <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h1>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-4 block">🔒</span>
          <p>{t('noPermission')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between xl-down:flex-col xl-down:items-start">
        <div className="xl-down:w-full">
          <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 text-sm xl-down:text-xs">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={filters.searchTerm}
        e2eeFilter={filters.e2eeFilter || ''}
        readStatusFilter={filters.readStatusFilter || ''}
        onSearchChange={(value) => updateFilters({ searchTerm: value, currentPage: 1 })}
        onE2eeFilterChange={(value) => updateFilters({ e2eeFilter: value, currentPage: 1 })}
        onReadStatusFilterChange={(value) => updateFilters({ readStatusFilter: value, currentPage: 1 })}
        onClearFilters={clearFilters}
      />

      {/* Chat Settings Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        <UserChatSettingsTable
          users={users}
          loading={loading}
          onToggleE2EE={handleToggleE2EE}
          onToggleReadStatus={handleToggleReadStatus}
          onToggleNonFriends={handleToggleNonFriends}
          onToggleHidePhone={handleToggleHidePhone}
          onToggleHideBirthDate={handleToggleHideBirthDate}
          formatDate={formatDate}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={filters.currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={10}
          onPageChange={(page) => updateFilters({ currentPage: page })}
        />
      )}
    </div>
  );
};

export default ChatSettings;
