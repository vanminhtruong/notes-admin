import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTagsManagement } from '../hooks/Manager-Effects/Manager-Tag/useTagsManagement.ts';
import TagsTable from './TagsTable.tsx';
import TagsHeader from './TagsHeader.tsx';
import CreateTagModal from './CreateTagModal.tsx';
import EditTagModal from './EditTagModal.tsx';
import TagDetailModal from './TagDetailModal.tsx';

interface TagsListProps {
  embedded?: boolean;
}

const TagsList: React.FC<TagsListProps> = () => {
  const { t } = useTranslation('notes');
  const hook = useTagsManagement();

  if (!hook.canView) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{t('tags.manage.noPermission')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <TagsHeader hook={hook} />
      <TagsTable hook={hook} />
      
      {/* Modals */}
      <CreateTagModal hook={hook} />
      <EditTagModal hook={hook} />
      <TagDetailModal hook={hook} />
    </div>
  );
};

export default TagsList;
