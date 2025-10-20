import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import adminService from '@services/adminService';
import type { UserActivityData, User } from '../../interfaces';

interface UseUserActivityHandlersProps {
  setActivityData: (data: UserActivityData | null) => void;
  setLoading: (loading: boolean) => void;
  setUsers: (users: User[]) => void;
  setError: (error: string | null) => void;
  setLoadingUsers: (loading: boolean) => void;
  searchTerm: string;
}

export const useUserActivityHandlers = ({
  setActivityData,
  setLoading,
  setUsers,
  setError,
  setLoadingUsers,
  searchTerm
}: UseUserActivityHandlersProps) => {
  const { t } = useTranslation('users');

  const loadUserActivity = useCallback(async (id: number, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await adminService.getUserActivity(id);
      setActivityData(response.data || response);
    } catch (error) {
      console.error('Error loading user activity:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [setLoading, setActivityData]);

  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const response = await adminService.getAllUsers({
        search: searchTerm || undefined,
        limit: 20
      });
      const data = response.data || response;
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error loading users:', error);
      let errorMessage = t('userActivity.errors.cannotLoadUsers');
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 500) {
        errorMessage = t('userActivity.errors.serverError');
      }
      
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  }, [searchTerm, setLoadingUsers, setError, setUsers, t]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  return {
    loadUserActivity,
    loadUsers,
    formatDate
  };
};
