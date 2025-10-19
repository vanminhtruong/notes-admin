import React from 'react';
import { hasPermission } from '@utils/auth';
import UserAvatar from './UserAvatar';
import CategoryBadge from './CategoryBadge';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import PinButton from './PinButton';
import TagsButton from './TagsButton';
import ActionButtons from './ActionButtons';

interface NoteTableRowProps {
  note: any;
  onNoteClick: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onMove: () => void;
  onDelete: () => void;
  onPin: () => void;
  onTagsClick: () => void;
  truncateWords: (text: string, count: number) => string;
  getPlainText: (html: string) => string;
  formatDate: (date: string) => string;
}

const NoteTableRow: React.FC<NoteTableRowProps> = ({
  note,
  onNoteClick,
  onEdit,
  onArchive,
  onMove,
  onDelete,
  onPin,
  onTagsClick,
  truncateWords,
  getPlainText,
  formatDate
}) => {

  return (
    <tr 
      className={`hover:bg-gray-50 dark:hover:bg-neutral-800 ${
        hasPermission('manage_notes.view_detail') ? 'cursor-pointer' : ''
      }`}
      onClick={onNoteClick}
    >
      <td className="px-4 py-3 xl-down:px-3 xl-down:py-2" style={{maxWidth: '250px'}}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
              {truncateWords(note.title, 4)}
            </h4>
            <div className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
              {truncateWords(getPlainText(note.content || ''), 4)}
            </div>
          </div>
        </div>
      </td>

      <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <UserAvatar avatar={note.user.avatar} name={note.user.name} size="lg" />
          </div>
          <div className="ml-3 xl-down:ml-2">
            <div className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">
              {note.user.name}
            </div>
            <div className="text-sm xl-down:text-2xs text-gray-600 dark:text-gray-400">
              ID: {note.user.id}
            </div>
          </div>
        </div>
      </td>

      <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap lg-down:hidden">
        <CategoryBadge category={note.category} />
      </td>

      <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap">
        <PriorityBadge priority={note.priority} />
      </td>

      {hasPermission('manage_notes.tags.assign') && (
        <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 xl-down:hidden" onClick={(e) => e.stopPropagation()}>
          <TagsButton 
            tagsCount={note.tags?.length || 0} 
            onClick={(e) => {
              e.stopPropagation();
              onTagsClick();
            }} 
          />
        </td>
      )}

      <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap lg-down:hidden">
        <StatusBadge isArchived={note.isArchived} />
      </td>

      <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 lg-down:hidden">
        {formatDate(note.createdAt)}
      </td>

      {hasPermission('manage_notes.edit') && (
        <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap text-center">
          <PinButton 
            isPinned={note.isPinned} 
            onClick={async (e) => {
              e.stopPropagation();
              await onPin();
            }} 
          />
        </td>
      )}

      {(hasPermission('manage_notes.edit') || hasPermission('manage_notes.delete') || hasPermission('manage_notes.archive')) && (
        <td className="px-3 py-3 xl-down:px-2 xl-down:py-2 whitespace-nowrap text-xs xl-down:text-2xs font-medium">
          <ActionButtons
            note={note}
            onEdit={onEdit}
            onArchive={onArchive}
            onMove={onMove}
            onDelete={onDelete}
          />
        </td>
      )}
    </tr>
  );
};

export default NoteTableRow;
