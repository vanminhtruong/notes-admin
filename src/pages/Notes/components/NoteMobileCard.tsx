import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Tag } from 'lucide-react';
import { hasPermission } from '@utils/auth';
import UserAvatar from './UserAvatar';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import PinButton from './PinButton';
import ActionButtons from './ActionButtons';

interface NoteMobileCardProps {
  note: any;
  onNoteClick: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onMove: () => void;
  onDelete: () => void;
  onPin: () => void;
  truncateWords: (text: string, count: number) => string;
  getPlainText: (html: string) => string;
  formatDate: (date: string) => string;
}

const NoteMobileCard: React.FC<NoteMobileCardProps> = ({
  note,
  onNoteClick,
  onEdit,
  onArchive,
  onMove,
  onDelete,
  onPin,
  truncateWords,
  getPlainText,
  formatDate
}) => {
  return (
    <div 
      className={`bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 sm-down:p-2 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 ${
        hasPermission('manage_notes.view_detail') ? 'cursor-pointer' : ''
      }`}
      onClick={onNoteClick}
    >
      <div className="flex items-start justify-between mb-3 xl-down:mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm xl-down:text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
            {truncateWords(note.title, 5)}
          </h4>
          <div className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
            {truncateWords(getPlainText(note.content || ''), 5)}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-3 xl-down:mb-2">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <UserAvatar avatar={note.user.avatar} name={note.user.name} size="md" />
          </div>
          <div className="ml-2 xl-down:ml-1.5">
            <div className="text-xs xl-down:text-2xs font-medium text-gray-900 dark:text-gray-100">
              {note.user.name}
            </div>
            <div className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
              ID: {note.user.id}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 xl-down:gap-1">
          <PriorityBadge priority={note.priority} />
          
          {hasPermission('manage_notes.edit') && (
            <PinButton 
              isPinned={note.isPinned} 
              onClick={async (e) => {
                e.stopPropagation();
                await onPin();
              }}
              size="sm"
            />
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 xl-down:gap-2 text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
          {note.category && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-4 h-4 rounded flex items-center justify-center"
                style={{ backgroundColor: `${note.category.color}20` }}
              >
                {(() => {
                  const Icon = (LucideIcons as any)[note.category.icon] || Tag;
                  return <Icon className="w-2.5 h-2.5" style={{ color: note.category.color }} />;
                })()}
              </div>
              <span style={{ color: note.category.color }}>{note.category.name}</span>
            </div>
          )}
          <StatusBadge isArchived={note.isArchived} />
          <span>📅 {formatDate(note.createdAt)}</span>
        </div>
        
        {(hasPermission('manage_notes.edit') || hasPermission('manage_notes.delete') || hasPermission('manage_notes.archive') || hasPermission('manage_notes.folders.move')) && (
          <ActionButtons
            note={note}
            onEdit={onEdit}
            onArchive={onArchive}
            onMove={onMove}
            onDelete={onDelete}
            size="sm"
          />
        )}
      </div>
    </div>
  );
};

export default NoteMobileCard;
