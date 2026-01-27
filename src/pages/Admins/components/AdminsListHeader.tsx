import React from 'react';
import type { TFunction } from 'i18next';

interface AdminsListHeaderProps {
  t: TFunction;
  isSuperAdmin: boolean;
  onAddAdmin: () => void;
}

const AdminsListHeader: React.FC<AdminsListHeaderProps> = ({ t, isSuperAdmin, onAddAdmin }) => {
  return (
    <div className="relative mb-8 xl-down:mb-6 sm-down:mb-4">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-indigo-600/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-indigo-500/10 rounded-2xl xl-down:rounded-xl -z-10" />
      
      <div className="flex justify-between items-center p-6 xl-down:p-4 sm-down:p-3 flex-wrap gap-4">
        <div className="flex items-center gap-4 xl-down:gap-3">
          {/* Icon */}
          <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 sm-down:w-10 sm-down:h-10 rounded-2xl xl-down:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 dark:shadow-blue-500/15">
            <svg className="w-7 h-7 xl-down:w-6 xl-down:h-6 sm-down:w-5 sm-down:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-sm xl-down:text-sm sm-down:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {t('subtitle')}
            </p>
          </div>
        </div>
        
        {isSuperAdmin && (
          <button
            onClick={onAddAdmin}
            className="group px-5 py-2.5 md-down:px-4 md-down:py-2 sm-down:px-3 sm-down:py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl xl-down:rounded-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 flex items-center gap-2.5 text-sm sm-down:text-xs font-medium"
          >
            <svg className="w-5 h-5 sm-down:w-4 sm-down:h-4 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="sm-down:hidden">{t('addAdmin')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminsListHeader;
