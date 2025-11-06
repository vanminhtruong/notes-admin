import React from 'react';
import { useTranslation } from 'react-i18next';

const TagsHeader: React.FC = () => {
  const { t } = useTranslation('tags');

  return (
    <div>
      <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">
        {t('title')}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 text-sm xl-down:text-xs">
        {t('subtitle')}
      </p>
    </div>
  );
};

export default TagsHeader;
