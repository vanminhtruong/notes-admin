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
      <div className="flex flex-wrap items-end gap-4 xl-down:gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px] xl-down:min-w-[150px] sm-down:min-w-full">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            {t('searchPlaceholder', 'Tìm kiếm background...')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder={t('searchPlaceholder', 'Tìm kiếm background...')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 xl-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 text-sm xl-down:text-xs"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            {t('filterCategory', 'Lọc theo category...')}
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <input
              type="text"
              placeholder={t('filterCategory', 'Lọc theo category...')}
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 xl-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-44">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            {t('statusAll', 'Trạng thái')}
          </label>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-4 py-2.5 xl-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white text-sm xl-down:text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="all">{t('statusAll', 'Tất cả')}</option>
              <option value="active">{t('statusActive', 'Đang hoạt động')}</option>
              <option value="inactive">{t('statusInactive', 'Không hoạt động')}</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:w-full">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="group px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700 hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm xl-down:text-xs flex items-center gap-2 font-medium"
          >
            <RefreshCw className={`w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 transition-transform duration-500 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            <span className="sm-down:hidden">{t('refresh', 'Làm mới')}</span>
          </button>

          {canCreate && (
            <button
              onClick={onCreateClick}
              className="group px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl xl-down:rounded-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 text-sm xl-down:text-xs flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 transition-transform group-hover:rotate-90 duration-300" />
              <span className="sm-down:hidden">{t('createButton', 'Tạo mới')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackgroundsFilters;
