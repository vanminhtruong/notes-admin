import React from 'react';
import { useTranslation } from 'react-i18next';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high';
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const { t } = useTranslation('notes');

  const colorClasses = {
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
  };

  const labels = {
    high: t('constants.priority.high'),
    medium: t('constants.priority.medium'),
    low: t('constants.priority.low')
  };

  return (
    <span className={`px-2 py-0.5 xl-down:px-1.5 text-xs xl-down:text-2xs font-medium rounded-full ${colorClasses[priority]}`}>
      {labels[priority]}
    </span>
  );
};

export default PriorityBadge;
