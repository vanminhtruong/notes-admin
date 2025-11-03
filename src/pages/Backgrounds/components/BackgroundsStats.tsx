import React from 'react';
import { useTranslation } from 'react-i18next';

interface BackgroundsStatsProps {
  total: number;
}

const BackgroundsStats: React.FC<BackgroundsStatsProps> = ({ total }) => {
  const { t } = useTranslation('backgrounds');

  return (
    <div className="mt-3 xl-down:mt-2 pt-3 xl-down:pt-2 border-t border-gray-200 dark:border-neutral-700">
      <div className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">
        {t('total', 'Tổng')}: <span className="font-semibold text-gray-900 dark:text-white">{total}</span> {t('backgrounds', 'backgrounds')}
      </div>
    </div>
  );
};

export default BackgroundsStats;
