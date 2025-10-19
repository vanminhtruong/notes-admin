import React from 'react';
import CategoryCard from './CategoryCard';
import type { Category } from '../interface/category.types';

interface CategoriesGridProps {
  categories: Category[];
  canEdit: boolean;
  canDelete: boolean;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
  categories,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="p-4 xl-down:p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl-down:gap-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            canEdit={canEdit}
            canDelete={canDelete}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoriesGrid;
