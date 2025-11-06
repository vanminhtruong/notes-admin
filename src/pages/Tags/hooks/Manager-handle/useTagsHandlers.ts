import { useCallback } from 'react';
import adminService from '@services/adminService';
import { hasPermission } from '@utils/auth';
import toast from '@utils/toast';
import { useTranslation } from 'react-i18next';
import type { Tag, TagFilters } from '../../interface/Tags.types';

export interface UseTagsHandlersProps {
  setIsLoading: (loading: boolean) => void;
  setTags: (tags: Tag[]) => void;
  setTotal: (total: number) => void;
  setTotalPages: (pages: number) => void;
  currentPage: number;
  searchTerm: string;
  selectedUserId: number | '';
}

export interface UseTagsHandlersReturn {
  fetchTags: () => Promise<void>;
  handleDelete: (tag: Tag) => Promise<void>;
  handlePin: (tag: Tag) => Promise<void>;
  handleUnpin: (tag: Tag) => Promise<void>;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const useTagsHandlers = ({
  setIsLoading,
  setTags,
  setTotal,
  setTotalPages,
  currentPage,
  searchTerm,
  selectedUserId,
}: UseTagsHandlersProps): UseTagsHandlersReturn => {
  const { t } = useTranslation('tags');

  // Check permissions
  const canView = hasPermission('manage_notes.tags.view');
  const canCreate = hasPermission('manage_notes.tags.create');
  const canEdit = hasPermission('manage_notes.tags.edit');
  const canDelete = hasPermission('manage_notes.tags.delete');

  // Fetch tags
  const fetchTags = useCallback(async () => {
    if (!canView) {
      toast.error(t('noPermissionView'));
      return;
    }

    try {
      setIsLoading(true);
      const params: TagFilters = {
        page: currentPage,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedUserId) params.userId = selectedUserId;

      const response: any = await adminService.getAllTags(params);
      setTags(response?.tags ?? []);
      setTotal(response?.pagination?.total ?? 0);
      setTotalPages(response?.pagination?.totalPages ?? 1);
    } catch (error: any) {
      console.error('Error fetching tags:', error);
      toast.error(error.message || t('loadingTags'));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, selectedUserId, canView, setIsLoading, setTags, setTotal, setTotalPages, t]);

  // Delete tag
  const handleDelete = async (tag: Tag) => {
    if (!canDelete) {
      toast.error(t('noPermissionView'));
      return;
    }

    // Show confirmation dialog
    const confirmed = await toast.confirmDelete(
      t('modal.detail.confirmDelete'),
      tag.name,
      t('delete'),
      t('modal.create.cancel')
    );

    if (!confirmed) return;

    try {
      await adminService.deleteTag(tag.id);
      toast.success(t('modal.detail.deleteSuccess'));
      fetchTags();
    } catch (error: any) {
      console.error('Error deleting tag:', error);
      toast.error(error.message || t('modal.detail.deleteError'));
    }
  };

  // Pin tag
  const handlePin = async (tag: Tag) => {
    if (!canEdit) {
      toast.error(t('noPermissionView'));
      return;
    }

    try {
      await adminService.pinTag(tag.id);
      toast.success(t('pinSuccess'));
      fetchTags();
    } catch (error: any) {
      console.error('Error pinning tag:', error);
      toast.error(error.message || t('pinError'));
    }
  };

  // Unpin tag
  const handleUnpin = async (tag: Tag) => {
    if (!canEdit) {
      toast.error(t('noPermissionView'));
      return;
    }

    try {
      await adminService.unpinTag(tag.id);
      toast.success(t('unpinSuccess'));
      fetchTags();
    } catch (error: any) {
      console.error('Error unpinning tag:', error);
      toast.error(error.message || t('unpinError'));
    }
  };

  return {
    fetchTags,
    handleDelete,
    handlePin,
    handleUnpin,
    canView,
    canCreate,
    canEdit,
    canDelete,
  };
};
