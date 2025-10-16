import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import { getAdminSocket } from '@services/socket';
import type { 
  UserChatSettings, 
  ChatSettingsFilters 
} from '../interfaces';

export const useChatSettings = () => {
  const { t } = useTranslation('chatSettings');
  const [users, setUsers] = useState<UserChatSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Filters state
  const [filters, setFilters] = useState<ChatSettingsFilters>({
    searchTerm: '',
    currentPage: 1,
    e2eeFilter: '',
    readStatusFilter: ''
  });

  const updateFilters = (newFilters: Partial<ChatSettingsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const PAGE_SIZE = 10;

  const loadChatSettings = async () => {
    try {
      setLoading(true);
      
      const params: any = {
        page: filters.currentPage,
        limit: PAGE_SIZE,
        search: filters.searchTerm || undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      // Add filters
      if (filters.e2eeFilter === 'enabled') params.e2eeEnabled = true;
      if (filters.e2eeFilter === 'disabled') params.e2eeEnabled = false;
      if (filters.readStatusFilter === 'enabled') params.readStatusEnabled = true;
      if (filters.readStatusFilter === 'disabled') params.readStatusEnabled = false;

      const res: any = await adminService.getAllUsers(params);
      
      // Map to UserChatSettings
      const usersList = (res?.users || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isActive: user.isActive,
        e2eeEnabled: user.e2eeEnabled || false,
        readStatusEnabled: user.readStatusEnabled !== false, // default true
        allowMessagesFromNonFriends: user.allowMessagesFromNonFriends || false,
        hidePhone: user.hidePhone || false,
        hideBirthDate: user.hideBirthDate || false,
        e2eePinHash: user.e2eePinHash,
        phone: user.phone,
        birthDate: user.birthDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }));

      setUsers(usersList);
      setTotalItems(res?.pagination?.total || res?.totalUsers || 0);
      setTotalPages(res?.pagination?.totalPages || res?.totalPages || 1);
    } catch (err) {
      console.error('Error loading chat settings:', err);
      toast.error(t('errors.loadFailed') || 'Không thể tải chat settings');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      currentPage: 1,
      e2eeFilter: '',
      readStatusFilter: ''
    });
  };

  // Toggle E2EE
  const handleToggleE2EE = async (userId: number, currentValue: boolean) => {
    try {
      await adminService.editUserChatSettings(userId, { e2eeEnabled: !currentValue });
      toast.success(t('actions.updateSuccess') || 'Cập nhật thành công');
      await loadChatSettings();
    } catch (error: any) {
      console.error('Error toggling E2EE:', error);
      toast.error(error?.message || t('actions.updateFailed') || 'Không thể cập nhật');
    }
  };

  // Toggle Read Status
  const handleToggleReadStatus = async (userId: number, currentValue: boolean) => {
    try {
      await adminService.editUserChatSettings(userId, { readStatusEnabled: !currentValue });
      toast.success(t('actions.updateSuccess') || 'Cập nhật thành công');
      await loadChatSettings();
    } catch (error: any) {
      console.error('Error toggling read status:', error);
      toast.error(error?.message || t('actions.updateFailed') || 'Không thể cập nhật');
    }
  };

  // Toggle Allow Messages From Non-Friends
  const handleToggleNonFriends = async (userId: number, currentValue: boolean) => {
    try {
      await adminService.editUserChatSettings(userId, { allowMessagesFromNonFriends: !currentValue });
      toast.success(t('actions.updateSuccess') || 'Cập nhật thành công');
      await loadChatSettings();
    } catch (error: any) {
      console.error('Error toggling non-friends:', error);
      toast.error(error?.message || t('actions.updateFailed') || 'Không thể cập nhật');
    }
  };

  // Toggle Hide Phone
  const handleToggleHidePhone = async (userId: number, currentValue: boolean) => {
    try {
      await adminService.editUserChatSettings(userId, { hidePhone: !currentValue });
      toast.success(t('actions.updateSuccess') || 'Cập nhật thành công');
      await loadChatSettings();
    } catch (error: any) {
      console.error('Error toggling hide phone:', error);
      toast.error(error?.message || t('actions.updateFailed') || 'Không thể cập nhật');
    }
  };

  // Toggle Hide Birth Date
  const handleToggleHideBirthDate = async (userId: number, currentValue: boolean) => {
    try {
      await adminService.editUserChatSettings(userId, { hideBirthDate: !currentValue });
      toast.success(t('actions.updateSuccess') || 'Cập nhật thành công');
      await loadChatSettings();
    } catch (error: any) {
      console.error('Error toggling hide birth date:', error);
      toast.error(error?.message || t('actions.updateFailed') || 'Không thể cập nhật');
    }
  };
  // Load settings when filters change
  useEffect(() => {
    loadChatSettings();
  }, [filters.currentPage, filters.searchTerm, filters.e2eeFilter, filters.readStatusFilter]);

  // Real-time updates
  useEffect(() => {
    const socket = getAdminSocket();
    
    const onUpdate = () => {
      loadChatSettings();
    };

    // Listen when admin updates user
    socket.on('admin_user_updated', onUpdate);
    
    // Listen when user changes their own settings
    socket.on('e2ee_status', onUpdate);
    socket.on('e2ee_pin_updated', onUpdate);
    socket.on('read_status_updated', onUpdate);
    socket.on('privacy_updated', onUpdate);
    
    return () => {
      socket.off('admin_user_updated', onUpdate);
      socket.off('e2ee_status', onUpdate);
      socket.off('e2ee_pin_updated', onUpdate);
      socket.off('read_status_updated', onUpdate);
      socket.off('privacy_updated', onUpdate);
    };
  }, [filters.currentPage, filters.searchTerm, filters.e2eeFilter, filters.readStatusFilter]);

  return {
    users,
    loading,
    totalPages,
    totalItems,
    filters,
    updateFilters,
    clearFilters,
    handleToggleE2EE,
    handleToggleReadStatus,
    handleToggleNonFriends,
    handleToggleHidePhone,
    handleToggleHideBirthDate,
    loadChatSettings
  };
};
