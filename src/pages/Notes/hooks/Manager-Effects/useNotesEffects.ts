import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';

interface UseNotesEffectsProps {
  loadNotes: () => Promise<void>;
  currentPage: number;
  searchTerm: string;
  selectedUserId: string;
  categoryFilter: string;
  priorityFilter: string;
  archivedFilter: string;
}

export const useNotesEffects = ({
  loadNotes,
  currentPage,
  searchTerm,
  selectedUserId,
  categoryFilter,
  priorityFilter,
  archivedFilter,
}: UseNotesEffectsProps) => {
  // Load notes when filters change
  useEffect(() => {
    loadNotes();
  }, [currentPage, searchTerm, selectedUserId, categoryFilter, priorityFilter, archivedFilter]);

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
    s.on('note_moved_to_folder', handleNoteEvent);
    s.on('admin_note_moved_to_folder', handleNoteEvent);
    
    // Pin/Unpin events
    s.on('user_note_pinned', handleNoteEvent);
    s.on('user_note_unpinned', handleNoteEvent);
    s.on('admin_note_pinned', handleNoteEvent);
    s.on('admin_note_unpinned', handleNoteEvent);
    
    // Tag events (admin and user)
    s.on('admin_note_tag_assigned', handleNoteEvent);
    s.on('admin_note_tag_removed', handleNoteEvent);
    s.on('note_tag_added', handleNoteEvent);
    s.on('note_tag_removed', handleNoteEvent);

    return () => {
      try {
        s.off('note_created_by_admin', handleNoteEvent);
        s.off('note_updated_by_admin', handleNoteEvent);
        s.off('note_deleted_by_admin', handleNoteEvent);
        s.off('user_note_created', handleNoteEvent);
        s.off('user_note_updated', handleNoteEvent);
        s.off('user_note_deleted', handleNoteEvent);
        s.off('user_note_archived', handleNoteEvent);
        s.off('note_moved_to_folder', handleNoteEvent);
        s.off('admin_note_moved_to_folder', handleNoteEvent);
        s.off('user_note_pinned', handleNoteEvent);
        s.off('user_note_unpinned', handleNoteEvent);
        s.off('admin_note_pinned', handleNoteEvent);
        s.off('admin_note_unpinned', handleNoteEvent);
        s.off('admin_note_tag_assigned', handleNoteEvent);
        s.off('admin_note_tag_removed', handleNoteEvent);
        s.off('note_tag_added', handleNoteEvent);
        s.off('note_tag_removed', handleNoteEvent);
      } catch {}
    };
  }, [loadNotes]);
};
