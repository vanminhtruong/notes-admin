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
  fetchCategories: () => Promise<void>;
  handleDelete: (category: Category) => Promise<void>;
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
  const fetchCategories = useCallback(async () => {
    if (!canView) {
      toast.error(t('noPermissionView'));
      return;
    }

    try {
      setIsLoading(true);
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
      setIsLoading(false);
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

  return {
    fetchCategories,
    handleDelete,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
};
