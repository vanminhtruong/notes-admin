import React from 'react';
import { Trash2, Edit, Eye, User, Tag as TagIcon, Pin, PinOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Tag } from '../interface/Tags.types';

interface TagCardProps {
  tag: Tag;
  canEdit: boolean;
  canDelete: boolean;
  onView: (tag: Tag) => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onPin: (tag: Tag) => void;
  onUnpin: (tag: Tag) => void;
}

const TagCard: React.FC<TagCardProps> = ({
  tag,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
}) => {
  const { t } = useTranslation('tags');

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm hover:shadow-md transition-shadow p-4 xl-down:p-3 border border-gray-200 dark:border-neutral-700 relative">
      {/* Pin Button - Top Right Corner */}
      {canEdit && (
        <button
          onClick={() => tag.isPinned ? onUnpin(tag) : onPin(tag)}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-lg transition-all duration-200 ${
            tag.isPinned 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={tag.isPinned ? t('unpin') : t('pin')}
        >
          {tag.isPinned ? (
            <Pin className="w-3.5 h-3.5 fill-current" />
          ) : (
            <PinOff className="w-3.5 h-3.5" />
          )}
        </button>
      )}

      {/* Tag Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${tag.color}20` }}
          >
            <TagIcon className="w-5 h-5" style={{ color: tag.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold truncate text-sm"
              style={{ color: tag.color }}
            >
              {tag.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {tag.notesCount || 0} notes
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="flex items-center gap-2 mb-3 text-xs text-gray-600 dark:text-gray-400">
        <User className="w-3 h-3" />
        <span className="truncate">{tag.user.name}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onView(tag)}
          className="flex-1 px-2 py-1.5 xl-down:px-1.5 xl-down:py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-1"
        >
          <Eye className="w-3 h-3" />
          {t('view')}
        </button>
        
        {canEdit && (
          <button
            onClick={() => onEdit(tag)}
            className="flex-1 px-2 py-1.5 xl-down:px-1.5 xl-down:py-1 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center justify-center gap-1"
          >
            <Edit className="w-3 h-3" />
            {t('edit')}
          </button>
        )}
        
        {canDelete && (
          <button
            onClick={() => onDelete(tag)}
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

export default TagCard;
