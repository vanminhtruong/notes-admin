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
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 p-4 mb-6">
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div className="min-w-[150px]">
          <select
            value={adminLevelFilter}
            onChange={(e) => onLevelFilterChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
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
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center gap-2"
        >
          <svg 
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('refresh')}
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
