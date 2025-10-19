import React from 'react';
import { useTranslation } from 'react-i18next';
import { hasPermission } from '@utils/auth';

interface EmptyStateProps {
  tab: string;
  onCreateClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ tab, onCreateClick }) => {
  const { t } = useTranslation('notes');

  return (
    <div className="flex flex-col items-center justify-center py-16 xl-down:py-12 sm-down:py-8">
      <div className="mb-3 text-gray-400 dark:text-gray-500">
        <svg className="w-10 h-10 xl-down:w-8 xl-down:h-8 sm-down:w-6 sm-down:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-sm xl-down:text-xs font-semibold text-gray-800 dark:text-gray-200">{t('empty.title')}</p>
      <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 mt-1">{t('empty.hint')}</p>
      {hasPermission('manage_notes.create') && tab !== 'archived' && (
        <button
          onClick={onCreateClick}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md text-sm xl-down:text-xs transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v14m-7-7h14"/></svg>
          {t('createNote')}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
