import React from 'react';

interface TagsStatsProps {
  total: number;
}

const TagsStats: React.FC<TagsStatsProps> = ({ total }) => {
  return (
    <div className="mt-4 xl-down:mt-3 flex items-center gap-4 text-sm xl-down:text-xs text-gray-600 dark:text-gray-400">
      <span>Total: <strong>{total}</strong> tags</span>
    </div>
  );
};

export default TagsStats;
