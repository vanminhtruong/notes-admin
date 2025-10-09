import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import { hasPermission } from '@utils/auth';
import NoteFormModal from './NoteFormModal';
import NoteDetailModal from './NoteDetailModal';
import { getFolderIcon, getFolderColorClass } from '@utils/folderIcons';

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
  videoUrl?: string;
  youtubeUrl?: string;
  category?: string;
  priority: 'low' | 'medium' | 'high';
  isArchived: boolean;
  reminderAt?: string;
  folderId?: number | null;
  createdAt: string;
  user: User;
}

interface Folder {
  id: number;
  name: string;
  color: string;
  icon: string;
  userId: number;
  user: User;
  createdAt: string;
}

interface FolderDetailModalProps {
  show: boolean;
  folderId: number | null;
  onClose: () => void;
}

const FolderDetailModal: React.FC<FolderDetailModalProps> = ({ show, folderId, onClose }) => {
  const { t } = useTranslation('notes');
  const [loading, setLoading] = useState(false);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [showNoteDetail, setShowNoteDetail] = useState(false);
  
  const canViewFolderDetail = hasPermission('manage_notes.folders.view_detail');
  const canCreateNotes = hasPermission('manage_notes.folders.notes.create');
  const canEditNotes = hasPermission('manage_notes.folders.notes.edit');
  const canDeleteNotes = hasPermission('manage_notes.folders.notes.delete');
  const canRemoveFromFolder = hasPermission('manage_notes.folders.notes.remove');

  useEffect(() => {
    const htmlEl = document.documentElement;
    const bodyEl = document.body;
    const appRoot = document.getElementById('root');

    if (show && folderId) {
      loadFolderDetail();
      // Lock scroll on both html and body
      bodyEl.style.overflow = 'hidden';
      htmlEl.style.overflow = 'hidden';
      htmlEl.style.overscrollBehavior = 'contain';
      bodyEl.style.overscrollBehavior = 'contain';
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
  }, [show, folderId]);

  // Real-time updates
  useEffect(() => {
    if (!show || !folderId) return;
    
    const s = getAdminSocket();
    const handleUpdate = () => {
      loadFolderDetail();
    };
    
    s.on('admin_folder_updated', handleUpdate);
    s.on('admin_folder_deleted', handleUpdate);
    s.on('user_folder_updated', handleUpdate);
    s.on('user_note_created', handleUpdate);
    s.on('user_note_updated', handleUpdate);
    s.on('user_note_deleted', handleUpdate);
    s.on('note_created_by_admin', handleUpdate);
    s.on('note_updated_by_admin', handleUpdate);
    s.on('note_deleted_by_admin', handleUpdate);

    return () => {
      try {
        s.off('admin_folder_updated', handleUpdate);
        s.off('admin_folder_deleted', handleUpdate);
        s.off('user_folder_updated', handleUpdate);
        s.off('user_note_created', handleUpdate);
        s.off('user_note_updated', handleUpdate);
        s.off('user_note_deleted', handleUpdate);
        s.off('note_created_by_admin', handleUpdate);
        s.off('note_updated_by_admin', handleUpdate);
        s.off('note_deleted_by_admin', handleUpdate);
      } catch {}
    };
  }, [show, folderId]);

  const loadFolderDetail = async () => {
    if (!folderId) return;
    
    try {
      setLoading(true);
      const response: any = await adminService.getFolderById(folderId);
      setFolder(response?.folder || null);
      setNotes(response?.folder?.notes || []);
    } catch (error) {
      console.error('Error loading folder detail:', error);
      toast.error(t('folders.toasts.updateError'));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    toast.warn(
      <div className="flex flex-col items-center p-2">
        <div className="mb-3 flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('delete.confirm.title')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('delete.confirm.message')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{t('delete.confirm.irreversible')}</p>
        </div>
        
        <div className="flex gap-3 w-full">
          <button
            onClick={() => toast.dismiss()}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            Hủy
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                await adminService.deleteUserNote(noteId);
                await loadFolderDetail();
                toast.success(t('toasts.deleteSuccess'));
              } catch (error) {
                console.error('Error deleting note:', error);
                toast.error(t('toasts.deleteError'));
              }
            }}
            className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('actions.delete')}
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const handleRemoveNoteFromFolder = async (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!folder) return;
    
    toast.warn(
      <div className="flex flex-col items-center p-2">
        <div className="mb-3 flex items-center justify-center w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
          <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('folders.remove.confirm.title')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('folders.remove.confirm.message')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{t('folders.remove.confirm.note')}</p>
        </div>
        
        <div className="flex gap-3 w-full">
          <button
            onClick={() => toast.dismiss()}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            Hủy
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                await adminService.updateUserNote(noteId, { folderId: null } as any);
                await loadFolderDetail();
                toast.success(t('folders.toasts.removeNoteSuccess'));
              } catch (error) {
                console.error('Error removing note from folder:', error);
                toast.error(t('folders.toasts.removeNoteError'));
              }
            }}
            className="flex-1 px-4 py-2.5 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors font-medium text-sm"
          >
            {t('folders.actions.removeFromFolder')}
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!show || !folder) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 xl-down:p-3.5 md-down:p-3 sm-down:p-2.5 xs-down:p-2 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md md-down:rounded-md max-w-4xl md-down:max-w-2xl sm-down:max-w-xl xs-down:max-w-[95%] w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5 border-b border-gray-200 dark:border-neutral-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 xl-down:w-14 xl-down:h-14 md-down:w-12 md-down:h-12 sm-down:w-10 sm-down:h-10 rounded-lg flex items-center justify-center">
                {(() => {
                  const IconComponent = getFolderIcon(folder.icon || 'folder');
                  const colorClass = getFolderColorClass(folder.color);
                  return <IconComponent className={`w-12 h-12 xl-down:w-10 xl-down:h-10 md-down:w-8 md-down:h-8 sm-down:w-7 sm-down:h-7 ${colorClass}`} strokeWidth={2} />;
                })()}
              </div>
              <div>
                <h3 className="text-xl xl-down:text-lg sm-down:text-base font-medium text-gray-900 dark:text-gray-100">
                  {folder.name}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm md-down:text-sm sm-down:text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>{t('folders.detail.userLabel')}</span>
                    <span className="font-medium">{folder.user.name}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-2">
                    <span>{notes.length} {t('folders.detail.notesCount')}</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 md-down:p-0.5"
            >
              <svg className="w-6 h-6 md-down:w-5 md-down:h-5 sm-down:w-4 sm-down:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md-down:p-5 sm-down:p-4 xs-down:p-3.5">
          {/* Create Note Button */}
          {canCreateNotes && folder && (
            <div className="mb-4">
              <button
                onClick={() => setShowCreateNote(true)}
                className="w-full px-4 py-3 md-down:px-3.5 md-down:py-2.5 sm-down:px-3 sm-down:py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm md-down:text-sm sm-down:text-xs"
              >
                <svg className="w-5 h-5 md-down:w-4 md-down:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('folders.detail.createNoteInFolder')}
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 md-down:h-7 md-down:w-7 sm-down:h-6 sm-down:w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 md-down:w-14 md-down:h-14 sm-down:w-12 sm-down:h-12 xs-down:w-10 xs-down:h-10 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-sm md-down:text-sm sm-down:text-xs">{t('folders.detail.noNotes')}</p>
            </div>
          ) : (
            <div className="space-y-3 xl-down:space-y-2.5 sm-down:space-y-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    if (canViewFolderDetail) {
                      setSelectedNote(note);
                      setShowNoteDetail(true);
                    }
                  }}
                  className={`p-4 md-down:p-3.5 sm-down:p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 hover:shadow-md transition-all ${
                    canViewFolderDetail ? 'cursor-pointer hover:border-blue-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base md-down:text-sm sm-down:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {note.title}
                      </h4>
                      {note.content && (
                        <p className="text-sm md-down:text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {note.content}
                        </p>
                      )}
                      
                      {/* Media indicators */}
                      <div className="flex items-center gap-2 mb-2">
                        {note.imageUrl && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Hình ảnh
                          </span>
                        )}
                        {note.videoUrl && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Video
                          </span>
                        )}
                        {note.youtubeUrl && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                            YouTube
                          </span>
                        )}
                        {note.reminderAt && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded text-xs">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Nhắc nhở
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs sm-down:text-[11px] text-gray-500 dark:text-gray-500">
                        {note.category && (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            {note.category}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded ${
                          note.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                          note.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                          'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        }`}>
                          {note.priority === 'high' ? t('constants.priority.high') : note.priority === 'medium' ? t('constants.priority.medium') : t('constants.priority.low')}
                        </span>
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {canEditNotes && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNote(note);
                            setShowNoteModal(true);
                          }}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                          title={t('actions.edit')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {canRemoveFromFolder && (
                        <button
                          onClick={(e) => handleRemoveNoteFromFolder(note.id, e)}
                          className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors"
                          title={t('folders.actions.removeFromFolder')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </button>
                      )}
                      {canDeleteNotes && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                          title={t('actions.delete')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
          >
            {t('actions.close')}
          </button>
        </div>
      </div>

      {/* Note Detail Modal (View Only) */}
      {selectedNote && (
        <NoteDetailModal
          show={showNoteDetail}
          note={{...selectedNote, updatedAt: selectedNote.createdAt} as any}
          onClose={() => {
            setShowNoteDetail(false);
            setSelectedNote(null);
          }}
        />
      )}

      {/* Note Form Modal for Edit */}
      {selectedNote && (
        <NoteFormModal
          show={showNoteModal}
          note={selectedNote}
          folderId={folder?.id}
          onClose={() => {
            setShowNoteModal(false);
            setSelectedNote(null);
          }}
          onSuccess={() => {
            loadFolderDetail();
          }}
        />
      )}

      {/* Note Form Modal for Create */}
      {folder && (
        <NoteFormModal
          show={showCreateNote}
          note={null}
          userId={folder.userId}
          folderId={folder.id}
          onClose={() => {
            setShowCreateNote(false);
          }}
          onSuccess={() => {
            loadFolderDetail();
          }}
        />
      )}
    </div>,
    document.body
  );
};

export default FolderDetailModal;
