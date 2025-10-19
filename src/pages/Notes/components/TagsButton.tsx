import React from 'react';
import { Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TagsButtonProps {
  tagsCount: number;
  onClick: (e: React.MouseEvent) => void;
}

const TagsButton: React.FC<TagsButtonProps> = ({ tagsCount, onClick }) => {
  const { t } = useTranslation('notes');

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
      title={t('tags.cell.manageTags')}
    >
      <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      {tagsCount > 0 ? (
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
          {tagsCount}
        </span>
      ) : (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {t('tags.cell.noTags')}
        </span>
      )}
    </button>
  );
};

export default TagsButton;
