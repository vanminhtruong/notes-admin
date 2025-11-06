import React from 'react';
import { Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  hasFilters: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ hasFilters }) => {
  const { t } = useTranslation('tags');

  return (
    <div className="text-center py-12 xl-down:py-8">
      <Tag className="w-16 h-16 xl-down:w-12 xl-down:h-12 text-gray-400 mx-auto mb-4 xl-down:mb-3" />
      <h3 className="text-lg xl-down:text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
        {t('noTagsFound')}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm xl-down:text-xs">
        {hasFilters ? t('noTagsFound') : t('enterKeywordToSearch')}
      </p>
    </div>
  );
};

export default EmptyState;
