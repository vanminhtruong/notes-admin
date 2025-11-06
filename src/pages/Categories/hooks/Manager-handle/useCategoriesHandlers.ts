import { useCallback } from 'react';
import adminService from '@services/adminService';
import { hasPermission } from '@utils/auth';
import toast from '@utils/toast';
import { useTranslation } from 'react-i18next';
import type { Category, CategoryFilters } from '../../interface/category.types';

export interface UseCategoriesHandlersProps {
  setIsLoading: (loading: boolean) => void;
  setCategories: (categories: Category[]) => void;
  setTotal: (total: number) => void;
  setTotalPages: (pages: number) => void;
  currentPage: number;
  searchTerm: string;
  selectedUserId: number | '';
}

export interface UseCategoriesHandlersReturn {
  fetchCategories: (showLoading?: boolean) => Promise<void>;
  handleDelete: (category: Category) => Promise<void>;
  handlePin: (category: Category) => Promise<void>;
  handleUnpin: (category: Category) => Promise<void>;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const useCategoriesHandlers = ({
  setIsLoading,
  setCategories,
  setTotal,
  setTotalPages,
  currentPage,
  searchTerm,
  selectedUserId,
}: UseCategoriesHandlersProps): UseCategoriesHandlersReturn => {
  const { t } = useTranslation('categories');

  // Check permissions
  const canView = hasPermission('manage_notes.categories.view');
  const canCreate = hasPermission('manage_notes.categories.create');
  const canEdit = hasPermission('manage_notes.categories.edit');
  const canDelete = hasPermission('manage_notes.categories.delete');

  // Fetch categories
  const fetchCategories = useCallback(async (showLoading = true) => {
    if (!canView) {
      toast.error(t('noPermissionView'));
      return;
    }

    try {
      if (showLoading) setIsLoading(true);
      const params: CategoryFilters = {
        page: currentPage,
        limit: 8,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedUserId) params.userId = selectedUserId;

      const response: any = await adminService.getAllCategories(params);
      setCategories(response?.categories ?? []);
      setTotal(response?.pagination?.total ?? 0);
      setTotalPages(response?.pagination?.totalPages ?? 1);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.message || t('loadingCategories'));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedUserId, canView, setIsLoading, setCategories, setTotal, setTotalPages, t]);

  // Delete category
  const handleDelete = async (category: Category) => {
    if (!canDelete) {
      toast.error(t('noPermissionView'));
      return;
    }

    // Show confirmation dialog
    const confirmed = await toast.confirmDelete(
      t('modal.detail.confirmDelete'),
      category.name,
      t('delete'),
      t('modal.create.cancel')
    );

    if (!confirmed) return;

    try {
      await adminService.deleteCategory(category.id);
      toast.success(t('modal.detail.deleteSuccess'));
      fetchCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || t('modal.detail.deleteError'));
    }
  };

  // Pin category
  const handlePin = async (category: Category) => {
    if (!canEdit) {
      toast.error(t('noPermissionView'));
      return;
    }

    try {
      await adminService.pinCategory(category.id);
      toast.success(t('pinSuccess'));
      fetchCategories(); // Fetch lại để lấy thứ tự mới từ backend
    } catch (error: any) {
      console.error('Error pinning category:', error);
      toast.error(error.message || t('pinError'));
    }
  };

  // Unpin category
  const handleUnpin = async (category: Category) => {
    if (!canEdit) {
      toast.error(t('noPermissionView'));
      return;
    }

    try {
      await adminService.unpinCategory(category.id);
      toast.success(t('unpinSuccess'));
      fetchCategories(); // Fetch lại để lấy thứ tự mới từ backend
    } catch (error: any) {
      console.error('Error unpinning category:', error);
      toast.error(error.message || t('unpinError'));
    }
  };

  return {
    fetchCategories,
    handleDelete,
    handlePin,
    handleUnpin,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
};
