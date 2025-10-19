import React from 'react';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  isArchived: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isArchived }) => {
  const { t } = useTranslation('notes');

  return (
    <span className={`px-2 py-0.5 xl-down:px-1.5 text-xs xl-down:text-2xs font-medium rounded-full ${
      isArchived 
        ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' 
        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    }`}>
      {isArchived ? t('badges.status.archived') : t('badges.status.active')}
    </span>
  );
};

export default StatusBadge;
