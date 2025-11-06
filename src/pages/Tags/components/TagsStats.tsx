import React from 'react';

interface CategoriesStatsProps {
  total: number;
}

const CategoriesStats: React.FC<CategoriesStatsProps> = ({ total }) => {
  return (
    <div className="mt-4 xl-down:mt-3 flex items-center gap-4 text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">
      <span>Total: <strong>{total}</strong> categories</span>
    </div>
  );
};

export default CategoriesStats;
