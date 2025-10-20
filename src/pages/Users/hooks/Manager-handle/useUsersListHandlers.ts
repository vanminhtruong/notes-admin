import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import type { User, ConfirmState } from '../../interfaces';

interface Filters {
  currentPage: number;
  searchTerm: string;
  activeFilter: string;
}

interface UseUsersListHandlersProps {
  filters: Filters;
  setLoading: (loading: boolean) => void;
  setUsers: (users: User[]) => void;
  setTotalPages: (pages: number) => void;
  setTotalItems: (items: number) => void;
  setFilters: (filters: Filters | ((prev: Filters) => Filters)) => void;
  setConfirmState: (state: ConfirmState | ((prev: ConfirmState) => ConfirmState)) => void;
}

export const useUsersListHandlers = ({
  filters,
  setLoading,
  setUsers,
  setTotalPages,
  setTotalItems,
  setFilters,
  setConfirmState
}: UseUsersListHandlersProps) => {
  const { t } = useTranslation('users');

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: filters.currentPage,
        limit: 5,
        role: 'user'
      };
      
      if (filters.searchTerm) params.search = filters.searchTerm;
      if (filters.activeFilter) params.isActive = filters.activeFilter === 'true';

      const response = await adminService.getAllUsers(params);
      const data = response.data || response;
      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error(error?.message || t('alerts.loadError'));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, setLoading, setUsers, setTotalPages, setTotalItems, t]);

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      currentPage: newFilters.searchTerm !== undefined || newFilters.activeFilter !== undefined ? 1 : (newFilters.currentPage ?? prev.currentPage)
    }));
  }, [setFilters]);

  const clearFilters = useCallback(() => {
    setFilters({
      currentPage: 1,
      searchTerm: '',
      activeFilter: ''
    });
  }, [setFilters]);

  const closeConfirm = useCallback(() => {
    setConfirmState({
      open: false,
      title: '',
      lines: [],
      onConfirm: null,
      confirming: false
    });
  }, [setConfirmState]);

  const handleToggleStatus = useCallback(async (user: User) => {
    const newStatus = !user.isActive;
    const message = newStatus ? t('confirm.enableMessage', { name: user.name }) : t('confirm.disableMessage', { name: user.name });
    setConfirmState({
      open: true,
      title: newStatus ? t('confirm.enableTitle') : t('confirm.disableTitle'),
      lines: [message],
      confirming: false,
      onConfirm: async () => {
        try {
          setConfirmState(prev => ({ ...prev, confirming: true }));
          await adminService.toggleUserStatus(user.id);
          toast.success(newStatus ? t('alerts.enableSuccess') : t('alerts.disableSuccess'));
          loadUsers();
        } catch (error: any) {
          toast.error(error?.message || t('alerts.toggleError'));
        } finally {
          closeConfirm();
        }
      }
    });
  }, [t, loadUsers, setConfirmState, closeConfirm]);

  const handleDeletePermanently = useCallback(async (user: User) => {
    const message = t('confirm.deleteMessage', { name: user.name });
    setConfirmState({
      open: true,
      title: t('confirm.deleteTitle'),
      lines: [message],
      confirming: false,
      onConfirm: async () => {
        try {
          setConfirmState(prev => ({ ...prev, confirming: true }));
          await adminService.deleteUserPermanently(user.id);
          toast.success(t('alerts.deleteSuccess'));
          loadUsers();
        } catch (error: any) {
          toast.error(error?.message || t('alerts.deleteError'));
        } finally {
          closeConfirm();
        }
      }
    });
  }, [t, loadUsers, setConfirmState, closeConfirm]);

  return {
    loadUsers,
    updateFilters,
    clearFilters,
    handleToggleStatus,
    handleDeletePermanently,
    closeConfirm
  };
};
