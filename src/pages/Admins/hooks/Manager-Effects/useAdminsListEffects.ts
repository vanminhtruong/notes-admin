import { useEffect } from 'react';
import adminService from '@services/adminService';

interface UseAdminsListEffectsProps {
  setCurrentAdmin: (admin: any) => void;
  fetchAdmins: (page: number) => void;
  searchText: string;
  adminLevelFilter: string;
}

export const useAdminsListEffects = ({
  setCurrentAdmin,
  fetchAdmins,
  searchText,
  adminLevelFilter,
}: UseAdminsListEffectsProps) => {
  // Lấy thông tin admin hiện tại và fetch danh sách
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const res = await adminService.getMyPermissions();
        setCurrentAdmin((res as any)?.admin ?? null);
      } catch (error) {
        console.error('Failed to fetch current admin:', error);
      }
    };

    fetchCurrentAdmin();
    fetchAdmins(1);
  }, [searchText, adminLevelFilter]);
};
