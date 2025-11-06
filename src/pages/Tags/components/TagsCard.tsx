import React from 'react';
import { Trash2, Edit, Eye, User, Pin, PinOff } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Category } from '../interface/category.types';

interface CategoryCardProps {
  category: Category;
  canEdit: boolean;
  canDelete: boolean;
  onView: (category: Category) => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onPin: (category: Category) => void;
  onUnpin: (category: Category) => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
}) => {
  const { t } = useTranslation('categories');

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm hover:shadow-md transition-shadow p-4 xl-down:p-3 border border-gray-200 dark:border-neutral-700 relative">
      {/* Pin Button - Top Right Corner */}
      {canEdit && (
        <button
          onClick={() => category.isPinned ? onUnpin(category) : onPin(category)}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-lg transition-all duration-200 ${
            category.isPinned 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={category.isPinned ? t('unpin') : t('pin')}
        >
          {category.isPinned ? (
            <Pin className="w-3.5 h-3.5 fill-current" />
          ) : (
            <PinOff className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Category Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${category.color}20` }}
          >
            {(() => {
              const Icon = (LucideIcons as any)[category.icon] || LucideIcons.Tag;
              return <Icon className="w-5 h-5" style={{ color: category.color }} />;
            })()}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold truncate text-sm"
              style={{ color: category.color }}
            >
              {category.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {category.notesCount || 0} notes
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
        <User className="w-3 h-3" />
        <span className="truncate">{category.user.name}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onView(category)}
          className="flex-1 px-2 py-1.5 xl-down:px-1.5 xl-down:py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-1"
        >
          <Eye className="w-3 h-3" />
          {t('view')}
        </button>
        
        {canEdit && (
          <button
            onClick={() => onEdit(category)}
            className="flex-1 px-2 py-1.5 xl-down:px-1.5 xl-down:py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-1"
          >
            <Edit className="w-3 h-3" />
            {t('edit')}
          </button>
        )}
        
        {canDelete && (
          <button
            onClick={() => onDelete(category)}
            className="flex-1 px-2 py-1.5 xl-down:px-1.5 xl-down:py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            {t('delete')}
          </button>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
