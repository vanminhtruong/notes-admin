import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Note {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  isArchived: boolean;
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
  user: User;
}

type NoteDetailModalProps = {
  show: boolean;
  note: Note | null;
  onClose: () => void;
};

const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ show, note, onClose }) => {
  if (!show || !note) return null;

  const { t } = useTranslation('notes');

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          text: t('constants.priority.high')
        };
      case 'medium':
        return {
          text: t('constants.priority.medium')
        };
      default:
        return {
          text: t('constants.priority.low')
        };
    }
  };

  const priorityConfig = getPriorityConfig(note.priority);

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-neutral-800 dark:to-neutral-700 p-6">
          <div className="flex items-start justify-between text-white">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">
                  {t('modal.detailTitle')}
                </span>
              </div>
              <h1 className="text-xl font-bold leading-tight">
                {note.title}
              </h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Status and Priority Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-sm font-medium ${
                note.priority === 'high' 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' 
                  : note.priority === 'medium' 
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
              }`}>
                <span>{priorityConfig.text}</span>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border text-sm font-medium ${
                note.isArchived 
                  ? 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' 
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
              }`}>
                <span>
                  {note.isArchived ? t('badges.status.archived') : t('badges.status.active')}
                </span>
              </div>

              {note.category && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 text-sm font-medium">
                  <span>{note.category}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Content */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                    {t('form.content.label')}
                  </h3>
                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700 min-h-[120px]">
                    <p className="text-gray-900 dark:text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {note.content || (
                        <span className="text-gray-500 dark:text-gray-400 italic">
                          {t('empty.content')}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Image */}
                {note.imageUrl && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                      {t('form.imageUrl.label')}
                    </h3>
                    <div className="border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                      <img 
                        src={note.imageUrl} 
                        alt={note.title}
                        className="w-full h-auto max-h-80 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* User Info Card */}
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('detail.userInfo')}
                  </h4>
                  
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {note.user.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={note.user.avatar}
                          alt={note.user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {note.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {note.user.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {note.user.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        ID: {note.user.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    {t('detail.metadata')}
                  </h4>
                  
                  <div className="space-y-3">
                    {note.reminderAt && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {t('form.reminder.label')}
                        </label>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(note.reminderAt)}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('table.createdAt')}
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {t('detail.updatedAt')}
                      </label>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-neutral-700 p-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm font-medium"
            >
              {t('actions.close')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NoteDetailModal;
