import React from 'react';
import { useTranslation } from 'react-i18next';

interface NotesFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedUserId: string;
  setSelectedUserId: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
  priorityFilter: string;
  setPriorityFilter: (v: string) => void;
  archivedFilter: string;
  setArchivedFilter: (v: string) => void;
  onClear: () => void;
  showStatusSelect?: boolean;
}

const NotesFilters: React.FC<NotesFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedUserId,
  setSelectedUserId,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  archivedFilter,
  setArchivedFilter,
  onClear,
  showStatusSelect = true,
}) => {
  const { t } = useTranslation('notes');

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3 sm-down:p-2">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 xl-down:grid-cols-2 md-down:grid-cols-1 gap-4 xl-down:gap-3 sm-down:gap-2">
        <div>
          <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
            {t('filters.search.label')}
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('filters.search.placeholder') as string}
            className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
          />
        </div>

        <div>
          <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
            {t('filters.userId.label')}
          </label>
          <input
            type="number"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            placeholder={t('filters.userId.placeholder') as string}
            className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
          />
        </div>

        <div>
          <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
            {t('filters.category.label')}
          </label>
          <input
            type="text"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder={t('filters.category.placeholder') as string}
            className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
          />
        </div>

        <div>
          <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
            {t('filters.priority.label')}
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
          >
            <option value="">{t('filters.all')}</option>
            <option value="low">{t('constants.priority.low')}</option>
            <option value="medium">{t('constants.priority.medium')}</option>
            <option value="high">{t('constants.priority.high')}</option>
          </select>
        </div>

        {showStatusSelect && (
          <div>
            <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
              {t('filters.status.label')}
            </label>
            <select
              value={archivedFilter}
              onChange={(e) => setArchivedFilter(e.target.value)}
              className="w-full px-3 py-2 xl-down:px-2 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs"
            >
              <option value="">{t('filters.all')}</option>
              <option value="false">{t('filters.active')}</option>
              <option value="true">{t('filters.archived')}</option>
            </select>
          </div>
        )}

        <div className="flex items-end xl-down:col-span-2 md-down:col-span-1">
          <button
            onClick={onClear}
            className="w-full xl-down:w-full px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm xl-down:text-xs font-medium"
          >
            {t('filters.clear')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotesFilters;
