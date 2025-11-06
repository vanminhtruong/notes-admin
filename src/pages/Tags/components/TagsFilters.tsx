import React from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TagsFiltersProps {
  searchTerm: string;
  selectedUserId: number | '';
  isLoading: boolean;
  canCreate: boolean;
  onSearchChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onRefresh: () => void;
  onCreateClick: () => void;
}

const TagsFilters: React.FC<TagsFiltersProps> = ({
  searchTerm,
  selectedUserId,
  isLoading,
  canCreate,
  onSearchChange,
  onUserIdChange,
  onRefresh,
  onCreateClick,
}) => {
  const { t } = useTranslation('tags');

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 xl-down:w-4 xl-down:h-4" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 xl-down:py-1.5 sm-down:text-sm border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* Filter by User ID */}
      <div className="w-full md:w-48">
        <input
          type="number"
          placeholder={t('filterByUser')}
          value={selectedUserId}
          onChange={(e) => onUserIdChange(e.target.value)}
          className="w-full px-4 py-2 xl-down:py-1.5 sm-down:text-sm border border-gray-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:text-sm bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          {t('refresh')}
        </button>
        
        {canCreate && (
          <button
            onClick={onCreateClick}
            className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:text-sm bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
            {t('createTag')}
          </button>
        )}
      </div>
    </div>
  );
};

export default TagsFilters;
