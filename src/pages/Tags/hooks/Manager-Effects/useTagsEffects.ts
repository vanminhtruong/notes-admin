import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';

export interface UseTagsEffectsProps {
  fetchTags: () => Promise<void>;
}

export const useTagsEffects = ({ fetchTags }: UseTagsEffectsProps) => {
  // Fetch tags on mount and when dependencies change
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Real-time socket updates
  useEffect(() => {
    const socket = getAdminSocket();
    if (!socket) return;

    const handleTagCreated = (data: any) => {
      console.log('Tag created:', data);
      fetchTags();
    };

    const handleTagUpdated = (data: any) => {
      console.log('Tag updated:', data);
      fetchTags();
    };

    const handleTagDeleted = (data: any) => {
      console.log('Tag deleted:', data);
      fetchTags();
    };

    const handleTagPinned = (data: any) => {
      console.log('Tag pinned:', data);
      fetchTags();
    };

    const handleTagUnpinned = (data: any) => {
      console.log('Tag unpinned:', data);
      fetchTags();
    };

    // Listen to events from both admin and user actions
    socket.on('admin_tag_created', handleTagCreated);
    socket.on('admin_tag_updated', handleTagUpdated);
    socket.on('admin_tag_deleted', handleTagDeleted);
    socket.on('admin_tag_pinned', handleTagPinned);
    socket.on('admin_tag_unpinned', handleTagUnpinned);
    
    // Listen to events from user actions
    socket.on('user_tag_created', handleTagCreated);
    socket.on('user_tag_updated', handleTagUpdated);
    socket.on('user_tag_deleted', handleTagDeleted);
    socket.on('tag_pinned', handleTagPinned);
    socket.on('tag_unpinned', handleTagUnpinned);

    return () => {
      socket.off('admin_tag_created', handleTagCreated);
      socket.off('admin_tag_updated', handleTagUpdated);
      socket.off('admin_tag_deleted', handleTagDeleted);
      socket.off('admin_tag_pinned', handleTagPinned);
      socket.off('admin_tag_unpinned', handleTagUnpinned);
      
      socket.off('user_tag_created', handleTagCreated);
      socket.off('user_tag_updated', handleTagUpdated);
      socket.off('user_tag_deleted', handleTagDeleted);
      socket.off('tag_pinned', handleTagPinned);
      socket.off('tag_unpinned', handleTagUnpinned);
    };
  }, [fetchTags]);
};
