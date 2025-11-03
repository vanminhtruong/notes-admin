import React from 'react';
import { Search, RefreshCw, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BackgroundsFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  selectedStatus: 'all' | 'active' | 'inactive';
  isLoading: boolean;
  canCreate: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: 'all' | 'active' | 'inactive') => void;
  onRefresh: () => void;
  onCreateClick: () => void;
}

const BackgroundsFilters: React.FC<BackgroundsFiltersProps> = ({
  searchTerm,
  selectedCategory,
  selectedStatus,
  isLoading,
  canCreate,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onRefresh,
  onCreateClick,
}) => {
  const { t } = useTranslation('backgrounds');

  return (
    <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2">
      {/* Search and Actions */}
      <div className="flex flex-wrap items-center gap-3 xl-down:gap-2">
        {/* Search */}
        <div className="flex-1 min-w-[200px] xl-down:min-w-[150px] sm-down:min-w-full">
          <div className="relative">
            <Search className="absolute left-3 xl-down:left-2 top-1/2 -translate-y-1/2 w-5 h-5 xl-down:w-4 xl-down:h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Tìm kiếm background...')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 xl-down:pl-8 pr-4 xl-down:pr-3 py-2 xl-down:py-1.5 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm xl-down:text-xs"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:w-full sm-down:justify-end">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 xl-down:px-3 sm-down:px-2 py-2 xl-down:py-1.5 sm-down:py-1 bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 rounded-lg xl-down:rounded-md hover:bg-gray-200 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm xl-down:text-xs flex items-center gap-2 xl-down:gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sm-down:hidden">{t('refresh', 'Làm mới')}</span>
          </button>

          {canCreate && (
            <button
              onClick={onCreateClick}
              className="px-4 xl-down:px-3 sm-down:px-2 py-2 xl-down:py-1.5 sm-down:py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg xl-down:rounded-md hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg text-sm xl-down:text-xs flex items-center gap-2 xl-down:gap-1.5"
            >
              <Plus className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5" />
              <span className="sm-down:hidden">{t('createButton', 'Tạo mới')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 xl-down:gap-2">
        {/* Category Filter */}
        <input
          type="text"
          placeholder={t('filterCategory', 'Lọc theo category...')}
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 xl-down:px-2 py-2 xl-down:py-1.5 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'inactive')}
          className="px-3 xl-down:px-2 py-2 xl-down:py-1.5 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">{t('statusAll', 'Tất cả')}</option>
          <option value="active">{t('statusActive', 'Đang hoạt động')}</option>
          <option value="inactive">{t('statusInactive', 'Không hoạt động')}</option>
        </select>
      </div>
    </div>
  );
};

export default BackgroundsFilters;
