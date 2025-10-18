import React from 'react';
import { Plus, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TagsHeaderProps {
  hook: any;
}

const TagsHeader: React.FC<TagsHeaderProps> = ({ hook }) => {
  const { t } = useTranslation('notes');
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 text-gray-400" />
            <input
              type="text"
              value={hook.searchTerm}
              onChange={(e) => {
                hook.setSearchTerm(e.target.value);
                hook.setCurrentPage(1);
              }}
              placeholder={t('tags.searchPlaceholder')}
              className="w-full pl-10 xl-down:pl-9 pr-3 py-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs"
            />
          </div>

          {/* User filter */}
          <select
            value={hook.selectedUserId}
            onChange={(e) => {
              hook.setSelectedUserId(e.target.value);
              hook.setCurrentPage(1);
            }}
            className="px-3 py-2 xl-down:px-2 xl-down:py-1.5 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs"
          >
            <option value="">{t('tags.allUsers')}</option>
            {hook.users.map((user: any) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        {hook.canCreate && (
          <button
            onClick={hook.openCreateModal}
            className="flex items-center gap-2 px-4 py-2 xl-down:px-3 xl-down:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg xl-down:rounded-md transition-colors whitespace-nowrap text-sm xl-down:text-xs"
          >
            <Plus className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
            <span>{t('tags.createTag')}</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mt-3 flex items-center gap-4 text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">
        <span>{t('tags.totalStats', { total: hook.total })}</span>
      </div>
    </div>
  );
};

export default TagsHeader;
