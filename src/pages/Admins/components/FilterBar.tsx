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
    <div className="bg-white dark:bg-neutral-900 rounded-2xl xl-down:rounded-xl border border-gray-100 dark:border-neutral-800 p-5 xl-down:p-4 sm-down:p-3 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex gap-4 xl-down:gap-3 sm-down:gap-2 flex-wrap sm-down:flex-col items-end">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px] xl-down:min-w-[200px] sm-down:w-full sm-down:min-w-0">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            {t('searchPlaceholder')}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 md-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm sm-down:text-xs transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Level Filter */}
        <div className="min-w-[180px] sm-down:w-full">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
            {t('allLevels')}
          </label>
          <div className="relative">
            <select
              value={adminLevelFilter}
              onChange={(e) => onLevelFilterChange(e.target.value)}
              className="w-full px-4 py-2.5 md-down:py-2 sm-down:py-1.5 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm sm-down:text-xs appearance-none cursor-pointer transition-all duration-200"
            >
              <option value="">{t('allLevels')}</option>
              <option value="super_admin">{t('superAdmin')}</option>
              <option value="sub_admin">{t('subAdmin')}</option>
              <option value="dev">{t('dev')}</option>
              <option value="mod">{t('mod')}</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          aria-label={t('refresh')}
          className="group px-5 py-2.5 md-down:px-4 md-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-neutral-800 dark:to-neutral-700 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-neutral-700 rounded-xl xl-down:rounded-lg transition-all duration-300 flex items-center gap-2 text-sm sm-down:text-xs font-medium shadow-sm hover:shadow"
        >
          <svg 
            className={`w-4 h-4 sm-down:w-3.5 sm-down:h-3.5 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} 
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
