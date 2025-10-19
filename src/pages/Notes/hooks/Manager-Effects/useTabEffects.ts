import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hasPermission } from '@utils/auth';

interface UseTabEffectsProps {
  forcedArchived?: 'all' | 'active' | 'archived';
  setArchivedFilter: (filter: string) => void;
  setCurrentPage: (page: number) => void;
  setSelectedUserId: (userId: string) => void;
}

export const useTabEffects = ({
  forcedArchived,
  setArchivedFilter,
  setCurrentPage,
  setSelectedUserId,
}: UseTabEffectsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Tabs state via URL ?tab=all|active|archived|shared|folders|tags
  const tab = (searchParams.get('tab') || 'all') as 'all' | 'active' | 'archived' | 'shared' | 'folders' | 'tags';
  const setTab = (next: 'all' | 'active' | 'archived' | 'shared' | 'folders' | 'tags') => {
    searchParams.set('tab', next);
    setSearchParams(searchParams, { replace: true });
  };

  // Check if user has permission to access current tab, if not redirect to first available tab
  useEffect(() => {
    const getFirstAvailableTab = (): 'all' | 'active' | 'archived' | 'shared' | 'folders' | 'tags' => {
      if (hasPermission('manage_notes.view')) return 'all';
      if (hasPermission('manage_notes.archive')) return 'archived';
      if (hasPermission('manage_notes.shared.view') || hasPermission('manage_notes.shared.delete')) return 'shared';
      if (hasPermission('manage_notes.folders.view')) return 'folders';
      if (hasPermission('manage_notes.tags.view')) return 'tags';
      return 'all'; // fallback
    };

    // Check current tab permission
    if (tab === 'all' && !hasPermission('manage_notes.view')) {
      setTab(getFirstAvailableTab());
    } else if (tab === 'active' && !hasPermission('manage_notes.view')) {
      setTab(getFirstAvailableTab());
    } else if (tab === 'archived' && !hasPermission('manage_notes.archive')) {
      setTab(getFirstAvailableTab());
    } else if (tab === 'shared' && !hasPermission('manage_notes.shared.view') && !hasPermission('manage_notes.shared.delete')) {
      setTab(getFirstAvailableTab());
    } else if (tab === 'folders' && !hasPermission('manage_notes.folders.view')) {
      setTab(getFirstAvailableTab());
    } else if (tab === 'tags' && !hasPermission('manage_notes.tags.view')) {
      setTab(getFirstAvailableTab());
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
  }, [searchParams, setSelectedUserId, setCurrentPage]);
  
  // Đồng bộ archivedFilter theo tab được ép từ NotesTabs
  useEffect(() => {
    if (!forcedArchived) return;
    const next = forcedArchived === 'all' ? '' : forcedArchived === 'active' ? 'false' : 'true';
    setArchivedFilter(next);
    setCurrentPage(1);
  }, [forcedArchived, setArchivedFilter, setCurrentPage]);

  // Đồng bộ archivedFilter theo tab trên URL khi không bị ép bởi parent
  useEffect(() => {
    if (forcedArchived) return; // parent overrides
    const next = tab === 'all' ? '' : tab === 'active' ? 'false' : 'true';
    setArchivedFilter(next);
    setCurrentPage(1);
  }, [tab, forcedArchived, setArchivedFilter, setCurrentPage]);

  return {
    tab,
    setTab,
    searchParams,
  };
};
