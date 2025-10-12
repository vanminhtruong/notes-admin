import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { getYouTubeEmbedUrl } from '@utils/youtube';
import * as LucideIcons from 'lucide-react';
import { Tag } from 'lucide-react';
import RichTextContent from '@components/RichTextEditor/RichTextContent';

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface NoteCategory {
  id: number;
  name: string;
  color: string;
  icon: string;
}

interface Note {
  id: number;
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  categoryId?: number;
  category?: NoteCategory;
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
  const { t } = useTranslation('notes');

  // ESC to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    
    return () => {
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Disable body scroll when modal is open
  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const appRoot = document.getElementById('root');

    if (show) {
      // Lock scroll on both html and body (covers different layout strategies)
      bodyEl.style.overflow = 'hidden';
      htmlEl.style.overflow = 'hidden';
      // Prevent scroll chaining and momentum scroll on some browsers
      htmlEl.style.overscrollBehavior = 'contain';
      bodyEl.style.overscrollBehavior = 'contain';
      // In case the app wraps content in a scrollable root container
      if (appRoot) appRoot.style.overflow = 'hidden';
    } else {
      bodyEl.style.overflow = '';
      htmlEl.style.overflow = '';
      htmlEl.style.overscrollBehavior = '';
      bodyEl.style.overscrollBehavior = '';
      if (appRoot) appRoot.style.overflow = '';
    }

    return () => {
      bodyEl.style.overflow = '';
      htmlEl.style.overflow = '';
      htmlEl.style.overscrollBehavior = '';
      bodyEl.style.overscrollBehavior = '';
      if (appRoot) appRoot.style.overflow = '';
    };
  }, [show]);

  if (!show || !note) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 xl-down:p-3 sm-down:p-2 z-[9999]" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-lg md-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 max-w-4xl xl-down:max-w-3xl lg-down:max-w-2xl md-down:max-w-xl sm-down:max-w-lg xs-down:max-w-[95%] w-full max-h-[90vh] xl-down:max-h-[92vh] sm-down:max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-neutral-800 dark:to-neutral-700 p-6 xl-down:p-5 lg-down:p-4 md-down:p-3.5 sm-down:p-3 xs-down:p-2.5">
          <div className="flex items-start justify-between text-white">
            <div className="flex-1 pr-4 xl-down:pr-3 sm-down:pr-2 min-w-0">
              <div className="flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1 mb-2 xl-down:mb-1.5 sm-down:mb-1">
                <span className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium">
                  {t('modal.detailTitle')}
                </span>
              </div>
              <h1 className="text-xl xl-down:text-lg md-down:text-base sm-down:text-sm font-bold leading-tight truncate">
                {note.title}
              </h1>
            </div>
            <button
              onClick={onClose}
              aria-label={t('actions.close') as string}
              className="p-2 xl-down:p-1.5 sm-down:p-1 text-white hover:bg-white/20 rounded-md transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 xl-down:w-4 xl-down:h-4 sm-down:w-3.5 sm-down:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 xl-down:p-5 lg-down:p-4 md-down:p-3.5 sm-down:p-3 xs-down:p-2.5 space-y-6 xl-down:space-y-5 lg-down:space-y-4 md-down:space-y-3.5 sm-down:space-y-3">
            {/* Status and Priority Bar */}
            <div className="flex flex-wrap items-center gap-3 xl-down:gap-2.5 sm-down:gap-2">
              <div className={`inline-flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1 px-3 xl-down:px-2.5 sm-down:px-2 py-1 xl-down:py-0.5 rounded-md border text-sm xl-down:text-xs sm-down:text-[11px] font-medium ${
                note.priority === 'high' 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' 
                  : note.priority === 'medium' 
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
              }`}>
                <span>{priorityConfig.text}</span>
              </div>
              
              <div className={`inline-flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1 px-3 xl-down:px-2.5 sm-down:px-2 py-1 xl-down:py-0.5 rounded-md border text-sm xl-down:text-xs sm-down:text-[11px] font-medium ${
                note.isArchived 
                  ? 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' 
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700'
              }`}>
                <span>
                  {note.isArchived ? t('badges.status.archived') : t('badges.status.active')}
                </span>
              </div>

              {note.category && (
                <div 
                  className="inline-flex items-center gap-2 xl-down:gap-1.5 sm-down:gap-1 px-3 xl-down:px-2.5 sm-down:px-2 py-1 xl-down:py-0.5 rounded-md border text-sm xl-down:text-xs sm-down:text-[11px] font-medium"
                  style={{ 
                    backgroundColor: `${note.category.color}15`,
                    borderColor: `${note.category.color}40`,
                    color: note.category.color
                  }}
                >
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center"
                    style={{ backgroundColor: `${note.category.color}20` }}
                  >
                    {(() => {
                      const Icon = (LucideIcons as any)[note.category.icon] || Tag;
                      return <Icon className="w-2.5 h-2.5" style={{ color: note.category.color }} />;
                    })()}
                  </div>
                  <span>{note.category.name}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 md-down:grid-cols-1 gap-6 xl-down:gap-5 lg-down:gap-4 md-down:gap-3.5 sm-down:gap-3">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6 xl-down:space-y-5 lg-down:space-y-4 md-down:space-y-3.5 sm-down:space-y-3">
                {/* Content */}
                <div>
                  <h3 className="text-lg xl-down:text-base md-down:text-sm sm-down:text-xs font-medium text-gray-900 dark:text-gray-100 mb-3 xl-down:mb-2.5 sm-down:mb-2">
                    {t('form.content.label')}
                  </h3>
                  <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md p-4 xl-down:p-3.5 sm-down:p-3 border border-gray-200 dark:border-neutral-700 min-h-[120px] xl-down:min-h-[100px] sm-down:min-h-[80px]">
                    {note.content ? (
                      <div className="text-gray-900 dark:text-gray-100 text-sm xl-down:text-xs sm-down:text-[11px]">
                        <RichTextContent content={note.content} />
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic text-sm xl-down:text-xs sm-down:text-[11px]">
                        {t('empty.content')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Video */}
                {note.videoUrl && (
                  <div>
                    <h3 className="text-lg xl-down:text-base md-down:text-sm sm-down:text-xs font-medium text-gray-900 dark:text-gray-100 mb-3 xl-down:mb-2.5 sm-down:mb-2">
                      {t('form.videoUrl.label', { defaultValue: 'Video' })}
                    </h3>
                    <div className="border border-gray-200 dark:border-neutral-700 rounded-lg xl-down:rounded-md overflow-hidden">
                      <video
                        controls
                        preload="metadata"
                        src={note.videoUrl}
                        className="w-full h-auto max-h-80 xl-down:max-h-72 md-down:max-h-64 sm-down:max-h-56"
                      />
                    </div>
                  </div>
                )}

                {/* Image */}
                {note.imageUrl && !note.videoUrl && (
                  <div>
                    <h3 className="text-lg xl-down:text-base md-down:text-sm sm-down:text-xs font-medium text-gray-900 dark:text-gray-100 mb-3 xl-down:mb-2.5 sm-down:mb-2">
                      {t('form.imageUrl.label')}
                    </h3>
                    <div className="border border-gray-200 dark:border-neutral-700 rounded-lg xl-down:rounded-md overflow-hidden">
                      <img 
                        src={note.imageUrl} 
                        alt={note.title}
                        className="w-full h-auto max-h-80 xl-down:max-h-72 md-down:max-h-64 sm-down:max-h-56 object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* YouTube */}
                {note.youtubeUrl && (() => {
                  const embed = getYouTubeEmbedUrl(String(note.youtubeUrl));
                  return embed ? (
                    <div>
                      <h3 className="text-lg xl-down:text-base md-down:text-sm sm-down:text-xs font-medium text-gray-900 dark:text-gray-100 mb-3 xl-down:mb-2.5 sm-down:mb-2">
                        {t('form.youtubeUrl.label', { defaultValue: 'YouTube' })}
                      </h3>
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={embed}
                          title={note.title}
                          className="absolute top-0 left-0 w-full h-full rounded-lg xl-down:rounded-md border border-gray-200 dark:border-neutral-700"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg xl-down:text-base md-down:text-sm sm-down:text-xs font-medium text-gray-900 dark:text-gray-100 mb-3 xl-down:mb-2.5 sm-down:mb-2">
                        {t('form.youtubeUrl.label', { defaultValue: 'YouTube' })}
                      </h3>
                      <a href={String(note.youtubeUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm xl-down:text-xs sm-down:text-[11px]">
                        {t('actions.open', { defaultValue: 'Mở trên YouTube' })}
                      </a>
                    </div>
                  );
                })()}
              </div>

              {/* Sidebar */}
              <div className="space-y-4 xl-down:space-y-3 sm-down:space-y-2.5">
                {/* User Info Card */}
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md p-4 xl-down:p-3.5 sm-down:p-3 border border-gray-200 dark:border-neutral-700">
                  <h4 className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-3 xl-down:mb-2.5 sm-down:mb-2">
                    {t('detail.userInfo')}
                  </h4>
                  
                  <div className="flex items-center space-x-3 xl-down:space-x-2.5 sm-down:space-x-2">
                    <div className="flex-shrink-0">
                      {note.user.avatar ? (
                        <img
                          className="h-10 w-10 xl-down:h-9 xl-down:w-9 sm-down:h-8 sm-down:w-8 rounded-full object-cover"
                          src={note.user.avatar}
                          alt={note.user.name}
                        />
                      ) : (
                        <div className="h-10 w-10 xl-down:h-9 xl-down:w-9 sm-down:h-8 sm-down:w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm xl-down:text-xs sm-down:text-[11px] font-medium">
                            {note.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-900 dark:text-gray-100 truncate">
                        {note.user.name}
                      </p>
                      <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] text-gray-600 dark:text-gray-400 truncate">
                        {note.user.email}
                      </p>
                      <p className="text-xs xl-down:text-[10px] sm-down:text-[9px] text-gray-500 dark:text-gray-500">
                        ID: {note.user.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md p-4 xl-down:p-3.5 sm-down:p-3 border border-gray-200 dark:border-neutral-700">
                  <h4 className="text-sm xl-down:text-xs sm-down:text-[11px] font-medium text-gray-700 dark:text-gray-300 mb-3 xl-down:mb-2.5 sm-down:mb-2">
                    {t('detail.metadata')}
                  </h4>
                  
                  <div className="space-y-3 xl-down:space-y-2.5 sm-down:space-y-2">
                    {note.reminderAt && (
                      <div>
                        <label className="block text-xs xl-down:text-[10px] sm-down:text-[9px] font-medium text-gray-600 dark:text-gray-400 mb-1 xl-down:mb-0.5">
                          {t('form.reminder.label')}
                        </label>
                        <p className="text-sm xl-down:text-xs sm-down:text-[11px] text-gray-900 dark:text-gray-100">
                          {formatDate(note.reminderAt)}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs xl-down:text-[10px] sm-down:text-[9px] font-medium text-gray-600 dark:text-gray-400 mb-1 xl-down:mb-0.5">
                        {t('table.createdAt')}
                      </label>
                      <p className="text-sm xl-down:text-xs sm-down:text-[11px] text-gray-900 dark:text-gray-100">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs xl-down:text-[10px] sm-down:text-[9px] font-medium text-gray-600 dark:text-gray-400 mb-1 xl-down:mb-0.5">
                        {t('detail.updatedAt')}
                      </label>
                      <p className="text-sm xl-down:text-xs sm-down:text-[11px] text-gray-900 dark:text-gray-100">
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
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-neutral-700 p-4 xl-down:p-3.5 sm-down:p-3 bg-white dark:bg-neutral-900">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 xl-down:px-3.5 md-down:px-3 sm-down:px-2.5 py-2 xl-down:py-1.5 sm-down:py-1 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm xl-down:text-xs sm-down:text-[11px] font-medium"
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
