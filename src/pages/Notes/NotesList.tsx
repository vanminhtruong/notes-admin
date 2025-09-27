import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import { hasPermission } from '@utils/auth';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import NotesFilters from '@pages/Notes/components/NotesFilters';
import NoteDetailModal from '@pages/Notes/components/NoteDetailModal';
import SharedNotesList from '@pages/Notes/components/SharedNotesList';

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

interface NotesListProps {
  forcedArchived?: 'all' | 'active' | 'archived';
  embedded?: boolean;
}

type EditNoteModalProps = {
  show: boolean;
  editingNote: Note | null;
  setEditingNote: React.Dispatch<React.SetStateAction<Note | null>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

const EditNoteModal: React.FC<EditNoteModalProps> = ({ show, editingNote, setEditingNote, onClose, onSubmit }) => {
  if (!show || !editingNote) return null;

  const { t } = useTranslation('notes');

  // Lock body scroll while modal is open and avoid layout shift
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 xl-down:p-3 sm-down:p-2 z-[9999]">
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md max-w-2xl xl-down:max-w-xl md-down:max-w-lg sm-down:max-w-sm w-full max-h-[90vh] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="p-6 xl-down:p-4 sm-down:p-3">
          <style>
            {`.scrollbar-hide::-webkit-scrollbar { display: none; }`}
          </style>
          <h3 className="text-lg xl-down:text-base sm-down:text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 xl-down:mb-2 sm-down:mb-2">{t('modal.editTitle')}</h3>

          <form onSubmit={onSubmit} className="space-y-3 xl-down:space-y-2 sm-down:space-y-2">
            <div>
              <label className="block text-sm xl-down:text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 xl-down:mb-0.5">
                {t('form.title.label')}
              </label>
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.content.label')}
              </label>
              <textarea
                value={editingNote.content || ''}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.category.label')}
                </label>
                <input
                  type="text"
                  value={editingNote.category || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.priority.label')}
                </label>
                <select
                  value={editingNote.priority}
                  onChange={(e) => setEditingNote({ ...editingNote, priority: e.target.value as 'low' | 'medium' | 'high' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="low">{t('constants.priority.low')}</option>
                  <option value="medium">{t('constants.priority.medium')}</option>
                  <option value="high">{t('constants.priority.high')}</option>
                </select>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.imageUrl.label')}
              </label>
              <div className="flex items-start gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      // Import uploadService dynamically
                      const { uploadService } = await import('@services/uploadService');
                      const { url } = await uploadService.uploadImage(file);
                      setEditingNote({ ...editingNote, imageUrl: url });
                    } catch (error) {
                      console.error('Error uploading image:', error);
                      toast.error(t('toasts.uploadImageError', { defaultValue: 'Không thể tải lên ảnh' }));
                    }
                  }}
                  className="flex-1 block w-full text-sm text-gray-900 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editingNote.imageUrl && (
                  <div className="flex-shrink-0">
                    <img src={editingNote.imageUrl} alt="preview" className="w-12 h-12 rounded-md object-cover border" />
                  </div>
                )}
              </div>
            </div>

            {/* Reminder DateTime */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('form.reminder.label')}
              </label>
              <input
                type="datetime-local"
                value={editingNote.reminderAt ? new Date(editingNote.reminderAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditingNote({ ...editingNote, reminderAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isArchived"
                checked={editingNote.isArchived}
                onChange={(e) => setEditingNote({ ...editingNote, isArchived: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-neutral-600 rounded"
              />
              <label htmlFor="isArchived" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                {t('form.archive.label')}
              </label>
            </div>

            <div className="flex justify-end space-x-3 xl-down:space-x-2 pt-3 xl-down:pt-2 sm-down:pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-neutral-600 rounded-md xl-down:rounded hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-sm xl-down:text-xs"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 bg-blue-600 dark:bg-blue-500 text-white rounded-md xl-down:rounded hover:bg-blue-700 dark:hover:bg-blue-600 text-sm xl-down:text-xs"
              >
                {t('actions.update')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
};


const NotesList: React.FC<NotesListProps> = ({ forcedArchived, embedded }) => {
  const { t } = useTranslation('notes');
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [archivedFilter, setArchivedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Tabs state via URL ?tab=all|active|archived|shared
  const tab = (searchParams.get('tab') || 'all') as 'all' | 'active' | 'archived' | 'shared';
  const setTab = (next: 'all' | 'active' | 'archived' | 'shared') => {
    searchParams.set('tab', next);
    setSearchParams(searchParams, { replace: true });
  };

  // Check if user has permission to access shared tab, if not redirect to 'all'
  useEffect(() => {
    if (tab === 'shared' && !hasPermission('manage_notes.shared.view') && !hasPermission('manage_notes.shared.delete')) {
      setTab('all');
    }
  }, [tab]);

  // Initialize selectedUserId from URL params and update when URL changes
  useEffect(() => {
    const userIdFromUrl = searchParams.get('userId');
    if (userIdFromUrl) {
      setSelectedUserId(userIdFromUrl);
    } else {
      setSelectedUserId('');
    }
    // Reset page to 1 when userId changes
    setCurrentPage(1);
  }, [searchParams]);
  
  // Đồng bộ archivedFilter theo tab được ép từ NotesTabs
  useEffect(() => {
    if (!forcedArchived) return;
    const next = forcedArchived === 'all' ? '' : forcedArchived === 'active' ? 'false' : 'true';
    setArchivedFilter(next);
    setCurrentPage(1);
  }, [forcedArchived]);

  // Đồng bộ archivedFilter theo tab trên URL khi không bị ép bởi parent
  useEffect(() => {
    if (forcedArchived) return; // parent overrides
    const next = tab === 'all' ? '' : tab === 'active' ? 'false' : 'true';
    setArchivedFilter(next);
    setCurrentPage(1);
  }, [tab, forcedArchived]);

  // Editing states
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Detail modal states
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [currentPage, searchTerm, selectedUserId, categoryFilter, priorityFilter, archivedFilter]);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsersNotes({
        page: currentPage,
        limit: 20,
        userId: selectedUserId ? parseInt(selectedUserId) : undefined,
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        isArchived: archivedFilter ? archivedFilter === 'true' : undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });

      setNotes(response.notes || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedUserId, searchTerm, categoryFilter, priorityFilter, archivedFilter]);

  // Realtime listeners for admin note changes AND user note changes
  useEffect(() => {
    const s = getAdminSocket();
    const handleNoteEvent = () => {
      // reload current filters/page
      loadNotes();
    };
    
    // Admin events
    s.on('note_created_by_admin', handleNoteEvent);
    s.on('note_updated_by_admin', handleNoteEvent);
    s.on('note_deleted_by_admin', handleNoteEvent);
    
    // User events for real-time updates
    s.on('user_note_created', handleNoteEvent);
    s.on('user_note_updated', handleNoteEvent);
    s.on('user_note_deleted', handleNoteEvent);
    s.on('user_note_archived', handleNoteEvent);

    return () => {
      try {
        s.off('note_created_by_admin', handleNoteEvent);
        s.off('note_updated_by_admin', handleNoteEvent);
        s.off('note_deleted_by_admin', handleNoteEvent);
        s.off('user_note_created', handleNoteEvent);
        s.off('user_note_updated', handleNoteEvent);
        s.off('user_note_deleted', handleNoteEvent);
        s.off('user_note_archived', handleNoteEvent);
      } catch {}
    };
  }, [loadNotes]);


  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    try {
      await adminService.updateUserNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        imageUrl: editingNote.imageUrl,
        category: editingNote.category,
        priority: editingNote.priority,
        isArchived: editingNote.isArchived,
        reminderAt: editingNote.reminderAt,
      });

      setShowEditModal(false);
      setEditingNote(null);
      await loadNotes();
      toast.success(t('toasts.updateSuccess', { defaultValue: 'Cập nhật ghi chú thành công!' }));
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error(t('toasts.updateError', { defaultValue: 'Không thể cập nhật ghi chú' }));
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    toast.warn(
      <div className="flex flex-col items-center p-2">
        {/* Warning Icon */}
        <div className="mb-3 flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        {/* Title and Message */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{t('delete.confirm.title', { defaultValue: 'Xác nhận xóa' })}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('delete.confirm.message', { defaultValue: 'Bạn có chắc muốn xóa ghi chú này không?' })}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{t('delete.confirm.irreversible', { defaultValue: 'Hành động này không thể hoàn tác.' })}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => toast.dismiss()}
            className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
          >
            {t('actions.cancel', { defaultValue: 'Hủy' })}
          </button>
          <button
            onClick={async () => {
              toast.dismiss();
              try {
                await adminService.deleteUserNote(noteId);
                await loadNotes();
                toast.success(
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{t('toasts.deleteSuccess', { defaultValue: 'Xóa ghi chú thành công!' })}</span>
                  </div>
                );
              } catch (error) {
                console.error('Error deleting note:', error);
                toast.error(
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{t('toasts.deleteError', { defaultValue: 'Không thể xóa ghi chú' })}</span>
                  </div>
                );
              }
            }}
            className="flex-1 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {t('actions.delete', { defaultValue: 'Xóa' })}
          </button>
        </div>
      </div>,
      {
        position: 'top-center',
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        className: 'custom-confirm-toast',
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



  return (
    <div className="space-y-6 xl-down:space-y-4 sm-down:space-y-3">
      {!embedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between xl-down:flex-col xl-down:items-start xl-down:space-y-3">
          <div className="xl-down:w-full">
            <h1 className="text-2xl xl-down:text-xl md-down:text-lg sm-down:text-base font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 xl-down:mt-0.5 text-sm xl-down:text-xs">{t('subtitle')}</p>
          </div>
          {hasPermission('manage_notes.create') && tab !== 'archived' && (
            <button
              onClick={() => window.location.href = '/notes/create'}
              className="mt-4 sm:mt-0 xl-down:mt-0 xl-down:w-full sm-down:w-full px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-3 sm-down:py-1.5 bg-blue-600 dark:bg-blue-500 text-white rounded-md xl-down:rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm xl-down:text-xs font-medium"
            >
              {t('createNote')}
            </button>
          )}
        </div>
      )}

      {/* Tabs All / Active / Archived (segmented control) */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700">
        <div className="px-4 xl-down:px-3 sm-down:px-2 py-3 xl-down:py-2">
          <div className="inline-flex items-center p-1 rounded-lg bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
            <button
              onClick={() => setTab('all')}
              aria-label={t('filters.all') as string}
              className={`flex items-center gap-2 px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 rounded-md text-sm xl-down:text-xs font-medium transition-all ${
                tab === 'all'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4h12v2H4V4zm0 5h12v2H4V9zm0 5h12v2H4v-2z"/></svg>
              {t('filters.all')}
            </button>
            <button
              onClick={() => setTab('active')}
              aria-label={t('filters.active') as string}
              className={`flex items-center gap-2 px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 rounded-md text-sm xl-down:text-xs font-medium transition-all ${
                tab === 'active'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4 1.5 1.5-5.5 5.5L7.5 13.5 9 12z"/></svg>
              {t('filters.active')}
            </button>
            <button
              onClick={() => setTab('archived')}
              aria-label={t('filters.archived') as string}
              className={`flex items-center gap-2 px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 rounded-md text-sm xl-down:text-xs font-medium transition-all ${
                tab === 'archived'
                  ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7H4V5h5.5l1-1h3l1 1H20v2zm-2 2v10H6V9h12z"/></svg>
              {t('filters.archived')}
            </button>
            {(hasPermission('manage_notes.shared.view') || hasPermission('manage_notes.shared.delete')) && (
              <button
                onClick={() => setTab('shared')}
                aria-label={t('filters.shared', { defaultValue: 'Ghi chú chia sẻ' }) as string}
                className={`flex items-center gap-2 px-4 py-2 xl-down:px-3 xl-down:py-1.5 sm-down:px-2 sm-down:py-1 rounded-md text-sm xl-down:text-xs font-medium transition-all ${
                  tab === 'shared'
                    ? 'bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/></svg>
                {t('filters.shared', { defaultValue: 'Chia sẻ' })}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters - only show for notes tabs, not shared tab */}
      {tab !== 'shared' && (
        <NotesFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          archivedFilter={archivedFilter}
          setArchivedFilter={setArchivedFilter}
          onClear={() => {
            setSearchTerm('');
            setSelectedUserId('');
            setCategoryFilter('');
            setPriorityFilter('');
            const next = forcedArchived
              ? (forcedArchived === 'all' ? '' : forcedArchived === 'active' ? 'false' : 'true')
              : (tab === 'all' ? '' : tab === 'active' ? 'false' : 'true');
            setArchivedFilter(next);
            setCurrentPage(1);
          }}
          showStatusSelect={false}
        />
      )}

      {/* Render SharedNotesList for shared tab */}
      {tab === 'shared' ? (
        <SharedNotesList embedded />
      ) : (
        /* Notes List */
      <div className="bg-white dark:bg-neutral-900 rounded-lg xl-down:rounded-md shadow-sm border border-gray-200 dark:border-neutral-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 xl-down:py-12 sm-down:py-8">
                <div className="mb-3 text-gray-400 dark:text-gray-500">
                  <svg className="w-10 h-10 xl-down:w-8 xl-down:h-8 sm-down:w-6 sm-down:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm xl-down:text-xs font-semibold text-gray-800 dark:text-gray-200">{t('empty.title')}</p>
                <p className="text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400 mt-1">{t('empty.hint')}</p>
                {hasPermission('manage_notes.create') && tab !== 'archived' && (
                  <button
                    onClick={() => window.location.href = '/notes/create'}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 xl-down:px-3 xl-down:py-1.5 text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-md text-sm xl-down:text-xs transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 5v14m-7-7h14"/></svg>
                    {t('createNote')}
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="overflow-x-auto lg-down:hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
                    <thead className="bg-gray-50 dark:bg-neutral-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.note')}
                        </th>
                        <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.user')}
                        </th>
                        <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md-down:hidden">
                          {t('table.category')}
                        </th>
                        <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t('table.priority')}
                        </th>
                        <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md-down:hidden">
                          {t('table.status')}
                        </th>
                        <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider md-down:hidden">
                          {t('table.createdAt')}
                        </th>
                        {(hasPermission('manage_notes.update') || hasPermission('manage_notes.delete') || hasPermission('manage_notes.archive')) && (
                          <th className="px-6 py-3 xl-down:px-4 xl-down:py-2 text-left text-xs xl-down:text-2xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('table.actions')}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-700">
                      {notes.map((note) => (
                        <tr 
                          key={note.id} 
                          className={`hover:bg-gray-50 dark:hover:bg-neutral-800 ${
                            hasPermission('manage_notes.view_detail') ? 'cursor-pointer' : ''
                          }`}
                          onClick={() => {
                            if (hasPermission('manage_notes.view_detail')) {
                              setSelectedNote(note);
                              setShowDetailModal(true);
                            }
                          }}
                        >
                          <td className="px-6 py-4 xl-down:px-4 xl-down:py-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-sm xl-down:text-xs font-medium text-gray-900 dark:text-gray-100">{note.title}</h4>
                                <p className="text-sm xl-down:text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{note.content}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 xl-down:h-6 xl-down:w-6">
                                {note.user.avatar ? (
                                  <img
                                    className="h-8 w-8 xl-down:h-6 xl-down:w-6 rounded-full object-cover"
                                    src={note.user.avatar}
                                    alt={note.user.name}
                                  />
                                ) : (
                                  <div className="h-8 w-8 xl-down:h-6 xl-down:w-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs xl-down:text-2xs font-medium">
                                      {note.user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
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
                          <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 md-down:hidden">
                            {note.category || '-'}
                          </td>
                          <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full ${
                              note.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                              note.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                              'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            }`}>
                              {note.priority === 'high' ? t('constants.priority.high') :
                               note.priority === 'medium' ? t('constants.priority.medium') :
                               t('constants.priority.low')}
                            </span>
                          </td>
                          <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap md-down:hidden">
                            <span className={`px-2 py-1 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full ${
                              note.isArchived 
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' 
                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            }`}>
                              {note.isArchived ? t('badges.status.archived') : t('badges.status.active')}
                            </span>
                          </td>
                          <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm xl-down:text-xs text-gray-500 dark:text-gray-400 md-down:hidden">
                            {formatDate(note.createdAt)}
                          </td>
                          {(hasPermission('manage_notes.update') || hasPermission('manage_notes.delete') || hasPermission('manage_notes.archive')) && (
                            <td className="px-6 py-4 xl-down:px-4 xl-down:py-3 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2 xl-down:gap-1">
                                {hasPermission('manage_notes.update') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingNote(note);
                                      setShowEditModal(true);
                                    }}
                                    aria-label={t('actions.edit')}
                                    title={t('actions.edit') as string}
                                    className="p-2 xl-down:p-1.5 rounded-md xl-down:rounded text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 xl-down:w-4 xl-down:h-4">
                                      <path d="M16.862 3.487a1.75 1.75 0 0 1 2.476 2.476l-9.8 9.8a4.5 4.5 0 0 1-1.89 1.134l-3.003.9a.75.75 0 0 1-.93-.93l.9-3.002a4.5 4.5 0 0 1 1.134-1.89l9.8-9.8Z" />
                                      <path d="M5.25 19.5h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1 0-1.5Z" />
                                    </svg>
                                  </button>
                                )}
                                {hasPermission('manage_notes.archive') && (
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        await adminService.updateUserNote(note.id, { isArchived: !note.isArchived });
                                        await loadNotes();
                                        toast.success(
                                          note.isArchived
                                            ? (t('toasts.unarchiveSuccess', { defaultValue: 'Đã bỏ lưu trữ ghi chú' }) as string)
                                            : (t('toasts.archiveSuccess', { defaultValue: 'Đã lưu trữ ghi chú' }) as string)
                                        );
                                      } catch (e) {
                                        console.error('Toggle archive failed', e);
                                        toast.error(
                                          note.isArchived
                                            ? (t('toasts.unarchiveError', { defaultValue: 'Không thể bỏ lưu trữ' }) as string)
                                            : (t('toasts.archiveError', { defaultValue: 'Không thể lưu trữ' }) as string)
                                        );
                                      }
                                    }}
                                    aria-label={note.isArchived ? (t('actions.unarchive', { defaultValue: 'Bỏ lưu trữ' }) as string) : (t('actions.archive', { defaultValue: 'Lưu trữ' }) as string)}
                                    title={note.isArchived ? (t('actions.unarchive', { defaultValue: 'Bỏ lưu trữ' }) as string) : (t('actions.archive', { defaultValue: 'Lưu trữ' }) as string)}
                                    className={`p-2 xl-down:p-1.5 rounded-md xl-down:rounded transition-colors ${note.isArchived ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-900/20' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-gray-200 dark:hover:bg-neutral-800'}`}
                                  >
                                    {note.isArchived ? (
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 xl-down:w-4 xl-down:h-4"><path d="M19 7H5V5h4.5l1-1h3l1 1H19v2Zm-2 2v9H7V9h10ZM9 11v5h2v-5H9Zm4 0v5h2v-5h-2Z"/></svg>
                                    ) : (
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 xl-down:w-4 xl-down:h-4"><path d="M20 7H4V5h5.5l1-1h3l1 1H20v2Zm-2 2v10H6V9h12Z"/></svg>
                                    )}
                                  </button>
                                )}
                                {hasPermission('manage_notes.delete') && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteNote(note.id);
                                    }}
                                    aria-label={t('actions.delete')}
                                    title={t('actions.delete') as string}
                                    className="p-2 xl-down:p-1.5 rounded-md xl-down:rounded text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 xl-down:w-4 xl-down:h-4">
                                      <path fillRule="evenodd" d="M9.042 3.75A2.25 2.25 0 0 1 11.17 2.5h1.66a2.25 2.25 0 0 1 2.128 1.25l.223.45h3.069a.75.75 0 0 1 0 1.5h-.68l-1.016 12.2a3 3 0 0 1-2.988 2.8H9.401a3 3 0 0 1-2.988-2.8L5.397 5.7h-.68a.75.75 0 0 1 0-1.5h3.069l.223-.45ZM9.65 5.7l-.857 12.2a1.5 1.5 0 0 0 1.5 1.6h4.165a1.5 1.5 0 0 0 1.5-1.6L15.1 5.7H9.65Zm2.6 3a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="hidden lg-down:block space-y-3 sm-down:space-y-2 p-4 xl-down:p-3 sm-down:p-2">
                  {notes.map((note) => (
                    <div 
                      key={note.id} 
                      className={`bg-gray-50 dark:bg-neutral-800 rounded-lg xl-down:rounded-md p-4 xl-down:p-3 sm-down:p-2 border border-gray-200 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-700 ${
                        hasPermission('manage_notes.view_detail') ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => {
                        if (hasPermission('manage_notes.view_detail')) {
                          setSelectedNote(note);
                          setShowDetailModal(true);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between mb-3 xl-down:mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm xl-down:text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {note.title}
                          </h4>
                          <p className="text-xs xl-down:text-2xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {note.content}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-3 xl-down:mb-2">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-6 w-6 sm-down:h-5 sm-down:w-5">
                            {note.user.avatar ? (
                              <img
                                className="h-6 w-6 sm-down:h-5 sm-down:w-5 rounded-full object-cover"
                                src={note.user.avatar}
                                alt={note.user.name}
                              />
                            ) : (
                              <div className="h-6 w-6 sm-down:h-5 sm-down:w-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs sm-down:text-2xs font-medium">
                                  {note.user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
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
                        
                        <div className="flex gap-2 xl-down:gap-1">
                          <span className={`px-2 py-1 xl-down:px-1.5 xl-down:py-0.5 text-xs xl-down:text-2xs font-medium rounded-full ${
                            note.priority === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                            note.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                            'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}>
                            {note.priority === 'high' ? t('constants.priority.high') :
                             note.priority === 'medium' ? t('constants.priority.medium') :
                             t('constants.priority.low')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 xl-down:gap-2 text-xs xl-down:text-2xs text-gray-500 dark:text-gray-400">
                          {note.category && (
                            <span>📁 {note.category}</span>
                          )}
                          <span className={`px-1.5 py-0.5 xl-down:px-1 xl-down:py-0.5 rounded-full ${
                            note.isArchived 
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200' 
                              : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          }`}>
                            {note.isArchived ? t('badges.status.archived') : t('badges.status.active')}
                          </span>
                          <span>📅 {formatDate(note.createdAt)}</span>
                        </div>
                        
                        {(hasPermission('manage_notes.update') || hasPermission('manage_notes.delete') || hasPermission('manage_notes.archive')) && (
                          <div className="flex items-center gap-1">
                            {hasPermission('manage_notes.update') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingNote(note);
                                  setShowEditModal(true);
                                }}
                                className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path d="M16.862 3.487a1.75 1.75 0 0 1 2.476 2.476l-9.8 9.8a4.5 4.5 0 0 1-1.89 1.134l-3.003.9a.75.75 0 0 1-.93-.93l.9-3.002a4.5 4.5 0 0 1 1.134-1.89l9.8-9.8Z" />
                                  <path d="M5.25 19.5h13.5a.75.75 0 0 1 0 1.5H5.25a.75.75 0 0 1 0-1.5Z" />
                                </svg>
                              </button>
                            )}
                            {hasPermission('manage_notes.archive') && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await adminService.updateUserNote(note.id, { isArchived: !note.isArchived });
                                    await loadNotes();
                                    toast.success(
                                      note.isArchived
                                        ? (t('toasts.unarchiveSuccess', { defaultValue: 'Đã bỏ lưu trữ ghi chú' }) as string)
                                        : (t('toasts.archiveSuccess', { defaultValue: 'Đã lưu trữ ghi chú' }) as string)
                                    );
                                  } catch (e) {
                                    console.error('Toggle archive failed', e);
                                    toast.error(
                                      note.isArchived
                                        ? (t('toasts.unarchiveError', { defaultValue: 'Không thể bỏ lưu trữ' }) as string)
                                        : (t('toasts.archiveError', { defaultValue: 'Không thể lưu trữ' }) as string)
                                    );
                                  }
                                }}
                                className="p-1.5 rounded text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                              >
                                {note.isArchived ? (
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 7H5V5h4.5l1-1h3l1 1H19v2Zm-2 2v9H7V9h10ZM9 11v5h2v-5H9Zm4 0v5h2v-5h-2Z"/></svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20 7H4V5h5.5l1-1h3l1 1H20v2Zm-2 2v10H6V9h12Z"/></svg>
                                )}
                              </button>
                            )}
                            {hasPermission('manage_notes.delete') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteNote(note.id);
                                }}
                                className="p-1.5 rounded text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M9.042 3.75A2.25 2.25 0 0 1 11.17 2.5h1.66a2.25 2.25 0 0 1 2.128 1.25l.223.45h3.069a.75.75 0 0 1 0 1.5h-.68l-1.016 12.2a3 3 0 0 1-2.988 2.8H9.401a3 3 0 0 1-2.988-2.8L5.397 5.7h-.68a.75.75 0 0 1 0-1.5h3.069l.223-.45ZM9.65 5.7l-.857 12.2a1.5 1.5 0 0 0 1.5 1.6h4.165a1.5 1.5 0 0 0 1.5-1.6L15.1 5.7H9.65Zm2.6 3a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="px-6 py-3 xl-down:px-4 xl-down:py-2 sm-down:px-3 sm-down:py-2 bg-gray-50 dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between xl-down:flex-col xl-down:space-y-2 xl-down:items-center">
                      <h3 className="text-lg xl-down:text-base sm-down:text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('pagination.title', { currentPage, totalPages })}
                      </h3>
                      <div className="flex space-x-2 xl-down:space-x-1">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 xl-down:px-2 xl-down:py-1 sm-down:px-2 sm-down:py-0.5 mx-1 xl-down:mx-0.5 rounded xl-down:rounded-sm border text-sm xl-down:text-xs sm-down:text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 font-medium"
                        >
                          {t('pagination.prev')}
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 xl-down:px-2 xl-down:py-1 sm-down:px-2 sm-down:py-0.5 mx-1 xl-down:mx-0.5 rounded xl-down:rounded-sm border text-sm xl-down:text-xs sm-down:text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 font-medium"
                        >
                          {t('pagination.next')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      )}

      {/* Edit Modal */}
      <EditNoteModal
        show={showEditModal}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
        onClose={() => {
          setShowEditModal(false);
          setEditingNote(null);
        }}
        onSubmit={handleUpdateNote}
      />

      {/* Detail Modal */}
      <NoteDetailModal
        show={showDetailModal}
        note={selectedNote}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedNote(null);
        }}
      />
    </div>
  );
};

export default NotesList;
