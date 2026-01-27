import React from 'react';
import { useTranslation } from 'react-i18next';

const CategoriesHeader: React.FC = () => {
  const { t } = useTranslation('categories');

  return (
    <div className="relative mb-2">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 via-orange-600/5 to-yellow-600/5 dark:from-amber-500/10 dark:via-orange-500/10 dark:to-yellow-500/10 rounded-2xl xl-down:rounded-xl -z-10" />
      
      <div className="flex items-center gap-4 xl-down:gap-3 p-6 xl-down:p-4 sm-down:p-3">
        <div className="w-14 h-14 xl-down:w-12 xl-down:h-12 sm-down:w-10 sm-down:h-10 rounded-2xl xl-down:rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 dark:shadow-amber-500/15">
          <svg className="w-7 h-7 xl-down:w-6 xl-down:h-6 sm-down:w-5 sm-down:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm xl-down:text-xs">
            {t('subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoriesHeader;
