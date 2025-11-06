import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';

export interface UseCategoriesEffectsProps {
  fetchCategories: (showLoading?: boolean) => Promise<void>;
}

export const useCategoriesEffects = ({ fetchCategories }: UseCategoriesEffectsProps) => {
  // Fetch categories on mount and when dependencies change
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Real-time socket updates
  useEffect(() => {
    const socket = getAdminSocket();
    if (!socket) return;

    const handleCategoryCreated = (data: any) => {
      console.log('Category created:', data);
      fetchCategories(false);
    };

    const handleCategoryUpdated = (data: any) => {
      console.log('Category updated:', data);
      fetchCategories(false);
    };

    const handleCategoryDeleted = (data: any) => {
      console.log('Category deleted:', data);
      fetchCategories(false);
    };

    const handleCategoryPinned = (data: any) => {
      console.log('Category pinned:', data);
      fetchCategories(false);
    };

    const handleCategoryUnpinned = (data: any) => {
      console.log('Category unpinned:', data);
      fetchCategories(false);
    };

    // Listen to events from both admin and user actions
    socket.on('admin_category_created', handleCategoryCreated);
    socket.on('admin_category_updated', handleCategoryUpdated);
    socket.on('admin_category_deleted', handleCategoryDeleted);
    socket.on('admin_category_pinned', handleCategoryPinned);
    socket.on('admin_category_unpinned', handleCategoryUnpinned);
    
    // Listen to events from user actions
    socket.on('user_category_created', handleCategoryCreated);
    socket.on('user_category_updated', handleCategoryUpdated);
    socket.on('user_category_deleted', handleCategoryDeleted);
    socket.on('category_pinned', handleCategoryPinned);
    socket.on('category_unpinned', handleCategoryUnpinned);

    return () => {
      socket.off('admin_category_created', handleCategoryCreated);
      socket.off('admin_category_updated', handleCategoryUpdated);
      socket.off('admin_category_deleted', handleCategoryDeleted);
      socket.off('admin_category_pinned', handleCategoryPinned);
      socket.off('admin_category_unpinned', handleCategoryUnpinned);
      
      socket.off('user_category_created', handleCategoryCreated);
      socket.off('user_category_updated', handleCategoryUpdated);
      socket.off('user_category_deleted', handleCategoryDeleted);
      socket.off('category_pinned', handleCategoryPinned);
      socket.off('category_unpinned', handleCategoryUnpinned);
    };
  }, [fetchCategories]);
};
