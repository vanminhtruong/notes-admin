import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import adminService from '@services/adminService';
import type { Admin, AdminFilters } from '../interfaces/admin.types';

export interface UseAdminsListReturn {
  admins: Admin[];
  loading: boolean;
  currentAdmin: any;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  availablePermissions: string[];
  searchText: string;
  adminLevelFilter: string;
  setSearchText: (value: string) => void;
  setAdminLevelFilter: (value: string) => void;
  fetchAdmins: (page?: number, limit?: number) => Promise<void>;
  refreshList: () => Promise<void>;
}

export const useAdminsList = (): UseAdminsListReturn => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [adminLevelFilter, setAdminLevelFilter] = useState<string>('');
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);

  const fetchAdmins = async (page = pagination.current, limit = pagination.pageSize) => {
    try {
      setLoading(true);
      const filters: AdminFilters = {
        page,
        limit,
        search: searchText || undefined,
        adminLevel: adminLevelFilter || undefined,
      };

      const res = await adminService.getAllAdmins(filters);
      const data: any = res || {};
      
      setAdmins(data?.admins ?? []);
      setAvailablePermissions(data?.availablePermissions ?? []);
      setPagination({
        current: data?.pagination?.page ?? 1,
        pageSize: data?.pagination?.limit ?? 20,
        total: data?.pagination?.total ?? 0,
      });
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải danh sách admin');
    } finally {
      setLoading(false);
    }
  };

  const refreshList = async () => {
    await fetchAdmins(pagination.current, pagination.pageSize);
  };

  // Lấy thông tin admin hiện tại
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

  return {
    admins,
    loading,
    currentAdmin,
    pagination,
    availablePermissions,
    searchText,
    adminLevelFilter,
    setSearchText,
    setAdminLevelFilter,
    fetchAdmins,
    refreshList,
  };
};
