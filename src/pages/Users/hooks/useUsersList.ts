import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import type { User, ConfirmState, UsersListFilters } from '../interfaces';
import { hasPermission } from '@utils/auth';

export const useUsersList = () => {
  const { t } = useTranslation('users');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);
  
  // Filters state
  const [filters, setFilters] = useState<UsersListFilters>({
    searchTerm: '',
    roleFilter: '',
    activeFilter: '',
    currentPage: 1
  });

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    title: '',
    lines: [],
    onConfirm: null,
    confirming: false
  });

  const openConfirm = (title: string, lines: string[], onConfirm: () => Promise<void> | void) => {
    setConfirmState({ open: true, title, lines, onConfirm, confirming: false });
  };

  const closeConfirm = () => setConfirmState((s) => ({ ...s, open: false }));

  const updateFilters = (newFilters: Partial<UsersListFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers({
        page: filters.currentPage,
        limit: 5,
        search: filters.searchTerm || undefined,
        role: filters.roleFilter || undefined,
        isActive: filters.activeFilter ? filters.activeFilter === 'true' : undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });

      const rawList: User[] = response.users || [];
      const apiTotal = response?.pagination?.total;
      const apiTotalPages = response?.pagination?.totalPages;

      // Trường hợp backend có phân trang chuẩn
      if (typeof apiTotal === 'number' || typeof apiTotalPages === 'number') {
        setUsers(rawList);
        const total = typeof apiTotal === 'number' ? apiTotal : undefined;
        let computedTotalPages = typeof apiTotalPages === 'number' ? apiTotalPages : (typeof total === 'number' ? Math.ceil(total / 5) : 1);
        // Nếu API trả totalPages không hợp lệ (<= currentPage) nhưng list có đủ 5 item, suy ra còn trang tiếp theo
        if ((computedTotalPages <= filters.currentPage) && rawList.length === 5) {
          computedTotalPages = filters.currentPage + 1;
        }
        setTotalPages(computedTotalPages || 1);
        setTotalItems(total);
      } else {
        // Fallback khi backend không trả pagination/limit
        if (rawList.length > 5) {
          // Backend trả full danh sách: phân trang client-side đầy đủ
          const total = rawList.length;
          const start = (filters.currentPage - 1) * 5;
          const end = start + 5;
          const paged = rawList.slice(start, end);
          setUsers(paged);
          setTotalPages(Math.max(1, Math.ceil(total / 5)));
          setTotalItems(total);
        } else if (rawList.length === 5) {
          // Backend chỉ trả đúng 5 item mà không có total => giả định còn trang tiếp theo để hiển thị nút chuyển trang
          setUsers(rawList);
          setTotalPages(filters.currentPage + 1);
          setTotalItems(undefined);
        } else {
          // Ít hơn 5 => có thể là trang cuối
          setUsers(rawList);
          setTotalPages(Math.max(1, filters.currentPage));
          setTotalItems(rawList.length);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const performToggleStatus = async (user: User) => {
    const action = user.isActive ? t('action.disable') : t('action.enable');
    try {
      // Optimistic update
      const newStatus = !user.isActive;
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, isActive: newStatus } : u
        )
      );

      await adminService.toggleUserStatus(user.id);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(t('alerts.cannotToggleStatus', { action }));
      // Revert optimistic update
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, isActive: user.isActive } : u
        )
      );
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (user.role === 'admin') {
      toast.error(t('alerts.cannotChangeAdminStatus'));
      return;
    }
    const action = user.isActive ? t('action.disable') : t('action.enable');
    openConfirm(t('alerts.confirmToggleStatus', { action, name: user.name }) as string, [], async () => {
      await performToggleStatus(user);
    });
  };

  const performDeletePermanently = async (user: User) => {
    try {
      await adminService.deleteUserPermanently(user.id);
    } catch (error) {
      console.error('Error deleting user permanently:', error);
      toast.error(t('alerts.cannotDeleteUser'));
    }
  };

  const handleDeletePermanently = async (user: User) => {
    if (!hasPermission('manage_users.delete_permanently')) {
      toast.error(t('alerts.noPermission') || 'Bạn không có quyền thực hiện hành động này');
      return;
    }
    if (user.role === 'admin') {
      toast.error(t('alerts.cannotDeleteAdmin'));
      return;
    }
    const title = t('alerts.confirmDeletePermanent1', { name: user.name }) as string;
    const line = t('alerts.confirmDeletePermanent2', { email: user.email }) as string;
    openConfirm(title, [line], async () => {
      await performDeletePermanently(user);
    });
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      roleFilter: '',
      activeFilter: '',
      currentPage: 1
    });
  };

  // Load users when filters change
  useEffect(() => {
    loadUsers();
  }, [filters.currentPage, filters.searchTerm, filters.roleFilter, filters.activeFilter]);

  // Realtime updates
  useEffect(() => {
    const s = getAdminSocket();
    
    const onMajorChange = () => {
      loadUsers();
    };

    const onUserOnline = (payload: any) => {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === payload.userId ? { ...user, isOnline: true } : user
        )
      );
    };

    const onUserOffline = (payload: any) => {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === payload.userId ? { ...user, isOnline: false } : user
        )
      );
    };

    s.on('admin_user_online', onUserOnline);
    s.on('admin_user_offline', onUserOffline);
    s.on('user_registered', onMajorChange);
    s.on('user_status_changed', onMajorChange);
    s.on('user_deleted_permanently', onMajorChange);
    
    return () => {
      try {
        s.off('admin_user_online', onUserOnline);
        s.off('admin_user_offline', onUserOffline);
        s.off('user_registered', onMajorChange);
        s.off('user_status_changed', onMajorChange);
        s.off('user_deleted_permanently', onMajorChange);
      } catch {}
    };
  }, [filters.currentPage, filters.searchTerm, filters.roleFilter, filters.activeFilter]);

  return {
    users,
    loading,
    totalPages,
    totalItems,
    filters,
    confirmState,
    updateFilters,
    clearFilters,
    handleToggleStatus,
    handleDeletePermanently,
    openConfirm,
    closeConfirm,
    setConfirmState
  };
};
