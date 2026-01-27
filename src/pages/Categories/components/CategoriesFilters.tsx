import React from 'react';
import { Search, Plus, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CategoriesFiltersProps {
  searchTerm: string;
  selectedUserId: number | '';
  isLoading: boolean;
  canCreate: boolean;
  onSearchChange: (value: string) => void;
  onUserIdChange: (value: string) => void;
  onRefresh: () => void;
  onCreateClick: () => void;
}

const CategoriesFilters: React.FC<CategoriesFiltersProps> = ({
  searchTerm,
  selectedUserId,
  isLoading,
  canCreate,
  onSearchChange,
  onUserIdChange,
  onRefresh,
  onCreateClick,
}) => {
  const { t } = useTranslation('categories');

  return (
    <div className="flex flex-col md:flex-row gap-4 xl-down:gap-3 items-end">
      {/* Search */}
      <div className="flex-1 w-full">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
          {t('searchPlaceholder')}
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 xl-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Filter by User ID */}
      <div className="w-full md:w-48">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
          {t('filterByUser')}
        </label>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <input
            type="number"
            placeholder={t('filterByUser')}
            value={selectedUserId}
            onChange={(e) => onUserIdChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 xl-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 xl-down:gap-1.5 w-full md:w-auto">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="group flex-1 md:flex-none px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700 hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/20 dark:hover:to-orange-900/20 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 text-sm xl-down:text-xs font-medium"
        >
          <RefreshCw className={`w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 transition-transform duration-500 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          <span className="sm-down:hidden">{t('refresh')}</span>
        </button>
        
        {canCreate && (
          <button
            onClick={onCreateClick}
            className="group flex-1 md:flex-none px-5 py-2.5 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl xl-down:rounded-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 flex items-center justify-center gap-2 text-sm xl-down:text-xs font-medium"
          >
            <Plus className="w-4 h-4 xl-down:w-3.5 xl-down:h-3.5 transition-transform group-hover:rotate-90 duration-300" />
            <span className="sm-down:hidden">{t('createCategory')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoriesFilters;
