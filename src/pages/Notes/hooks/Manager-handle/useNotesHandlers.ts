import { useCallback } from 'react';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import type { Note } from '../../interface/types';

interface UseNotesHandlersProps {
  setLoading: (loading: boolean) => void;
  setNotes: (notes: Note[]) => void;
  setTotalPages: (pages: number) => void;
  setTotalItems: (items: number) => void;
  currentPage: number;
  selectedUserId: string;
  searchTerm: string;
  categoryFilter: string;
  priorityFilter: string;
  archivedFilter: string;
  setShowEditModal: (show: boolean) => void;
  setEditingNote: (note: Note | null) => void;
  t: (key: string, options?: any) => string;
}

export const useNotesHandlers = ({
  setLoading,
  setNotes,
  setTotalPages,
  setTotalItems,
  currentPage,
  selectedUserId,
  searchTerm,
  categoryFilter,
  priorityFilter,
  archivedFilter,
  setShowEditModal,
  setEditingNote,
  t,
}: UseNotesHandlersProps) => {
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsersNotes({
        page: currentPage,
        limit: 5,
        userId: selectedUserId ? parseInt(selectedUserId) : undefined,
        search: searchTerm || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        isArchived: archivedFilter ? archivedFilter === 'true' : undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });

      setNotes((response as any).notes || []);
      setTotalPages((response as any).pagination?.totalPages || 1);
      setTotalItems((response as any).pagination?.total || 0);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedUserId, searchTerm, categoryFilter, priorityFilter, archivedFilter, setLoading, setNotes, setTotalPages, setTotalItems]);

  const createHandleUpdateNote = (editingNote: Note | null) => async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNote) return;

    try {
      await adminService.updateUserNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content,
        imageUrl: editingNote.imageUrl,
        videoUrl: editingNote.videoUrl,
        youtubeUrl: editingNote.youtubeUrl,
        categoryId: editingNote.categoryId || null,
        priority: editingNote.priority,
        isArchived: editingNote.isArchived,
        reminderAt: editingNote.reminderAt,
      } as any);

      setShowEditModal(false);
      setEditingNote(null);
      await loadNotes();
      toast.success(t('toasts.updateSuccess', { defaultValue: 'Cập nhật ghi chú thành công!' }));
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error(t('toasts.updateError', { defaultValue: 'Không thể cập nhật ghi chú' }));
    }
  };

  const createHandleDeleteNote = (noteId: number) => async () => {
    try {
      await adminService.deleteUserNote(noteId);
      await loadNotes();
      toast.success(t('toasts.deleteSuccess', { defaultValue: 'Xóa ghi chú thành công!' }));
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(t('toasts.deleteError', { defaultValue: 'Không thể xóa ghi chú' }));
    }
  };

  const handleTogglePin = async (note: Note) => {
    try {
      if (note.isPinned) {
        await adminService.unpinUserNote(note.id);
        toast.success(t('toasts.unpinSuccess'));
      } else {
        await adminService.pinUserNote(note.id);
        toast.success(t('toasts.pinSuccess'));
      }
      await loadNotes();
    } catch (e) {
      console.error('Toggle pin failed', e);
      toast.error(t('toasts.pinError'));
    }
  };

  const handleToggleArchive = async (note: Note) => {
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
  };

  return {
    loadNotes,
    createHandleUpdateNote,
    createHandleDeleteNote,
    handleTogglePin,
    handleToggleArchive,
  };
};
