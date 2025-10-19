import { useEffect } from 'react';
import { getAdminSocket } from '@services/socket';

export interface UseCategoriesEffectsProps {
  fetchCategories: () => Promise<void>;
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
      fetchCategories();
    };

    const handleCategoryUpdated = (data: any) => {
      console.log('Category updated:', data);
      fetchCategories();
    };

    const handleCategoryDeleted = (data: any) => {
      console.log('Category deleted:', data);
      fetchCategories();
    };

    // Listen to events from both admin and user actions
    socket.on('admin_category_created', handleCategoryCreated);
    socket.on('admin_category_updated', handleCategoryUpdated);
    socket.on('admin_category_deleted', handleCategoryDeleted);
    
    // Listen to events from user actions
    socket.on('user_category_created', handleCategoryCreated);
    socket.on('user_category_updated', handleCategoryUpdated);
    socket.on('user_category_deleted', handleCategoryDeleted);

    return () => {
      socket.off('admin_category_created', handleCategoryCreated);
      socket.off('admin_category_updated', handleCategoryUpdated);
      socket.off('admin_category_deleted', handleCategoryDeleted);
      
      socket.off('user_category_created', handleCategoryCreated);
      socket.off('user_category_updated', handleCategoryUpdated);
      socket.off('user_category_deleted', handleCategoryDeleted);
    };
  }, [fetchCategories]);
};
