import React from 'react';
import type { TFunction } from 'i18next';

interface AdminsListHeaderProps {
  t: TFunction;
  isSuperAdmin: boolean;
  onAddAdmin: () => void;
}

const AdminsListHeader: React.FC<AdminsListHeaderProps> = ({ t, isSuperAdmin, onAddAdmin }) => {
  return (
    <div className="flex justify-between items-center mb-6 xl-down:mb-4 sm-down:mb-3 flex-wrap gap-3">
      <div>
        <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">
          {t('title')}
        </h1>
        <p className="text-sm xl-down:text-sm sm-down:text-xs text-gray-600 dark:text-gray-400 mt-1">
          {t('subtitle')}
        </p>
      </div>
      {isSuperAdmin && (
        <button
          onClick={onAddAdmin}
          className="px-4 py-2 md-down:px-3 md-down:py-1.5 sm-down:px-2 sm-down:py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm sm-down:text-xs"
        >
          <svg className="w-5 h-5 sm-down:w-4 sm-down:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="sm-down:hidden">{t('addAdmin')}</span>
        </button>
      )}
    </div>
  );
};

export default AdminsListHeader;
