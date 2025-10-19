import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Tag } from 'lucide-react';

interface CategoryBadgeProps {
  category: {
    name: string;
    color: string;
    icon: string;
  } | null;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  if (!category) {
    return <span className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">-</span>;
  }

  const Icon = (LucideIcons as any)[category.icon] || Tag;

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Icon className="w-3 h-3" style={{ color: category.color }} />
      </div>
      <span 
        className="text-xs xl-down:text-2xs font-medium truncate"
        style={{ color: category.color }}
      >
        {category.name}
      </span>
    </div>
  );
};

export default CategoryBadge;
