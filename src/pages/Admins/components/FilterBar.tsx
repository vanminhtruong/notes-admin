import React from 'react';
import { useTranslation } from 'react-i18next';

interface FilterBarProps {
  searchText: string;
  adminLevelFilter: string;
  onSearchChange: (value: string) => void;
  onLevelFilterChange: (value: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchText,
  adminLevelFilter,
  onSearchChange,
  onLevelFilterChange,
  onRefresh,
  loading = false
}) => {
  const { t } = useTranslation('admins');
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2 mb-6">
      <div className="flex gap-4 xl-down:gap-3 sm-down:gap-2 flex-wrap sm-down:flex-col">
        <div className="flex-1 min-w-[220px] xl-down:min-w-[200px] sm-down:w-full sm-down:min-w-0">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 md-down:py-1.5 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 text-sm sm-down:text-xs"
          />
        </div>

        <div className="min-w-[160px] sm-down:w-full">
          <select
            value={adminLevelFilter}
            onChange={(e) => onLevelFilterChange(e.target.value)}
            className="w-full px-3 py-2 md-down:py-1.5 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 text-sm sm-down:text-xs"
          >
            <option value="">{t('allLevels')}</option>
            <option value="super_admin">{t('superAdmin')}</option>
            <option value="sub_admin">{t('subAdmin')}</option>
            <option value="dev">{t('dev')}</option>
            <option value="mod">{t('mod')}</option>
          </select>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label={t('refresh')}
          className="px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2 sm-down:py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2 text-sm sm-down:text-xs"
        >
          <svg 
            className={`w-4 h-4 sm-down:w-3.5 sm-down:h-3.5 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="sm-down:hidden">{t('refresh')}</span>
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
