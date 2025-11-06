import React from 'react';
import TagCard from './TagCard';
import type { Tag } from '../interface/Tags.types';

interface TagsGridProps {
  tags: Tag[];
  canEdit: boolean;
  canDelete: boolean;
  onView: (tag: Tag) => void;
  onEdit: (tag: Tag) => void;
  onDelete: (tag: Tag) => void;
  onPin: (tag: Tag) => void;
  onUnpin: (tag: Tag) => void;
}

const TagsGrid: React.FC<TagsGridProps> = ({
  tags,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete,
  onPin,
  onUnpin,
}) => {
  return (
    <div className="p-4 xl-down:p-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl-down:gap-3">
        {tags.map((tag) => (
          <TagCard
            key={tag.id}
            tag={tag}
            canEdit={canEdit}
            canDelete={canDelete}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onPin={onPin}
            onUnpin={onUnpin}
          />
        ))}
      </div>
    </div>
  );
};

export default TagsGrid;
