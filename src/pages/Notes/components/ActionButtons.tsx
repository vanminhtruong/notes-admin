import React from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { hasPermission } from '@utils/auth';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';

interface ActionButtonsProps {
  note: any;
  onEdit: () => void;
  onArchive: () => void;
  onMove: () => void;
  onDelete: () => void;
  size?: 'sm' | 'md';
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  note,
  onEdit,
  onArchive,
  onMove,
  onDelete,
  size = 'md'
}) => {
  const { t } = useTranslation('notes');

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5 xl-down:w-4 xl-down:h-4';
  const padding = size === 'sm' ? 'p-1.5' : 'p-2 xl-down:p-1.5';
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5 xl-down:gap-1';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.warn(
      <ConfirmDeleteDialog onConfirm={onDelete} />,
      { position: 'top-center', autoClose: false, closeOnClick: false, draggable: false }
    );
  };

  return (
    <div className={`flex items-center ${gap}`}>
      {hasPermission('manage_notes.edit') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          aria-label={t('actions.edit')}
          title={t('actions.edit') as string}
          className={`${padding} rounded-md xl-down:rounded text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
            <path d="M16.862 3.487a1.75 1.75 0 0 1 2.476 2.476l-9.8 9.8a4.5 4.5 0 0 1-1.89 1.134l-3.003.9a.75.75 0 0 1-.93-.93l.9-3.002a4.5 4.5 0 0 1 1.134-1.89l9.8-9.8Z" />
            <path d="M5.25 19.5h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1 0-1.5Z" />
          </svg>
        </button>
      )}
      {hasPermission('manage_notes.archive') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onArchive();
          }}
          aria-label={note.isArchived ? (t('actions.unarchive', { defaultValue: 'Bỏ lưu trữ' }) as string) : (t('actions.archive', { defaultValue: 'Lưu trữ' }) as string)}
          title={note.isArchived ? (t('actions.unarchive', { defaultValue: 'Bỏ lưu trữ' }) as string) : (t('actions.archive', { defaultValue: 'Lưu trữ' }) as string)}
          className={`${padding} rounded-md xl-down:rounded transition-colors ${note.isArchived ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/20' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-200 dark:hover:bg-neutral-800'}`}
        >
          {note.isArchived ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}><path d="M3 3h18v4H3V3zm1 6h16v12H4V9zm4 2v2h8v-2H8z"/><path d="M10 13l2 2 2-2h-4z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className={iconSize}><path d="M3 3h18v4H3V3zm1 6h16v12H4V9zm4 2v2h8v-2H8z"/></svg>
          )}
        </button>
      )}
      {hasPermission('manage_notes.folders.move') && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMove();
          }}
          aria-label="Di chuyển vào thư mục"
          title="Di chuyển vào thư mục"
          className={`${padding} rounded-md xl-down:rounded text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors`}
        >
          <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>
      )}
      {hasPermission('manage_notes.delete') && (
        <button
          onClick={handleDeleteClick}
          aria-label={t('actions.delete')}
          title={t('actions.delete') as string}
          className={`${padding} rounded-md xl-down:rounded text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconSize}>
            <path fillRule="evenodd" d="M9.042 3.75A2.25 2.25 0 0 1 11.17 2.5h1.66a2.25 2.25 0 0 1 2.128 1.25l.223.45h3.069a.75.75 0 0 1 0 1.5h-.68l-1.016 12.2a3 3 0 0 1-2.988 2.8H9.401a3 3 0 0 1-2.988-2.8L5.397 5.7h-.68a.75.75 0 0 1 0-1.5h3.069l.223-.45ZM9.65 5.7l-.857 12.2a1.5 1.5 0 0 0 1.5 1.6h4.165a1.5 1.5 0 0 0 1.5-1.6L15.1 5.7H9.65Zm2.6 3a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ActionButtons;
