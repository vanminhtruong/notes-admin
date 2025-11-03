import { useCallback } from 'react';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import { hasPermission } from '@utils/auth';
import type { Background } from '../interface';

interface UseBackgroundsHandlersProps {
  setIsLoading: (loading: boolean) => void;
  setBackgrounds: (backgrounds: Background[]) => void;
  setTotal: (total: number) => void;
  setTotalPages: (totalPages: number) => void;
  currentPage: number;
  activeTab: 'colors' | 'images';
  searchTerm: string;
  selectedCategory: string;
  selectedStatus: 'all' | 'active' | 'inactive';
}

export const useBackgroundsHandlers = ({
  setIsLoading,
  setBackgrounds,
  setTotal,
  setTotalPages,
  currentPage,
  activeTab,
  searchTerm,
  selectedCategory,
  selectedStatus,
}: UseBackgroundsHandlersProps) => {
  const canView = hasPermission('manage_notes.backgrounds.view');
  const canCreate = hasPermission('manage_notes.backgrounds.create');
  const canEdit = hasPermission('manage_notes.backgrounds.edit');
  const canDelete = hasPermission('manage_notes.backgrounds.delete');

  const fetchBackgrounds = useCallback(async () => {
    if (!canView) return;

    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: 8,
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus !== 'all') {
        params.isActive = selectedStatus === 'active';
      }

      // Call different API based on active tab
      const response: any = activeTab === 'colors' 
        ? await adminService.getColors(params)
        : await adminService.getImages(params);
      const { backgrounds, pagination } = response;

      setBackgrounds(backgrounds);
      setTotal(pagination.total);
      setTotalPages(pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching backgrounds:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch backgrounds');
    } finally {
      setIsLoading(false);
    }
  }, [
    canView,
    currentPage,
    activeTab,
    searchTerm,
    selectedCategory,
    selectedStatus,
    setIsLoading,
    setBackgrounds,
    setTotal,
    setTotalPages,
  ]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!canDelete) {
        toast.error('No permission to delete');
        return;
      }

      // Trả về Promise để component có thể handle
      return { id };
    },
    [canDelete]
  );

  const confirmDelete = useCallback(
    async (id: number) => {
      try {
        await adminService.deleteBackground(id);
        toast.success('Background deleted successfully');
        fetchBackgrounds();
      } catch (error: any) {
        console.error('Error deleting background:', error);
        toast.error(error.response?.data?.message || 'Failed to delete background');
      }
    },
    [fetchBackgrounds]
  );

  const handleToggleActive = useCallback(
    async (id: number) => {
      if (!canEdit) {
        toast.error('No permission to edit');
        return;
      }

      try {
        await adminService.toggleBackgroundActive(id);
        toast.success('Background status updated successfully');
        fetchBackgrounds();
      } catch (error: any) {
        console.error('Error toggling background status:', error);
        toast.error(error.response?.data?.message || 'Failed to update background status');
      }
    },
    [canEdit, fetchBackgrounds]
  );

  return {
    canView,
    canCreate,
    canEdit,
    canDelete,
    fetchBackgrounds,
    handleDelete,
    confirmDelete,
    handleToggleActive,
  };
};
