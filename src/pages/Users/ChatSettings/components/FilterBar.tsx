import React from 'react';
import { useTranslation } from 'react-i18next';

interface FilterBarProps {
  searchTerm: string;
  e2eeFilter: string;
  readStatusFilter: string;
  onSearchChange: (value: string) => void;
  onE2eeFilterChange: (value: string) => void;
  onReadStatusFilterChange: (value: string) => void;
  onClearFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  e2eeFilter,
  readStatusFilter,
  onSearchChange,
  onE2eeFilterChange,
  onReadStatusFilterChange,
  onClearFilters,
}) => {
  const { t } = useTranslation('chatSettings');

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2 mb-6 xl-down:mb-4 sm-down:mb-3">
      <div className="grid grid-cols-1 md:grid-cols-4 xl-down:grid-cols-2 lg-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
        <div>
          <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
            {t('filters.search')}
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xl-down:text-xs"
          />
        </div>

        <div>
          <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
            {t('filters.e2ee')}
          </label>
          <select
            value={e2eeFilter}
            onChange={(e) => onE2eeFilterChange(e.target.value)}
            className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xl-down:text-xs"
          >
            <option value="">{t('filters.all')}</option>
            <option value="enabled">{t('filters.enabled')}</option>
            <option value="disabled">{t('filters.disabled')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
            {t('filters.readStatus')}
          </label>
          <select
            value={readStatusFilter}
            onChange={(e) => onReadStatusFilterChange(e.target.value)}
            className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-lg xl-down:rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm xl-down:text-xs"
          >
            <option value="">{t('filters.all')}</option>
            <option value="enabled">{t('filters.enabled')}</option>
            <option value="disabled">{t('filters.disabled')}</option>
          </select>
        </div>

        <div className="flex items-end xl-down:col-span-2 lg-down:col-span-1">
          <button
            onClick={onClearFilters}
            className="w-full xl-down:w-auto px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-lg xl-down:rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-sm xl-down:text-xs"
          >
            {t('filters.clear')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
